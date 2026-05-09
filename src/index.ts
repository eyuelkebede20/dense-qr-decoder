import { scanImageData } from "@undecaf/zbar-wasm";

export interface DecoderOptions {
  threshold?: number;
}

export interface RawImageDataInput {
  data: Uint8ClampedArray | Uint8Array | ArrayBuffer;
  width: number;
  height: number;
  channels?: 1 | 3 | 4;
}

type BrowserDrawable = ImageBitmap | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
export type DecoderSource = BrowserDrawable | ImageData | RawImageDataInput | Uint8Array | ArrayBuffer | string;

export async function decodeDenseQR(source: DecoderSource, options: DecoderOptions = {}): Promise<string | null> {
  const threshold = options.threshold ?? 128;

  if (isImageData(source)) {
    return decodeImageData(source, threshold);
  }

  if (isBrowserDrawable(source)) {
    const imageData = getImageDataFromBrowserSource(source);
    return decodeImageData(imageData, threshold);
  }

  return decodeNodeSource(source, threshold);
}

function isBrowserDrawable(source: unknown): source is BrowserDrawable {
  return (
    (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) ||
    (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) ||
    (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) ||
    (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement)
  );
}

function isImageData(source: unknown): source is ImageData {
  return typeof source === "object" && source !== null && "data" in source && source instanceof ImageData;
}

function isRawInput(source: unknown): source is RawImageDataInput {
  return typeof source === "object" && source !== null && "data" in source && "width" in source && "height" in source;
}

function arrayBufferFromInput(source: Uint8Array | ArrayBuffer): ArrayBuffer {
  return source instanceof ArrayBuffer ? source : new Uint8Array(source).slice().buffer;
}

function normalizeRawInput(raw: RawImageDataInput): ImageData {
  const width = raw.width;
  const height = raw.height;
  const channels = raw.channels ?? 1;
  const rawData: Uint8ClampedArray = raw.data instanceof Uint8ClampedArray ? raw.data : new Uint8ClampedArray(Array.from(new Uint8Array(arrayBufferFromInput(raw.data) as ArrayBuffer)));

  if (channels === 4) {
    return new ImageData(rawData as any, width, height);
  }

  const rgba = new Uint8ClampedArray(width * height * 4);
  let srcIndex = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rawData[srcIndex++];
    const g = channels === 3 ? rawData[srcIndex++] : r;
    const b = channels === 3 ? rawData[srcIndex++] : r;

    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = 255;
  }

  return new ImageData(rgba, width, height);
}

async function decodeNodeSource(source: DecoderSource, threshold: number): Promise<string | null> {
  if (isRawInput(source)) {
    return decodeImageData(normalizeRawInput(source), threshold);
  }

  const nodeSource = source instanceof Uint8Array || source instanceof ArrayBuffer || typeof source === "string";
  if (!nodeSource) {
    throw new Error("Unsupported source type for Node decoding. Pass raw image bytes, a file path, or an ImageData-like object.");
  }

  const sharp = await importSharp();
  const image = typeof source === "string" ? sharp(source) : sharp(source);
  const { data, info } = await image.grayscale().threshold(threshold).raw().toBuffer({ resolveWithObject: true });

  const imageData = normalizeRawInput({
    data: data instanceof Uint8Array ? data : new Uint8Array(data),
    width: info.width,
    height: info.height,
    channels: info.channels as 1 | 3 | 4,
  });

  return decodeImageData(imageData, threshold);
}

async function importSharp() {
  try {
    const sharpModule = await import("sharp");
    return (sharpModule as any).default ?? sharpModule;
  } catch (error) {
    throw new Error("sharp is required for Node.js decoding. Install sharp as a dependency before calling decodeDenseQR in Node.");
  }
}

function getImageDataFromBrowserSource(source: BrowserDrawable): ImageData {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create canvas context for browser image preprocessing.");
  }

  const width = "videoWidth" in source ? source.videoWidth : source.width;
  const height = "videoHeight" in source ? source.videoHeight : source.height;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}

function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const val = avg >= threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = 255;
  }
  return new ImageData(data, imageData.width, imageData.height);
}

async function decodeImageData(imageData: ImageData, threshold: number): Promise<string | null> {
  const processed = threshold !== undefined ? applyThreshold(imageData, threshold) : imageData;
  const symbols = await scanImageData(processed);

  const qrSymbol = symbols.find((symbol) => {
    const name = String((symbol as any).typeName ?? "");
    return /qr/i.test(name);
  });

  if (!qrSymbol || typeof (qrSymbol as any).decode !== "function") {
    return null;
  }

  return (qrSymbol as any).decode() ?? null;
}
