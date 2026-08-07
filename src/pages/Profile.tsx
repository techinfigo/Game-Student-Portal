/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils';
import { motion } from 'motion/react';

export default function Profile() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || ''
  });

  useEffect(() => {
    if (student) {
      setFormData({ name: student.name, email: student.email || '' });
    }
  }, [student]);

  const studentName = student?.name || 'Student';
  const studentEmail = student?.email || 'Not provided';
  const studentPhone = student?.phoneNumber || 'Not available';
  const joinedDate = student?.joinedDate || '—';

  const handleSave = () => {
    // TODO: connect to Firebase for updating user profile
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="flex flex-col items-center text-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden card-solid border-4 border-white shadow-xl flex items-center justify-center bg-slate-100">
            {student?.avatar && !avatarError ? (
              <img
                src={student.avatar}
                alt="Profile"
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                onError={() => setAvatarError(true)}
              />
            ) : student?.name ? (
              <div className="w-full h-full flex items-center justify-center bg-game-teal/10 text-game-teal font-black text-3xl">
                {getInitials(student.name)}
              </div>
            ) : (
              <User size={48} className="text-slate-300" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-game-teal text-white p-2.5 rounded-xl shadow-lg border-2 border-white hover:bg-game-teal-dark transition-all scale-90 group-hover:scale-100">
            <Camera size={18} />
          </button>
        </div>
        <h2 className="mt-6 text-3xl font-black text-slate-900 tracking-tight">{studentName}</h2>
        <p className="label-caps !text-[10px] mt-1">Premium Member since {joinedDate}</p>
      </div>

      <div className="card-solid divide-y divide-slate-50 bg-white">
        <div className="p-8 md:p-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-game-teal rounded-full" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Account Settings
              </h3>
            </div>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-game-teal font-black text-[10px] uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-4"
            >
              {isEditing ? 'Save Changes' : 'Edit Information'}
            </button>
          </div>

          <div className="space-y-8">
            <div className="group">
              <label className="block label-caps !text-[9px] mb-2 ml-0.5 group-focus-within:text-game-teal transition-colors">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <p className="text-base font-bold text-slate-900 px-0.5">{studentName}</p>
              )}
            </div>

            <div className="group">
              <label className="block label-caps !text-[9px] mb-2 ml-0.5 group-focus-within:text-game-teal transition-colors">Email Address</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-game-teal/5 focus:border-game-teal outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <p className="text-base font-bold text-slate-900 px-0.5">{studentEmail}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <label className="block label-caps !text-[9px] mb-2 ml-0.5">Contact Phone</label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-slate-400 px-0.5">{studentPhone}</p>
                  <span className="text-[8px] font-black bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-widest">Verified</span>
                </div>
              </div>
              <div>
                <label className="block label-caps !text-[9px] mb-2 ml-0.5">Account Status</label>
                <span className="text-[9px] font-black text-game-teal bg-game-teal/5 px-2 py-1 rounded-md uppercase tracking-widest border border-game-teal/10">Active Student</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50/30 p-8 md:p-10">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">Security Access PIN</h4>
              <p className="label-caps !text-[8px] opacity-60">Required for PDF downloads and sensitive areas</p>
            </div>
            <button className="btn-secondary !py-2 !px-5 !text-xs">
              Change PIN
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
          Sign out from this device
        </button>
      </div>
    </div>
  );
}
