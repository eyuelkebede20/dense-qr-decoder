interface ScanResult {
    data: string;
    format: string;
}
/**
 * Decodes high-density QR codes (Version 40) from an ImageBitmap or Canvas
 */
declare function decodeDenseQR(source: ImageBitmap | HTMLCanvasElement | HTMLImageElement): Promise<string | null>;

export { type ScanResult, decodeDenseQR };
