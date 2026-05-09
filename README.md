# dense-qr-decoder

A high-density QR code decoder optimized for dense Version 40 QR codes and real-world use cases like national identity card scanning. **No preprocessing needed** — just pass an image and get results.

## Why use this package?

- **Automatic preprocessing** — grayscale conversion and thresholding happen internally.
- **Works out of the box** — supports ImageBitmap, HTMLCanvasElement, HTMLImageElement, and ImageData.
- **Optimized for dense codes** — superior edge detection for small QR modules that standard decoders miss.

## Installation

```bash
npm install dense-qr-decoder
```

## Quick Start

```ts
import { decodeDenseQR } from "dense-qr-decoder";

// Just pass the image. No preprocessing needed!
const result = await decodeDenseQR(imageElement);

if (result) {
  console.log("Success:", result);
}
```

That's it. The decoder handles:

- Converting to grayscale
- Thresholding to binary
- Detecting and decoding the QR code

## Supported Input Types

- `ImageBitmap`
- `HTMLCanvasElement`
- `HTMLImageElement`
- `ImageData`

## Options

You can customize the threshold for edge cases:

```ts
const result = await decodeDenseQR(image, { threshold: 150 });
```

- `threshold`: 0–255 (default: 128). Adjust if lighting is poor or contrast is unusual.
- `tryHarder`: Boolean (default: false). Enable for more aggressive scanning.

## Tips

- **Perspective**: Keep the QR code as flat as possible. Keystone distortion reduces accuracy.
- **Lighting**: Ensure clear contrast between the QR code and background.
- **Resolution**: Capture the QR code at adequate resolution—dense codes need sufficient pixels per module.

## API

### `decodeDenseQR(source, options?)`

- `source`: `ImageBitmap | HTMLCanvasElement | HTMLImageElement | ImageData`
- `options`: `{ threshold?: number; tryHarder?: boolean }`
- Returns: `Promise<string | null>`

Resolves to the decoded string when a QR code is found, or `null` when the code cannot be detected.

## License

MIT
