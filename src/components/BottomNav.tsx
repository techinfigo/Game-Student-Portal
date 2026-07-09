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
  User 
} from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'PDFs', path: '/library', icon: BookOpen },
  { name: 'Videos', path: '/videos', icon: Video },
  { name: 'Orders', path: '/purchases', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function BottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive ? 'text-game-teal' : 'text-slate-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
