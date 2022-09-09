import { ArrayBufferWalker } from "./arraybuffer-walker";
export declare class BlobWriter extends ArrayBufferWalker {
    private blobs;
    private blob;
    private crcOffset?;
    private crc?;
    private adlerOffset?;
    private adler?;
    constructor(chunkSize?: number);
    writeUint32(value: number, littleEndian?: boolean): void;
    writeUint16(value: number, littleEndian?: boolean): void;
    writeUint8(value: number): void;
    writeString(value: string): void;
    startCRC(): void;
    writeCRC(): void;
    startAdler(): void;
    pauseAdler(): void;
    writeAdler(walker: ArrayBufferWalker): void;
    flushIfNoSpace(spaceNeeded: number): void;
    flush(): void;
    getBlob(type: string): Blob;
}
