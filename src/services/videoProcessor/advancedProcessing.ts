/**
 * Advanced video processing methods that extend the base VideoProcessorService.
 * Gaps 28, 31, 34, 35: Split, Transitions, Freeze Frames, Per-clip Speeds.
 */
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type { ProcessingProgress, ClipEdit, FreezeFrame } from './types';
import { buildTransitionArgs, buildClipSpeedArgs } from './filters';
import { logger } from '@/utils/logger';

type GetInputFn = (input: File | Blob | string) => Promise<Uint8Array>;

/** Gap 28: Split video at a given time, returning two blobs */
export async function splitVideoImpl(
  ffmpeg: FFmpeg,
  getInput: GetInputFn,
  inputFile: File | Blob | string,
  splitTime: number,
  onProgress?: (p: ProcessingProgress) => void,
): Promise<[Blob, Blob] | null> {
  try {
    onProgress?.({ stage: 'processing', percent: 0, message: 'Splitting video...' });
    const inputData = await getInput(inputFile);
    await ffmpeg.writeFile('split_input.mp4', inputData);

    onProgress?.({ stage: 'processing', percent: 20, message: 'Encoding clip 1...' });
    await ffmpeg.exec([
      '-i', 'split_input.mp4', '-t', splitTime.toString(),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'split_a.mp4',
    ]);

    onProgress?.({ stage: 'processing', percent: 60, message: 'Encoding clip 2...' });
    await ffmpeg.exec([
      '-i', 'split_input.mp4', '-ss', splitTime.toString(),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'split_b.mp4',
    ]);

    const dataA = await ffmpeg.readFile('split_a.mp4');
    const dataB = await ffmpeg.readFile('split_b.mp4');
    const blobA = new Blob([dataA as BlobPart], { type: 'video/mp4' });
    const blobB = new Blob([dataB as BlobPart], { type: 'video/mp4' });

    await ffmpeg.deleteFile('split_input.mp4');
    await ffmpeg.deleteFile('split_a.mp4');
    await ffmpeg.deleteFile('split_b.mp4');

    onProgress?.({ stage: 'complete', percent: 100, message: 'Split complete!' });
    return [blobA, blobB];
  } catch (error) {
    logger.error('Split failed:', error);
    onProgress?.({ stage: 'error', percent: 0, message: 'Split failed' });
    return null;
  }
}

/** Gap 31: Apply transition between two video blobs */
export async function applyTransitionImpl(
  ffmpeg: FFmpeg,
  clipA: Blob,
  clipB: Blob,
  transitionType: string,
  transitionDuration: number,
  clip1Duration: number,
  onProgress?: (p: ProcessingProgress) => void,
): Promise<Blob | null> {
  try {
    onProgress?.({ stage: 'processing', percent: 0, message: 'Applying transition...' });
    await ffmpeg.writeFile('trans_a.mp4', new Uint8Array(await clipA.arrayBuffer()));
    await ffmpeg.writeFile('trans_b.mp4', new Uint8Array(await clipB.arrayBuffer()));

    const transArgs = buildTransitionArgs(transitionType, transitionDuration, clip1Duration);
    onProgress?.({ stage: 'encoding', percent: 30, message: 'Rendering transition...' });
    await ffmpeg.exec([
      '-i', 'trans_a.mp4', '-i', 'trans_b.mp4', ...transArgs,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'trans_out.mp4',
    ]);

    const data = await ffmpeg.readFile('trans_out.mp4');
    const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

    await ffmpeg.deleteFile('trans_a.mp4');
    await ffmpeg.deleteFile('trans_b.mp4');
    await ffmpeg.deleteFile('trans_out.mp4');

    onProgress?.({ stage: 'complete', percent: 100, message: 'Transition applied!' });
    return blob;
  } catch (error) {
    logger.error('Transition failed:', error);
    onProgress?.({ stage: 'error', percent: 0, message: 'Transition failed' });
    return null;
  }
}

