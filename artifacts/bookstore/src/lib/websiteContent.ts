export type LayoutMode = "left" | "center" | "split" | "grid" | "stack" | "cards" | "inline" | "compact" | "spacious";

export interface WebsiteContent {
  navbar: {
    brandName: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    navFontSize: number;
    ctaLabel: string;
    ctaBackgroundColor: string;
    ctaTextColor: string;
  };
  footer: {
    brandName: string;
    description: string;
    backgroundColor: string;
    textColor: string;
    mutedTextColor: string;
    accentColor: string;
    fontFamily: string;
    headingSize: number;
    bodySize: number;
  };
  home: {
    hero: {
      eyebrow: string;
      titleLine1: string;
      titleHighlight: string;
      description: string;
      primaryButtonLabel: string;
      secondaryButtonLabel: string;
      stats: Array<{ value: string; label: string }>;
      layout: Extract<LayoutMode, "left" | "center">;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
      backgroundImage: string;
      backgroundImageOpacity: number;
      overlayColor: string;
      overlayOpacity: number;
    };
    trust: {
      title: string;
      layout: Extract<LayoutMode, "cards" | "inline">;
      items: Array<{ title: string; description: string }>;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      cardBackgroundColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
    };
    categories: {
      eyebrow: string;
      title: string;
      layout: Extract<LayoutMode, "grid" | "stack">;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
      kidsTitle: string;
      kidsDescription: string;
      adultsTitle: string;
      adultsDescription: string;
      kidsBackground: string;
      adultsBackground: string;
    };
    featured: {
      eyebrow: string;
      title: string;
      description: string;
      buttonLabel: string;
      layout: Extract<LayoutMode, "compact" | "spacious">;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
    };
    freeResources: {
      badge: string;
      title: string;
      description: string;
      buttonLabel: string;
      layout: Extract<LayoutMode, "compact" | "spacious">;
      backgroundColor: string;
      bannerBackground: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
      spotlightDesktopCount: number;
      spotlightMobileCount: number;
    };
    deals: {
      badge: string;
      title: string;
      description: string;
      layout: Extract<LayoutMode, "compact" | "spacious">;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
    };
    cta: {
      badge: string;
      title: string;
      description: string;
      primaryButtonLabel: string;
      secondaryButtonLabel: string;
      layout: Extract<LayoutMode, "center" | "split">;
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      secondaryAccentColor: string;
      fontFamily: string;
      titleSize: number;
      bodySize: number;
    };
  };
}

