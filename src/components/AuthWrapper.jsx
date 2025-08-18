import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { LogIn, Mail, Lock, Instagram, Eye, EyeOff } from 'lucide-react';
import { validateSignupToken, markTokenAsUsed } from '../db/supabase-db.js';

function AuthWrapper({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signupToken, setSignupToken] = useState(null);
  const [tokenAccount, setTokenAccount] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin and redirect
  useEffect(() => {
    if (session?.user?.email === 'admin@instagramcrm.com') {
      // Only redirect if not already on admin page
      if (location.pathname !== '/admin') {
        navigate('/admin');
      }
    } else if (session?.user && location.pathname !== '/followers' && location.pathname !== '/admin') {
      // Redirect non-admin users to followers page
      //navigate('/followers');
    }
  }, [session, navigate, location.pathname]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for signup token in URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token && location.pathname === '/signup') {
      validateToken(token);
    }
  }, [location.search, location.pathname]);

  const validateToken = async (token) => {
    try {
      const tokenData = await validateSignupToken(token);
      if (tokenData) {
        setSignupToken(token);
        setTokenAccount(tokenData.accounts);
        setAuthMode('signup');
      } else {
        setError('Invalid or expired signup token');
      }
    } catch (error) {
      setError('Error validating signup token');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Mark token as used if this was a token signup
        if (signupToken) {
          await markTokenAsUsed(signupToken);
        }
        
        setError('Check your email for the confirmation link!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const fillAdminCredentials = () => {
    setEmail('admin@instagramcrm.com');
    setPassword('admin123456');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <Instagram className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Instagram CRM</h1>
              <p className="text-gray-600">
                {tokenAccount 
                  ? `Create account to access @${tokenAccount.username} data`
                  : 'Sign in to manage your Instagram contacts'
                }
              </p>
            </div>

            {tokenAccount && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Account Access</h3>
                <p className="text-sm text-blue-800">
                  You're creating an account to access <strong>@{tokenAccount.username}</strong> follower data.
                </p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {authLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {authMode === 'signin' ? 'Signing in...' : 'Signing up...'}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-purple-600 hover:text-purple-800 text-sm transition-colors duration-200"
                  disabled={!!signupToken}
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* User info bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">
              Signed in as <strong>{session.user.email}</strong>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default AuthWrapper;