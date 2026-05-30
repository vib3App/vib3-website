/** FaceDetector API (Shape Detection) type declarations. Chromium-only. */
interface FaceDetectorOptions {
  maxDetectedFaces?: number;
  fastMode?: boolean;
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
  landmarks?: Array<{ type: string; locations: Array<{ x: number; y: number }> }>;
}

declare class FaceDetector {
  constructor(options?: FaceDetectorOptions);
  detect(source: ImageBitmapSource): Promise<DetectedFace[]>;
}
