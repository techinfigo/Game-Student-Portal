/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { mockPdfs } from '../data/mockData';
import { motion } from 'motion/react';
import PdfCard from '../components/PdfCard';

export default function PdfLibrary() {
  const [activeTab, setActiveTab] = useState<'All' | 'Free' | 'Paid' | 'My PDFs'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPdfs = mockPdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         pdf.examTag.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Free') return matchesSearch && pdf.isFree;
    if (activeTab === 'Paid') return matchesSearch && !pdf.isFree;
    if (activeTab === 'My PDFs') return matchesSearch && (pdf.isFree || pdf.isOwned);
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
        {['All', 'Free', 'Paid', 'My PDFs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
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
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPdfs.map((pdf) => (
            <PdfCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center">
          <div className="bg-slate-100 p-6 rounded-full mb-6">
            <BookOpen size={48} className="opacity-20" />
          </div>
          <p className="font-bold text-slate-900">No materials found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filters.</p>
          <button onClick={() => {setActiveTab('All'); setSearchQuery('');}} className="btn-secondary mt-8">Reset filters</button>
        </div>
      )}
    </div>
  );
}
