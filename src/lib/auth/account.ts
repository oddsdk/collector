import * as odd from '@oddjs/odd';
import type FileSystem from '@oddjs/odd/fs/index';
// import { sha256 } from '@oddjs/odd/components/crypto/implementation/browser';
// import { publicKeyToDid } from '@oddjs/odd/did/transformers';
import type { Crypto } from '@oddjs/odd';
import { getRecoil, setRecoil } from 'recoil-nexus';
import * as uint8arrays from 'uint8arrays';
// import * as ExpoCrypto from "expo-crypto";

import { filesystemStore, sessionStore } from '../stores';
import { asyncDebounce } from '../utils';
import { getBackupStatus } from './backup';

export const USERNAME_STORAGE_KEY = 'fullUsername';

export enum RECOVERY_STATES {
  Ready,
  Processing,
  Error,
  Done,
}

const BASE58_DID_PREFIX = 'did:key:z';

function publicKeyToDid(crypto, publicKey, keyType) {
  // Prefix public-write key
  const prefix = crypto.did.keyTypes[keyType]?.magicBytes;
  if (prefix === null) {
    throw new Error(
      `Key type '${keyType}' not supported, available types: ${Object.keys(
        crypto.did.keyTypes
      ).join(', ')}`
    );
  }
  const prefixedBuf = uint8arrays.concat([prefix, publicKey]);
  // Encode prefixed
  return BASE58_DID_PREFIX + uint8arrays.toString(prefixedBuf, "base58btc");
}

export const isUsernameValid = async (username: string): Promise<boolean> => {
  const session = getRecoil(sessionStore);
  return session.authStrategy.isUsernameValid(username);
};

export const isUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const session = getRecoil(sessionStore);
  return session.authStrategy.isUsernameAvailable(username);
};

export const debouncedIsUsernameAvailable = asyncDebounce(
  isUsernameAvailable,
  300
);

/**
 * Create additional directories and files needed by the app
 *
 * @param fs FileSystem
 */
const initializeFilesystem = async (fs: FileSystem): Promise<void> => {
  await fs.mkdir(odd.path.directory('public', 'collector'));
  await fs.mkdir(odd.path.directory('private', 'collector'));
};

export const createDID = async (
  crypto: Crypto.Implementation
): Promise<string> => {
  const pubKey = await crypto.keystore.publicExchangeKey();
  const ksAlg = await crypto.keystore.getAlgorithm();

  return publicKeyToDid(crypto, pubKey, ksAlg);
};

export const prepareUsername = async (username: string): Promise<string> => {
  const normalizedUsername = username.normalize('NFD');
  // const hashedUsername = await sha256(
  //   new TextEncoder().encode(normalizedUsername)
  // );
  const hashedUsername = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizedUsername)
  );

  // const hashedUsername = await ExpoCrypto.digest(
  //   ExpoCrypto.CryptoDigestAlgorithm.SHA256,
  //   new TextEncoder().encode(normalizedUsername)
  // );

  return uint8arrays.toString(new Uint8Array(hashedUsername), 'base32').slice(0, 32);
};

export const register = async (hashedUsername: string): Promise<boolean> => {
  const originalSession = getRecoil(sessionStore);
  const {
    authStrategy,
    program: {
      components: { storage },
    },
  } = originalSession;
  const { success } = await authStrategy.register({ username: hashedUsername });

  if (!success) return success;

  const session = await authStrategy.session();
  setRecoil(filesystemStore, session.fs);

  // TODO Remove if only public and private directories are needed
  await initializeFilesystem(session.fs);

  const fullUsername = (await storage.getItem(USERNAME_STORAGE_KEY)) as string;

  setRecoil(sessionStore, {
    ...originalSession,
    username: {
      full: fullUsername,
      hashed: hashedUsername,
      trimmed: fullUsername.split('#')[0],
    },
    session,
  });

  return success;
};

export const loadAccount = async (
  hashedUsername: string,
  fullUsername: string
): Promise<void> => {
  const originalSession = getRecoil(sessionStore);
  const {
    authStrategy,
    program: {
      components: { storage },
    },
  } = originalSession;
  const session = await authStrategy.session();

  setRecoil(filesystemStore, session.fs);

  const backupStatus = await getBackupStatus(session.fs);

  await storage.setItem(USERNAME_STORAGE_KEY, fullUsername);

  setRecoil(sessionStore, {
    ...originalSession,
    username: {
      full: fullUsername,
      hashed: hashedUsername,
      trimmed: fullUsername.split('#')[0],
    },
    session,
    backupCreated: !!backupStatus?.created,
  });
};
