import { keccak_256 } from "@noble/hashes/sha3";

/**
 * Get an Ethereum address from a point
 *
 * @param point - the point to format
 *
 * @returns an ethereum address
 */
export function ethAddressFromPoint(point: bigint[]): string {
  // TODO: make it work with keccak from noble

  // Convert points (x, y) to Buffer
  const xBuffer = Buffer.from(point[0].toString(16).padStart(64, "0"), "hex");
  const yBuffer = Buffer.from(point[1].toString(16).padStart(64, "0"), "hex");

  // Concatenate x and y to form public key
  const publicKey = Buffer.concat([xBuffer, yBuffer]);

  // Hash the public key with Keccak-256
  const hash = Buffer.from(keccak_256(publicKey));

  // Take the last 20 bytes of the hash and convert to an Ethereum address
  const ethereumAddress = "0x" + hash.slice(-20).toString("hex");

  return ethereumAddress;
}