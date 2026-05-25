import type React from "react";
import type { TextEffect } from "@/lib/websiteContent";

export const TEXT_EFFECT_OPTIONS: Array<{ value: TextEffect; label: string }> = [
  { value: "none", label: "None (Plain Text)" },
  { value: "bold", label: "Bold" },
  { value: "glow", label: "Glow" },
  { value: "outline", label: "Outline" },
  { value: "background", label: "Background Highlight" },
  { value: "highlight", label: "Gradient Highlight" },
  { value: "3d", label: "3D Perspective" },
  { value: "shadow", label: "Drop Shadow" },
];

export function getTextEffectStyle(
  effect?: TextEffect,
  accentColor?: string,
  textColor?: string,
): React.CSSProperties {
  if (!effect || effect === "none") return {};

  const accent = accentColor || "#D97B8F";
  const text = textColor || "#ffffff";

  switch (effect) {
    case "bold":
      return {
        fontWeight: 800,
        letterSpacing: "0.01em",
      };
    case "glow":
      return {
        textShadow: `0 0 8px ${accent}, 0 0 20px ${accent}, 0 0 35px ${accent}80, 0 0 50px ${accent}40`,
      };
    case "outline":
      return {
        color: text,
        WebkitTextStroke: `1.2px ${accent}`,
        textShadow: `0 0 8px ${accent}55`,
      };
    case "background":
      return {
        background: accent,
        color: text,
        padding: "0.08em 0.28em",
        borderRadius: "0.28em",
        display: "inline-block",
        boxShadow: `0 6px 18px ${accent}35`,
      };
    case "highlight":
      return {
        background: `linear-gradient(120deg, ${accent}33 0%, ${accent}66 100%)`,
        padding: "0.1em 0.3em",
        borderRadius: "0.2em",
        boxShadow: `0 4px 12px ${accent}20`,
        display: "inline-block",
      };
    case "3d":
      return {
        textShadow: `1px 1px 0px ${accent}, 2px 2px 0px ${accent}cc, 3px 3px 0px ${accent}99, 4px 4px 0px rgba(0,0,0,0.25)`,
      };
    case "shadow":
      return {
        textShadow: "0 4px 16px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4)",
      };
    default:
      return {};
  }
}
