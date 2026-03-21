'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ILocalAudioTrack,
  type ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import { logger } from '@/utils/logger';

export type AgoraConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

interface AgoraContextValue {
  client: IAgoraRTCClient | null;
  localVideoTrack: ILocalVideoTrack | null;
  localAudioTrack: ILocalAudioTrack | null;
  remoteUsers: IAgoraRTCRemoteUser[];
  connectionState: AgoraConnectionState;
  hostVideoRef: React.RefObject<HTMLDivElement | null>;
  localVideoRef: React.RefObject<HTMLDivElement | null>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

const AgoraContext = createContext<AgoraContextValue | null>(null);

export function useAgoraContext() {
  const ctx = useContext(AgoraContext);
  if (!ctx) throw new Error('useAgoraContext must be used within AgoraProvider');
  return ctx;
}

interface AgoraProviderProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  role: 'host' | 'viewer';
  onError?: (error: Error) => void;
  onDisconnected?: () => void;
  children: ReactNode;
}

export function AgoraProvider({
  appId,
  channelName,
  token,
  uid,
  role,
  onError,
  onDisconnected,
  children,
}: AgoraProviderProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [connectionState, setConnectionState] = useState<AgoraConnectionState>('disconnected');
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const hostVideoRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const joinedRef = useRef(false);

  // Create client and join channel
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    clientRef.current = client;

    // Set role
    client.setClientRole(role === 'host' ? 'host' : 'audience');

    // Connection state handler
    client.on('connection-state-change', (curState) => {
      const stateMap: Record<string, AgoraConnectionState> = {
        DISCONNECTED: 'disconnected',
        CONNECTING: 'connecting',
        CONNECTED: 'connected',
        RECONNECTING: 'reconnecting',
        DISCONNECTING: 'disconnected',
      };
      const mapped = stateMap[curState] || 'disconnected';
      setConnectionState(mapped);
      if (curState === 'DISCONNECTED' && joinedRef.current) {
        onDisconnected?.();
      }
    });

    // Remote user published
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      logger.info(`Subscribed to ${user.uid} ${mediaType}`);

      if (mediaType === 'video' && hostVideoRef.current) {
        user.videoTrack?.play(hostVideoRef.current);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }

      setRemoteUsers(Array.from(client.remoteUsers));
    });

    client.on('user-unpublished', (user, mediaType) => {
      logger.info(`User ${user.uid} unpublished ${mediaType}`);
      setRemoteUsers(Array.from(client.remoteUsers));
    });

    client.on('user-joined', () => {
      setRemoteUsers(Array.from(client.remoteUsers));
    });

    client.on('user-left', () => {
      setRemoteUsers(Array.from(client.remoteUsers));
    });

    // Join
    const join = async () => {
      try {
        setConnectionState('connecting');
        await client.join(appId, channelName, token, uid);
        joinedRef.current = true;
        setConnectionState('connected');
        logger.info(`Joined Agora channel ${channelName} as ${role} (uid=${uid})`);

        // Publish local tracks if host
        if (role === 'host') {
          const [audioTrack, videoTrack] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack(),
            AgoraRTC.createCameraVideoTrack(),
          ]);

          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);

          await client.publish([audioTrack, videoTrack]);

          // Play local preview
          if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
          }
          logger.info('Published local audio + video tracks');
        }
      } catch (err) {
        logger.error('Failed to join Agora channel:', err);
        setConnectionState('failed');
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    join();

    return () => {
      // Cleanup
      localVideoTrack?.close();
      localAudioTrack?.close();
      if (joinedRef.current) {
        client.leave().catch(() => {});
        joinedRef.current = false;
      }
      client.removeAllListeners();
      clientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, channelName, token, uid, role]);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  }, [localAudioTrack, audioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  }, [localVideoTrack, videoEnabled]);

  return (
    <AgoraContext.Provider
      value={{
        client: clientRef.current,
        localVideoTrack,
        localAudioTrack,
        remoteUsers,
        connectionState,
        hostVideoRef,
        localVideoRef,
        toggleAudio,
        toggleVideo,
        audioEnabled,
        videoEnabled,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
}
