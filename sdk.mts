import { decryptLink as decodeToken, encryptLink as encodeToken } from "./links.mjs";

const sharePage = "https://octopusgarage.github.io/s/";

export async function encryptLink(destination: string | URL): Promise<string> {
  const share = new URL(sharePage);
  share.hash = await encodeToken(destination.toString());
  return share.href;
}

export async function decryptLink(input: string | URL): Promise<URL> {
  const share = new URL(input);
  if (share.href.split("#")[0] !== sharePage || !share.hash) {
    throw new Error("Invalid OctopusGarage share URL.");
  }
  return new URL(await decodeToken(share.hash.slice(1)));
}
