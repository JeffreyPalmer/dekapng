import { ArrayBufferWalker } from "./util/arraybuffer-walker";
import { BlobWriter } from "./util/blob-writer";
import { writePreheader as writePreheader, } from "./chunks/pre-header";
import { writeIHDR as writeIHDR, PNGColorType, } from "./chunks/ihdr";
import { writeIEND as writeIEND } from "./chunks/iend";
import { calculateZlibbedLength, ZlibWriter } from "./util/zlib";
const MAX_CHUNK_SIZE = 2 ** 31 - 1;
class IDATChunker extends ArrayBufferWalker {
    // note: this data size is actual compression bytes not pixel data
    // compression size > pixel data size
    constructor(walker, dataSize) {
        super(0); // Yes I know, should get rid of ArrayBufferWalker!
        this.walker = walker;
        this.bytesLeft = dataSize;
        this.bytesLeftInChunk = 0;
        this.startChunk();
    }
    startChunk() {
        const chunkSize = Math.min(MAX_CHUNK_SIZE, this.bytesLeft);
        this.bytesLeftInChunk = chunkSize;
        this.bytesLeft -= chunkSize;
        this.walker.writeUint32(chunkSize);
        this.walker.startCRC();
        this.walker.writeString("IDAT");
    }
    endChunk() {
        this.walker.writeCRC();
    }
    isFinished() {
        return this.bytesLeft === 0 && this.bytesLeftInChunk === 0;
    }
    writeUint8(v) {
        this.walker.writeUint8(v);
        --this.bytesLeftInChunk;
        if (this.bytesLeftInChunk === 0) {
            this.endChunk();
            if (this.bytesLeft) {
                this.startChunk();
            }
        }
    }
    writeUint16(v, littleEndian = false) {
        if (littleEndian) {
            this.writeUint8(v & 0xff);
            this.writeUint8((v >> 8) & 0xff);
        }
        else {
            this.writeUint8((v >> 8) & 0xff);
            this.writeUint8(v & 0xff);
        }
    }
    writeUint32(v, littleEndian = false) {
        if (littleEndian) {
            this.writeUint8(v & 0xff);
            this.writeUint8((v >> 8) & 0xff);
            this.writeUint8((v >> 16) & 0xff);
            this.writeUint8((v >> 24) & 0xff);
        }
        else {
            this.writeUint8((v >> 24) & 0xff);
            this.writeUint8((v >> 16) & 0xff);
            this.writeUint8((v >> 8) & 0xff);
            this.writeUint8(v & 0xff);
        }
    }
    startAdler() {
        this.walker.startAdler();
    }
    pauseAdler() {
        this.walker.pauseAdler();
    }
    // TOTAL HACK!
    writeAdler(walker) {
        this.walker.writeAdler(this);
    }
}
/**
 * Create a PngPong-suitable PNG ArrayBuffer from an existing RGBA array. Combine
 * this with PNGJS to transform an existing PNG image into something PngPong can use.
 *
 * @export
 * @param {number} width
 * @param {number} height
 * @returns
 */
export class PNGRGBAWriter {
    constructor(width, height) {
        this.xOffset = 0;
        const walker = new BlobWriter();
        writePreheader(walker);
        writeIHDR(walker, {
            width: width,
            height: height,
            colorType: PNGColorType.RGBA,
            bitDepth: 8,
            compressionMethod: 0,
            filter: 0,
            interface: 0,
        });
        // We need to account for a row filter pixel in our chunk length
        const dataSize = width * height * 4 + height;
        const chunker = new IDATChunker(walker, calculateZlibbedLength(dataSize));
        const zlibWriter = new ZlibWriter(chunker, dataSize);
        this.chunker = chunker;
        this.zlibWriter = zlibWriter;
        this.walker = walker;
        this.rowsLeft = height;
        this.width = width;
    }
    addPixels(data, byteOffset, numPixels) {
        if (!this.rowsLeft) {
            throw new Error("too many rows");
        }
        for (let i = 0; i < numPixels; ++i) {
            if (this.xOffset === 0) {
                // Write our row filter byte
                this.zlibWriter.writeUint8(0);
            }
            const offset = byteOffset + i * 4;
            this.zlibWriter.writeUint8(data[offset + 0]);
            this.zlibWriter.writeUint8(data[offset + 1]);
            this.zlibWriter.writeUint8(data[offset + 2]);
            this.zlibWriter.writeUint8(data[offset + 3]);
            ++this.xOffset;
            if (this.xOffset === this.width) {
                this.xOffset = 0;
                --this.rowsLeft;
            }
        }
    }
    addRow(rowData) {
        this.addPixels(rowData, 0, rowData.length / 4);
    }
    finishAndGetBlob() {
        if (this.rowsLeft) {
            throw new Error(`${this.rowsLeft} rows left`);
        }
        this.zlibWriter.end();
        if (!this.chunker.isFinished()) {
            throw new Error("bug!");
        }
        writeIEND(this.walker);
        return this.walker.getBlob("image/png");
    }
}
//# sourceMappingURL=png-writer.js.map