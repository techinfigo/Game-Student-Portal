/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import { useBranding } from '../hooks/useBranding';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'PDF Library', path: '/library', icon: BookOpen },
  { name: 'Free Videos', path: '/videos', icon: Video },
  { name: 'Free Resources', path: '/resources', icon: FolderOpen },
  { name: 'My Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  const { logoUrl } = useBranding();
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Remember which URL failed rather than a bare flag, so a later branding
  // update gets a fresh attempt instead of inheriting the previous failure.
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  const trimmedLogoUrl = logoUrl.trim();
  // Branding loads async, so logoUrl is empty on first paint. Showing the
  // wordmark then — rather than pointing <img> at a '/logo.png' that may not
  // exist — keeps the sidebar branded instead of blank.
  const showLogoImage = trimmedLogoUrl !== '' && failedLogoUrl !== trimmedLogoUrl;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-white/5 h-screen sticky top-0">
      <div className="p-8 flex justify-center">
        <div className="w-full h-12 flex items-center justify-center">
          {showLogoImage ? (
            <img
              src={trimmedLogoUrl}
              alt="Logo"
              className="h-10 max-h-full w-auto object-contain"
              onError={() => setFailedLogoUrl(trimmedLogoUrl)}
            />
          ) : (
            <span className="text-2xl font-black tracking-[0.3em] text-white uppercase pl-[0.3em]">
              Game
            </span>
          )}
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
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
