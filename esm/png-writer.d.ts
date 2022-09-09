/**
 * Create a PngPong-suitable PNG ArrayBuffer from an existing RGBA array. Combine
 * this with PNGJS to transform an existing PNG image into something PngPong can use.
 *
 * @export
 * @param {number} width
 * @param {number} height
 * @returns
 */
export declare class PNGRGBAWriter {
    private walker;
    private zlibWriter;
    private rowsLeft;
    private xOffset;
    private width;
    private chunker;
    constructor(width: number, height: number);
    addPixels(data: Uint8Array, byteOffset: number, numPixels: number): void;
    addRow(rowData: Uint8Array): void;
    finishAndGetBlob(): Blob;
}
