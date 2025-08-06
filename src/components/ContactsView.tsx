import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

export function ContactsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const contacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      username: '@fashionista_daily',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      email: 'sarah@fashionista.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      category: 'Fashion',
      rating: 4.8,
      status: 'Active',
      lastContact: '2 hours ago',
      nextFollowUp: '2025-01-15',
      tags: ['Influencer', 'Fashion', 'Premium', 'VIP'],
      notes: 'Highly engaged fashion influencer with great conversion rates. Prefers morning communications.',
      collaborations: 5,
      totalRevenue: '$12,500',
      socialMedia: {
        instagram: '@fashionista_daily',
        followers: '125K',
        engagement: '4.2%'
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      username: '@tech_innovator',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      email: 'michael@techinnovator.com',
      phone: '+1 (555) 987-6543',
      location: 'San Francisco, CA',
      category: 'Technology',
      rating: 4.6,
      status: 'Pending',
      lastContact: '1 day ago',
      nextFollowUp: '2025-01-12',
      tags: ['Entrepreneur', 'Tech', 'B2B', 'Startup'],
      notes: 'Tech entrepreneur with strong B2B network. Interested in long-term partnerships.',
      collaborations: 2,
      totalRevenue: '$8,200',
      socialMedia: {
        instagram: '@tech_innovator',
        followers: '89K',
        engagement: '3.8%'
      }
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      username: '@food_adventures',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop',
      email: 'emma@foodadventures.com',
      phone: '+1 (555) 456-7890',
      location: 'Los Angeles, CA',
      category: 'Food',
      rating: 4.9,
      status: 'Active',
      lastContact: '3 hours ago',
      nextFollowUp: '2025-01-18',
      tags: ['Food Blogger', 'Recipe Creator', 'Lifestyle', 'Video Content'],
      notes: 'Creative food blogger with excellent video content. Very responsive and professional.',
      collaborations: 8,
      totalRevenue: '$15,800',
      socialMedia: {
        instagram: '@food_adventures',
        followers: '67K',
        engagement: '5.1%'
      }
    }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || contact.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ContactCard = ({ contact }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback>{contact.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">{contact.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{contact.username}</p>
              <Badge 
                variant={contact.status === 'Active' ? 'default' : 'secondary'}
                className={`text-xs mt-1 ${contact.status === 'Active' ? 'bg-green-100 text-green-800' : ''}`}
              >
                {contact.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 truncate">{contact.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{contact.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{contact.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {contact.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{contact.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Collaborations</p>
            <p className="font-semibold text-gray-900">{contact.collaborations}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Revenue</p>
            <p className="font-semibold text-gray-900">{contact.totalRevenue}</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Instagram</span>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-gray-600">{contact.socialMedia.followers}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
            <span>Engagement Rate</span>
            <span>{contact.socialMedia.engagement}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Last Contact:</span>
            <span className="text-gray-900">{contact.lastContact}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Next Follow-up:</span>
            <span className="text-gray-900">{contact.nextFollowUp}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="text-sm">
          <p className="text-gray-600 mb-1">Notes:</p>
          <p className="text-gray-800 line-clamp-2">{contact.notes}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{filteredContacts.length}</p>
              </div>
              <div className="text-blue-600">👥</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredContacts.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <div className="text-green-600">✅</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
              <div className="text-yellow-600">⭐</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups Due</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="text-orange-600">📅</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Contacts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up Due</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.filter(c => c.status === 'Active').map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.filter(c => c.status === 'Pending').map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="follow-up" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.filter(c => new Date(c.nextFollowUp) <= new Date()).map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}