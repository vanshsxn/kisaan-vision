import jsPDF from "jspdf";
import type { ClassificationResult } from "@/lib/plantClassifier";
import { isHealthy } from "@/lib/plantClassifier";

const REMEDIES: Record<string, string[]> = {
  "Apple Scab": ["Apply fungicide (Captan)", "Remove fallen leaves", "Prune for air circulation"],
  "Apple Black Rot": ["Remove mummified fruits", "Apply Captan or Myclobutanil", "Prune dead branches"],
  "Apple Cedar Rust": ["Apply fungicide in spring", "Remove nearby juniper trees", "Use resistant varieties"],
  "Cherry Powdery Mildew": ["Apply sulfur-based fungicide", "Improve air circulation", "Avoid overhead irrigation"],
  "Corn Gray Leaf Spot": ["Rotate crops", "Apply foliar fungicide", "Use resistant hybrids"],
  "Corn Common Rust": ["Apply fungicide early", "Plant resistant varieties", "Monitor humidity levels"],
  "Corn Northern Leaf Blight": ["Use resistant hybrids", "Rotate with non-host crops", "Apply strobilurin fungicide"],
  "Grape Black Rot": ["Remove infected clusters", "Apply Mancozeb fungicide", "Prune for ventilation"],
  "Grape Black Measles": ["Remove affected vines", "Apply lime sulfur", "Maintain vine vigor"],
  "Grape Leaf Blight": ["Apply copper fungicide", "Remove infected debris", "Ensure good drainage"],
  "Orange Citrus Greening": ["Remove infected trees", "Control psyllid vectors", "Plant disease-free stock"],
  "Peach Bacterial Spot": ["Apply copper sprays", "Use resistant varieties", "Avoid overhead irrigation"],
  "Pepper Bell Bacterial Spot": ["Apply copper-based bactericide", "Use disease-free seeds", "Rotate crops"],
  "Potato Early Blight": ["Apply Chlorothalonil fungicide", "Remove infected foliage", "Ensure adequate nutrition"],
  "Potato Late Blight": ["Apply Metalaxyl fungicide", "Destroy infected tubers", "Plant certified seed"],
  "Squash Powdery Mildew": ["Apply neem oil", "Improve air circulation", "Use resistant varieties"],
  "Strawberry Leaf Scorch": ["Remove infected leaves", "Apply fungicide", "Avoid overhead watering"],
  "Tomato Bacterial Spot": ["Apply copper sprays", "Use disease-free transplants", "Avoid working in wet fields"],
  "Tomato Early Blight": ["Apply Chlorothalonil", "Mulch around plants", "Rotate crops annually"],
  "Tomato Late Blight": ["Apply Mancozeb fungicide", "Remove infected plants", "Avoid overhead irrigation"],
  "Tomato Leaf Mold": ["Improve greenhouse ventilation", "Apply fungicide", "Reduce humidity"],
  "Tomato Septoria Leaf Spot": ["Remove lower infected leaves", "Apply fungicide", "Mulch to prevent splash"],
  "Tomato Spider Mites": ["Apply miticide or neem oil", "Increase humidity", "Introduce predatory mites"],
  "Tomato Target Spot": ["Apply Chlorothalonil", "Remove debris", "Space plants for airflow"],
  "Tomato Yellow Leaf Curl Virus": ["Control whitefly vectors", "Use resistant varieties", "Remove infected plants"],
  "Tomato Mosaic Virus": ["Remove infected plants", "Disinfect tools", "Use resistant cultivars"],
};

export const generateScanReport = (
  result: ClassificationResult,
  imageDataUrl: string | null
) => {
  const doc = new jsPDF();
  const healthy = isHealthy(result.label);
  const confidence = Math.round(result.confidence * 100);
  const date = new Date().toLocaleString();

  // Header bar
  doc.setFillColor(10, 26, 16);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFontSize(22);
  doc.setTextColor(45, 212, 107);
  doc.text("KISAAN VISION", 15, 18);

  doc.setFontSize(10);
  doc.setTextColor(180, 200, 180);
  doc.text("AI Crop Disease Report", 15, 26);
  doc.text(date, 15, 33);

  // Status badge
  const statusText = healthy ? "HEALTHY" : "DISEASE DETECTED";
  doc.setFillColor(healthy ? 20 : 180, healthy ? 80 : 30, healthy ? 40 : 30);
  doc.roundedRect(130, 10, 65, 20, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, 162.5, 22, { align: "center" });

  let y = 55;

  // Image preview
  if (imageDataUrl) {
    try {
      doc.addImage(imageDataUrl, "JPEG", 15, y, 60, 60);
    } catch {
      // skip if image can't be added
    }
  }

  // Diagnosis info
  const infoX = imageDataUrl ? 85 : 15;
  doc.setFontSize(10);
  doc.setTextColor(120, 140, 120);
  doc.text("DIAGNOSIS", infoX, y + 5);

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(result.label, infoX, y + 18);

  doc.setFontSize(10);
  doc.setTextColor(120, 140, 120);
  doc.text("CONFIDENCE SCORE", infoX, y + 32);

  // Confidence bar
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(infoX, y + 35, 80, 6, 2, 2, "F");
  doc.setFillColor(healthy ? 45 : 220, healthy ? 212 : 60, healthy ? 107 : 60);
  doc.roundedRect(infoX, y + 35, (confidence / 100) * 80, 6, 2, 2, "F");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`${confidence}%`, infoX + 84, y + 40);

  y += 75;

  // Remedies section (only for diseased)
  if (!healthy) {
    const remedies = REMEDIES[result.label] || ["Consult a local agricultural expert for specific treatment."];
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(180, 50, 50);
    doc.text("RECOMMENDED REMEDIES", 15, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    remedies.forEach((remedy, i) => {
      doc.text(`${i + 1}. ${remedy}`, 20, y);
      y += 8;
    });
  }

  // Footer
  doc.setDrawColor(220, 220, 220);
  doc.line(15, 275, 195, 275);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by Kisaan Vision AI • kisaanvision.lovable.app", 105, 283, { align: "center" });

  doc.save(`KisaanVision_Report_${result.label.replace(/\s+/g, "_")}.pdf`);
};
