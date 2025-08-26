import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  codewordHash: text("codeword_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  voterId: varchar("voter_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  targetId: varchar("target_id").references(() => users.id, { onDelete: "set null" }),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;
