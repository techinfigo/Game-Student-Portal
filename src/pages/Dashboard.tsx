/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BookOpen, Video, ShoppingBag, Bell, ChevronRight, User, Calendar, BellOff, GraduationCap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAll, getDocById } from '../services/dataService';
import { FirestoreAnnouncement, FirestoreSiteSettings } from '../types';
import { getInitials } from '../utils';
import { motion } from 'motion/react';

type AnnouncementDoc = FirestoreAnnouncement & { id: string };

const DEFAULT_CLASSPLUS_LINK = 'https://web.classplusapp.com/login';

export default function Dashboard() {
  const { student } = useAuth();
  const studentName = student?.name || 'Student';
  const [avatarError, setAvatarError] = useState(false);
  const [classplusLink, setClassplusLink] = useState(DEFAULT_CLASSPLUS_LINK);

  const quickLinks = [
    { name: 'PDF Library', path: '/library', icon: BookOpen },
    { name: 'Free Videos', path: '/videos', icon: Video },
    { name: 'My Purchases', path: '/purchases', icon: ShoppingBag },
  ];

  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAll<FirestoreAnnouncement>('announcements').then((data) => {
      if (isMounted) {
        setAnnouncements(data.filter((a) => a.active === true));
        setIsLoadingAnnouncements(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getDocById<FirestoreSiteSettings>('settings', 'site').then((data) => {
      if (isMounted && data?.classplusPortalLink) {
        setClassplusLink(data.classplusPortalLink);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {studentName}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Your learning progress and updates for today.</p>
        </div>
        <Link to="/profile" className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group shadow-sm">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 grayscale-[0.2] flex items-center justify-center">
            {student?.avatar && !avatarError ? (
              <img
                src={student.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : student?.name ? (
              <div className="w-full h-full flex items-center justify-center bg-game-teal/10 text-game-teal font-black text-xs">
                {getInitials(student.name)}
              </div>
            ) : (
              <User size={18} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">{studentName}</p>
            <p className="label-caps !text-[9px]">GATE Aspirant</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform ml-2" />
        </Link>
      </section>

      {/* My Courses - Classplus */}
      <section>
        <a
          href={classplusLink}
          target="_blank"
          rel="noopener noreferrer"
          className="card-solid relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 md:p-10 bg-gradient-to-br from-game-teal to-game-teal-dark text-white group card-hover"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/10 p-2.5 rounded-lg">
                <GraduationCap size={22} className="text-game-gold" />
              </div>
              <h3 className="text-xl font-black tracking-tight">My Courses</h3>
            </div>
            <p className="text-white/70 text-sm font-medium max-w-md">
              Access your enrolled video courses on Classplus
            </p>
          </div>
          <span className="relative z-10 shrink-0 inline-flex items-center gap-2 bg-game-gold text-slate-900 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all group-hover:brightness-110 active:scale-[0.98]">
            Open Classplus
            <ExternalLink size={16} />
          </span>
        </a>
        <p className="text-xs text-slate-400 font-medium mt-3 px-1">
          Your purchased video courses are hosted on Classplus.
        </p>
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

        {isLoadingAnnouncements ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center card-solid">
            <div className="bg-slate-100 p-5 rounded-full mb-4">
              <BellOff size={36} className="opacity-20" />
            </div>
            <p className="font-bold text-slate-900">No announcements right now</p>
            <p className="text-sm mt-1">Check back later for updates from administration.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="card-solid p-6 flex gap-6 hover:border-slate-300 transition-colors"
              >
                <div className="mt-2 h-2 w-2 rounded-full shrink-0 bg-game-teal shadow-[0_0_8px_rgba(13,92,99,0.4)]" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-slate-900 text-lg">{ann.title}</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{ann.message}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Calendar size={12} className="text-slate-300" />
                    <span className="label-caps !text-[9px]">{ann.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
