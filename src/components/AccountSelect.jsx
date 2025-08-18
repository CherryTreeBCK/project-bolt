import { useState } from 'react';
import { Plus, User, Edit2 } from 'lucide-react';

function AccountSelect({ accounts, selectedAccount, onAccountSelect }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    full_name: '',
    profile_image_url: ''
  });

  const handleAddNew = () => {
    setFormData({
      id: '',
      username: '',
      full_name: '',
      profile_image_url: ''
    });
    setEditingAccount(null);
    setShowAddForm(true);
  };

  const handleEdit = (account) => {
    setFormData(account);
    setEditingAccount(account);
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim()) return;

    const accountData = {
      ...formData,
      id: formData.id || formData.username.replace('@', ''),
      username: formData.username.replace('@', '')
    };

    onAccountSelect(accountData);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-4">
      {/* Existing Accounts */}
      <div className="space-y-2">
        {accounts.map(account => (
          <div
            key={account.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedAccount?.id === account.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAccountSelect(account)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {account.profile_image_url ? (
                  <img
                    src={account.profile_image_url}
                    alt={account.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">@{account.username}</div>
                  {account.full_name && (
                    <div className="text-sm text-gray-600">{account.full_name}</div>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(account);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Account Button */}
      {!showAddForm && (
        <button
          onClick={handleAddNew}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Account</span>
        </button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g., johnsmith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="https://example.com/profile.jpg (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AccountSelect;