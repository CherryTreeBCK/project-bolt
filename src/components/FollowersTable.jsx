import { User, Shield, Lock, ExternalLink, Users, MessageCircle } from 'lucide-react';

function FollowersTable({ followers, onFollowerClick }) {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (followers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Followers Found</h3>
        <p className="text-gray-600">No followers match your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stats
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {followers.map((follower) => (
            <tr
              key={follower.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => onFollowerClick(follower)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {follower.profile_image_url ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={follower.profile_image_url}
                        alt={follower.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        @{follower.username}
                      </div>
                      <a
                        href={`https://www.instagram.com/${follower.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        title="View Instagram profile"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {follower.is_verified && (
                        <Shield className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                      {follower.is_private && (
                        <Lock className="h-4 w-4 text-gray-500 ml-1" />
                      )}
                    </div>
                    {follower.full_name && (
                      <div className="text-sm text-gray-500 truncate max-w-72" title={follower.full_name}>
                        {follower.full_name}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 space-y-1">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 text-gray-400 mr-1" />
                    <span>{formatNumber(follower.follower_count)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(follower.following_count)} following • {follower.posts_count} posts
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{follower.category || '-'}</div>
                {follower.priority && (
                  <div className="text-xs text-gray-500">Priority: {follower.priority}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {follower.status ? (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(follower.status)}`}>
                    {follower.status}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No contact</span>
                )}
                {follower.last_contact_date && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last: {new Date(follower.last_contact_date).toLocaleDateString()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowerClick(follower);
                  }}
                  className="text-blue-600 hover:text-blue-900 flex items-center transition-colors duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Contact
                </button>
                {follower.external_url && (
                  <a
                    href={follower.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-purple-600 hover:text-purple-900 flex items-center mt-1 transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FollowersTable;