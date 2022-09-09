import { PNGRGBAWriter } from "../src/png-writer";
import { PNG } from "pngjs";
import expect from "expect";

class Blob {
  parts?: any;
  options?: any;

  constructor(parts: any, options: any) {
    this.parts = parts;
    this.options = options;
  }

  private static getLengthOfParts(blob: Blob): number {
    return blob.parts.reduce((acc: any, part: any) => {
      return (
        acc +
        (part instanceof Uint8Array ? part.length : Blob.getLengthOfParts(part))
      );
    }, 0);
  }

  private static addData(blob: Blob, offset: number, dst: Uint8Array): number {
    blob.parts.forEach((part: any) => {
      if (part instanceof Uint8Array) {
        dst.set(part, offset);
        offset += part.length;
      } else {
        offset = Blob.addData(part, offset, dst);
      }
    });
    return offset;
  }

  static getData(blob: Blob): Uint8Array {
    let length = Blob.getLengthOfParts(blob);
    const data = new Uint8Array(length);
    Blob.addData(blob, 0, data);
    return data;
  }
}

describe("png writer", () => {
  it("generate png", () => {
    // global.Blob = Blob;

    const pixels = new Uint8Array([
      0xff, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff, 0xff, 0x00, 0xff,
      0xff, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff, 0x00, 0x00, 0xff,
      0xff, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff, 0x00, 0xff, 0xff,
      0xff, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0xff, 0xff, 0x00, 0xff, 0xff,
      0xff, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0xff, 0xff, 0x00, 0xff,
      0x00, 0x00, 0x00, 0xff,
    ]);
    const width = 4;
    const height = 4;
    const lineSize = width * 4;
    const pngRGBAWriter = new PNGRGBAWriter(width, height);
    for (let y = 0; y < height; ++y) {
      const row = new Uint8Array(pixels.buffer, y * lineSize, lineSize);
      pngRGBAWriter.addRow(row);
    }
    const blob = pngRGBAWriter.finishAndGetBlob();
    const data = Blob.getData(blob as Blob);

    const png = PNG.sync.read(Buffer.from(data));
    expect(png.width).toEqual(width);
    expect(png.height).toEqual(height);
    expect(png.bpp).toEqual(4);
    expect(png.data).toEqual(Buffer.from(pixels));
  });
});
