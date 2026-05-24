import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWebsiteContent } from "@/context/WebsiteContentContext";
import { ShoppingCart, Menu, User, X, BookOpen } from "lucide-react";

export function Navbar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { content } = useWebsiteContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const navbar = content.navbar;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const links = [
    { href: "/books", label: "All Books", forceReload: true },
    { href: "/books?ageGroup=Kids", label: "Kids", forceReload: true },
    { href: "/books?ageGroup=Adults", label: "Adults", forceReload: true },
    { href: "/books?ageGroup=All%20Ages", label: "All Ages", forceReload: true },
    { href: "/free", label: "Free Resources", forceReload: false },
    { href: "/my-orders", label: "My Orders", forceReload: false },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
        style={{ background: navbar.backgroundColor, color: navbar.textColor }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt={navbar.brandName} className="h-10 w-10 object-contain drop-shadow" />
            <span
              className="text-lg font-bold tracking-tight leading-tight hidden sm:block"
              style={{ color: navbar.textColor, fontFamily: navbar.fontFamily }}
            >
              {navbar.brandName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) =>
              link.forceReload ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 font-medium hover:bg-white/10 rounded-full transition-all"
                  style={{ color: `${navbar.textColor}cc`, fontSize: navbar.navFontSize }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 font-medium hover:bg-white/10 rounded-full transition-all"
                  style={{ color: `${navbar.textColor}cc`, fontSize: navbar.navFontSize }}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-all"
                style={{ color: navbar.textColor }}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: navbar.accentColor }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/books">
              <button
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: navbar.ctaBackgroundColor, color: navbar.ctaTextColor }}
              >
                <BookOpen className="h-4 w-4" /> {navbar.ctaLabel}
              </button>
            </Link>

            {isAuthenticated && (
              <Link href="/admin/dashboard">
                <button
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-all"
                  style={{ color: navbar.textColor }}
                >
                  <User className="h-4 w-4" />
                </button>
              </Link>
            )}

            <button
              onClick={() => setOpen((value) => !value)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-all"
              style={{ color: navbar.textColor }}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <nav
            className="absolute top-16 left-0 right-0 shadow-2xl border-b"
            style={{ background: navbar.backgroundColor }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((link) =>
                link.forceReload ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-base font-medium hover:bg-white/10 rounded-xl transition-all"
                    style={{ color: `${navbar.textColor}e6` }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-base font-medium hover:bg-white/10 rounded-xl transition-all"
                    style={{ color: `${navbar.textColor}e6` }}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              {isAuthenticated && (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-3 text-base font-medium hover:bg-white/10 rounded-xl transition-all"
                  style={{ color: `${navbar.textColor}b3` }}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 pb-1">
                <Link href="/books">
                  <button
                    className="w-full py-3 rounded-full text-sm font-bold transition-all"
                    style={{ background: navbar.ctaBackgroundColor, color: navbar.ctaTextColor }}
                  >
                    {navbar.ctaLabel}
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
