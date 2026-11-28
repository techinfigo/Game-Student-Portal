/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Profile completion + first-purchase offer logic.
//
// IMPORTANT: the actual checkout happens on the GAME Live App (Classplus) and
// the Test Series Portal, which are separate systems we do not control. This
// portal therefore SHOWS the offer (percent, countdown, coupon code) and sends
// the student to those apps with "Use offer now"; the discount is applied there
// by entering the coupon code at their checkout. We never claim to auto-apply it.

import type { StudentProfile } from '../context/AuthContext';

// The five fields that make a profile "100% complete" (the five chips the
// student sees). Email and passing year are extra and do NOT block 100%.
export const PROFILE_FIELDS: { key: keyof StudentProfile; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'phoneNumber', label: 'Mobile' },
  { key: 'education', label: 'Education' },
  { key: 'branch', label: 'Branch' },
  { key: 'examGoal', label: 'Exam goal' },
];

export interface Completion {
  filled: number;
  total: number;
  percent: number; // 0..100, rounded
  isComplete: boolean;
  missing: string[]; // labels still empty
  doneKeys: Set<string>;
}

function hasValue(v: unknown): boolean {
  return typeof v === 'string' ? v.trim().length > 0 : !!v;
}

export function getCompletion(student: StudentProfile | null): Completion {
  const total = PROFILE_FIELDS.length;
  if (!student) {
    return { filled: 0, total, percent: 0, isComplete: false, missing: PROFILE_FIELDS.map((f) => f.label), doneKeys: new Set() };
  }
  const doneKeys = new Set<string>();
  const missing: string[] = [];
  for (const f of PROFILE_FIELDS) {
    if (hasValue(student[f.key])) doneKeys.add(f.key as string);
    else missing.push(f.label);
  }
  const filled = doneKeys.size;
  return {
    filled,
    total,
    percent: Math.round((filled / total) * 100),
    isComplete: filled === total,
    missing,
    doneKeys,
  };
}

export const OFFER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type OfferState = 'locked' | 'active' | 'expired';

export interface Offer {
  state: OfferState;
  endsAt: number | null; // epoch ms the offer runs until
  msLeft: number; // 0 when not active
  days: number;
  hours: number;
  minutes: number;
}

// `now` is injectable so a ticking component can pass Date.now() each second.
export function getOffer(student: StudentProfile | null, now: number = Date.now()): Offer {
  const complete = getCompletion(student).isComplete;
  const startedAt = student?.offerStartedAt;
  if (!complete || !startedAt) {
    return { state: 'locked', endsAt: null, msLeft: 0, days: 0, hours: 0, minutes: 0 };
  }
  const endsAt = startedAt + OFFER_DAYS * DAY_MS;
  const msLeft = endsAt - now;
  if (msLeft <= 0) {
    return { state: 'expired', endsAt, msLeft: 0, days: 0, hours: 0, minutes: 0 };
  }
  return {
    state: 'active',
    endsAt,
    msLeft,
    days: Math.floor(msLeft / DAY_MS),
    hours: Math.floor((msLeft % DAY_MS) / (60 * 60 * 1000)),
    minutes: Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000)),
  };
}

// Options shown as tap-chips in the profile form.
export const EDUCATION_OPTIONS = ['Diploma', 'B.Tech / B.E.', 'M.Tech', '12th', 'Other'];
export const EXAM_GOAL_OPTIONS = ['GATE', 'ESE', 'SSC JE', 'RRB JE', 'State AE/JE', 'PSU', 'IIT JEE / NEET', 'Other'];
export const BRANCH_OPTIONS = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics & Comm.',
  'Computer Science',
  'Instrumentation',
  'Other',
];
