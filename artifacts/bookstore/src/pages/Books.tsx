import React, { useState } from "react";
import { useListBooks, useListCategories } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function Books() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: categories } = useListCategories();

  const queryParams = {
    ...(search && { search }),
    ...(category !== "all" && { category }),
    ...(language !== "all" && { language }),
    ...(filterType === "free" && { isFree: true }),
    ...(filterType === "paid" && { isFree: false }),
    ...(filterType === "sale" && { isOnSale: true }),
  };

  const { data, isLoading } = useListBooks(queryParams);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setLanguage("all");
    setAgeGroup("all");
    setFilterType("all");
  };

  // Filter age group client side since API doesn't have it natively in params 
  const filteredBooks = data?.books.filter((b) => ageGroup === "all" || b.ageGroup === ageGroup) || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8 text-foreground">Library Catalog</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 sticky top-24">
          <div>
            <Label htmlFor="search" className="mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search"
                placeholder="Search books..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Age Group</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="Kids">Kids</SelectItem>
                <SelectItem value="Adults">Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="sale">On Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full text-muted-foreground" onClick={resetFilters}>
            <FilterX className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <BookSkeleton key={i} />)}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Clear Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
