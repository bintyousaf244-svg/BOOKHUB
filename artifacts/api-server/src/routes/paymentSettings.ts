import { Router } from "express";
import { db, paymentSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateBody = z.object({
  jazzcashNumber: z.string().optional(),
  jazzcashName: z.string().optional(),
  easypaisaNumber: z.string().optional(),
  easypaisaName: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankIban: z.string().optional(),
});

async function getOrCreateSettings() {
  const rows = await db.select().from(paymentSettingsTable).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(paymentSettingsTable).values({
    jazzcashNumber: "03319347345",
    jazzcashName: "",
    easypaisaNumber: "",
    easypaisaName: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankIban: "",
  }).returning();
  return created;
}

function mapSettings(s: typeof paymentSettingsTable.$inferSelect) {
  return {
    jazzcashNumber: s.jazzcashNumber ?? "",
    jazzcashName: s.jazzcashName ?? "",
    easypaisaNumber: s.easypaisaNumber ?? "",
    easypaisaName: s.easypaisaName ?? "",
    bankName: s.bankName ?? "",
    bankAccountNumber: s.bankAccountNumber ?? "",
    bankAccountName: s.bankAccountName ?? "",
    bankIban: s.bankIban ?? "",
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/payment-settings", async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(mapSettings(settings));
});

router.put("/admin/payment-settings", async (req, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const settings = await getOrCreateSettings();
  const [updated] = await db
    .update(paymentSettingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(paymentSettingsTable.id, settings.id))
    .returning();
  res.json(mapSettings(updated));
});

export default router;
