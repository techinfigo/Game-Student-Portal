/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Video, ShoppingBag, Bell, ChevronRight, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockStudent, mockAnnouncements } from '../data/mockData';
import { motion } from 'motion/react';

export default function Dashboard() {
  const quickLinks = [
    { name: 'PDF Library', path: '/library', icon: BookOpen },
    { name: 'Free Videos', path: '/videos', icon: Video },
    { name: 'My Purchases', path: '/purchases', icon: ShoppingBag },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {mockStudent.name}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Your learning progress and updates for today.</p>
        </div>
        <Link to="/profile" className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group shadow-sm">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 grayscale-[0.2]">
            <img src={mockStudent.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{mockStudent.name}</p>
            <p className="label-caps !text-[9px]">GATE Aspirant</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform ml-2" />
        </Link>
      </section>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <div className="card-solid p-6 flex items-center gap-5 card-hover group cursor-pointer">
              <div className="p-4 rounded-xl bg-slate-50 text-slate-400 group-hover:text-game-teal group-hover:bg-game-teal/5 transition-all">
                <link.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base">{link.name}</h3>
                <p className="label-caps !text-[9px] mt-0.5">Quick Access</p>
              </div>
              <ChevronRight size={18} className="text-slate-200 group-hover:text-game-teal group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Announcements Section */}
      <section className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-game-teal/10 p-2 rounded-lg">
              <Bell size={20} className="text-game-teal" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Notices</h3>
              <p className="text-xs text-slate-400 font-medium">Important updates from administration</p>
            </div>
          </div>
          <button className="btn-secondary !py-2 !px-4 text-xs">View all</button>
        </div>

        <div className="space-y-4">
          {mockAnnouncements.map((ann) => (
            <div 
              key={ann.id}
              className="card-solid p-6 flex gap-6 hover:border-slate-300 transition-colors"
            >
              <div className={`mt-2 h-2 w-2 rounded-full shrink-0 ${
                ann.type === 'Important' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                ann.type === 'New Batch' ? 'bg-game-teal shadow-[0_0_8px_rgba(13,92,99,0.4)]' : 'bg-slate-300'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-slate-900 text-lg">{ann.title}</h4>
                  <span className={`label-caps !text-[9px] px-2 py-1 rounded-md border ${
                    ann.type === 'Important' ? 'border-red-100 text-red-600 bg-red-50' : 'border-slate-200 text-slate-500 bg-slate-50'
                  }`}>
                    {ann.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{ann.content}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Calendar size={12} className="text-slate-300" />
                  <span className="label-caps !text-[9px]">{ann.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
