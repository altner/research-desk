export type Platform = "reddit" | "tiktok" | "instagram" | "facebook" | "youtube" | "forum" | "other";
export type SourceStatus = "new" | "reviewed" | "linked_to_idea" | "discarded" | "merged";
export type IdeaCategory =
  | "hidden_gem"
  | "warning"
  | "expectation_vs_reality"
  | "food_drink"
  | "atmosphere"
  | "cultural_note"
  | "practical_tip"
  | "other";
export type Credibility = "niedrig" | "mittel" | "hoch" | "bestaetigt";
export type IdeaStatus =
  | "idea"
  | "researching"
  | "drafting"
  | "review"
  | "published"
  | "archived";
export type PublishStatus = "draft" | "in_review" | "published";
export type LocationType =
  | "country" | "region" | "province" | "district" | "place"
  | "hotel" | "restaurant" | "shop" | "attraction" | "other_poi";

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  country: "Country",
  region: "Region",
  province: "Province",
  district: "District",
  place: "Place / Ort",
  hotel: "Hotel",
  restaurant: "Restaurant",
  shop: "Shop",
  attraction: "Attraction",
  other_poi: "Other POI",
};

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { sources: number; ideas: number; articles: number };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  template: string;
  isDefault: boolean;
  locationId: string | null;
  location?: { id: string; nameEn: string; nameDe: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  type: LocationType;
  parentId: string | null;
  parent?: Location | null;
  children?: Location[];
  nameDe: string;
  nameEn: string;
  nameTh: string | null;
  slug: string;
  projectId?: string;
}

export interface Source {
  id: string;
  projectId: string;
  platform: Platform;
  url: string;
  urlNormalized: string;
  rawText: string | null;
  capturedAt: string;
  originalPostedAt: string | null;
  status: SourceStatus;
  originSourceId: string | null;
  originSource?: Source | null;
  derivedSources?: Source[];
  mergedIntoId: string | null;
  locationGuessId: string | null;
  locationGuess?: Location | null;
  locationId: string | null;
  location?: Location | null;
  folderId?: string | null;
  ideaSources?: Array<{ idea: Idea }>;
  _duplicateOf?: string | null;
}

export interface Idea {
  id: string;
  projectId: string;
  title: string;
  category: IdeaCategory;
  summary: string;
  researchNotes: string | null;
  locationId: string;
  location?: Location;
  confirmationCount: number;
  credibility: Credibility;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  ideaSources?: Array<{ source: Omit<Source, "rawText"> }>;
  articles?: Article[];
}

export interface Article {
  id: string;
  projectId: string;
  ideaId: string;
  idea?: Pick<Idea, "id" | "title" | "category" | "confirmationCount" | "credibility">;
  locationId: string;
  location?: Location;
  title: string;
  bodyMarkdown: string;
  generationSource: "human" | "ai_draft_human_edited";
  publishStatus: PublishStatus;
  publishedUrl: string | null;
  exportedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  reddit: "Reddit",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  forum: "Forum",
  other: "Other",
};

export const PLATFORM_ABBR: Record<Platform, string> = {
  reddit: "RD",
  tiktok: "Tk",
  instagram: "IN",
  facebook: "FB",
  youtube: "YT",
  forum: "FO",
  other: "??",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  reddit: "#FF4500",
  tiktok: "#000000",
  instagram: "#C13584",
  facebook: "#1877F2",
  youtube: "#FF0000",
  forum: "#5C6BC0",
  other: "#78909C",
};

export const STATUS_LABELS: Record<SourceStatus, string> = {
  new: "NEW",
  reviewed: "REVIEWED",
  linked_to_idea: "LINKED",
  discarded: "DISCARDED",
  merged: "MERGED",
};

export const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  hidden_gem: "Hidden Gem",
  warning: "Warning / Risk",
  expectation_vs_reality: "Expectation vs. Reality",
  food_drink: "Food & Drink",
  atmosphere: "Atmosphere",
  cultural_note: "Cultural Note",
  practical_tip: "Practical Tip",
  other: "Other",
};

export const CREDIBILITY_LABELS: Record<Credibility, string> = {
  niedrig: "LOW",
  mittel: "MEDIUM",
  hoch: "HIGH",
  bestaetigt: "VERIFIED",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  idea: "IDEA",
  researching: "RESEARCHING",
  drafting: "DRAFTING",
  review: "REVIEW",
  published: "PUBLISHED",
  archived: "ARCHIVED",
};

export const IDEA_STATUS_COLUMNS: IdeaStatus[] = [
  "idea",
  "researching",
  "drafting",
  "review",
  "published",
];
