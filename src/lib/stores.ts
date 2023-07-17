import { atom } from 'recoil';
import type FileSystem from '@oddjs/odd/fs/index';

import { initialSession, type SESSION } from './session';

export const filesystemStore = atom({
  key: 'filesystem',
  default: null as FileSystem | null,
  dangerouslyAllowMutability: true,
});

// export const notificationStore = atom({
//   key: 'notifications',
//   default: [] as Notification[],
// });

export const sessionStore = atom({
  key: 'session',
  default: initialSession as SESSION,
  dangerouslyAllowMutability: true,
});
