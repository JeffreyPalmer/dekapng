"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.length = exports.writePreheader = void 0;
const PRE_HEADER = '\x89PNG\r\n\x1A\n';
/**
 * PNG files have a very basic header that identifies the PNG
 * file as... a PNG file. We need to write that out.
 *
 * @export
 * @param {ArrayBufferWalker} walker
 */
function writePreheader(walker) {
    walker.writeString(PRE_HEADER);
}
exports.writePreheader = writePreheader;
exports.length = PRE_HEADER.length;
//# sourceMappingURL=pre-header.js.map