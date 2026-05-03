import React from "react";
import { Link } from "wouter";
import { Book } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Download, Star } from "lucide-react";

export function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation
    addToCart({
      bookId: book.id,
      title: book.title,
      price: book.price,
      salePrice: book.salePrice,
      isOnSale: book.isOnSale,
      coverImage: book.coverImage
    });
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`
    });
  };

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="group h-full overflow-hidden flex flex-col cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={book.coverImage} 
            alt={book.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {book.isFree && <Badge variant="secondary" className="bg-accent text-accent-foreground font-bold shadow-md">FREE</Badge>}
            {!book.isFree && book.isOnSale && <Badge variant="destructive" className="font-bold shadow-md">SALE</Badge>}
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {book.language === "Arabic" && <Badge variant="outline" className="bg-background/80 backdrop-blur font-serif text-xs">عربي</Badge>}
            {book.language === "English" && <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs">EN</Badge>}
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col bg-card relative z-10">
          <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {book.category} &bull; {book.ageGroup}
          </div>
          <h3 className="font-serif font-bold text-lg leading-tight mb-1 text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{book.author}</p>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex flex-col">
              {book.isFree ? (
                <span className="font-bold text-accent">Free</span>
              ) : (
                <div className="flex items-center gap-2">
                  {book.isOnSale && book.salePrice ? (
                    <>
                      <span className="font-bold text-lg">Rs. {book.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">Rs. {book.price}</span>
                    </>
                  ) : (
                    <span className="font-bold text-lg">Rs. {book.price}</span>
                  )}
                </div>
              )}
            </div>
            
            {book.isFree ? (
              <Button size="sm" variant="secondary" className="rounded-full shadow-sm hover:shadow-md" onClick={(e) => {
                e.preventDefault();
                if(book.downloadUrl) window.open(book.downloadUrl, '_blank');
              }}>
                <Download className="h-4 w-4 mr-2" />
                Get
              </Button>
            ) : (
              <Button size="icon" className="rounded-full shadow-sm hover:shadow-md bg-primary hover:bg-accent text-primary-foreground transition-colors" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
