import React from "react";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  
  const NavLinks = () => (
    <>
      <Link href="/books" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
        All Books
      </Link>
      <Link href="/books?ageGroup=Kids" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
        Kids
      </Link>
      <Link href="/books?ageGroup=Adults" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
        Adults
      </Link>
      <Link href="/free" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
        Free Resources
      </Link>
      <Link href="/my-orders" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
        My Orders
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Learner's Grove"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold font-serif tracking-tight text-primary leading-tight">
              Learner's Grove
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-foreground hover:text-accent">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated && (
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon" className="hidden md:flex text-foreground hover:text-accent">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6 pt-12">
              <NavLinks />
              {isAuthenticated && (
                <Link href="/admin/dashboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
