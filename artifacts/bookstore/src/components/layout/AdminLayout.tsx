import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Book, ShoppingCart, LogOut, Store, Tag, CreditCard, FolderOpen, Palette } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated && location !== "/") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border flex flex-col text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <span className="font-serif font-bold text-xl tracking-tight text-sidebar-primary">Admin Panel</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/books" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/books') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <Book className="h-5 w-5" /> Books
          </Link>
          <Link href="/orders" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/orders') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <ShoppingCart className="h-5 w-5" /> Orders
          </Link>
          <Link href="/categories" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/categories') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <FolderOpen className="h-5 w-5" /> Categories
          </Link>
          <Link href="/discounts" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/discounts') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <Tag className="h-5 w-5" /> Discount Codes
          </Link>
          <Link href="/payment-settings" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/payment-settings') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <CreditCard className="h-5 w-5" /> Payment Settings
          </Link>
          <Link href="/website-editor" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/website-editor') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50'}`}>
            <Palette className="h-5 w-5" /> Website Editor
          </Link>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 transition-colors mb-2">
            <Store className="h-5 w-5" /> Back to Store
          </a>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background h-screen overflow-y-auto">
        <div className="p-6 md:p-8 flex-1 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
