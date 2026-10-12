/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { getAll, getWhere } from '../services/dataService';
import { FirestorePdf, FirestorePurchase } from '../types';
import PdfCard from '../components/PdfCard';
import { buyPdf } from '../services/paymentService';
import { auth } from '../firebase';

type PdfDoc = FirestorePdf & { id: string };

export default function PdfLibrary() {
  const [pdfs, setPdfs] = useState<PdfDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Free' | 'Paid'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAll<FirestorePdf>('pdfs').then((data) => {
      if (isMounted) {
        setPdfs(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Which paid PDFs this student already owns (so they show "Read", not "Buy").
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getWhere<FirestorePurchase>('purchases', 'uid', uid)
      .then((rows) => setOwnedIds(new Set(rows.map((r) => r.pdfId).filter(Boolean))))
      .catch(() => {});
  }, []);

  const handleBuy = async (pdf: PdfDoc) => {
    if (busyId) return;
    setBusyId(pdf.id);
    try {
      const result = await buyPdf({ id: pdf.id, title: pdf.title });
      if (result === 'paid') {
        setOwnedIds((prev) => new Set(prev).add(pdf.id));
        setToast('Purchased! You can read it now.');
      } else if (result === 'already_owned') {
        setOwnedIds((prev) => new Set(prev).add(pdf.id));
        setToast('You already own this PDF.');
      } else {
        setToast('Payment cancelled.');
      }
    } catch (err: any) {
      setToast(err?.message || 'Payment failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredPdfs = pdfs.filter((pdf) => {
    const matchesSearch =
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pdf.examTag ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pdf.category ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Free') return matchesSearch && pdf.isFree === true;
    if (activeTab === 'Paid') return matchesSearch && pdf.isFree !== true;
    return matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Study Materials</h2>
          <p className="text-slate-500 font-medium">Focused notes for GATE, ESE, and ISRO preparation.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-game-teal transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search materials..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-0 overflow-x-auto scrollbar-hide">
        {(['All', 'Free', 'Paid'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-game-teal text-game-teal'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
        </div>
      ) : filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPdfs.map((pdf) => (
            <PdfCard key={pdf.id} pdf={pdf} owned={ownedIds.has(pdf.id)} busy={busyId === pdf.id} onBuy={() => handleBuy(pdf)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <BookOpen size={48} className="opacity-20" />
          </div>
          <p className="font-bold text-slate-900">No materials found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filters.</p>
          <button onClick={() => { setActiveTab('All'); setSearchQuery(''); }} className="btn-secondary mt-8">Reset filters</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold tracking-wide">
          {toast}
        </div>
      )}
    </div>
  );
}
