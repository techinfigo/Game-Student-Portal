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
  GraduationCap
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'PDF Library', path: '/library', icon: BookOpen },
  { name: 'Free Videos', path: '/videos', icon: Video },
  { name: 'My Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  return (
    <div className="hidden lg:flex flex-col w-64 bg-game-teal text-white h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-game-gold p-2 rounded-xl">
          <GraduationCap size={28} className="text-game-teal" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">GAME</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-game-gold font-semibold -mt-1">Academy</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-game-gold text-game-teal font-semibold' 
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => { /* TODO: logout logic */ }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
