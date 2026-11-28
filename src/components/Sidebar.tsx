/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  User,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useBranding } from '../hooks/useBranding';
import { useAuth } from '../context/AuthContext';
import { getWhere } from '../services/dataService';
import { FirestorePurchase } from '../types';

// Every item lives in exactly one place (the redesign's core rule).
const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'My Resources', path: '/my-resources', icon: FolderOpen, badge: 'owned' as const },
  { name: 'Free Library', path: '/free', icon: BookOpen, tag: 'FREE' as const },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  const { logoUrl } = useBranding();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [ownedCount, setOwnedCount] = useState<number | null>(null);

  // Sidebar badge on My Resources = number of items the student owns.
  useEffect(() => {
    let on = true;
    if (!user) { setOwnedCount(null); return; }
    getWhere<FirestorePurchase>('purchases', 'uid', user.uid).then((rows) => {
      if (on) setOwnedCount(rows.filter((r) => r.status === 'Success').length);
    });
    return () => { on = false; };
  }, [user]);
  // Remember which URL failed rather than a bare flag, so a later branding
  // update gets a fresh attempt instead of inheriting the previous failure.
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  // Clicking the logo takes the student back to the main website home page
  // (one click), instead of the portal's own dashboard route. Hardcoded to the
  // branded domain on purpose — VITE_WEBSITE_API_URL points at the raw Vercel
  // deployment URL, which we don't want showing in the address bar.
  const websiteUrl = 'https://www.gameacademy.in';

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
        <a href={websiteUrl} aria-label="Go to GAME Academy website home" className="w-full h-12 flex items-center justify-center">
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
        </a>
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
            <span className="text-sm tracking-tight flex-1">{item.name}</span>
            {item.badge === 'owned' && ownedCount != null && ownedCount > 0 && (
              <span className="text-[10px] font-black bg-white/10 text-white px-1.5 py-0.5 rounded-md min-w-[20px] text-center">{ownedCount}</span>
            )}
            {item.tag === 'FREE' && (
              <span className="text-[8px] font-black tracking-widest bg-game-gold/20 text-game-gold px-1.5 py-0.5 rounded">FREE</span>
            )}
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
