/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft, MoreVertical } from 'lucide-react';
import { mockPdfs, mockStudent } from '../data/mockData';
import { motion } from 'motion/react';

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdf = mockPdfs.find(p => p.id === id);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  if (!pdf) return <div>PDF not found</div>;

  return (
    <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{pdf.title}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">GAME Academy Reader</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-1.5 rounded-full">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="disabled:opacity-30 p-1 hover:text-game-gold transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-mono font-bold w-16 text-center">
              {currentPage} / {pdf.pageCount}
            </span>
            <button 
              disabled={currentPage === pdf.pageCount}
              onClick={() => setCurrentPage(prev => Math.min(pdf.pageCount, prev + 1))}
              className="disabled:opacity-30 p-1 hover:text-game-gold transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-700/50 px-2 rounded-full">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-2 hover:text-game-gold transition-colors">
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-bold w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 hover:text-game-gold transition-colors">
              <ZoomIn size={18} />
            </button>
          </div>
        </div>

        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <motion.div 
          animate={{ scale: zoom / 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-slate-200 w-full max-w-4xl aspect-[1/1.41] shadow-2xl rounded-sm overflow-hidden flex items-center justify-center select-none"
        >
          {/* Mock PDF Content */}
          <div className="text-slate-400 flex flex-col items-center gap-4">
            <div className="w-16 h-1 w-full bg-slate-300 absolute top-0" />
            <p className="text-lg font-bold tracking-[0.2em] uppercase opacity-20">Secure PDF Content Layer</p>
            <p className="text-sm opacity-20 font-mono">Page {currentPage} Data Loading...</p>
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 pointer-events-none overflow-hidden rotate-[-30deg] scale-150 opacity-[0.03]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="text-black font-black text-4xl whitespace-nowrap p-10 flex flex-col">
                <span>{mockStudent.name}</span>
                <span>{mockStudent.phone}</span>
              </div>
            ))}
          </div>

          {/* Secure Overlay to prevent simple right-click save */}
          <div className="absolute inset-0 z-10" />
        </motion.div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden bg-slate-800 p-4 border-t border-slate-700 flex items-center justify-between text-white">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          className="flex items-center gap-1 font-bold text-sm disabled:opacity-30"
        >
          <ChevronLeft size={20} /> Prev
        </button>
        <span className="text-xs font-bold font-mono">Page {currentPage} of {pdf.pageCount}</span>
        <button 
          disabled={currentPage === pdf.pageCount}
          onClick={() => setCurrentPage(prev => Math.min(pdf.pageCount, prev + 1))}
          className="flex items-center gap-1 font-bold text-sm disabled:opacity-30"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
