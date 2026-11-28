/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWhere } from '../services/dataService';
import { FirestorePurchase } from '../types';

type PurchaseDoc = FirestorePurchase & { id: string };

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PurchaseDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    if (!user) { setLoading(false); return; }
    getWhere<FirestorePurchase>('purchases', 'uid', user.uid).then((d) => {
      if (on) { setOrders(d); setLoading(false); }
    });
    return () => { on = false; };
  }, [user]);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Orders</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Payments and invoices only. Open your items from <Link to="/my-resources" className="text-game-teal font-bold hover:underline">My Resources</Link>.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-game-teal" /></div>
      ) : orders.length === 0 ? (
        <div className="card-solid p-16 flex flex-col items-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-5"><Receipt size={40} className="text-slate-200" /></div>
          <h3 className="text-lg font-black text-slate-900">No orders yet</h3>
          <p className="text-slate-500 mt-1 text-sm max-w-xs">Your payments and invoices will appear here after you buy something.</p>
        </div>
      ) : (
        <div className="card-solid overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 py-4 label-caps !text-[9px]">Item</th>
                  <th className="px-6 py-4 label-caps !text-[9px]">Amount</th>
                  <th className="px-6 py-4 label-caps !text-[9px]">Date</th>
                  <th className="px-6 py-4 label-caps !text-[9px]">Status</th>
                  <th className="px-6 py-4 label-caps !text-[9px]">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{o.pdfTitle}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Order ID ····{o.id.slice(-2).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">₹{o.amount}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">{o.date}</td>
                    <td className="px-6 py-4">
                      <span className={`label-caps !text-[8px] px-2 py-1 rounded-md border ${
                        o.status === 'Success' ? 'border-green-100 text-green-600 bg-green-50'
                        : o.status === 'Pending' ? 'border-amber-100 text-amber-600 bg-amber-50'
                        : 'border-red-100 text-red-500 bg-red-50'}`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {o.status === 'Success'
                        ? <button className="text-game-teal font-black text-xs hover:underline">Invoice</button>
                        : <span className="text-slate-300 text-xs font-bold">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
