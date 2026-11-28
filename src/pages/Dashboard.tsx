/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, ClipboardCheck, ExternalLink, FileText, Video as VideoIcon,
  ChevronRight, Bell, BellOff, ArrowRight, PartyPopper,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAll, getWhere } from '../services/dataService';
import { FirestorePdf, FirestorePurchase, FirestoreVideoLecture, FirestoreAnnouncement } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getCompletion, getOffer } from '../lib/offer';
import OfferBanner from '../components/OfferBanner';
import ProfileCompleteModal from '../components/ProfileCompleteModal';

type PdfDoc = FirestorePdf & { id: string };
type VideoDoc = FirestoreVideoLecture & { id: string };
type PurchaseDoc = FirestorePurchase & { id: string };
type AnnDoc = FirestoreAnnouncement & { id: string };

export default function Dashboard() {
  const { student, user } = useAuth();
  const settings = useSiteSettings();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(false);

  const [pdfs, setPdfs] = useState<PdfDoc[]>([]);
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [anns, setAnns] = useState<AnnDoc[]>([]);

  const completion = getCompletion(student);
  const offer = getOffer(student);

  useEffect(() => {
    let on = true;
    getAll<FirestorePdf>('pdfs').then((d) => on && setPdfs(d));
    getAll<FirestoreVideoLecture>('videoLectures').then((d) => on && setVideos(d));
    getAll<FirestoreAnnouncement>('announcements').then((d) => on && setAnns(d.filter((a) => a.active === true)));
    return () => { on = false; };
  }, []);

  useEffect(() => {
    let on = true;
    if (!user) return;
    getWhere<FirestorePurchase>('purchases', 'uid', user.uid).then((d) => on && setPurchases(d.filter((p) => p.status === 'Success')));
    return () => { on = false; };
  }, [user]);

  // Show the first-login pop-up once per session while the profile is incomplete.
  useEffect(() => {
    if (!student) return;
    if (completion.isComplete) return;
    if (sessionStorage.getItem('gameProfilePopupShown')) return;
    sessionStorage.setItem('gameProfilePopupShown', '1');
    const t = setTimeout(() => setShowModal(true), 600);
    return () => clearTimeout(t);
  }, [student, completion.isComplete]);

  const ownedIds = useMemo(() => new Set(purchases.map((p) => p.pdfId).filter(Boolean)), [purchases]);
  const ownedPdfs = useMemo(() => pdfs.filter((p) => ownedIds.has(p.id)), [pdfs, ownedIds]);

  // Free picks, personalised by goal once the profile is complete.
  const goal = student?.examGoal || '';
  const freePdfs = useMemo(() => pdfs.filter((p) => p.isFree === true), [pdfs]);
  const freePicks = useMemo(() => {
    const items: { id: string; title: string; sub: string; kind: 'pdf' | 'video'; to: string }[] = [
      ...freePdfs.map((p) => ({ id: p.id, title: p.title, sub: `Free PDF · ${p.category || p.examTag || 'Notes'}`, kind: 'pdf' as const, to: `/library/${p.id}` })),
      ...videos.slice(0, 6).map((v) => ({ id: v.id, title: v.title, sub: `Free video · ${v.subtitle || v.tag || 'Lesson'}`, kind: 'video' as const, to: `/free` })),
    ];
    if (completion.isComplete && goal) {
      const g = goal.toLowerCase();
      items.sort((a, b) => Number((b.sub).toLowerCase().includes(g)) - Number((a.sub).toLowerCase().includes(g)));
    }
    return items.slice(0, 3);
  }, [freePdfs, videos, completion.isComplete, goal]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome back, {student?.name || 'Student'}</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Your learning, purchases and offers in one place.</p>
        </div>
        <Link to="/profile" className="flex items-center gap-3 bg-white p-2 pr-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shrink-0">
          <div className="relative w-10 h-10">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(completion.percent / 100) * 100.5} 100.5`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">{completion.percent}%</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-tight">{student?.name || 'Student'}</p>
            <p className="text-[10px] text-slate-400 font-bold">{goal ? `Goal: ${goal}` : 'Set your goal'}</p>
          </div>
        </Link>
      </section>

      {/* Offer banner (locked / live / hidden) */}
      <OfferBanner
        offerPercent={settings.offerPercent}
        liveAppLink={settings.liveAppLink}
        couponCode={settings.offerCouponCode}
        onComplete={() => setShowModal(true)}
      />

      {/* The two Explore blocks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <a href={settings.liveAppLink} target="_blank" rel="noopener noreferrer"
          className="card-solid relative overflow-hidden bg-gradient-to-br from-game-teal to-game-teal-dark text-white p-7 group card-hover">
          <PlayCircle size={120} className="absolute -right-4 -bottom-6 text-white/5" />
          <span className="label-caps !text-[9px] !text-game-gold">Video Courses · Live + Recorded</span>
          <h3 className="text-2xl font-black mt-2">Explore Courses</h3>
          <p className="text-sm text-white/70 mt-1 max-w-xs relative z-10">Browse all GAME courses and enrol on the GAME Live App.</p>
          <span className="relative z-10 inline-flex items-center gap-2 bg-game-gold text-slate-900 px-5 py-2.5 rounded-xl font-black text-sm mt-5">Open GAME Live App <ExternalLink size={15} /></span>
        </a>
        <a href={settings.testSeriesLink} target="_blank" rel="noopener noreferrer"
          className="card-solid relative overflow-hidden bg-game-gold text-slate-900 p-7 group card-hover">
          <ClipboardCheck size={120} className="absolute -right-4 -bottom-6 text-slate-900/5" />
          <span className="label-caps !text-[9px] !text-slate-700">Practice · Test Series</span>
          <h3 className="text-2xl font-black mt-2">Explore Test Series</h3>
          <p className="text-sm text-slate-800/80 mt-1 max-w-xs relative z-10">Buy and attempt exam-wise tests on the GAME Test Series Portal.</p>
          <span className="relative z-10 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-sm mt-5">Open Test Series Portal <ExternalLink size={15} /></span>
        </a>
      </section>

      {/* Previews: My Resources + Free Library */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* My Resources preview */}
        <div className="card-solid p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900">My Resources</h3>
              {ownedPdfs.length > 0 && <span className="label-caps !text-[8px]">{Math.min(4, ownedPdfs.length)} of {ownedPdfs.length} shown</span>}
            </div>
            <Link to="/my-resources" className="text-xs font-black text-game-teal hover:underline inline-flex items-center gap-1">Open My Resources <ArrowRight size={13} /></Link>
          </div>
          {ownedPdfs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Nothing purchased yet. Your notes, videos and test series will show here.</p>
          ) : (
            <div className="space-y-2">
              {ownedPdfs.slice(0, 4).map((p) => (
                <Link key={p.id} to={`/library/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all group">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><FileText size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">PDF · {p.examTag || p.category || 'Notes'}</p>
                  </div>
                  <span className="text-xs font-black text-game-teal">Open</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Free Library preview */}
        <div className="card-solid p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-slate-900">Free Library</h3>
            <Link to="/free" className="text-xs font-black text-game-teal hover:underline inline-flex items-center gap-1">Browse all <ArrowRight size={13} /></Link>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mb-3">
            {completion.isComplete && goal ? `Picked for ${goal}` : 'Complete profile to personalise'}
          </p>
          {freePicks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Free material will appear here.</p>
          ) : (
            <div className="space-y-2">
              {freePicks.map((f) => (
                <Link key={f.kind + f.id} to={f.to} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{f.kind === 'video' ? <VideoIcon size={16} /> : <FileText size={16} />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{f.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{f.sub}</p>
                  </div>
                  <span className="text-xs font-black text-game-teal">{f.kind === 'video' ? 'Watch' : 'Open'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Notices */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Bell size={18} className="text-game-teal" /><h3 className="font-black text-slate-900">Notices</h3></div>
        </div>
        {anns.length === 0 ? (
          <div className="card-solid p-8 flex flex-col items-center text-slate-400"><BellOff size={28} className="opacity-30 mb-2" /><p className="text-sm font-bold">No notices right now</p></div>
        ) : (
          <div className="card-solid divide-y divide-slate-50">
            {anns.slice(0, 4).map((a) => (
              <div key={a.id} className="p-4 flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-game-gold shrink-0" />
                <div><p className="text-sm font-bold text-slate-900">{a.title}</p><p className="text-xs text-slate-500 mt-0.5">{a.message}</p><p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">{a.date}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <ProfileCompleteModal offerPercent={settings.offerPercent} onClose={() => setShowModal(false)}
          onSaved={() => { setToast(true); setTimeout(() => setToast(false), 5000); }} />
      )}

      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-game-teal text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-sm">
          <PartyPopper size={18} className="text-game-gold" /> {settings.offerPercent}% OFF unlocked · 7-day timer started!
        </div>
      )}
    </div>
  );
}
