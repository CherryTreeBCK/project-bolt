import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  MessageSquare, 
  Heart,
  Share,
  Eye,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';

export function AnalyticsView() {
  const metrics = [
    { 
      title: 'Total Reach', 
      value: '2.4M', 
      change: '+18%', 
      trend: 'up',
      icon: Eye,
      color: 'text-blue-600'
    },
    { 
      title: 'Engagement Rate', 
      value: '4.2%', 
      change: '+0.8%', 
      trend: 'up',
      icon: Heart,
      color: 'text-red-600'
    },
    { 
      title: 'Conversion Rate', 
      value: '3.1%', 
      change: '-0.2%', 
      trend: 'down',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { 
      title: 'Revenue Generated', 
      value: '$45,280', 
      change: '+22%', 
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600'
    },
  ];

  const topPerformers = [
    {
      account: '@fashionista_daily',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      reach: '450K',
      engagement: '5.2%',
      revenue: '$12,500',
      growth: '+15%'
    },
    {
      account: '@food_adventures',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      reach: '380K',
      engagement: '6.1%',
      revenue: '$15,800',
      growth: '+28%'
    },
    {
      account: '@tech_innovator',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      reach: '320K',
      engagement: '4.8%',
      revenue: '$8,200',
      growth: '+12%'
    }
  ];

  const campaignData = [
    {
      name: 'Summer Collection 2024',
      accounts: 8,
      reach: '1.2M',
      engagement: '4.8%',
      revenue: '$18,500',
      roi: '245%',
      status: 'active'
    },
    {
      name: 'Tech Product Launch',
      accounts: 5,
      reach: '680K',
      engagement: '3.9%',
      revenue: '$12,300',
      roi: '198%',
      status: 'completed'
    },
    {
      name: 'Food Festival Promo',
      accounts: 6,
      reach: '520K',
      engagement: '5.4%',
      revenue: '$9,800',
      roi: '312%',
      status: 'active'
    }
  ];

  const engagementBreakdown = [
    { type: 'Likes', value: 65, color: 'bg-red-500' },
    { type: 'Comments', value: 20, color: 'bg-blue-500' },
    { type: 'Shares', value: 10, color: 'bg-green-500' },
    { type: 'Saves', value: 5, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.account} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <img 
                        src={performer.avatar} 
                        alt={performer.account}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.account}</p>
                      <p className="text-sm text-gray-600">{performer.reach} reach</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{performer.engagement}</p>
                      <p className="text-gray-600">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{performer.revenue}</p>
                      <p className="text-gray-600">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{performer.growth}</p>
                      <p className="text-gray-600">Growth</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementBreakdown.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.type}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Accounts</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Reach</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ROI</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignData.map((campaign) => (
                  <tr key={campaign.name} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{campaign.accounts}</td>
                    <td className="py-4 px-4 text-gray-600">{campaign.reach}</td>
                    <td className="py-4 px-4 text-gray-600">{campaign.engagement}</td>
                    <td className="py-4 px-4 text-gray-600">{campaign.revenue}</td>
                    <td className="py-4 px-4">
                      <span className="text-green-600 font-medium">{campaign.roi}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                        className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {campaign.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Follower Growth</span>
                <span className="text-2xl font-bold text-gray-900">+12.5%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Growth</span>
                <span className="text-2xl font-bold text-gray-900">+8.3%</span>
              </div>
              <Progress value={65} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="text-2xl font-bold text-gray-900">+22.1%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Fashion Lookbook</p>
                  <p className="text-sm text-gray-600">Video Content</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">45.2K</p>
                  <p className="text-xs text-gray-600">engagements</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Recipe Tutorial</p>
                  <p className="text-sm text-gray-600">Carousel Post</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">38.7K</p>
                  <p className="text-xs text-gray-600">engagements</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Tech Review</p>
                  <p className="text-sm text-gray-600">Single Image</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">32.1K</p>
                  <p className="text-xs text-gray-600">engagements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}