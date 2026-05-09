import { BarcodeDetectorPolyfill } from "@undecaf/barcode-detector-polyfill";

export interface DecoderOptions {
  threshold?: number; // 0-255, default 128
  tryHarder?: boolean;
}

/**
 * Automatically pre-processes and decodes high-density QR codes.
 */
export async function decodeDenseQR(source: ImageBitmap | HTMLCanvasElement | HTMLImageElement | ImageData, options: DecoderOptions = {}): Promise<string | null> {
  const threshold = options.threshold ?? 128;

  // 1. Internal Pre-processing (Grayscale + Threshold)
  // This removes the need for the user to use 'sharp' in the browser
  const processedSource = await preprocessImage(source, threshold);

  try {
    const detector = new BarcodeDetectorPolyfill({ formats: ["qr_code"] });
    const barcodes = await detector.detect(processedSource);

    return barcodes.length > 0 ? barcodes[0].rawValue : null;
  } catch (error) {
    console.error("QR Decoding failed:", error);
    throw error;
  }
}

async function preprocessImage(source: any, threshold: number): Promise<ImageData | HTMLCanvasElement> {
  // If we are in the browser, use Canvas for zero-dependency preprocessing
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    canvas.width = source.width || (source as any).videoWidth;
    canvas.height = source.height || (source as any).videoHeight;

    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply Thresholding Logic
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg >= threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  // If in Node and user passed ImageData/Buffer, return as is
  return source;
}
