import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

/** Base URL for public Storage objects. e.g. getStorageUrl("logos/ibicolor.png") */
export function getStorageUrl(path: string): string | null {
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/ameas-site-media/${path}`;
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

/* ─── Site Content ─── */
// Todos os campos editáveis são declarados em cms-schema.ts
import { defaultSiteContent, type SiteContent } from "./cms-schema";
export { defaultSiteContent };
export type { SiteContent };

export type GalleryItem = {
  id?: string;
  title: string;
  alt: string;
  image_url: string;
  sort_order: number;
  published: boolean;
};

export type PartnerLink = {
  slug: string;
  name: string;
  website_url: string;
  sort_order: number;
  published: boolean;
};

const CORRUPTED = /Ã[£§¡©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À]|â€/;

/** Todas as linhas de ameas_site_content como { chave: valor }, sem filtrar. */
export async function getContentRows(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("ameas_site_content").select("key,value");
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const row of data) out[row.key] = row.value;
  return out;
}

/** Mescla as linhas do banco sobre os valores padrão (ignora textos com acento corrompido). */
export function mergeContent(rows: Record<string, string>): SiteContent {
  const content: SiteContent = { ...defaultSiteContent };
  const target = content as unknown as Record<string, string>;
  for (const [key, value] of Object.entries(rows)) {
    if (key in defaultSiteContent || key.startsWith("logo_b64_")) {
      if (!CORRUPTED.test(value)) target[key] = value;
    }
  }
  return content;
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return defaultSiteContent;
  return mergeContent(await getContentRows());
}

/** Só o tema, para o servidor já entregar a página na versão certa. Se o banco demorar, usa o padrão. */
export async function getSiteTheme(): Promise<string> {
  if (!supabase) return defaultSiteContent.site_theme;
  try {
    const { data } = await supabase.from("ameas_site_content").select("value")
      .eq("key", "site_theme").abortSignal(AbortSignal.timeout(1500)).maybeSingle();
    return data?.value ?? defaultSiteContent.site_theme;
  } catch {
    return defaultSiteContent.site_theme;
  }
}

export async function getPartnerLinks(): Promise<PartnerLink[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ameas_partners")
    .select("slug,name,website_url,sort_order,published")
    .eq("published", true)
    .order("sort_order");
  return error || !data ? [] : data;
}

/* ─── Gallery Categories ─── */
export type GalleryCategory = {
  id: string;       // slug, e.g. "esporte-adaptado"
  label: string;    // display name, e.g. "Esporte Adaptado"
  color: string;    // tailwind bg+text classes, e.g. "bg-[#1B4B8A] text-white"
  sort_order: number;
};

export const defaultGalleryCategories: GalleryCategory[] = [
  { id: "esporte-adaptado", label: "Esporte Adaptado", color: "bg-[#1B4B8A] text-white", sort_order: 1 },
  { id: "comunidade",       label: "Comunidade",        color: "bg-[#d62f21] text-white", sort_order: 2 },
  { id: "acolhimento",      label: "Acolhimento",       color: "bg-[#047857] text-white", sort_order: 3 },
  { id: "fundadora",        label: "Fundadora",         color: "bg-[#7c3aed] text-white", sort_order: 4 },
];

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  if (!supabase) return defaultGalleryCategories;
  const { data, error } = await supabase
    .from("ameas_gallery_categories")
    .select("id,label,color,sort_order")
    .order("sort_order");
  if (error || !data || !data.length) return defaultGalleryCategories;
  return (data as GalleryCategory[]).map((c) => ({ ...c, color: readableChipColor(c.color) }));
}

/* Eventos antigos guardam no banco cores com pouco contraste para texto branco. */
const CHIP_COLOR_FIXES: Record<string, string> = {
  "#E8392A": "#d62f21",
  "#059669": "#047857",
  "#db2777": "#be185d",
  "#0891b2": "#0e7490",
};
export function readableChipColor(color: string) {
  return color.replace(/#[0-9a-fA-F]{6}/, (hex) => CHIP_COLOR_FIXES[hex] ?? hex);
}

export async function getGalleryItems(): Promise<Array<{
  id: string; title: string; alt: string; image_url: string;
  category: string | null; sort_order: number; published: boolean;
}>> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ameas_gallery_items")
    .select("id,title,alt,image_url,category,sort_order,published")
    .eq("published", true)
    .order("sort_order");
  return error || !data ? [] : data;
}
