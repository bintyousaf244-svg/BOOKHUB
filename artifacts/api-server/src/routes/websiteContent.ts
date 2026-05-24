import { Router } from "express";
import { db, websiteContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const updateBody = z.object({
  content: z.record(z.unknown()),
});

async function getOrCreateWebsiteContent() {
  const rows = await db.select().from(websiteContentTable).limit(1);
  if (rows[0]) {
    return rows[0];
  }

  const [created] = await db.insert(websiteContentTable).values({
    content: {},
  }).returning();

  return created;
}

router.get("/website-content", async (_req, res) => {
  const settings = await getOrCreateWebsiteContent();
  res.json({
    content: settings.content ?? {},
    updatedAt: settings.updatedAt.toISOString(),
  });
});

router.put("/admin/website-content", async (req, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const settings = await getOrCreateWebsiteContent();
  const [updated] = await db
    .update(websiteContentTable)
    .set({
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(eq(websiteContentTable.id, settings.id))
    .returning();

  res.json({
    content: updated.content ?? {},
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;
