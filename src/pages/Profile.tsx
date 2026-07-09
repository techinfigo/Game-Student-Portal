/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, Phone, Mail, Calendar, Camera, Save, LogOut } from 'lucide-react';
import { mockStudent } from '../data/mockData';
import { motion } from 'motion/react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockStudent.name,
    email: mockStudent.email
  });

  const handleSave = () => {
    // TODO: connect to Firebase for updating user profile
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl overflow-hidden card-shadow ring-4 ring-white">
            <img src={mockStudent.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-2 -right-2 bg-game-gold text-game-teal p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform">
            <Camera size={20} />
          </button>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-900">{mockStudent.name}</h2>
        <p className="text-slate-500 font-medium">Joined {mockStudent.joinedDate}</p>
      </div>

      <div className="bg-white rounded-3xl card-shadow border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-game-teal" />
              Personal Information
            </h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-game-teal font-bold text-sm flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-game-teal/5 transition-all"
            >
              {isEditing ? (
                <> <Save size={16} /> Save Changes </>
              ) : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal outline-none transition-all font-semibold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-transparent">
                  <span className="font-semibold text-slate-900">{mockStudent.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Email Address</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-game-teal/20 focus:border-game-teal outline-none transition-all font-semibold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-transparent">
                  <span className="font-semibold text-slate-900">{mockStudent.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Phone Number</label>
              <div className="flex items-center gap-3 bg-slate-100 py-3 px-4 rounded-xl border border-transparent opacity-60">
                <span className="font-semibold text-slate-500">{mockStudent.phone}</span>
                <span className="ml-auto text-[8px] font-black uppercase text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm">Verified</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Member Since</label>
              <div className="flex items-center gap-3 bg-slate-100 py-3 px-4 rounded-xl border border-transparent opacity-60">
                <span className="font-semibold text-slate-500">{mockStudent.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900">Account Security</h4>
              <p className="text-xs text-slate-500">Manage your password and active sessions</p>
            </div>
            <button className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all">
              Change Security PIN
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-8 py-3 rounded-2xl transition-all">
          <LogOut size={20} />
          Logout from current session
        </button>
      </div>
    </div>
  );
}
