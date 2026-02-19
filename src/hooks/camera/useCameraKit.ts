'use client';

import { useState, useRef, useCallback } from 'react';
import { SNAP_CAMERA_KIT_TOKEN, SNAP_WEB_LENS_GROUP_ID } from '@/config/cameraKit';

export interface CameraKitLens {
  id: string;
  name: string;
  iconUrl: string | undefined;
}

interface CameraKitState {
  isLoading: boolean;
  isLoaded: boolean;
  lenses: CameraKitLens[];
  activeLensId: string | null;
  error: string | null;
}

// We store SDK references outside of React state to avoid serialization issues
interface CameraKitRefs {
  cameraKit: unknown;
  session: unknown;
  source: unknown;
}

export function useCameraKit() {
  const [state, setState] = useState<CameraKitState>({
    isLoading: false,
    isLoaded: false,
    lenses: [],
    activeLensId: null,
    error: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refsStore = useRef<CameraKitRefs>({ cameraKit: null, session: null, source: null });

  const initCameraKit = useCallback(async (stream: MediaStream, facing: 'user' | 'environment') => {
    if (!SNAP_CAMERA_KIT_TOKEN) {
      setState(s => ({ ...s, error: 'Camera Kit API token not configured' }));
      return;
    }
    if (refsStore.current.session) return; // already initialized

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      const CK = await import('@snap/camera-kit');

      const cameraKit = await CK.bootstrapCameraKit({ apiToken: SNAP_CAMERA_KIT_TOKEN });
      refsStore.current.cameraKit = cameraKit;

      const session = await cameraKit.createSession({
        liveRenderTarget: canvasRef.current ?? undefined,
      });
      refsStore.current.session = session;

      // Feed the camera stream
      const isFront = facing === 'user';
      const source = CK.createMediaStreamSource(stream, {
        transform: isFront ? CK.Transform2D.MirrorX : CK.Transform2D.Identity,
        cameraType: facing,
      });
      await session.setSource(source);
      refsStore.current.source = source;

      await session.play();

      // Load lenses
      const { lenses } = await cameraKit.lensRepository.loadLensGroups([SNAP_WEB_LENS_GROUP_ID]);
      const mapped: CameraKitLens[] = lenses.map((l: { id: string; name: string; iconUrl: string | undefined }) => ({
        id: l.id,
        name: l.name,
        iconUrl: l.iconUrl,
      }));

      setState({
        isLoading: false,
        isLoaded: true,
        lenses: mapped,
        activeLensId: null,
        error: null,
      });
    } catch (err) {
      console.error('[CameraKit] init failed:', err);
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Failed to load AR lenses',
      }));
    }
  }, []);

  const updateSource = useCallback(async (stream: MediaStream, facing: 'user' | 'environment') => {
    try {
      const session = refsStore.current.session as { setSource: (s: unknown) => Promise<unknown> } | null;
      if (!session) return;

      const CK = await import('@snap/camera-kit');
      const isFront = facing === 'user';
      const source = CK.createMediaStreamSource(stream, {
        transform: isFront ? CK.Transform2D.MirrorX : CK.Transform2D.Identity,
        cameraType: facing,
      });
      await session.setSource(source);
      refsStore.current.source = source;
    } catch (err) {
      console.error('[CameraKit] updateSource failed:', err);
    }
  }, []);

  const applyLens = useCallback(async (lensId: string) => {
    try {
      const cameraKit = refsStore.current.cameraKit as {
        lensRepository: { loadLens: (id: string, groupId: string) => Promise<unknown> };
      } | null;
      const session = refsStore.current.session as {
        applyLens: (lens: unknown) => Promise<boolean>;
      } | null;
      if (!cameraKit || !session) return;

      const lens = await cameraKit.lensRepository.loadLens(lensId, SNAP_WEB_LENS_GROUP_ID);
      await session.applyLens(lens);
      setState(s => ({ ...s, activeLensId: lensId }));
    } catch (err) {
      console.error('[CameraKit] applyLens failed:', err);
      setState(s => ({ ...s, activeLensId: null }));
    }
  }, []);

  const removeLens = useCallback(async () => {
    try {
      const session = refsStore.current.session as {
        removeLens: () => Promise<boolean>;
      } | null;
      if (!session) return;

      await session.removeLens();
      setState(s => ({ ...s, activeLensId: null }));
    } catch (err) {
      console.error('[CameraKit] removeLens failed:', err);
    }
  }, []);

  const cleanup = useCallback(async () => {
    try {
      const session = refsStore.current.session as {
        pause: () => Promise<void>;
        removeLens: () => Promise<boolean>;
        destroy: () => Promise<void>;
      } | null;
      if (session) {
        await session.pause();
        await session.removeLens();
        await session.destroy();
      }
      const cameraKit = refsStore.current.cameraKit as {
        destroy: () => Promise<void>;
      } | null;
      if (cameraKit) {
        await cameraKit.destroy();
      }
    } catch {
      // ignore cleanup errors
    }
    refsStore.current = { cameraKit: null, session: null, source: null };
    setState({
      isLoading: false,
      isLoaded: false,
      lenses: [],
      activeLensId: null,
      error: null,
    });
  }, []);

  return {
    canvasRef,
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    lenses: state.lenses,
    activeLensId: state.activeLensId,
    isCameraKitActive: state.activeLensId !== null,
    error: state.error,
    initCameraKit,
    updateSource,
    applyLens,
    removeLens,
    cleanup,
  };
}
