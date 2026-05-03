import React from "react";
import { Link } from "wouter";
import { Book } from "@workspace/api-client-react/src/generated/api.schemas";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Download } from "lucide-react";

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
      <div className="group relative flex flex-col h-full cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#e0d8c8] hover:border-[#D97B8F] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* Cover image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[hsl(33,33%,94%)]">
          <img
            src={book.coverImage}
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-107"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Top-left badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {book.isFree && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-md"
                style={{ background: "#416D53" }}>FREE</span>
            )}
            {!book.isFree && book.isOnSale && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-md bg-orange-500">SALE</span>
            )}
          </div>

          {/* Top-right language badge */}
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/85 backdrop-blur shadow-sm"
              style={{ color: "#582C6F" }}>
              {book.language === "Arabic" ? "عربي" : "EN"}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-60"
            style={{ color: "#416D53" }}>
            {book.category} · {book.ageGroup}
          </div>
          <h3 className="font-serif font-bold text-base leading-snug transition-colors line-clamp-2 flex-1"
            style={{ color: "#582C6F" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D97B8F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#582C6F")}>
            {book.title}
          </h3>
          <p className="text-xs line-clamp-1" style={{ color: "#6b6080" }}>{book.author}</p>

          {/* Price row */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-[#e8e0d0]">
            <div>
              {book.isFree ? (
                <span className="font-bold text-sm" style={{ color: "#416D53" }}>Free</span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-base" style={{ color: "#582C6F" }}>Rs. {displayPrice}</span>
                  {book.isOnSale && book.salePrice && (
                    <span className="text-xs line-through" style={{ color: "#9d8c6a" }}>Rs. {book.price}</span>
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#416D53" }}>
                <Download className="h-3.5 w-3.5" /> Get
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-8 h-8 rounded-full text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
                style={{ background: "#D97B8F" }}>
                <ShoppingCart className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
