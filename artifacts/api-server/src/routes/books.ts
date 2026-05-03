import { Router } from "express";
import { db, booksTable } from "@workspace/db";
import {
  ListBooksQueryParams,
  CreateBookBody,
  GetBookParams,
  UpdateBookParams,
  UpdateBookBody,
  DeleteBookParams,
} from "@workspace/api-zod";
import { eq, ilike, and, sql, desc, or } from "drizzle-orm";

const router = Router();

router.get("/books/featured", async (req, res) => {
  const books = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.isFeatured, true))
    .orderBy(desc(booksTable.createdAt))
    .limit(8);
  const mapped = books.map(mapBook);
  res.json(mapped);
});

router.get("/books/on-sale", async (req, res) => {
  const books = await db
    .select()
    .from(booksTable)
    .where(and(eq(booksTable.isOnSale, true), eq(booksTable.isFree, false)))
    .orderBy(desc(booksTable.createdAt))
    .limit(8);
  res.json(books.map(mapBook));
});

router.get("/books/free", async (req, res) => {
  const books = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.isFree, true))
    .orderBy(desc(booksTable.createdAt));
  res.json(books.map(mapBook));
});

router.get("/books", async (req, res) => {
  const parsed = ListBooksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, language, isFree, isOnSale, search, page, limit } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(booksTable.category, category));
  if (language) conditions.push(eq(booksTable.language, language));
  if (isFree !== undefined) conditions.push(eq(booksTable.isFree, isFree));
  if (isOnSale !== undefined) conditions.push(eq(booksTable.isOnSale, isOnSale));
  if (search) {
    conditions.push(
      or(
        ilike(booksTable.title, `%${search}%`),
        ilike(booksTable.author, `%${search}%`),
        ilike(booksTable.description, `%${search}%`)
      )!
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [books, countResult] = await Promise.all([
    db.select().from(booksTable).where(where).orderBy(desc(booksTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({
    books: books.map(mapBook),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/books/:id", async (req, res) => {
  const parsed = GetBookParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const book = await db.select().from(booksTable).where(eq(booksTable.id, parsed.data.id)).limit(1);
  if (!book[0]) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(mapBook(book[0]));
});

router.post("/books", async (req, res) => {
  const parsed = CreateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [book] = await db
    .insert(booksTable)
    .values({
      title: data.title,
      description: data.description,
      author: data.author,
      price: String(data.price),
      salePrice: data.salePrice != null ? String(data.salePrice) : null,
      isOnSale: data.isOnSale ?? false,
      isFree: data.isFree ?? false,
      isFeatured: data.isFeatured ?? false,
      coverImage: data.coverImage,
      category: data.category,
      language: data.language,
      ageGroup: data.ageGroup,
      pages: data.pages ?? null,
      downloadUrl: data.downloadUrl ?? null,
      stock: data.stock ?? 100,
    })
    .returning();

  await updateCategoryCount(data.category);
  res.status(201).json(mapBook(book));
});

router.put("/books/:id", async (req, res) => {
  const paramsParsed = UpdateBookParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBookBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.salePrice !== undefined) updateData.salePrice = data.salePrice != null ? String(data.salePrice) : null;
  if (data.isOnSale !== undefined) updateData.isOnSale = data.isOnSale;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.ageGroup !== undefined) updateData.ageGroup = data.ageGroup;
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.downloadUrl !== undefined) updateData.downloadUrl = data.downloadUrl;
  if (data.stock !== undefined) updateData.stock = data.stock;

  const [book] = await db
    .update(booksTable)
    .set(updateData)
    .where(eq(booksTable.id, paramsParsed.data.id))
    .returning();
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(mapBook(book));
});

router.delete("/books/:id", async (req, res) => {
  const parsed = DeleteBookParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(booksTable).where(eq(booksTable.id, parsed.data.id));
  res.json({ success: true, message: "Book deleted" });
});

async function updateCategoryCount(category: string) {
  const { categoriesTable } = await import("@workspace/db");
  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(booksTable)
    .where(eq(booksTable.category, category));
  await db
    .insert(categoriesTable)
    .values({ name: category, slug: category.toLowerCase().replace(/\s+/g, "-"), bookCount: Number(count[0]?.count ?? 0) })
    .onConflictDoUpdate({
      target: categoriesTable.slug,
      set: { bookCount: Number(count[0]?.count ?? 0) },
    });
}

function mapBook(b: typeof booksTable.$inferSelect) {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    author: b.author,
    price: Number(b.price),
    salePrice: b.salePrice != null ? Number(b.salePrice) : null,
    isOnSale: b.isOnSale,
    isFree: b.isFree,
    isFeatured: b.isFeatured,
    coverImage: b.coverImage,
    category: b.category,
    language: b.language,
    ageGroup: b.ageGroup,
    pages: b.pages ?? null,
    downloadUrl: b.downloadUrl ?? null,
    stock: b.stock,
    rating: Number(b.rating),
    reviewCount: b.reviewCount,
    createdAt: b.createdAt.toISOString(),
  };
}

export default router;
