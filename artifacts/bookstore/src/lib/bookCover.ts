import { apiUrl } from "@/lib/api";

export function normalizeBookCoverUrl(coverImage?: string | null): string | null {
  const value = coverImage?.trim();
  if (!value) return null;

  if (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    return parsed.toString();
  } catch {
    return value;
  }
}

export function shouldProxyBookCover(coverImage?: string | null): boolean {
  const normalized = normalizeBookCoverUrl(coverImage);
  if (!normalized || typeof window === "undefined") return false;

  try {
    const parsed = new URL(normalized, window.location.origin);
    return parsed.origin !== window.location.origin && /^https?:$/i.test(parsed.protocol);
  } catch {
    return false;
  }
}

export function getBookCoverProxyUrl(coverImage: string): string {
  return apiUrl(`/api/books/cover?url=${encodeURIComponent(coverImage)}`);
}
