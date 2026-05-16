import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Chat from './pages/Chat';
import CreateGirl from './pages/CreateGirl';
import Stream from './pages/Stream';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout>
                <Home />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/chat/:girlId"
          element={
            <AuthGuard>
              <Chat />
            </AuthGuard>
          }
        />
        <Route
          path="/create"
          element={
            <AuthGuard>
              <Layout>
                <CreateGirl />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/stream/:girlId"
          element={
            <AuthGuard>
              <Stream />
            </AuthGuard>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
