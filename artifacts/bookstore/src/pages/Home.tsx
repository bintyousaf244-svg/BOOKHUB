import React from "react";
import { Link } from "wouter";
import { useGetFeaturedBooks, useGetOnSaleBooks, useGetFreeBooks } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { ArrowRight, BookOpen, GraduationCap, BookHeart, ShieldCheck, Sparkles, Star, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function BookSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
    </div>
  );
}

const PURPLE = "hsl(270,62%,34%)";
const PINK = "hsl(330,77%,58%)";
const CREAM = "hsl(33,33%,94%)";
const CREAM_DARK = "hsl(33,25%,88%)";
const PURPLE_LIGHT = "hsl(270,40%,96%)";

export default function Home() {
  const { data: featuredBooks, isLoading: loadingFeatured } = useGetFeaturedBooks();
  const { data: onSaleBooks, isLoading: loadingSale } = useGetOnSaleBooks();
  const { data: freeBooks, isLoading: loadingFree } = useGetFreeBooks();

  return (
    <div className="flex flex-col w-full">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ background: PURPLE, minHeight: 580 }}>
        {/* Background photo */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PURPLE} 55%, hsl(270,62%,48%) 100%)`, opacity: 0.85 }} />

        {/* Decorative circle */}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: PINK }} />
        <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full opacity-10"
          style={{ background: PINK }} />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Sparkles className="h-4 w-4" style={{ color: PINK }} />
              Welcome to Learner's Grove
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white mb-6">
              Raise Confident<br />
              <span style={{ color: PINK }}>Little Learners</span>
            </h1>
            <p className="text-white/75 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Handcrafted English & Arabic learning books for kids and adults. Nurture curiosity, build language skills, and ignite a lifelong love of reading.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/books">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-base transition-all hover:opacity-90 active:scale-95 shadow-lg"
                  style={{ background: PINK }}>
                  <BookOpen className="h-5 w-5" /> Explore Collection
                </button>
              </Link>
              <Link href="/free">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base transition-all hover:bg-white/20 active:scale-95"
                  style={{ border: "2px solid rgba(255,255,255,0.4)", color: "white" }}>
                  Free Resources <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Hero stats */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
            {[
              { value: "100+", label: "Books & Articles" },
              { value: "2", label: "Languages" },
              { value: "Kids", label: "& Adults" },
              { value: "Free", label: "Resources" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center p-5 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-white/60 text-xs mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section style={{ background: "white", borderTop: `3px solid ${PINK}` }}>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <GraduationCap className="h-6 w-6" />, title: "Expert-Crafted", desc: "Every book is thoughtfully designed by educators" },
              { icon: <BookHeart className="h-6 w-6" />, title: "English & Arabic", desc: "Bilingual learning resources under one roof" },
              { icon: <ShieldCheck className="h-6 w-6" />, title: "Trusted by Parents", desc: "Safe, enriching content loved by families" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:shadow-md"
                style={{ background: CREAM }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ background: PURPLE }}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base" style={{ color: PURPLE }}>{item.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: "hsl(270,20%,48%)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY CARDS (Kids vs Adults) ═══ */}
      <section style={{ background: CREAM }} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-4"
              style={{ background: PINK }}>Browse by Age</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold" style={{ color: PURPLE }}>
              A Book for Every Mind
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Kids card */}
            <Link href="/books?ageGroup=Kids">
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, hsl(270,62%,48%) 100%)` }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20"
                  style={{ background: PINK }} />
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <span className="text-5xl">🌟</span>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Kids Learning</h3>
                    <p className="text-white/70 text-sm mb-4">Engaging stories & exercises for young minds</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Adults card */}
            <Link href="/books?ageGroup=Adults">
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${PINK} 0%, hsl(330,77%,45%) 100%)` }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20"
                  style={{ background: "white" }} />
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <span className="text-5xl">📚</span>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Adult Education</h3>
                    <p className="text-white/70 text-sm mb-4">Advanced language & learning materials</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED BOOKS ═══ */}
      <section style={{ background: "white" }} className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-3"
                style={{ background: PURPLE }}>Hand-picked</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold" style={{ color: PURPLE }}>
                Featured Collection
              </h2>
              <p className="mt-2" style={{ color: "hsl(270,20%,48%)" }}>Our most loved books this season.</p>
            </div>
            <Link href="/books">
              <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
                style={{ background: CREAM_DARK, color: PURPLE }}>
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <BookSkeleton key={i} />)
              : featuredBooks?.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      {/* ═══ FREE RESOURCES BANNER ═══ */}
      <section className="py-20" style={{ background: PURPLE_LIGHT }}>
        <div className="container mx-auto px-4">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 mb-12 text-center"
            style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, hsl(270,62%,46%) 100%)` }}>
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: PINK }} />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-10"
              style={{ background: PINK }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                style={{ background: PINK, color: "white" }}>
                <Download className="h-4 w-4" /> 100% Free
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
                Knowledge Should Be Accessible
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-6">
                Download free articles, short books, and learning materials crafted for our community.
              </p>
              <Link href="/free">
                <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "white", color: PURPLE }}>
                  Browse Free Materials <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Free books grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {loadingFree
              ? Array.from({ length: 5 }).map((_, i) => <BookSkeleton key={i} />)
              : freeBooks?.slice(0, 5).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      {/* ═══ ON SALE ═══ */}
      {onSaleBooks && onSaleBooks.length > 0 && (
        <section style={{ background: "white" }} className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold text-white mb-3"
                  style={{ background: "hsl(25,90%,55%)" }}>
                  <Star className="h-3.5 w-3.5 fill-current" /> Limited Offers
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold" style={{ color: PURPLE }}>
                  Special Deals
                </h2>
                <p className="mt-2" style={{ color: "hsl(270,20%,48%)" }}>Discounted books — grab them before they're gone.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {loadingSale
                ? Array.from({ length: 4 }).map((_, i) => <BookSkeleton key={i} />)
                : onSaleBooks.slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-20" style={{ background: CREAM }}>
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="text-5xl mb-6">📖</div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4" style={{ color: PURPLE }}>
            Start Learning Today
          </h2>
          <p className="text-lg mb-8" style={{ color: "hsl(270,20%,48%)" }}>
            Join thousands of learners who trust Learner's Grove for bilingual education that actually works.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/books">
              <button className="px-8 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: PURPLE }}>
                Browse All Books
              </button>
            </Link>
            <Link href="/free">
              <button className="px-8 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: PINK, color: "white" }}>
                Free Resources
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
