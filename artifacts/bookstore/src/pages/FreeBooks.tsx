import React from "react";
import { useGetFreeBooks } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download } from "lucide-react";

function BookSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function FreeBooks() {
  const { data: freeBooks, isLoading } = useGetFreeBooks();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">Free Learning Resources</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Knowledge should be accessible to everyone. Browse our collection of free articles, worksheets, and short books designed to inspire learners of all ages.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => <BookSkeleton key={i} />)}
        </div>
      ) : freeBooks && freeBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {freeBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-border">
          <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">No free resources right now</h2>
          <p className="text-muted-foreground">Check back later for new additions to our free library.</p>
        </div>
      )}
    </div>
  );
}
