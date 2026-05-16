import React, { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBookCoverProxyUrl,
  normalizeBookCoverUrl,
  shouldProxyBookCover,
} from "@/lib/bookCover";

type BookCoverImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

export function BookCoverImage({
  src,
  alt,
  className,
  fallbackClassName,
  onError,
  ...props
}: BookCoverImageProps) {
  const [mode, setMode] = useState<"direct" | "proxy" | "failed">("direct");

  const normalizedSrc = useMemo(() => normalizeBookCoverUrl(src), [src]);
  const canProxy = useMemo(
    () => shouldProxyBookCover(normalizedSrc),
    [normalizedSrc],
  );

  useEffect(() => {
    setMode("direct");
  }, [normalizedSrc]);

  const activeSrc = useMemo(() => {
    if (!normalizedSrc) return null;
    if (mode === "proxy" && canProxy) {
      return getBookCoverProxyUrl(normalizedSrc);
    }
    return normalizedSrc;
  }, [canProxy, mode, normalizedSrc]);

  if (!activeSrc || mode === "failed") {
    return (
      <div
        aria-label={alt ?? "Book cover unavailable"}
        className={cn(
          "flex items-center justify-center bg-[hsl(33,33%,94%)] text-muted-foreground",
          className,
          fallbackClassName,
        )}
      >
        <BookOpen className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      {...props}
      src={activeSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        if (mode === "direct" && canProxy) {
          setMode("proxy");
        } else {
          setMode("failed");
        }
        onError?.(event);
      }}
    />
  );
}
