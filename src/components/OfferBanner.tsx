/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Gift, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCompletion, getOffer, PROFILE_FIELDS } from '../lib/offer';

interface Props {
  offerPercent: number;
  liveAppLink: string;
  couponCode: string;
  onComplete: () => void; // open the profile modal
}

export default function OfferBanner({ offerPercent, liveAppLink, couponCode, onComplete }: Props) {
  const { student } = useAuth();
  const [now, setNow] = useState(Date.now());

  const completion = getCompletion(student);
  const offer = getOffer(student, now);

  // Tick every 30s while the countdown is live.
  useEffect(() => {
    if (offer.state !== 'active') return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [offer.state]);

  // Offer expired → no banner at all (dashboard shows plain Explore view).
  if (offer.state === 'expired') return null;

  // Offer unlocked → live countdown banner.
  if (offer.state === 'active') {
    const box = (v: number, l: string) => (
      <div className="text-center">
        <div className="text-xl sm:text-2xl font-black text-white tabular-nums">{String(v).padStart(2, '0')}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-white/50">{l}</div>
      </div>
    );
    return (
      <div className="card-solid relative overflow-hidden bg-gradient-to-br from-game-teal to-game-teal-dark text-white p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-game-gold text-slate-900 p-2.5 rounded-xl shrink-0"><Gift size={22} /></div>
            <div>
              <h3 className="text-lg font-black">{offerPercent}% OFF unlocked on every paid course</h3>
              <p className="text-sm text-white/70 mt-1 max-w-md">
                {couponCode
                  ? <>Use code <b className="text-game-gold tracking-wider">{couponCode}</b> at checkout on the GAME Live App. Valid for 7 days from profile completion.</>
                  : <>Valid for 7 days from profile completion. Apply it at checkout on the GAME Live App.</>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 hidden sm:block">Ends in</span>
              {box(offer.days, 'Days')}<span className="text-white/30 font-black">:</span>
              {box(offer.hours, 'Hrs')}<span className="text-white/30 font-black">:</span>
              {box(offer.minutes, 'Min')}
            </div>
            <a href={liveAppLink} target="_blank" rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-game-gold text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:brightness-105 transition-all">
              Use offer now <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Profile incomplete → locked banner with the 5 field chips.
  return (
    <div className="rounded-2xl border-2 border-dashed border-game-gold/60 bg-game-gold/5 p-6 sm:p-7">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="bg-game-gold text-slate-900 p-2.5 rounded-xl shrink-0"><Gift size={22} /></div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Complete your profile · Unlock {offerPercent}% OFF on paid courses</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Takes under 1 minute. Your offer starts the moment you reach 100% and stays active for 7 days. Free study material for your exam is unlocked too.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {PROFILE_FIELDS.map((f) => {
                const done = completion.doneKeys.has(f.key as string);
                return (
                  <span key={f.key as string}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      done ? 'bg-game-teal text-white border-game-teal' : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                    {done && <Check size={11} />} {f.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          <span className="text-xs font-black text-slate-500">{completion.percent}% DONE</span>
          <button onClick={onComplete}
            className="inline-flex items-center gap-2 bg-game-teal text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-game-teal-dark transition-all">
            Complete profile <Check size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
