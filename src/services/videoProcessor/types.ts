export interface ProcessingProgress {
  stage: 'loading' | 'processing' | 'encoding' | 'complete' | 'error';
  percent: number;
  message: string;
}

export interface VideoEdits {
  trimStart?: number;
  trimEnd?: number;
  filter?: string;
  volume?: number;
  texts?: TextOverlay[];
}

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}
