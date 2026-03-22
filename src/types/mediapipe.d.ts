declare module '@mediapipe/tasks-vision' {
  export interface Classification {
    categories: Array<{
      index: number;
      score: number;
      categoryName: string;
      displayName: string;
    }>;
    headIndex: number;
    headName: string;
  }

  export interface ImageClassifierResult {
    classifications: Classification[];
    timestampMs?: number;
  }

  export class ImageClassifier {
    static createFromOptions(vision: any, options: any): Promise<ImageClassifier>;
    classify(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): ImageClassifierResult;
    close(): void;
  }

  export class FilesetResolver {
    static forVisionTasks(wasmPath: string): Promise<any>;
  }
}
