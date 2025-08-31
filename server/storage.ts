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
  getUsedProfileImages(): Promise<string[]>;

  // Vote operations
  getVoteByVoterId(voterId: string): Promise<Vote | undefined>;
  setVote(voterId: string, targetId: string | null): Promise<void>;
  getVoteCounts(): Promise<{ userId: string; username: string; voteCount: number }[]>;
  getAllVotes(): Promise<Vote[]>;

  // Message operations
  createMessage(message: { senderId: string; receiverId?: string; content: string; isPrivate?: number; mediaUrl?: string; mediaType?: string }): Promise<Message>;
  getPublicMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]>;
  getPrivateMessages(userId: string, targetId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]>;
  getAllPrivateMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; receiverId: string; receiverUsername: string; content: string; createdAt: Date }[]>;
  getPrivateMessagesForUser(userId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]>;
  getUnreadMessagesInboxForUser(userId: string): Promise<{ senderId: string; senderUsername: string; senderProfileImage: string | null; lastMessage: string; lastMessageTime: Date; unreadCount: number }[]>;
  
  // Announcement operations
  createAnnouncement(announcement: { gameMasterId: string; title: string; content: string; mediaUrl?: string; mediaType?: string }): Promise<Announcement>;
  getAnnouncements(): Promise<{ id: string; gameMasterUsername: string; title: string; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // Card draw operations
  canUserDrawCard(userId: string): Promise<boolean>;
  getLastCardDraw(userId: string): Promise<{ drawnAt: Date } | null>;
  recordCardDraw(cardDraw: { userId: string; cardId: string; cardTitle: string; cardType: string; cardEffect: string }): Promise<{ id: string; drawnAt: Date }>;
  getGameMasters(): Promise<User[]>;
}

interface CardDrawRecord {
  id: string;
  userId: string;
  cardId: string;
  cardTitle: string;
  cardType: string;
  cardEffect: string;
  drawnAt: Date;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private votes: Map<string, Vote>;
  private messages: Map<string, Message>;
  private announcements: Map<string, Announcement>;
  private cardDraws: Map<string, CardDrawRecord>;

