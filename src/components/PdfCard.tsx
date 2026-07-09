/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lock, CheckCircle } from 'lucide-react';
import { PdfItem } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface PdfCardProps {
  pdf: PdfItem;
}

export default function PdfCard({ pdf }: PdfCardProps) {
  const canRead = pdf.isFree || pdf.isOwned;

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="bg-white rounded-3xl overflow-hidden card-shadow border border-slate-100 flex flex-col h-full group"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-game-teal uppercase tracking-wider">
          {pdf.examTag}
        </div>
        {pdf.isOwned && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg">
            <CheckCircle size={10} />
            Owned
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-white text-xs font-medium">{pdf.pageCount} Pages • High Quality</p>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-game-teal transition-colors">{pdf.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{pdf.description}</p>
        
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          {!canRead ? (
            <>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price</p>
                <p className="text-lg font-black text-slate-900">₹{pdf.price}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: connect to Razorpay for payment
                  alert(`Starting purchase for ₹${pdf.price}. (Razorpay UI would open here)`);
                }}
                className="flex items-center gap-2 bg-game-gold text-game-teal px-4 py-2 rounded-xl font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
              >
                <Lock size={14} />
                Buy Now
              </button>
            </>
          ) : (
            <Link 
              to={`/library/${pdf.id}`} 
              className="w-full text-center bg-game-teal text-white py-2.5 rounded-xl font-bold text-sm hover:bg-game-teal/90 active:scale-95 transition-all shadow-lg shadow-game-teal/20"
            >
              Read Now
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
