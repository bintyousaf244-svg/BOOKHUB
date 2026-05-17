import { pgTable, serial, text, boolean, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  author: text("author").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  isFree: boolean("is_free").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  coverImage: text("cover_image").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull().default("English"),
  ageGroup: text("age_group").notNull().default("All Ages"),
  pages: integer("pages"),
  downloadUrl: text("download_url"),
  stock: integer("stock").notNull().default(100),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
