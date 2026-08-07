/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
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

export async function getWhere<T>(
  collectionName: string,
  field: string,
  value: unknown
): Promise<(T & { id: string })[]> {
  try {
    const snapshot = await getDocs(query(collection(db, collectionName), where(field, "==", value)));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }));
  } catch (error) {
    console.error(`Failed to fetch collection "${collectionName}" where ${field} == ${value}:`, error);
    return [];
  }
}

export async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.exists() ? (snapshot.data() as T) : null;
  } catch (error) {
    console.error(`Failed to fetch doc "${collectionName}/${id}":`, error);
    return null;
  }
}
