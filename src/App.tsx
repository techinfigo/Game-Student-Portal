/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PdfLibrary = lazy(() => import('./pages/PdfLibrary'));
const PdfViewer = lazy(() => import('./pages/PdfViewer'));
const FreeVideos = lazy(() => import('./pages/FreeVideos'));
const FreeResources = lazy(() => import('./pages/FreeResources'));
const MyPurchases = lazy(() => import('./pages/MyPurchases'));
const Profile = lazy(() => import('./pages/Profile'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/library" 
              element={isAuthenticated ? <PdfLibrary /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/library/:id" 
              element={isAuthenticated ? <PdfViewer /> : <Navigate to="/login" />} 
            />
            <Route
              path="/videos"
              element={isAuthenticated ? <FreeVideos /> : <Navigate to="/login" />}
            />
            <Route
              path="/resources"
              element={isAuthenticated ? <FreeResources /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchases"
              element={isAuthenticated ? <MyPurchases /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
