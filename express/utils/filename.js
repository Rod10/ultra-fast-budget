/* eslint-disable no-magic-numbers */
const buffer = require("buffer");

class FourBytes {
  #src;
  #cursor = 0;

  constructor(src) {
    this.#src = src;
  }

  get byte1() {
    return this.#src[this.#cursor];
  }

  get byte2() {
    return this.#src[this.#cursor + 1];
  }

  get byte3() {
    return this.#src[this.#cursor + 2];
  }

  get byte4() {
    return this.#src[this.#cursor + 3];
  }

  advance = count => {
    this.#cursor += count;
  };
}

const isInvalidFollowByte = value => value === undefined
  || (value < 0b10000000 || value >= 0b11000000);

const utf8SequenceLength = byte1 => {
  if (byte1 < 0b10000000) return 1;
  if (byte1 < 0b11100000) return 2;
  if (byte1 < 0b11110000) return 3;
  if (byte1 < 0b11111000) return 4;
  throw new Error("Invalid first byte");
};

/**
 * Check if a byte sequence looks like a valid UTF-8 sequence that *does* have wide characters.
 *
 * https://en.wikipedia.org/wiki/UTF-8
 *
 * @returns
 * `true` if the byte sequence does contain UTF-8 sequences.
 * Regular ASCII string will return `false` as they won't contain such sequence.
 */
const isUTF8Sequence = bytes => {
  try {
    let haveUTF8 = false;
    const b = new FourBytes(bytes);
    while (b.byte1 !== undefined) {
      const seqLength = utf8SequenceLength(b.byte1);
      // Voluntary fallthrough
      /* eslint-disable no-fallthrough */
      switch (seqLength) {
      // Range 0x10000-0x10FFFF
      case 4:
        if (isInvalidFollowByte(b.byte4)) return false;
      // Range 0x0800-0xFFFF
      case 3:
        if (isInvalidFollowByte(b.byte3)) return false;
      // Range 0x80-0x07FF
      case 2:
        if (isInvalidFollowByte(b.byte2)) return false;
        haveUTF8 = true;
      // Range 0x00-0x7F
      case 1:
      }
      /* eslint-enable no-fallthrough */
      b.advance(seqLength);
    }
    return haveUTF8;
  } catch {
    return false;
  }
};

const getSafeUTF8 = filename => (isUTF8Sequence(Buffer.from(filename, "ascii")))
  ? buffer.transcode(Buffer.from(filename), "utf8", "latin1").toString()
  : filename;

module.exports = {getSafeUTF8};
