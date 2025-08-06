import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // adjust path if needed

import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Star,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ExternalLink,
  ArrowUpRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';

export function Dashboard() {
    const [followersCount, setFollowersCount] = useState<string>('Loading...');
    const [topFollowersList, setTopFollowersList] = useState<any[]>([]); 

  useEffect(() => {
    const fetchSelfFollowerCount = async () => {
      const { data, error } = await supabase
        .from('account_info')
        .select('follower_count')
        .eq('id', '74469073887')
        .single();

      if (error) {
        console.error('❌ Failed to fetch follower count:', error.message);
        setFollowersCount('N/A');
        return;
      }

      setFollowersCount(data.follower_count?.toLocaleString() || '0');
    };

  async function getMaxPriority() {
    const { data, error } = await supabase
      .from('followers_duplicate')
      .select('priority')
      .not('priority', 'is', null)
      .order('priority', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching max priority:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null; // no priority found
    }

    return data[0].priority;
  }


const fetchTopFollowers = async () => {
  const maxPriority = await getMaxPriority();
  console.log('Highest priority:', maxPriority);

  const { data: topFollowers, error: topFollowersError } = await supabase
    .from('followers_duplicate')
    .select('*')
    .eq('priority', maxPriority);

  if (topFollowersError) {
    console.error('❌ Failed to get top followers:', topFollowersError.message);
    return;
  }

  let combinedFollowers = topFollowers;

  // If we have fewer than 4, fetch one lower priority as well
  if (topFollowers.length < 4 && maxPriority > 0) {
    const { data: lowerPriorityFollowers, error: lowerError } = await supabase
      .from('followers_duplicate')
      .select('*')
      .eq('priority', maxPriority - 1);

    if (lowerError) {
      console.error('❌ Failed to get lower priority followers:', lowerError.message);
    } else {
      // Merge the two arrays
      combinedFollowers = [...topFollowers, ...lowerPriorityFollowers];
    }
  }

  console.log('Final combined followers:', combinedFollowers);
  setTopFollowersList(combinedFollowers);
};


    fetchSelfFollowerCount();
    fetchTopFollowers();
    console.log("List: " + topFollowersList);
  }, []);
  const stats = [
    { 
      title: 'Total Followers', 
      value: followersCount, 
      change: '+12%', 
      changeType: 'positive',
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Hot Leads', 
      value: '18', 
      change: '+3', 
      changeType: 'positive',
      icon: TrendingUp, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      title: 'New Followers', 
      value: '247', 
      change: '+18%', 
      changeType: 'positive',
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Active Conversations', 
      value: '12', 
      change: '+2', 
      changeType: 'positive',
      icon: MessageSquare, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  const recentActivity = [
    { 
      type: 'follow', 
      account: '@fashionista_daily', 
      name: 'Sarah Johnson',
      action: 'Started following you', 
      time: '2h ago',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      icon: Users,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    { 
      type: 'engagement', 
      account: '@tech_innovator', 
      name: 'Michael Chen',
      action: 'Liked your recent post', 
      time: '4h ago',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      icon: Heart,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    { 
      type: 'message', 
      account: '@food_adventures', 
      name: 'Emma Rodriguez',
      action: 'Commented on your story', 
      time: '6h ago',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      icon: MessageCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    { 
      type: 'profile', 
      account: '@lifestyle_guru', 
      name: 'Jessica Williams',
      action: 'Viewed your profile', 
      time: '1d ago',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      icon: Activity,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
  ];

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'Hot Lead': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm Lead': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold Lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your Instagram CRM.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="bg-gray-50 hover:bg-gray-100">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
            <Zap className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Lead Prospects */}
        <Card className="lg:col-span-2 shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Top Lead Prospects</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Your highest potential followers for conversion</p>
              </div>
              <Badge className="bg-gradient-to-r from-pink-100 to-red-100 text-red-800 border-red-200">
                <Target className="h-3 w-3 mr-1" />
                High Value
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {topFollowersList.map((follower, index) => (
                <div key={follower.username} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        #{index + 1}
                      </div>
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          {/* No avatar URL in your data; consider using a placeholder */}
                          <AvatarFallback>{follower.full_name ? follower.full_name[0] : follower.username[0]}</AvatarFallback>
                        </Avatar>
                        {follower.is_verified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">{follower.username}</p>
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{follower.full_name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="font-medium">{follower.follower_count} followers</span>
                        <span>•</span>
                        {/* You don’t have engagement in data; consider removing or calculating */}
                        <span>{/* engagement value here or remove */}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {follower.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* The right section could be adjusted or removed if you don't have these values */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs font-semibold border ${getLeadScoreColor(follower.leadScore)}`}>
                          {follower.leadScore || 'N/A'}
                        </Badge>
                        <Badge className={`text-xs border ${getLeadStatusColor(follower.leadStatus)}`}>
                          {follower.leadStatus || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-green-600 font-medium">{follower.growth || '-'}</span>
                        <span className="text-gray-500">{follower.lastActivity || '-'}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="bg-gray-50 hover:bg-gray-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
                View All Prospects
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
            <p className="text-sm text-gray-600">Latest interactions and updates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${activity.iconBg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback className="text-xs">{activity.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.account}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full bg-gray-50 hover:bg-gray-100">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Lead Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Followers Analyzed</span>
                  <span className="font-semibold text-gray-900">2,847/3,000</span>
                </div>
                <Progress value={95} className="h-2 bg-gray-100" />
                <p className="text-xs text-gray-500">95% complete</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lead Conversion</span>
                  <span className="font-semibold text-gray-900">12%</span>
                </div>
                <Progress value={12} className="h-2 bg-gray-100" />
                <p className="text-xs text-green-600">+2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average Engagement</span>
                  <span className="font-semibold text-gray-900">4.2%</span>
                </div>
                <Progress value={84} className="h-2 bg-gray-100" />
                <p className="text-xs text-green-600">Above industry average</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold text-gray-900">68%</span>
                </div>
                <Progress value={68} className="h-2 bg-gray-100" />
                <p className="text-xs text-gray-500">Good response rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-semibold text-green-600">+18%</span>
                </div>
                <Progress value={75} className="h-2 bg-gray-100" />
                <p className="text-xs text-green-600">Excellent growth</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hot Leads</span>
                  <span className="font-semibold text-gray-900">18/50</span>
                </div>
                <Progress value={36} className="h-2 bg-gray-100" />
                <p className="text-xs text-gray-500">36% of target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}