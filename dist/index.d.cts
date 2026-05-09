interface DecoderOptions {
    threshold?: number;
}
interface RawImageDataInput {
    data: Uint8ClampedArray | Uint8Array | ArrayBuffer;
    width: number;
    height: number;
    channels?: 1 | 3 | 4;
}
type BrowserDrawable = ImageBitmap | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
type DecoderSource = BrowserDrawable | ImageData | RawImageDataInput | Uint8Array | ArrayBuffer | string;
declare function decodeDenseQR(source: DecoderSource, options?: DecoderOptions): Promise<string | null>;

export { type DecoderOptions, type DecoderSource, type RawImageDataInput, decodeDenseQR };
