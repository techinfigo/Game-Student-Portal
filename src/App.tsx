/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Gate a page behind login, remembering where the visitor wanted to go so the
// login screen can send them back there (e.g. a deep link to buy a PDF).
function RequireAuth({ isAuthenticated, children }: { isAuthenticated: boolean; children: JSX.Element }) {
  const location = useLocation();
  if (!isAuthenticated) {
    const dest = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${dest}`} replace />;
  }
  return children;
}

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
  const { user, loading, ssoPending } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-teal"></div>
        {ssoPending && (
          <p className="mt-4 text-sm text-slate-500">Signing you in...</p>
        )}
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
            
            <Route path="/" element={<RequireAuth isAuthenticated={isAuthenticated}><Dashboard /></RequireAuth>} />
            <Route path="/library" element={<RequireAuth isAuthenticated={isAuthenticated}><PdfLibrary /></RequireAuth>} />
            <Route path="/library/:id" element={<RequireAuth isAuthenticated={isAuthenticated}><PdfViewer /></RequireAuth>} />
            <Route path="/videos" element={<RequireAuth isAuthenticated={isAuthenticated}><FreeVideos /></RequireAuth>} />
            <Route path="/resources" element={<RequireAuth isAuthenticated={isAuthenticated}><FreeResources /></RequireAuth>} />
            <Route path="/purchases" element={<RequireAuth isAuthenticated={isAuthenticated}><MyPurchases /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth isAuthenticated={isAuthenticated}><Profile /></RequireAuth>} />

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
