import React, { useEffect, useState } from "react";
import { Link } from "wouter";

interface SocialLinks {
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
}

const PURPLE = "#582C6F";
const PURPLE_DARK = "#3a1d49";
const PINK = "#D97B8F";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
    <footer style={{ background: PURPLE_DARK }}>
      {/* Top wave divider */}
      <div style={{ background: PURPLE_DARK, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          className="w-full block" style={{ height: 40, marginBottom: -1, fill: "hsl(33,33%,94%)" }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="Learner's Grove" className="h-12 w-12 object-contain drop-shadow-lg" />
              <span className="text-xl font-bold font-serif tracking-tight text-white">
                Learner's Grove
              </span>
            </Link>
            <p className="text-white/60 max-w-xs text-sm leading-relaxed mb-6">
              Handcrafted English & Arabic learning books for kids and adults. A home for curious minds to bloom.
            </p>

            {/* Social icons */}
            {hasSocial && (
              <div className="flex items-center gap-3">
                {social.facebookUrl && (
                  <a href={social.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:scale-110"
                    style={{ background: "#1877f2" }}>
                    <FacebookIcon />
                  </a>
                )}
                {social.instagramUrl && (
                  <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:scale-110"
                    style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743)" }}>
                    <InstagramIcon />
                  </a>
                )}
                {social.websiteUrl && (
                  <a href={social.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Website"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white transition-all hover:scale-110"
                    style={{ background: PINK }}>
                    <GlobeIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-5 text-white/40">Shop</h3>
            <ul className="space-y-3">
              {[
                { href: "/books", label: "All Books" },
                { href: "/books?ageGroup=Kids", label: "Kids Learning" },
                { href: "/books?ageGroup=Adults", label: "Adult Education" },
                { href: "/free", label: "Free Resources" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-5 text-white/40">Account</h3>
            <ul className="space-y-3">
              {[
                { href: "/my-orders", label: "My Orders" },
                { href: "/cart", label: "Shopping Cart" },
                ...(social.websiteUrl ? [{ href: social.websiteUrl, label: "Our Website", ext: true }] : []),
              ].map((l) => (
                <li key={l.href}>
                  {"ext" in l && l.ext ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href="/admin" className="text-xs text-white/25 hover:text-white/50 transition-colors">Admin</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
          <p className="text-xs text-white/35">&copy; {new Date().getFullYear()} Learner's Grove. All rights reserved.</p>
          {hasSocial && (
            <div className="flex items-center gap-5">
              {social.facebookUrl && <a href={social.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/35 hover:text-white/70 transition-colors">Facebook</a>}
              {social.instagramUrl && <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/35 hover:text-white/70 transition-colors">Instagram</a>}
              {social.websiteUrl && <a href={social.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/35 hover:text-white/70 transition-colors">Website</a>}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
