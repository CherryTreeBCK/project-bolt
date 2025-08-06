import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users2, 
  MessageSquare, 
  Users, 
  BarChart3,
  UserPlus
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'followers', label: 'Instagram Followers', icon: Users2 },
    { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'communication', label: 'Communication', icon: MessageSquare },

  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 min-w-64 bg-white border-r border-gray-200 p-4 flex-shrink-0">
      <div className="mb-6">
        <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Follower
        </Button>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              'w-full justify-start',
              activeTab === item.id 
                ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                : 'bg-gray-50 text-gray-700 hover:border hover:border-gray-300 hover:bg-gray-100'
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            <span className="truncate">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
}