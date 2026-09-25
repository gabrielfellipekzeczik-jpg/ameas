"use client";

import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, ArrowRight, CalendarHeart, CheckCircle2, ChevronDown,
  Clock, Copy, Gift, HandHeart, Heart, LayoutDashboard, MapPin,
  Menu, MessageCircle, QrCode, Repeat, Sparkles, Star, Target,
  Trophy, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logoAsset from "@/assets/ameas-logo.png";
import parceirosBannerAsset from "@/assets/ameas-parceiros-banner.png";
import acolhimentoCafeAsset from "@/assets/ameas-acolhimento-cafe.png";
import corridaAdaptadaAsset from "@/assets/ameas-corrida-adaptada.png";
import parceriaTiaLinaAsset from "@/assets/ameas-parceria-tia-lina.png";
import encontroComunidadeAsset from "@/assets/ameas-encontro-comunidade.png";
import karinaAsset from "@/assets/karina-meneguini-retrato.png";
import crossfitGrupoAsset from "@/assets/ameas-crossfit-grupo.png";
import acaoSolidariaAsset from "@/assets/ameas-acao-solidaria.png";
import treinoAdaptadoAsset from "@/assets/ameas-treino-adaptado.png";
import pixQrcodeAsset from "@/assets/pix-qrcode.png";
import sponsorRuaHumAsset from "@/assets/sponsor-rua-hum.png";
import sponsorEscolaAquarelaAsset from "@/assets/sponsor-escola-aquarela.png";
import sponsorIbicolorAsset from "@/assets/sponsor-ibicolor.png";
import sponsorVilaDonPattoAsset from "@/assets/sponsor-vila-don-patto.png";
import sponsorUnimedAsset from "@/assets/sponsor-unimed-sao-roque.png";
import sponsorEmporioQnAsset from "@/assets/sponsor-emporio-qn.png";
import sponsorTiaLinaAsset from "@/assets/sponsor-tia-lina.png";
import sponsorFernandoAraujoAsset from "@/assets/sponsor-fernando-araujo.png";
import sponsorQualiserAsset from "@/assets/sponsor-qualiser-contabilidade.png";
import sponsorJornalEconomiaAsset from "@/assets/sponsor-jornal-da-economia.png";
import {
  defaultSiteContent, getPartnerLinks, getSiteContent, getGalleryCategories, getGalleryItems, getStorageUrl,
  type PartnerLink, type SiteContent, type GalleryCategory,
} from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AMEAS | Esporte Adaptado e Superação" },
      { name: "description", content: "Site institucional da AMEAS, associação que promove inclusão, acolhimento e superação por meio do esporte adaptado." },
      { property: "og:title", content: "AMEAS | Esporte Adaptado e Superação" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AmeasHome,
});

/* ─── Constantes ─── */
const whatsappNumber = "5511999433480";
const whatsappDisplay = "(11) 99943-3480";

const navLinks = [
  { href: "#sobre",      label: "Sobre" },
  { href: "#fundadora",  label: "Fundadora" },
  { href: "#missao",     label: "Missão" },
  { href: "#servicos",   label: "Serviços" },
  { href: "#familias",   label: "Famílias" },
  { href: "#voluntario", label: "Voluntário" },
  { href: "#galeria",    label: "Galeria" },
  { href: "#ajudar",     label: "Apoiar" },
  { href: "#parceiros",  label: "Parceiros" },
  { href: "#contato",    label: "Contato" },
];

const galleryEvents = [
  {
    id: "esporte-adaptado",
    label: "Esporte Adaptado",
    color: "bg-[#1B4B8A] text-white",
    colorHover: "hover:bg-[#1B4B8A]/80",
    images: [
      { src: corridaAdaptadaAsset,    alt: "Atleta em triciclo adaptado durante atividade",    title: "Corrida adaptada" },
      { src: crossfitGrupoAsset,      alt: "Equipe AMEAS em encontro esportivo no CrossFit",   title: "Treino coletivo" },
      { src: treinoAdaptadoAsset,     alt: "Mulheres da AMEAS realizando treino adaptado",     title: "Superação em treino" },
    ],
  },
  {
    id: "comunidade",
    label: "Comunidade",
    color: "bg-[#E8392A] text-white",
    colorHover: "hover:bg-[#E8392A]/80",
    images: [
      { src: encontroComunidadeAsset, alt: "Grande grupo da AMEAS reunido com banner",         title: "Encontro da comunidade" },
      { src: acaoSolidariaAsset,      alt: "Grupo da AMEAS em ação solidária",                 title: "Ação solidária" },
      { src: parceirosBannerAsset,    alt: "Banner comemorativo com parceiros da AMEAS",       title: "Parceiros AMEAS" },
    ],
  },
  {
    id: "acolhimento",
    label: "Acolhimento",
    color: "bg-[#059669] text-white",
    colorHover: "hover:bg-[#059669]/80",
    images: [
      { src: acolhimentoCafeAsset,    alt: "Grupo da AMEAS reunido em momento de acolhimento", title: "Café de acolhimento" },
      { src: parceriaTiaLinaAsset,    alt: "Participantes da AMEAS em ação de parceria",       title: "Parceria Tia Lina" },
    ],
  },
  {
    id: "fundadora",
    label: "Fundadora",
    color: "bg-[#7c3aed] text-white",
    colorHover: "hover:bg-[#7c3aed]/80",
    images: [
      { src: karinaAsset,             alt: "Retrato oficial de Karina Meneguini, fundadora",   title: "Karina Meneguini" },
    ],
  },
];

