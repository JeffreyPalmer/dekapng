"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IHDRLength = exports.writeIHDR = exports.PNGColorType = void 0;
/**
 * The color type our image uses. PngPong currently only supports
 * Palette images, PNGColorType.Palette
 *
 * @export
 * @enum {number}
 */
var PNGColorType;
(function (PNGColorType) {
    PNGColorType[PNGColorType["Grayscale"] = 0] = "Grayscale";
    PNGColorType[PNGColorType["RGB"] = 2] = "RGB";
    PNGColorType[PNGColorType["Palette"] = 3] = "Palette";
    PNGColorType[PNGColorType["GrayscaleWithAlpha"] = 4] = "GrayscaleWithAlpha";
    PNGColorType[PNGColorType["RGBA"] = 6] = "RGBA";
})(PNGColorType = exports.PNGColorType || (exports.PNGColorType = {}));
function writeIHDR(walker, options) {
    // IHDR length is always 13 bytes
    walker.writeUint32(13);
    walker.startCRC();
    walker.writeString("IHDR");
    walker.writeUint32(options.width);
    walker.writeUint32(options.height);
    walker.writeUint8(options.bitDepth);
    walker.writeUint8(options.colorType);
    walker.writeUint8(options.compressionMethod);
    walker.writeUint8(options.filter);
    walker.writeUint8(options.interface);
    walker.writeCRC();
}
exports.writeIHDR = writeIHDR;
/**
 *  IHDR length is always 13 bytes. So we can store this as a constant.
 */
exports.IHDRLength = 4 // Chunk length identifier
    + 4 // chunk header
    + 13 // actual IHDR length
    + 4; // CRC32 check;
//# sourceMappingURL=ihdr.js.map