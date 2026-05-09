import { BarcodeDetectorPolyfill } from "@undecaf/barcode-detector-polyfill";

export interface ScanResult {
  data: string;
  format: string;
}

/**
 * Decodes high-density QR codes (Version 40) from an ImageBitmap or Canvas
 */
export async function decodeDenseQR(source: ImageBitmap | HTMLCanvasElement | HTMLImageElement): Promise<string | null> {
  try {
    const detector = new BarcodeDetectorPolyfill({
      formats: ["qr_code"],
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
