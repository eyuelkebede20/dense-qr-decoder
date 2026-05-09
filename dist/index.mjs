// src/index.ts
import { BarcodeDetectorPolyfill } from "@undecaf/barcode-detector-polyfill";
async function decodeDenseQR(source) {
  try {
    const detector = new BarcodeDetectorPolyfill({
      formats: ["qr_code"]
    });
    const barcodes = await detector.detect(source);
    if (barcodes.length > 0) {
      return barcodes[0].rawValue;
    }
    return null;
  } catch (error) {
    console.error("QR Decoding failed:", error);
    throw error;
  }
}
export {
  decodeDenseQR
};
