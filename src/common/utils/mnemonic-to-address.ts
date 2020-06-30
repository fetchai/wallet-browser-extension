import { generateWalletFromMnemonic } from "@everett-protocol/cosmosjs/utils/key";

const mnemonicToAddress = (mnemonic: string, bech32PrefixAccAddr: string) => {
  const privateKey = generateWalletFromMnemonic(mnemonic);
  const address = privateKey
    .toPubKey()
    .toAddress()
    .toBech32(bech32PrefixAccAddr);
  return address;
};

export { mnemonicToAddress };
