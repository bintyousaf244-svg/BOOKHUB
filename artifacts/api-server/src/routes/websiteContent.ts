import { Router } from "express";
import { db, websiteContentTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const router = Router();
const fallbackPath = path.resolve(process.cwd(), "data", "website-content.json");

const updateBody = z.object({
  content: z.record(z.unknown()),
});

async function readFallbackContent() {
  try {
    const raw = await readFile(fallbackPath, "utf8");
    const parsed = JSON.parse(raw) as { content?: Record<string, unknown>; updatedAt?: string };
    return {
      content: parsed.content ?? {},
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return {
      content: {},
      updatedAt: new Date().toISOString(),
    };
  }
}

async function writeFallbackContent(content: Record<string, unknown>) {
  await mkdir(path.dirname(fallbackPath), { recursive: true });
  const payload = {
    content,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(fallbackPath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

let ensureTablePromise: Promise<void> | null = null;
function ensureWebsiteContentTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = db
      .execute(
        sql`
          CREATE TABLE IF NOT EXISTS website_content (
            id SERIAL PRIMARY KEY,
            content JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `
      )
      .then(() => undefined)
      .catch((err) => {
        ensureTablePromise = null;
        throw err;
      });
  }
  return ensureTablePromise;
}

async function getOrCreateWebsiteContent() {
  await ensureWebsiteContentTable();
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
  try {
    const settings = await getOrCreateWebsiteContent();
    res.json({
      content: settings.content ?? {},
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch {
    const fallback = await readFallbackContent();
    res.json(fallback);
  }
});

router.put("/admin/website-content", async (req, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
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
  } catch {
    const fallback = await writeFallbackContent(parsed.data.content);
    res.json(fallback);
  }
});

export default router;
