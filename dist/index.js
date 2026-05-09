"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  decodeDenseQR: () => decodeDenseQR
});
module.exports = __toCommonJS(index_exports);
var import_barcode_detector_polyfill = require("@undecaf/barcode-detector-polyfill");
async function decodeDenseQR(source, options = {}) {
  const threshold = options.threshold ?? 128;
  const processedSource = await preprocessImage(source, threshold);
  try {
    const detector = new import_barcode_detector_polyfill.BarcodeDetectorPolyfill({ formats: ["qr_code"] });
    const barcodes = await detector.detect(processedSource);
    return barcodes.length > 0 ? barcodes[0].rawValue : null;
  } catch (error) {
    console.error("QR Decoding failed:", error);
    throw error;
  }
}
async function preprocessImage(source, threshold) {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = source.width || source.videoWidth;
    canvas.height = source.height || source.videoHeight;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decodeDenseQR
});
