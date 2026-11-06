/**
 * Schema do CMS da AMEAS.
 * Cada campo editável do site é declarado aqui UMA vez. O painel /admin gera os
 * formulários a partir deste arquivo e o site público lê os mesmos valores.
 * Para adicionar um campo novo: declare aqui e use `sc.chave` no site.
 */

export type FieldType = "text" | "textarea" | "image" | "code";

export type Field = {
  readonly key: string;
  readonly label: string;
  readonly type: FieldType;
  readonly def: string;
  readonly hint?: string | undefined;
};

export type Group = {
  readonly title: string;
  readonly desc?: string;
  readonly cols?: 1 | 2;
  readonly fields: readonly Field[];
};

export type SectionDef = {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly desc: string;
  readonly special?: "hero" | "partners" | "gallery" | "testimonials";
  readonly hidden?: boolean;
  readonly groups: readonly Group[];
};

const f = <K extends string>(
  key: K,
  label: string,
  type: FieldType,
  def: string,
  hint?: string,
) => ({ key, label, type, def, hint }) as const;

const t = <K extends string>(key: K, label: string, def: string, hint?: string) =>
  f(key, label, "text", def, hint);
const ta = <K extends string>(key: K, label: string, def: string, hint?: string) =>
  f(key, label, "textarea", def, hint);
const img = <K extends string>(key: K, label: string, hint?: string) =>
  f(key, label, "image", "", hint);
const code = <K extends string>(key: K, label: string, hint?: string) =>
  f(key, label, "code", "", hint);

const HL = "Parte destacada do título (colorida)";

