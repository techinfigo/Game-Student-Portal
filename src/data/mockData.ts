/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, PdfItem, VideoLecture, Purchase, Announcement } from '../types';

export const mockStudent: Student = {
  id: 'st_12345',
  name: 'Aditya Sharma',
  phone: '+91 98765 43210',
  email: 'aditya.sharma@example.com',
  joinedDate: '15 Aug 2025',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop'
};

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'New GATE 2027 Batch Starting!',
    content: 'Registration is now open for our flagship "Victory" batch. Special early bird discounts available.',
    date: '2 hours ago',
    type: 'New Batch'
  },
  {
    id: 'a2',
    title: 'ISRO Mock Test Live',
    content: 'The all-India ISRO mock test is now live. Complete it before Sunday 8 PM.',
    date: '1 day ago',
    type: 'Important'
  },
  {
    id: 'a3',
    title: 'Maintenance Update',
    content: 'The app will be under maintenance on Sunday between 2 AM to 4 AM.',
    date: '2 days ago',
    type: 'General'
  }
];

export const mockPdfs: PdfItem[] = [
  {
    id: 'p1',
    title: 'Thermodynamics: Core Concepts',
    description: 'Complete formulas and shortcut tricks for GATE Thermodynamics.',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    examTag: 'GATE',
    isFree: true,
    pageCount: 45
  },
  {
    id: 'p2',
    title: 'Engineering Mathematics: PYQs',
    description: 'Last 10 years of solved math problems for ESE and GATE.',
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    examTag: 'ESE',
    isFree: false,
    price: 499,
    isOwned: true,
    pageCount: 120
  },
  {
    id: 'p3',
    title: 'Digital Electronics - Part 1',
    description: 'Comprehensive notes on Number Systems and Logic Gates.',
    thumbnail: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400&h=600&fit=crop',
    examTag: 'ISRO',
    isFree: false,
    price: 299,
    isOwned: false,
    pageCount: 65
  },
  {
    id: 'p4',
    title: 'Fluid Mechanics Cheat Sheet',
    description: 'Quick revision one-pager for Fluid Mechanics.',
    thumbnail: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=600&fit=crop',
    examTag: 'GATE',
    isFree: true,
    pageCount: 5
  }
];

export const mockVideos: VideoLecture[] = [
  {
    id: 'v1',
    title: 'Introduction to Strength of Materials',
    subtitle: 'Chapter 1: Stress and Strain',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=640&h=360&fit=crop',
    duration: '45:20',
    views: '12K',
    tag: 'GATE',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 'v2',
    title: 'Fluid Statics - Masterclass',
    subtitle: 'Manometry and Buoyancy Explained',
    thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=640&h=360&fit=crop',
    duration: '1:12:05',
    views: '8.5K',
    tag: 'ESE',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 'v3',
    title: 'Control Systems: Root Locus',
    subtitle: 'Graphical methods for stability analysis',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=360&fit=crop',
    duration: '58:15',
    views: '15K',
    tag: 'BARC',
    youtubeId: 'dQw4w9WgXcQ'
  }
];

export const mockPurchases: Purchase[] = [
  {
    id: 'ord_001',
    pdfTitle: 'Engineering Mathematics: PYQs',
    amount: 499,
    date: '10 Oct 2025',
    paymentId: 'pay_ABC123XYZ',
    status: 'Success'
  },
  {
    id: 'ord_002',
    pdfTitle: 'Strength of Materials - Vol 1',
    amount: 299,
    date: '05 Oct 2025',
    paymentId: 'pay_DEF456UVW',
    status: 'Failed'
  }
];
