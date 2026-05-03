import React from "react";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ArrowRight, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <BookOpen className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">Your library cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any books to your cart yet. Explore our collection to find your next great read.</p>
        <Link href="/books">
          <Button size="lg" className="rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90">
            Browse Books
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">Your Cart ({itemCount} items)</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <Card key={item.bookId} className="overflow-hidden border-border shadow-sm">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <Link href={`/books/${item.bookId}`} className="flex-shrink-0">
                  <img src={item.coverImage} alt={item.title} className="w-24 sm:w-32 aspect-[3/4] object-cover rounded-md shadow-sm border border-border" />
                </Link>
                
                <div className="flex-1 flex flex-col text-center sm:text-left w-full">
                  <Link href={`/books/${item.bookId}`}>
                    <h3 className="font-serif font-bold text-lg text-foreground hover:text-accent transition-colors mb-2">{item.title}</h3>
                  </Link>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    <div className="flex flex-col">
                      {item.isOnSale && item.salePrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">Rs. {item.salePrice}</span>
                          <span className="text-xs text-muted-foreground line-through">Rs. {item.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">Rs. {item.price}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between sm:justify-start gap-6 w-full">
                    <div className="flex items-center border border-input rounded-md overflow-hidden bg-background">
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium border-x border-input h-full flex items-center justify-center bg-muted/30">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.bookId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <Card className="border-border shadow-md sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-bold mb-6 text-foreground">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>Rs. {subtotal}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base shadow-sm">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
