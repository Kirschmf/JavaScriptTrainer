import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  isExample: boolean("is_example").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consoleEntries = pgTable("console_entries", {
  id: serial("id").primaryKey(),
  snippetId: integer("snippet_id").references(() => snippets.id).notNull(),
  type: text("type").notNull(), // 'log', 'error', 'warn', 'info'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Code challenges schema
export const challengeCategories = pgTable("challenge_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => challengeCategories.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  starterCode: text("starter_code").notNull(),
  solutionCode: text("solution_code").notNull(),
  hints: text("hints").array(),
  testCases: json("test_cases").notNull(), // JSON of test cases
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userCode: text("user_code").notNull(),
  completed: boolean("completed").default(false).notNull(),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertSnippetSchema = createInsertSchema(snippets).omit({
  id: true,
  createdAt: true,
  isExample: true
});

export const insertConsoleEntrySchema = createInsertSchema(consoleEntries).omit({
  id: true,
  timestamp: true
});

export const insertChallengeCategorySchema = createInsertSchema(challengeCategories).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  lastAttemptAt: true,
});

// Export types
export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;
export type ConsoleEntry = typeof consoleEntries.$inferSelect;

export type InsertChallengeCategory = z.infer<typeof insertChallengeCategorySchema>;
export type ChallengeCategory = typeof challengeCategories.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
