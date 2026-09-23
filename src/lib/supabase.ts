import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

export type SiteContent = {
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_whatsapp: string;
  pix_key: string;
  instagram_url: string;
};

export const defaultSiteContent: SiteContent = {
  hero_title: "Esporte adaptado. Inclusão que transforma.",
  hero_subtitle:
    "A AMEAS promove acolhimento, autonomia e superação por meio do esporte adaptado em São Roque e região.",
  about_text:
    "A AMEAS é uma associação que acredita no esporte como caminho de inclusão, desenvolvimento e pertencimento para pessoas com deficiência e suas famílias.",
  contact_whatsapp: "(11) 99943-3480",
  pix_key: "34017976/0001-99",
  instagram_url: "https://www.instagram.com/",
};

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

export async function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return defaultSiteContent;
  const { data, error } = await supabase.from("ameas_site_content").select("key,value");
  if (error || !data) return defaultSiteContent;
  return data.reduce<SiteContent>((content, row) => {
    if (row.key in content) content[row.key as keyof SiteContent] = row.value;
    return content;
  }, { ...defaultSiteContent });
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
