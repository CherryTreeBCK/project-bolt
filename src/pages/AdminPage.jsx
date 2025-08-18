import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { getAllAccounts, upsertAccount, importFollowers } from '../db/supabase-db.js';
import AccountSelect from '../components/AccountSelect.jsx';
import AccountTokenManager from '../components/AccountTokenManager.jsx';

function AdminPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);   
  const [statusText, setStatusText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const allAccounts = await getAllAccounts();
    setAccounts(allAccounts);
  };

  const handleAccountSelect = async (account) => {
    try {
      // Upsert the account to ensure it exists in the database
      await upsertAccount({
        id: account.id,
        username: account.username,
        full_name: account.full_name,
        profile_image_url: account.profile_image_url
      });
      
      setSelectedAccount(account);
      
      // Reload accounts list to reflect the latest data
      await loadAccounts();
    } catch (error) {
      console.error('Error selecting account:', error);
      setMessage({ type: 'error', text: 'Failed to select account. Please try again.' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Please select a valid CSV file' });
    }
  };

const handleUpload = async () => {
    setLoading(true);
    setProgress(0);
    setStatusText("Starting...");

    const eventSource = new EventSource("http://localhost:3001/api/progress");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatusText(data.status || "");
      setProgress(data.progress || 0);

      if (data.done) {
        setLoading(false);
        eventSource.close();
      }

      if (data.error) {
        setLoading(false);
        eventSource.close();
        alert("Error: " + data.status);
      }
    };

    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
      alert("Connection lost");
    };
  };



  const navigateBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your Instagram accounts and import follower data</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Account Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Account</h2>
            <AccountSelect
              accounts={accounts}
              selectedAccount={selectedAccount}
              onAccountSelect={handleAccountSelect}
            />
          </div>

          {/* CSV Upload */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Followers CSV
            </h2>

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  Import Followers
                </>
              )}
            </button>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="bg-green-600 h-4 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Status text */}
            <p className="mt-2 text-gray-700 text-sm">{statusText}</p>
          </div>
        </div>

        {/* Account Token Manager */}
        <div className="mt-8">
          <AccountTokenManager account={selectedAccount} />
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* CSV Format Help */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CSV Format Requirements</h2>
          <div className="text-sm text-gray-600 space-y-4">
            <p>Your CSV file should include the following columns:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>ID</strong> - Unique follower ID</li>
              <li><strong>Username</strong> - Instagram username</li>
              <li><strong>Full Name</strong> - Display name</li>
              <li><strong>follower count</strong> - Number of followers</li>
              <li><strong>following count</strong> - Number of following</li>
              <li><strong>posts count</strong> - Number of posts</li>
              <li><strong>is verified</strong> - true/false</li>
              <li><strong>is private</strong> - true/false</li>
              <li><strong>biography</strong> - Bio text</li>
              <li><strong>external url</strong> - Link in bio</li>
              <li><strong>category</strong> - Account category</li>
              <li><strong>priority</strong> - Contact priority</li>
              <li><strong>profile image url</strong> - Profile picture URL (optional)</li>
            </ul>
          </div>
        </div>
          <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 text-lg rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;