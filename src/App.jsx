import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { initDB } from './db/supabase-db.js';
import AuthWrapper from './components/AuthWrapper.jsx';
import AdminPage from './pages/AdminPage.jsx';
import FollowersPage from './pages/FollowersPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { DashboardLayout } from './components/DashboardLayout';


function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDB();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDB();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (!isDbInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 mb-4">
            <Settings className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Connection Failed</h3>
          <p className="text-gray-600 mb-4">
            Unable to connect to Supabase. Please check your configuration and try again.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Setup Required:</strong>
            </p>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click "Connect to Supabase" in the top right</li>
              <li>Set up your Supabase project</li>
              <li>Run the database migrations</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

return (
  <Routes>
    <Route
      path="/admin"
      element={
        <AuthWrapper>
          <AdminPage />
        </AuthWrapper>
      }
    />
    <Route
      path="/followers"
      element={
        <AuthWrapper>
          <FollowersPage />
        </AuthWrapper>
      }
    />
    <Route
      path="/signup"
      element={
        <AuthWrapper>
          <HomePage />
        </AuthWrapper>
      }
    />
    <Route
      path="/"
      element={
        <AuthWrapper>
          <HomePage />
        </AuthWrapper>
      }
    />
    <Route
      path="/dashboard"
      element={
        <AuthWrapper>
          <DashboardLayout initialTab="dashboard" />
        </AuthWrapper>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
}

export default App;
