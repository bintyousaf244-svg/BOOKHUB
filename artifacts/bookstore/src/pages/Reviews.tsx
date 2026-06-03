import React from "react";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { useWebsiteContent } from "@/context/WebsiteContentContext";
import { getTextEffectStyle } from "@/lib/textEffects";

function ReviewStars({ rating, accentColor }: { rating: number; accentColor: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? "fill-current" : ""}`}
          style={{ color: index < rating ? accentColor : `${accentColor}40` }}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { content } = useWebsiteContent();
  const reviews = content.home.reviews;

  return (
    <div style={{ background: reviews.backgroundColor }}>
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold mb-5"
            style={{
              background: `${reviews.accentColor}1a`,
              color: reviews.accentColor,
              ...getTextEffectStyle(reviews.bodyEffect, reviews.accentColor, reviews.accentColor, reviews.bodyEffectColor, reviews.bodyEffectIntensity),
            }}
          >
            {reviews.badge}
          </div>
          <h1
            className="font-bold mb-4"
            style={{
              color: reviews.textColor,
              fontFamily: reviews.fontFamily,
              fontSize: `clamp(2.2rem, 5vw, ${reviews.titleSize}px)`,
              ...getTextEffectStyle(reviews.titleEffect, reviews.accentColor, reviews.textColor, reviews.titleEffectColor, reviews.titleEffectIntensity),
            }}
          >
            {reviews.title}
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{
              color: `${reviews.textColor}cc`,
              ...getTextEffectStyle(reviews.bodyEffect, reviews.accentColor, reviews.textColor, reviews.bodyEffectColor, reviews.bodyEffectIntensity),
            }}
          >
            {reviews.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-12">
          {reviews.items.map((item, index) => (
            <article
              key={`${item.customerName}-${item.bookName}-${index}`}
              className="rounded-[1.75rem] p-6 shadow-sm border"
              style={{
                background: reviews.cardBackgroundColor,
                borderColor: `${reviews.accentColor}26`,
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2
                    className="font-bold"
                    style={{
                      color: reviews.textColor,
                      fontFamily: reviews.fontFamily,
                      fontSize: reviews.bodySize + 4,
                    }}
                  >
                    {item.customerName}
                  </h2>
                  <p className="text-sm" style={{ color: `${reviews.textColor}99` }}>
                    {item.location}
                  </p>
                </div>
                <ReviewStars rating={item.rating} accentColor={reviews.accentColor} />
              </div>

              <p
                className="leading-relaxed mb-5"
                style={{
                  color: `${reviews.textColor}d9`,
                  fontSize: reviews.bodySize,
                  ...getTextEffectStyle(reviews.bodyEffect, reviews.accentColor, reviews.textColor, reviews.bodyEffectColor, reviews.bodyEffectIntensity),
                }}
              >
                "{item.review}"
              </p>

              <div className="pt-4 border-t" style={{ borderColor: `${reviews.accentColor}1f` }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: reviews.accentColor }}>
                  Book
                </p>
                <p
                  className="font-semibold mt-1"
                  style={{ color: reviews.textColor, fontFamily: reviews.fontFamily }}
                >
                  {item.bookName}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/books">
            <button
              className="rounded-full px-7 py-3 font-bold transition-all hover:opacity-90"
              style={{ background: reviews.accentColor, color: "#ffffff" }}
            >
              Browse Books
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
