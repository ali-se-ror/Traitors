import { type User, type InsertUser, type Vote, type InsertVote } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; codewordHash: string; isGameMaster?: number }): Promise<User>;
  updateUserCodeword(id: string, codewordHash: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Vote operations
  getVoteByVoterId(voterId: string): Promise<Vote | undefined>;
  setVote(voterId: string, targetId: string | null): Promise<void>;
  getVoteCounts(): Promise<{ userId: string; username: string; voteCount: number }[]>;
  getAllVotes(): Promise<Vote[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private votes: Map<string, Vote>;

  constructor() {
    this.users = new Map();
    this.votes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: { username: string; codewordHash: string; isGameMaster?: number }): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      username: user.username,
      codewordHash: user.codewordHash,
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
}

export const storage = new MemStorage();
