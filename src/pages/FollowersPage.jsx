import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Filter } from 'lucide-react';
import { followersByAccount, searchFollowers } from '../db/supabase-db.js';
import { supabase } from '../lib/supabase.ts';
import FollowersTable from '../components/FollowersTable.jsx';
import ContactDrawer from '../components/ContactDrawer.jsx';

function FollowersPage() {
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  

  useEffect(() => {
    loadUserAccounts();
  }, []);

  useEffect(() => {
  console.log("hasData:", hasData);
  console.log("loading:", loading);
}, [hasData, loading]);


  const loadUserAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, load all accounts - in the future you could filter by user access
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .order('username');

      if (error) throw error;

      setUserAccounts(accounts || []);
      
      // Auto-select first account if available
      if (accounts && accounts.length > 0) {
        setSelectedAccount(accounts[0]);
        loadFollowers(accounts[0].id);
      }
    } catch (error) {
      console.error('Error loading user accounts:', error);
    }
  };

  useEffect(() => {
    filterFollowers();
  }, [followers, searchQuery, statusFilter]);

  const loadFollowers = async (accountId) => {
    setLoading(true);
    try {
      const followerList = await followersByAccount(accountId);
      setFollowers(followerList);
      setHasData(followerList.length > 0);
    } catch (error) {
      console.error('Error loading followers:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const filterFollowers = () => {
    let filtered = followers;

    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => {
        if (statusFilter === 'contacted') return f.status;
        if (statusFilter === 'uncontacted') return !f.status;
        return f.status === statusFilter;
      });
    }

    setFilteredFollowers(filtered);
  };

  const handleFollowerClick = (follower) => {
    setSelectedFollower(follower);
  };

  const handleContactUpdate = () => {
    if (selectedAccount) {
      loadFollowers(selectedAccount.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Followers Management</h1>
          <p className="text-gray-600">Track and manage your Instagram followers</p>
        </div>

        {/* Account Selection */}
        {userAccounts.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Account</h2>
            <div className="flex flex-wrap gap-2">
              {userAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => {
                    setSelectedAccount(account);
                    loadFollowers(account.id);
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    selectedAccount?.id === account.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  @{account.username}
                </button>
              ))}
            </div>
          </div>
        )}

        

        {selectedAccount && (
          <>
            {!hasData && !loading ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-12 text-center">
                <div className="text-yellow-600 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">No Data Found</h3>
                <p className="text-yellow-700 mb-4">
                  No follower data found for account <strong>@{selectedAccount.id}</strong>
                </p>
                <p className="text-yellow-600 text-sm mb-6">
                  This account may not exist in the database or no followers have been imported yet.
                </p>
              </div>
            ) : (
              <>
                {/* Account Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Account: @{selectedAccount.username}</h2>
                      <p className="text-gray-600">Managing followers for this account</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{followers.length}</div>
                        <div className="text-sm text-gray-600">Total Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {followers.filter(f => f.status).length}
                        </div>
                        <div className="text-sm text-gray-600">Contacted</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search followers by username, name, or category..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="h-5 w-5 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="contacted">Contacted</option>
                        <option value="uncontacted">Uncontacted</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                        <option value="replied">Replied</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Followers Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading followers...</p>
                    </div>
                  ) : (
                    <FollowersTable
                      followers={filteredFollowers}
                      onFollowerClick={handleFollowerClick}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}

        {!selectedAccount && userAccounts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accounts Available</h3>
            <p className="text-gray-600 mb-6">
              No Instagram accounts have been set up yet. Please contact your administrator to import account data.
            </p>
          </div>
        )}
      </div>

      {/* Contact Drawer */}
      <ContactDrawer
        follower={selectedFollower}
        onClose={() => setSelectedFollower(null)}
        onUpdate={handleContactUpdate}
      />
    </div>
  );
}

export default FollowersPage;