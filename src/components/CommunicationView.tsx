import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Paperclip,
  Smile,
  MoreHorizontal
} from 'lucide-react';

export function CommunicationView() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');

  const conversations = [
    {
      id: 1,
      account: {
        username: '@fashionista_daily',
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop'
      },
      lastMessage: 'Thanks for the collaboration proposal! I\'d love to discuss this further.',
      timestamp: '2 hours ago',
      unread: 2,
      status: 'active',
      priority: 'high',
      labels: ['Collaboration', 'Fashion']
    },
    {
      id: 2,
      account: {
        username: '@tech_innovator',
        name: 'Michael Chen',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop'
      },
      lastMessage: 'I\'ll get back to you by tomorrow with the content calendar.',
      timestamp: '1 day ago',
      unread: 0,
      status: 'pending',
      priority: 'medium',
      labels: ['Content', 'B2B']
    },
    {
      id: 3,
      account: {
        username: '@food_adventures',
        name: 'Emma Rodriguez',
        avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=100&h=100&fit=crop'
      },
      lastMessage: 'The recipe video turned out amazing! Thank you for the guidance.',
      timestamp: '3 hours ago',
      unread: 1,
      status: 'active',
      priority: 'low',
      labels: ['Recipe', 'Video Content']
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'user',
      content: 'Hi Sarah! I came across your Instagram and I\'m really impressed with your fashion content. Would you be interested in a collaboration opportunity?',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: 2,
      sender: 'contact',
      content: 'Hi! Thank you so much for reaching out. I\'d love to hear more about the collaboration. What did you have in mind?',
      timestamp: '11:15 AM',
      type: 'text'
    },
    {
      id: 3,
      sender: 'user',
      content: 'We\'re launching a new sustainable fashion line and think you\'d be perfect for promoting it. I can send over the full proposal with details about compensation and deliverables.',
      timestamp: '11:45 AM',
      type: 'text'
    },
    {
      id: 4,
      sender: 'contact',
      content: 'That sounds really interesting! I\'m passionate about sustainable fashion. Please send over the proposal and I\'ll review it.',
      timestamp: '12:20 PM',
      type: 'text'
    },
    {
      id: 5,
      sender: 'user',
      content: 'Perfect! I\'ve attached the collaboration proposal. Looking forward to working with you!',
      timestamp: '1:00 PM',
      type: 'text',
      attachment: 'collaboration_proposal.pdf'
    }
  ];

  const templates = [
    {
      name: 'Initial Outreach',
      content: 'Hi {name}! I love your content on {topic}. Would you be interested in a collaboration opportunity with our brand?'
    },
    {
      name: 'Follow-up',
      content: 'Hi {name}, I wanted to follow up on my previous message about the collaboration opportunity. Are you available for a quick call this week?'
    },
    {
      name: 'Thank You',
      content: 'Thank you for the great collaboration, {name}! The content exceeded our expectations. We\'d love to work together again soon.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Communication</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Message
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
            <MessageSquare className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                    selectedConversation === conversation.id 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.account.avatar} />
                      <AvatarFallback>{conversation.account.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.account.username}
                        </p>
                        <div className="flex items-center space-x-1">
                          {conversation.priority === 'high' && (
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          )}
                          {conversation.unread > 0 && (
                            <Badge className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        <Badge 
                          variant={conversation.status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs ${conversation.status === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                        >
                          {conversation.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversations[0].account.avatar} />
                      <AvatarFallback>{conversations[0].account.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {conversations[0].account.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {conversations[0].account.name}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-[400px] p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.attachment && (
                          <div className="mt-2 p-2 bg-white/20 rounded flex items-center space-x-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-xs">{message.attachment}</span>
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Use template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-end space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1 resize-none"
                      rows={3}
                    />
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="font-medium text-gray-900">No conversation selected</h3>
                  <p className="text-sm text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">68%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">2.4h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}