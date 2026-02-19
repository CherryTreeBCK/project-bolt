import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { FollowersView } from './components/FollowersView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

export default App;