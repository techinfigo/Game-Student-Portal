/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, Eye, Clock, X, Search, Youtube } from 'lucide-react';
import { mockVideos } from '../data/mockData';
import { VideoLecture } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function FreeVideos() {
  const [selectedVideo, setSelectedVideo] = useState<VideoLecture | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = mockVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Video Lectures</h2>
          <p className="text-slate-500 font-medium">Conceptual sessions for competitive engineering exams.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-game-teal transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search lectures..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <div 
            key={video.id}
            className="card-solid group card-hover cursor-pointer flex flex-col h-full"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video overflow-hidden rounded-t-xl bg-slate-100">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-game-teal text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border border-white/10">
                {video.duration}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="label-caps !text-[7px] text-game-teal bg-game-teal/5 px-1.5 py-0.5 rounded border border-game-teal/10">
                  {video.tag}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-[13px] leading-tight group-hover:text-game-teal transition-colors line-clamp-2 mb-2">{video.title}</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">{video.subtitle}</p>
              
              <div className="mt-auto flex items-center gap-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Eye size={12} className="opacity-60" />
                  <span className="label-caps !text-[8px]">{video.views}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={12} className="opacity-60" />
                  <span className="label-caps !text-[8px]">Recent</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-dark-slate/90 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
              <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Youtube size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm tracking-tight">{selectedVideo.title}</h3>
                    <p className="label-caps !text-[8px] opacity-60">Streaming Live from GAME Academy</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="label-caps !text-[10px] mb-2 text-slate-400">Lesson Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {selectedVideo.subtitle}. Study hard with GAME Academy expert faculty. 
                      Check the study materials section for chapter notes and practice problems related to this session.
                    </p>
                  </div>
                  <button className="btn-primary whitespace-nowrap">View Study Material</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
