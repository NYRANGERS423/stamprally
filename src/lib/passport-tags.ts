export interface SuggestedTag {
  key: string;
  label: string;
  placeholder: string;
}

export const SUGGESTED_TAGS: SuggestedTag[] = [
  { key: "eye_color", label: "Eye color", placeholder: "Hazel" },
  { key: "height", label: "Height", placeholder: "5'10\" / 178 cm" },
  { key: "coffee_order", label: "Coffee order", placeholder: "Oat milk flat white" },
  { key: "spirit_animal", label: "Spirit animal", placeholder: "Otter" },
  { key: "favorite_snack", label: "Favorite snack", placeholder: "Stroopwafel" },
  { key: "travel_style", label: "Travel style", placeholder: "Speedrunner" },
  { key: "catchphrase", label: "Catchphrase", placeholder: "Ship it" },
];

export function displayTagLabel(key: string): string {
  const found = SUGGESTED_TAGS.find((t) => t.key === key);
  if (found) return found.label;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function placeholderFor(key: string): string {
  return SUGGESTED_TAGS.find((t) => t.key === key)?.placeholder ?? "";
}
