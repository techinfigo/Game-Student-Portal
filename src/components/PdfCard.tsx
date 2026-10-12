/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, BookOpen } from 'lucide-react';
import { FirestorePdf } from '../types';
import { Link } from 'react-router-dom';

interface PdfCardProps {
  pdf: FirestorePdf & { id: string };
  onBuy: () => void;
  owned?: boolean;
  busy?: boolean;
}

const PdfCard: React.FC<PdfCardProps> = ({ pdf, onBuy, owned = false, busy = false }) => {
  const isFree = pdf.isFree === true;
  const accessible = isFree || owned;

  return (
    <div className="card-solid flex flex-col h-full group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-t-xl border-b border-slate-100">
        {pdf.thumbnail ? (
          <img
            src={pdf.thumbnail}
            alt={pdf.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${!accessible ? 'grayscale opacity-40' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-slate-300" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {pdf.examTag && (
            <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">
              {pdf.examTag}
            </div>
          )}
          {isFree ? (
            <div className="bg-game-gold/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-game-teal uppercase tracking-widest border border-game-gold/20">
              Free
            </div>
          ) : owned ? (
            <div className="bg-game-teal/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-white uppercase tracking-widest border border-game-teal/20">
              Owned
            </div>
          ) : (
            <div className="bg-slate-900/85 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-white uppercase tracking-widest border border-slate-900/20">
              ₹{pdf.price ?? '—'}
            </div>
          )}
        </div>

        {!accessible && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 p-2 rounded-full shadow-lg border border-slate-100">
              <Lock size={16} className="text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-[13px] leading-tight mb-1.5 group-hover:text-game-teal transition-colors line-clamp-2">
          {pdf.title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          {pdf.pageCount ? <span className="label-caps !text-[7px]">{pdf.pageCount} Pages</span> : null}
          {pdf.category && (
            <>
              <span className="h-0.5 w-0.5 bg-slate-200 rounded-full" />
              <span className="label-caps !text-[7px]">{pdf.category}</span>
            </>
          )}
        </div>

        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
          {!accessible ? (
            <>
              <div className="flex flex-col">
                <span className="label-caps !text-[6px] mb-0.5">Price</span>
                <span className="text-sm font-black text-slate-900">₹{pdf.price ?? '—'}</span>
              </div>
              <button
                onClick={onBuy}
                disabled={busy}
                className="btn-primary !px-2.5 !py-1 !text-[9px] !rounded-md disabled:opacity-60"
              >
                {busy ? 'Processing…' : 'Buy to Read'}
              </button>
            </>
          ) : (
            <Link
              to={`/library/${pdf.id}`}
              className="w-full text-center btn-primary !py-1.5 !text-[9px] !uppercase !tracking-widest !font-black !rounded-md"
            >
              Read
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfCard;