/** Gap 34: Insert freeze frames into video */
export async function insertFreezeFramesImpl(
  ffmpeg: FFmpeg,
  getInput: GetInputFn,
  inputFile: File | Blob | string,
  freezeFrames: FreezeFrame[],
  onProgress?: (p: ProcessingProgress) => void,
): Promise<Blob | null> {
  if (freezeFrames.length === 0) return null;
  try {
    onProgress?.({ stage: 'processing', percent: 0, message: 'Preparing freeze frames...' });
    await ffmpeg.writeFile('freeze_input.mp4', await getInput(inputFile));
    const sorted = [...freezeFrames].sort((a, b) => a.time - b.time);
    const segments: string[] = [];
    let prevEnd = 0;
    let segIdx = 0;

    for (let i = 0; i < sorted.length; i++) {
      const ff = sorted[i];
      if (ff.time > prevEnd) {
        const sn = `seg_${segIdx}.mp4`;
        await ffmpeg.exec([
          '-i', 'freeze_input.mp4', '-ss', prevEnd.toString(),
          '-t', (ff.time - prevEnd).toString(),
          '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k', sn,
        ]);
        segments.push(sn);
        segIdx++;
      }
      const fn = `frame_${i}.jpg`;
      await ffmpeg.exec(['-i', 'freeze_input.mp4', '-ss', ff.time.toString(), '-vframes', '1', '-q:v', '2', fn]);
      const fs = `freeze_seg_${i}.mp4`;
      await ffmpeg.exec([
        '-loop', '1', '-i', fn, '-t', ff.duration.toString(),
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '30',
        '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
        '-t', ff.duration.toString(), '-c:a', 'aac', '-b:a', '128k', '-shortest', fs,
      ]);
      segments.push(fs);
      segIdx++;
      prevEnd = ff.time;
      await ffmpeg.deleteFile(fn);
      onProgress?.({ stage: 'processing', percent: Math.round(((i + 1) / sorted.length) * 60), message: `Freeze ${i + 1}/${sorted.length}...` });
    }

    const sn = `seg_${segIdx}.mp4`;
    await ffmpeg.exec([
      '-i', 'freeze_input.mp4', '-ss', sorted[sorted.length - 1].time.toString(),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', sn,
    ]);
    segments.push(sn);

    onProgress?.({ stage: 'encoding', percent: 70, message: 'Joining segments...' });
    await ffmpeg.writeFile('freeze_concat.txt', segments.map(f => `file '${f}'`).join('\n'));
    await ffmpeg.exec([
      '-f', 'concat', '-safe', '0', '-i', 'freeze_concat.txt',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'freeze_output.mp4',
    ]);

    const data = await ffmpeg.readFile('freeze_output.mp4');
    const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
    await ffmpeg.deleteFile('freeze_input.mp4');
    await ffmpeg.deleteFile('freeze_concat.txt');
    await ffmpeg.deleteFile('freeze_output.mp4');
    for (const seg of segments) { try { await ffmpeg.deleteFile(seg); } catch { /* ok */ } }

    onProgress?.({ stage: 'complete', percent: 100, message: 'Freeze frames inserted!' });
    return blob;
  } catch (error) {
    logger.error('Freeze frame insertion failed:', error);
    onProgress?.({ stage: 'error', percent: 0, message: 'Freeze frame failed' });
    return null;
  }
}

/** Gap 35: Process clips with per-clip speed changes */
export async function processClipSpeedsImpl(
  ffmpeg: FFmpeg,
  getInput: GetInputFn,
  inputFile: File | Blob | string,
  clipEdits: ClipEdit[],
  onProgress?: (p: ProcessingProgress) => void,
): Promise<Blob | null> {
  if (clipEdits.length === 0) return null;
  try {
    onProgress?.({ stage: 'processing', percent: 0, message: 'Processing clip speeds...' });
    await ffmpeg.writeFile('speed_input.mp4', await getInput(inputFile));
    const segments: string[] = [];

    for (let i = 0; i < clipEdits.length; i++) {
      const clip = clipEdits[i];
      const cn = `clip_${i}.mp4`;
      const co = `clip_out_${i}.mp4`;
      await ffmpeg.exec([
        '-i', 'speed_input.mp4', '-ss', clip.startTime.toString(),
        '-t', (clip.endTime - clip.startTime).toString(),
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', cn,
      ]);
      if (Math.abs(clip.speed - 1) > 0.01) {
        const sArgs = buildClipSpeedArgs(clip.speed);
        await ffmpeg.exec(['-i', cn, ...sArgs, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', co]);
        await ffmpeg.deleteFile(cn);
        segments.push(co);
      } else {
        segments.push(cn);
      }
      onProgress?.({ stage: 'processing', percent: Math.round(((i + 1) / clipEdits.length) * 70), message: `Clip ${i + 1}/${clipEdits.length}...` });
    }

    onProgress?.({ stage: 'encoding', percent: 75, message: 'Joining clips...' });
    await ffmpeg.writeFile('speed_concat.txt', segments.map(f => `file '${f}'`).join('\n'));
    await ffmpeg.exec([
      '-f', 'concat', '-safe', '0', '-i', 'speed_concat.txt',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'speed_output.mp4',
    ]);

    const data = await ffmpeg.readFile('speed_output.mp4');
    const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
    await ffmpeg.deleteFile('speed_input.mp4');
    await ffmpeg.deleteFile('speed_concat.txt');
    await ffmpeg.deleteFile('speed_output.mp4');
    for (const seg of segments) { try { await ffmpeg.deleteFile(seg); } catch { /* ok */ } }

    onProgress?.({ stage: 'complete', percent: 100, message: 'Speed changes applied!' });
    return blob;
  } catch (error) {
    logger.error('Clip speed processing failed:', error);
    onProgress?.({ stage: 'error', percent: 0, message: 'Speed processing failed' });
    return null;
  }
}
