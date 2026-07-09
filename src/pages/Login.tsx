/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSendOtp = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to Firebase for phone auth
    setStep(2);
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to Firebase for OTP verification
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl p-10 shadow-xl shadow-slate-200/50 border border-slate-200"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="bg-game-teal p-3 rounded-xl mb-6 shadow-lg shadow-game-teal/20">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-game-teal tracking-tighter">GAME Academy</h1>
          <p className="label-caps !text-[10px] opacity-60 mt-2">Elite Study Portal for GATE</p>
        </div>

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
                  placeholder="Enter your 10-digit number"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary !py-4 !rounded-xl !text-base !tracking-widest !uppercase !font-black shadow-xl shadow-game-teal/20">
              Continue
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
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium px-1">We sent a secure code to <span className="text-slate-900 font-bold">{phone}</span></p>
            </div>
            <button type="submit" className="w-full btn-primary !py-4 !rounded-xl !text-base !tracking-widest !uppercase !font-black shadow-xl shadow-game-teal/20">
              Verify & Login
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-game-teal transition-colors"
            >
              Change phone number
            </button>
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
