/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Phone, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { sendOtp, verifyOtp } from '../services/authService';
import { useBranding } from '../hooks/useBranding';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { logoUrl } = useBranding();

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp(phone);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(phone, otp);
      navigate(redirectTo || '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await sendOtp(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-slate-200"
      >
        <div className="flex flex-col items-center mb-12">
          {logoUrl ? (
            <img src={logoUrl} alt="GAME Academy" className="h-10 object-contain mb-6" />
          ) : (
            <>
              <div className="bg-game-teal p-3 rounded-xl mb-6 shadow-lg shadow-game-teal/20">
                <GraduationCap size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-black text-game-teal tracking-tighter">GAME Academy</h1>
            </>
          )}
          <p className="label-caps !text-[10px] opacity-60 mt-2">Elite Study Portal for GATE</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-6 text-xs font-bold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block label-caps !text-[9px] mb-2.5 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-game-teal transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  required
                  disabled={isSubmitting}
                  placeholder="Enter your 10-digit number"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all disabled:opacity-60"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary !py-4 !rounded-xl !text-base !tracking-widest !uppercase !font-black shadow-xl shadow-game-teal/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isSubmitting ? 'Sending Code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block label-caps !text-[9px] mb-2.5 ml-1">Verification Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-game-teal transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all disabled:opacity-60"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium px-1">We sent a secure code to <span className="text-slate-900 font-bold">{phone}</span></p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary !py-4 !rounded-xl !text-base !tracking-widest !uppercase !font-black shadow-xl shadow-game-teal/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isSubmitting ? 'Verifying...' : 'Verify & Login'}
            </button>
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-game-teal transition-colors disabled:opacity-60"
              >
                Change phone number
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleResendOtp}
                className="text-game-teal font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-4 decoration-2 transition-colors disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs font-medium">
            Access restricted to active students. <br/>
            <span className="text-game-teal font-black uppercase tracking-widest !text-[9px] cursor-pointer hover:underline underline-offset-4 decoration-2 mt-2 inline-block">Support Desk</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
