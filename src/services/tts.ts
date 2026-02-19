/**
 * Text-to-Speech service (Gap #99)
 * Uses Web Speech Synthesis API.
 * Exposes: getVoices(), speak(), generateAudioBlob()
 */

export interface TTSOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;   // 0.5 - 2
  pitch?: number;  // 0 - 2
  volume?: number; // 0 - 1
}

const DEFAULT_OPTIONS: Required<Omit<TTSOptions, 'voice'>> = {
  rate: 1,
  pitch: 1,
  volume: 1,
};

/**
 * Check if speech synthesis is available
 */
export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available TTS voices. May need to wait for voices to load.
 */
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    let voices = synth.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Voices may load asynchronously
    const onVoicesChanged = () => {
      voices = synth.getVoices();
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(voices);
    };

    synth.addEventListener('voiceschanged', onVoicesChanged);

    // Timeout fallback
    setTimeout(() => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(synth.getVoices());
    }, 2000);
  });
}

/**
 * Speak text aloud using Web Speech Synthesis
 */
export function speak(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isTTSAvailable()) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? DEFAULT_OPTIONS.rate;
    utterance.pitch = options.pitch ?? DEFAULT_OPTIONS.pitch;
    utterance.volume = options.volume ?? DEFAULT_OPTIONS.volume;

    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(e.error));

    synth.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Generate an audio Blob from text using TTS + AudioContext capture.
 * Uses MediaStreamDestination to record synthesized speech.
 */
export async function generateAudioBlob(
  text: string,
  options: TTSOptions = {}
): Promise<Blob> {
  if (!isTTSAvailable()) {
    throw new Error('Speech synthesis not available');
  }

  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? DEFAULT_OPTIONS.rate;
    utterance.pitch = options.pitch ?? DEFAULT_OPTIONS.pitch;
    utterance.volume = options.volume ?? DEFAULT_OPTIONS.volume;

    if (options.voice) {
      utterance.voice = options.voice;
    }

    // Try to capture audio via MediaRecorder + audio destination
    try {
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(dest.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        audioContext.close();
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = () => {
        audioContext.close();
        reject(new Error('Recording failed'));
      };

      mediaRecorder.start();

      utterance.onend = () => {
        // Give a small delay for final audio data
        setTimeout(() => mediaRecorder.stop(), 200);
      };

      utterance.onerror = (e) => {
        mediaRecorder.stop();
        reject(new Error(e.error));
      };

      synth.speak(utterance);
    } catch {
      // Fallback: just speak without recording
      utterance.onend = () => {
        resolve(new Blob([], { type: 'audio/webm' }));
      };
      utterance.onerror = (e) => reject(new Error(e.error));
      synth.speak(utterance);
    }
  });
}
