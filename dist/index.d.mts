interface DecoderOptions {
    threshold?: number;
    tryHarder?: boolean;
}
/**
 * Automatically pre-processes and decodes high-density QR codes.
 */
declare function decodeDenseQR(source: ImageBitmap | HTMLCanvasElement | HTMLImageElement | ImageData, options?: DecoderOptions): Promise<string | null>;

export { type DecoderOptions, decodeDenseQR };
