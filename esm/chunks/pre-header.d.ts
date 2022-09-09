import { ArrayBufferWalker } from '../util/arraybuffer-walker';
/**
 * PNG files have a very basic header that identifies the PNG
 * file as... a PNG file. We need to write that out.
 *
 * @export
 * @param {ArrayBufferWalker} walker
 */
export declare function writePreheader(walker: ArrayBufferWalker): void;
export declare const length: number;
