import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  MessageCircle, 
  Share, 
  Users, 
  TrendingUp,
  MoreHorizontal,
  ExternalLink,
  Mail,
  Phone,
  UserPlus,
  Eye,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Loader2,
  Shield,
  Lock
} from 'lucide-react';
import { loadFollowersFromCSV, type FollowerData } from '@/utils/csvLoader';

export function FollowersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLeadStatus, setSelectedLeadStatus] = useState('all');
  const [sortBy, setSortBy] = useState('leadScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([]);
  const [followers, setFollowers] = useState<FollowerData[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 15;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadFollowersFromCSV();
        console.log('Loaded followers data:', data.length, 'followers');
        console.log('First follower:', data[0]);
        setFollowers(data);
      } catch (error) {
        console.error('Failed to load followers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredFollowers = followers.filter(follower => {
    const matchesSearch = follower.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         follower.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || follower.category.toLowerCase() === selectedCategory;
    const matchesLeadStatus = selectedLeadStatus === 'all' || 
                             follower.leadStatus.toLowerCase().replace(' ', '') === selectedLeadStatus;
    return matchesSearch && matchesCategory && matchesLeadStatus;
  });

  const sortedFollowers = [...filteredFollowers].sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a];
    let bValue = b[sortBy as keyof typeof b];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedFollowers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFollowers = sortedFollowers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleSelectFollower = (id: number) => {
    setSelectedFollowers(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFollowers.length === paginatedFollowers.length) {
      setSelectedFollowers([]);
    } else {
      setSelectedFollowers(paginatedFollowers.map(f => f.id));
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'Hot Lead': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm Lead': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold Lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(followers.map(f => f.category))];
    return categories.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          <span className="text-gray-600">Loading followers data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Instagram Followers</h2>
          <p className="text-gray-600 mt-1">Manage and analyze your follower relationships from Marin Buzz</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Import Followers
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username, name, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLeadStatus} onValueChange={setSelectedLeadStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Lead Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="hotlead">Hot Leads</SelectItem>
                  <SelectItem value="warmlead">Warm Leads</SelectItem>
                  <SelectItem value="coldlead">Cold Leads</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">{filteredFollowers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFollowers.filter(f => f.leadStatus === 'Hot Lead').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFollowers.filter(f => f.verified).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredFollowers.filter(f => f.potentialValue === 'High').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedFollowers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedFollowers.length} follower{selectedFollowers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Contacts
                </Button>
                <Button size="sm" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Mark as Priority
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <Checkbox
                      checked={selectedFollowers.length === paginatedFollowers.length && paginatedFollowers.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-gray-300 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Follower</th>
                  
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('followers')}
                      className="p-0 h-auto font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Followers
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('engagement')}
                      className="p-0 h-auto font-medium text-gray-900 hover:bg-gray-100"
                    >
                      Engagement
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Bio</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFollowers.map((follower) => (
                  <tr key={follower.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Checkbox
                        checked={selectedFollowers.includes(follower.id)}
                        onCheckedChange={() => handleSelectFollower(follower.id)}
                        className="border-gray-300 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={follower.avatar} />
                            <AvatarFallback>{follower.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          {follower.verified && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          {follower.isPrivate && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                              <Lock className="text-white h-2 w-2" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{follower.username}</p>
                            {follower.externalUrl && (
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </Button>
                            )}
                          <p className="text-sm text-gray-600 truncate">{follower.name}</p>
                          <p className="text-xs text-gray-500 truncate">{follower.location}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{formatNumber(follower.followers)}</p>
                        <p className="text-gray-500">{follower.posts} posts</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold text-gray-900">{follower.engagement}%</span>
                        <div className="flex items-center space-x-1">
                          {follower.engagement >= 4 && <Heart className="h-3 w-3 text-red-500" />}
                          {follower.engagement >= 3 && <MessageCircle className="h-3 w-3 text-blue-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="text-xs">
                        {follower.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={follower.bio}>
                        {follower.bio}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline" className="h-8 px-2 bg-gray-50 hover:bg-gray-100">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-2 bg-gray-50 hover:bg-gray-100">
                          <UserPlus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-2 bg-gray-50 hover:bg-gray-100">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedFollowers.length)} of {sortedFollowers.length} followers
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-50 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 p-0 ${currentPage === totalPages ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-50 hover:bg-gray-100"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}