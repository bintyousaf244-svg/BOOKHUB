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
  effectColor?: string,
  effectIntensity?: number,
): React.CSSProperties {
  if (!effect || effect === "none") return {};

  const intensity = effectIntensity !== undefined ? effectIntensity : 5;
  const baseAccent = accentColor || "#D97B8F";
  const accent = effectColor || baseAccent;
  const text = textColor || "#ffffff";

  switch (effect) {
    case "bold": {
      const weight = Math.min(900, Math.max(600, 500 + Math.round(intensity * 40)));
      const letterSpace = (intensity - 5) * 0.002;
      return {
        fontWeight: weight as any,
        letterSpacing: `${letterSpace}em`,
      };
    }
    case "glow": {
      const radius1 = Math.max(2, Math.round(1.6 * intensity));
      const radius2 = Math.max(4, Math.round(4 * intensity));
      const radius3 = Math.max(8, Math.round(7 * intensity));
      const radius4 = Math.max(12, Math.round(10 * intensity));
      return {
        textShadow: `0 0 ${radius1}px ${accent}, 0 0 ${radius2}px ${accent}, 0 0 ${radius3}px ${accent}80, 0 0 ${radius4}px ${accent}40`,
      };
    }
    case "outline": {
      const strokeWidth = Math.max(0.4, intensity * 0.24).toFixed(2);
      const shadowBlur = Math.max(2, Math.round(intensity * 1.6));
      return {
        color: text,
        WebkitTextStroke: `${strokeWidth}px ${accent}`,
        textShadow: `0 0 ${shadowBlur}px ${accent}55`,
      };
    }
    case "background": {
      const paddingY = Math.max(0.04, 0.016 * intensity).toFixed(3) + "em";
      const paddingX = Math.max(0.12, 0.056 * intensity).toFixed(3) + "em";
      const shadowBlur = Math.max(3, Math.round(intensity * 3.6));
      return {
        background: accent,
        color: text,
        padding: `${paddingY} ${paddingX}`,
        borderRadius: "0.28em",
        display: "inline-block",
        boxShadow: `0 6px ${shadowBlur}px ${accent}35`,
      };
    }
    case "highlight": {
      const opVal1 = Math.min(255, Math.max(10, Math.round(intensity * 10)));
      const opVal2 = Math.min(255, Math.max(20, Math.round(intensity * 20)));
      const opacity1 = opVal1.toString(16).padStart(2, "0");
      const opacity2 = opVal2.toString(16).padStart(2, "0");
      const paddingY = Math.max(0.04, 0.02 * intensity).toFixed(3) + "em";
      const paddingX = Math.max(0.12, 0.06 * intensity).toFixed(3) + "em";
      return {
        background: `linear-gradient(120deg, ${accent}${opacity1} 0%, ${accent}${opacity2} 100%)`,
        padding: `${paddingY} ${paddingX}`,
        borderRadius: "0.2em",
        boxShadow: `0 4px 12px ${accent}20`,
        display: "inline-block",
      };
    }
    case "3d": {
      const shadows: string[] = [];
      for (let i = 1; i <= intensity; i++) {
        const alphaHex = Math.min(255, Math.max(10, Math.round(255 - (i / intensity) * 150)))
          .toString(16)
          .padStart(2, "0");
        shadows.push(`${i}px ${i}px 0px ${accent}${alphaHex}`);
      }
      shadows.push(`${intensity + 1}px ${intensity + 1}px 0px rgba(0,0,0,0.25)`);
      return {
        textShadow: shadows.join(", "),
      };
    }
    case "shadow": {
      const offset1 = Math.max(1, Math.round(intensity * 0.8));
      const blur1 = Math.max(4, Math.round(intensity * 3.2));
      const offset2 = Math.max(1, Math.round(intensity * 0.4));
      const blur2 = Math.max(2, Math.round(intensity * 1.2));
      return {
        textShadow: `0 ${offset1}px ${blur1}px rgba(0, 0, 0, 0.6), 0 ${offset2}px ${blur2}px rgba(0, 0, 0, 0.4)`,
      };
    }
    default:
      return {};
  }
}
