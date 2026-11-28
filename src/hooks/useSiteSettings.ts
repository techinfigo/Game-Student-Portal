/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { getDocById } from '../services/dataService';
import { FirestoreSiteSettings } from '../types';

export interface SiteSettings {
  liveAppLink: string;
  testSeriesLink: string;
  offerPercent: number;
  offerCouponCode: string;
}

const DEFAULTS: SiteSettings = {
  liveAppLink: 'https://web.classplusapp.com/login',
  testSeriesLink: 'https://web.classplusapp.com/login',
  offerPercent: 15, // placeholder — GAME to confirm
  offerCouponCode: '',
};

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  useEffect(() => {
    let on = true;
    getDocById<FirestoreSiteSettings>('settings', 'site').then((data) => {
      if (!on || !data) return;
      setSettings({
        liveAppLink: data.classplusPortalLink || DEFAULTS.liveAppLink,
        testSeriesLink: data.testSeriesPortalLink || data.classplusPortalLink || DEFAULTS.testSeriesLink,
        offerPercent: typeof data.offerPercent === 'number' && data.offerPercent > 0 ? data.offerPercent : DEFAULTS.offerPercent,
        offerCouponCode: data.offerCouponCode || DEFAULTS.offerCouponCode,
      });
    });
    return () => { on = false; };
  }, []);
  return settings;
}
