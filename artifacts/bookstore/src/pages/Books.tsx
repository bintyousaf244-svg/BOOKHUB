import React, { useState } from "react";
import { useListBooks, useListCategories } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PURPLE = "#582C6F";
const PINK = "#D97B8F";
const CREAM = "#f5f0e8";

function BookSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
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
    setSearch(""); setCategory("all"); setLanguage("all"); setAgeGroup("all"); setFilterType("all");
  };

  const filteredBooks = data?.books.filter((b) => ageGroup === "all" || b.ageGroup === ageGroup) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Page hero banner */}
      <section className="relative overflow-hidden py-14 md:py-20"
        style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #7a3e96 100%)` }}>
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-10" style={{ background: PINK }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <BookOpen className="h-5 w-5 text-white" />
            </span>
            <span className="text-sm font-semibold text-white/70 uppercase tracking-widest">Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">Book Catalog</h1>
          <p className="text-white/65 text-lg max-w-xl">
            Browse our full collection of English & Arabic learning books for all ages.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 sticky top-20">
            <div className="rounded-2xl p-6 space-y-5 shadow-sm" style={{ background: "white", border: "1px solid #e0d8c8" }}>
              <h2 className="font-bold font-serif text-base" style={{ color: PURPLE }}>Filter Books</h2>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b5a7a" }}>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#9d8aac" }} />
                  <Input placeholder="Search books..." className="pl-9 rounded-xl border-[#e0d8c8]"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              {[
                {
                  label: "Category", value: category, onChange: setCategory,
                  options: [{ v: "all", l: "All Categories" }, ...(categories?.map((c) => ({ v: c.slug, l: c.name })) || [])]
                },
                {
                  label: "Language", value: language, onChange: setLanguage,
                  options: [{ v: "all", l: "All Languages" }, { v: "English", l: "English" }, { v: "Arabic", l: "Arabic" }]
                },
                {
                  label: "Age Group", value: ageGroup, onChange: setAgeGroup,
                  options: [{ v: "all", l: "All Ages" }, { v: "Kids", l: "Kids" }, { v: "Adults", l: "Adults" }]
                },
                {
                  label: "Type", value: filterType, onChange: setFilterType,
                  options: [{ v: "all", l: "All Types" }, { v: "free", l: "Free Only" }, { v: "paid", l: "Paid Only" }, { v: "sale", l: "On Sale" }]
                },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b5a7a" }}>{f.label}</Label>
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger className="rounded-xl border-[#e0d8c8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <button onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: CREAM, color: PURPLE }}>
                <FilterX className="h-4 w-4" /> Reset Filters
              </button>
            </div>
          </aside>

          {/* Book grid */}
          <main className="flex-1 w-full">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <BookSkeleton key={i} />)}
              </div>
            ) : filteredBooks.length > 0 ? (
              <>
                <p className="text-sm mb-5" style={{ color: "#6b5a7a" }}>
                  {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredBooks.map((book) => <BookCard key={book.id} book={book} />)}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
                style={{ background: "white", border: "1px solid #e0d8c8" }}>
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-serif font-bold mb-2" style={{ color: PURPLE }}>No books found</h3>
                <p className="mb-5" style={{ color: "#6b5a7a" }}>Try adjusting your filters to find what you're looking for.</p>
                <button onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: PINK }}>
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
