import React from "react";
import { Link } from "wouter";
import { useGetFeaturedBooks, useGetOnSaleBooks, useGetFreeBooks } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookHeart, GraduationCap, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function BookSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function Home() {
  const { data: featuredBooks, isLoading: loadingFeatured } = useGetFeaturedBooks();
  const { data: onSaleBooks, isLoading: loadingSale } = useGetOnSaleBooks();
  const { data: freeBooks, isLoading: loadingFree } = useGetFreeBooks();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 bg-accent text-accent-foreground border-none font-bold px-3 py-1">Welcome to Learner's Grove</Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 text-primary-foreground">
              Cultivate minds with handcrafted knowledge
            </h1>
            <p className="text-lg md:text-xl mb-10 text-primary-foreground/80 max-w-2xl leading-relaxed">
              Discover beautifully curated learning books for kids and adults. Bridging English and Arabic through rich, educational stories and exercises.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/books">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 px-8 rounded-full text-base">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/free">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 h-14 px-8 rounded-full text-base backdrop-blur">
                  Free Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-card py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bold font-serif">Curated for Learning</h3>
              <p className="text-sm text-muted-foreground">Expertly crafted materials</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <BookHeart className="h-6 w-6" />
              </div>
              <h3 className="font-bold font-serif">Bilingual Support</h3>
              <p className="text-sm text-muted-foreground">English and Arabic texts</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold font-serif">Trusted by Parents</h3>
              <p className="text-sm text-muted-foreground">Loved by thousands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-3 text-foreground">Featured Collection</h2>
              <p className="text-muted-foreground">Our handpicked selection of exceptional books.</p>
            </div>
            <Link href="/books" className="text-accent font-semibold hover:underline hidden sm:flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <BookSkeleton key={i} />)
              : featuredBooks?.slice(0,4).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      {/* Free Books Strip */}
      <section className="bg-secondary/30 py-20 border-y border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl mb-12">
          <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent-foreground border-accent/20 font-bold px-3 py-1">Free Resources</Badge>
          <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Knowledge should be accessible</h2>
          <p className="text-muted-foreground">Download free articles, short books, and learning materials crafted for our community.</p>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {loadingFree
              ? Array.from({ length: 5 }).map((_, i) => <BookSkeleton key={i} />)
              : freeBooks?.slice(0,5).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
          <div className="text-center mt-12">
            <Link href="/free">
              <Button variant="outline" className="rounded-full px-8 h-12 font-semibold">
                Browse All Free Materials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* On Sale */}
      {onSaleBooks && onSaleBooks.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-3 text-foreground">Special Offers</h2>
                <p className="text-muted-foreground">Limited time discounts on selected learning materials.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {loadingSale
                ? Array.from({ length: 4 }).map((_, i) => <BookSkeleton key={i} />)
                : onSaleBooks.slice(0,4).map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
