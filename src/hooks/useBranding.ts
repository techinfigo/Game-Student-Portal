/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Branding {
  logoUrl: string;
  faviconUrl: string;
}

export function useBranding(): Branding {
  const [branding, setBranding] = useState<Branding>({ logoUrl: '', faviconUrl: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        setBranding({
          logoUrl: data.logoUrl ?? '',
          faviconUrl: data.faviconUrl ?? '',
        });
      } catch {
        // keep defaults on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!branding.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }, [branding.faviconUrl]);

  return branding;
}