const partners = [
  { slug: "rua-hum",           name: "Rua Hum",                          logo: sponsorRuaHumAsset,          website_url: "https://www.instagram.com/ruahum" },
  { slug: "escola-aquarela",   name: "Escola Aquarela",                  logo: sponsorEscolaAquarelaAsset,  website_url: "https://www.instagram.com/escolaaquarelasr" },
  { slug: "ibicolor",          name: "Ibicolor",                         logo: sponsorIbicolorAsset,         website_url: "https://www.instagram.com/ibicolor_sr" },
  { slug: "vila-don-patto",    name: "Vila Don Patto",                   logo: sponsorVilaDonPattoAsset,    website_url: "https://www.instagram.com/viladonpatto" },
  { slug: "unimed-sao-roque",  name: "Unimed São Roque",                 logo: sponsorUnimedAsset,          website_url: "https://www.unimed.coop.br/site/web/saoroque" },
  { slug: "emporio-qn",        name: "Empório QN",                       logo: sponsorEmporioQnAsset,       website_url: "" },
  { slug: "tia-lina",          name: "Tia Lina",                         logo: sponsorTiaLinaAsset,         website_url: "https://www.instagram.com/cantinatialina" },
  { slug: "fernando-araujo",   name: "Fernando Araújo Artista Plástico", logo: sponsorFernandoAraujoAsset,  website_url: "https://www.instagram.com/araujoartistaplastico" },
  { slug: "qualiser",          name: "Qualiser Contabilidade",           logo: sponsorQualiserAsset,        website_url: "" },
  { slug: "jornal-da-economia", name: "Jornal da Economia",              logo: sponsorJornalEconomiaAsset,  website_url: "" },
].map((p) => ({ ...p, remoteLogoUrl: getStorageUrl(`logos/${p.slug}.png`) }));

const values = [
  { icon: Target, title: "Missão",  text: "Promover inclusão, autonomia e qualidade de vida por meio do esporte adaptado, criando caminhos reais de participação social." },
  { icon: Trophy, title: "Visão",   text: "Ser referência regional em esporte adaptado, acolhimento e oportunidades para pessoas com deficiência e suas famílias." },
  { icon: Heart,  title: "Valores", text: "Respeito, empatia, superação, compromisso, transparência, colaboração e amor pelo desenvolvimento humano." },
];

const donationPresets = [25, 50, 100, 200];

