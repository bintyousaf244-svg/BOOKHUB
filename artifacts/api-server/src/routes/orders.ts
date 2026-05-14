import { Router } from "express";
import { db, ordersTable, booksTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { sendDownloadEmail } from "../email";

const router = Router();

router.get("/orders", async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { status, page } = parsed.data;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(ordersTable.status, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({
    orders: orders.map(mapOrder),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const data = parsed.data;

    const bookIds = data.items.map((i) => i.bookId);
    const books = bookIds.length > 0
      ? await db.select().from(booksTable).where(inArray(booksTable.id, bookIds))
      : [];
    const bookMap = new Map(books.map((b) => [b.id, b]));

    const missingBookIds = bookIds.filter((bookId) => !bookMap.has(bookId));
    if (missingBookIds.length > 0) {
      res.status(400).json({
        error:
          "Some books in your cart are no longer available. Please clear your cart and add them again.",
        missingBookIds,
      });
      return;
    }

    let total = 0;
    const items = data.items.map((item) => {
      const book = bookMap.get(item.bookId)!;
      const price = book.isOnSale && book.salePrice ? Number(book.salePrice) : Number(book.price);
      total += price * item.quantity;
      return {
        bookId: item.bookId,
        title: book.title,
        price,
        quantity: item.quantity,
        coverImage: book.coverImage,
      };
    });

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference ?? null,
        status: "pending",
        total: String(total.toFixed(2)),
        items,
        notes: data.notes ?? null,
      })
      .returning();

    res.status(201).json(mapOrder(order));
  } catch (error) {
    req.log.error({ err: error }, "Create order failed");
    res.status(500).json({ error: "Failed to place order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const parsed = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const order = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id)).limit(1);
  if (!order[0]) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(mapOrder(order[0]));
});

router.put("/orders/:id", async (req, res) => {
  const paramsParsed = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const prevRows = await db.select().from(ordersTable).where(eq(ordersTable.id, paramsParsed.data.id)).limit(1);
  const prevStatus = prevRows[0]?.status;

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, paramsParsed.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Send download email when order is first marked as completed
  if (parsed.data.status === "completed" && prevStatus !== "completed") {
    const items = order.items as Array<{ bookId: number; title: string; price: number; quantity: number; coverImage: string }>;
    sendDownloadEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderId: order.id,
      items,
      total: Number(order.total),
    }).then((result) => {
      if (!result.sent) {
        req.log.warn({ reason: result.reason }, "Failed to send download email");
      } else {
        req.log.info({ orderId: order.id, to: order.customerEmail }, "Download email sent");
      }
    }).catch((err) => {
      req.log.error({ err }, "Error sending download email");
    });
  }

  res.json(mapOrder(order));
});

router.get("/orders/:id/downloads", async (req, res) => {
  const orderId = Number(req.params.id);
  const email = (req.query.email as string || "").trim().toLowerCase();

  if (!orderId || !email) {
    res.status(400).json({ error: "Order ID and email are required" });
    return;
  }

  const rows = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  const order = rows[0];

  if (!order || order.customerEmail.toLowerCase() !== email) {
    res.status(404).json({ error: "Order not found or email does not match" });
    return;
  }

  if (order.status !== "completed") {
    res.json({ allowed: false, status: order.status, books: [] });
    return;
  }

  const items = order.items as Array<{ bookId: number; title: string; price: number; quantity: number; coverImage: string }>;
  const bookIds = items.map((i) => i.bookId);
  const books = bookIds.length > 0
    ? await db.select({ id: booksTable.id, title: booksTable.title, downloadUrl: booksTable.downloadUrl }).from(booksTable).where(inArray(booksTable.id, bookIds))
    : [];
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const downloadable = items.map((item) => ({
    bookId: item.bookId,
    title: item.title,
    coverImage: item.coverImage,
    downloadUrl: bookMap.get(item.bookId)?.downloadUrl ?? null,
  }));

  res.json({ allowed: true, status: order.status, books: downloadable });
});

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
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
  };
}

export default router;
