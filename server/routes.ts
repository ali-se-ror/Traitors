import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, voteSchema, changeCodewordSchema, gameMasterSchema, messageSchema, announcementSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Extend session type to include userId
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

// Spooky symbols for player avatars
const SPOOKY_SYMBOLS = [
  "👻", "💀", "🦇", "🕷️", "🕸️", "🌙", "⚡", "🔮", 
  "⚰️", "🗡️", "🏹", "🛡️", "👑", "💎", "🔥", "❄️",
  "🌟", "💫", "🌀", "⭐", "🔱", "⚔️", "🏰", "🗝️",
  "📿", "🔯", "☠️", "🎭", "🦉", "🐺", "🌒", "🌕"
];

function getRandomSpookySymbol(): string {
  return SPOOKY_SYMBOLS[Math.floor(Math.random() * SPOOKY_SYMBOLS.length)];
}

// Profile image identifiers that the frontend can resolve
const PROFILE_IMAGE_PATHS = [
  '38',
  '39', 
  '41',
  '44',
  '48',
  '49',
  '55',
  '56',
  '64',
];

function getProfileImageForUser(userId: string): string | null {
  if (PROFILE_IMAGE_PATHS.length === 0) {
    return null;
  }
  
  // Create a simple hash from the user ID for deterministic selection
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % PROFILE_IMAGE_PATHS.length;
  // Return the image identifier that the frontend can resolve
  return `retro-${PROFILE_IMAGE_PATHS[index]}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'traitors-game-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, codeword } = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash codeword
      const codewordHash = await bcrypt.hash(codeword, 10);
      
      // Generate random spooky symbol
      const symbol = getRandomSpookySymbol();
      
      // Generate deterministic profile image based on username
      const profileImage = getProfileImageForUser(username);
      
      // Create user with profile image
      const user = await storage.createUser({ username, codewordHash, symbol, profileImage });
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          symbol: user.symbol,
          profileImage: user.profileImage,
          createdAt: user.createdAt 
        } 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, codeword } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidCodeword = await bcrypt.compare(codeword, user.codewordHash);
      if (!isValidCodeword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          symbol: user.symbol,
          profileImage: user.profileImage,
          createdAt: user.createdAt 
        } 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game Master Registration
  app.post("/api/auth/gamemaster", async (req, res) => {
    try {
      const { username, codeword, secretKey } = gameMasterSchema.parse(req.body);
      
      // Verify secret key (use environment variable or hardcoded for demo)
      const GAME_MASTER_SECRET = process.env.GAME_MASTER_SECRET || "TRAITORS_MASTER_2024";
      if (secretKey !== GAME_MASTER_SECRET) {
        return res.status(403).json({ message: "Invalid game master secret key" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash codeword
      const codewordHash = await bcrypt.hash(codeword, 10);
      
      // Generate random spooky symbol
      const symbol = getRandomSpookySymbol();
      
      // Generate deterministic profile image
      const profileImage = getProfileImageForUser(username);
      
      // Create game master user
      const user = await storage.createUser({ username, codewordHash, symbol, profileImage, isGameMaster: 1 });
      
      // Set session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          symbol: user.symbol,
          profileImage: user.profileImage,
          isGameMaster: user.isGameMaster,
          createdAt: user.createdAt 
        } 
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Game master registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get current vote
      const vote = await storage.getVoteByVoterId(user.id);
      let currentVoteTarget = null;
      if (vote?.targetId) {
        const target = await storage.getUser(vote.targetId);
        currentVoteTarget = target ? { id: target.id, username: target.username } : null;
      }

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          symbol: user.symbol,
          profileImage: user.profileImage,
          isGameMaster: user.isGameMaster,
          createdAt: user.createdAt 
        },
        currentVote: currentVoteTarget
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all players
  app.get("/api/players", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const players = users.map(user => ({
        id: user.id,
        username: user.username,
        symbol: user.symbol,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }));
      res.json(players);
    } catch (error) {
      console.error("Get players error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cast vote
  app.post("/api/votes", requireAuth, async (req, res) => {
    try {
      const { suspectedId } = req.body;
      const targetId = suspectedId;
      const userId = req.session.userId;

      // Validate target exists and is not self
      if (targetId === userId) {
        return res.status(400).json({ message: "Cannot vote for yourself" });
      }

      const target = await storage.getUser(targetId);
      if (!target) {
        return res.status(404).json({ message: "Target player not found" });
      }

      await storage.setVote(userId, targetId);
      
      res.json({ 
        message: "Vote cast successfully",
        target: { id: target.id, username: target.username }
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Vote error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Clear vote
  app.delete("/api/votes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      await storage.setVote(userId, null);
      res.json({ message: "Vote cleared successfully" });
    } catch (error) {
      console.error("Clear vote error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get suspicion meter (vote counts)
  app.get("/api/suspicion", requireAuth, async (req, res) => {
    try {
      const voteCounts = await storage.getVoteCounts();
      res.json(voteCounts);
    } catch (error) {
      console.error("Get suspicion error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get detailed votes (Game Master only)
  app.get("/api/votes/details", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const currentUser = await storage.getUser(userId);
      
      // Check if user is game master
      if (!currentUser || !currentUser.isGameMaster) {
        return res.status(403).json({ message: "Game Master access required" });
      }

      const votes = await storage.getAllVotes();
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(user => [user.id, user.username]));

      const detailedVotes = votes.map(vote => ({
        voterId: vote.voterId,
        targetId: vote.targetId,
        voterUsername: userMap.get(vote.voterId) || 'Unknown',
        targetUsername: vote.targetId ? userMap.get(vote.targetId) || 'Unknown' : undefined,
      }));

      res.json(detailedVotes);
    } catch (error) {
      console.error("Get detailed votes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change codeword
  app.post("/api/auth/change-codeword", requireAuth, async (req, res) => {
    try {
      const { oldCodeword, newCodeword } = changeCodewordSchema.parse(req.body);
      const userId = req.session.userId;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValidOldCodeword = await bcrypt.compare(oldCodeword, user.codewordHash);
      if (!isValidOldCodeword) {
        return res.status(401).json({ message: "Current code word is incorrect" });
      }

      const newCodewordHash = await bcrypt.hash(newCodeword, 10);
      await storage.updateUserCodeword(userId, newCodewordHash);

      res.json({ message: "Code word updated successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Change codeword error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send message
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { receiverId, content, isPrivate, mediaUrl, mediaType } = messageSchema.parse(req.body);
      const senderId = req.session.userId;

      const message = await storage.createMessage({
        senderId,
        receiverId: receiverId || undefined,
        content,
        isPrivate: isPrivate ? 1 : 0,
        mediaUrl,
        mediaType,
      });

      res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Send message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get public messages
  app.get("/api/messages/public", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getPublicMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get public messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get private messages with another user
  app.get("/api/messages/private/:targetId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { targetId } = req.params;
      const messages = await storage.getPrivateMessages(userId, targetId);
      res.json(messages);
    } catch (error) {
      console.error("Get private messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all private messages (Game Master only)
  app.get("/api/messages/private/admin/all", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !currentUser.isGameMaster) {
        return res.status(403).json({ message: "Game Master access required" });
      }

      const messages = await storage.getAllPrivateMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get all private messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get private messages received by current user
  app.get("/api/messages/private/received", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getPrivateMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Get received private messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get count of unread private messages
  app.get("/api/messages/private/count", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const messages = await storage.getPrivateMessagesForUser(userId);
      res.json({ count: messages.length, hasMessages: messages.length > 0 });
    } catch (error) {
      console.error("Get private messages count error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get inbox view with conversation previews
  app.get("/api/messages/inbox", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const inbox = await storage.getUnreadMessagesInboxForUser(userId);
      res.json(inbox);
    } catch (error) {
      console.error("Get inbox error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create announcement (Game Master only)
  app.post("/api/announcements", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !currentUser.isGameMaster) {
        return res.status(403).json({ message: "Game Master access required" });
      }

      const { title, content } = announcementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement({
        gameMasterId: userId,
        title,
        content,
      });

      res.status(201).json({ message: "Announcement created successfully", data: announcement });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Create announcement error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get announcements
  app.get("/api/announcements", requireAuth, async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete announcement (Game Master only)
  app.delete("/api/announcements/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !currentUser.isGameMaster) {
        return res.status(403).json({ message: "Game Master access required" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteAnnouncement(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Object storage routes for media uploads
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/media-attachments", requireAuth, async (req, res) => {
    if (!req.body.mediaUrl) {
      return res.status(400).json({ error: "mediaUrl is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.mediaUrl);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting media permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
