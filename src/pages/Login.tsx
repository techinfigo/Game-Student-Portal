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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 card-shadow"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-game-teal p-3 rounded-2xl mb-4">
            <GraduationCap size={40} className="text-game-gold" />
          </div>
          <h1 className="text-3xl font-bold text-game-teal tracking-tight">GAME Academy</h1>
          <p className="text-slate-500 mt-1">Student Portal Login</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-game-teal text-white font-bold py-4 rounded-xl hover:bg-game-teal/90 transition-all transform active:scale-95 shadow-lg shadow-game-teal/20"
            >
              Get OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Enter OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">OTP sent to {phone}</p>
            </div>
            <button
              type="submit"
              className="w-full bg-game-teal text-white font-bold py-4 rounded-xl hover:bg-game-teal/90 transition-all transform active:scale-95 shadow-lg shadow-game-teal/20"
            >
              Verify & Login
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-game-teal font-semibold text-sm hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-center text-slate-400 text-sm">
            Don't have an account? <span className="text-game-teal font-bold cursor-pointer">Contact Us</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
