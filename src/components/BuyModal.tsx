/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import { buyPdf, validateCoupon, CouponPreview, BuyStatus } from '../services/paymentService';

interface BuyModalProps {
  pdf: { id: string; title: string; price?: number };
  onClose: () => void;
  onResult: (status: BuyStatus) => void;
}

export default function BuyModal({ pdf, onClose, onResult }: BuyModalProps) {
  const basePrice = pdf.price ?? 0;
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState<CouponPreview | null>(null);
  const [checking, setChecking] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  const finalPrice = applied?.valid ? applied.finalAmount ?? basePrice : basePrice;
  const discount = applied?.valid ? applied.discount ?? 0 : 0;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setChecking(true);
    setCouponMsg('');
    try {
      const res = await validateCoupon(pdf.id, code);
      if (res.valid) {
        setApplied(res);
        setCouponMsg('');
      } else {
        setApplied(null);
        setCouponMsg(res.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setApplied(null);
      setCouponMsg(err?.message || 'Could not check this coupon.');
    } finally {
      setChecking(false);
    }
  };

  const removeCoupon = () => {
    setApplied(null);
    setCouponInput('');
    setCouponMsg('');
  };

  const pay = async () => {
    setBuying(true);
    setError('');
    try {
      const status = await buyPdf({ id: pdf.id, title: pdf.title }, applied?.valid ? applied.code : undefined);
      onResult(status);
    } catch (err: any) {
      setError(err?.message || 'Payment failed. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900">Buy PDF</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">You're buying</p>
            <p className="font-bold text-slate-900 leading-snug mt-1">{pdf.title}</p>
          </div>

          {/* Coupon */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon code</label>
            {applied?.valid ? (
              <div className="mt-1.5 flex items-center justify-between bg-game-teal/5 border border-game-teal/20 rounded-xl px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-black text-game-teal">
                  <CheckCircle2 className="w-4 h-4" /> {applied.code} applied
                </span>
                <button onClick={removeCoupon} className="text-xs font-bold text-slate-400 hover:text-red-500">
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.replace(/\s+/g, '').toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="Enter code"
                    autoCapitalize="characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-game-teal"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={checking || !couponInput.trim()}
                  className="px-4 rounded-xl bg-slate-900 text-white text-sm font-black disabled:opacity-40"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
            {couponMsg && <p className="text-xs text-red-500 font-bold mt-1.5">{couponMsg}</p>}
          </div>

          {/* Price summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Price</span>
              <span>₹{basePrice}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-game-teal font-bold">
                <span>Discount</span>
                <span>− ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>To pay</span>
              <span>₹{finalPrice}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

          <button
            onClick={pay}
            disabled={buying}
            className="w-full btn-primary justify-center !py-3 disabled:opacity-60"
          >
            {buying ? 'Processing…' : `Pay ₹${finalPrice}`}
          </button>
          <p className="text-[10px] text-slate-400 text-center">Secure payment via Razorpay</p>
        </div>
      </div>
    </div>
  );
}
