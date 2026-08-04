/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmc4k19hk2VPLZ44XOyOg3b41RUwzsNzY",
  authDomain: "game-academy-2799d.firebaseapp.com",
  projectId: "game-academy-2799d",
  storageBucket: "game-academy-2799d.firebasestorage.app",
  messagingSenderId: "981796500036",
  appId: "1:981796500036:web:75867efc29c32c67eb8211"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
