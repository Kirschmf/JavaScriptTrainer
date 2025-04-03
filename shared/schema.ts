import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  isExample: boolean("is_example").default(false).notNull(),
  createdAt: text("created_at").notNull().default("NOW()"),
});

export const consoleEntries = pgTable("console_entries", {
  id: serial("id").primaryKey(),
  snippetId: integer("snippet_id").references(() => snippets.id).notNull(),
  type: text("type").notNull(), // 'log', 'error', 'warn', 'info'
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull().default("NOW()"),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({
  id: true,
  createdAt: true,
  isExample: true
});

export const insertConsoleEntrySchema = createInsertSchema(consoleEntries).omit({
  id: true,
  timestamp: true
});

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;
export type ConsoleEntry = typeof consoleEntries.$inferSelect;
