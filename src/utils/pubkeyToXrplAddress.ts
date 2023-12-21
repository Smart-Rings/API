import { BNInput, ec, eddsa, curve } from "elliptic";
import { Point } from "../../../types-Ring-Signature";
import BN from "bn.js";
import { createHash } from "node:crypto";
import * as assert from "assert";
const R_B58_DICT = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
const baseX = require("base-x");
const secp256k1 = new ec("secp256k1");
const ed25519 = new eddsa("ed25519");
const base58 = baseX(R_B58_DICT);
/**
 * Get the XRPL address from the xPubkey
 *
 * @param pubkeyHex - The pubkey to get the XRPL address from
 * @returns The XRPL address (base58 encoded)
 */
export function getAddressFromSigningPubkey(pubkeyHex: string): string {
  const pubkey = Buffer.from(pubkeyHex, "hex");
  // Calculate the RIPEMD160 hash of the SHA-256 hash of the public key
  //   This is the "Account ID"
  const pubkey_inner_hash = createHash("sha256").update(pubkey);
  const pubkey_outer_hash = createHash("ripemd160");
  pubkey_outer_hash.update(pubkey_inner_hash.digest());
  const account_id = pubkey_outer_hash.digest();
  // Prefix the Account ID with the type prefix for an XRPL Classic Address, then
  //   calculate a checksum as the first 4 bytes of the SHA-256 of the SHA-256
  //   of the Account ID
  const address_type_prefix = Buffer.from([0x00]);
  const payload = Buffer.concat([address_type_prefix, account_id]);
  const chksum_hash1 = createHash("sha256").update(payload).digest();
  const chksum_hash2 = createHash("sha256").update(chksum_hash1).digest();
  const checksum = chksum_hash2.slice(0, 4);
  // Concatenate the address type prefix, the payload, and the checksum.
  // Base-58 encode the encoded value to get the address.
  const dataToEncode = Buffer.concat([payload, checksum]);
  const address = base58.encode(dataToEncode);
  return address;
}


/**
 * Converts an array of bytes to a hex string.
 * @param bytes the bytes to convert to hex.
 * @returns the hex string corresponding to the bytes.
 */
export function bytesToHex(
  bytes: Iterable<number> | ArrayLike<number>,
): string {
  return Array.from(bytes, (byteValue) => {
    const hex = byteValue.toString(16).toUpperCase();
    return hex.length > 1 ? hex : `0${hex}`;
  }).join("");
}

/**
 * Get the XRPL address from a pubkey as a Point.
 * @param point the point to get the address from.
 * @returns the XRPL address corresponding to the point.
 */
export function getXRPLAddressfromPoint(point: bigint[]): string {
  let encodedPukey: string;
  let a: BNInput;
  let b: BNInput;
  let p: curve.edwards.EdwardsPoint;
  let key: eddsa.KeyPair;
  let encodedPuke: string;

      encodedPukey = secp256k1.curve
        .pointFromX(point[0].toString(16))
        .encodeCompressed();
      return getAddressFromSigningPubkey(encodedPukey);
}

