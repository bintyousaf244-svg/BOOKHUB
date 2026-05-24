import { Router } from "express";
import { db, booksTable, ordersTable } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "bookstore2024";
const ADMIN_TOKEN = "bookstore-admin-token-2024";

router.post("/admin/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, token: "", message: "Invalid credentials" });
  }
});

router.get("/admin/stats", async (req, res) => {
  const [
    totalBooksResult,
    totalOrdersResult,
    totalRevenueResult,
    pendingOrdersResult,
    completedOrdersResult,
    freeBooksResult,
    booksOnSaleResult,
    recentOrders,
    topBooks,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(booksTable),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable),
    db.select({ sum: sql<string>`coalesce(sum(total::numeric), 0)` }).from(ordersTable),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "delivered")),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(eq(booksTable.isFree, true)),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(eq(booksTable.isOnSale, true)),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    db.select().from(booksTable).where(eq(booksTable.isFeatured, true)).limit(5),
  ]);

  res.json({
    totalBooks: Number(totalBooksResult[0]?.count ?? 0),
    totalOrders: Number(totalOrdersResult[0]?.count ?? 0),
    totalRevenue: Number(totalRevenueResult[0]?.sum ?? 0),
    pendingOrders: Number(pendingOrdersResult[0]?.count ?? 0),
    completedOrders: Number(completedOrdersResult[0]?.count ?? 0),
    freeBooks: Number(freeBooksResult[0]?.count ?? 0),
    booksOnSale: Number(booksOnSaleResult[0]?.count ?? 0),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      address: o.address,
      city: o.city,
      paymentMethod: o.paymentMethod,
      paymentReference: o.paymentReference ?? null,
      status: o.status,
      total: Number(o.total),
      items: o.items as Array<{ bookId: number; title: string; price: number; quantity: number; coverImage: string }>,
      notes: o.notes ?? null,
      createdAt: o.createdAt.toISOString(),
    })),
    topSellingBooks: topBooks.map((b) => ({
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
      ageGroup: formatStoredMultiValue(b.ageGroup),
      pages: b.pages ?? null,
      downloadUrl: b.downloadUrl ?? null,
      stock: b.stock,
      rating: Number(b.rating),
      reviewCount: b.reviewCount,
      createdAt: b.createdAt.toISOString(),
    })),
  });
});

export default router;

function parseStoredMultiValue(value?: string | null): string[] {
  const rawValue = value?.trim();
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(
          parsed
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean)
        )
      );
    }
  } catch {
    // Support legacy plain-string rows.
  }

  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function formatStoredMultiValue(value?: string | null): string {
  return parseStoredMultiValue(value).join(", ");
}
