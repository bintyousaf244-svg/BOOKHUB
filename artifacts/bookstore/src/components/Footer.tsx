import React, { useEffect, useState } from "react";
import { Link } from "wouter";

interface SocialLinks {
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

export function Footer() {
  const [social, setSocial] = useState<SocialLinks>({ facebookUrl: "", instagramUrl: "", websiteUrl: "" });

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((r) => r.json())
      .then((d) => setSocial({ facebookUrl: d.facebookUrl || "", instagramUrl: d.instagramUrl || "", websiteUrl: d.websiteUrl || "" }))
      .catch(() => {});
  }, []);

  const hasSocial = social.facebookUrl || social.instagramUrl || social.websiteUrl;

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

          {/* Social Links */}
          {hasSocial && (
            <div className="flex items-center gap-3">
              {social.facebookUrl && (
                <a
                  href={social.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-[#1877f2] hover:text-white transition-all"
                >
                  <FacebookIcon />
                </a>
              )}
              {social.instagramUrl && (
                <a
                  href={social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] hover:text-white transition-all"
                  style={{}}
                >
                  <InstagramIcon />
                </a>
              )}
              {social.websiteUrl && (
                <a
                  href={social.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <WebsiteIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-4 font-serif text-lg">Shop</h3>
          <ul className="space-y-2 text-primary-foreground/70">
            <li><Link href="/books" className="hover:text-accent transition-colors">All Books</Link></li>
            <li><Link href="/books?ageGroup=Kids" className="hover:text-accent transition-colors">Kids Learning</Link></li>
            <li><Link href="/books?ageGroup=Adults" className="hover:text-accent transition-colors">Adult Education</Link></li>
            <li><Link href="/free" className="hover:text-accent transition-colors">Free Articles</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 font-serif text-lg">Support</h3>
          <ul className="space-y-2 text-primary-foreground/70">
            <li><Link href="/my-orders" className="hover:text-accent transition-colors">My Orders</Link></li>
            <li><Link href="/cart" className="hover:text-accent transition-colors">Shopping Cart</Link></li>
            {social.websiteUrl && (
              <li>
                <a href={social.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Our Website
                </a>
              </li>
            )}
            <li><Link href="/admin" className="hover:text-accent transition-colors text-xs opacity-50">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
        <span>&copy; {new Date().getFullYear()} Learner's Grove. All rights reserved.</span>
        {hasSocial && (
          <div className="flex items-center gap-4">
            {social.facebookUrl && <a href={social.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Facebook</a>}
            {social.instagramUrl && <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Instagram</a>}
            {social.websiteUrl && <a href={social.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Website</a>}
          </div>
        )}
      </div>
    </footer>
  );
}
