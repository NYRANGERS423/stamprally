export interface SuggestedAccolade {
  label: string;
  emoji: string;
  description: string;
}

export const SUGGESTED_ACCOLADES: SuggestedAccolade[] = [
  {
    label: "Champion of the Day",
    emoji: "🏆",
    description: "Top stamper at an event.",
  },
  { label: "MVP", emoji: "🌟", description: "Most valuable participant." },
  {
    label: "Team Spirit",
    emoji: "🎯",
    description: "Rallied colleagues throughout the event.",
  },
  {
    label: "First Adopter",
    emoji: "🚀",
    description: "Among the first to sign up.",
  },
  {
    label: "Volunteer Hero",
    emoji: "💪",
    description: "Went above and beyond to help out.",
  },
  {
    label: "Special Guest",
    emoji: "🎟️",
    description: "VIP visitor recognition.",
  },
  {
    label: "Earth Day Champion",
    emoji: "🌱",
    description: "Top performer at Earth Day.",
  },
  {
    label: "Captain's Pick",
    emoji: "🚢",
    description: "Manager's chosen recognition.",
  },
  {
    label: "Creative Spark",
    emoji: "🎨",
    description: "Most creative engagement.",
  },
  {
    label: "On Fire",
    emoji: "🔥",
    description: "Streak of activity participation.",
  },
];
