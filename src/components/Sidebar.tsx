/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ShoppingBag,
  User,
  LogOut,
  GraduationCap,
  FolderOpen
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'PDF Library', path: '/library', icon: BookOpen },
  { name: 'Free Videos', path: '/videos', icon: Video },
  { name: 'Free Resources', path: '/resources', icon: FolderOpen },
  { name: 'My Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-white/5 h-screen sticky top-0">
      <div className="p-8 flex justify-center">
        <div className="w-full h-12 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="max-h-full w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="h-10 w-full bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center"><span class="text-[10px] font-black text-slate-600 tracking-widest uppercase">Logo Area</span></div>';
              }
            }}
          />
        </div>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-game-teal text-white font-bold shadow-md shadow-game-teal/10' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="text-sm tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={() => { /* TODO: logout logic */ }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
