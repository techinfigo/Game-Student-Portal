/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Video, ShoppingBag, Bell, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockStudent, mockAnnouncements } from '../data/mockData';
import { motion } from 'motion/react';

export default function Dashboard() {
  const quickLinks = [
    { name: 'PDF Library', path: '/library', icon: BookOpen, color: 'bg-blue-50 text-blue-600', hover: 'hover:bg-blue-100' },
    { name: 'Free Videos', path: '/videos', icon: Video, color: 'bg-purple-50 text-purple-600', hover: 'hover:bg-purple-100' },
    { name: 'My Purchases', path: '/purchases', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', hover: 'hover:bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-game-teal">{mockStudent.name}</span>!
          </h2>
          <p className="text-slate-500 mt-1">Ready for today's engineering challenge?</p>
        </div>
        <Link to="/profile" className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl card-shadow border border-slate-100 hover:border-game-teal transition-all group">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
            <img src={mockStudent.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{mockStudent.name}</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Member</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform ml-auto" />
        </Link>
      </section>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <Link key={link.path} to={link.path}>
            <motion.div 
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl card-shadow flex items-center gap-4 transition-all bg-white border border-transparent hover:border-game-teal/20`}
            >
              <div className={`p-4 rounded-2xl ${link.color}`}>
                <link.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{link.name}</h3>
                <p className="text-xs text-slate-500">Access your resources</p>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Announcements Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell size={20} className="text-game-teal" />
            Latest Notices
          </h3>
          <button className="text-game-teal font-semibold text-sm hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {mockAnnouncements.map((ann, i) => (
            <motion.div 
              key={ann.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-3xl border border-slate-100 card-shadow flex gap-4"
            >
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                ann.type === 'Important' ? 'bg-red-500' : 
                ann.type === 'New Batch' ? 'bg-green-500' : 'bg-game-gold'
              }`} />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-slate-900">{ann.title}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{ann.type}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                <span className="text-[10px] text-slate-400 font-bold mt-2 inline-block uppercase tracking-wider">{ann.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
