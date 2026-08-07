/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWhere } from '../services/dataService';
import { FirestorePurchase } from '../types';

type PurchaseDoc = FirestorePurchase & { id: string };

export default function MyPurchases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setIsLoading(false);
      return;
    }
    getWhere<FirestorePurchase>('purchases', 'uid', user.uid).then((data) => {
      if (isMounted) {
        setPurchases(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchase History</h2>
        <p className="text-slate-500 font-medium">Review your past orders and download receipts.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
        </div>
      ) : purchases.length > 0 ? (
        <div className="card-solid overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 label-caps !text-[9px]">Item Details</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Amount</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Date</th>
                  <th className="px-8 py-5 label-caps !text-[9px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((purchase) => (
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
          <h3 className="text-xl font-black text-slate-900">No purchases yet</h3>
          <p className="text-slate-500 mt-2 max-w-xs font-medium">Premium materials will appear here after you purchase them from the PDF Library.</p>
          <button onClick={() => navigate('/library')} className="btn-primary mt-8">Explore Library</button>
        </div>
      )}
    </div>
  );
}
