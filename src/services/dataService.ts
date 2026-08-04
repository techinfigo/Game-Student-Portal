/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getAll<T>(collectionName: string): Promise<(T & { id: string })[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }));
  } catch (error) {
    console.error(`Failed to fetch collection "${collectionName}":`, error);
    return [];
  }
}
