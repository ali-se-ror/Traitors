import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  codewordHash: text("codeword_hash").notNull(),
  symbol: text("symbol").notNull(),
  profileImage: text("profile_image"),
  isGameMaster: integer("is_game_master").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  voterId: varchar("voter_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  targetId: varchar("target_id").references(() => users.id, { onDelete: "set null" }),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: varchar("receiver_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isPrivate: integer("is_private").default(0),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameMasterId: varchar("game_master_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardDraws = pgTable("card_draws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cardId: text("card_id").notNull(),
  cardTitle: text("card_title").notNull(),
  cardType: text("card_type").notNull(),
  cardEffect: text("card_effect").notNull(),
  drawnAt: timestamp("drawn_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  codewordHash: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(18, "Username must be at most 18 characters"),
  codeword: z.string().min(4, "Code word must be at least 4 characters").max(32, "Code word must be at most 32 characters"),
});

export const registerSchema = loginSchema;

export const voteSchema = z.object({
  targetId: z.string().uuid(),
});

export const changeCodewordSchema = z.object({
  oldCodeword: z.string().min(1, "Current code word is required"),
  newCodeword: z.string().min(4, "New code word must be at least 4 characters").max(32, "New code word must be at most 32 characters"),
});

export const gameMasterSchema = loginSchema.extend({
  secretKey: z.string().min(1, "Game master secret key is required"),
});

export const messageSchema = z.object({
  receiverId: z.string().uuid().optional(),
  content: z.string().min(1, "Message cannot be empty").max(500, "Message is too long"),
  isPrivate: z.boolean().default(false),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required").max(1000, "Content is too long"),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
export type VoteData = z.infer<typeof voteSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type MessageData = z.infer<typeof messageSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type AnnouncementData = z.infer<typeof announcementSchema>;

export type CardDraw = typeof cardDraws.$inferSelect;
export type InsertCardDraw = typeof cardDraws.$inferInsert;

export type PublicUser = {
  id: string;
  username: string;
};
