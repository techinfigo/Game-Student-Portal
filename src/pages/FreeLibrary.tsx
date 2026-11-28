/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, PlayCircle, ClipboardList, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAll } from '../services/dataService';
import { FirestorePdf, FirestoreVideoLecture, FirestoreResource } from '../types';

type Kind = 'pdf' | 'video' | 'assignment';
interface Item {
  id: string;
  title: string;
  sub: string;
  kind: Kind;
  text: string; // searchable haystack (title + tags)
  to?: string; // internal
  href?: string; // external
  action: string;
}

const TABS = ['For my goal', 'PDFs', 'Videos', 'Assignments', 'Strategy', 'All exams'] as const;
type Tab = typeof TABS[number];

function videoLink(v: FirestoreVideoLecture): string {
  if (v.youtubeUrl) return v.youtubeUrl;
  if (v.videoId) return `https://www.youtube.com/watch?v=${v.videoId}`;
  return '#';
}

export default function FreeLibrary() {
  const { student } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('For my goal');
  const [q, setQ] = useState('');

  const goal = student?.examGoal || '';

  useEffect(() => {
    let on = true;
    Promise.all([
      getAll<FirestorePdf>('pdfs'),
      getAll<FirestoreVideoLecture>('videoLectures'),
      getAll<FirestoreResource>('resources'),
    ]).then(([pdfs, videos, resources]) => {
      if (!on) return;
      const list: Item[] = [];
      pdfs.filter((p) => p.isFree === true).forEach((p) =>
        list.push({ id: p.id, title: p.title, sub: `Free PDF · ${p.category || p.examTag || 'Notes'}`, kind: 'pdf', text: `${p.title} ${p.category || ''} ${p.examTag || ''}`.toLowerCase(), to: `/library/${p.id}`, action: 'Access free' }));
      videos.forEach((v) =>
        list.push({ id: v.id, title: v.title, sub: `Free video · ${v.subtitle || v.tag || 'Lesson'}`, kind: 'video', text: `${v.title} ${v.subtitle || ''} ${v.tag || ''}`.toLowerCase(), href: videoLink(v), action: 'Watch' }));
      resources.forEach((r) =>
        list.push({ id: r.id, title: r.title, sub: `Free · ${r.category || r.resourceKind || 'Assignment'}`, kind: 'assignment', text: `${r.title} ${r.category || ''} ${r.resourceKind || ''}`.toLowerCase(), href: r.fileOrLink, action: 'Access free' }));
      setItems(list);
      setLoading(false);
    });
    return () => { on = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (tab === 'PDFs') list = list.filter((i) => i.kind === 'pdf');
    else if (tab === 'Videos') list = list.filter((i) => i.kind === 'video');
    else if (tab === 'Assignments') list = list.filter((i) => i.kind === 'assignment' || i.text.includes('assignment'));
    else if (tab === 'Strategy') list = list.filter((i) => i.text.includes('strategy') || i.text.includes('tips') || i.text.includes('crack'));
    else if (tab === 'For my goal' && goal) {
      const g = goal.toLowerCase().split(/[\s/]+/).filter(Boolean);
      const forGoal = list.filter((i) => g.some((w) => i.text.includes(w)));
      // No free items for the goal → fall back to All exams.
      if (forGoal.length > 0) list = forGoal;
    }
    if (q.trim()) list = list.filter((i) => i.text.includes(q.trim().toLowerCase()));
    return list;
  }, [items, tab, q, goal]);

  const icon = (k: Kind) => k === 'video' ? <PlayCircle size={26} /> : k === 'assignment' ? <ClipboardList size={26} /> : <FileText size={26} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Free Library</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Free study material, sorted for your goal. Nothing here is repeated in My Resources.</p>
      </div>

      {/* Goal strip */}
      <div className="card-solid p-4 flex items-center justify-between gap-3 bg-game-teal/5 border-game-teal/10">
        <div className="flex items-center gap-3">
          <Star size={18} className="text-game-gold shrink-0" />
          <div>
            <p className="text-sm font-black text-slate-900">Showing material for: {goal ? `${goal}${student?.branch ? ` · ${student.branch}` : ''}` : 'All exams'}</p>
            <p className="text-[11px] text-slate-500">Change your branch or goal in Profile and this list re-sorts instantly.</p>
          </div>
        </div>
        <Link to="/profile" className="btn-secondary !py-2 !px-4 !text-xs shrink-0">Change goal</Link>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all inline-flex items-center gap-1 ${tab === t ? 'bg-game-teal text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
              {t === 'For my goal' && <Sparkles size={12} />}{t}
            </button>
          ))}
        </div>
        <div className="relative lg:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search free material"
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-medium focus:border-game-teal outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-solid p-12 text-center text-slate-400"><p className="font-bold text-slate-900">No free material here yet</p><p className="text-sm mt-1">Try another tab or clear the search.</p></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((i) => {
            const body = (
              <>
                <div className="h-24 bg-gradient-to-br from-slate-800 to-game-teal-dark flex items-center justify-center text-white/90">{icon(i.kind)}</div>
                <div className="p-3.5 flex flex-col flex-1">
                  <span className="label-caps !text-[8px] !text-game-gold">Free</span>
                  <p className="font-bold text-slate-900 text-sm mt-1 leading-tight flex-1">{i.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{i.sub}</p>
                  <span className="mt-3 w-full text-center bg-game-teal/5 text-game-teal font-black text-xs py-2.5 rounded-xl">{i.action}</span>
                </div>
              </>
            );
            return i.to
              ? <Link key={i.kind + i.id} to={i.to} className="card-solid overflow-hidden flex flex-col card-hover">{body}</Link>
              : <a key={i.kind + i.id} href={i.href} target="_blank" rel="noopener noreferrer" className="card-solid overflow-hidden flex flex-col card-hover">{body}</a>;
          })}
        </div>
      )}
    </div>
  );
}
