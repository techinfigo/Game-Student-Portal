/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft, MoreVertical, ShieldCheck, GraduationCap } from 'lucide-react';
import { mockPdfs, mockStudent } from '../data/mockData';
import { motion } from 'motion/react';

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdf = mockPdfs.find(p => p.id === id);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  if (!pdf) return <div className="p-8 text-center">PDF not found</div>;

  return (
    <div className="fixed inset-0 bg-slate-100 z-[60] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-game-teal">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-black text-sm text-slate-900 truncate max-w-[150px] md:max-w-md tracking-tight">{pdf.title}</h1>
            <p className="label-caps !text-[8px] opacity-70">Student Study Portal</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="disabled:opacity-20 p-1 hover:text-game-teal transition-colors text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-900 min-w-[70px] text-center tracking-widest">
              PAGE {currentPage} / {pdf.pageCount}
            </span>
            <button 
              disabled={currentPage === pdf.pageCount}
              onClick={() => setCurrentPage(prev => Math.min(pdf.pageCount, prev + 1))}
              className="disabled:opacity-20 p-1 hover:text-game-teal transition-colors text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 hover:text-game-teal transition-colors text-slate-400">
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-500 min-w-[35px] text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1.5 hover:text-game-teal transition-colors text-slate-400">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
             <ShieldCheck size={14} className="text-game-teal opacity-50" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure View</span>
           </div>
           <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-300">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-auto p-4 md:p-16 flex justify-center bg-slate-100/30 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="relative bg-white w-full max-w-4xl aspect-[1/1.41] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-200 rounded-sm overflow-hidden flex items-center justify-center select-none"
        >
          {/* Mock PDF Content */}
          <div className="text-slate-100 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <GraduationCap size={32} className="text-slate-200" />
            </div>
            <p className="text-3xl font-black tracking-[0.6em] uppercase pointer-events-none opacity-20">Academy Materials</p>
            <p className="text-xs font-mono tracking-widest opacity-30">End of Page {currentPage}</p>
          </div>

          {/* Faint Diagonal Watermark */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 pointer-events-none overflow-hidden rotate-[-25deg] scale-150 opacity-[0.09]">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="text-black font-black text-3xl whitespace-nowrap p-16 flex flex-col items-center justify-center border border-black/5">
                <span className="opacity-100">{mockStudent.name}</span>
                <span className="text-xl opacity-80 mt-1">{mockStudent.phone}</span>
              </div>
            ))}
          </div>

          {/* Interaction blocker */}
          <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">PAGE {currentPage} / {pdf.pageCount}</span>
        <button 
          disabled={currentPage === pdf.pageCount}
          onClick={() => setCurrentPage(prev => Math.min(pdf.pageCount, prev + 1))}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
