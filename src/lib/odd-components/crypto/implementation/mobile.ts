// import { webcrypto } from 'one-webcrypto'
import * as uint8arrays from 'uint8arrays';
import tweetnacl from 'tweetnacl';

import * as keystore from 'keystore-idb';
// import * as keystoreIDB from 'keystore-idb/constants.js';
// import { HashAlg, SymmAlg, SymmKeyLength } from 'keystore-idb/types.js';
import { RSAKeyStore } from 'keystore-idb/rsa/index.js';
// import rsaOperations from 'keystore-idb/rsa/index.js';

import * as typeChecks from '../../common/type-checks';
import {
  Implementation,
  ImplementationOptions,
  VerifyArgs,
} from '../implementation';

enum SymmAlg {
  AES_CTR = "AES-CTR",
  AES_CBC = "AES-CBC",
  AES_GCM = "AES-GCM",
}

const { HashAlg, SymmKeyLength } = keystore.default;

// AES

export const aes = {
  decrypt: aesDecrypt,
  encrypt: aesEncrypt,
  exportKey: aesExportKey,
  genKey: aesGenKey,
};

export function importAesKey(
  key: Uint8Array,
  alg: SymmAlg
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    key,
    {
      name: alg,
      length: SymmKeyLength.B256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function aesDecrypt(
  encrypted: Uint8Array,
  key: CryptoKey | Uint8Array,
  alg: SymmAlg,
  iv?: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = typeChecks.isCryptoKey(key)
    ? key
    : await importAesKey(key, alg);
  const decrypted = iv
    ? await crypto.subtle.decrypt({ name: alg, iv }, cryptoKey, encrypted)
    : // the keystore version prefixes the `iv` into the cipher text
      await keystore.default.aes.decryptBytes(encrypted, cryptoKey, { alg });

  return new Uint8Array(decrypted);
}

export async function aesEncrypt(
  data: Uint8Array,
  key: CryptoKey | Uint8Array,
  alg: SymmAlg,
  iv?: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = typeChecks.isCryptoKey(key)
    ? key
    : await importAesKey(key, alg);

  // the keystore version prefixes the `iv` into the cipher text
  const encrypted = iv
    ? await crypto.subtle.encrypt({ name: alg, iv }, cryptoKey, data)
    : await keystore.default.aes.encryptBytes(data, cryptoKey, { alg });

  return new Uint8Array(encrypted);
}

export async function aesExportKey(key: CryptoKey): Promise<Uint8Array> {
  const buffer = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(buffer);
}

export function aesGenKey(alg: SymmAlg): Promise<CryptoKey> {
  return keystore.default.aes.makeKey({ length: SymmKeyLength.B256, alg });
}

// DID

export const did: Implementation['did'] = {
  keyTypes: {
    'bls12-381': {
      magicBytes: new Uint8Array([0xea, 0x01]),
      verify: () => {
        throw new Error('Not implemented');
      },
    },
    ed25519: {
      magicBytes: new Uint8Array([0xed, 0x01]),
      verify: ed25519Verify,
    },
    rsa: {
      magicBytes: new Uint8Array([0x00, 0xf5, 0x02]),
      verify: rsaVerify,
    },
  },
};

export async function ed25519Verify({
  message,
  publicKey,
  signature,
}: VerifyArgs): Promise<boolean> {
  return tweetnacl.sign.detached.verify(message, signature, publicKey);
}

export async function rsaVerify({
  message,
  publicKey,
  signature,
}: VerifyArgs): Promise<boolean> {
  return keystore.default.rsa.verify(
    message,
    signature,
    await crypto.subtle.importKey(
      'spki',
      publicKey,
      { name: keystore.default.RSA_WRITE_ALG, hash: RSA_HASHING_ALGORITHM },
      false,
      ['verify']
    ),
    8
  );
}

// HASH

export const hash = {
  sha256,
};

export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('sha-256', bytes));
}

// KEYSTORE

export function ksClearStore(ks: keystore.default.rsa.RSAKeyStore): Promise<void> {
  return ks.destroy();
}

export async function ksDecrypt(
  ks: keystore.default.rsa.RSAKeyStore,
  cipherText: Uint8Array
): Promise<Uint8Array> {
  const exchangeKey = await ks.exchangeKey();

  return rsaDecrypt(cipherText, exchangeKey.privateKey);
}

export async function ksExportSymmKey(
  ks: keystore.default.rsa.RSAKeyStore,
  keyName: string
): Promise<Uint8Array> {
  if ((await ks.keyExists(keyName)) === false) {
    throw new Error(
      `Expected a key under the name '${keyName}', but couldn't find anything`
    );
    // We're throwing an error here so that the function `getSymmKey` below doesn't create a key.
  }

  const key = await ks.getSymmKey(keyName);
  const raw = await crypto.subtle.exportKey('raw', key);

  return new Uint8Array(raw);
}

