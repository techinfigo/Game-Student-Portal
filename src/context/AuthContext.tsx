/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signInWithSsoToken } from '../services/authService';

/**
 * The website hands a logged-in student over as `/?sso=<firebaseCustomToken>`.
 * Read it at module load — before React mounts and before any route decides —
 * and strip it from the URL straight away so the token is never left visible in
 * the address bar, in history, or in a shared link. Reading it once here also
 * means a StrictMode double-mount can't find a half-consumed URL.
 */
const ssoToken = (() => {
  if (typeof window === 'undefined') return null;
  const token = new URLSearchParams(window.location.search).get('sso');
  if (token) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  return token;
})();

let ssoAttempted = false;

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
  ssoPending: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ssoPending, setSsoPending] = useState(!!ssoToken);

  useEffect(() => {
    if (!ssoToken || ssoAttempted) return;
    ssoAttempted = true;

    signInWithSsoToken(ssoToken)
      .catch((error) => {
        // An invalid or expired token is not fatal: drop through to the normal
        // login flow instead of crashing the app.
        console.error('SSO sign-in failed:', error);
      })
      .finally(() => {
        setSsoPending(false);
      });
  }, []);

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
    <AuthContext.Provider
      value={{ user, student, loading: loading || ssoPending, ssoPending, logout }}
    >
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
