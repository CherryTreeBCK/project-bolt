import { useState, useEffect } from 'react';
import { Link, Copy, Plus, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { generateAccountToken, getAccountTokens } from '../db/supabase-db.js';

function AccountTokenManager({ account }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    if (account) {
      loadTokens();
    }
  }, [account]);

  const loadTokens = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const accountTokens = await getAccountTokens(account.id);
      setTokens(accountTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    if (!account) return;

    setGenerating(true);
    try {
      await generateAccountToken(account.id);
      await loadTokens();
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (token) => {
    const signupUrl = `${window.location.origin}/signup?token=${token}`;
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!account) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Link className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Select an account to manage signup tokens</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Signup Tokens</h2>
          <p className="text-gray-600">Generate secure signup URLs for @{account.username}</p>
        </div>
        <button
          onClick={handleGenerateToken}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Token
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tokens...</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8">
          <Link className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tokens</h3>
          <p className="text-gray-600 mb-4">Generate a signup token to allow users to create accounts for this Instagram profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <div key={token.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Signup Token
                    </span>
                    <span className="text-xs text-gray-500">
                      (expires {formatDate(token.expires_at)})
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded border p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 break-all">
                        {window.location.origin}/signup?token={token.token}
                      </code>
                      <button
                        onClick={() => copyToClipboard(token.token)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="Copy signup URL"
                      >
                        {copiedToken === token.token ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Created {formatDate(token.created_at)}
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Active
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <a
                    href={`${window.location.origin}/signup?token=${token.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    title="Test signup URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Generate a secure signup token for this Instagram account</li>
          <li>• Send the signup URL to users who should have access to this account's data</li>
          <li>• Users can create accounts using the token and will only see this account's followers</li>
          <li>• Tokens expire after 30 days and can only be used once</li>
        </ul>
      </div>
    </div>
  );
}

export default AccountTokenManager;