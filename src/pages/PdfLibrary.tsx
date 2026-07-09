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
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">PDF Study Materials</h2>
          <p className="text-slate-500">Curated notes by top GATE & ESE educators</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search topics or exams..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal transition-all card-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Free', 'Paid', 'My PDFs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-game-teal text-white shadow-md shadow-game-teal/20' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPdfs.map((pdf) => (
            <div key={pdf.id}>
              <PdfCard pdf={pdf} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BookOpen size={48} className="mb-4 opacity-20" />
          <p className="font-medium text-lg">No PDFs found for your selection</p>
          <button onClick={() => {setActiveTab('All'); setSearchQuery('');}} className="text-game-teal font-bold mt-2 hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
}
