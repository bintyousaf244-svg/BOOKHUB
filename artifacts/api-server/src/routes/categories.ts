import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

// Public: list all categories
router.get("/categories", async (req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
  res.json(categories);
});

const upsertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

// Admin: create category
router.post("/admin/categories", async (req, res) => {
  const parsed = upsertCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }
  try {
    const [category] = await db
      .insert(categoriesTable)
      .values({ name: parsed.data.name, slug: parsed.data.slug, bookCount: 0 })
      .onConflictDoNothing()
      .returning();
    if (!category) {
      res.status(409).json({ error: "A category with that slug already exists" });
      return;
    }
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Admin: update category
router.put("/admin/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = upsertCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }
  try {
    const [updated] = await db
      .update(categoriesTable)
      .set({ name: parsed.data.name, slug: parsed.data.slug })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Admin: delete category
router.delete("/admin/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.status(204).end();
});

export default router;
