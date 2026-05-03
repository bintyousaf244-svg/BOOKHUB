import React from "react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Learner's Grove" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold font-serif tracking-tight">
              Learner's Grove
            </span>
          </Link>
          <p className="text-primary-foreground/70 max-w-sm mb-6">
            Handcrafted learning books for kids and adults, bridging English and Arabic. A home for minds to bloom.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 font-serif text-lg">Shop</h3>
          <ul className="space-y-2 text-primary-foreground/70">
            <li><Link href="/books" className="hover:text-accent transition-colors">All Books</Link></li>
            <li><Link href="/books?category=kids" className="hover:text-accent transition-colors">Kids Learning</Link></li>
            <li><Link href="/books?category=adults" className="hover:text-accent transition-colors">Adult Education</Link></li>
            <li><Link href="/free" className="hover:text-accent transition-colors">Free Articles</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 font-serif text-lg">Support</h3>
          <ul className="space-y-2 text-primary-foreground/70">
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="hover:text-accent transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/admin" className="hover:text-accent transition-colors text-xs opacity-50">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
        &copy; {new Date().getFullYear()} Learner's Grove. All rights reserved.
      </div>
    </footer>
  );
}
