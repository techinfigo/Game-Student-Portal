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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Free Video Lectures</h2>
          <p className="text-slate-500">Master core concepts with our conceptual videos</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search lectures..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal transition-all card-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, i) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl overflow-hidden card-shadow border border-slate-100 group cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-game-gold text-game-teal rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                  <Play size={24} className="ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                {video.duration}
              </div>
              <div className="absolute top-3 left-3 bg-game-teal text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                {video.tag}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 group-hover:text-game-teal transition-colors line-clamp-1">{video.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{video.subtitle}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{video.views} Views</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden card-shadow"
            >
              <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-xl text-red-600">
                    <Youtube size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{selectedVideo.title}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{selectedVideo.tag} Masterclass</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
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
              <div className="p-6 bg-slate-50">
                <p className="text-sm text-slate-600 leading-relaxed">
                  In this session, our expert mentors cover the foundational principles and advanced problem-solving techniques for <span className="font-bold text-game-teal">{selectedVideo.title}</span>. 
                  Don't forget to check the PDF library for accompanying notes!
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">Concept Oriented</span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">PYQ Solved</span>
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">English/Hindi</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
