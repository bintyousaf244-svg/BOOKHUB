import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Menu, User, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const links = [
    { href: "/books", label: "All Books" },
    { href: "/books?ageGroup=Kids", label: "Kids" },
    { href: "/books?ageGroup=Adults", label: "Adults" },
    { href: "/free", label: "Free Resources" },
    { href: "/my-orders", label: "My Orders" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
        style={{ background: "hsl(270,62%,34%)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="Learner's Grove" className="h-10 w-10 object-contain drop-shadow" />
            <span className="text-lg font-bold font-serif tracking-tight text-white leading-tight hidden sm:block">
              Learner's Grove
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <button className="relative flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition-all">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "hsl(330,77%,58%)" }}>
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/books">
              <button className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "hsl(330,77%,58%)" }}>
                <BookOpen className="h-4 w-4" /> Shop Now
              </button>
            </Link>

            {isAuthenticated && (
              <Link href="/admin/dashboard">
                <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition-all">
                  <User className="h-4 w-4" />
                </button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setOpen((o) => !o)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition-all">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <nav className="absolute top-16 left-0 right-0 shadow-2xl border-b"
            style={{ background: "hsl(270,62%,28%)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-4 py-3 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link href="/admin/dashboard"
                  className="px-4 py-3 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 pb-1">
                <Link href="/books">
                  <button className="w-full py-3 rounded-full text-sm font-bold text-white transition-all"
                    style={{ background: "hsl(330,77%,58%)" }}>
                    Shop All Books
                  </button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
