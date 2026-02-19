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
  const [maxFollowers, setMaxFollowers] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config');
        if (!res.ok) throw new Error('Failed to load config');
        const json = await res.json();
        setMaxFollowers(json.maxImportFollowers);
      } catch (err) {
        console.error('Error loading config:', err);
        setMaxFollowers('N/A');
      }
    }
    loadConfig();
  }, []);

  

  const loadAccounts = async () => {
    const allAccounts = await getAllAccounts();
    setAccounts(allAccounts);
  };

const handleAccountSelect = async (account) => {
  try {
    console.log("This is working. Selected account: ", account.username);

    await upsertAccount({
      id: account.id,
      username: account.username,
      full_name: account.full_name,
      profile_image_url: account.profile_image_url
    });
    
    setSelectedAccount(account);
    try {
      const normalized = account.username?.replace(/^\@/, "");
      console.log("Saving ownerAccount to localStorage:", normalized);
      localStorage.setItem("ownerAccount", normalized);
    } catch (e) {
      console.warn('Could not persist selectedAccount in localStorage', e);
    }
    
    await loadAccounts();
  } catch (error) {
    console.error('Error selecting account:', error);
    setMessage({ type: 'error', text: 'Failed to select account. Please try again.' });
  }
};


  

const handleUpload = async () => {
  if (!selectedAccount?.username) {
    return alert('Please select an Instagram account before importing.');
  }

  console.log("Current account: ");
  console.log(selectedAccount.username);

  setLoading(true);
  setProgress(0);
  setStatusText("Starting...");

  const ownerAccount = encodeURIComponent(selectedAccount.username);

  const params = new URLSearchParams({ ownerAccount });
  const eventSource = new EventSource(`http://localhost:3001/api/progress?${params.toString()}`);

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your Instagram accounts and import follower data</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Account</h2>
            <AccountSelect
              accounts={accounts}
              selectedAccount={selectedAccount}
              onAccountSelect={handleAccountSelect}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Followers CSV
            </h2>


            <div className="text-md text-gray-600 mb-2">
              <p>
                Max followers to process: {maxFollowers ?? 'loading...'}
              </p>
            </div>

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

            <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="bg-green-600 h-4 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <p className="mt-2 text-gray-700 text-sm">{statusText}</p>
          </div>
        </div>

        <div className="mt-8">
          <AccountTokenManager account={selectedAccount} />
        </div>

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