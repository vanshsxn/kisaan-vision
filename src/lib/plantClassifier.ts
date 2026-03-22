import { ImageClassifier, FilesetResolver } from "@mediapipe/tasks-vision";

export const PLANT_LABELS: Record<number, string> = {
  0: "Apple Scab",
  1: "Apple Black Rot",
  2: "Apple Cedar Rust",
  3: "Apple healthy",
  4: "Blueberry healthy",
  5: "Cherry Powdery Mildew",
  6: "Cherry healthy",
  7: "Corn Gray Leaf Spot",
  8: "Corn Common Rust",
  9: "Corn Northern Leaf Blight",
  10: "Corn healthy",
  11: "Grape Black Rot",
  12: "Grape Black Measles",
  13: "Grape Leaf Blight",
  14: "Grape healthy",
  15: "Orange Citrus Greening",
  16: "Peach Bacterial Spot",
  17: "Peach healthy",
  18: "Pepper Bell Bacterial Spot",
  19: "Pepper Bell healthy",
  20: "Potato Early Blight",
  21: "Potato Late Blight",
  22: "Potato healthy",
  23: "Raspberry healthy",
  24: "Soybean healthy",
  25: "Squash Powdery Mildew",
  26: "Strawberry Leaf Scorch",
  27: "Strawberry healthy",
  28: "Tomato Bacterial Spot",
  29: "Tomato Early Blight",
  30: "Tomato Late Blight",
  31: "Tomato Leaf Mold",
  32: "Tomato Septoria Leaf Spot",
  33: "Tomato Spider Mites",
  34: "Tomato Target Spot",
  35: "Tomato Yellow Leaf Curl Virus",
  36: "Tomato Mosaic Virus",
  37: "Tomato healthy",
};

let classifierInstance: ImageClassifier | null = null;

async function getClassifier(): Promise<ImageClassifier> {
  if (classifierInstance) return classifierInstance;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  classifierInstance = await ImageClassifier.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/kisaan_vision_tiny.tflite",
    },
    maxResults: 5,
    runningMode: "IMAGE",
  });

  return classifierInstance;
}

export function isHealthy(label: string): boolean {
  return label.toLowerCase().includes("healthy");
}

export interface ClassificationResult {
  label: string;
  confidence: number;
  index: number;
}

export async function classifyImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<ClassificationResult> {
  const classifier = await getClassifier();
  const result = classifier.classify(imageElement);

  if (result.classifications.length > 0 && result.classifications[0].categories.length > 0) {
    const top = result.classifications[0].categories[0];
    const idx = top.index;
    return {
      label: PLANT_LABELS[idx] ?? top.categoryName ?? `Unknown (${idx})`,
      confidence: top.score,
      index: idx,
    };
  }

  return { label: "Unknown", confidence: 0, index: -1 };
}

export function imageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
