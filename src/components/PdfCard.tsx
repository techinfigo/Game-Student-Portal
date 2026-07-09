/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { PdfItem } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface PdfCardProps {
  pdf: PdfItem;
}

const PdfCard: React.FC<PdfCardProps> = ({ pdf }) => {
  const canRead = pdf.isFree || pdf.isOwned;

  return (
    <div className="card-solid flex flex-col h-full group card-hover cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-slate-100 rounded-t-xl border-b border-slate-100">
        <img 
          src={pdf.thumbnail} 
          alt={pdf.title} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!canRead ? 'grayscale opacity-40' : ''}`} 
        />
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">
            {pdf.examTag}
          </div>
          {pdf.isFree && (
            <div className="bg-game-gold/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[8px] font-black text-game-teal uppercase tracking-widest border border-game-gold/20">
              Free
            </div>
          )}
        </div>

        {!canRead && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 p-2 rounded-full shadow-lg border border-slate-100">
              <Lock size={16} className="text-slate-400" />
            </div>
          </div>
        )}
        
        {pdf.isOwned && (
          <div className="absolute top-2 right-2 bg-game-teal text-white px-1.5 py-0.5 rounded shadow-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-game-teal-dark/20">
            <CheckCircle size={8} className="stroke-[3px]" />
            Owned
          </div>
        )}
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-[13px] leading-tight mb-1.5 group-hover:text-game-teal transition-colors line-clamp-2">
          {pdf.title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="label-caps !text-[7px]">{pdf.pageCount} Pages</span>
          <span className="h-0.5 w-0.5 bg-slate-200 rounded-full" />
          <span className="label-caps !text-[7px]">Notes</span>
        </div>
        
        <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
          {!canRead ? (
            <>
              <div className="flex flex-col">
                <span className="label-caps !text-[6px] mb-0.5">Price</span>
                <span className="text-sm font-black text-slate-900">₹{pdf.price}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: connect to Razorpay for payment
                  alert(`Starting purchase for ₹${pdf.price}.`);
                }}
                className="btn-primary !px-2.5 !py-1 !text-[9px] !rounded-md"
              >
                Buy Now
              </button>
            </>
          ) : (
            <Link 
              to={`/library/${pdf.id}`} 
              className="w-full text-center btn-primary !py-1.5 !text-[9px] !uppercase !tracking-widest !font-black !rounded-md"
            >
              Read Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfCard;
