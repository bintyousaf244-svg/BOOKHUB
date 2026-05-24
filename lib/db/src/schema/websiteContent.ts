import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const websiteContentTable = pgTable("website_content", {
  id: serial("id").primaryKey(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WebsiteContent = typeof websiteContentTable.$inferSelect;
