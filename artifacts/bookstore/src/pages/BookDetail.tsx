import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetBook, getGetBookQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Download,
  CheckCircle,
  ArrowLeft,
  Star,
  FileText,
} from "lucide-react";
import { BookCoverImage } from "@/components/BookCoverImage";
import { parseBookMetadataList } from "@/lib/bookMetadata";

export default function BookDetail() {
  const { id } = useParams();
  const bookId = id ? parseInt(id, 10) : 0;

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: getGetBookQueryKey(bookId) },
  });

  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12 md:flex-row">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          </div>
          <div className="w-full space-y-6 md:w-2/3 lg:w-3/4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="mb-4 text-2xl font-serif font-bold">Book not found</h2>
        <Link href="/books">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const inCart = items.some((i) => i.bookId === book.id);
  const categoryValues = parseBookMetadataList(book.category);
  const languageValues = parseBookMetadataList(book.language);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        bookId: book.id,
        title: book.title,
        price: book.price,
        salePrice: book.salePrice,
        isOnSale: book.isOnSale,
        coverImage: book.coverImage,
      });
    }

    toast({
      title: "Added to cart",
      description: `${quantity}x ${book.title} added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/books"
        className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Library
      </Link>

      <div className="flex flex-col items-start gap-12 md:flex-row lg:gap-16">
        <div className="w-full flex-shrink-0 md:w-1/3 lg:w-1/4">
          <div className="relative overflow-hidden rounded-xl border border-border shadow-xl">
            <BookCoverImage
              src={book.coverImage}
              alt={book.title}
              className="aspect-[3/4] h-auto w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {book.isFree && (
                <Badge
                  variant="secondary"
                  className="bg-accent font-bold text-accent-foreground shadow-md"
                >
                  FREE
                </Badge>
              )}
              {!book.isFree && book.isOnSale && (
                <Badge variant="destructive" className="font-bold shadow-md">
                  SALE
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col md:w-2/3 lg:w-3/4">
          <div className="mb-4 flex flex-wrap gap-2">
            {categoryValues.map((categoryValue) => (
              <Badge
                key={`category-${categoryValue}`}
                variant="outline"
                className="text-xs uppercase tracking-wider"
              >
                {categoryValue}
              </Badge>
            ))}
            {languageValues.map((languageValue) => (
              <Badge
                key={`language-${languageValue}`}
                variant="outline"
                className="text-xs uppercase tracking-wider"
              >
                {languageValue}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {book.ageGroup}
            </Badge>
          </div>

          <h1 className="mb-2 text-3xl font-serif font-bold leading-tight text-foreground md:text-5xl">
            {book.title}
          </h1>
          <p className="mb-6 text-xl text-muted-foreground">By {book.author}</p>

          <div className="mb-8 flex items-center gap-4 border-b border-border/50 pb-8">
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-lg font-bold">{book.rating.toFixed(1)}</span>
              <span className="ml-1 text-sm text-muted-foreground">
                ({book.reviewCount} reviews)
              </span>
            </div>
            {book.pages && (
              <div className="flex items-center gap-1 border-l border-border pl-4 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{book.pages} pages</span>
              </div>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert mb-10 max-w-none leading-relaxed text-muted-foreground">
            <p>{book.description}</p>
          </div>

          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:p-8">
            <div className="flex flex-col text-center md:text-left">
              {book.isFree ? (
                <span className="text-3xl font-bold text-accent">Free Download</span>
              ) : (
                <div className="flex flex-col">
                  {book.isOnSale && book.salePrice ? (
                    <>
                      <span className="mb-1 text-sm text-muted-foreground line-through">
                        Regularly Rs. {book.price}
                      </span>
                      <span className="text-4xl font-bold text-foreground">
                        Rs. {book.salePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-foreground">
                      Rs. {book.price}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex w-full items-center gap-4 md:w-auto">
              {!book.isFree && (
                <div className="flex h-12 items-center rounded-full border border-input bg-background px-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    disabled={quantity >= book.stock}
                  >
                    +
                  </button>
                </div>
              )}

              {book.isFree ? (
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-accent px-8 font-bold text-accent-foreground shadow-md hover:bg-accent/90 md:w-auto"
                  onClick={() => book.downloadUrl && window.open(book.downloadUrl, "_blank")}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Now
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-primary px-8 font-bold text-primary-foreground shadow-md hover:bg-primary/90 md:w-auto"
                  onClick={handleAddToCart}
                >
                  {inCart ? (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {inCart ? "Add More" : "Add to Cart"}
                </Button>
              )}
            </div>
          </div>

          {!book.isFree && book.stock > 0 && book.stock < 10 && (
            <p className="mt-4 text-sm font-medium text-destructive">
              Only {book.stock} copies left in stock!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
