import { Instagram, Users } from 'lucide-react';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Instagram className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Instagram CRM</h1>
            <p className="text-lg text-gray-600">Manage your Instagram contacts and outreach with ease</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Instagram CRM</h3>
              <p className="text-gray-600 mb-4">
                Navigate to different sections:
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p><code className="bg-gray-100 px-2 py-1 rounded">/followers</code> - View and manage followers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;