/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { X, Gift, Check, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  getCompletion,
  EDUCATION_OPTIONS,
  EXAM_GOAL_OPTIONS,
  BRANCH_OPTIONS,
} from '../lib/offer';

interface Props {
  offerPercent: number;
  onClose: () => void;
  onSaved?: () => void; // e.g. fire confetti toast on the dashboard
}

// A pop-up on laptop, a bottom sheet on mobile. Same fields either way.
export default function ProfileCompleteModal({ offerPercent, onClose, onSaved }: Props) {
  const { student, user, refreshStudent } = useAuth();
  const [form, setForm] = useState({
    name: student?.name || '',
    education: student?.education || '',
    branch: student?.branch || '',
    passingYear: student?.passingYear || '',
    examGoal: student?.examGoal || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = student?.phoneNumber || '';
  // Live completion preview as the student fills the chips.
  const preview = getCompletion({ ...(student as any), ...form });
  const years = Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() + 2 - i));

  const chip = (active: boolean) =>
    `px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
      active
        ? 'bg-game-teal text-white border-game-teal'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
    }`;

  const handleSave = async () => {
    if (!user) { onClose(); return; }
    setSaving(true);
    setError(null);
    try {
      const willComplete = preview.isComplete;
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        education: form.education,
        branch: form.branch,
        passingYear: form.passingYear,
        examGoal: form.examGoal,
      };
      // Start the 7-day offer ONCE, the moment the profile first hits 100%.
      if (willComplete && !student?.offerStartedAt) {
        payload.offerStartedAt = Date.now();
      }
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      await refreshStudent();
      onClose();
      if (willComplete && !student?.offerStartedAt) onSaved?.();
    } catch (e) {
      console.error('Failed to save profile:', e);
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel = the reason (hidden on small screens to save space) */}
        <div className="hidden sm:flex flex-col justify-between w-[38%] bg-game-teal text-white p-7">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-game-gold text-slate-900 px-2.5 py-1 rounded-full">
              <Gift size={12} /> {7}-day offer
            </span>
            <h3 className="text-2xl font-black mt-4 leading-tight">
              Complete your profile.<br />Get <span className="text-game-gold">{offerPercent}% OFF</span> instantly.
            </h3>
          </div>
          <ul className="space-y-3 mt-6 text-sm text-white/85">
            <li className="flex gap-2"><Check size={16} className="text-game-gold shrink-0 mt-0.5" /> {offerPercent}% off on all paid courses for 7 days</li>
            <li className="flex gap-2"><Check size={16} className="text-game-gold shrink-0 mt-0.5" /> Free notes, videos and PDFs for your exam</li>
            <li className="flex gap-2"><Check size={16} className="text-game-gold shrink-0 mt-0.5" /> Study material sorted by your goal</li>
          </ul>
          <p className="text-[11px] text-white/50 mt-6">Your details are private and used only to personalise your study material.</p>
        </div>

        {/* Right panel = the form */}
        <div className="flex-1 p-6 sm:p-7 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-black text-slate-900">Tell us about you</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                <b className="text-game-teal">{preview.percent}% complete</b> · {preview.missing.length === 0 ? 'all set!' : `${preview.missing.length} more to unlock the offer`}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700 p-1"><X size={20} /></button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-game-gold transition-all" style={{ width: `${preview.percent}%` }} />
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Full name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:border-game-teal outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Mobile number</label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-500 flex items-center justify-between">
                  {phone || 'From signup'}
                  {phone && <Check size={15} className="text-green-500" />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Education</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_OPTIONS.map((o) => (
                  <button key={o} type="button" className={chip(form.education === o)} onClick={() => setForm({ ...form, education: o })}>{o}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Branch</label>
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:border-game-teal outline-none">
                  <option value="">Select branch</option>
                  {BRANCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Passing / current year</label>
                <select value={form.passingYear} onChange={(e) => setForm({ ...form, passingYear: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 focus:border-game-teal outline-none">
                  <option value="">Select year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your exam goal</label>
              <div className="flex flex-wrap gap-2">
                {EXAM_GOAL_OPTIONS.map((o) => (
                  <button key={o} type="button" className={chip(form.examGoal === o)} onClick={() => setForm({ ...form, examGoal: o })}>{o}</button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-500">{error}</p>}

            <button onClick={handleSave} disabled={saving}
              className="w-full bg-game-gold text-slate-900 font-black text-sm py-3.5 rounded-xl hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : `Save & unlock ${offerPercent}% OFF`}
            </button>
            <button onClick={onClose} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 -mt-1">Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