  constructor() {
    this.users = new Map();
    this.votes = new Map();
    this.messages = new Map();
    this.announcements = new Map();
    this.cardDraws = new Map();
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

  async getUsedProfileImages(): Promise<string[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers
      .map(user => user.profileImage)
      .filter((image): image is string => image !== null && image !== undefined);
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

  async canUserDrawCard(userId: string): Promise<boolean> {
    const userDraws = Array.from(this.cardDraws.values())
      .filter(draw => draw.userId === userId)
      .sort((a, b) => b.drawnAt.getTime() - a.drawnAt.getTime());
    
    if (userDraws.length === 0) {
      return true; // First draw
    }
    
    const lastDraw = userDraws[0];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return lastDraw.drawnAt < threeDaysAgo;
  }

  async getLastCardDraw(userId: string): Promise<{ drawnAt: Date } | null> {
    const userDraws = Array.from(this.cardDraws.values())
      .filter(draw => draw.userId === userId)
      .sort((a, b) => b.drawnAt.getTime() - a.drawnAt.getTime());
    
    if (userDraws.length === 0) {
      return null;
    }
    
    return { drawnAt: userDraws[0].drawnAt };
  }

  async recordCardDraw(cardDraw: { userId: string; cardId: string; cardTitle: string; cardType: string; cardEffect: string }): Promise<{ id: string; drawnAt: Date }> {
    const id = randomUUID();
    const drawnAt = new Date();
    
    const record: CardDrawRecord = {
      id,
      userId: cardDraw.userId,
      cardId: cardDraw.cardId,
      cardTitle: cardDraw.cardTitle,
      cardType: cardDraw.cardType,
      cardEffect: cardDraw.cardEffect,
      drawnAt,
    };
    
    this.cardDraws.set(id, record);
    return { id, drawnAt };
  }

  async getGameMasters(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isGameMaster === 1);
  }
}

// Switch to database storage for persistence
import { db } from "./db";
import { users, votes, messages, announcements, cardDraws } from "@shared/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: { username: string; codewordHash: string; symbol: string; profileImage?: string | null; isGameMaster?: number }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        username: user.username,
        codewordHash: user.codewordHash,
        symbol: user.symbol,
        profileImage: user.profileImage || null,
        isGameMaster: user.isGameMaster || 0,
      })
      .returning();

    // Initialize vote record for new user
    await db.insert(votes).values({
      voterId: newUser.id,
      targetId: null,
    }).onConflictDoNothing();

    return newUser;
  }

  async updateUserCodeword(id: string, codewordHash: string): Promise<void> {
    await db.update(users).set({ codewordHash }).where(eq(users.id, id));
  }

  async updateUserProfileImage(id: string, profileImage: string | null): Promise<void> {
    await db.update(users).set({ profileImage }).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  }

  async getUsedProfileImages(): Promise<string[]> {
    const allUsers = await db.select({ profileImage: users.profileImage }).from(users);
    return allUsers
      .map(user => user.profileImage)
      .filter((image): image is string => image !== null && image !== undefined);
  }

  async getVoteByVoterId(voterId: string): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.voterId, voterId));
    return vote || undefined;
  }

  async setVote(voterId: string, targetId: string | null): Promise<void> {
    await db
      .insert(votes)
      .values({ voterId, targetId })
      .onConflictDoUpdate({
        target: votes.voterId,
        set: { targetId },
      });
  }

  async getVoteCounts(): Promise<{ userId: string; username: string; voteCount: number }[]> {
    const allUsers = await this.getAllUsers();
    const allVotes = await db.select().from(votes).where(eq(votes.targetId, votes.targetId)); // Get all votes with targets
    
    const voteCounts = new Map<string, number>();
    
    // Count votes for each user
    for (const vote of allVotes) {
      if (vote.targetId) {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      }
    }
    
    // Return sorted by vote count (descending) then by username
    return allUsers.map(user => ({
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
    return await db.select().from(votes);
  }

  async createMessage(message: { senderId: string; receiverId?: string; content: string; isPrivate?: number; mediaUrl?: string; mediaType?: string }): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId: message.senderId,
        receiverId: message.receiverId || null,
        content: message.content,
        isPrivate: message.isPrivate || 0,
        mediaUrl: message.mediaUrl || null,
        mediaType: message.mediaType || null,
      })
      .returning();
    return newMessage;
  }

  async getPublicMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]> {
    const publicMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        mediaType: messages.mediaType,
        createdAt: messages.createdAt,
        senderUsername: users.username,
        senderProfileImage: users.profileImage,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.isPrivate, 0))
      .orderBy(asc(messages.createdAt));
    
    return publicMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt!,
    }));
  }

  async getPrivateMessages(userId: string, targetId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]> {
    const privateMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        mediaUrl: messages.mediaUrl,
        mediaType: messages.mediaType,
        createdAt: messages.createdAt,
        senderUsername: users.username,
        senderProfileImage: users.profileImage,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.isPrivate, 1),
          // Messages where user is sender and target is receiver OR user is receiver and target is sender
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, targetId)),
            and(eq(messages.senderId, targetId), eq(messages.receiverId, userId))
          )
        )
      )
      .orderBy(asc(messages.createdAt));
    
    return privateMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt!,
    }));
  }

  async getAllPrivateMessages(): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; receiverId: string; receiverUsername: string; content: string; createdAt: Date }[]> {
    const privateMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        senderUsername: users.username,
        senderProfileImage: users.profileImage,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(and(eq(messages.isPrivate, 1), eq(messages.receiverId, messages.receiverId))) // Has receiver
      .orderBy(desc(messages.createdAt));
    
    // Get receiver usernames
    const result = [];
    for (const msg of privateMessages) {
      if (msg.receiverId) {
        const [receiver] = await db.select({ username: users.username }).from(users).where(eq(users.id, msg.receiverId));
        result.push({
          ...msg,
          receiverUsername: receiver?.username || 'Unknown',
          createdAt: msg.createdAt!,
        });
      }
    }
    
    return result;
  }

  async getPrivateMessagesForUser(userId: string): Promise<{ id: string; senderId: string; senderUsername: string; senderProfileImage: string | null; content: string; createdAt: Date }[]> {
    const privateMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        senderUsername: users.username,
        senderProfileImage: users.profileImage,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(and(eq(messages.isPrivate, 1), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
    
    return privateMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt!,
    }));
  }

  async getUnreadMessagesInboxForUser(userId: string): Promise<{ senderId: string; senderUsername: string; senderProfileImage: string | null; lastMessage: string; lastMessageTime: Date; unreadCount: number }[]> {
    const privateMessages = await this.getPrivateMessagesForUser(userId);
    
    // Group by sender
    const conversationMap = new Map<string, { messages: any[]; sender: any }>();
    
    privateMessages.forEach(msg => {
      if (!conversationMap.has(msg.senderId)) {
        conversationMap.set(msg.senderId, { 
          messages: [], 
          sender: { 
            username: msg.senderUsername, 
            profileImage: msg.senderProfileImage 
          } 
        });
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

  async createAnnouncement(announcement: { gameMasterId: string; title: string; content: string; mediaUrl?: string; mediaType?: string }): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        gameMasterId: announcement.gameMasterId,
        title: announcement.title,
        content: announcement.content,
        mediaUrl: announcement.mediaUrl || null,
        mediaType: announcement.mediaType || null,
      })
      .returning();
    return newAnnouncement;
  }

  async getAnnouncements(): Promise<{ id: string; gameMasterUsername: string; title: string; content: string; mediaUrl?: string; mediaType?: string; createdAt: Date }[]> {
    const allAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        mediaUrl: announcements.mediaUrl,
        mediaType: announcements.mediaType,
        createdAt: announcements.createdAt,
        gameMasterUsername: users.username,
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.gameMasterId, users.id))
      .orderBy(desc(announcements.createdAt));
    
    return allAnnouncements.map(announcement => ({
      ...announcement,
      createdAt: announcement.createdAt!,
    }));
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id));
    return result.rowCount! > 0;
  }

  async canUserDrawCard(userId: string): Promise<boolean> {
    const userDraws = await db
      .select({ drawnAt: cardDraws.drawnAt })
      .from(cardDraws)
      .where(eq(cardDraws.userId, userId))
      .orderBy(desc(cardDraws.drawnAt));
    
    if (userDraws.length === 0) {
      return true; // First draw
    }
    
    const lastDraw = userDraws[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return lastDraw.drawnAt! < oneWeekAgo;
  }

  async getLastCardDraw(userId: string): Promise<{ drawnAt: Date } | null> {
    const [lastDraw] = await db
      .select({ drawnAt: cardDraws.drawnAt })
      .from(cardDraws)
      .where(eq(cardDraws.userId, userId))
      .orderBy(desc(cardDraws.drawnAt))
      .limit(1);
    
    return lastDraw ? { drawnAt: lastDraw.drawnAt! } : null;
  }

  async recordCardDraw(cardDraw: { userId: string; cardId: string; cardTitle: string; cardType: string; cardEffect: string }): Promise<{ id: string; drawnAt: Date }> {
    const [newDraw] = await db
      .insert(cardDraws)
      .values({
        userId: cardDraw.userId,
        cardId: cardDraw.cardId,
        cardTitle: cardDraw.cardTitle,
        cardType: cardDraw.cardType,
        cardEffect: cardDraw.cardEffect,
      })
      .returning();
    
    return { id: newDraw.id, drawnAt: newDraw.drawnAt! };
  }

  async getGameMasters(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isGameMaster, 1));
  }
}

export const storage = new DatabaseStorage();
