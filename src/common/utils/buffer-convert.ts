function Uint8ArrayFromHex(value: string | Uint8Array | Buffer): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }

  let buf: Buffer;
  if (value instanceof Buffer) {
    buf = value;
  } else if (typeof value === "string") {
    buf =
      value.indexOf("0x") === 0
        ? Buffer.from(value.replace("0x", ""), "hex")
        : Buffer.from(value);
  } else {
    throw new Error("Invalid argument type");
  }

  return Uint8Array.from(buf);
}

export { Uint8ArrayFromHex };
