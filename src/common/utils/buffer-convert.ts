import Web3 from "web3";

function hexToUint8Array(value: string): Uint8Array {
  return value.indexOf("0x") === 0
    ? Buffer.from(value.replace("0x", ""), "hex")
    : Buffer.from(value);
}

function hexEthAddressToUint8Array(
  addr: string,
  verifyChecksumWeb3?: Web3,
  chainId?: number
): Uint8Array {
  if (verifyChecksumWeb3) {
    const isValid = verifyChecksumWeb3.utils.checkAddressChecksum(
      addr,
      chainId
    );
    if (!isValid) {
      throw new Error("Invalid checksum of eth address");
    }
  }

  return hexToUint8Array(addr);
}

function uint8ArrayToChecksumEthAddress(
  addrBytes: Uint8Array | Buffer,
  chainId: number,
  web3?: Web3
): string {
  if (!web3) {
    web3 = new Web3();
  }

  const addr = "0x" + Buffer.from(addrBytes).toString("hex");
  const checksumAddr = web3.utils.toChecksumAddress(addr, chainId);
  return checksumAddr;
}

export {
  hexToUint8Array,
  hexEthAddressToUint8Array,
  uint8ArrayToChecksumEthAddress
};
