import React from "react";
import { Link } from "wouter";
import { useGetFeaturedBooks, useGetOnSaleBooks, useGetFreeBooks } from "@workspace/api-client-react";
import { ArrowRight, BookHeart, BookOpen, Download, GraduationCap, ShieldCheck, Sparkles, Star } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { BookCoverImage } from "@/components/BookCoverImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsiteContent } from "@/context/WebsiteContentContext";

function BookSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
    </div>
  );
}

export default function Home() {
  const { content } = useWebsiteContent();
  const { data: featuredBooks, isLoading: loadingFeatured } = useGetFeaturedBooks();
  const { data: onSaleBooks, isLoading: loadingSale } = useGetOnSaleBooks();
  const { data: freeBooks, isLoading: loadingFree } = useGetFreeBooks();

  const hero = content.home.hero;
  const trust = content.home.trust;
  const categories = content.home.categories;
  const featured = content.home.featured;
  const freeResources = content.home.freeResources;
  const deals = content.home.deals;
  const cta = content.home.cta;
  const freeResourceSpotlights = freeBooks?.slice(0, 5) ?? [];
  const freeSpotlightPositions = [
    {
      shell: "left-[8%] top-[10%] h-44 w-32 rotate-[-10deg]",
      glow: "rgba(255, 203, 107, 0.28)",
    },
    {
      shell: "left-[33%] top-[2%] h-52 w-36 rotate-[7deg]",
      glow: "rgba(255, 159, 214, 0.24)",
    },
    {
      shell: "right-[16%] top-[11%] h-60 w-40 rotate-[4deg]",
      glow: "rgba(255, 255, 255, 0.22)",
    },
    {
      shell: "left-[20%] bottom-[5%] h-48 w-34 rotate-[9deg]",
      glow: "rgba(116, 227, 255, 0.23)",
    },
    {
      shell: "right-[0%] bottom-[2%] h-52 w-36 rotate-[-8deg]",
      glow: "rgba(161, 255, 143, 0.20)",
    },
  ];

  const trustIcons = [GraduationCap, BookHeart, ShieldCheck];

  return (
    <div className="flex flex-col w-full">
      <section className="relative overflow-hidden" style={{ background: hero.backgroundColor, minHeight: 580 }}>
        {hero.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url("${hero.backgroundImage}")` }}
          />
        )}
        <div className="absolute inset-0" style={{ background: hero.overlayColor, opacity: hero.overlayOpacity }} />
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: hero.accentColor }} />
        <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full opacity-10" style={{ background: hero.accentColor }} />

        <div
          className={`relative z-10 container mx-auto px-4 py-16 md:py-32 flex flex-col gap-8 md:gap-12 ${hero.layout === "center" ? "items-center text-center" : "md:flex-row items-center"}`}
        >
          <div className={`flex-1 ${hero.layout === "center" ? "text-center" : "text-center md:text-left"}`}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: "rgba(255,255,255,0.15)", color: hero.textColor, border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Sparkles className="h-4 w-4" style={{ color: hero.accentColor }} />
              {hero.eyebrow}
            </div>

            <h1
              className="font-bold leading-tight mb-6"
              style={{ color: hero.textColor, fontFamily: hero.fontFamily, fontSize: `clamp(2.5rem, 4vw, ${hero.titleSize}px)` }}
            >
              {hero.titleLine1}
              <br />
              <span style={{ color: hero.accentColor }}>{hero.titleHighlight}</span>
            </h1>
            <p
              className="max-w-xl mb-10 leading-relaxed"
              style={{ color: `${hero.textColor}bf`, fontSize: hero.bodySize, marginInline: hero.layout === "center" ? "auto" : undefined }}
            >
              {hero.description}
            </p>
            <div className={`flex flex-wrap gap-4 ${hero.layout === "center" ? "justify-center" : "justify-center md:justify-start"}`}>
              <Link href="/books">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg" style={{ background: hero.accentColor, color: hero.textColor }}>
                  <BookOpen className="h-5 w-5" /> {hero.primaryButtonLabel}
                </button>
              </Link>
              <Link href="/free">
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold transition-all hover:bg-white/20 active:scale-95"
                  style={{ border: "2px solid rgba(255,255,255,0.4)", color: hero.textColor }}
                >
                  {hero.secondaryButtonLabel} <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          <div className={`flex-shrink-0 ${hero.layout === "center" ? "w-full max-w-3xl" : "hidden md:grid w-64"} md:grid grid-cols-2 gap-4`}>
            {hero.stats.map((stat) => (
              <div
                key={`${stat.value}-${stat.label}`}
                className="flex flex-col items-center justify-center p-5 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <span className="text-2xl font-bold" style={{ color: hero.textColor }}>{stat.value}</span>
                <span className="text-xs mt-1" style={{ color: `${hero.textColor}99` }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex md:hidden items-center justify-center gap-6 pt-2 flex-wrap" style={{ color: `${hero.textColor}b3` }}>
            {hero.stats.slice(0, 3).map((stat, index) => (
              <React.Fragment key={`${stat.value}-${stat.label}-mobile`}>
                {index > 0 && <span className="opacity-40">.</span>}
                <span><strong style={{ color: hero.textColor }}>{stat.value}</strong> {stat.label}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: trust.backgroundColor, borderTop: `3px solid ${trust.accentColor}` }}>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <h2 style={{ color: trust.textColor, fontFamily: trust.fontFamily, fontSize: trust.titleSize }}>{trust.title}</h2>
          </div>
          <div className={`max-w-5xl mx-auto ${trust.layout === "inline" ? "flex flex-col md:flex-row gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-6"}`}>
            {trust.items.map((item, index) => {
              const Icon = trustIcons[index % trustIcons.length];
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:shadow-md flex-1"
                  style={{ background: trust.cardBackgroundColor }}
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: trust.textColor }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 style={{ color: trust.textColor, fontFamily: trust.fontFamily, fontSize: trust.bodySize + 2 }} className="font-bold">
                      {item.title}
                    </h3>
                    <p style={{ color: `${trust.textColor}bf`, fontSize: trust.bodySize }} className="mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: categories.backgroundColor }} className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-4" style={{ background: categories.accentColor }}>
              {categories.eyebrow}
            </span>
            <h2 style={{ color: categories.textColor, fontFamily: categories.fontFamily, fontSize: `clamp(2rem, 4vw, ${categories.titleSize}px)` }} className="font-bold">
              {categories.title}
            </h2>
          </div>
          <div className={`${categories.layout === "stack" ? "flex flex-col" : "grid grid-cols-1 md:grid-cols-2"} gap-6 max-w-4xl mx-auto`}>
            <Link href="/books?ageGroup=Kids">
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: categories.kidsBackground }}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20" style={{ background: categories.accentColor }} />
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: categories.fontFamily }}>{categories.kidsTitle}</h3>
                  <p className="text-white/80 mb-4" style={{ fontSize: categories.bodySize }}>{categories.kidsDescription}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                    Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/books?ageGroup=Adults">
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: categories.adultsBackground }}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20 bg-white" />
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: categories.fontFamily }}>{categories.adultsTitle}</h3>
                  <p className="text-white/80 mb-4" style={{ fontSize: categories.bodySize }}>{categories.adultsDescription}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                    Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: featured.backgroundColor }} className={featured.layout === "spacious" ? "py-24" : "py-20"}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-3" style={{ background: featured.textColor }}>
                {featured.eyebrow}
              </span>
              <h2 style={{ color: featured.textColor, fontFamily: featured.fontFamily, fontSize: `clamp(2rem, 4vw, ${featured.titleSize}px)` }} className="font-bold">
                {featured.title}
              </h2>
              <p className="mt-2" style={{ color: `${featured.textColor}bf`, fontSize: featured.bodySize }}>{featured.description}</p>
            </div>
            <Link href="/books">
              <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90" style={{ background: featured.accentColor, color: featured.textColor }}>
                {featured.buttonLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-3 ${featured.layout === "spacious" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-5 md:gap-6`}>
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, index) => <BookSkeleton key={index} />)
              : featuredBooks?.slice(0, featured.layout === "spacious" ? 6 : 4).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ background: freeResources.backgroundColor }}>
        <div className="container mx-auto px-4">
          <div
            className={`relative overflow-hidden rounded-[2rem] ${freeResources.layout === "spacious" ? "p-8 md:p-12" : "p-6 md:p-10"} mb-12`}
            style={{
              background: `${freeResources.bannerBackground}, radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.14), transparent 25%)`,
              boxShadow: "0 30px 90px rgba(83, 37, 108, 0.18)",
            }}
          >
            <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 18%), radial-gradient(circle at 85% 18%, rgba(255,214,153,0.18), transparent 14%), radial-gradient(circle at 72% 68%, rgba(255,255,255,0.14), transparent 16%)" }} />
            <div className="absolute inset-x-0 bottom-0 h-24 opacity-35" style={{ background: "linear-gradient(180deg, transparent, rgba(16, 6, 26, 0.55))" }} />
            <div className="absolute -left-12 bottom-0 h-48 w-48 rounded-full opacity-15" style={{ background: freeResources.accentColor }} />
            <div className="absolute -right-10 top-0 h-56 w-56 rounded-full opacity-15" style={{ background: freeResources.accentColor }} />
            <div className="absolute left-[42%] top-[16%] h-28 w-28 rounded-full blur-3xl opacity-30" style={{ background: "rgba(255,255,255,0.28)" }} />
            <div className="absolute right-[22%] bottom-[14%] h-24 w-24 rounded-full blur-3xl opacity-25" style={{ background: "rgba(255,208,120,0.32)" }} />

            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5" style={{ background: freeResources.accentColor, color: freeResources.textColor }}>
                  <Download className="h-4 w-4" /> {freeResources.badge}
                </div>
                <h2
                  style={{ color: freeResources.textColor, fontFamily: freeResources.fontFamily, fontSize: `clamp(2.3rem, 5vw, ${freeResources.titleSize}px)` }}
                  className="font-bold leading-tight mb-4"
                >
                  {freeResources.title}
                </h2>
                <p className="max-w-xl mb-8 leading-relaxed" style={{ color: `${freeResources.textColor}d9`, fontSize: freeResources.bodySize }}>
                  {freeResources.description}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mb-8">
                  {[
                    "Preview bright, eye-catching free titles instantly",
                    "Clickable covers open the exact book page",
                    "A more animated, alive showcase for free content",
                    "Great for helping visitors discover books faster",
                  ].map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-sm"
                      style={{ color: freeResources.textColor, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm" style={{ background: "rgba(255,255,255,0.22)" }}>
                        +
                      </span>
                      <span className="text-sm md:text-base" style={{ color: `${freeResources.textColor}f2` }}>{point}</span>
                    </div>
                  ))}
                </div>

                <Link href="/free">
                  <button className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-lg" style={{ background: "#ffffff", color: "#582C6F" }}>
                    {freeResources.buttonLabel} <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              <div className="relative min-h-[440px] hidden lg:block">
                <div className="absolute inset-0 rounded-[2rem]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.10), transparent 58%)" }} />
                {freeResourceSpotlights.map((book, index) => {
                  const placement = freeSpotlightPositions[index];

                  if (!placement) return null;

                  return (
                    <Link key={book.id} href={`/books/${book.id}`}>
                      <div
                        className={`absolute ${placement.shell} cursor-pointer rounded-[1.7rem] p-2 transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.18)",
                          boxShadow: `0 18px 45px ${placement.glow}`,
                        }}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-[1.2rem]">
                          <BookCoverImage src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
                          <div className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: "rgba(76, 132, 94, 0.95)" }}>
                            FREE
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow-sm">
                              {book.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {freeResourceSpotlights.length > 0 && (
              <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 lg:hidden">
                {freeResourceSpotlights.slice(0, 4).map((book) => (
                  <Link key={book.id} href={`/books/${book.id}`}>
                    <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
                      <BookCoverImage src={book.coverImage} alt={book.title} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-semibold" style={{ color: freeResources.textColor }}>
                          {book.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 ${freeResources.layout === "spacious" ? "lg:grid-cols-4" : "lg:grid-cols-5"} gap-4 md:gap-5`}>
            {loadingFree
              ? Array.from({ length: 5 }).map((_, index) => <BookSkeleton key={index} />)
              : freeBooks?.slice(0, freeResources.layout === "spacious" ? 8 : 5).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      {onSaleBooks && onSaleBooks.length > 0 && (
        <section style={{ background: deals.backgroundColor }} className={deals.layout === "spacious" ? "py-24" : "py-20"}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold text-white mb-3" style={{ background: deals.accentColor }}>
                  <Star className="h-3.5 w-3.5 fill-current" /> {deals.badge}
                </span>
                <h2 style={{ color: deals.textColor, fontFamily: deals.fontFamily, fontSize: `clamp(2rem, 4vw, ${deals.titleSize}px)` }} className="font-bold">
                  {deals.title}
                </h2>
                <p className="mt-2" style={{ color: `${deals.textColor}bf`, fontSize: deals.bodySize }}>{deals.description}</p>
              </div>
            </div>
            <div className={`grid grid-cols-2 md:grid-cols-3 ${deals.layout === "spacious" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-5 md:gap-6`}>
              {loadingSale
                ? Array.from({ length: 4 }).map((_, index) => <BookSkeleton key={index} />)
                : onSaleBooks.slice(0, deals.layout === "spacious" ? 6 : 4).map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-20" style={{ background: cta.backgroundColor }}>
        <div className={`container mx-auto px-4 max-w-4xl ${cta.layout === "split" ? "grid md:grid-cols-[1.2fr_0.8fr] items-center gap-8" : "text-center max-w-2xl"}`}>
          <div className={cta.layout === "split" ? "" : "text-center"}>
            <div className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold mb-6" style={{ background: `${cta.secondaryAccentColor}26`, color: cta.secondaryAccentColor }}>
              {cta.badge}
            </div>
            <h2 style={{ color: cta.textColor, fontFamily: cta.fontFamily, fontSize: `clamp(2rem, 4vw, ${cta.titleSize}px)` }} className="font-bold mb-4">
              {cta.title}
            </h2>
            <p className="mb-8" style={{ color: `${cta.textColor}bf`, fontSize: cta.bodySize }}>{cta.description}</p>
          </div>
          <div className={`flex flex-wrap gap-4 ${cta.layout === "split" ? "justify-start" : "justify-center"}`}>
            <Link href="/books">
              <button className="px-8 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg" style={{ background: cta.accentColor }}>
                {cta.primaryButtonLabel}
              </button>
            </Link>
            <Link href="/free">
              <button className="px-8 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95" style={{ background: cta.secondaryAccentColor, color: "#ffffff" }}>
                {cta.secondaryButtonLabel}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
