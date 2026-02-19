import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dashboard } from './Dashboard';
import { FollowersView } from './FollowersView';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';

export function DashboardLayout({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex min-h-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>
            <TabsContent value="followers" className="mt-0">
              <FollowersView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
