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
 * The website hands a logged-in student over as `/<path>?sso=<firebaseCustomToken>`.
 * Read it at module load — before React mounts and before any route decides —
 * and strip ONLY the `sso` param straight away so the token is never left visible
 * in the address bar, in history, or in a shared link. Any other query params
 * (e.g. a `?buy=<pdfId>` deep link handed over alongside the token) are kept so
 * the destination route still receives them. Reading it once here also means a
 * StrictMode double-mount can't find a half-consumed URL.
 */
const ssoToken = (() => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('sso');
  if (token) {
    params.delete('sso');
    const rest = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
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
  // Added for the dashboard redesign (profile completion + first-purchase offer)
  education?: string;
  branch?: string;
  passingYear?: string;
  examGoal?: string;
  alsoInterested?: string[];
  offerStartedAt?: number; // epoch ms, set ONCE when profile first hits 100%
}

interface AuthContextValue {
  user: User | null;
  student: StudentProfile | null;
  loading: boolean;
  ssoPending: boolean;
  logout: () => Promise<void>;
  refreshStudent: () => Promise<void>;
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

  const loadProfile = async (firebaseUser: User) => {
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
          education: data.education || '',
          branch: data.branch || '',
          passingYear: data.passingYear || '',
          examGoal: data.examGoal || '',
          alsoInterested: Array.isArray(data.alsoInterested) ? data.alsoInterested : [],
          offerStartedAt: typeof data.offerStartedAt === 'number' ? data.offerStartedAt : undefined,
        });
      } else {
        setStudent(fallbackProfile);
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
      setStudent(fallbackProfile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setStudent(null);
        setLoading(false);
        return;
      }

      await loadProfile(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Re-read the profile doc after a save so the banner / strength update live.
  const refreshStudent = async () => {
    if (auth.currentUser) await loadProfile(auth.currentUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, student, loading: loading || ssoPending, ssoPending, logout, refreshStudent }}
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
