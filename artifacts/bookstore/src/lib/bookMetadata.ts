const LIST_SEPARATOR = ", ";

function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBookMetadataList(value?: string | null): string[] {
  const rawValue = value?.trim();
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing for legacy values.
  }

  return splitCommaSeparated(rawValue);
}

export function joinBookMetadataList(values: string[]): string {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).join(LIST_SEPARATOR);
}

export function getPrimaryBookMetadataValue(value?: string | null): string | null {
  return parseBookMetadataList(value)[0] ?? null;
}

export function getBookLanguageBadgeLabel(value?: string | null): string {
  const languages = parseBookMetadataList(value);

  if (languages.length === 0) return "EN";
  if (languages.length > 1) return `${languages.length} LANG`;

  const [language] = languages;
  if (language === "Arabic") return "AR";
  if (language === "Urdu") return "UR";
  if (language === "English") return "EN";
  return language.slice(0, 2).toUpperCase();
}
