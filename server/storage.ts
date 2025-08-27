import { type User, type InsertUser, type Vote, type InsertVote, type Message, type Announcement } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; codewordHash: string; symbol: string; isGameMaster?: number }): Promise<User>;
  updateUserCodeword(id: string, codewordHash: string): Promise<void>;
  updateUserProfileImage(id: string, profileImage: string | null): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Vote operations
  getVoteByVoterId(voterId: string): Promise<Vote | undefined>;
  setVote(voterId: string, targetId: string | null): Promise<void>;
  getVoteCounts(): Promise<{ userId: string; username: string; voteCount: number }[]>;
  getAllVotes(): Promise<Vote[]>;

  // Message operations
  createMessage(message: { senderId: string; receiverId?: string; content: string; isPrivate?: number }): Promise<Message>;
  getPublicMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]>;
  getPrivateMessages(userId: string, targetId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]>;
  getAllPrivateMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; receiverId: string; receiverUsername: string; content: string; createdAt: Date }[]>;
  getPrivateMessagesForUser(userId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]>;
  getUnreadMessagesInboxForUser(userId: string): Promise<{ senderId: string; senderUsername: string; senderProfileImage: string | null; lastMessage: string; lastMessageTime: Date; unreadCount: number }[]>;
  
  // Announcement operations
  createAnnouncement(announcement: { gameMasterId: string; title: string; content: string }): Promise<Announcement>;
  getAnnouncements(): Promise<{ id: string; gameMasterUsername: string; title: string; content: string; createdAt: Date }[]>;
  deleteAnnouncement(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private votes: Map<string, Vote>;
  private messages: Map<string, Message>;
  private announcements: Map<string, Announcement>;

  constructor() {
    this.users = new Map();
    this.votes = new Map();
    this.messages = new Map();
    this.announcements = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: { username: string; codewordHash: string; symbol: string; profileImage?: string | null; isGameMaster?: number }): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      username: user.username,
      codewordHash: user.codewordHash,
      symbol: user.symbol,
      profileImage: user.profileImage || null,
      isGameMaster: user.isGameMaster || 0,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    
    // Initialize vote record for new user
    this.votes.set(id, { voterId: id, targetId: null });
    
    return newUser;
  }

  async updateUserCodeword(id: string, codewordHash: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, codewordHash });
    }
  }

  async updateUserProfileImage(id: string, profileImage: string | null): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, profileImage });
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => 
      a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
    );
  }

  async getVoteByVoterId(voterId: string): Promise<Vote | undefined> {
    return this.votes.get(voterId);
  }

  async setVote(voterId: string, targetId: string | null): Promise<void> {
    this.votes.set(voterId, { voterId, targetId });
  }

  async getVoteCounts(): Promise<{ userId: string; username: string; voteCount: number }[]> {
    const users = await this.getAllUsers();
    const voteCounts = new Map<string, number>();
    
    // Count votes for each user
    for (const vote of this.votes.values()) {
      if (vote.targetId) {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      }
    }
    
    // Return sorted by vote count (descending) then by username
    return users.map(user => ({
      userId: user.id,
      username: user.username,
      voteCount: voteCounts.get(user.id) || 0,
    })).sort((a, b) => {
      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' });
    });
  }

  async getAllVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async createMessage(message: { senderId: string; receiverId?: string; content: string; isPrivate?: number; mediaUrl?: string; mediaType?: string }): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      senderId: message.senderId,
      receiverId: message.receiverId || null,
      content: message.content,
      isPrivate: message.isPrivate || 0,
      mediaUrl: message.mediaUrl || null,
      mediaType: message.mediaType || null,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getPublicMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]> {
    const publicMessages = Array.from(this.messages.values())
      .filter(msg => !msg.isPrivate)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
    
    return publicMessages.map(msg => {
      const sender = this.users.get(msg.senderId);
      return {
        id: msg.id,
        senderId: msg.senderId,
        senderUsername: sender?.username || 'Unknown',
        senderProfileImage: sender?.profileImage || null,
        content: msg.content,
        createdAt: msg.createdAt!,
      };
    });
  }

  async getPrivateMessages(userId: string, targetId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]> {
    const privateMessages = Array.from(this.messages.values())
      .filter(msg => 
        msg.isPrivate && 
        ((msg.senderId === userId && msg.receiverId === targetId) || 
         (msg.senderId === targetId && msg.receiverId === userId))
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
    
    return privateMessages.map(msg => {
      const sender = this.users.get(msg.senderId);
      return {
        id: msg.id,
        senderId: msg.senderId,
        senderUsername: sender?.username || 'Unknown',
        senderProfileImage: sender?.profileImage || null,
        content: msg.content,
        createdAt: msg.createdAt!,
      };
    });
  }

  async getAllPrivateMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; receiverId: string; receiverUsername: string; content: string; createdAt: Date }[]> {
    const privateMessages = Array.from(this.messages.values())
      .filter(msg => msg.isPrivate && msg.receiverId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return privateMessages.map(msg => {
      const sender = this.users.get(msg.senderId);
      const receiver = this.users.get(msg.receiverId!);
      return {
        id: msg.id,
        senderId: msg.senderId,
        senderUsername: sender?.username || 'Unknown',
        senderProfileImage: sender?.profileImage || null,
        receiverId: msg.receiverId!,
        receiverUsername: receiver?.username || 'Unknown',
        content: msg.content,
        createdAt: msg.createdAt!,
      };
    });
  }

  async getPrivateMessagesForUser(userId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]> {
    const privateMessages = Array.from(this.messages.values())
      .filter(msg => msg.isPrivate && msg.receiverId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return privateMessages.map(msg => {
      const sender = this.users.get(msg.senderId);
      return {
        id: msg.id,
        senderId: msg.senderId,
        senderUsername: sender?.username || 'Unknown',
        senderProfileImage: sender?.profileImage || null,
        content: msg.content,
        createdAt: msg.createdAt!,
      };
    });
  }

  async getUnreadMessagesInboxForUser(userId: string): Promise<{ senderId: string; senderUsername: string; senderProfileImage: string | null; lastMessage: string; lastMessageTime: Date; unreadCount: number }[]> {
    const privateMessages = Array.from(this.messages.values())
      .filter(msg => msg.isPrivate && msg.receiverId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    // Group by sender
    const conversationMap = new Map<string, { messages: any[]; sender: any }>();
    
    privateMessages.forEach(msg => {
      const sender = this.users.get(msg.senderId);
      if (!conversationMap.has(msg.senderId)) {
        conversationMap.set(msg.senderId, { messages: [], sender });
      }
      conversationMap.get(msg.senderId)!.messages.push(msg);
    });
    
    // Create inbox entries
    return Array.from(conversationMap.entries()).map(([senderId, data]) => ({
      senderId,
      senderUsername: data.sender?.username || 'Unknown',
      senderProfileImage: data.sender?.profileImage || null,
      lastMessage: data.messages[0].content,
      lastMessageTime: data.messages[0].createdAt!,
      unreadCount: data.messages.length, // All messages are unread in this simple system
    })).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }

  async createAnnouncement(announcement: { gameMasterId: string; title: string; content: string }): Promise<Announcement> {
    const id = randomUUID();
    const newAnnouncement: Announcement = {
      id,
      gameMasterId: announcement.gameMasterId,
      title: announcement.title,
      content: announcement.content,
      mediaUrl: null,
      mediaType: null,
      createdAt: new Date(),
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async getAnnouncements(): Promise<{ id: string; gameMasterUsername: string; title: string; content: string; createdAt: Date }[]> {
    const announcements = Array.from(this.announcements.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return announcements.map(announcement => {
      const gameMaster = this.users.get(announcement.gameMasterId);
      return {
        id: announcement.id,
        gameMasterUsername: gameMaster?.username || 'Game Master',
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.createdAt!,
      };
    });
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }
}

export const storage = new MemStorage();
