import React, { useState } from "react";
import { useParams } from "wouter";
import { useGetBook, getGetBookQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Download, CheckCircle, ArrowLeft, Star, FileText } from "lucide-react";
import { Link } from "wouter";

export default function BookDetail() {
  const { id } = useParams();
  const bookId = id ? parseInt(id, 10) : 0;
  
  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: getGetBookQueryKey(bookId) }
  });

  const { addToCart, items } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
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
        <h2 className="text-2xl font-serif font-bold mb-4">Book not found</h2>
        <Link href="/books">
          <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Library</Button>
        </Link>
      </div>
    );
  }

  const inCart = items.some(i => i.bookId === book.id);

  const handleAddToCart = () => {
    // Add multiple quantities
    for(let i=0; i<quantity; i++) {
      addToCart({
        bookId: book.id,
        title: book.title,
        price: book.price,
        salePrice: book.salePrice,
        isOnSale: book.isOnSale,
        coverImage: book.coverImage
      });
    }
    toast({
      title: "Added to cart",
      description: `${quantity}x ${book.title} added to your cart.`
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/books" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
        {/* Cover */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative rounded-xl overflow-hidden shadow-xl border border-border">
            <img src={book.coverImage} alt={book.title} className="w-full h-auto object-cover aspect-[3/4]" />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {book.isFree && <Badge variant="secondary" className="bg-accent text-accent-foreground font-bold shadow-md">FREE</Badge>}
              {!book.isFree && book.isOnSale && <Badge variant="destructive" className="font-bold shadow-md">SALE</Badge>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">{book.category}</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wider">{book.language === "Arabic" ? "عربي" : book.language}</Badge>
            <Badge variant="outline" className="text-xs uppercase tracking-wider">{book.ageGroup}</Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2 leading-tight">
            {book.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">By {book.author}</p>

          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold text-lg">{book.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm ml-1">({book.reviewCount} reviews)</span>
            </div>
            {book.pages && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm border-l border-border pl-4">
                <FileText className="h-4 w-4" />
                <span>{book.pages} pages</span>
              </div>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none mb-10 text-muted-foreground leading-relaxed">
            <p>{book.description}</p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col text-center md:text-left">
              {book.isFree ? (
                <span className="text-3xl font-bold text-accent">Free Download</span>
              ) : (
                <div className="flex flex-col">
                  {book.isOnSale && book.salePrice ? (
                    <>
                      <span className="text-sm text-muted-foreground line-through mb-1">Regularly Rs. {book.price}</span>
                      <span className="text-4xl font-bold text-foreground">Rs. {book.salePrice}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-foreground">Rs. {book.price}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {!book.isFree && (
                <div className="flex items-center border border-input rounded-full px-2 h-12 bg-background">
                  <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
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
                  className="rounded-full h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-md w-full md:w-auto"
                  onClick={() => book.downloadUrl && window.open(book.downloadUrl, '_blank')}
                >
                  <Download className="mr-2 h-5 w-5" /> Download Now
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="rounded-full h-12 px-8 bg-primary hover:bg-primary/90 font-bold shadow-md w-full md:w-auto text-primary-foreground"
                  onClick={handleAddToCart}
                >
                  {inCart ? <CheckCircle className="mr-2 h-5 w-5" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                  {inCart ? "Add More" : "Add to Cart"}
                </Button>
              )}
            </div>
          </div>
          
          {!book.isFree && book.stock > 0 && book.stock < 10 && (
            <p className="text-sm text-destructive mt-4 font-medium">Only {book.stock} copies left in stock!</p>
          )}
        </div>
      </div>
    </div>
  );
}
