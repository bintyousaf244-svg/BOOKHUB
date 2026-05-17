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

import {
  eq,
  ilike,
  and,
  sql,
  desc,
  or,
} from "drizzle-orm";

const router = Router();

router.get("/books/featured", async (req, res) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isFeatured, true))
      .orderBy(desc(booksTable.createdAt))
      .limit(8);

    res.json(books.map(mapBook));
  } catch (error) {
    console.error("FEATURED BOOKS ERROR:", error);

    res.status(500).json({
      error: String(error),
    });
  }
});

router.get("/books/on-sale", async (req, res) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(
        and(
          eq(booksTable.isOnSale, true),
          eq(booksTable.isFree, false)
        )
      )
      .orderBy(desc(booksTable.createdAt))
      .limit(8);

    res.json(books.map(mapBook));
  } catch (error) {
    console.error("ON SALE BOOKS ERROR:", error);

    res.status(500).json({
      error: String(error),
    });
  }
});

router.get("/books/free", async (req, res) => {
  try {
    const books = await db
      .select()
      .from(booksTable)
      .where(eq(booksTable.isFree, true))
      .orderBy(desc(booksTable.createdAt));

    res.json(books.map(mapBook));
  } catch (error) {
    console.error("FREE BOOKS ERROR:", error);

    res.status(500).json({
      error: String(error),
    });
  }
});

router.get("/books", async (req, res) => {
  try {
    const parsed = ListBooksQueryParams.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid query params",
      });

      return;
    }

    const {
      category,
      language,
      isFree,
      isOnSale,
      search,
      page,
      limit,
    } = parsed.data;

    const conditions = [];

    if (category) {
      conditions.push(
        sql`(${booksTable.category} = ${category} or lower(regexp_replace(${booksTable.category}, '[^a-zA-Z0-9]+', '-', 'g')) = ${category})`
      );
    }

    if (language) {
      conditions.push(
        eq(booksTable.language, language)
      );
    }

    if (isFree !== undefined) {
      conditions.push(
        eq(booksTable.isFree, isFree)
      );
    }

    if (isOnSale !== undefined) {
      conditions.push(
        eq(booksTable.isOnSale, isOnSale)
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(
            booksTable.title,
            `%${search}%`
          ),
          ilike(
            booksTable.author,
            `%${search}%`
          ),
          ilike(
            booksTable.description,
            `%${search}%`
          )
        )!
      );
    }

    const where =
      conditions.length > 0
        ? and(...conditions)
        : undefined;

    const offset = (page - 1) * limit;

    let books = [];
    let total = 0;

    try {
      const booksResult = await db
        .select()
        .from(booksTable)
        .where(where)
        .orderBy(desc(booksTable.createdAt))
        .limit(limit)
        .offset(offset);

      books = booksResult.map(mapBook);

      const countResult = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(booksTable)
        .where(where);

      total = Number(
        countResult[0]?.count ?? 0
      );

    } catch (error) {
      console.error(
        "BOOKS API ERROR:",
        error
      );

      res.status(500).json({
        error: String(error),
      });

      return;
    }

    res.json({
      books,
      total,
      page,
      totalPages: Math.ceil(
        total / limit
      ),
    });

  } catch (error) {
    console.error(
      "GENERAL BOOKS ROUTE ERROR:",
      error
    );

    res.status(500).json({
      error: String(error),
    });
  }
});

router.get("/books/cover", async (req, res) => {
  const rawUrl = typeof req.query.url === "string" ? req.query.url.trim() : "";
  if (!rawUrl) {
    res.status(400).json({ error: "Missing cover image URL" });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl);
    if (targetUrl.protocol === "http:") {
      targetUrl.protocol = "https:";
    }
  } catch {
    res.status(400).json({ error: "Invalid cover image URL" });
    return;
  }

  if (!/^https?:$/i.test(targetUrl.protocol)) {
    res.status(400).json({ error: "Unsupported cover image protocol" });
    return;
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      redirect: "follow",
      headers: {
        accept: "image/*,*/*;q=0.8",
        "user-agent": "BOOKHUB cover proxy",
      },
    });

    if (!response.ok) {
      res.status(502).json({ error: "Failed to fetch cover image" });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.toLowerCase().startsWith("image/")) {
      res.status(415).json({ error: "Remote URL did not return an image" });
      return;
    }

    const body = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      response.headers.get("cache-control") ?? "public, max-age=86400"
    );
    res.status(200).send(body);
  } catch (error) {
    req.log.error({ err: error, targetUrl: targetUrl.toString() }, "Cover proxy failed");
    res.status(502).json({ error: "Failed to fetch cover image" });
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const parsed = GetBookParams.safeParse({
      id: Number(req.params.id),
    });

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid id",
      });

      return;
    }

    const book = await db
      .select()
      .from(booksTable)
      .where(
        eq(
          booksTable.id,
          parsed.data.id
        )
      )
      .limit(1);

    if (!book[0]) {
      res.status(404).json({
        error: "Book not found",
      });

      return;
    }

    res.json(mapBook(book[0]));

  } catch (error) {
    console.error(
      "GET BOOK ERROR:",
      error
    );

    res.status(500).json({
      error: String(error),
    });
  }
});

