# dense-qr-decoder

A high-density QR code decoder built on ZBar compiled to WebAssembly. Designed for dense Version 40 QR codes and real-world use cases like national identity card scanning.

## Why use this package?

- Optimized for dense QR codes where modules are very small and standard JavaScript decoders struggle.
- Uses the ZBar engine via WASM for stronger edge detection and timing pattern alignment.
- Works in browser environments and Node.js with raw image data.

## Installation

```bash
npm install dense-qr-decoder
```

## Quick Start

### Browser

The decoder accepts:

- `ImageBitmap`
- `HTMLCanvasElement`
- `HTMLImageElement`
- `ImageData`

```ts
import { decodeDenseQR } from "dense-qr-decoder";

async function scanFile(file: File) {
  const bitmap = await createImageBitmap(file);
  const result = await decodeDenseQR(bitmap);

  if (result) {
    console.log("Decoded data:", result);
  } else {
    console.log("No QR code detected.");
  }
}
```

### Node.js

For Node, provide raw pixel data or a canvas-like image source. Preprocessing with `sharp` is recommended for dense codes.

```ts
import { decodeDenseQR } from "dense-qr-decoder";
import sharp from "sharp";

async function decodeImage(path: string) {
  const { data, info } = await sharp(path).grayscale().threshold(128).raw().toBuffer({ resolveWithObject: true });

  const result = await decodeDenseQR({
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
  } as any);

  return result;
}
```

## Usage notes

- Keep the QR code as flat as possible. Perspective distortion hurts dense code decoding.
- High contrast helps. Convert to grayscale or threshold images when backgrounds are colored.
- Capture the code at high resolution. Dense QR codes need enough pixels per module.

## API

### `decodeDenseQR(source)`

- `source`: `ImageBitmap | HTMLCanvasElement | HTMLImageElement | ImageData`
- Returns: `Promise<string | null>`

Resolves to the decoded string when a QR code is found, or `null` when the code cannot be detected.

## License

MIT
