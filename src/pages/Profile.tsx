/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { User, Check, Clock, LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { getInitials } from '../utils';
import {
  getCompletion, getOffer, PROFILE_FIELDS,
  EDUCATION_OPTIONS, EXAM_GOAL_OPTIONS, BRANCH_OPTIONS,
} from '../lib/offer';

export default function Profile() {
  const { student, user, logout, refreshStudent } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const [form, setForm] = useState({
    name: '', email: '', education: '', branch: '', passingYear: '', examGoal: '',
    alsoInterested: [] as string[],
  });

  useEffect(() => {
    if (!student) return;
    setForm({
      name: student.name || '', email: student.email || '', education: student.education || '',
      branch: student.branch || '', passingYear: student.passingYear || '', examGoal: student.examGoal || '',
      alsoInterested: student.alsoInterested || [],
    });
  }, [student]);

  const completion = getCompletion(student);
  const offer = getOffer(student, now);
  useEffect(() => {
    if (offer.state !== 'active') return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [offer.state]);

  const save = async () => {
    if (!user) { setEditing(false); return; }
    setSaving(true); setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(), email: form.email.trim(), education: form.education,
        branch: form.branch, passingYear: form.passingYear, examGoal: form.examGoal,
        alsoInterested: form.alsoInterested,
      };
      // Start the 7-day offer once the profile first reaches 100%.
      const willComplete = getCompletion({ ...(student as any), ...form, phoneNumber: student?.phoneNumber }).isComplete;
      if (willComplete && !student?.offerStartedAt) payload.offerStartedAt = Date.now();
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      await refreshStudent();
      setEditing(false);
    } catch (e) {
      console.error(e); setError('Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  const toggleInterest = (g: string) =>
    setForm((f) => ({ ...f, alsoInterested: f.alsoInterested.includes(g) ? f.alsoInterested.filter((x) => x !== g) : [...f.alsoInterested, g] }));

  const chip = (active: boolean) =>
    `px-3 py-2 rounded-xl text-sm font-bold border transition-all ${active ? 'bg-game-teal text-white border-game-teal' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`;

  const val = (v?: string) => v && v.trim() ? v : '—';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Keep this updated so we can show the right free and paid material.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left: avatar + strength */}
        <div className="space-y-5">
          <div className="card-solid p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-game-gold/40 flex items-center justify-center bg-game-teal/10 text-game-teal font-black text-3xl">
              {student?.name ? getInitials(student.name) : <User size={40} className="text-slate-300" />}
            </div>
            <p className="mt-3 font-black text-slate-900 text-lg">{student?.name || 'Student'}</p>
            <p className="text-xs text-slate-400 font-bold">{student?.examGoal ? `${student.examGoal}${student?.branch ? ` · ${student.branch}` : ''}` : 'Set your goal'}</p>
          </div>

          <div className="card-solid p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm">Profile strength</h3>
              <span className="font-black text-game-teal">{completion.percent}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-game-teal transition-all" style={{ width: `${completion.percent}%` }} /></div>
            <ul className="space-y-2.5">
              {PROFILE_FIELDS.map((f) => {
                const done = completion.doneKeys.has(f.key as string);
                return (
                  <li key={f.key as string} className="flex items-center gap-2 text-sm font-bold">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}><Check size={12} /></span>
                    <span className={done ? 'text-slate-700' : 'text-slate-400'}>{f.label}{f.key === 'phoneNumber' && done ? ' (verified)' : ''}</span>
                  </li>
                );
              })}
            </ul>
            {offer.state === 'active' && (
              <div className="mt-4 bg-slate-900 text-white rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs font-black">
                <Clock size={14} className="text-game-gold" /> 15% OFF active · {offer.days}d {offer.hours}h {offer.minutes}m left
              </div>
            )}
          </div>
        </div>

        {/* Right: details + preferences */}
        <div className="space-y-5">
          <div className="card-solid p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-slate-900">Personal details</h3>
              <button onClick={() => (editing ? save() : setEditing(true))} disabled={saving}
                className="text-game-teal font-black text-xs uppercase tracking-widest hover:underline disabled:opacity-50 inline-flex items-center gap-1.5">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : editing ? 'Save' : 'Edit'}
              </button>
            </div>
            {error && <p className="text-xs font-bold text-red-500 mb-3">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full name">
                {editing ? <input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> : <p className="v">{val(student?.name)}</p>}
              </Field>
              <Field label="Mobile">
                <div className="flex items-center gap-2"><p className="v !text-slate-500">{val(student?.phoneNumber)}</p>{student?.phoneNumber && <span className="text-[8px] font-black bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-widest">Verified</span>}</div>
              </Field>
              <Field label="Email (optional)">
                {editing ? <input className="inp" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Not provided" /> : <p className="v">{val(student?.email)}</p>}
              </Field>
              <Field label="Education">
                {editing ? (
                  <select className="inp" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })}>
                    <option value="">Select</option>{EDUCATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : <p className="v">{val(student?.education)}</p>}
              </Field>
            </div>
          </div>

          <div className="card-solid p-6">
            <h3 className="font-black text-slate-900 mb-5">Exam preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Branch">
                {editing ? (
                  <select className="inp" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                    <option value="">Select</option>{BRANCH_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : <p className="v">{val(student?.branch)}</p>}
              </Field>
              <Field label="Exam goal">
                {editing ? (
                  <select className="inp" value={form.examGoal} onChange={(e) => setForm({ ...form, examGoal: e.target.value })}>
                    <option value="">Select</option>{EXAM_GOAL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : <p className="v">{val(student?.examGoal)}</p>}
              </Field>
            </div>
            <div className="mt-5">
              <label className="label-caps !text-[9px]">Also interested in</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAM_GOAL_OPTIONS.filter((o) => o !== form.examGoal).map((o) => {
                  const active = (editing ? form.alsoInterested : student?.alsoInterested || []).includes(o);
                  return editing
                    ? <button key={o} type="button" className={chip(active)} onClick={() => toggleInterest(o)}>{o}</button>
                    : active ? <span key={o} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">{o}</span> : null;
                })}
                {!editing && (student?.alsoInterested || []).length === 0 && <span className="text-sm text-slate-300">—</span>}
              </div>
            </div>
          </div>

          <div className="card-solid p-6 flex items-center justify-between">
            <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-game-teal" /><div><h4 className="font-black text-slate-900 text-sm">Security PIN</h4><p className="text-[11px] text-slate-400 font-bold">Required for PDF downloads</p></div></div>
            <button className="btn-secondary !py-2 !px-4 !text-xs">Change PIN</button>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button onClick={async () => { await logout(); navigate('/login'); }}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label-caps !text-[9px] mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
