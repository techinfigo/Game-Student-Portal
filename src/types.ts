/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedDate: string;
  avatar?: string;
}

export type ExamTag = 'GATE' | 'ESE' | 'ISRO' | 'BARC' | 'General';

export interface PdfItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  examTag: ExamTag;
  isFree: boolean;
  price?: number;
  isOwned?: boolean;
  pageCount: number;
}

export interface VideoLecture {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  duration: string;
  views: string;
  tag: ExamTag;
  youtubeId: string;
}

export interface Purchase {
  id: string;
  pdfTitle: string;
  amount: number;
  date: string;
  paymentId: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'Important' | 'General' | 'New Batch';
}

export interface FirestoreVideoLecture {
  title: string;
  subtitle?: string;
  tag?: string;
  duration?: string;
  views?: string;
  youtubeUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export interface FirestoreResource {
  title: string;
  description?: string;
  category?: string;
  fileOrLink: string;
  image?: string;
  action?: string;
  resourceKind?: string;
}

export interface FirestoreAnnouncement {
  title: string;
  message: string;
  date: string;
  active?: boolean;
}

export interface FirestoreSiteSettings {
  classplusPortalLink?: string;
}

export interface FirestorePdf {
  title: string;
  description?: string;
  thumbnail?: string;
  // Admin panel saves the cover image under `thumbnailUrl`; keep `thumbnail`
  // too for backward compatibility.
  thumbnailUrl?: string;
  examTag?: string;
  category?: string;
  isFree?: boolean;
  price?: number;
  fileUrl?: string;
  pageCount?: number;
}

export interface FirestorePurchase {
  uid: string;
  pdfId: string;
  pdfTitle: string;
  amount: number;
  date: string;
  paymentId?: string;
  status: 'Success' | 'Pending' | 'Failed';
}
