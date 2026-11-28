/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Lock, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAll, getWhere } from '../services/dataService';
import { FirestorePdf, FirestorePurchase } from '../types';
import BuyModal from '../components/BuyModal';
import type { BuyStatus } from '../services/paymentService';

type PdfDoc = FirestorePdf & { id: string };
type PurchaseDoc = FirestorePurchase & { id: string };

const CHIPS = ['All', 'Notes & PDFs', 'Videos', 'Formula Sheets', 'Question Bank', 'Test Series'] as const;
type Chip = typeof CHIPS[number];

// Map a PDF's category/title to a resource kind, so chips work without fake data.
function kindOf(p: PdfDoc): Chip {
  const s = `${p.category || ''} ${p.title || ''}`.toLowerCase();
  if (s.includes('formula')) return 'Formula Sheets';
  if (s.includes('question') || s.includes('pyq') || s.includes('bank')) return 'Question Bank';
  if (s.includes('test series') || s.includes('mock')) return 'Test Series';
  if (s.includes('video')) return 'Videos';
  return 'Notes & PDFs';
}

export default function MyResources() {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<PdfDoc[]>([]);
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [extraOwned, setExtraOwned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState<Chip>('All');
  const [buyTarget, setBuyTarget] = useState<PdfDoc | null>(null);
  const [toast, setToast] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoBuyDone, setAutoBuyDone] = useState(false);

  useEffect(() => {
    let on = true;
    getAll<FirestorePdf>('pdfs').then((d) => { if (on) { setPdfs(d); setLoading(false); } });
    return () => { on = false; };
  }, []);
  useEffect(() => {
    let on = true;
    if (!user) return;
    getWhere<FirestorePurchase>('purchases', 'uid', user.uid).then((d) => on && setPurchases(d.filter((p) => p.status === 'Success')));
    return () => { on = false; };
  }, [user]);

  const ownedIds = useMemo(() => {
    const s = new Set(purchases.map((p) => p.pdfId).filter(Boolean));
    extraOwned.forEach((id) => s.add(id));
    return s;
  }, [purchases, extraOwned]);

  // Deep link from the website "Get Access": ?buy=<pdfId> opens the buy dialog.
  useEffect(() => {
    if (autoBuyDone || pdfs.length === 0) return;
    const buyId = searchParams.get('buy');
    if (buyId) {
      const target = pdfs.find((p) => p.id === buyId);
      if (target && !ownedIds.has(target.id) && target.isFree !== true) setBuyTarget(target);
      searchParams.delete('buy');
      setSearchParams(searchParams, { replace: true });
    }
    setAutoBuyDone(true);
  }, [searchParams, pdfs, ownedIds, autoBuyDone, setSearchParams]);

  const onBuyResult = (status: BuyStatus) => {
    if (buyTarget && (status === 'paid' || status === 'already_owned')) {
      setExtraOwned((prev) => new Set(prev).add(buyTarget.id));
      if (status === 'paid') { setToast('Unlocked! It\'s now in My Resources.'); setTimeout(() => setToast(''), 4000); }
    }
    setBuyTarget(null);
  };
  const owned = useMemo(() => pdfs.filter((p) => ownedIds.has(p.id)), [pdfs, ownedIds]);
  // Not purchased = paid PDFs the student doesn't own yet (what they can add next).
  const locked = useMemo(() => pdfs.filter((p) => p.isFree !== true && !ownedIds.has(p.id)), [pdfs, ownedIds]);

  const match = (p: PdfDoc) => chip === 'All' || kindOf(p) === chip;
  const ownedF = owned.filter(match);
  const lockedF = locked.filter(match);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Resources</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Everything you have purchased. Locked items are what you can add next.</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => setChip(c)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${chip === c ? 'bg-game-teal text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal" /></div>
      ) : (
        <>
          {/* Owned */}
          {ownedF.length > 0 && (
            <section>
              <p className="label-caps !text-[9px] mb-3">Purchased · {ownedF.length} item{ownedF.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedF.map((p) => (
                  <div key={p.id} className="card-solid overflow-hidden flex flex-col">
                    <div className="h-28 bg-gradient-to-br from-game-teal to-game-teal-dark flex items-center justify-center text-white/90"><FileText size={32} /></div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="label-caps !text-[8px] !text-game-teal">Owned</span>
                      <p className="font-bold text-slate-900 text-sm mt-1 leading-tight flex-1">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">PDF · {p.pageCount ? `${p.pageCount} pages` : (p.examTag || p.category || 'Notes')}</p>
                      <Link to={`/library/${p.id}`} className="mt-3 w-full text-center bg-slate-900 text-white font-black text-sm py-2.5 rounded-xl hover:bg-slate-800 transition-all">Open</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {ownedF.length === 0 && (
            <div className="card-solid p-12 flex flex-col items-center text-center">
              <div className="bg-slate-50 p-5 rounded-full mb-4"><FolderOpen size={36} className="text-slate-200" /></div>
              <h3 className="font-black text-slate-900">Nothing purchased yet{chip !== 'All' ? ` in ${chip}` : ''}</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Pick something below to add next, or explore courses on the GAME Live App.</p>
            </div>
          )}

          {/* Not purchased / add next */}
          {lockedF.length > 0 && (
            <section>
              <p className="label-caps !text-[9px] mb-3">Not purchased yet · Add next</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {lockedF.slice(0, 8).map((p) => (
                  <div key={p.id} className="card-solid overflow-hidden flex flex-col opacity-95">
                    <div className="h-24 bg-slate-100 flex items-center justify-center text-slate-300 relative">
                      <FileText size={28} />
                      <span className="absolute top-2 right-2 bg-slate-900/70 text-white p-1 rounded-md"><Lock size={12} /></span>
                    </div>
                    <div className="p-3.5 flex flex-col flex-1">
                      <span className="label-caps !text-[8px] !text-slate-400">Not purchased</span>
                      <p className="font-bold text-slate-900 text-sm mt-1 leading-tight flex-1">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{kindOf(p)}</p>
                      <button onClick={() => setBuyTarget(p)}
                        className="mt-3 w-full text-center bg-game-gold text-slate-900 font-black text-xs py-2.5 rounded-xl hover:brightness-105 transition-all">
                        Unlock{typeof p.price === 'number' ? ` · ₹${p.price}` : ''}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {buyTarget && (
        <BuyModal pdf={{ id: buyTarget.id, title: buyTarget.title, price: buyTarget.price }}
          onClose={() => setBuyTarget(null)} onResult={onBuyResult} />
      )}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-game-teal text-white px-5 py-3 rounded-2xl shadow-2xl font-black text-sm">{toast}</div>
      )}
    </div>
  );
}
