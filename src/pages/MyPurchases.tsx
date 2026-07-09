/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, ChevronRight, Calendar, CreditCard, ExternalLink, Package } from 'lucide-react';
import { mockPurchases } from '../data/mockData';
import { motion } from 'motion/react';

export default function MyPurchases() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Order History</h2>
        <p className="text-slate-500">Track and manage your PDF purchases</p>
      </div>

      {mockPurchases.length > 0 ? (
        <div className="bg-white rounded-3xl card-shadow border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockPurchases.map((purchase, i) => (
                  <motion.tr 
                    key={purchase.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{purchase.pdfTitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">ID: {purchase.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-900 text-lg">₹{purchase.amount}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{purchase.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        purchase.status === 'Success' 
                          ? 'bg-green-50 text-green-600' 
                          : purchase.status === 'Failed' 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-orange-50 text-orange-600'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="flex items-center gap-2 text-game-teal font-bold text-[10px] uppercase tracking-widest hover:underline transition-all">
                        Receipt <ExternalLink size={12} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl card-shadow border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No purchases yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Premium study materials will appear here once you purchase them from the PDF Library.</p>
          <button className="mt-8 bg-game-teal text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg shadow-game-teal/20 transition-all">
            Browse Library
          </button>
        </div>
      )}

      {/* Mobile-only cards for purchases */}
      <div className="md:hidden space-y-4">
        {mockPurchases.map((purchase) => (
          <div key={purchase.id} className="bg-white p-5 rounded-3xl card-shadow border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{purchase.pdfTitle}</h4>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">{purchase.id}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                purchase.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {purchase.status}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Amount</span>
                <span className="text-lg font-black text-slate-900">₹{purchase.amount}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest">Date</span>
                <span className="text-xs font-bold text-slate-700">{purchase.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
