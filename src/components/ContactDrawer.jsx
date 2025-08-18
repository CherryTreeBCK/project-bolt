import { useState, useEffect } from 'react';
import { X, User, Calendar, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import { getFollowerWithContact, upsertContact } from '../db/supabase-db.js';

function ContactDrawer({ follower, onClose, onUpdate }) {
  const [contactData, setContactData] = useState({
    status: '',
    last_contact_date: '',
    draft_outreach: '',
    notes: '',
    next_steps: '',
    archived: false
  });
  const [saving, setSaving] = useState(false);
  const [fullFollowerData, setFullFollowerData] = useState(null);

  useEffect(() => {
    if (follower) {
      const fullData = getFollowerWithContact(follower.id);
      setFullFollowerData(fullData);
      setContactData({
        status: fullData?.status || '',
        last_contact_date: fullData?.last_contact_date || '',
        draft_outreach: fullData?.draft_outreach || '',
        notes: fullData?.notes || '',
        next_steps: fullData?.next_steps || '',
        archived: fullData?.archived || false
      });
    }
  }, [follower]);

  const handleSave = async () => {
    if (!follower) return;

    setSaving(true);
    try {
      await upsertContact(follower.id, contactData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (status) => {
    setContactData(prev => ({
      ...prev,
      status,
      last_contact_date: status && !prev.last_contact_date 
        ? new Date().toISOString().split('T')[0] 
        : prev.last_contact_date
    }));
  };

  if (!follower) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Follower Profile */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                {fullFollowerData?.profile_image_url ? (
                  <img
                    src={fullFollowerData.profile_image_url}
                    alt={fullFollowerData.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    @{fullFollowerData?.username}
                  </h3>
                  {fullFollowerData?.full_name && (
                    <p className="text-gray-600">{fullFollowerData.full_name}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{fullFollowerData?.follower_count?.toLocaleString() || 0} followers</span>
                    <span>{fullFollowerData?.following_count?.toLocaleString() || 0} following</span>
                    <span>{fullFollowerData?.posts_count || 0} posts</span>
                  </div>
                </div>
              </div>
              
              {fullFollowerData?.biography && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-700">{fullFollowerData.biography}</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Contact Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['warm', 'cold', 'replied', 'no_response'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`p-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                        contactData.status === status
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Last Contact Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Last Contact Date
                </label>
                <input
                  type="date"
                  value={contactData.last_contact_date}
                  onChange={(e) => setContactData(prev => ({ ...prev, last_contact_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Draft Outreach */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Draft Outreach Message
                </label>
                <textarea
                  value={contactData.draft_outreach}
                  onChange={(e) => setContactData(prev => ({ ...prev, draft_outreach: e.target.value }))}
                  placeholder="Draft your outreach message here..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Next Steps
                </label>
                <textarea
                  value={contactData.next_steps}
                  onChange={(e) => setContactData(prev => ({ ...prev, next_steps: e.target.value }))}
                  placeholder="What are your next steps with this contact?"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Notes
                </label>
                <textarea
                  value={contactData.notes}
                  onChange={(e) => setContactData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this contact..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Archive */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="archived"
                  checked={contactData.archived}
                  onChange={(e) => setContactData(prev => ({ ...prev, archived: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="archived" className="ml-2 text-sm text-gray-700">
                  Archive this contact
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Contact'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactDrawer;