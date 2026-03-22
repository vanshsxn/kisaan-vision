import * as tf from "@tensorflow/tfjs";
import { loadTFLiteModel, TFLiteModel } from "@tensorflow/tfjs-tflite";

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

let modelInstance: TFLiteModel | null = null;

export async function loadModel(): Promise<TFLiteModel> {
  if (modelInstance) return modelInstance;
  await tf.ready();
  modelInstance = await loadTFLiteModel("/models/kisaan_vision_tiny.tflite");
  return modelInstance;
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
  const model = await loadModel();

  // Preprocess: resize to 224x224, normalize to [0,1]
  const tensor = tf.tidy(() => {
    let img = tf.browser.fromPixels(imageElement);
    img = tf.image.resizeBilinear(img, [224, 224]);
    // Normalize to [0, 1]
    const normalized = img.toFloat().div(255.0);
    // Add batch dimension
    return normalized.expandDims(0);
  });

  const output = model.predict(tensor) as tf.Tensor;
  const probabilities = await output.data();
  tensor.dispose();
  output.dispose();

  // Find max
  let maxIdx = 0;
  let maxVal = probabilities[0];
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > maxVal) {
      maxVal = probabilities[i];
      maxIdx = i;
    }
  }

  return {
    label: PLANT_LABELS[maxIdx] ?? `Unknown (${maxIdx})`,
    confidence: maxVal,
    index: maxIdx,
  };
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
