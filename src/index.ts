import { BarcodeDetectorPolyfill } from "@undecaf/barcode-detector-polyfill";

export interface DecoderOptions {
  threshold?: number;
}

export async function decodeDenseQR(
  source: any, // Using 'any' here avoids build-time type conflicts in non-browser envs
  options: DecoderOptions = {},
): Promise<string | null> {
  const threshold = options.threshold ?? 128;
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

async function preprocessImage(source: any, threshold: number): Promise<any> {
  // Browser-side canvas preprocessing
  if ((typeof document !== "undefined" && source instanceof HTMLElement) || source instanceof ImageBitmap) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    canvas.width = source.width || (source as any).videoWidth;
    canvas.height = source.height || (source as any).videoHeight;

    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg >= threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
  return source;
}
