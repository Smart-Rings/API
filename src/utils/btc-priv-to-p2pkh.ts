/*
Get a Bitcoin P2PKH address from a private key (bigint)
*/

import * as crypto from 'crypto';
import * as bs58 from 'bs58';
import { Buffer } from 'buffer';
import { ec as EC } from 'elliptic';
import { bech32 } from 'bech32';
// Initialize elliptic curve
const ec = new EC('secp256k1');

export enum BitcoinNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

/**
 * Get the SHA256 hash of a buffer
 */
function sha256(buffer: Buffer): Buffer {
  return crypto.createHash('sha256').update(buffer).digest();
}

/**
 * Get the RIPEMD160 hash of a buffer
 */
function ripemd160(buffer: Buffer): Buffer {
  return crypto.createHash('ripemd160').update(buffer).digest();
}

/**
 * Get a Bitcoin P2PKH address from a private key (bigint)
 * 
 * @param privateKeyBigInt - The private key as a BigInt
 * @param network - The Bitcoin network to use (mainnet or testnet)
 * 
 * @returns The Bitcoin P2PKH address as a string
 */
export function getBitcoinAddress(privateKeyBigInt: BigInt, network: BitcoinNetwork): string {
  const publicKey = Buffer.from(getPublicKeyFromPrivateKey(privateKeyBigInt), 'hex');
  const sha256Hash = sha256(publicKey);
  const ripemd160Hash = ripemd160(sha256Hash);
  const prefix = network === BitcoinNetwork.MAINNET ? 0x00 : 0x6f;
  const extendedRipemd160Hash = Buffer.concat([Buffer.from([prefix]), ripemd160Hash]);
  const doubleSha256 = sha256(sha256(extendedRipemd160Hash));
  const checksum = doubleSha256.slice(0, 4);
  const binaryBitcoinAddress = Buffer.concat([extendedRipemd160Hash, checksum]);
  return bs58.encode(binaryBitcoinAddress);
}

export function getAddressFromPublicKey(publicKey: string, network: BitcoinNetwork): string {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  const sha256Hash = sha256(publicKeyBuffer);
  const ripemd160Hash = ripemd160(sha256Hash);
  const prefix = network === BitcoinNetwork.MAINNET ? 0x00 : 0x6f;
  const extendedRipemd160Hash = Buffer.concat([Buffer.from([prefix]), ripemd160Hash]);
  const doubleSha256 = sha256(sha256(extendedRipemd160Hash));
  const checksum = doubleSha256.slice(0, 4);
  const binaryBitcoinAddress = Buffer.concat([extendedRipemd160Hash, checksum]);
  return bs58.encode(binaryBitcoinAddress);
}


export function getBench32AddressFromPublicKey(publicKey: string, network: BitcoinNetwork): string {
  const sha256Hash = sha256(Buffer.from(publicKey, 'hex'));
  const ripemd160Hash = ripemd160(sha256Hash).toString('hex');
  //bech32 
  const bech32Words = bech32.toWords(Buffer.from(ripemd160Hash, "hex"));
  const words = new Uint8Array([0, ...bech32Words]);
  const address = bech32.encode("tb", words);
  return address;
}

export function getBench32AddressFromPoint(point: [bigint, bigint], network: BitcoinNetwork): string {
  const pubkey = ec.keyFromPublic({ x: point[0].toString(16), y: point[1].toString(16) }).getPublic();
  const address = getBench32AddressFromPublicKey(pubkey.encodeCompressed('hex'), network);
  return address;
}
/**
 * Get the public key from a private key
 * 
 * @param privateKeyBigInt - The private key as a BigInt
 * 
 * @returns The public key as a hex string
 */
export function getPublicKeyFromPrivateKey(privateKeyBigInt: BigInt): string {
  // Generate the public key
  const keyPair = ec.keyFromPrivate(privateKeyBigInt.toString(16));
  const publicKey = keyPair.getPublic();

  // Convert the public key to a hex string
  // Use 'encode' for uncompressed format, or 'encodeCompressed' for compressed
  const publicKeyHex = publicKey.encode('hex', false);
  console.log("publicKeyHex: ", publicKeyHex);
  return publicKey.encode('hex', false);
}