export function ksGetAlgorithm(ks: keystore.default.rsa.RSAKeyStore): Promise<string> {
  return Promise.resolve('rsa');
}

export function ksGetUcanAlgorithm(ks: keystore.default.rsa.RSAKeyStore): Promise<string> {
  return Promise.resolve('RS256');
}

export function ksImportSymmKey(
  ks: keystore.default.rsa.RSAKeyStore,
  key: Uint8Array,
  name: string
): Promise<void> {
  return ks.importSymmKey(uint8arrays.toString(key, 'base64pad'), name);
}

export function ksKeyExists(
  ks: keystore.default.rsa.RSAKeyStore,
  keyName: string
): Promise<boolean> {
  return ks.keyExists(keyName);
}

export async function ksPublicExchangeKey(
  ks: keystore.default.rsa.RSAKeyStore
): Promise<Uint8Array> {
  const keypair = await ks.exchangeKey();
  const spki = await crypto.subtle.exportKey('spki', keypair.publicKey);

  return new Uint8Array(spki);
}

export async function ksPublicWriteKey(ks: keystore.default.rsa.RSAKeyStore): Promise<Uint8Array> {
  const keypair = await ks.writeKey();
  const spki = await crypto.subtle.exportKey('spki', keypair.publicKey);

  return new Uint8Array(spki);
}

export async function ksSign(
  ks: keystore.default.rsa.RSAKeyStore,
  message: Uint8Array
): Promise<Uint8Array> {
  const writeKey = await ks.writeKey();
  const arrayBuffer = await keystore.default.rsa.sign(
    message,
    writeKey.privateKey,
    ks.cfg.charSize
  );

  return new Uint8Array(arrayBuffer);
}

// MISC

export const misc = {
  randomNumbers,
};

export function randomNumbers(options: { amount: number }): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(options.amount));
}

// RSA

export const rsa = {
  decrypt: rsaDecrypt,
  encrypt: rsaEncrypt,
  exportPublicKey: rsaExportPublicKey,
  genKey: rsaGenKey,
};

// RSA
// ---
// Exchange keys:

export const RSA_ALGORITHM = 'RSA-OAEP';
export const RSA_HASHING_ALGORITHM = 'SHA-256';

export function importRsaKey(
  key: Uint8Array,
  keyUsages: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    key,
    { name: RSA_ALGORITHM, hash: RSA_HASHING_ALGORITHM },
    false,
    keyUsages
  );
}

export async function rsaDecrypt(
  data: Uint8Array,
  privateKey: CryptoKey | Uint8Array
): Promise<Uint8Array> {
  const arrayBuffer = await crypto.subtle.decrypt(
    {
      name: RSA_ALGORITHM,
    },
    typeChecks.isCryptoKey(privateKey)
      ? privateKey
      : await importRsaKey(privateKey, ['decrypt']),
    data
  );

  return new Uint8Array(arrayBuffer);
}

export async function rsaEncrypt(
  message: Uint8Array,
  publicKey: CryptoKey | Uint8Array
): Promise<Uint8Array> {
  const key = typeChecks.isCryptoKey(publicKey)
    ? publicKey
    : await importRsaKey(publicKey, ['encrypt']);

  const arrayBuffer = await crypto.subtle.encrypt(
    {
      name: RSA_ALGORITHM,
    },
    key,
    message
  );

  return new Uint8Array(arrayBuffer);
}

export async function rsaExportPublicKey(key: CryptoKey): Promise<Uint8Array> {
  const buffer = await crypto.subtle.exportKey('spki', key);
  return new Uint8Array(buffer);
}

export function rsaGenKey(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: RSA_ALGORITHM,
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: RSA_HASHING_ALGORITHM },
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// 🛳

export async function implementation({
  storeName,
  exchangeKeyName,
  writeKeyName,
}: ImplementationOptions): Promise<Implementation> {
  const ks = await RSAKeyStore.init({
    charSize: 8,
    hashAlg: HashAlg.SHA_256,

    storeName,
    exchangeKeyName,
    writeKeyName,
  });

  return {
    aes,
    did,
    hash,
    misc,
    rsa,

    keystore: {
      clearStore: (...args) => ksClearStore(ks, ...args),
      decrypt: (...args) => ksDecrypt(ks, ...args),
      exportSymmKey: (...args) => ksExportSymmKey(ks, ...args),
      getAlgorithm: (...args) => ksGetAlgorithm(ks, ...args),
      getUcanAlgorithm: (...args) => ksGetUcanAlgorithm(ks, ...args),
      importSymmKey: (...args) => ksImportSymmKey(ks, ...args),
      keyExists: (...args) => ksKeyExists(ks, ...args),
      publicExchangeKey: (...args) => ksPublicExchangeKey(ks, ...args),
      publicWriteKey: (...args) => ksPublicWriteKey(ks, ...args),
      sign: (...args) => ksSign(ks, ...args),
    },
  };
}
