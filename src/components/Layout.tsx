/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-4 md:p-10 max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
