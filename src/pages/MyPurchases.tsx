/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, ChevronRight, Package } from 'lucide-react';
import { mockPurchases } from '../data/mockData';
import { motion } from 'motion/react';

export default function MyPurchases() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchase History</h2>
        <p className="text-slate-500 font-medium">Review your past orders and download receipts.</p>
      </div>

      {mockPurchases.length > 0 ? (
        <div className="card-solid overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 label-caps !text-[9px]">Item Details</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Amount</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Date</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Status</th>
                  <th className="px-8 py-5 label-caps !text-[9px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockPurchases.map((purchase) => (
                  <tr key={purchase.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:text-game-teal group-hover:bg-game-teal/5 transition-all">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight mb-1">{purchase.pdfTitle}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">ORDER_ID: {purchase.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 text-lg">₹{purchase.amount}</td>
                    <td className="px-8 py-6 text-slate-500 text-xs font-medium">{purchase.date}</td>
                    <td className="px-8 py-6">
                      <span className={`label-caps !text-[8px] px-2 py-1 rounded-md border ${
                        purchase.status === 'Success' 
                          ? 'border-green-100 text-green-600 bg-green-50' 
                          : 'border-red-100 text-red-500 bg-red-50'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-game-teal text-[10px] font-black uppercase tracking-[0.2em] hover:underline decoration-2 underline-offset-4">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card-solid p-24 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-50 p-8 rounded-full mb-8">
            <ShoppingBag size={48} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No purchases found</h3>
          <p className="text-slate-500 mt-2 max-w-xs font-medium">Premium materials will appear here after you purchase them from the PDF Library.</p>
          <button className="btn-primary mt-8">Explore Library</button>
        </div>
      )}
    </div>
  );
}
