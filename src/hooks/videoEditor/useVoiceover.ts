'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoiceover() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [voiceoverBlob, setVoiceoverBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      // Set up amplitude analysis
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAmplitude = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAmplitude(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateAmplitude);
      };
      updateAmplitude();

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        audioCtx.close();
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceoverBlob(blob);
        setVoiceoverUrl(url);
        setAmplitude(0);
      };

      recorder.start(100);
      recorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch {
      // Microphone not available
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state !== 'inactive') {
      recorderRef.current?.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  }, []);

  const discard = useCallback(() => {
    if (voiceoverUrl) URL.revokeObjectURL(voiceoverUrl);
    setVoiceoverUrl(null);
    setVoiceoverBlob(null);
    setDuration(0);
  }, [voiceoverUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current?.state !== 'inactive') {
        try { recorderRef.current?.stop(); } catch { /* ignore */ }
      }
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    isRecording,
    duration,
    amplitude,
    voiceoverUrl,
    voiceoverBlob,
    hasVoiceover: !!voiceoverUrl,
    startRecording,
    stopRecording,
    discard,
  };
}
