import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

/* ─── Site Content ─── */
export type SiteContent = {
  /* Hero */
  hero_title: string;
  hero_subtitle: string;
  /* Sobre */
  about_text: string;
  /* Fundadora */
  founder_name: string;
  founder_bio1: string;
  founder_bio2: string;
  /* Organograma */
  org_president_name: string;
  org_vp_name: string;
  org_sec1_name: string;
  org_sec2_name: string;
  org_treas1_name: string;
  org_treas2_name: string;
  org_audit1_name: string;
  org_audit2_name: string;
  /* Depoimentos */
  test1_quote: string;
  test1_author: string;
  test2_quote: string;
  test2_author: string;
  test3_quote: string;
  test3_author: string;
  /* Doação / PIX */
  pix_key: string;
  pix_bank: string;
  pix_agency: string;
  pix_account: string;
  /* Voluntário */
  volunteer_title: string;
  volunteer_desc: string;
  /* Contato */
  contact_whatsapp: string;
  instagram_url: string;
};

export const defaultSiteContent: SiteContent = {
  hero_title: "Esporte adaptado. Inclusão que transforma.",
  hero_subtitle: "A AMEAS promove acolhimento, autonomia e superação por meio do esporte adaptado em São Roque e região.",
  about_text: "A AMEAS é uma associação que acredita no esporte como caminho de inclusão, desenvolvimento e pertencimento para pessoas com deficiência e suas famílias.",
  founder_name: "Karina Meneguini",
  founder_bio1: "Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de superação.",
  founder_bio2: "À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa.",
  org_president_name: "Karina Meneguini",
  org_vp_name: "Diretoria Executiva",
  org_sec1_name: "Secretário(a) Geral",
  org_sec2_name: "Secretário(a) Adjunto(a)",
  org_treas1_name: "Tesoureiro(a) Geral",
  org_treas2_name: "Tesoureiro(a) Adjunto(a)",
  org_audit1_name: "Fiscal Geral",
  org_audit2_name: "Fiscal Adjunto(a)",
  test1_quote: "A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos.",
  test1_author: "Família atendida",
  test2_quote: "Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto.",
  test2_author: "Parceiro institucional",
  test3_quote: "Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas.",
  test3_author: "Atleta AMEAS",
  pix_key: "34017976/0001-99",
  pix_bank: "Banco do Brasil",
  pix_agency: "0523-1",
  pix_account: "48681-7",
  volunteer_title: "Seja Voluntário(a)",
  volunteer_desc: "Venha fazer parte da AMEAS! Precisamos de voluntários para apoiar treinos, eventos, atividades administrativas e muito mais. Cada hora doada transforma vidas.",
  contact_whatsapp: "(11) 99943-3480",
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
