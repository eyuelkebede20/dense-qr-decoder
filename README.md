# dense-qr-decoder

A high-performance, WebAssembly-powered QR decoder optimized for high-density (Version 40) QR codes, such as those found on Ethiopian National ID (Fayda) cards.

## Features

- **Zero-Config Preprocessing**: Automatically applies grayscale and thresholding filters to handle low-contrast or colored backgrounds.
- **Version 40 Optimized**: Uses the ZBar-WASM engine, which is significantly more resilient to the module density of modern identity cards than standard JS libraries.
- **Dual-Module Support**: Works out-of-the-box with both ESM (import) and CommonJS (require).

## Installation

```bash
npm install dense-qr-decoder
```

## Usage

### Browser

The decoder handles image cleanup internally. You can pass an `ImageBitmap`, `HTMLImageElement`, `HTMLCanvasElement`, or `HTMLVideoElement` directly.

```typescript
import { decodeDenseQR } from "dense-qr-decoder";

const handleScan = async (imageElement) => {
  try {
    // Zero-config: just pass the element
    const result = await decodeDenseQR(imageElement, {
      threshold: 120, // Optional: adjust for very dark/light environments
    });

    if (result) {
      console.log("Decoded Data:", result);
    } else {
      console.warn("No QR code found. Try flattening the card or improving light.");
    }
  } catch (err) {
    console.error("Scanning error:", err);
  }
};
```

### Node.js

Node.js support is built in using the `@undecaf/zbar-wasm` engine. For best results with dense QR codes, use `sharp` for image loading and thresholding before decoding.

```typescript
import { decodeDenseQR } from "dense-qr-decoder";
import sharp from "sharp";

async function processID(imagePath: string) {
  const { data, info } = await sharp(imagePath).grayscale().threshold(128).raw().toBuffer({ resolveWithObject: true });

  const result = await decodeDenseQR({
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
    channels: info.channels as 1 | 3 | 4,
  });

  return result;
}
```

## Best Practices for ID Scanning

- **Flat Perspective**: Version 40 codes have almost zero tolerance for warping. Ensure the card is flat and the camera is parallel to the card.
- **Lighting**: Avoid yellow or warm lighting. Bright, neutral white light produces the best results for the internal thresholding engine.

## API Reference

### `decodeDenseQR(source, options?)`

- **source**: `ImageBitmap | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageData`
- **options**:
  - `threshold`: number (0-255). The brightness cutoff for turning pixels black or white. Default is 128.
- **Returns**: `Promise<string | null>`

Resolves to the decoded string when a QR code is found, or `null` when the code cannot be detected.