export const defaultWebsiteContent: WebsiteContent = {
  navbar: {
    brandName: "Learner's Grove",
    backgroundColor: "#582C6F",
    textColor: "#ffffff",
    accentColor: "#D97B8F",
    fontFamily: "Georgia, serif",
    navFontSize: 14,
    ctaLabel: "Shop Now",
    ctaBackgroundColor: "#D97B8F",
    ctaTextColor: "#ffffff",
  },
  footer: {
    brandName: "Learner's Grove",
    description: "Handcrafted English & Arabic learning books for kids and adults. A home for curious minds to bloom.",
    backgroundColor: "#3a1d49",
    textColor: "#ffffff",
    mutedTextColor: "#b8aeca",
    accentColor: "#D97B8F",
    fontFamily: "Georgia, serif",
    headingSize: 14,
    bodySize: 14,
  },
  home: {
    hero: {
      eyebrow: "Welcome to Learner's Grove",
      titleLine1: "Raise Confident",
      titleHighlight: "Little Learners",
      description: "Handcrafted English & Arabic learning books for kids and adults. Nurture curiosity, build language skills, and ignite a lifelong love of reading.",
      primaryButtonLabel: "Explore Collection",
      secondaryButtonLabel: "Free Resources",
      stats: [
        { value: "100+", label: "Books & Articles" },
        { value: "2", label: "Languages" },
        { value: "Kids", label: "& Adults" },
        { value: "Free", label: "Resources" },
      ],
      layout: "left",
      backgroundColor: "#582C6F",
      textColor: "#ffffff",
      accentColor: "#D97B8F",
      fontFamily: "Georgia, serif",
      titleSize: 56,
      bodySize: 20,
      backgroundImage: "/hero-reading-family.jpeg",
      backgroundImageOpacity: 1,
      overlayColor: "linear-gradient(135deg, #582C6F 55%, hsl(270,62%,48%) 100%)",
      overlayOpacity: 0,
    },
    trust: {
      title: "Why Families Choose Us",
      layout: "cards",
      items: [
        { title: "Expert-Crafted", description: "Every book is thoughtfully designed by educators" },
        { title: "English & Arabic", description: "Bilingual learning resources under one roof" },
        { title: "Trusted by Parents", description: "Safe, enriching content loved by families" },
      ],
      backgroundColor: "#ffffff",
      textColor: "#582C6F",
      accentColor: "#D97B8F",
      cardBackgroundColor: "#f5f0e8",
      fontFamily: "Georgia, serif",
      titleSize: 26,
      bodySize: 14,
    },
    categories: {
      eyebrow: "Browse by Age",
      title: "A Book for Every Mind",
      layout: "grid",
      backgroundColor: "#f5f0e8",
      textColor: "#582C6F",
      accentColor: "#D97B8F",
      fontFamily: "Georgia, serif",
      titleSize: 38,
      bodySize: 14,
      kidsTitle: "Kids Learning",
      kidsDescription: "Engaging stories & exercises for young minds",
      adultsTitle: "Adult Education",
      adultsDescription: "Advanced language & learning materials",
      kidsBackground: "linear-gradient(135deg, #582C6F 0%, #7a3e96 100%)",
      adultsBackground: "linear-gradient(135deg, #416D53 0%, #2d4d3a 100%)",
    },
    featured: {
      eyebrow: "Hand-picked",
      title: "Featured Collection",
      description: "Our most loved books this season.",
      buttonLabel: "View all",
      layout: "compact",
      backgroundColor: "#ffffff",
      textColor: "#582C6F",
      accentColor: "#ebe4d4",
      fontFamily: "Georgia, serif",
      titleSize: 38,
      bodySize: 16,
    },
    freeResources: {
      badge: "100% Free",
      title: "Knowledge Should Be Accessible",
      description: "Download free articles, short books, and learning materials crafted for our community.",
      buttonLabel: "Browse Free Materials",
      layout: "compact",
      backgroundColor: "#f3eef8",
      bannerBackground: "linear-gradient(135deg, #582C6F 0%, #7a3e96 100%)",
      textColor: "#ffffff",
      accentColor: "#D97B8F",
      fontFamily: "Georgia, serif",
      titleSize: 38,
      bodySize: 18,
      spotlightDesktopCount: 7,
      spotlightMobileCount: 6,
    },
    deals: {
      badge: "Limited Offers",
      title: "Special Deals",
      description: "Discounted books - grab them before they're gone.",
      layout: "compact",
      backgroundColor: "#ffffff",
      textColor: "#582C6F",
      accentColor: "#B08B1E",
      fontFamily: "Georgia, serif",
      titleSize: 38,
      bodySize: 16,
    },
    cta: {
      badge: "Start Learning",
      title: "Start Learning Today",
      description: "Join thousands of learners who trust Learner's Grove for bilingual education that actually works.",
      primaryButtonLabel: "Browse All Books",
      secondaryButtonLabel: "Free Resources",
      layout: "center",
      backgroundColor: "#f5f0e8",
      textColor: "#582C6F",
      accentColor: "#582C6F",
      secondaryAccentColor: "#D97B8F",
      fontFamily: "Georgia, serif",
      titleSize: 38,
      bodySize: 18,
    },
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep<T>(base: T, incoming: unknown): T {
  if (!isObject(base) || !isObject(incoming)) {
    return (incoming ?? base) as T;
  }

  const output: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(incoming)) {
    const current = output[key];

    if (Array.isArray(value)) {
      output[key] = value;
      continue;
    }

    if (isObject(current) && isObject(value)) {
      output[key] = mergeDeep(current, value);
      continue;
    }

    output[key] = value;
  }

  return output as T;
}

export function resolveWebsiteContent(content?: unknown): WebsiteContent {
  return mergeDeep(defaultWebsiteContent, content ?? {});
}