router.post("/books", async (req, res) => {
  try {
    const parsed =
      CreateBookBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.message,
      });

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
        salePrice:
          data.salePrice != null
            ? String(data.salePrice)
            : null,
        isOnSale:
          data.isOnSale ?? false,
        isFree:
          data.isFree ?? false,
        isFeatured:
          data.isFeatured ?? false,
        coverImage:
          data.coverImage,
        category: data.category,
        language: data.language,
        ageGroup: data.ageGroup,
        pages:
          data.pages ?? null,
        downloadUrl:
          data.downloadUrl ?? null,
        stock:
          data.stock ?? 100,
      })
      .returning();

    await updateCategoryCount(
      data.category
    );

    res.status(201).json(
      mapBook(book)
    );

  } catch (error) {
    console.error(
      "CREATE BOOK ERROR:",
      error
    );

    res.status(500).json({
      error: String(error),
    });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateBookParams.safeParse({
      id: Number(req.params.id),
    });

    if (!paramsParsed.success) {
      res.status(400).json({
        error: "Invalid id",
      });

      return;
    }

    const parsed = UpdateBookBody.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.message,
      });

      return;
    }

    const existingBook = await db
      .select()
      .from(booksTable)
      .where(
        eq(
          booksTable.id,
          paramsParsed.data.id
        )
      )
      .limit(1);

    if (!existingBook[0]) {
      res.status(404).json({
        error: "Book not found",
      });

      return;
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.price !== undefined) updateData.price = String(data.price);
    if (data.salePrice !== undefined) {
      updateData.salePrice =
        data.salePrice != null
          ? String(data.salePrice)
          : null;
    }
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
      .where(
        eq(
          booksTable.id,
          paramsParsed.data.id
        )
      )
      .returning();

    if (!book) {
      res.status(404).json({
        error: "Book not found",
      });

      return;
    }

    if (
      data.category &&
      data.category !== existingBook[0].category
    ) {
      await updateCategoryCount(existingBook[0].category);
      await updateCategoryCount(data.category);
    } else {
      await updateCategoryCount(book.category);
    }

    res.json(mapBook(book));

  } catch (error) {
    console.error(
      "UPDATE BOOK ERROR:",
      error
    );

    res.status(500).json({
      error: String(error),
    });
  }
});

router.delete("/books/:id", async (req, res) => {
  try {
    const parsed = DeleteBookParams.safeParse({
      id: Number(req.params.id),
    });

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid id",
      });

      return;
    }

    const existingBook = await db
      .select()
      .from(booksTable)
      .where(
        eq(
          booksTable.id,
          parsed.data.id
        )
      )
      .limit(1);

    if (!existingBook[0]) {
      res.status(404).json({
        error: "Book not found",
      });

      return;
    }

    await db
      .delete(booksTable)
      .where(
        eq(
          booksTable.id,
          parsed.data.id
        )
      );

    await updateCategoryCount(existingBook[0].category);

    res.json({
      success: true,
      message: "Book deleted",
    });

  } catch (error) {
    console.error(
      "DELETE BOOK ERROR:",
      error
    );

    res.status(500).json({
      error: String(error),
    });
  }
});

async function updateCategoryCount(
  category: string
) {
  try {
    const { categoriesTable } =
      await import("@workspace/db");

    const count = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(booksTable)
      .where(
        eq(
          booksTable.category,
          category
        )
      );

    await db
      .insert(categoriesTable)
      .values({
        name: category,
        slug: category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        bookCount: Number(
          count[0]?.count ?? 0
        ),
      })
      .onConflictDoUpdate({
        target:
          categoriesTable.slug,
        set: {
          bookCount: Number(
            count[0]?.count ?? 0
          ),
        },
      });

  } catch (error) {
    console.error(
      "CATEGORY UPDATE ERROR:",
      error
    );
  }
}

function mapBook(
  b: typeof booksTable.$inferSelect
  ) {
  return {
    id: Number(b.id),
    title: b.title,
    description: b.description,
    author: b.author,
    price: Number(b.price),

    salePrice:
      b.salePrice != null
        ? Number(b.salePrice)
        : null,

    isOnSale: b.isOnSale,
    isFree: b.isFree,
    isFeatured: b.isFeatured,
    coverImage: b.coverImage,
    category: b.category,
    language: b.language,
    ageGroup: b.ageGroup,
    pages: b.pages ?? null,
    downloadUrl:
      b.downloadUrl ?? null,
    stock: b.stock,
    rating: Number(b.rating),
    reviewCount: b.reviewCount,

    createdAt: b.createdAt
      ? new Date(
          b.createdAt
        ).toISOString()
      : null,
  };
}

export default router;
