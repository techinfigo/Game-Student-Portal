/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useAuth } from '../context/AuthContext';
import { getDocById, getWhere } from '../services/dataService';
import { FirestorePdf, FirestorePurchase } from '../types';
import { auth } from '../firebase';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student } = useAuth();

  const [pdfMeta, setPdfMeta] = useState<FirestorePdf | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isRenderingDoc, setIsRenderingDoc] = useState(false);
  const [loadError, setLoadError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const watermarkName = student?.name || 'Student';
  const watermarkPhone = student?.phoneNumber || '';
  const watermarkDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setIsLoadingMeta(false);
      return;
    }
    getDocById<FirestorePdf>('pdfs', id).then((data) => {
      if (isMounted) {
        setPdfMeta(data);
        setIsLoadingMeta(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const isFree = pdfMeta?.isFree === true;

  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Unlock a paid PDF the student has bought — not only free ones.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!id || !uid) {
      setCheckingAccess(false);
      return;
    }
    let active = true;
    getWhere<FirestorePurchase>('purchases', 'uid', uid)
      .then((rows) => {
        if (active) setHasPurchased(rows.some((r) => r.pdfId === id));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingAccess(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const hasAccess = isFree || hasPurchased;

  useEffect(() => {
    if (!pdfMeta || !hasAccess || !pdfMeta.fileUrl) return;
    let isCancelled = false;
    setIsRenderingDoc(true);
    setLoadError('');

    const loadingTask = pdfjsLib.getDocument(pdfMeta.fileUrl);
    loadingTask.promise
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsRenderingDoc(false);
      })
      .catch((error) => {
        console.error('Failed to load PDF document:', error);
        if (!isCancelled) {
          setLoadError('Unable to load this PDF file.');
          setIsRenderingDoc(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [pdfMeta, hasAccess]);

  useEffect(() => {
    if (!pdfDoc) return;
    let isCancelled = false;

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: (zoom / 100) * 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      if (!context) return;

      page.render({ canvas, canvasContext: context, viewport }).promise.catch((error) => {
        if (!isCancelled) console.error('Failed to render PDF page:', error);
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoom]);

  if (isLoadingMeta) {
    return (
      <div className="fixed inset-0 bg-slate-100 z-[60] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
      </div>
    );
  }

  if (!pdfMeta) {
    return (
      <div className="fixed inset-0 bg-slate-100 z-[60] flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-slate-900">PDF not found</p>
        <button onClick={() => navigate('/library')} className="btn-secondary">Back to Library</button>
      </div>
    );
  }

  if (checkingAccess) {
    return (
      <div className="fixed inset-0 bg-slate-100 z-[60] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="fixed inset-0 bg-slate-100 z-[60] flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="bg-white p-8 rounded-full shadow-lg border border-slate-100">
          <Lock size={40} className="text-slate-300" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Purchase required</h1>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">
            "{pdfMeta.title}" is a paid resource. Purchase it to unlock the secure viewer.
          </p>
        </div>
        <button onClick={() => navigate('/library')} className="btn-primary flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 z-[60] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-game-teal">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-black text-sm text-slate-900 truncate max-w-[150px] md:max-w-md tracking-tight">{pdfMeta.title}</h1>
            <p className="label-caps !text-[8px] opacity-70">Student Study Portal</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="disabled:opacity-20 p-1 hover:text-game-teal transition-colors text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-900 min-w-[70px] text-center tracking-widest">
              PAGE {currentPage} / {numPages || '—'}
            </span>
            <button
              disabled={currentPage === numPages}
              onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
              className="disabled:opacity-20 p-1 hover:text-game-teal transition-colors text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-1.5 hover:text-game-teal transition-colors text-slate-400">
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-black text-slate-500 min-w-[35px] text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-1.5 hover:text-game-teal transition-colors text-slate-400">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <ShieldCheck size={14} className="text-game-teal opacity-50" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure View</span>
          </div>
        </div>
      </div>

      {/* Viewer Area */}
      <div
        className="flex-1 overflow-auto p-4 md:p-16 flex justify-center bg-slate-100/30 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent select-none"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        <div className="relative bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-200 rounded-sm overflow-hidden select-none">
          {isRenderingDoc && (
            <div className="w-[600px] max-w-[80vw] aspect-[1/1.41] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal"></div>
            </div>
          )}

          {loadError && (
            <div className="w-[600px] max-w-[80vw] aspect-[1/1.41] flex items-center justify-center text-slate-400 text-sm font-medium">
              {loadError}
            </div>
          )}

          {!isRenderingDoc && !loadError && (
            <canvas ref={canvasRef} className="block select-none pointer-events-none" />
          )}

          {/* Diagonal traceable watermark */}
          {!isRenderingDoc && !loadError && (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 pointer-events-none overflow-hidden rotate-[-25deg] scale-150 opacity-[0.12]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="text-black font-black text-lg whitespace-nowrap p-8 flex flex-col items-center justify-center border border-black/5">
                  <span className="opacity-100">{watermarkName}</span>
                  <span className="text-sm opacity-80 mt-1">{watermarkPhone}</span>
                  <span className="text-[10px] opacity-70 mt-1">{watermarkDate}</span>
                </div>
              ))}
            </div>
          )}

          {/* Interaction blocker over the canvas */}
          <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
        </div>
      </div>

      {/* License Notice */}
      <div className="bg-white border-t border-slate-200 px-6 py-2 text-center">
        <p className="text-[10px] font-bold text-slate-400 tracking-wide">
          Licensed to {watermarkName}{watermarkPhone ? ` (${watermarkPhone})` : ''} — do not share.
        </p>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">PAGE {currentPage} / {numPages || '—'}</span>
        <button
          disabled={currentPage === numPages}
          onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
