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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

type PageDim = { w: number; h: number };

export default function PdfViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { student, user, loading: authLoading } = useAuth();

  const [pdfMeta, setPdfMeta] = useState<FirestorePdf | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setPageDims] = useState<PageDim[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isRenderingDoc, setIsRenderingDoc] = useState(false);
  const [loadError, setLoadError] = useState('');

  const viewerRef = useRef<HTMLDivElement>(null);
  const pageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [availWidth, setAvailWidth] = useState(0);

  // Lazy-render bookkeeping.
  const inViewRef = useRef<Set<number>>(new Set());
  const ratioRef = useRef<Map<number, number>>(new Map());
  const renderedRef = useRef<Map<number, number>>(new Map()); // page -> epoch it was drawn at
  const renderingRef = useRef<Set<number>>(new Set());
  const epochRef = useRef(0);
  const ensureRef = useRef<() => void>(() => {});

  // --- available width (drives fit-to-width) -------------------------------
  useEffect(() => {
    const measure = () => {
      if (viewerRef.current) setAvailWidth(viewerRef.current.clientWidth);
    };
    measure();
    const r = requestAnimationFrame(measure);
    const t = window.setTimeout(measure, 300);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      const attach = () => {
        if (viewerRef.current) ro!.observe(viewerRef.current);
        else window.setTimeout(attach, 150);
      };
      attach();
    }
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      ro?.disconnect();
    };
  }, []);

  // The CSS width each page is drawn at. At 100% zoom this is exactly the
  // viewer width (minus padding), so a page can never be wider than the view
  // and never gets cut off. Zoom scales it up, and the container scrolls.
  const sidePad = availWidth > 640 ? 80 : 32; // matches p-10 / p-4
  const baseFit = Math.max((availWidth || (typeof window !== 'undefined' ? window.innerWidth : 800)) - sidePad - 8, 220);
  const columnWidth = Math.round(baseFit * (zoom / 100));

  // --- screenshot / screen-capture deterrents ------------------------------
  const [obscured, setObscured] = useState(false);
  useEffect(() => {
    const hide = () => setObscured(true);
    const showAgain = () => setObscured(false);
    const onVisibility = () => setObscured(document.hidden);
    const onPrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && (e.key === 'p' || e.key === 'P'))) {
        try {
          navigator.clipboard?.writeText('Screenshots of this material are not permitted.');
        } catch {}
        setObscured(true);
        window.setTimeout(() => setObscured(false), 1200);
        e.preventDefault();
      }
    };
    window.addEventListener('blur', hide);
    window.addEventListener('focus', showAgain);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('keyup', onPrintScreen);
    document.addEventListener('keydown', onPrintScreen);
    return () => {
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', showAgain);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('keyup', onPrintScreen);
      document.removeEventListener('keydown', onPrintScreen);
    };
  }, []);

  const watermarkName = student?.name || 'Student';
  const watermarkPhone = student?.phoneNumber || '';
  const watermarkDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // --- load metadata -------------------------------------------------------
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

  // --- access check (free OR purchased) ------------------------------------
  useEffect(() => {
    if (authLoading) return;
    const uid = user?.uid;
    if (!id || !uid) {
      setHasPurchased(false);
      setCheckingAccess(false);
      return;
    }
    let active = true;
    setCheckingAccess(true);
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
  }, [id, user?.uid, authLoading]);

  const hasAccess = isFree || hasPurchased;

  // --- load the PDF document ----------------------------------------------
  useEffect(() => {
    if (!pdfMeta || !hasAccess || !id || !user) return;
    let isCancelled = false;
    setIsRenderingDoc(true);
    setLoadError('');

    (async () => {
      try {
        const idToken = await user.getIdToken();
        const base = import.meta.env.VITE_WEBSITE_API_URL || 'https://www.gameacademy.in';
        const loadingTask = pdfjsLib.getDocument({
          url: `${base}/api/pdf?pdfId=${encodeURIComponent(id)}`,
          httpHeaders: { Authorization: `Bearer ${idToken}` },
          withCredentials: false,
        });
        const doc = await loadingTask.promise;
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsRenderingDoc(false);
      } catch (error) {
        console.error('Failed to load PDF document:', error);
        if (!isCancelled) {
          setLoadError('Unable to load this PDF file.');
          setIsRenderingDoc(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [pdfMeta, hasAccess, id, user]);

  // --- read every page's natural size (for placeholders / aspect ratios) ---
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    (async () => {
      const dims: PageDim[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
          const pg = await pdfDoc.getPage(i);
          const vp = pg.getViewport({ scale: 1 });
          dims.push({ w: vp.width, h: vp.height });
        } catch {
          dims.push({ w: 1, h: 1.414 });
        }
        if (cancelled) return;
      }
      if (!cancelled) setPageDims(dims);
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc]);

  // --- render a single page to its canvas ----------------------------------
  const renderPage = async (pageNum: number, epoch: number) => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pageNum);
    if (epoch !== epochRef.current) return;
    const canvas = canvasRefs.current[pageNum - 1];
    if (!canvas) return;

    const unscaled = page.getViewport({ scale: 1 });
    const cssScale = columnWidth / unscaled.width; // fit this page to the column
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: cssScale * outputScale });
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    // Display at the column width; height follows the bitmap's aspect ratio.
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    try {
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      if (epoch === epochRef.current) renderedRef.current.set(pageNum, epoch);
    } catch (error) {
      if (epoch === epochRef.current) console.error('Failed to render PDF page:', error);
    }
  };

  // Render the in-view pages (plus their neighbours) and free the far ones.
  const ensureRendered = () => {
    if (!pdfDoc || !numPages) return;
    const epoch = epochRef.current;
    const want = new Set<number>();
    inViewRef.current.forEach((p) => {
      want.add(p);
      if (p > 1) want.add(p - 1);
      if (p < numPages) want.add(p + 1);
    });

    // Free canvases that are far from the viewport to keep memory bounded.
    renderedRef.current.forEach((_, p) => {
      if (!want.has(p)) {
        const c = canvasRefs.current[p - 1];
        if (c) {
          c.width = 0;
          c.height = 0;
        }
        renderedRef.current.delete(p);
      }
    });

    want.forEach((p) => {
      if (renderedRef.current.get(p) === epoch) return;
      if (renderingRef.current.has(p)) return;
      renderingRef.current.add(p);
      renderPage(p, epoch).finally(() => renderingRef.current.delete(p));
    });
  };
  ensureRef.current = ensureRendered;

  // Re-render when the fit width or zoom changes (new epoch invalidates old art).
  useEffect(() => {
    if (!pdfDoc) return;
    epochRef.current += 1;
    renderedRef.current.clear();
    ensureRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnWidth, pdfDoc, numPages]);

  // --- observe which pages are on screen (lazy render + page indicator) ----
  useEffect(() => {
    if (!pdfDoc || !viewerRef.current || !numPages) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const p = Number((e.target as HTMLElement).dataset.page);
          if (!p) return;
          if (e.isIntersecting) {
            inViewRef.current.add(p);
            ratioRef.current.set(p, e.intersectionRatio);
          } else {
            inViewRef.current.delete(p);
            ratioRef.current.delete(p);
          }
        });
        // The most-visible page becomes the "current page" indicator.
        let best = 0;
        let bestR = -1;
        ratioRef.current.forEach((r, p) => {
          if (r > bestR) {
            bestR = r;
            best = p;
          }
        });
        if (best > 0) setCurrentPage(best);
        ensureRef.current();
      },
      { root: viewerRef.current, rootMargin: '300px 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    pageWrapRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [pdfDoc, numPages, pageDims.length]);

  // --- page navigation (scrolls to the page) -------------------------------
  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), numPages || 1);
    const el = pageWrapRefs.current[clamped - 1];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, numPages]);

  // --- states --------------------------------------------------------------
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

  const pageList = numPages > 0 ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div className="fixed inset-0 bg-slate-100 z-[60] flex flex-col">
      {/* Screen-capture cover: hides pages when the window is not focused */}
      {obscured && (
        <div className="fixed inset-0 z-[120] bg-slate-900 flex flex-col items-center justify-center gap-4 text-center px-8 select-none">
          <ShieldCheck size={40} className="text-game-teal" />
          <p className="text-white font-black text-lg">Content hidden</p>
          <p className="text-slate-300 text-sm max-w-xs font-medium">
            For security, this material is hidden while this window isn't active. Screenshots and screen recording are not permitted. Return to the window to keep reading.
          </p>
        </div>
      )}

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
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="disabled:opacity-20 p-1 hover:text-game-teal transition-colors text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-slate-900 min-w-[70px] text-center tracking-widest">
              PAGE {currentPage} / {numPages || '—'}
            </span>
            <button
              disabled={currentPage >= numPages}
              onClick={() => goToPage(currentPage + 1)}
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

      {/* Viewer Area — continuous vertical scroll */}
      <div
        ref={viewerRef}
        className="flex-1 overflow-auto p-4 md:p-10 bg-slate-100/30 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent select-none"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        {isRenderingDoc && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal"></div>
          </div>
        )}

        {loadError && (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-medium">{loadError}</div>
        )}

        {!isRenderingDoc && !loadError && (
          <div className="flex flex-col items-center gap-6">
            {pageList.map((p) => {
              const dim = pageDims[p - 1];
              const ratio = dim ? `${dim.w} / ${dim.h}` : '1 / 1.414';
              return (
                <div
                  key={p}
                  data-page={p}
                  ref={(el) => {
                    pageWrapRefs.current[p - 1] = el;
                  }}
                  className="relative bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-200 rounded-sm overflow-hidden select-none"
                  style={{ width: columnWidth, aspectRatio: ratio }}
                >
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[p - 1] = el;
                    }}
                    className="block w-full h-auto select-none pointer-events-none"
                  />

                  {/* Diagonal traceable watermark */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-6 pointer-events-none overflow-hidden rotate-[-25deg] scale-150 opacity-[0.08]">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="text-black font-black text-lg whitespace-nowrap p-8 flex flex-col items-center justify-center border border-black/5">
                        <span className="opacity-100">{watermarkName}</span>
                        <span className="text-sm opacity-80 mt-1">{watermarkPhone}</span>
                        <span className="text-[10px] opacity-70 mt-1">{watermarkDate}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interaction blocker */}
                  <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
                </div>
              );
            })}
          </div>
        )}
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
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400">PAGE {currentPage} / {numPages || '—'}</span>
        <button
          disabled={currentPage >= numPages}
          onClick={() => goToPage(currentPage + 1)}
          className="flex items-center gap-1 font-black text-[10px] uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-game-teal transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
