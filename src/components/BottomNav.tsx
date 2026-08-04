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
  FolderOpen
} from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'PDFs', path: '/library', icon: BookOpen },
  { name: 'Videos', path: '/videos', icon: Video },
  { name: 'Res.', path: '/resources', icon: FolderOpen },
  { name: 'Orders', path: '/purchases', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function BottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-white/5 px-2 py-1 flex justify-between items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-200 flex-1 py-2 ${
              isActive ? 'text-game-teal' : 'text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2 opacity-70'} />
              <span className={`text-[9px] uppercase tracking-wider font-black ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.name}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
