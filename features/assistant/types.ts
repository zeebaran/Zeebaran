import type { CatalogItem } from "@/features/catalog/model";
export type AssistantItem = Pick<
  CatalogItem,
  | "id"
  | "slug"
  | "kind"
  | "name"
  | "localName"
  | "code"
  | "intro"
  | "origin"
  | "season"
  | "seasonMonths"
  | "colour"
  | "flavour"
  | "brix"
  | "firmness"
  | "shelfLife"
  | "storageLife"
  | "marketClass"
  | "system"
  | "spacing"
  | "yield"
  | "bestFor"
  | "note"
  | "rootstockIds"
  | "images"
  | "specifications"
  | "sortOrder"
  | "publishedAt"
>;
export type SiteExcerpt = { page: string; title: string; href: string; passages: string[] };
export type Knowledge = {
  items: AssistantItem[];
  pages: SiteExcerpt[];
  retrievedAt: string;
  partial: boolean;
};
export type Fact = { label: string; value: string };
export type Requirement = {
  label: string;
  value: string;
  terms: string[];
  excluded?: string[];
  altitude?: number;
};
export type ConversationContext = {
  ids: string[];
  kind?: "variety" | "rootstock";
  requirements: Requirement[];
  recommending?: boolean;
};
export type Answer = {
  title?: string;
  text: string;
  items: string[];
  facts?: { id: string; rows: Fact[] }[];
  comparison?: { label: string; values: string[]; different: boolean }[];
  evidence?: { id: string; facts: Fact[]; unconfirmed: string[] }[];
  links: { label: string; href: string }[];
  suggestions: string[];
  context: ConversationContext;
};
export const freshContext = (): ConversationContext => ({ ids: [], requirements: [] });
