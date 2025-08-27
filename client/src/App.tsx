import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveProfileImage } from "@/lib/profileImages";

interface InboxItem {
  senderId: string;
  senderUsername: string;
  senderProfileImage: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Inbox() {
  const { user } = useAuth();

  // Fetch inbox with conversation previews
  const { data: inboxItems = [] } = useQuery<InboxItem[]>({
    queryKey: ["/api/messages/inbox"],
    refetchInterval: 2000,
    enabled: !!user,
  });

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white neon-gradient-title">Secret Message Inbox</h1>
              <p className="text-slate-400">Your private conversations and whispered secrets</p>
            </div>
          </div>
        </motion.div>

        {/* Inbox Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="retro-card border-red-500/30 bg-gradient-to-br from-red-900/10 to-purple-900/10">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-red-300 text-center flex items-center justify-center">
                <MessageCircle className="mr-2 h-6 w-6" />
                Your Secret Messages
                {inboxItems.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-300">
                    {inboxItems.length} conversation{inboxItems.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-center">
                {inboxItems.length > 0 
                  ? "Click on any conversation to read and reply to your secret messages"
                  : "No secret messages yet - when someone whispers to you, it will appear here"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inboxItems.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                    <p className="text-slate-400">Your inbox is empty</p>
                    <p className="text-slate-500 text-sm">Secret messages will appear here when other players whisper to you</p>
                  </div>
                ) : (
                  inboxItems.map((item) => (
                    <motion.div
                      key={item.senderId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Link to={`/secret-messages?conversation=${item.senderId}`}>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-red-500/20 hover:border-red-500/40 hover:bg-slate-800/70 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border border-red-400/30">
                              <AvatarImage 
                                src={resolveProfileImage(item.senderUsername, item.senderProfileImage)} 
                                alt={`${item.senderUsername}'s avatar`} 
                              />
                              <AvatarFallback className="bg-red-800 text-red-200">
                                {item.senderUsername.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-red-300 font-medium truncate">
                                  {item.senderUsername}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-red-500/20 text-red-300 text-xs">
                                    {item.unreadCount} new
                                  </Badge>
                                  <span className="text-slate-400 text-xs">
                                    {formatDate(item.lastMessageTime)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-300 text-sm truncate">
                                {item.lastMessage}
                              </p>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant="ghost" 
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Read
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}