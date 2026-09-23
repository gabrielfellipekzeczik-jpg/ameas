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
  pix_copypaste: string;
  /* Voluntário */
  volunteer_title: string;
  volunteer_desc: string;
  /* Contato */
  contact_whatsapp: string;
  instagram_url: string;
};

export const defaultSiteContent: SiteContent = {
  hero_title: "Esporte adaptado. Inclus\u00e3o que transforma.",
  hero_subtitle: "A AMEAS promove acolhimento, autonomia e supera\u00e7\u00e3o por meio do esporte adaptado em S\u00e3o Roque e regi\u00e3o.",
  about_text: "A AMEAS \u00e9 uma associa\u00e7\u00e3o que acredita no esporte como caminho de inclus\u00e3o, desenvolvimento e pertencimento para pessoas com defici\u00eancia e suas fam\u00edlias.",
  founder_name: "Karina Meneguini",
  founder_bio1: "Karina Meneguini representa a lideran\u00e7a que aproxima pessoas, organiza esfor\u00e7os e transforma prop\u00f3sito em a\u00e7\u00e3o. Sua trajet\u00f3ria \u00e9 marcada pela dedica\u00e7\u00e3o ao esporte adaptado, pelo cuidado com as fam\u00edlias e pela constru\u00e7\u00e3o de oportunidades reais de supera\u00e7\u00e3o.",
  founder_bio2: "\u00c0 frente da AMEAS, inspira atletas, volunt\u00e1rios e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa.",
  org_president_name: "Karina Meneguini",
  org_vp_name: "Diretoria Executiva",
  org_sec1_name: "Secretário(a) Geral",
  org_sec2_name: "Secretário(a) Adjunto(a)",
  org_treas1_name: "Tesoureiro(a) Geral",
  org_treas2_name: "Tesoureiro(a) Adjunto(a)",
  org_audit1_name: "Fiscal Geral",
  org_audit2_name: "Fiscal Adjunto(a)",
  test1_quote: "A AMEAS mostra que o esporte tamb\u00e9m \u00e9 pertencimento. Cada treino fortalece o corpo, a confian\u00e7a e os v\u00ednculos.",
  test1_author: "Fam\u00edlia atendida",
  test2_quote: "Ver a evolu\u00e7\u00e3o dos atletas \u00e9 acompanhar hist\u00f3rias de coragem sendo escritas com apoio, t\u00e9cnica e afeto.",
  test2_author: "Parceiro institucional",
  test3_quote: "Aqui a supera\u00e7\u00e3o acontece em equipe. O incentivo certo transforma limites em novas conquistas.",
  test3_author: "Atleta AMEAS",
  pix_key: "34017976/0001-99",
  pix_bank: "Banco do Brasil",
  pix_agency: "0523-1",
  pix_account: "48681-7",
  pix_copypaste: "",
  volunteer_title: "Seja Volunt\u00e1rio(a)",
  volunteer_desc: "Venha fazer parte da AMEAS! Precisamos de volunt\u00e1rios para apoiar treinos, eventos, atividades administrativas e muito mais. Cada hora doada transforma vidas.",
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
    if (row.key in content) {
      // Se o valor do banco contém sequências corrompidas (ex: Ã§, Ã£), usa o default
      const corrupted = /Ã[£§¡©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À]|â€/.test(row.value);
      if (!corrupted) content[row.key as keyof SiteContent] = row.value;
    }
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
