/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from '../firebase';

const WEBSITE_API_URL =
  import.meta.env.VITE_WEBSITE_API_URL || 'https://www.gameacademy.in';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${WEBSITE_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data as any)?.success === false) {
    throw new Error((data as any)?.error || (data as any)?.message || 'Payment failed. Please try again.');
  }
  return data as T;
}

export type BuyStatus = 'paid' | 'already_owned' | 'cancelled';

interface CreateOrderResponse {
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  pdfTitle?: string;
  alreadyOwned?: boolean;
}

/**
 * Runs the full buy flow for a paid PDF: creates a server-side order, opens
 * Razorpay checkout, then verifies the payment on the server (which records the
 * purchase). Resolves with 'paid' on success, 'already_owned' if the student
 * already bought it, or 'cancelled' if they closed the payment window.
 */
export async function buyPdf(pdf: { id: string; title: string }): Promise<BuyStatus> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to buy this PDF.');
  const idToken = await user.getIdToken();

  const order = await postJson<CreateOrderResponse>('/api/payments/create-order', {
    idToken,
    pdfId: pdf.id,
  });

  if (order.alreadyOwned) return 'already_owned';
  if (!order.orderId || !order.keyId) throw new Error('Could not start the payment.');

  const loaded = await loadRazorpayScript();
  if (!loaded) throw new Error('Could not open the payment window. Check your connection.');

  return new Promise<BuyStatus>((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'GAME Academy',
      description: order.pdfTitle || pdf.title,
      prefill: {
        name: user.displayName || '',
        contact: user.phoneNumber || '',
      },
      theme: { color: '#0f766e' },
      handler: async (resp: any) => {
        try {
          await postJson('/api/payments/verify', {
            idToken,
            pdfId: pdf.id,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve('paid');
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => resolve('cancelled'),
      },
    });
    rzp.open();
  });
}
