import React from "react";
import { Link } from "wouter";
import { useGetFeaturedBooks, useGetOnSaleBooks, useGetFreeBooks } from "@workspace/api-client-react";
import { ArrowRight, BookHeart, BookOpen, Download, GraduationCap, ShieldCheck, Sparkles, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { BookCoverImage } from "@/components/BookCoverImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsiteContent } from "@/context/WebsiteContentContext";
import { getTextEffectStyle } from "@/lib/textEffects";

const getTrustIcon = (name?: string, index: number = 0) => {
  const trustIcons = [GraduationCap, BookHeart, ShieldCheck];
  if (!name) return trustIcons[index % trustIcons.length];
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent || trustIcons[index % trustIcons.length];
};

function BookSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3 rounded-full" />
      <Skeleton className="h-4 w-1/2 rounded-full" />
    </div>
  );
}

const freeCircleDesktopPositions = [
  { size: 118, top: "2%", left: "50%", marginLeft: -59, delay: "0s", z: 2 },
  { size: 112, top: "15%", right: "6%", delay: "0.9s", z: 2 },
  { size: 168, top: "50%", left: "50%", marginTop: -84, marginLeft: -84, delay: "1.8s", z: 5 },
  { size: 114, bottom: "14%", right: "10%", delay: "0.4s", z: 2 },
  { size: 118, bottom: "1%", left: "50%", marginLeft: -59, delay: "1.3s", z: 2 },
  { size: 112, bottom: "15%", left: "6%", delay: "2.1s", z: 2 },
  { size: 118, top: "15%", left: "6%", delay: "0.7s", z: 2 },
];

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
  const freeResourceSpotlights = freeBooks?.slice(0, freeResources.spotlightDesktopCount) ?? [];
  const freeCirclePositions = [
    "w-[120px] h-[120px] top-[-2%] left-[calc(50%-60px)] z-[2]",
    "w-[110px] h-[110px] top-[10%] right-[5%] z-[2]",
    "w-[160px] h-[160px] top-[50%] left-[50%] -mt-[80px] -ml-[80px] z-[5]",
    "w-[115px] h-[115px] bottom-[5%] right-[10%] z-[2]",
    "w-[120px] h-[120px] bottom-[-12%] left-[calc(50%-60px)] z-[2]",
    "w-[110px] h-[110px] bottom-[10%] left-[5%] z-[2]",
    "w-[120px] h-[120px] top-[10%] left-[0%] z-[2]",
  ];

  const trustIcons = [GraduationCap, BookHeart, ShieldCheck];

  return (
    <div className="flex flex-col w-full">
      <style>{`
        @keyframes bookhub-free-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <section className="relative overflow-hidden" style={{ background: hero.backgroundColor, minHeight: 580 }}>
        {hero.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${hero.backgroundImage}")`, opacity: hero.backgroundImageOpacity }}
          />
        )}
        {hero.overlayOpacity > 0 && (
          <div className="absolute inset-0" style={{ background: hero.overlayColor, opacity: hero.overlayOpacity }} />
        )}
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: hero.accentColor }} />
        <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full opacity-10" style={{ background: hero.accentColor }} />

        <div
          className={`relative z-10 container mx-auto px-4 py-16 md:py-32 flex flex-col gap-8 md:gap-12 ${hero.layout === "center" ? "items-center text-center" : "md:flex-row items-center"}`}
        >
          <div className={`flex-1 ${hero.layout === "center" ? "text-center" : "text-center md:text-left"}`}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: hero.textColor,
                border: "1px solid rgba(255,255,255,0.25)",
                ...getTextEffectStyle(hero.bodyEffect, hero.accentColor, hero.textColor, hero.bodyEffectColor, hero.bodyEffectIntensity),
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: hero.accentColor }} />
              {hero.eyebrow}
            </div>

            <h1
              className="font-bold leading-tight mb-6"
              style={{
                color: hero.textColor,
                fontFamily: hero.fontFamily,
                fontSize: `clamp(2.5rem, 4vw, ${hero.titleSize}px)`,
                ...getTextEffectStyle(hero.titleEffect, hero.accentColor, hero.textColor, hero.titleEffectColor, hero.titleEffectIntensity),
              }}
            >
              {hero.titleLine1}
              <br />
              <span style={{ color: hero.accentColor }}>{hero.titleHighlight}</span>
            </h1>
            <p
              className="max-w-xl mb-10 leading-relaxed"
              style={{
                color: `${hero.textColor}bf`,
                fontSize: hero.bodySize,
                marginInline: hero.layout === "center" ? "auto" : undefined,
                ...getTextEffectStyle(hero.bodyEffect, hero.accentColor, hero.textColor, hero.bodyEffectColor, hero.bodyEffectIntensity),
              }}
            >
              {hero.description}
            </p>
            <div className={`flex flex-wrap gap-4 ${hero.layout === "center" ? "justify-center" : "justify-center md:justify-start"}`}>
              <Link href={hero.primaryButtonLink || "/books"}>
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
                  style={{
                    background: hero.primaryButtonBgColor || hero.accentColor,
                    color: hero.primaryButtonTextColor || hero.textColor,
                  }}
                >
                  <BookOpen className="h-5 w-5" /> {hero.primaryButtonLabel}
                </button>
              </Link>
              <Link href={hero.secondaryButtonLink || "/free"}>
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold transition-all active:scale-95"
                  style={{
                    background: hero.secondaryButtonBgColor || "transparent",
                    border: hero.secondaryButtonBgColor ? "none" : "2px solid rgba(255,255,255,0.4)",
                    color: hero.secondaryButtonTextColor || hero.textColor,
                  }}
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
            <h2 style={{ color: trust.textColor, fontFamily: trust.fontFamily, fontSize: trust.titleSize, ...getTextEffectStyle(trust.titleEffect, trust.accentColor, trust.textColor, trust.titleEffectColor, trust.titleEffectIntensity) }}>{trust.title}</h2>
          </div>
          <div className={`max-w-5xl mx-auto ${trust.layout === "inline" ? "flex flex-col md:flex-row gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-6"}`}>
            {trust.items.map((item, index) => {
              const Icon = getTrustIcon(item.iconName, index);
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
                    <h3 style={{ color: trust.textColor, fontFamily: trust.fontFamily, fontSize: trust.bodySize + 2, ...getTextEffectStyle(trust.bodyEffect, trust.accentColor, trust.textColor, trust.bodyEffectColor, trust.bodyEffectIntensity) }} className="font-bold">
                      {item.title}
                    </h3>
                    <p style={{ color: `${trust.textColor}bf`, fontSize: trust.bodySize, ...getTextEffectStyle(trust.bodyEffect, trust.accentColor, trust.textColor, trust.bodyEffectColor, trust.bodyEffectIntensity) }} className="mt-0.5">
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
            <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-4" style={{ background: categories.accentColor, ...getTextEffectStyle(categories.bodyEffect, categories.accentColor, "#ffffff", categories.bodyEffectColor, categories.bodyEffectIntensity) }}>
              {categories.eyebrow}
            </span>
            <h2 style={{ color: categories.textColor, fontFamily: categories.fontFamily, fontSize: `clamp(2rem, 4vw, ${categories.titleSize}px)`, ...getTextEffectStyle(categories.titleEffect, categories.accentColor, categories.textColor, categories.titleEffectColor, categories.titleEffectIntensity) }} className="font-bold">
              {categories.title}
            </h2>
          </div>
          <div className={`${categories.layout === "stack" ? "flex flex-col" : "grid grid-cols-1 md:grid-cols-2"} gap-6 max-w-4xl mx-auto`}>
            <Link href={categories.kidsLink || "/books?ageGroup=Kids"}>
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: categories.kidsBackground }}>
                {categories.kidsBackgroundImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${categories.kidsBackgroundImage}")`, opacity: categories.kidsBackgroundImageOpacity ?? 0.45 }}
                  />
                )}
                {(categories.kidsOverlayOpacity ?? 0) > 0 && (
                  <div className="absolute inset-0" style={{ background: categories.kidsOverlayColor || "rgba(0,0,0,0.4)", opacity: categories.kidsOverlayOpacity }} />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20" style={{ background: categories.accentColor }} />
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: categories.fontFamily, color: categories.kidsTextColor || "#ffffff", ...getTextEffectStyle(categories.bodyEffect, categories.accentColor, categories.kidsTextColor || "#ffffff", categories.bodyEffectColor, categories.bodyEffectIntensity) }}>{categories.kidsTitle}</h3>
                  <p className="mb-4" style={{ fontSize: categories.bodySize, color: categories.kidsTextColor ? `${categories.kidsTextColor}cc` : "rgba(255,255,255,0.8)", ...getTextEffectStyle(categories.bodyEffect, categories.accentColor, categories.kidsTextColor || "#ffffff", categories.bodyEffectColor, categories.bodyEffectIntensity) }}>{categories.kidsDescription}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: categories.kidsTextColor || "#ffffff" }}>
                    Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>

            <Link href={categories.adultsLink || "/books?ageGroup=Adults"}>
              <div className="group relative overflow-hidden rounded-3xl cursor-pointer h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: categories.adultsBackground }}>
                {categories.adultsBackgroundImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${categories.adultsBackgroundImage}")`, opacity: categories.adultsBackgroundImageOpacity ?? 0.45 }}
                  />
                )}
                {(categories.adultsOverlayOpacity ?? 0) > 0 && (
                  <div className="absolute inset-0" style={{ background: categories.adultsOverlayColor || "rgba(0,0,0,0.4)", opacity: categories.adultsOverlayOpacity }} />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-20 bg-white" />
                <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: categories.fontFamily, color: categories.adultsTextColor || "#ffffff", ...getTextEffectStyle(categories.bodyEffect, categories.accentColor, categories.adultsTextColor || "#ffffff", categories.bodyEffectColor, categories.bodyEffectIntensity) }}>{categories.adultsTitle}</h3>
                  <p className="mb-4" style={{ fontSize: categories.bodySize, color: categories.adultsTextColor ? `${categories.adultsTextColor}cc` : "rgba(255,255,255,0.8)", ...getTextEffectStyle(categories.bodyEffect, categories.accentColor, categories.adultsTextColor || "#ffffff", categories.bodyEffectColor, categories.bodyEffectIntensity) }}>{categories.adultsDescription}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: categories.adultsTextColor || "#ffffff" }}>
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
              <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-white mb-3" style={{ background: featured.textColor, ...getTextEffectStyle(featured.bodyEffect, featured.accentColor, "#ffffff", featured.bodyEffectColor, featured.bodyEffectIntensity) }}>
                {featured.eyebrow}
              </span>
              <h2 style={{ color: featured.textColor, fontFamily: featured.fontFamily, fontSize: `clamp(2rem, 4vw, ${featured.titleSize}px)`, ...getTextEffectStyle(featured.titleEffect, featured.accentColor, featured.textColor, featured.titleEffectColor, featured.titleEffectIntensity) }} className="font-bold">
                {featured.title}
              </h2>
              <p className="mt-2" style={{ color: `${featured.textColor}bf`, fontSize: featured.bodySize, ...getTextEffectStyle(featured.bodyEffect, featured.accentColor, featured.textColor, featured.bodyEffectColor, featured.bodyEffectIntensity) }}>{featured.description}</p>
            </div>
            <Link href={featured.buttonLink || "/books"}>
              <button
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
                style={{
                  background: featured.buttonBgColor || featured.accentColor,
                  color: featured.buttonTextColor || featured.textColor,
                }}
              >
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
            className="relative overflow-hidden rounded-[2rem] px-6 py-10 md:px-10 md:py-14 mb-12"
            style={{
              background: freeResources.bannerBackground,
              boxShadow: "0 30px 90px rgba(83, 37, 108, 0.22)",
            }}
          >
            {freeResources.backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${freeResources.backgroundImage}")`, opacity: freeResources.backgroundImageOpacity ?? 0.35 }}
              />
            )}
            {(freeResources.overlayOpacity ?? 0) > 0 && (
              <div className="absolute inset-0" style={{ background: freeResources.overlayColor || "rgba(0,0,0,0.4)", opacity: freeResources.overlayOpacity }} />
            )}
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.08), transparent 18%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.07), transparent 16%)" }} />
            <div className={`relative z-10 flex flex-col gap-10 lg:items-center lg:gap-12 ${freeResources.bannerLayout === "right" ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
              <div className="flex-1 min-w-[300px]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-5" style={{ background: freeResources.accentColor, color: freeResources.textColor, ...getTextEffectStyle(freeResources.bodyEffect, freeResources.accentColor, freeResources.textColor, freeResources.bodyEffectColor, freeResources.bodyEffectIntensity) }}>
                  <Download className="h-4 w-4" /> {freeResources.badge}
                </div>
                <h2
                  style={{
                    color: freeResources.textColor,
                    fontFamily: freeResources.fontFamily,
                    fontSize: `clamp(2.4rem, 6vw, ${freeResources.titleSize}px)`,
                    ...getTextEffectStyle(freeResources.titleEffect, freeResources.accentColor, freeResources.textColor, freeResources.titleEffectColor, freeResources.titleEffectIntensity),
                  }}
                  className="font-bold leading-[1.06] mb-6 max-w-3xl"
                >
                  {freeResources.title}
                </h2>
                <p className="max-w-2xl mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.95)", fontSize: `clamp(1rem, 2vw, ${freeResources.bodySize}px)`, textShadow: "0 2px 8px rgba(0,0,0,0.6)", ...getTextEffectStyle(freeResources.bodyEffect, freeResources.accentColor, freeResources.textColor, freeResources.bodyEffectColor, freeResources.bodyEffectIntensity) }}>
                  {freeResources.description}
                </p>

                <div className="space-y-4 mb-10">
                  {(freeResources.bullets && freeResources.bullets.length > 0 ? freeResources.bullets : [
                    "Free books visitors can preview before downloading",
                    "Clickable covers open the exact book page",
                    "A magical showcase for your free learning materials",
                  ]).map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-4"
                      style={{ color: freeResources.textColor }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm flex-shrink-0" style={{ color: freeResources.checkmarkColor || "#bfa345", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                        <span style={{ fontSize: 20, lineHeight: 1 }}>✓</span>
                      </span>
                      <span className="text-lg leading-snug" style={{ color: freeResources.checkmarkTextColor || "rgba(255,255,255,0.95)", textShadow: "0 2px 8px rgba(0,0,0,0.6)", ...getTextEffectStyle(freeResources.bodyEffect, freeResources.accentColor, freeResources.checkmarkTextColor || freeResources.textColor, freeResources.bodyEffectColor, freeResources.bodyEffectIntensity) }}>{point}</span>
                    </div>
                  ))}
                </div>

                <Link href={freeResources.buttonLink || "/free"}>
                  <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-xl transition-all hover:opacity-90 active:scale-95 shadow-lg" style={{ background: freeResources.buttonBackgroundColor || "#4a2955", color: freeResources.buttonTextColor || "#ffffff", boxShadow: `0 12px 25px ${freeResources.buttonBackgroundColor ? freeResources.buttonBackgroundColor + "40" : "rgba(74, 41, 85, 0.3)"}` }}>
                    {freeResources.buttonLabel} <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>

              <div className="flex-1 min-w-[300px]">
                <div className="relative h-[380px] md:h-[420px] lg:h-[400px]">
                  <div
                    className="absolute top-1/2 left-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[25px]"
                    style={{ background: "radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(200,150,255,0.10) 40%, rgba(0,0,0,0) 70%)" }}
                  />
                  <div className="hidden lg:block relative w-full h-full">
                    {freeResourceSpotlights.slice(0, freeResources.spotlightDesktopCount).map((book, index) => {
                      const position = freeCircleDesktopPositions[index];
                      if (!position) return null;

                      return (
                        <Link key={book.id} href={`/books/${book.id}`}>
                          <div
                            className="absolute rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                            style={{
                              width: position.size,
                              height: position.size,
                              top: position.top,
                              right: position.right,
                              bottom: position.bottom,
                              left: position.left,
                              marginTop: position.marginTop,
                              marginLeft: position.marginLeft,
                              zIndex: position.z,
                              border: "3px solid rgba(255,255,255,0.6)",
                              boxShadow: "0 0 30px rgba(255,215,0,0.30), 0 15px 35px rgba(0,0,0,0.50)",
                              animation: `bookhub-free-float 6s ease-in-out ${position.delay} infinite alternate`,
                            }}
                          >
                            <BookCoverImage src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:hidden">
                    {freeResourceSpotlights.slice(0, freeResources.spotlightMobileCount).map((book, index) => (
                      <Link key={book.id} href={`/books/${book.id}`}>
                        <div
                          className="rounded-full overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            aspectRatio: "1 / 1",
                            border: "3px solid rgba(255,255,255,0.6)",
                            boxShadow: "0 0 20px rgba(255,215,0,0.20), 0 10px 25px rgba(0,0,0,0.35)",
                            animation: `bookhub-free-float 6s ease-in-out ${index * 0.4}s infinite alternate`,
                          }}
                        >
                          <BookCoverImage src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 ${freeResources.layout === "spacious" ? "lg:grid-cols-4" : "lg:grid-cols-5"} gap-4 md:gap-5`}>
            {loadingFree
              ? Array.from({ length: 5 }).map((_, index) => <BookSkeleton key={index} />)
              : freeBooks?.slice(0, freeResources.layout === "spacious" ? 8 : 5).map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      <section style={{ background: deals.backgroundColor }} className={deals.layout === "spacious" ? "py-24" : "py-20"}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold text-white mb-3" style={{ background: deals.accentColor, ...getTextEffectStyle(deals.bodyEffect, deals.accentColor, "#ffffff", deals.bodyEffectColor, deals.bodyEffectIntensity) }}>
                <Star className="h-3.5 w-3.5 fill-current" /> {deals.badge}
              </span>
              <h2 style={{ color: deals.textColor, fontFamily: deals.fontFamily, fontSize: `clamp(2rem, 4vw, ${deals.titleSize}px)`, ...getTextEffectStyle(deals.titleEffect, deals.accentColor, deals.textColor, deals.titleEffectColor, deals.titleEffectIntensity) }} className="font-bold">
                {deals.title}
              </h2>
              <p className="mt-2" style={{ color: `${deals.textColor}bf`, fontSize: deals.bodySize, ...getTextEffectStyle(deals.bodyEffect, deals.accentColor, deals.textColor, deals.bodyEffectColor, deals.bodyEffectIntensity) }}>{deals.description}</p>
            </div>
          </div>
          {onSaleBooks && onSaleBooks.length > 0 ? (
            <div className={`grid grid-cols-2 md:grid-cols-3 ${deals.layout === "spacious" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-5 md:gap-6`}>
              {loadingSale
                ? Array.from({ length: 4 }).map((_, index) => <BookSkeleton key={index} />)
                : onSaleBooks.slice(0, deals.layout === "spacious" ? 6 : 4).map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[2rem] border-2 border-dashed max-w-2xl mx-auto backdrop-blur-sm shadow-sm transition-all duration-300" style={{ borderColor: `${deals.textColor}26`, background: `${deals.textColor}05` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-bounce" style={{ background: `${deals.accentColor}1a`, color: deals.accentColor }}>
                <Star className="h-8 w-8 fill-current" style={{ color: deals.accentColor }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: deals.textColor, fontFamily: deals.fontFamily, ...getTextEffectStyle(deals.titleEffect, deals.accentColor, deals.textColor, deals.titleEffectColor, deals.titleEffectIntensity) }}>No Active Deals Right Now</h3>
              <p className="max-w-md leading-relaxed" style={{ color: `${deals.textColor}a6`, fontSize: deals.bodySize - 2, ...getTextEffectStyle(deals.bodyEffect, deals.accentColor, deals.textColor, deals.bodyEffectColor, deals.bodyEffectIntensity) }}>
                We are working on bringing new special offers to the store. Please check back later or explore our featured collection of books!
              </p>
              <Link href="/books" className="mt-6">
                <button className="px-6 py-2.5 rounded-full text-xs font-bold transition-all hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg" style={{ background: deals.accentColor, color: "#ffffff" }}>
                  Browse All Books
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20" style={{ background: cta.backgroundColor }}>
        <div className={`container mx-auto px-4 max-w-4xl ${cta.layout === "split" ? "grid md:grid-cols-[1.2fr_0.8fr] items-center gap-8" : "text-center max-w-2xl"}`}>
          <div className={cta.layout === "split" ? "" : "text-center"}>
            <div className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold mb-6" style={{ background: `${cta.secondaryAccentColor}26`, color: cta.secondaryAccentColor, ...getTextEffectStyle(cta.bodyEffect, cta.secondaryAccentColor, cta.secondaryAccentColor, cta.bodyEffectColor, cta.bodyEffectIntensity) }}>
              {cta.badge}
            </div>
            <h2
              style={{
                color: cta.textColor,
                fontFamily: cta.fontFamily,
                fontSize: `clamp(2rem, 4vw, ${cta.titleSize}px)`,
                ...getTextEffectStyle(cta.titleEffect, cta.accentColor, cta.textColor, cta.titleEffectColor, cta.titleEffectIntensity),
              }}
              className="font-bold mb-4"
            >
              {cta.title}
            </h2>
            <p className="mb-8" style={{ color: `${cta.textColor}bf`, fontSize: cta.bodySize, ...getTextEffectStyle(cta.bodyEffect, cta.accentColor, cta.textColor, cta.bodyEffectColor, cta.bodyEffectIntensity) }}>{cta.description}</p>
          </div>
          <div className={`flex flex-wrap gap-4 ${cta.layout === "split" ? "justify-start" : "justify-center"}`}>
            <Link href={cta.primaryButtonLink || "/books"}>
              <button className="px-8 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg" style={{ background: cta.accentColor, color: cta.primaryButtonTextColor || "#ffffff" }}>
                {cta.primaryButtonLabel}
              </button>
            </Link>
            <Link href={cta.secondaryButtonLink || "/free"}>
              <button className="px-8 py-3.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-95" style={{ background: cta.secondaryAccentColor, color: cta.secondaryButtonTextColor || "#ffffff" }}>
                {cta.secondaryButtonLabel}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