const _SECTIONS = [
  /* ───────────── INÍCIO ───────────── */
  {
    id: "inicio",
    label: "Início (carrossel)",
    title: "Início — carrossel",
    desc: "As fotos e os textos que aparecem no topo do site.",
    special: "hero",
    groups: [
      {
        title: "Configurações do carrossel",
        cols: 2,
        fields: [
          t("hero_badge", "Selo acima do título", "Associação Movimento Esporte Adaptado e Superação"),
          t("hero_interval", "Segundos entre as trocas", "6", "Use 0 para não trocar sozinho."),
        ],
      },
    ],
  },

  /* ───────────── SOBRE ───────────── */
  {
    id: "sobre",
    label: "Sobre",
    title: "Sobre a associação",
    desc: "Textos, foto e cartões da seção “Sobre”.",
    groups: [
      {
        title: "Textos",
        fields: [
          t("about_kicker", "Etiqueta da seção", "Sobre a Associação"),
          t("about_title", "Título", "Movimento, esporte e acolhimento para"),
          t("about_title_hl", HL, "transformar vidas."),
          ta("about_p1", "Parágrafo 1", "A AMEAS nasceu do compromisso com a inclusão e com a superação diária de pessoas que encontram no esporte adaptado um espaço de desenvolvimento, amizade e conquista."),
          ta("about_text", "Parágrafo 2", "A AMEAS é uma associação que acredita no esporte como caminho de inclusão, desenvolvimento e pertencimento para pessoas com deficiência e suas famílias."),
          ta("about_p3", "Parágrafo 3", "Mais do que treinos, a AMEAS constrói uma rede de apoio em que cada pessoa é vista, respeitada e incentivada a alcançar novas possibilidades."),
        ],
      },
      {
        title: "Foto",
        fields: [img("about_image", "Foto da seção", "Se ficar vazia, usa a foto original do site.")],
      },
      {
        title: "Cartões ao lado da foto",
        cols: 2,
        fields: [
          t("about_card1_title", "Cartão 1 — título", "Impacto humano"),
          ta("about_card1_text", "Cartão 1 — texto", "Inclusão que começa no treino e alcança a autoestima, a família e a comunidade."),
          t("about_card2_title", "Cartão 2 — título", "Presença contínua"),
          ta("about_card2_text", "Cartão 2 — texto", "Projetos, encontros e ações que mantêm o esporte adaptado vivo e acessível."),
        ],
      },
    ],
  },

  /* ───────────── FUNDADORA ───────────── */
  {
    id: "fundadora",
    label: "Fundadora",
    title: "Fundadora",
    desc: "Foto, nome e biografia da fundadora.",
    groups: [
      {
        title: "Textos",
        fields: [
          t("founder_kicker", "Etiqueta da seção", "Fundadora"),
          t("founder_name", "Nome", "Karina Meneguini"),
          ta("founder_bio1", "Biografia — parágrafo 1", "Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de superação."),
          ta("founder_bio2", "Biografia — parágrafo 2", "À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa."),
        ],
      },
      { title: "Foto", fields: [img("founder_image", "Foto da fundadora", "Se ficar vazia, usa a foto original do site.")] },
      {
        title: "Três destaques",
        cols: 2,
        fields: [
          t("founder_tag1", "Destaque 1", "Dedicação"),
          t("founder_tag2", "Destaque 2", "Liderança transformadora"),
          t("founder_tag3", "Destaque 3", "Inclusão com afeto"),
        ],
      },
    ],
  },

  /* ───────────── MISSÃO ───────────── */
  {
    id: "missao",
    label: "Missão, Visão, Valores",
    title: "Missão, Visão e Valores",
    desc: "Os três cartões de princípios da associação.",
    groups: [
      {
        title: "Cabeçalho da seção",
        fields: [
          t("mission_kicker", "Etiqueta da seção", "Missão, Visão e Valores"),
          t("mission_title", "Título", "Princípios que orientam cada treino, encontro e"),
          t("mission_title_hl", HL, "conquista."),
        ],
      },
      {
        title: "Cartão 1",
        fields: [
          t("mvv1_title", "Título", "Missão"),
          ta("mvv1_text", "Texto", "Promover inclusão, autonomia e qualidade de vida por meio do esporte adaptado, criando caminhos reais de participação social."),
        ],
      },
      {
        title: "Cartão 2",
        fields: [
          t("mvv2_title", "Título", "Visão"),
          ta("mvv2_text", "Texto", "Ser referência regional em esporte adaptado, acolhimento e oportunidades para pessoas com deficiência e suas famílias."),
        ],
      },
      {
        title: "Cartão 3",
        fields: [
          t("mvv3_title", "Título", "Valores"),
          ta("mvv3_text", "Texto", "Respeito, empatia, superação, compromisso, transparência, colaboração e amor pelo desenvolvimento humano."),
        ],
      },
    ],
  },

  /* ───────────── SERVIÇOS ───────────── */
  {
    id: "servicos",
    label: "Serviços",
    title: "Serviços e atividades",
    desc: "O que a AMEAS oferece. São 6 cartões.",
    groups: [
      {
        title: "Cabeçalho da seção",
        fields: [
          t("services_kicker", "Etiqueta da seção", "O que fazemos"),
          t("services_title", "Título", "Serviços e atividades que"),
          t("services_title_hl", HL, "transformam cada dia."),
          ta("services_desc", "Texto de apoio", "Da prática esportiva ao apoio social, a AMEAS oferece um conjunto de ações que acolhem, desenvolvem e incluem."),
        ],
      },
      {
        title: "Cartão 1",
        fields: [
          img("service1_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service1_title", "Título", "Esporte Adaptado"),
          ta("service1_desc", "Texto", "Treinos e atividades físicas adaptadas para pessoas com deficiência, promovendo saúde, autonomia e superação com acompanhamento especializado."),
        ],
      },
      {
        title: "Cartão 2",
        fields: [
          img("service2_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service2_title", "Título", "Assistência Social"),
          ta("service2_desc", "Texto", "Orientação, encaminhamentos e apoio para que atletas e famílias acessem direitos, benefícios e serviços públicos disponíveis."),
        ],
      },
      {
        title: "Cartão 3",
        fields: [
          img("service3_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service3_title", "Título", "Suporte Psicológico"),
          ta("service3_desc", "Texto", "Espaço de escuta e acolhimento emocional para atletas e familiares, com foco no bem-estar e na saúde mental."),
        ],
      },
      {
        title: "Cartão 4",
        fields: [
          img("service4_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service4_title", "Título", "Pilates para Mães"),
          ta("service4_desc", "Texto", "Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o corpo e descanso para as mães e responsáveis."),
        ],
      },
      {
        title: "Cartão 5",
        fields: [
          img("service5_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service5_title", "Título", "Eventos Comunitários"),
          ta("service5_desc", "Texto", "Encontros, celebrações e ações solidárias que fortalecem os laços entre atletas, famílias, voluntários e a comunidade."),
        ],
      },
      {
        title: "Cartão 6",
        fields: [
          img("service6_image", "Foto do cartão", "Se ficar vazia, usa a foto padrão do site."),
          t("service6_title", "Título", "Voluntariado"),
          ta("service6_desc", "Texto", "Programa de voluntariado que conecta pessoas dispostas a contribuir com seu tempo e talento ao crescimento da associação."),
        ],
      },
    ],
  },

  /* ───────────── FAMÍLIAS ───────────── */
  {
    id: "familias",
    label: "Famílias atípicas",
    title: "Famílias atípicas",
    desc: "Seção de acolhimento às famílias.",
    groups: [
      {
        title: "Cabeçalho da seção",
        fields: [
          t("families_kicker", "Etiqueta da seção", "Famílias atípicas"),
          t("families_title", "Título", "Cuidar de quem cuida também faz parte da"),
          t("families_title_hl", HL, "nossa missão."),
          ta("families_desc", "Texto de apoio", "Além do esporte adaptado, a AMEAS oferece uma rede de acolhimento e assistência social para as famílias atípicas da associação."),
        ],
      },
      {
        title: "Cartão 1",
        fields: [
          t("fam1_title", "Título", "Suporte psicológico"),
          ta("fam1_text", "Texto", "Espaço de escuta e acolhimento emocional para mães, pais e responsáveis enfrentarem os desafios da rotina com mais apoio e segurança."),
        ],
      },
      {
        title: "Cartão 2",
        fields: [
          t("fam2_title", "Título", "Assistência social"),
          ta("fam2_text", "Texto", "Orientação e encaminhamentos para fortalecer o acesso das famílias a direitos, serviços e oportunidades na comunidade."),
        ],
      },
      {
        title: "Cartão 3",
        fields: [
          t("fam3_title", "Título", "Pilates para as mães"),
          ta("fam3_text", "Texto", "Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o corpo, descanso e fortalecimento."),
        ],
      },
      {
        title: "Caixa de destaque no final",
        fields: [
          ta("families_box_title", "Frase principal", "Na AMEAS, atletas e famílias caminham juntos: o esporte abre caminhos e a assistência social sustenta a rede de apoio."),
          ta("families_box_text", "Texto complementar", "Todas essas ações são realizadas com a dedicação de voluntários e parceiros que doam tempo, conhecimento e cuidado para transformar vidas."),
        ],
      },
    ],
  },

  /* ───────────── DOAÇÕES ───────────── */
  {
    id: "doacoes",
    label: "Doações e PIX",
    title: "Doações e PIX",
    desc: "Textos da seção “Como ajudar”, dados bancários e códigos PIX.",
    groups: [
      {
        title: "Textos da seção “Como ajudar”",
        fields: [
          t("help_kicker", "Etiqueta da seção", "Como Ajudar"),
          t("help_title", "Título", "Apoie a AMEAS"),
          ta("help_desc", "Texto de apoio", "Escolha a forma de contribuir que combina com você. Cada apoio mantém o esporte adaptado em movimento."),
        ],
      },
      {
        title: "Cartão “Seja um parceiro”",
        desc: "O botão abre o WhatsApp da AMEAS.",
        fields: [
          t("partner_cta_title", "Título", "Seja um parceiro"),
          ta("partner_cta_desc", "Texto", "Empresas e profissionais que caminham com a AMEAS ajudam a manter o esporte adaptado em movimento."),
          t("partner_cta_b1", "Benefício 1", "Sua marca ao lado da inclusão"),
          t("partner_cta_b2", "Benefício 2", "Logo na área de parceiros do site"),
          t("partner_cta_b3", "Benefício 3", "Apoio direto a atletas e famílias"),
          t("partner_cta_button", "Texto do botão", "Quero ser parceiro"),
        ],
      },
      {
        title: "Cartão “Doação única”",
        cols: 2,
        fields: [
          t("donation_title", "Título", "Doação Única"),
          t("donation_badge", "Selo de destaque", "Mais popular"),
        ],
      },
      {
        title: "Dados bancários",
        cols: 2,
        fields: [
          t("pix_key", "Chave PIX (CNPJ)", "34017976/0001-99"),
          t("pix_bank", "Banco", "Banco do Brasil"),
          t("pix_agency", "Agência", "0523-1"),
          t("pix_account", "Conta", "48681-7"),
          t("pix_name", "Nome no PIX", "AMEAS", "Até 25 letras, sem acento. Aparece no código gerado."),
          t("pix_city", "Cidade no PIX", "SAO ROQUE", "Até 15 letras, sem acento."),
        ],
      },
      {
        title: "Códigos PIX copia e cola por valor",
        desc: "Gere cada código no aplicativo do banco e cole aqui. Ao clicar no valor, o site copia o código e abre o QR Code. Se ficar vazio, o código é gerado com a chave PIX.",
        fields: [
          code("pix_25", "R$ 25"),
          code("pix_50", "R$ 50"),
          code("pix_100", "R$ 100"),
          code("pix_200", "R$ 200"),
        ],
      },
    ],
  },

  /* ───────────── VOLUNTARIADO ───────────── */
  {
    id: "voluntariado",
    label: "Voluntariado",
    title: "Voluntariado",
    desc: "Cartão em “Como ajudar” e a seção de voluntariado.",
    groups: [
      {
        title: "Cartão em “Como ajudar”",
        fields: [
          t("volunteer_title", "Título", "Seja Voluntário(a)"),
          ta("volunteer_desc", "Texto", "Venha fazer parte da AMEAS! Precisamos de voluntários para apoiar treinos, eventos, atividades administrativas e muito mais. Cada hora doada transforma vidas."),
        ],
      },
      {
        title: "Cabeçalho da seção Voluntariado",
        fields: [
          t("vol_kicker", "Etiqueta da seção", "Voluntariado"),
          t("vol_title", "Título", "Doe seu tempo e"),
          t("vol_title_hl", HL, "transformar vidas."),
          ta("vol_desc", "Texto de apoio", "A AMEAS é movida por pessoas que acreditam na inclusão. Voluntários são o coração da nossa associação — cada hora doada muda histórias reais."),
        ],
      },
      {
        title: "Cartão 1",
        fields: [
          t("vol1_title", "Título", "Apoio esportivo"),
          ta("vol1_desc", "Texto", "Auxilie nos treinos adaptados, acompanhe atletas e colabore com educadores físicos."),
        ],
      },
      {
        title: "Cartão 2",
        fields: [
          t("vol2_title", "Título", "Suporte emocional"),
          ta("vol2_desc", "Texto", "Ofereça escuta, acolhimento e presença para atletas e famílias em momentos difíceis."),
        ],
      },
      {
        title: "Cartão 3",
        fields: [
          t("vol3_title", "Título", "Assistência social"),
          ta("vol3_desc", "Texto", "Oriente famílias sobre direitos, benefícios e serviços disponíveis na comunidade."),
        ],
      },
      {
        title: "Cartão 4",
        fields: [
          t("vol4_title", "Título", "Eventos e ações"),
          ta("vol4_desc", "Texto", "Ajude na organização de encontros, celebrações e campanhas solidárias da AMEAS."),
        ],
      },
      {
        title: "Caixa azul “Quero ser voluntário(a)”",
        fields: [
          t("vol_cta_title", "Título", "Quero ser voluntário(a)"),
          ta("vol_cta_text", "Texto", "Entre em contato com a AMEAS pelo WhatsApp e conte como você quer contribuir. Cada talento é bem-vindo."),
          t("vol_cta_button", "Texto do botão", "Falar pelo WhatsApp"),
          t("vol_cta_note", "Observação abaixo do botão", "Respondemos em horário comercial · São Roque e região"),
        ],
      },
    ],
  },

  /* ───────────── PARCEIROS ───────────── */
  {
    id: "parceiros",
    label: "Parceiros",
    title: "Parceiros e patrocinadores",
    desc: "Links e logos de cada apoiador.",
    special: "partners",
    groups: [
      {
        title: "Textos da seção",
        fields: [
          t("partners_kicker", "Etiqueta da seção", "Apoiadores e Patrocinadores"),
          t("partners_title", "Título", "Parceiros que fortalecem cada"),
          t("partners_title_hl", HL, "história de superação."),
        ],
      },
    ],
  },

  /* ───────────── GALERIA ───────────── */
  {
    id: "galeria",
    label: "Galeria",
    title: "Galeria de fotos",
    desc: "Eventos, fotos e textos da galeria.",
    special: "gallery",
    groups: [
      {
        title: "Textos da seção",
        fields: [
          t("gallery_kicker", "Etiqueta da seção", "Galeria"),
          t("gallery_title", "Título", "Histórias da AMEAS"),
          t("gallery_title_hl", HL, "em movimento."),
        ],
      },
    ],
  },

  /* ───────────── DEPOIMENTOS ───────────── */
  {
    id: "depoimentos",
    label: "Depoimentos",
    title: "Depoimentos",
    desc: "Adicione, edite, oculte ou reordene os depoimentos da seção “Vozes”.",
    special: "testimonials",
    groups: [
      {
        title: "Cabeçalho da seção",
        fields: [
          t("test_kicker", "Etiqueta da seção", "Depoimentos"),
          t("test_title", "Título", "Vozes de quem vive a"),
          t("test_title_hl", HL, "inclusão de perto."),
        ],
      },
    ],
  },

  /* ───────────── CONTATO / RODAPÉ ───────────── */
  {
    id: "contato",
    label: "Contato e rodapé",
    title: "Contato e rodapé",
    desc: "WhatsApp, Instagram e textos do rodapé.",
    groups: [
      {
        title: "Contato",
        cols: 2,
        fields: [
          t("contact_whatsapp", "WhatsApp", "(11) 99943-3480", "Todos os botões de WhatsApp do site usam este número."),
          t("instagram_url", "Link do Instagram", "https://www.instagram.com/", "Se ficar vazio, o ícone do Instagram some do rodapé."),
          t("footer_location", "Localização", "São Roque e região"),
        ],
      },
      {
        title: "Rodapé",
        fields: [
          t("footer_org", "Nome por extenso da associação", "Associação Movimento Esporte Adaptado e Superação"),
          ta("footer_desc", "Texto institucional", "Inclusão, esporte adaptado, acolhimento e superação construídos com atletas, famílias, voluntários e parceiros."),
        ],
      },
    ],
  },

  /* ───────────── CAMPOS INTERNOS (não aparecem como formulário) ───────────── */
  {
    id: "_interno",
    label: "Interno",
    title: "Interno",
    desc: "",
    hidden: true,
    groups: [
      {
        title: "Interno",
        fields: [
          t("hero_title", "Título do 1º slide (padrão)", "Esporte adaptado. Inclusão que transforma."),
          t("hero_subtitle", "Subtítulo do 1º slide (padrão)", "A AMEAS promove acolhimento, autonomia e superação por meio do esporte adaptado em São Roque e região."),
          t("hero_slides", "Slides do carrossel (JSON)", ""),
          t("gallery_hidden", "Fotos fixas ocultas (JSON)", ""),
          t("testimonials", "Depoimentos (JSON)", ""),
          t("gallery_hidden_events", "Eventos excluídos (JSON)", ""),
          t("gallery_order", "Sequência das fotos de cada evento (JSON)", ""),
          t("site_theme", "Tema do site (dark ou light)", "dark"),
          ta("test1_quote", "Citação", "A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos."),
          t("test1_author", "Autor", "Família atendida"),
          ta("test2_quote", "Citação", "Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto."),
          t("test2_author", "Autor", "Parceiro institucional"),
          ta("test3_quote", "Citação", "Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas."),
          t("test3_author", "Autor", "Atleta AMEAS"),
          t("org_president_name", "org", "Karina Meneguini"),
          t("org_vp_name", "org", "Diretoria Executiva"),
          t("org_sec1_name", "org", "Secretário(a) Geral"),
          t("org_sec2_name", "org", "Secretário(a) Adjunto(a)"),
          t("org_treas1_name", "org", "Tesoureiro(a) Geral"),
          t("org_treas2_name", "org", "Tesoureiro(a) Adjunto(a)"),
          t("org_audit1_name", "org", "Fiscal Geral"),
          t("org_audit2_name", "org", "Fiscal Adjunto(a)"),
        ],
      },
    ],
  },
] as const;

