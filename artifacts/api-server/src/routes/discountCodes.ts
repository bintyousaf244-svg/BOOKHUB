import { Router } from "express";
import { db, discountCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createBody = z.object({
  code: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});

const updateBody = createBody.partial();

const validateBody = z.object({
  code: z.string().min(1),
  orderAmount: z.number().min(0),
});

function mapCode(c: typeof discountCodesTable.$inferSelect) {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
    maxUses: c.maxUses ?? null,
    usedCount: c.usedCount,
    isActive: c.isActive,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/admin/discount-codes", async (req, res) => {
  const codes = await db.select().from(discountCodesTable).orderBy(discountCodesTable.createdAt);
  res.json(codes.map(mapCode));
});

router.post("/admin/discount-codes", async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { code, type, value, minOrderAmount, maxUses, isActive, expiresAt } = parsed.data;
  const [created] = await db.insert(discountCodesTable).values({
    code: code.toUpperCase(),
    type,
    value: String(value),
    minOrderAmount: minOrderAmount != null ? String(minOrderAmount) : "0",
    maxUses: maxUses ?? null,
    isActive: isActive ?? true,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json(mapCode(created));
});

router.put("/admin/discount-codes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.code !== undefined) updates.code = parsed.data.code.toUpperCase();
  if (parsed.data.type !== undefined) updates.type = parsed.data.type;
  if (parsed.data.value !== undefined) updates.value = String(parsed.data.value);
  if (parsed.data.minOrderAmount !== undefined) updates.minOrderAmount = parsed.data.minOrderAmount != null ? String(parsed.data.minOrderAmount) : "0";
  if (parsed.data.maxUses !== undefined) updates.maxUses = parsed.data.maxUses ?? null;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.expiresAt !== undefined) updates.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;

  const [updated] = await db.update(discountCodesTable).set(updates).where(eq(discountCodesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapCode(updated));
});

router.delete("/admin/discount-codes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(discountCodesTable).where(eq(discountCodesTable.id, id));
  res.json({ success: true });
});

router.post("/discount-codes/validate", async (req, res) => {
  const parsed = validateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ valid: false, discountAmount: 0, message: "Invalid request" });
    return;
  }
  const { code, orderAmount } = parsed.data;
  const [dc] = await db.select().from(discountCodesTable).where(eq(discountCodesTable.code, code.toUpperCase()));

  if (!dc) {
    res.json({ valid: false, discountAmount: 0, message: "Invalid discount code" });
    return;
  }
  if (!dc.isActive) {
    res.json({ valid: false, discountAmount: 0, message: "This code is no longer active" });
    return;
  }
  if (dc.expiresAt && new Date() > dc.expiresAt) {
    res.json({ valid: false, discountAmount: 0, message: "This code has expired" });
    return;
  }
  if (dc.maxUses != null && dc.usedCount >= dc.maxUses) {
    res.json({ valid: false, discountAmount: 0, message: "This code has reached its usage limit" });
    return;
  }
  const minOrder = dc.minOrderAmount != null ? Number(dc.minOrderAmount) : 0;
  if (orderAmount < minOrder) {
    res.json({ valid: false, discountAmount: 0, message: `Minimum order amount of Rs. ${minOrder} required` });
    return;
  }

  const val = Number(dc.value);
  let discountAmount = 0;
  if (dc.type === "percentage") {
    discountAmount = Math.round((orderAmount * val) / 100);
  } else {
    discountAmount = Math.min(val, orderAmount);
  }

  await db.update(discountCodesTable).set({ usedCount: dc.usedCount + 1 }).where(eq(discountCodesTable.id, dc.id));

  res.json({
    valid: true,
    discountAmount,
    discountType: dc.type,
    discountValue: val,
    message: dc.type === "percentage" ? `${val}% discount applied!` : `Rs. ${val} discount applied!`,
  });
});

export default router;
