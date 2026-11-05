"use client";

import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, ArrowRight, CalendarHeart, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Copy, Gift, HandHeart, Heart, LayoutDashboard, MapPin,
  Menu, MessageCircle, QrCode, Repeat, Sparkles, Star, Target,
  Trophy, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logoAsset from "@/assets/ameas-logo.png";
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
import { parseStringList, pick, type HeroSlide } from "@/lib/cms-schema";
import {
  BUILTIN_PHOTOS, DEFAULT_FIELD_IMAGES, defaultHeroSlides, getHeroSlides, resolveImage,
} from "@/lib/builtin-images";
import { STATIC_CATEGORIES, STATIC_GALLERY } from "@/lib/gallery-static";

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

const donationPresets = [25, 50, 100, 200];

/* ─── Componente principal ─── */
function AmeasHome() {
  const [sc, setSc] = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<GalleryCategory[]>([]);
  const [dbGalleryItems, setDbGalleryItems] = useState<Array<{ id: string; title: string; alt: string; image_url: string; category: string | null; sort_order: number; published: boolean }>>([]);
  const [donationOpen, setDonationOpen] = useState(false);
  const [dialogAmount, setDialogAmount] = useState<string | null>(null);
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

  // Número vem do painel (campo WhatsApp). Sem DDI, assume Brasil (55).
  const waDigits = sc.contact_whatsapp.replace(/\D/g, "");
  const whatsappNumber = waDigits.length >= 12 ? waDigits : `55${waDigits}`;

  const heroSlides = useMemo(() => {
    const active = getHeroSlides(sc).filter((x) => x.active);
    return active.length ? active : defaultHeroSlides(sc);
  }, [sc]);
  const heroIntervalRaw = Number(sc.hero_interval);
  const heroInterval = Number.isFinite(heroIntervalRaw) && heroIntervalRaw >= 0 ? heroIntervalRaw : 6;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, AMEAS! Quero apoiar a Associação Movimento Esporte Adaptado e Superação.")}`;
  const volunteerWhatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá, AMEAS! Quero ser voluntário(a).\nNome: ${volunteerForm.name}\nE-mail: ${volunteerForm.email}\nTelefone: ${volunteerForm.phone}\n${volunteerForm.message}`)}`;

  const visiblePartners = partners
    .map((p) => {
      const link = partnerLinks.find((l) => l.slug === p.slug);
      // Logo: prefer base64 saved from admin, then remote storage URL, then static asset
      const customLogo = pick(sc, `logo_b64_${p.slug}`) || p.remoteLogoUrl || null;
      return { ...p, website_url: link?.website_url || p.website_url, customLogo };
    })
    .filter((p) => !partnerLinks.length || partnerLinks.some((l) => l.slug === p.slug && l.published));

  // Junta fotos fixas do site + categorias/fotos do banco (respeitando as fotos ocultadas no painel)
  const hiddenStatic = sc.gallery_hidden;
  const activeEvents = useMemo(() => {
    const hidden = parseStringList(hiddenStatic);
    const cats = dynamicCategories.length ? dynamicCategories : STATIC_CATEGORIES.map((e) => ({
      id: e.id, label: e.label, color: e.color, sort_order: 0,
    }));

    return cats.map((cat) => {
      const staticImgs = STATIC_GALLERY
        .filter((img) => img.category === cat.id && !hidden.includes(img.title))
        .map((img) => ({ src: img.src, alt: img.alt, title: img.title, isDb: false }));
      const dbImgs = dbGalleryItems
        .filter((item) => item.category === cat.id)
        .map((item) => ({ src: item.image_url, alt: item.alt, title: item.title, isDb: true }));
      return { ...cat, images: [...staticImgs, ...dbImgs] };
    }).filter((ev) => ev.images.length > 0);
  }, [dynamicCategories, dbGalleryItems, hiddenStatic]);

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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 shadow-md">
              <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" />
            </span>
            <span className="gradient-text-blue text-sm font-black uppercase tracking-wider">AMEAS</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Navegação principal">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-body transition-all xl:text-[13px] hover:bg-[#1B4B8A]/10 hover:text-accent-blue">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="ghost" className="hidden text-xs text-body hover:text-accent-blue xl:inline-flex">
              <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            </Button>
            <Button size="sm" onClick={() => setDonationOpen(true)}
              className="hidden bg-[#d62f21] px-3 text-xs text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#d62f21]/90 hover:shadow-[#E8392A]/50 xl:inline-flex">
              <Heart className="h-3.5 w-3.5" /> Doar
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden px-2 text-soft hover:text-accent-blue xl:inline-flex" title="Painel admin">
              <a href="/admin" aria-label="Painel administrativo"><LayoutDashboard className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-body xl:hidden"
              onClick={() => setMenuOpen((c) => !c)} aria-label="Menu">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-xl xl:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-body hover:bg-[#1B4B8A]/10 hover:text-accent-blue">
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDonationOpen(true)} className="flex-1 bg-[#d62f21] text-xs text-white">
                  <Heart className="h-3.5 w-3.5" /> Doar Agora
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-soft">
                  <a href="/admin"><LayoutDashboard className="h-4 w-4" /></a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ══ HERO / CARROSSEL ══ */}
      <HeroCarousel slides={heroSlides} intervalSec={heroInterval} badge={sc.hero_badge} whatsappUrl={whatsappUrl} />

      {/* ══ SOBRE ══ */}
      <section id="sobre" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            {sc.about_kicker && <span className="section-kicker">{sc.about_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              {sc.about_title} <span className="gradient-text">{sc.about_title_hl}</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-body">
              {sc.about_p1 && <p>{sc.about_p1}</p>}
              {sc.about_text && <p>{sc.about_text}</p>}
              {sc.about_p3 && <p>{sc.about_p3}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="glass neon-border flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl p-3">
              <img src={resolveImage(sc.about_image) || DEFAULT_FIELD_IMAGES["about_image"]} alt="Comunidade AMEAS reunida" className="max-h-[360px] w-full object-contain" loading="lazy" />
            </figure>
            <div className="grid gap-4">
              <div className="glass-blue rounded-3xl p-5">
                <Sparkles className="h-7 w-7 text-accent-gold mb-3" />
                <p className="font-black text-foreground">{sc.about_card1_title}</p>
                <p className="mt-2 text-[15px] leading-6 text-body">{sc.about_card1_text}</p>
              </div>
              <div className="glass rounded-3xl border border-[#E8392A]/20 p-5">
                <CalendarHeart className="h-7 w-7 text-accent-red mb-3" />
                <p className="font-black text-foreground">{sc.about_card2_title}</p>
                <p className="mt-2 text-[15px] leading-6 text-body">{sc.about_card2_text}</p>
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
              <img src={resolveImage(sc.founder_image) || DEFAULT_FIELD_IMAGES["founder_image"]} alt={`${sc.founder_name}, fundadora da AMEAS`} className="max-h-[520px] w-full rounded-2xl object-contain" loading="lazy" />
            </div>
          </figure>
          <div>
            {sc.founder_kicker && <span className="section-kicker">{sc.founder_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">{sc.founder_name}</span></h2>
            {sc.founder_bio1 && <p className="mt-6 text-lg leading-8 text-body">{sc.founder_bio1}</p>}
            {sc.founder_bio2 && <p className="mt-4 text-lg leading-8 text-body">{sc.founder_bio2}</p>}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[sc.founder_tag1, sc.founder_tag2, sc.founder_tag3].filter(Boolean).map((item) => (
                <div key={item} className="glass-blue rounded-2xl border border-[#1B4B8A]/20 p-4 text-center text-sm font-bold text-accent-blue">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSÃO ══ */}
      <section id="missao" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {sc.mission_kicker && <span className="section-kicker">{sc.mission_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{sc.mission_title} <span className="gradient-text">{sc.mission_title_hl}</span></h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[Target, Trophy, Heart].map((Icon, i) => {
              const styles = [
                "border-[#1B4B8A]/30 bg-[#1B4B8A]/5 text-accent-blue",
                "border-[#38bdf8]/30 bg-[#38bdf8]/5 text-accent-cyan",
                "border-[#E8392A]/30 bg-[#E8392A]/5 text-accent-red",
              ];
              return (
                <div key={i} className={`glass neon-border rounded-3xl border p-7 ${styles[i]}`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5"><Icon /></span>
                  <p className="mt-4 text-xl font-black text-foreground">{pick(sc, `mvv${i + 1}_title`)}</p>
                  <p className="mt-3 text-[15px] leading-7 text-body">{pick(sc, `mvv${i + 1}_text`)}</p>
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
            {sc.services_kicker && <span className="section-kicker">{sc.services_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{sc.services_title} <span className="gradient-text">{sc.services_title_hl}</span></h2>
            {sc.services_desc && <p className="mt-5 text-lg leading-8 text-body">{sc.services_desc}</p>}
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Activity,      color: "text-accent-red", border: "border-[#E8392A]/20 bg-[#E8392A]/5" },
              { icon: Users,         color: "text-accent-blue", border: "border-[#1B4B8A]/20 bg-[#1B4B8A]/5" },
              { icon: Heart,         color: "text-accent-gold", border: "border-[#f59e0b]/20 bg-[#f59e0b]/5" },
              { icon: Sparkles,      color: "text-accent-green", border: "border-[#059669]/20 bg-[#059669]/5" },
              { icon: CalendarHeart, color: "text-accent-violet", border: "border-[#7c3aed]/20 bg-[#7c3aed]/5" },
              { icon: HandHeart,     color: "text-accent-cyan", border: "border-[#38bdf8]/20 bg-[#38bdf8]/5" },
            ].map(({ icon: Icon, color, border }, i) => (
              <div key={i} className={`glass neon-border rounded-3xl border p-7 ${border}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${color}`}><Icon /></span>
                <p className="mt-4 text-xl font-black text-foreground">{pick(sc, `service${i + 1}_title`)}</p>
                <p className="mt-3 text-[15px] leading-7 text-body">{pick(sc, `service${i + 1}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAMÍLIAS ══ */}
      <section id="familias" className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,75,138,.12), transparent), var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {sc.families_kicker && <span className="section-kicker">{sc.families_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              {sc.families_title} <span className="gradient-text">{sc.families_title_hl}</span>
            </h2>
            {sc.families_desc && <p className="mt-5 text-lg leading-8 text-body">{sc.families_desc}</p>}
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Heart,    border: "border-[#E8392A]/20 bg-[#E8392A]/5", iconCls: "text-accent-red" },
              { icon: Users,    border: "border-[#1B4B8A]/20 bg-[#1B4B8A]/5", iconCls: "text-accent-blue" },
              { icon: Activity, border: "border-[#f59e0b]/20 bg-[#f59e0b]/5", iconCls: "text-accent-gold" },
            ].map(({ icon: Icon, border, iconCls }, i) => (
              <div key={i} className={`glass neon-border rounded-3xl border p-7 ${border}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${iconCls}`}><Icon /></span>
                <p className="mt-4 text-xl font-black text-foreground">{pick(sc, `fam${i + 1}_title`)}</p>
                <p className="mt-3 text-[15px] leading-7 text-body">{pick(sc, `fam${i + 1}_text`)}</p>
              </div>
            ))}
          </div>
          {(sc.families_box_title || sc.families_box_text) && (
            <div className="mt-8 rounded-3xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/10 p-8 backdrop-blur">
              {sc.families_box_title && <p className="text-lg font-bold text-foreground">{sc.families_box_title}</p>}
              {sc.families_box_text && <p className="mt-3 text-[15px] leading-7 text-body">{sc.families_box_text}</p>}
            </div>
          )}
        </div>
      </section>

      {/* ══ COMO AJUDAR ══ */}
      <section id="ajudar" className="bg-donation-pattern py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {sc.help_kicker && <span className="section-kicker">{sc.help_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">{sc.help_title}</span></h2>
            {sc.help_desc && <p className="mt-5 text-lg leading-8 text-body">{sc.help_desc}</p>}
          </div>

          <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
            {/* Apoiador Mensal */}
            <div className="glass neon-border rounded-3xl border border-[#1B4B8A]/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4B8A]/15 text-accent-blue"><Repeat /></span>
              <p className="mt-4 text-2xl font-black text-foreground">{sc.monthly_title}</p>
              <p className="mt-1 text-3xl font-black text-accent-blue">R$ 30<span className="text-base font-bold text-soft">/mês</span></p>
              <ul className="mt-5 space-y-3 text-sm text-body">
                {[sc.monthly_b1, sc.monthly_b2, sc.monthly_b3].filter(Boolean).map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />{item}</li>
                ))}
              </ul>
              <Button onClick={() => { setDialogAmount("30"); setDonationOpen(true); }} className="mt-6 w-full rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
                <QrCode /> Doar via PIX
              </Button>
            </div>

            {/* Doação Única */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1B4B8A]/50 bg-gradient-to-br from-[#1B4B8A] to-[#0d2a52] p-7 shadow-2xl glow-blue backdrop-blur lg:-mt-4">
              {sc.donation_badge && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#fbbf24] px-3 py-1 text-xs font-black text-[#3b2600]">
                  <Star className="h-3 w-3" /> {sc.donation_badge}
                </div>
              )}
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white"><Gift /></span>
              <p className="mt-4 text-2xl font-black text-white">{sc.donation_title}</p>
              <p className="mt-1 text-3xl font-black text-white">R$ {donationAmount || "0"}<span className="text-base font-bold text-white/85"> por doação</span></p>
              <div className="mt-5 flex flex-wrap gap-2">
                {donationPresets.map((v) => (
                  <button key={v} onClick={() => setDonationAmount(String(v))}
                    className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${donationAmount === String(v) ? "border-[#f59e0b] bg-[#f59e0b] text-black" : "border-white/40 text-white hover:border-white/60"}`}>
                    R$ {v}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="valor-livre" className="text-xs font-bold uppercase text-white/85">Valor livre</label>
                <input id="valor-livre" inputMode="numeric" value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value.replace(/\D/g, ""))} placeholder="Digite o valor"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-2 text-base font-bold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-[#7eb5f5]" />
              </div>
              <Button onClick={() => setDonationOpen(true)} className="mt-5 w-full rounded-2xl bg-[#d62f21] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#d62f21]/90">
                <Heart /> Doar R$ {donationAmount || "0"} via PIX
              </Button>
              <p className="mt-3 text-center text-xs text-white/85">{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            </div>

            {/* Voluntário */}
            <div className="glass neon-border rounded-3xl border border-[#E8392A]/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8392A]/15 text-accent-red"><HandHeart /></span>
              <p className="mt-4 text-2xl font-black text-foreground">{sc.volunteer_title}</p>
              <p className="mt-3 text-[15px] leading-7 text-body">{sc.volunteer_desc}</p>
              <Button onClick={() => setVolunteerOpen(true)} className="mt-6 w-full rounded-2xl bg-[#d62f21] text-white hover:bg-[#d62f21]/90">
                <MessageCircle /> Quero ser voluntário(a)
              </Button>
              <Button asChild variant="outline" className="mt-3 w-full rounded-2xl border-accent-blue/50 text-accent-blue hover:bg-[#1B4B8A]/10">
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
            {sc.vol_kicker && <span className="section-kicker">{sc.vol_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{sc.vol_title} <span className="gradient-text">{sc.vol_title_hl}</span></h2>
            {sc.vol_desc && <p className="mt-5 text-lg leading-8 text-body">{sc.vol_desc}</p>}
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-center">
            {/* Cards de formas de contribuir */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Activity,      color: "text-accent-red", border: "border-[#E8392A]/20" },
                { icon: Heart,         color: "text-accent-gold", border: "border-[#f59e0b]/20" },
                { icon: Users,         color: "text-accent-blue", border: "border-[#1B4B8A]/20" },
                { icon: CalendarHeart, color: "text-accent-green", border: "border-[#059669]/20" },
              ].map(({ icon: Icon, color, border }, i) => (
                <div key={i} className={`glass rounded-2xl border p-5 ${border}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${color}`}><Icon className="h-5 w-5" /></span>
                  <p className="mt-3 font-black text-foreground">{pick(sc, `vol${i + 1}_title`)}</p>
                  <p className="mt-2 text-[15px] leading-6 text-body">{pick(sc, `vol${i + 1}_desc`)}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1B4B8A]/40 bg-gradient-to-br from-[#1B4B8A] to-[#0d2a52] p-8 shadow-2xl glow-blue backdrop-blur text-center">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#E8392A]/10 blur-3xl" />
              <span className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white mb-5">
                <HandHeart className="h-8 w-8" />
              </span>
              <p className="text-2xl font-black text-white">{sc.vol_cta_title}</p>
              <p className="mt-3 text-sm leading-7 text-white/85">{sc.vol_cta_text}</p>
              <Button asChild size="lg"
                className="mt-7 w-full rounded-2xl bg-[#25D366] font-bold text-[#04291a] shadow-lg shadow-[#25D366]/30 hover:bg-[#25D366]/90 hover:shadow-[#25D366]/50">
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, AMEAS! Tenho interesse em ser voluntário(a). Gostaria de saber como posso contribuir.")}`}
                  target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" /> {sc.vol_cta_button}
                </a>
              </Button>
              {sc.vol_cta_note && <p className="mt-4 text-xs text-white/85">{sc.vol_cta_note}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PARCEIROS ══ */}
      <section id="parceiros" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {sc.partners_kicker && <span className="section-kicker">{sc.partners_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{sc.partners_title} <span className="gradient-text">{sc.partners_title_hl}</span></h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {visiblePartners.map((p) => (
              <a key={p.name} href={p.website_url || undefined} target={p.website_url ? "_blank" : undefined}
                rel={p.website_url ? "noreferrer" : undefined}
                onClick={(e) => !p.website_url && e.preventDefault()}
                className="glass neon-border group flex flex-col items-center gap-3 rounded-3xl border border-border/40 p-5 text-center transition-all hover:border-[#1B4B8A]/40">
                <span className="flex h-20 w-full items-center justify-center rounded-2xl bg-white p-2">
                  <img
                    src={p.customLogo ?? p.logo}
                    alt={`Logo de ${p.name}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = p.logo; }}
                  />
                </span>
                <span className="text-xs font-black uppercase leading-snug text-body group-hover:text-accent-blue transition-colors">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALERIA ══ */}
      <section id="galeria" className="py-20 sm:py-24" style={{background:"var(--color-secondary)"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {sc.gallery_kicker && <span className="section-kicker">{sc.gallery_kicker}</span>}
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">{sc.gallery_title} <span className="gradient-text">{sc.gallery_title_hl}</span></h2>
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
                      <span className="text-sm font-black text-foreground">{ev.label}</span>
                      <ArrowRight className="h-4 w-4 text-accent-blue transition-transform group-hover:translate-x-1" />
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
                      className="flex items-center gap-2 rounded-2xl border border-border/40 px-4 py-2 text-sm font-bold text-body transition-all hover:border-[#1B4B8A]/40 hover:text-accent-blue">
                      <ArrowRight className="h-4 w-4 rotate-180" /> Todos os eventos
                    </button>
                    <span className={`rounded-full px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow ${ev.color}`}>
                      {ev.label}
                    </span>
                    <span className="text-sm text-soft">{ev.images.length} foto{ev.images.length !== 1 ? "s" : ""}</span>
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
                          <span className="text-sm font-black text-foreground">{img.title}</span>
                          <ArrowRight className="h-4 w-4 text-accent-blue transition-transform group-hover:translate-x-1" />
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
            {sc.test_kicker && <span className="section-kicker">{sc.test_kicker}</span>}
            <h2 id="dep-title" className="mt-4 text-3xl font-black sm:text-4xl">{sc.test_title} <span className="gradient-text">{sc.test_title_hl}</span></h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              { quote: sc.test1_quote, author: sc.test1_author, border: "border-[#1B4B8A]/20" },
              { quote: sc.test2_quote, author: sc.test2_author, border: "border-[#38bdf8]/20" },
              { quote: sc.test3_quote, author: sc.test3_author, border: "border-[#E8392A]/20" },
            ].map((t, i) => (
              <div key={i} className={`glass neon-border rounded-3xl border p-7 ${t.border}`}>
                <div className="flex gap-1 text-accent-gold mb-4">
                  <Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" />
                </div>
                <blockquote className="text-base font-semibold leading-8 text-foreground">"{t.quote}"</blockquote>
                <p className="mt-4 text-sm font-black text-accent-blue">{t.author}</p>
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
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-md">
                <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" loading="lazy" />
              </span>
              <div>
                <p className="gradient-text-blue text-xl font-black">AMEAS</p>
                <p className="text-xs text-soft">{sc.footer_org}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-body">{sc.footer_desc}</p>
          </div>
          <div className="space-y-3 text-sm text-body">
            <p className="font-black text-foreground">Contato</p>
            <a className="flex items-center gap-2 hover:text-accent-blue transition-colors" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> {sc.contact_whatsapp}
            </a>
            {sc.instagram_url && (
              <a className="flex items-center gap-2 hover:text-accent-blue transition-colors" href={sc.instagram_url} target="_blank" rel="noreferrer">
                <InstagramIcon className="h-4 w-4" /> Instagram
              </a>
            )}
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {sc.footer_location}</p>
          </div>
          <div className="space-y-3 text-sm text-body">
            <p className="font-black text-foreground">Doações</p>
            <p>PIX CNPJ {sc.pix_key}</p>
            <p>{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            <Button onClick={() => setDonationOpen(true)} className="rounded-2xl bg-[#d62f21] text-white shadow-md shadow-[#E8392A]/25 hover:bg-[#d62f21]/90">
              <Heart /> Doar Agora
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border/20 px-4 pt-6 text-xs text-soft sm:px-6 lg:px-8">
          © {year} AMEAS. Todos os direitos reservados.
        </div>
      </footer>

      {/* Botão flutuante */}
      <Button onClick={() => setDonationOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-[#d62f21] px-5 text-white shadow-xl shadow-[#E8392A]/30 donation-pulse hover:bg-[#d62f21]/90 hover:shadow-[#E8392A]/50"
        aria-label="Fazer doação">
        <Heart /> Fazer Doação
      </Button>

      {/* ══ MODAL: DOAÇÃO ══ */}
      <DonationDialog open={donationOpen} onOpenChange={(o) => { setDonationOpen(o); if (!o) setDialogAmount(null); }} copied={copied} onCopyPix={copyPix} sc={sc} whatsappUrl={whatsappUrl} donationAmount={dialogAmount ?? donationAmount} />

      {/* ══ MODAL: VOLUNTÁRIO ══ */}
      <Dialog open={volunteerOpen} onOpenChange={setVolunteerOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto rounded-3xl border border-[#1B4B8A]/20 bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HandHeart className="text-accent-red" /> <span className="gradient-text">Seja Voluntário(a)</span>
            </DialogTitle>
            <DialogDescription className="text-soft">Preencha o formulário e entraremos em contato.</DialogDescription>
          </DialogHeader>
          {volunteerSent ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-accent-green mb-4" />
              <p className="text-lg font-black text-foreground">Mensagem enviada!</p>
              <p className="mt-2 text-sm text-body">Em breve a AMEAS entrará em contato com você.</p>
              <Button onClick={() => { setVolunteerOpen(false); setVolunteerSent(false); }} className="mt-6 rounded-2xl bg-[#d62f21] text-white">Fechar</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-soft">Nome completo *</label>
                  <input value={volunteerForm.name} onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    placeholder="Seu nome" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-soft">E-mail *</label>
                  <input type="email" value={volunteerForm.email} onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                    placeholder="seu@email.com" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-soft">Telefone / WhatsApp</label>
                <input value={volunteerForm.phone} onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                  placeholder="(11) 99999-9999" className="w-full rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-soft">Como quer ajudar?</label>
                <textarea rows={3} value={volunteerForm.message} onChange={(e) => setVolunteerForm({ ...volunteerForm, message: e.target.value })}
                  placeholder="Conte um pouco sobre você e sua disponibilidade…"
                  className="w-full resize-none rounded-2xl border border-border/40 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-[#1B4B8A]/50" />
              </div>
              <div className="flex gap-3">
                <Button asChild className="flex-1 rounded-2xl bg-[#d62f21] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#d62f21]/90"
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
            <DialogDescription className="text-soft">{selectedImage?.alt}</DialogDescription>
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
            <Heart className="text-accent-red" /> <span className="gradient-text">Apoie a AMEAS</span>
          </DialogTitle>
          <DialogDescription className="text-soft">Sua doação fortalece esporte adaptado, inclusão e acolhimento.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
          {/* QR Code real */}
          <div className="mx-auto w-full max-w-52">
            <div className="overflow-hidden rounded-2xl border border-[#1B4B8A]/20 bg-white p-2 shadow-lg">
              <img src={resolveImage(sc.pix_qr_image) || DEFAULT_FIELD_IMAGES["pix_qr_image"]} alt="QR Code PIX AMEAS" className="h-full w-full object-contain" />
            </div>
            <p className="mt-2 text-center text-xs font-bold uppercase text-soft">Escaneie para pagar</p>
          </div>

          <div className="space-y-3">
            {/* Chave PIX */}
            <div className="rounded-2xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/5 p-4">
              <p className="text-xs font-bold uppercase text-soft">PIX CNPJ</p>
              <p className="mt-1 break-words text-lg font-black text-accent-blue">{sc.pix_key}</p>
            </div>

            {/* Dados bancários */}
            <div className="rounded-2xl border border-border/20 bg-background/30 p-3 text-xs text-soft">
              <p>{sc.pix_bank} · Ag. {sc.pix_agency} · CC {sc.pix_account}</p>
            </div>

            {/* Código copia e cola — mostra o trecho do código ativo */}
            {hasSpecificCode && (
              <div className="rounded-2xl border border-[#E8392A]/20 bg-[#E8392A]/5 p-3">
                <p className="text-xs font-black uppercase text-accent-red mb-1.5">
                  Código PIX{donationAmount ? ` · R$ ${donationAmount}` : ""}
                </p>
                <p className="font-mono text-[11px] break-all text-body leading-relaxed">
                  {pixCode.slice(0, 80)}{pixCode.length > 80 ? "…" : ""}
                </p>
              </div>
            )}

            {/* Copiar */}
            <Button onClick={() => onCopyPix(donationAmount)} className="w-full rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
              <Copy /> {copied ? "Copiado ✓" : hasSpecificCode ? "Copiar Código PIX" : "Copiar Chave PIX"}
            </Button>

            <Button asChild variant="outline" className="w-full rounded-2xl border-accent-red/50 text-accent-red hover:bg-[#E8392A]/10">
              <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Chamar no WhatsApp</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Carrossel do topo ─── */
function HeroCarousel({ slides, intervalSec, badge, whatsappUrl }: {
  slides: HeroSlide[]; intervalSec: number; badge: string; whatsappUrl: string;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const fallbackPhoto = BUILTIN_PHOTOS["treino"]?.src ?? "";

  useEffect(() => { if (idx >= count) setIdx(0); }, [count, idx]);

  useEffect(() => {
    if (count < 2 || paused || intervalSec <= 0) return;
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % count), intervalSec * 1000);
    return () => window.clearTimeout(id);
  }, [idx, count, paused, intervalSec]);

  if (!count) return null;
  const go = (n: number) => setIdx(((n % count) + count) % count);
  const cur = slides[idx] ?? slides[0];
  if (!cur) return null;
  const external = /^https?:\/\//i.test(cur.cta_link);

  return (
    <section id="inicio" className="relative overflow-hidden bg-hero-pattern"
      aria-roledescription="carrossel" aria-label="Destaques da AMEAS"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#1B4B8A]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-[#E8392A]/10 blur-3xl" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        {/* Texto do slide */}
        <div className="max-w-2xl" aria-live={paused ? "polite" : "off"}>
          {badge && (
            <Badge className="border border-[#1B4B8A]/30 bg-[#1B4B8A]/10 px-3 py-1 text-accent-blue hover:bg-[#1B4B8A]/20">{badge}</Badge>
          )}
          <div key={cur.id} className="animate-in fade-in slide-in-from-bottom-3 duration-700 lg:min-h-[300px]">
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">{cur.title}</span>
            </h1>
            {cur.subtitle && <p className="mt-5 text-lg leading-8 text-body">{cur.subtitle}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {cur.cta_label && cur.cta_link && (
                <Button asChild size="lg" className="rounded-2xl bg-[#d62f21] text-white shadow-lg shadow-[#E8392A]/30 hover:bg-[#d62f21]/90 hover:shadow-[#E8392A]/50">
                  <a href={cur.cta_link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                    <Heart aria-hidden="true" /> {cur.cta_label}
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-accent-blue/50 text-accent-blue hover:bg-[#1B4B8A]/10">
                <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> WhatsApp</a>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-body">
            {["Inclusão", "Acolhimento", "Superação"].map((t) => (
              <span key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-red" /> {t}</span>
            ))}
          </div>
        </div>

        {/* Foto do slide (troca com fade) */}
        <div>
          <div className="glass neon-border relative h-[320px] overflow-hidden rounded-3xl shadow-2xl sm:h-[440px] lg:h-[520px]">
            {slides.map((sl, i) => (
              <img key={sl.id} src={resolveImage(sl.image) || fallbackPhoto}
                alt={i === idx ? sl.title : ""} aria-hidden={i !== idx}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-contain p-3 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`} />
            ))}
          </div>
          {count > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={() => go(idx - 1)} aria-label="Slide anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-blue/50 text-accent-blue hover:bg-[#1B4B8A]/20"><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-2" role="tablist" aria-label="Escolher slide">
                {slides.map((sl, i) => (
                  <button key={sl.id} role="tab" aria-selected={i === idx} aria-label={`Slide ${i + 1}`} onClick={() => go(i)}
                    className={`h-2.5 rounded-full transition-all ${i === idx ? "w-8 bg-[#E8392A]" : "w-2.5 bg-foreground/35 hover:bg-foreground/60"}`} />
                ))}
              </div>
              <button onClick={() => go(idx + 1)} aria-label="Próximo slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-blue/50 text-accent-blue hover:bg-[#1B4B8A]/20"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl justify-center px-4 pb-10 sm:px-6 lg:px-8">
        <a href="#sobre" className="inline-flex items-center gap-2 text-sm font-semibold text-soft hover:text-accent-blue transition-colors">
          Conheça a associação <ChevronDown className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