/* ─── Componente principal ─── */
function AmeasHome() {
  const [sc, setSc] = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<GalleryCategory[]>([]);
  const [dbGalleryItems, setDbGalleryItems] = useState<Array<{ id: string; title: string; alt: string; image_url: string; category: string | null; sort_order: number; published: boolean }>>([]);
  const [donationOpen, setDonationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("50");
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [volunteerForm, setVolunteerForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [volunteerSent, setVolunteerSent] = useState(false);

  useEffect(() => {
    getSiteContent().then(setSc);
    getPartnerLinks().then(setPartnerLinks);
    getGalleryCategories().then(setDynamicCategories);
    getGalleryItems().then(setDbGalleryItems);
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, AMEAS! Quero apoiar a Associação Movimento Esporte Adaptado e Superação.")}`;
  const volunteerWhatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá, AMEAS! Quero ser voluntário(a).\nNome: ${volunteerForm.name}\nE-mail: ${volunteerForm.email}\nTelefone: ${volunteerForm.phone}\n${volunteerForm.message}`)}`;

  const visiblePartners = partners
    .map((p) => {
      const link = partnerLinks.find((l) => l.slug === p.slug);
      return { ...p, website_url: link?.website_url || p.website_url };
    })
    .filter((p) => !partnerLinks.length || partnerLinks.some((l) => l.slug === p.slug && l.published));

  // Merge static gallery events with dynamic categories + DB images
  const activeEvents = useMemo(() => {
    // Start from dynamic categories if loaded, else fall back to static galleryEvents
    const cats = dynamicCategories.length ? dynamicCategories : galleryEvents.map((e) => ({
      id: e.id, label: e.label, color: e.color, sort_order: 0,
    }));

    return cats.map((cat) => {
      // Static images for this category
      const staticImgs = galleryEvents
        .find((e) => e.id === cat.id)?.images
        .map((img) => ({ src: img.src, alt: img.alt, title: img.title, isDb: false })) ?? [];

      // DB images for this category
      const dbImgs = dbGalleryItems
        .filter((item) => item.category === cat.id)
        .map((item) => ({ src: item.image_url, alt: item.alt, title: item.title, isDb: true }));

      return { ...cat, images: [...staticImgs, ...dbImgs] };
    }).filter((ev) => ev.images.length > 0);
  }, [dynamicCategories, dbGalleryItems]);

  const year = useMemo(() => new Date().getFullYear(), []);

  const copyPix = async (amount?: string) => {
    // Escolhe o código copia-e-cola mais específico para o valor
    const a = amount ?? donationAmount;
    const code =
      a === "30"  ? sc.pix_monthly :
      a === "25"  ? sc.pix_25 :
      a === "50"  ? sc.pix_50 :
      a === "100" ? sc.pix_100 :
      a === "200" ? sc.pix_200 :
      sc.pix_copypaste || sc.pix_key;
    const textToCopy = code || sc.pix_copypaste || sc.pix_key;
    if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* ─── RENDER ─── */
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex shrink-0 items-center gap-2.5" aria-label="Início">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1B4B8A]/40 bg-[#1B4B8A]/10 p-1 glow-blue">
              <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" />
            </span>
            <span className="gradient-text-blue text-sm font-black uppercase tracking-wider">AMEAS</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Navegação principal">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground/70 transition-all hover:bg-[#1B4B8A]/10 hover:text-[#7eb5f5]">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="ghost" className="hidden text-xs text-foreground/60 hover:text-[#7eb5f5] lg:inline-flex">
              <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            </Button>
            <Button size="sm" onClick={() => setDonationOpen(true)}
              className="hidden bg-[#E8392A] px-3 text-xs text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#E8392A]/90 hover:shadow-[#E8392A]/50 lg:inline-flex">
              <Heart className="h-3.5 w-3.5" /> Doar
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden px-2 text-foreground/40 hover:text-[#7eb5f5] lg:inline-flex" title="Painel admin">
              <a href="/admin" aria-label="Painel administrativo"><LayoutDashboard className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 lg:hidden"
              onClick={() => setMenuOpen((c) => !c)} aria-label="Menu">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-[#1B4B8A]/10 hover:text-[#7eb5f5]">
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDonationOpen(true)} className="flex-1 bg-[#E8392A] text-xs text-white">
                  <Heart className="h-3.5 w-3.5" /> Doar Agora
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-foreground/50">
                  <a href="/admin"><LayoutDashboard className="h-4 w-4" /></a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section id="inicio" className="relative overflow-hidden bg-hero-pattern">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#1B4B8A]/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-[#E8392A]/10 blur-3xl" aria-hidden="true" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Badge className="border border-[#1B4B8A]/30 bg-[#1B4B8A]/10 px-3 py-1 text-[#7eb5f5] hover:bg-[#1B4B8A]/20">
              Associação Movimento Esporte Adaptado e Superação
            </Badge>
            <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
              <span className="gradient-text">AMEAS</span>
            </h1>
            <p className="mt-4 text-2xl font-bold text-foreground/90 sm:text-3xl">{sc.hero_title}</p>
            <p className="mt-5 text-lg leading-8 text-foreground/60">{sc.hero_subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl bg-[#E8392A] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#E8392A]/90 hover:shadow-[#E8392A]/50">
                <a href="#ajudar"><Heart aria-hidden="true" /> Fazer Doação</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-[#1B4B8A]/40 text-[#7eb5f5] hover:bg-[#1B4B8A]/10">
                <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> WhatsApp</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-foreground/60">
              {["Inclusão", "Acolhimento", "Superação"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#E8392A]" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <figure className="glass neon-border relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl p-3 shadow-2xl">
              <img src={treinoAdaptadoAsset} alt="Atletas da AMEAS em treino adaptado" className="max-h-[520px] w-full object-contain" loading="eager" />
            </figure>
            <div className="grid gap-4">
              {[corridaAdaptadaAsset, crossfitGrupoAsset].map((src, i) => (
                <figure key={i} className="glass flex min-h-[160px] items-center justify-center overflow-hidden rounded-2xl p-3">
                  <img src={src} alt="" className="max-h-60 w-full object-contain" />
                </figure>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl justify-center px-4 pb-10 sm:px-6 lg:px-8">
          <a href="#sobre" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/40 hover:text-[#7eb5f5] transition-colors">
            Conheça a associação <ChevronDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ══ SOBRE ══ */}
      <section id="sobre" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="section-kicker">Sobre a Associação</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Movimento, esporte e acolhimento para <span className="gradient-text">transformar vidas.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-foreground/60">
              <p>A AMEAS nasceu do compromisso com a inclusão e com a superação diária de pessoas que encontram no esporte adaptado um espaço de desenvolvimento, amizade e conquista.</p>
              <p>{sc.about_text}</p>
              <p>Mais do que treinos, a AMEAS constrói uma rede de apoio em que cada pessoa é vista, respeitada e incentivada a alcançar novas possibilidades.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="glass neon-border flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl p-3">
              <img src={encontroComunidadeAsset} alt="Comunidade AMEAS reunida" className="max-h-[360px] w-full object-contain" loading="lazy" />
            </figure>
            <div className="grid gap-4">
              <div className="glass-blue rounded-3xl p-5">
                <Sparkles className="h-7 w-7 text-[#f59e0b] mb-3" />
                <p className="font-black text-foreground">Impacto humano</p>
                <p className="mt-2 text-sm leading-6 text-foreground/60">Inclusão que começa no treino e alcança a autoestima, a família e a comunidade.</p>
              </div>
              <div className="glass rounded-3xl border border-[#E8392A]/20 p-5">
                <CalendarHeart className="h-7 w-7 text-[#E8392A] mb-3" />
                <p className="font-black text-foreground">Presença contínua</p>
                <p className="mt-2 text-sm leading-6 text-foreground/60">Projetos, encontros e ações que mantêm o esporte adaptado vivo e acessível.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FUNDADORA ══ */}
      <section id="fundadora" className="py-20 sm:py-24 bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <figure className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1B4B8A]/30 to-[#E8392A]/20 blur-2xl" aria-hidden="true" />
            <div className="glass-blue relative overflow-hidden rounded-3xl border border-[#1B4B8A]/40 p-4 shadow-2xl glow-blue">
              <img src={karinaAsset} alt={`${sc.founder_name}, fundadora da AMEAS`} className="max-h-[520px] w-full rounded-2xl object-contain" loading="lazy" />
            </div>
          </figure>
          <div>
            <span className="section-kicker">Fundadora</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">{sc.founder_name}</span></h2>
            <p className="mt-6 text-lg leading-8 text-foreground/70">{sc.founder_bio1}</p>
            <p className="mt-4 text-lg leading-8 text-foreground/70">{sc.founder_bio2}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Dedicação", "Liderança transformadora", "Inclusão com afeto"].map((item) => (
                <div key={item} className="glass-blue rounded-2xl border border-[#1B4B8A]/20 p-4 text-center text-sm font-bold text-[#7eb5f5]">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSÃO ══ */}
      <section id="missao" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Missão, Visão e Valores</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Princípios que orientam cada treino, encontro e <span className="gradient-text">conquista.</span></h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map((item, i) => {
              const Icon = item.icon;
              const styles = [
                "border-[#1B4B8A]/30 bg-[#1B4B8A]/5 text-[#7eb5f5]",
                "border-[#38bdf8]/30 bg-[#38bdf8]/5 text-[#38bdf8]",
                "border-[#E8392A]/30 bg-[#E8392A]/5 text-[#E8392A]",
              ];
              return (
                <div key={item.title} className={`glass neon-border rounded-3xl border p-7 ${styles[i]}`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5`}><Icon /></span>
                  <p className="mt-4 text-xl font-black text-foreground">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-foreground/60">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ SERVIÇOS ══ */}
      <section id="servicos" className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,57,42,.08), transparent), var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">O que fazemos</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Serviços e atividades que <span className="gradient-text">transformam cada dia.</span></h2>
            <p className="mt-5 text-lg leading-8 text-foreground/60">Da prática esportiva ao apoio social, a AMEAS oferece um conjunto de ações que acolhem, desenvolvem e incluem.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Activity,     color: "text-[#E8392A]",  border: "border-[#E8392A]/20 bg-[#E8392A]/5",   title: "Esporte Adaptado",        desc: "Treinos e atividades físicas adaptadas para pessoas com deficiência, promovendo saúde, autonomia e superação com acompanhamento especializado." },
              { icon: Users,        color: "text-[#7eb5f5]",  border: "border-[#1B4B8A]/20 bg-[#1B4B8A]/5",   title: "Assistência Social",      desc: "Orientação, encaminhamentos e apoio para que atletas e famílias acessem direitos, benefícios e serviços públicos disponíveis." },
              { icon: Heart,        color: "text-[#f59e0b]",  border: "border-[#f59e0b]/20 bg-[#f59e0b]/5",   title: "Suporte Psicológico",     desc: "Espaço de escuta e acolhimento emocional para atletas e familiares, com foco no bem-estar e na saúde mental." },
              { icon: Sparkles,     color: "text-[#059669]",  border: "border-[#059669]/20 bg-[#059669]/5",   title: "Pilates para Mães",       desc: "Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o corpo e descanso para as mães e responsáveis." },
              { icon: CalendarHeart,color: "text-[#7c3aed]",  border: "border-[#7c3aed]/20 bg-[#7c3aed]/5",   title: "Eventos Comunitários",    desc: "Encontros, celebrações e ações solidárias que fortalecem os laços entre atletas, famílias, voluntários e a comunidade." },
              { icon: HandHeart,    color: "text-[#38bdf8]",  border: "border-[#38bdf8]/20 bg-[#38bdf8]/5",   title: "Voluntariado",            desc: "Programa de voluntariado que conecta pessoas dispostas a contribuir com seu tempo e talento ao crescimento da associação." },
            ].map(({ icon: Icon, color, border, title, desc }) => (
              <div key={title} className={`glass neon-border rounded-3xl border p-7 ${border}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${color}`}><Icon /></span>
                <p className="mt-4 text-xl font-black text-foreground">{title}</p>
                <p className="mt-3 text-sm leading-7 text-foreground/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAMÍLIAS ══ */}
      <section id="familias" className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,75,138,.12), transparent), var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Famílias atípicas</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Cuidar de quem cuida também faz parte da <span className="gradient-text">nossa missão.</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-foreground/60">
              Além do esporte adaptado, a AMEAS oferece uma rede de acolhimento e assistência social para as famílias atípicas da associação.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Heart,    label: "Suporte psicológico", border: "border-[#E8392A]/20 bg-[#E8392A]/5",  iconCls: "text-[#E8392A]", text: "Espaço de escuta e acolhimento emocional para mães, pais e responsáveis enfrentarem os desafios da rotina com mais apoio e segurança." },
              { icon: Users,    label: "Assistência social",  border: "border-[#1B4B8A]/20 bg-[#1B4B8A]/5",  iconCls: "text-[#7eb5f5]", text: "Orientação e encaminhamentos para fortalecer o acesso das famílias a direitos, serviços e oportunidades na comunidade." },
              { icon: Activity, label: "Pilates para as mães",border: "border-[#f59e0b]/20 bg-[#f59e0b]/5",  iconCls: "text-[#f59e0b]", text: "Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o corpo, descanso e fortalecimento." },
            ].map(({ icon: Icon, label, border, iconCls, text }) => (
              <div key={label} className={`glass neon-border rounded-3xl border p-7 ${border}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${iconCls}`}><Icon /></span>
                <p className="mt-4 text-xl font-black text-foreground">{label}</p>
                <p className="mt-3 text-sm leading-7 text-foreground/60">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/10 p-8 backdrop-blur">
            <p className="text-lg font-bold text-foreground">Na AMEAS, atletas e famílias caminham juntos: o esporte abre caminhos e a assistência social sustenta a rede de apoio.</p>
            <p className="mt-3 text-sm leading-7 text-foreground/50">Todas essas ações são realizadas com a dedicação de voluntários e parceiros que doam tempo, conhecimento e cuidado para transformar vidas.</p>
          </div>
        </div>
      </section>

      {/* ══ COMO AJUDAR ══ */}
      <section id="ajudar" className="bg-donation-pattern py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-kicker">Como Ajudar</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">Apoie a AMEAS</span></h2>
            <p className="mt-5 text-lg leading-8 text-foreground/60">Escolha a forma de contribuir que combina com você. Cada apoio mantém o esporte adaptado em movimento.</p>
          </div>

          <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
            {/* Apoiador Mensal */}
            <div className="glass neon-border rounded-3xl border border-[#1B4B8A]/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4B8A]/15 text-[#7eb5f5]"><Repeat /></span>
              <p className="mt-4 text-2xl font-black text-foreground">Apoiador Mensal</p>
              <p className="mt-1 text-3xl font-black text-[#7eb5f5]">R$ 30<span className="text-base font-bold text-foreground/40">/mês</span></p>
              <ul className="mt-5 space-y-3 text-sm text-foreground/60">
                {["Apoio contínuo aos treinos", "Materiais e equipamentos adaptados", "Relatos das conquistas dos atletas"].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7eb5f5]" />{item}</li>
                ))}
              </ul>
              <Button onClick={() => setDonationOpen(true)} className="mt-6 w-full rounded-2xl bg-[#1B4B8A]/20 text-[#7eb5f5] border border-[#1B4B8A]/30 hover:bg-[#1B4B8A]/40">
                <QrCode /> Doar via PIX
              </Button>
            </div>

            {/* Doação Única */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1B4B8A]/50 bg-gradient-to-br from-[#1B4B8A]/60 to-[#0d1b2e]/80 p-7 shadow-2xl glow-blue backdrop-blur lg:-mt-4">
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/20 px-3 py-1 text-xs font-black text-[#f59e0b]">
                <Star className="h-3 w-3" /> Mais popular
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white"><Gift /></span>
              <p className="mt-4 text-2xl font-black text-white">Doação Única</p>
              <p className="mt-1 text-3xl font-black text-white">R$ {donationAmount || "0"}<span className="text-base font-bold text-white/50"> por doação</span></p>
              <div className="mt-5 flex flex-wrap gap-2">
                {donationPresets.map((v) => (
                  <button key={v} onClick={() => setDonationAmount(String(v))}
                    className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${donationAmount === String(v) ? "border-[#f59e0b] bg-[#f59e0b] text-black" : "border-white/20 text-white/70 hover:border-white/40"}`}>
                    R$ {v}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="valor-livre" className="text-xs font-bold uppercase text-white/50">Valor livre</label>
                <input id="valor-livre" inputMode="numeric" value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value.replace(/\D/g, ""))} placeholder="Digite o valor"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-base font-bold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7eb5f5]" />
              </div>
              <Button onClick={() => setDonationOpen(true)} className="mt-5 w-full rounded-2xl bg-[#E8392A] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#E8392A]/90">
                <Heart /> Doar R$ {donationAmount || "0"} via PIX
              </Button>
              <p className="mt-3 text-center text-xs text-white/40">{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            </div>

            {/* Voluntário */}
            <div className="glass neon-border rounded-3xl border border-[#E8392A]/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8392A]/15 text-[#E8392A]"><HandHeart /></span>
              <p className="mt-4 text-2xl font-black text-foreground">{sc.volunteer_title}</p>
              <p className="mt-3 text-sm leading-7 text-foreground/60">{sc.volunteer_desc}</p>
              <Button onClick={() => setVolunteerOpen(true)} className="mt-6 w-full rounded-2xl bg-[#E8392A]/15 text-[#E8392A] border border-[#E8392A]/30 hover:bg-[#E8392A]/30">
                <MessageCircle /> Quero ser voluntário(a)
              </Button>
              <Button asChild variant="outline" className="mt-3 w-full rounded-2xl border-[#1B4B8A]/30 text-[#7eb5f5] hover:bg-[#1B4B8A]/10">
                <a href={whatsappUrl} target="_blank" rel="noreferrer"><Clock /> Falar no WhatsApp</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VOLUNTÁRIO ══ */}
      <section id="voluntario" className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 70% 50% at 50% 100%, rgba(27,75,138,.15), transparent), var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-kicker">Voluntariado</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Doe seu tempo e <span className="gradient-text">transforme vidas.</span></h2>
            <p className="mt-5 text-lg leading-8 text-foreground/60">
              A AMEAS é movida por pessoas que acreditam na inclusão. Voluntários são o coração da nossa associação — cada hora doada muda histórias reais.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
            {/* Cards de formas de contribuir */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Activity,      color: "text-[#E8392A]",  border: "border-[#E8392A]/20", title: "Apoio esportivo",       desc: "Auxilie nos treinos adaptados, acompanhe atletas e colabore com educadores físicos." },
                { icon: Heart,         color: "text-[#f59e0b]",  border: "border-[#f59e0b]/20", title: "Suporte emocional",     desc: "Ofereça escuta, acolhimento e presença para atletas e famílias em momentos difíceis." },
                { icon: Users,         color: "text-[#7eb5f5]",  border: "border-[#1B4B8A]/20", title: "Assistência social",    desc: "Oriente famílias sobre direitos, benefícios e serviços disponíveis na comunidade." },
                { icon: CalendarHeart, color: "text-[#059669]",  border: "border-[#059669]/20", title: "Eventos e ações",       desc: "Ajude na organização de encontros, celebrações e campanhas solidárias da AMEAS." },
              ].map(({ icon: Icon, color, border, title, desc }) => (
                <div key={title} className={`glass rounded-2xl border p-5 ${border}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${color}`}><Icon className="h-5 w-5" /></span>
                  <p className="mt-3 font-black text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/60">{desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1B4B8A]/40 bg-gradient-to-br from-[#1B4B8A]/60 to-[#0d1b2e]/80 p-8 shadow-2xl glow-blue backdrop-blur text-center">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#E8392A]/10 blur-3xl" />
              <span className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white mb-5">
                <HandHeart className="h-8 w-8" />
              </span>
              <p className="text-2xl font-black text-white">Quero ser voluntário(a)</p>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Entre em contato com a AMEAS pelo WhatsApp e conte como você quer contribuir. Cada talento é bem-vindo.
              </p>
              <Button asChild size="lg"
                className="mt-7 w-full rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#25D366]/90 hover:shadow-[#25D366]/50">
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, AMEAS! Tenho interesse em ser voluntário(a). Gostaria de saber como posso contribuir.")}`}
                  target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" /> Falar pelo WhatsApp
                </a>
              </Button>
              <p className="mt-4 text-xs text-white/40">Respondemos em horário comercial · São Roque e região</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PARCEIROS ══ */}
      <section id="parceiros" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Apoiadores e Patrocinadores</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Parceiros que fortalecem cada <span className="gradient-text">história de superação.</span></h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {visiblePartners.map((p) => (
              <a key={p.name} href={p.website_url || undefined} target={p.website_url ? "_blank" : undefined}
                rel={p.website_url ? "noreferrer" : undefined}
                onClick={(e) => !p.website_url && e.preventDefault()}
                className="glass neon-border group flex flex-col items-center gap-3 rounded-3xl border border-border/40 p-5 text-center transition-all hover:border-[#1B4B8A]/40">
                <span className="flex h-20 w-full items-center justify-center rounded-2xl bg-white p-2">
                  <img
                    src={p.remoteLogoUrl ?? p.logo}
                    alt={`Logo de ${p.name}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = p.logo; }}
                  />
                </span>
                <span className="text-xs font-black uppercase leading-snug text-foreground/70 group-hover:text-[#7eb5f5] transition-colors">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALERIA ══ */}
      <section id="galeria" className="py-20 sm:py-24" style={{background:"var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Galeria</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Histórias da AMEAS <span className="gradient-text">em movimento.</span></h2>
          </div>

          {selectedEventId === null ? (
            /* ── Vista: grade de eventos ── */
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {activeEvents.map((ev) => {
                const cover = ev.images[0];
                if (!cover) return null;
                return (
                  <button key={ev.id} onClick={() => setSelectedEventId(ev.id)}
                    className="glass neon-border group overflow-hidden rounded-3xl border border-border/30 text-left transition-all hover:border-[#1B4B8A]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb5f5]">
                    <span className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-background/30">
                      <img src={cover.src} alt={cover.alt}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-lg ${ev.color}`}>
                        {ev.label}
                      </span>
                      <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                        {ev.images.length} foto{ev.images.length !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="text-sm font-black text-foreground/80">{ev.label}</span>
                      <ArrowRight className="h-4 w-4 text-[#7eb5f5] transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* ── Vista: fotos do evento selecionado ── */
            (() => {
              const ev = activeEvents.find((e) => e.id === selectedEventId)!;
              if (!ev) return null;
              return (
                <div className="mt-10">
                  <div className="mb-8 flex flex-wrap items-center gap-4">
                    <button onClick={() => setSelectedEventId(null)}
                      className="flex items-center gap-2 rounded-2xl border border-border/40 px-4 py-2 text-sm font-bold text-foreground/60 transition-all hover:border-[#1B4B8A]/40 hover:text-[#7eb5f5]">
                      <ArrowRight className="h-4 w-4 rotate-180" /> Todos os eventos
                    </button>
                    <span className={`rounded-full px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow ${ev.color}`}>
                      {ev.label}
                    </span>
                    <span className="text-sm text-foreground/40">{ev.images.length} foto{ev.images.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ev.images.map((img) => (
                      <button key={img.src} onClick={() => setSelectedImage(img)}
                        className="glass neon-border group overflow-hidden rounded-3xl border border-border/30 text-left transition-all hover:border-[#1B4B8A]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7eb5f5]">
                        <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-background/30 p-2">
                          <img src={img.src} alt={img.alt}
                            className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        </span>
                        <span className="flex items-center justify-between gap-3 px-4 py-3">
                          <span className="text-sm font-black text-foreground/80">{img.title}</span>
                          <ArrowRight className="h-4 w-4 text-[#7eb5f5] transition-transform group-hover:translate-x-1" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </section>

      {/* ══ DEPOIMENTOS ══ */}
      <section className="py-20 sm:py-24" aria-labelledby="dep-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Depoimentos</span>
            <h2 id="dep-title" className="mt-4 text-3xl font-black sm:text-4xl">Vozes de quem vive a <span className="gradient-text">inclusão de perto.</span></h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              { quote: sc.test1_quote, author: sc.test1_author, border: "border-[#1B4B8A]/20" },
              { quote: sc.test2_quote, author: sc.test2_author, border: "border-[#38bdf8]/20" },
              { quote: sc.test3_quote, author: sc.test3_author, border: "border-[#E8392A]/20" },
            ].map((t, i) => (
              <div key={i} className={`glass neon-border rounded-3xl border p-7 ${t.border}`}>
                <div className="flex gap-1 text-[#f59e0b] mb-4">
                  <Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" />
                </div>
                <blockquote className="text-base font-semibold leading-8 text-foreground/80">"{t.quote}"</blockquote>
                <p className="mt-4 text-sm font-black text-[#7eb5f5]">{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="contato" className="border-t border-border/30 py-14" style={{background:"var(--color-card)"}}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1B4B8A]/30 bg-[#1B4B8A]/10 p-2 glow-blue">
                <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" loading="lazy" />
              </span>
              <div>
                <p className="gradient-text-blue text-xl font-black">AMEAS</p>
                <p className="text-xs text-foreground/40">Associação Movimento Esporte Adaptado e Superação</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-foreground/50">Inclusão, esporte adaptado, acolhimento e superação construídos com atletas, famílias, voluntários e parceiros.</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/60">
            <p className="font-black text-foreground">Contato</p>
            <a className="flex items-center gap-2 hover:text-[#7eb5f5] transition-colors" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> {sc.contact_whatsapp || whatsappDisplay}
            </a>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> São Roque e região</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/60">
            <p className="font-black text-foreground">Doações</p>
            <p>PIX CNPJ {sc.pix_key}</p>
            <p>{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            <Button onClick={() => setDonationOpen(true)} className="rounded-2xl bg-[#E8392A] text-white shadow-md shadow-[#E8392A]/25 hover:bg-[#E8392A]/90">
              <Heart /> Doar Agora
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border/20 px-4 pt-6 text-xs text-foreground/30 sm:px-6 lg:px-8">
          © {year} AMEAS. Todos os direitos reservados.
        </div>
      </footer>

      {/* Botão flutuante */}
      <Button onClick={() => setDonationOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-[#E8392A] px-5 text-white shadow-xl shadow-[#E8392A]/30 donation-pulse hover:bg-[#E8392A]/90 hover:shadow-[#E8392A]/50"
        aria-label="Fazer doação">
        <Heart /> Fazer Doação
      </Button>

      {/* ══ MODAL: DOAÇÃO ══ */}
      <DonationDialog open={donationOpen} onOpenChange={setDonationOpen} copied={copied} onCopyPix={copyPix} sc={sc} whatsappUrl={whatsappUrl} donationAmount={donationAmount} />

      {/* ══ MODAL: VOLUNTÁRIO ══ */}
      <Dialog open={volunteerOpen} onOpenChange={setVolunteerOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto rounded-3xl border border-[#1B4B8A]/20 bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HandHeart className="text-[#E8392A]" /> <span className="gradient-text">Seja Voluntário(a)</span>
            </DialogTitle>
            <DialogDescription className="text-foreground/50">Preencha o formulário e entraremos em contato.</DialogDescription>
          </DialogHeader>
          {volunteerSent ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <p className="text-lg font-black text-foreground">Mensagem enviada!</p>
              <p className="mt-2 text-sm text-foreground/60">Em breve a AMEAS entrará em contato com você.</p>
              <Button onClick={() => { setVolunteerOpen(false); setVolunteerSent(false); }} className="mt-6 rounded-2xl bg-[#E8392A] text-white">Fechar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground/50">Nome completo *</label>
                  <input value={volunteerForm.name} onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    placeholder="Seu nome" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-foreground/50">E-mail *</label>
                  <input type="email" value={volunteerForm.email} onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                    placeholder="seu@email.com" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground/50">Telefone / WhatsApp</label>
                <input value={volunteerForm.phone} onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                  placeholder="(11) 99999-9999" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground/50">Como quer ajudar?</label>
                <textarea rows={3} value={volunteerForm.message} onChange={(e) => setVolunteerForm({ ...volunteerForm, message: e.target.value })}
                  placeholder="Conte um pouco sobre você e sua disponibilidade…"
                  className="w-full resize-none rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
              </div>
              <div className="flex gap-3">
                <Button asChild className="flex-1 rounded-2xl bg-[#E8392A] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#E8392A]/90"
                  onClick={() => volunteerForm.name && volunteerForm.email && setVolunteerSent(true)}>
                  <a href={volunteerWhatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Enviar pelo WhatsApp</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ MODAL: IMAGEM ══ */}
      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto rounded-3xl border border-[#1B4B8A]/20 bg-card/95 p-4 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="gradient-text">{selectedImage?.title}</DialogTitle>
            <DialogDescription className="text-foreground/50">{selectedImage?.alt}</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex min-h-[55vh] items-center justify-center rounded-2xl bg-background/30 p-3">
              <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[72vh] w-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

/* ─── Sub-componentes ─── */

function DonationDialog({ open, onOpenChange, copied, onCopyPix, sc, whatsappUrl, donationAmount }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  copied: boolean; onCopyPix: (amount?: string) => void;
  sc: SiteContent; whatsappUrl: string; donationAmount: string;
}) {
  // Pick the most specific pix code for the current amount
  const pixCode = (() => {
    if (donationAmount === "30")  return sc.pix_monthly || sc.pix_copypaste || sc.pix_key;
    if (donationAmount === "25")  return sc.pix_25  || sc.pix_copypaste || sc.pix_key;
    if (donationAmount === "50")  return sc.pix_50  || sc.pix_copypaste || sc.pix_key;
    if (donationAmount === "100") return sc.pix_100 || sc.pix_copypaste || sc.pix_key;
    if (donationAmount === "200") return sc.pix_200 || sc.pix_copypaste || sc.pix_key;
    return sc.pix_copypaste || sc.pix_key;
  })();

  const hasSpecificCode =
    (donationAmount === "30"  && sc.pix_monthly) ||
    (donationAmount === "25"  && sc.pix_25)  ||
    (donationAmount === "50"  && sc.pix_50)  ||
    (donationAmount === "100" && sc.pix_100) ||
    (donationAmount === "200" && sc.pix_200) ||
    sc.pix_copypaste;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-3xl border border-[#1B4B8A]/20 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="text-[#E8392A]" /> <span className="gradient-text">Apoie a AMEAS</span>
          </DialogTitle>
          <DialogDescription className="text-foreground/50">Sua doação fortalece esporte adaptado, inclusão e acolhimento.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
          {/* QR Code real */}
          <div className="mx-auto w-full max-w-52">
            <div className="overflow-hidden rounded-2xl border border-[#1B4B8A]/20 bg-white p-2 shadow-lg">
              <img src={pixQrcodeAsset} alt="QR Code PIX AMEAS" className="h-full w-full object-contain" />
            </div>
            <p className="mt-2 text-center text-[0.65rem] font-bold uppercase text-foreground/40">Escaneie para pagar</p>
          </div>

          <div className="space-y-3">
            {/* Chave PIX */}
            <div className="rounded-2xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/5 p-4">
              <p className="text-xs font-bold uppercase text-foreground/50">PIX CNPJ</p>
              <p className="mt-1 break-words text-lg font-black text-[#7eb5f5]">{sc.pix_key}</p>
            </div>

            {/* Dados bancários */}
            <div className="rounded-2xl border border-border/20 bg-background/30 p-3 text-xs text-foreground/50">
              <p>{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            </div>

            {/* Código copia e cola — mostra o trecho do código ativo */}
            {hasSpecificCode && (
              <div className="rounded-2xl border border-[#E8392A]/20 bg-[#E8392A]/5 p-3">
                <p className="text-xs font-black uppercase text-[#E8392A]/80 mb-1.5">
                  Código PIX{donationAmount ? ` · R$ ${donationAmount}` : ""}
                </p>
                <p className="font-mono text-[10px] break-all text-foreground/60 leading-relaxed">
                  {pixCode.slice(0, 80)}{pixCode.length > 80 ? "…" : ""}
                </p>
              </div>
            )}

            {/* Copiar */}
            <Button onClick={() => onCopyPix(donationAmount)} className="w-full rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
              <Copy /> {copied ? "Copiado ✓" : hasSpecificCode ? "Copiar Código PIX" : "Copiar Chave PIX"}
            </Button>

            <Button asChild variant="outline" className="w-full rounded-2xl border-[#E8392A]/40 text-[#E8392A] hover:bg-[#E8392A]/10">
              <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Chamar no WhatsApp</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
