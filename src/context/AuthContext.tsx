/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface StudentProfile {
  uid: string;
  name: string;
  phoneNumber: string;
  email?: string;
  joinedDate?: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  student: StudentProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setStudent(null);
        setLoading(false);
        return;
      }

      const fallbackProfile: StudentProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Student',
        phoneNumber: firebaseUser.phoneNumber || '',
      };

      try {
        const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStudent({
            uid: firebaseUser.uid,
            name: data.name || data.displayName || fallbackProfile.name,
            phoneNumber: data.phoneNumber || fallbackProfile.phoneNumber,
            email: data.email,
            joinedDate: data.joinedDate,
            avatar: data.avatar,
          });
        } else {
          setStudent(fallbackProfile);
        }
      } catch (error) {
        console.error('Failed to load student profile:', error);
        setStudent(fallbackProfile);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, student, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
