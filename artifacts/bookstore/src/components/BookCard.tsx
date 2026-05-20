import React from "react";
import { Link } from "wouter";
import { Book } from "@workspace/api-client-react/src/generated/api.schemas";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Download } from "lucide-react";
import { BookCoverImage } from "@/components/BookCoverImage";
import { getBookLanguageBadgeLabel } from "@/lib/bookMetadata";

export function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      bookId: book.id,
      title: book.title,
      price: book.price,
      salePrice: book.salePrice,
      isOnSale: book.isOnSale,
      coverImage: book.coverImage,
    });
    toast({ title: "Added to cart!", description: `${book.title} is in your cart.` });
  };

  const displayPrice = book.isOnSale && book.salePrice ? book.salePrice : book.price;

  return (
    <Link href={`/books/${book.id}`}>
      <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#e0d8c8] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#D97B8F] hover:shadow-xl">
        <div className="relative aspect-[3/4] overflow-hidden bg-[hsl(33,33%,94%)]">
          <BookCoverImage
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-107"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {book.isFree && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md"
                style={{ background: "#416D53" }}
              >
                FREE
              </span>
            )}
            {!book.isFree && book.isOnSale && (
              <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                SALE
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5">
            <span
              className="rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold shadow-sm backdrop-blur"
              style={{ color: "#582C6F" }}
            >
              {getBookLanguageBadgeLabel(book.language)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div
            className="text-[10px] font-bold uppercase tracking-widest opacity-60"
            style={{ color: "#416D53" }}
          >
            {book.category} · {book.ageGroup}
          </div>
          <h3
            className="flex-1 line-clamp-2 font-serif text-base font-bold leading-snug transition-colors"
            style={{ color: "#582C6F" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D97B8F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#582C6F")}
          >
            {book.title}
          </h3>
          <p className="line-clamp-1 text-xs" style={{ color: "#6b6080" }}>
            {book.author}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-[#e8e0d0] pt-3">
            <div>
              {book.isFree ? (
                <span className="text-sm font-bold" style={{ color: "#416D53" }}>
                  Free
                </span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold" style={{ color: "#582C6F" }}>
                    Rs. {displayPrice}
                  </span>
                  {book.isOnSale && book.salePrice && (
                    <span className="text-xs line-through" style={{ color: "#9d8c6a" }}>
                      Rs. {book.price}
                    </span>
                  )}
                </div>
              )}
            </div>

            {book.isFree ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (book.downloadUrl) window.open(book.downloadUrl, "_blank");
                }}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#416D53" }}
              >
                <Download className="h-3.5 w-3.5" />
                Get
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#D97B8F" }}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