/** Todas as chaves de conteúdo conhecidas (tipadas). */
export type ContentKey =
  (typeof _SECTIONS)[number]["groups"][number]["fields"][number]["key"];

export type SiteContent = { [K in ContentKey]: string };

export const SECTIONS: readonly SectionDef[] = _SECTIONS;

export const ALL_FIELDS: readonly Field[] = SECTIONS.flatMap((s) =>
  s.groups.flatMap((g) => g.fields),
);

export const defaultSiteContent: SiteContent = Object.fromEntries(
  ALL_FIELDS.map((x) => [x.key, x.def]),
) as SiteContent;

/** Lê uma chave dinâmica (ex.: `service${n}_title`) sem brigar com o TypeScript. */
export function pick(sc: SiteContent, key: string): string {
  return (sc as unknown as Record<string, string | undefined>)[key] ?? "";
}

/* ───────────── Carrossel inicial ───────────── */
export type HeroSlide = {
  id: string;
  /** URL da foto, ou "builtin:<nome>" para uma das fotos que vêm com o site */
  image: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  active: boolean;
};

export const MAX_HERO_SLIDES = 8;

export function parseHeroSlides(raw: string): HeroSlide[] | null {
  if (!raw) return null;
  try {
    const arr: unknown = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    const out: HeroSlide[] = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
      out.push({
        id: s("id") || Math.random().toString(36).slice(2, 10),
        image: s("image"),
        title: s("title"),
        subtitle: s("subtitle"),
        cta_label: s("cta_label"),
        cta_link: s("cta_link"),
        active: o["active"] !== false,
      });
    }
    return out;
  } catch {
    return null;
  }
}

/* ───────────── Depoimentos ───────────── */
export type Testimonial = { id: string; quote: string; author: string; active: boolean };

/** Lista salva no painel ou, se não houver, os 3 depoimentos originais. */
export function getTestimonials(sc: SiteContent): Testimonial[] {
  try {
    const arr: unknown = sc.testimonials ? JSON.parse(sc.testimonials) : null;
    if (Array.isArray(arr)) {
      return arr.filter((x) => x && typeof x === "object").map((x) => {
        const o = x as Record<string, unknown>;
        const text = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : "");
        return { id: text("id") || Math.random().toString(36).slice(2, 10), quote: text("quote"), author: text("author"), active: o["active"] !== false };
      });
    }
  } catch { /* usa os originais */ }
  return [1, 2, 3].map((n) => ({
    id: `padrao-${n}`, quote: pick(sc, `test${n}_quote`), author: pick(sc, `test${n}_author`), active: true,
  }));
}

export function parseStringList(raw: string): string[] {
  if (!raw) return [];
  try {
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
