"use client";

import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Gift,
  HandHeart,
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  QrCode,
  Repeat,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { defaultSiteContent, getPartnerLinks, getSiteContent, type PartnerLink, type SiteContent } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AMEAS | Esporte Adaptado e Superação" },
      { name: "description", content: "Site institucional da AMEAS, associação que promove inclusão, acolhimento e superação por meio do esporte adaptado." },
      { property: "og:title", content: "AMEAS | Esporte Adaptado e Superação" },
      { property: "og:description", content: "Conheça a AMEAS, sua fundadora Karina Meneguini, projetos, parceiros e formas de apoiar o esporte adaptado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AmeasHome,
});

const whatsappNumber = "5511999433480";
const whatsappDisplay = "(11) 99943-3480";
const pixKey = "34017976/0001-99";
const donationMessage = encodeURIComponent("Olá, AMEAS! Quero apoiar a Associação Movimento Esporte Adaptado e Superação.");
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${donationMessage}`;

const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#familias", label: "Famílias" },
  { href: "#fundadora", label: "Fundadora" },
  { href: "#missao", label: "Missão" },
  { href: "#galeria", label: "Galeria" },
  { href: "#ajudar", label: "Apoiar" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#contato", label: "Contato" },
];

const primaryHeroImage = { src: treinoAdaptadoAsset, alt: "Atletas da AMEAS em treino adaptado com halteres no CrossFit" };
const heroImages = [
  primaryHeroImage,
  { src: corridaAdaptadaAsset, alt: "Atleta da AMEAS em triciclo adaptado durante atividade ao ar livre" },
  { src: crossfitGrupoAsset, alt: "Grupo da AMEAS reunido em atividade de CrossFit adaptado" },
];

const galleryImages = [
  { src: parceirosBannerAsset, alt: "Banner comemorativo com parceiros e patrocinadores da AMEAS", title: "Parceiros AMEAS" },
  { src: acolhimentoCafeAsset, alt: "Grupo da AMEAS reunido em momento de acolhimento no Empório QN", title: "Acolhimento" },
  { src: corridaAdaptadaAsset, alt: "Atleta em triciclo adaptado acompanhado durante atividade esportiva", title: "Esporte adaptado" },
  { src: parceriaTiaLinaAsset, alt: "Participantes da AMEAS em ação de parceria na Tia Lina", title: "Parcerias locais" },
  { src: encontroComunidadeAsset, alt: "Grande grupo da AMEAS reunido com banner institucional", title: "Comunidade" },
  { src: crossfitGrupoAsset, alt: "Equipe AMEAS em encontro esportivo no CrossFit", title: "Treino coletivo" },
  { src: acaoSolidariaAsset, alt: "Grupo da AMEAS reunido em ação solidária", title: "Ação solidária" },
  { src: treinoAdaptadoAsset, alt: "Duas mulheres da AMEAS realizando treino adaptado", title: "Superação em treino" },
  { src: karinaAsset, alt: "Retrato oficial de Karina Meneguini, fundadora da AMEAS", title: "Karina Meneguini" },
  { src: logoAsset, alt: "Logo oficial da AMEAS", title: "Marca AMEAS" },
];

const values = [
  { icon: Target, title: "Missão", text: "Promover inclusão, autonomia e qualidade de vida por meio do esporte adaptado, criando caminhos reais de participação social." },
  { icon: Trophy, title: "Visão", text: "Ser referência regional em esporte adaptado, acolhimento e oportunidades para pessoas com deficiência e suas famílias." },
  { icon: Heart, title: "Valores", text: "Respeito, empatia, superação, compromisso, transparência, colaboração e amor pelo desenvolvimento humano." },
];

const partners = [
  { slug: "rua-hum", name: "Rua Hum", logo: sponsorRuaHumAsset },
  { slug: "escola-aquarela", name: "Escola Aquarela", logo: sponsorEscolaAquarelaAsset },
  { slug: "ibicolor", name: "Ibicolor", logo: sponsorIbicolorAsset },
  { slug: "vila-don-patto", name: "Vila Don Patto", logo: sponsorVilaDonPattoAsset },
  { slug: "unimed-sao-roque", name: "Unimed São Roque", logo: sponsorUnimedAsset },
  { slug: "emporio-qn", name: "Empório QN", logo: sponsorEmporioQnAsset },
  { slug: "tia-lina", name: "Tia Lina", logo: sponsorTiaLinaAsset },
  { slug: "fernando-araujo", name: "Fernando Araújo Artista Plástico", logo: sponsorFernandoAraujoAsset },
  { slug: "qualiser", name: "Qualiser Contabilidade", logo: sponsorQualiserAsset },
  { slug: "jornal-da-economia", name: "Jornal da Economia", logo: sponsorJornalEconomiaAsset },
];

const testimonials = [
  { quote: "A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos.", author: "Família atendida" },
  { quote: "Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto.", author: "Parceiro institucional" },
  { quote: "Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas.", author: "Atleta AMEAS" },
];

const donationPresets = [25, 50, 100, 200];

const qrCells = [
  0,1,2,3,4,5,6,8,10,12,14,16,18,20,22,24,25,26,27,28,29,30,33,35,37,39,40,42,44,46,48,50,51,52,53,54,55,56,
  60,61,63,65,67,69,72,75,76,78,80,82,84,86,87,88,91,93,95,96,98,100,104,105,106,108,111,113,115,118,120,121,
  122,124,126,128,130,132,133,135,137,139,140,141,144,147,149,151,153,155,157,160,162,164,166,168,170,172,174,
  176,177,178,180,184,186,188,190,192,194,196,198,200,201,202,203,204,205,206,208,211,213,215,217,219,221,223,
  225,226,228,230,232,234,236,238,240,242,244,245,246,247,248,249,250,252,254,256,258,260,262,264,266,268,270,
  272,273,274,275,276,277,278,280,282,284,287,289,291,293,295,297,299,301,303,304,305,306,307,308,309,310,314,
  316,318,320,322,324,326,329,331,333,335,337,339,341,342,344,346,348,350,352,354,356,358,360,
];

function AmeasHome() {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>([]);
  const [donationOpen, setDonationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[number] | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [donationAmount, setDonationAmount] = useState("50");

  useEffect(() => {
    getSiteContent().then(setSiteContent);
    getPartnerLinks().then(setPartnerLinks);
  }, []);

  const visiblePartners = partners
    .map((p) => ({ ...p, website_url: partnerLinks.find((l) => l.slug === p.slug)?.website_url ?? "" }))
    .filter((p) => !partnerLinks.length || partnerLinks.some((l) => l.slug === p.slug && l.published));

  const year = useMemo(() => new Date().getFullYear(), []);

  const copyPix = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex shrink-0 items-center gap-2.5" aria-label="Ir para o início">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 p-1 shadow-sm glow-purple">
              <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" />
            </span>
            <span className="gradient-text-purple text-sm font-black uppercase tracking-wider">AMEAS</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground/70 transition-all hover:bg-primary/10 hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="ghost" className="hidden text-xs text-foreground/60 hover:text-primary lg:inline-flex">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </Button>
            <Button size="sm" onClick={() => setDonationOpen(true)}
              className="hidden bg-gradient-to-r from-pink-500 to-purple-600 px-3 text-xs text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 lg:inline-flex">
              <Heart className="h-3.5 w-3.5" /> Doar
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden px-2 text-foreground/40 hover:text-primary lg:inline-flex" title="Painel admin">
              <a href="/admin" aria-label="Painel administrativo"><LayoutDashboard className="h-4 w-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 lg:hidden"
              onClick={() => setMenuOpen((c) => !c)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={handleNavClick}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-primary/10 hover:text-primary">
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDonationOpen(true)} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-xs text-white">
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

      {/* ─── HERO ─── */}
      <section id="inicio" className="relative overflow-hidden bg-hero-pattern">
        {/* Orbs decorativos */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-pink-500/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/2 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Badge className="border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300 hover:bg-purple-500/20">
              Associação Movimento Esporte Adaptado e Superação
            </Badge>
            <h1 className="mt-6 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
              <span className="gradient-text">AMEAS</span>
            </h1>
            <p className="mt-4 text-2xl font-bold leading-snug text-foreground/90 sm:text-3xl">{siteContent.hero_title}</p>
            <p className="mt-5 text-lg leading-8 text-foreground/60">{siteContent.hero_subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                <a href="#ajudar"><Heart aria-hidden="true" /> Fazer Doação</a>
              </Button>
              <Button asChild size="lg" variant="outline"
                className="rounded-2xl border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-foreground/60">
              <span className="flex items-center gap-2"><CheckCircle2 className="text-neon-green h-4 w-4" /> Inclusão</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="text-neon-green h-4 w-4" /> Acolhimento</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="text-neon-green h-4 w-4" /> Superação</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <figure className="glass neon-border relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-3xl p-3 shadow-2xl">
              <img src={primaryHeroImage.src} alt={primaryHeroImage.alt} className="max-h-[520px] w-full object-contain" loading="eager" />
            </figure>
            <div className="grid gap-4">
              {heroImages.slice(1).map((image) => (
                <figure key={image.src} className="glass flex min-h-[160px] items-center justify-center overflow-hidden rounded-2xl p-3">
                  <img src={image.src} alt={image.alt} className="max-h-60 w-full object-contain" />
                </figure>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl justify-center px-4 pb-10 sm:px-6 lg:px-8">
          <a href="#sobre" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/40 hover:text-primary transition-colors">
            Conheça a associação <ChevronDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ─── SOBRE ─── */}
      <section id="sobre" className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="section-kicker">Sobre a Associação</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Movimento, esporte e acolhimento para <span className="gradient-text">transformar vidas.</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-foreground/60">
              <p>A AMEAS nasceu do compromisso com a inclusão e com a superação diária de pessoas que encontram no esporte adaptado um espaço de desenvolvimento, amizade e conquista.</p>
              <p>A associação promove atividades que unem cuidado, convivência e prática esportiva, valorizando cada trajetória e fortalecendo atletas, famílias, voluntários e parceiros.</p>
              <p>Mais do que treinos, a AMEAS constrói uma rede de apoio em que cada pessoa é vista, respeitada e incentivada a alcançar novas possibilidades.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="glass neon-border flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl p-3">
              <img src={encontroComunidadeAsset} alt="Comunidade AMEAS reunida" className="max-h-[360px] w-full object-contain" loading="lazy" />
            </figure>
            <div className="grid gap-4">
              <div className="glass-purple rounded-3xl p-5">
                <Sparkles className="h-7 w-7 text-gold mb-3" />
                <p className="font-black text-foreground">Impacto humano</p>
                <p className="mt-2 text-sm leading-6 text-foreground/60">Inclusão que começa no treino e alcança a autoestima, a família e a comunidade.</p>
              </div>
              <div className="glass rounded-3xl border border-pink-500/20 p-5">
                <CalendarHeart className="h-7 w-7 text-heart mb-3" />
                <p className="font-black text-foreground">Presença contínua</p>
                <p className="mt-2 text-sm leading-6 text-foreground/60">Projetos, encontros e ações que mantêm o esporte adaptado vivo e acessível.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAMÍLIAS ─── */}
      <section id="familias" className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,.08), transparent), #0d0d14"}}>
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
              { icon: Heart, label: "Suporte psicológico", color: "text-heart", bg: "bg-pink-500/10 border-pink-500/20", text: "Espaço de escuta e acolhimento emocional para mães, pais e responsáveis enfrentarem os desafios da rotina com mais apoio e segurança." },
              { icon: Users, label: "Assistência social", color: "text-primary", bg: "bg-purple-500/10 border-purple-500/20", text: "Orientação e encaminhamentos para fortalecer o acesso das famílias a direitos, serviços e oportunidades na comunidade." },
              { icon: Activity, label: "Pilates para as mães", color: "text-gold", bg: "bg-amber-500/10 border-amber-500/20", text: "Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o corpo, descanso e fortalecimento." },
            ].map(({ icon: Icon, label, color, bg, text }) => (
              <div key={label} className={`glass neon-border rounded-3xl border p-7 ${bg}`}>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${color}`}><Icon /></span>
                <p className="mt-4 text-xl font-black text-foreground">{label}</p>
                <p className="mt-3 text-sm leading-7 text-foreground/60">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-pink-900/20 p-8 backdrop-blur">
            <p className="text-lg font-bold text-foreground">Na AMEAS, atletas e famílias caminham juntos: o esporte abre caminhos e a assistência social sustenta a rede de apoio.</p>
            <p className="mt-3 text-sm leading-7 text-foreground/50">Todas essas ações são realizadas com a dedicação de voluntários e parceiros que doam tempo, conhecimento e cuidado para transformar vidas.</p>
          </div>
        </div>
      </section>

      {/* ─── FUNDADORA ─── */}
      <section id="fundadora" className="py-20 sm:py-24" style={{background:"linear-gradient(135deg, #0a0a0f 0%, #120d1f 50%, #0a0a0f 100%)"}}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <figure className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 blur-2xl" aria-hidden="true" />
            <div className="glass-purple relative overflow-hidden rounded-3xl border border-purple-500/30 p-4 shadow-2xl glow-purple">
              <img src={karinaAsset} alt="Karina Meneguini, fundadora da AMEAS" className="max-h-[520px] w-full rounded-2xl object-contain" loading="lazy" />
            </div>
          </figure>
          <div>
            <span className="section-kicker">Fundadora</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">Karina Meneguini</span></h2>
            <p className="mt-6 text-lg leading-8 text-foreground/70">
              Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de superação.
            </p>
            <p className="mt-4 text-lg leading-8 text-foreground/70">
              À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Dedicação", "Liderança transformadora", "Inclusão com afeto"].map((item) => (
                <div key={item} className="glass-purple rounded-2xl border border-purple-500/20 p-4 text-center text-sm font-bold text-primary">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSÃO ─── */}
      <section id="missao" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Missão, Visão e Valores</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Princípios que orientam cada treino, encontro e <span className="gradient-text">conquista.</span></h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map((item, i) => {
              const Icon = item.icon;
              const colors = ["border-purple-500/30 bg-purple-500/5", "border-cyan-500/30 bg-cyan-500/5", "border-pink-500/30 bg-pink-500/5"];
              const iconColors = ["text-primary", "text-neon", "text-heart"];
              return (
                <div key={item.title} className={`glass neon-border rounded-3xl border p-7 ${colors[i]}`}>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${iconColors[i]}`}><Icon /></span>
                  <p className="mt-4 text-xl font-black text-foreground">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-foreground/60">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ORGANOGRAMA ─── */}
      <section className="py-20 sm:py-24" style={{background:"radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,.1), transparent), #0d0d14"}} aria-labelledby="organograma-title">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="section-kicker">Organograma</span>
            <h2 id="organograma-title" className="mt-4 text-3xl font-black sm:text-4xl">
              Uma rede organizada para <span className="gradient-text">cuidar e apoiar.</span>
            </h2>
          </div>

          {/* Presidente */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-900/80 to-purple-800/60 px-6 py-5 text-center shadow-xl glow-purple backdrop-blur">
              <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-purple-400/50 shadow-lg glow-purple">
                <img src={karinaAsset} alt="Karina Meneguini" className="h-full w-full object-cover object-top" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/80">Presidente</p>
              <p className="mt-0.5 text-base font-black text-white">Karina Meneguini</p>
            </div>
            <div className="org-line-v h-8" aria-hidden="true" />
          </div>

          {/* Vice */}
          <div className="flex flex-col items-center">
            <div className="w-64 rounded-3xl border border-border/50 bg-card/80 px-6 py-5 text-center shadow-md backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-widest text-heart">Vice-Presidente</p>
              <p className="mt-0.5 text-base font-black text-foreground">Diretoria Executiva</p>
            </div>
            <div className="org-line-v h-8" aria-hidden="true" />
          </div>

          {/* Linha horizontal */}
          <div className="relative flex items-start justify-center" aria-hidden="true">
            <div className="org-line-h w-2/3" />
          </div>

          {/* 3 colunas */}
          <div className="mt-0 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { dept: "Secretaria", color: "text-purple-400", border: "border-purple-500/25", cargo1: "Primeiro Secretário", nome1: "Secretário(a) Geral", cargo2: "Segundo Secretário", nome2: "Secretário(a) Adjunto(a)" },
              { dept: "Tesouraria", color: "text-cyan-400", border: "border-cyan-500/25", cargo1: "Primeiro Tesoureiro", nome1: "Tesoureiro(a) Geral", cargo2: "Segundo Tesoureiro", nome2: "Tesoureiro(a) Adjunto(a)" },
              { dept: "Fiscalização", color: "text-pink-400", border: "border-pink-500/25", cargo1: "Primeiro Fiscal", nome1: "Fiscal Geral", cargo2: "Segundo Fiscal", nome2: "Fiscal Adjunto(a)" },
            ].map(({ dept, color, border, cargo1, nome1, cargo2, nome2 }) => (
              <div key={dept} className="flex flex-col items-center gap-3">
                <div className="org-line-v h-8" aria-hidden="true" />
                <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{dept}</p>
                <OrgCard cargo={cargo1} nome={nome1} border={border} />
                <OrgCard cargo={cargo2} nome={nome2} border={border} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO AJUDAR ─── */}
      <section id="ajudar" className="bg-donation-pattern py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-kicker">Como Ajudar</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl"><span className="gradient-text">Apoie a AMEAS</span></h2>
            <p className="mt-5 text-lg leading-8 text-foreground/60">Escolha a forma de contribuir que combina com você. Cada apoio mantém o esporte adaptado em movimento.</p>
          </div>

          <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
            {/* Apoiador mensal */}
            <div className="glass neon-border rounded-3xl border border-purple-500/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-primary"><Repeat /></span>
              <p className="mt-4 text-2xl font-black text-foreground">Apoiador Mensal</p>
              <p className="mt-1 text-3xl font-black text-primary">R$ 30<span className="text-base font-bold text-foreground/40">/mês</span></p>
              <ul className="mt-5 space-y-3 text-sm text-foreground/60">
                {["Apoio contínuo aos treinos", "Materiais e equipamentos adaptados", "Relatos das conquistas dos atletas"].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}</li>
                ))}
              </ul>
              <Button onClick={() => setDonationOpen(true)} className="mt-6 w-full rounded-2xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                <QrCode /> Doar via PIX
              </Button>
            </div>

            {/* Doação única — destaque */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-900/60 to-pink-900/40 p-7 shadow-2xl glow-purple backdrop-blur lg:-mt-4">
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-xs font-black text-gold border border-gold/30">
                <Star className="h-3 w-3" /> Mais popular
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white"><Gift /></span>
              <p className="mt-4 text-2xl font-black text-white">Doação Única</p>
              <p className="mt-1 text-3xl font-black text-white">R$ {donationAmount || "0"}<span className="text-base font-bold text-white/50"> por doação</span></p>
              <div className="mt-5 flex flex-wrap gap-2">
                {donationPresets.map((v) => (
                  <button key={v} onClick={() => setDonationAmount(String(v))}
                    className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${donationAmount === String(v) ? "border-gold bg-gold text-black" : "border-white/20 text-white/70 hover:border-white/40"}`}>
                    R$ {v}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="valor-livre" className="text-xs font-bold uppercase text-white/50">Valor livre</label>
                <input id="valor-livre" inputMode="numeric" value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value.replace(/\D/g, ""))} placeholder="Digite o valor"
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-base font-bold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <Button onClick={() => setDonationOpen(true)} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                <Heart /> Doar R$ {donationAmount || "0"} via PIX
              </Button>
              <p className="mt-3 text-center text-xs text-white/40">Chave PIX CNPJ {pixKey}</p>
            </div>

            {/* Colaborador */}
            <div className="glass neon-border rounded-3xl border border-pink-500/20 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/15 text-heart"><HandHeart /></span>
              <p className="mt-4 text-2xl font-black text-foreground">Seja Colaborador(a)</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-black text-heart"><Clock className="h-5 w-5" /> Contribuição: tempo</p>
              <ul className="mt-5 space-y-3 text-sm text-foreground/60">
                {["Voluntariado nos treinos e eventos", "Apoio técnico e multidisciplinar", "Parcerias e patrocínios"].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-heart" />{item}</li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full rounded-2xl border-heart/40 text-heart hover:bg-heart/10">
                <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Quero Participar</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARCEIROS ─── */}
      <section id="parceiros" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Apoiadores e Patrocinadores</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Parceiros que fortalecem cada <span className="gradient-text">história de superação.</span></h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {visiblePartners.map((partner) => (
              <a key={partner.name} href={partner.website_url || undefined} target={partner.website_url ? "_blank" : undefined}
                rel={partner.website_url ? "noreferrer" : undefined}
                onClick={(e) => !partner.website_url && e.preventDefault()}
                className="glass neon-border group flex flex-col items-center gap-3 rounded-3xl border border-border/40 p-5 text-center transition-all hover:border-primary/40 hover:glow-purple">
                <span className="flex h-20 w-full items-center justify-center rounded-2xl bg-white p-2">
                  <img src={partner.logo} alt={`Logo de ${partner.name}`} className="h-full w-full object-contain" loading="lazy" />
                </span>
                <span className="text-xs font-black uppercase leading-snug text-foreground/70 group-hover:text-primary transition-colors">{partner.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALERIA ─── */}
      <section id="galeria" className="py-20 sm:py-24" style={{background:"#0d0d14"}}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Galeria</span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Histórias da AMEAS <span className="gradient-text">em movimento.</span></h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(showAllGallery ? galleryImages : galleryImages.slice(0, 8)).map((image) => (
              <button key={`${image.src}-${image.title}`}
                className="glass neon-border group overflow-hidden rounded-3xl border border-border/30 text-left transition-all hover:border-primary/40"
                onClick={() => setSelectedImage(image)}>
                <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-secondary/30 p-2">
                  <img src={image.src} alt={image.alt} className="max-h-full w-full object-contain transition-transform group-hover:scale-105" loading="lazy" />
                </span>
                <span className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-sm font-black text-foreground/80">{image.title}</span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
          {galleryImages.length > 8 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg" onClick={() => setShowAllGallery((v) => !v)}
                className="rounded-2xl border-primary/40 px-8 text-primary hover:bg-primary/10">
                {showAllGallery ? "Ver menos" : "Ver mais fotos"}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAllGallery ? "rotate-180" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section className="py-20 sm:py-24" aria-labelledby="depoimentos-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Depoimentos</span>
            <h2 id="depoimentos-title" className="mt-4 text-3xl font-black sm:text-4xl">Vozes de quem vive a <span className="gradient-text">inclusão de perto.</span></h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => {
              const glows = ["glow-purple", "glow-cyan", "glow-pink"];
              const borders = ["border-purple-500/20", "border-cyan-500/20", "border-pink-500/20"];
              return (
                <div key={t.author} className={`glass neon-border rounded-3xl border p-7 ${borders[i]}`}>
                  <div className="flex gap-1 text-gold mb-4">
                    <Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" /><Sparkles className="h-5 w-5" />
                  </div>
                  <blockquote className="text-base font-semibold leading-8 text-foreground/80">"{t.quote}"</blockquote>
                  <p className="mt-4 text-sm font-black text-primary">{t.author}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="contato" className="border-t border-border/30 py-14" style={{background:"#08080e"}}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-2 glow-purple">
                <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" loading="lazy" />
              </span>
              <div>
                <p className="gradient-text-purple text-xl font-black">AMEAS</p>
                <p className="text-xs text-foreground/40">Associação Movimento Esporte Adaptado e Superação</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-foreground/50">Inclusão, esporte adaptado, acolhimento e superação construídos com atletas, famílias, voluntários e parceiros.</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/60">
            <p className="font-black text-foreground">Contato</p>
            <a className="flex items-center gap-2 hover:text-primary transition-colors" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> {whatsappDisplay}
            </a>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> São Roque e região</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/60">
            <p className="font-black text-foreground">Doações</p>
            <p className="text-foreground/50">PIX CNPJ {pixKey}</p>
            <p className="text-foreground/50">Banco do Brasil · Ag. 0523-1 · CC 48681-7</p>
            <Button onClick={() => setDonationOpen(true)} className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-purple-500/25">
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
        className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 text-white shadow-xl shadow-purple-500/30 donation-pulse hover:shadow-purple-500/50"
        aria-label="Fazer doação">
        <Heart /> Fazer Doação
      </Button>

      <DonationDialog open={donationOpen} onOpenChange={setDonationOpen} copied={copied} onCopyPix={copyPix} />

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto rounded-3xl border border-primary/20 bg-card/95 p-4 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="gradient-text">{selectedImage?.title}</DialogTitle>
            <DialogDescription className="text-foreground/50">{selectedImage?.alt}</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex min-h-[55vh] items-center justify-center rounded-2xl bg-secondary/20 p-3">
              <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[72vh] w-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function OrgCard({ cargo, nome, border = "border-border/40" }: { cargo: string; nome: string; border?: string }) {
  return (
    <div className={`glass w-full rounded-2xl border p-4 text-center backdrop-blur ${border}`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-foreground/50">{cargo}</p>
      <p className="mt-1 text-sm font-black text-foreground">{nome}</p>
    </div>
  );
}

function DemoQr() {
  return (
    <div className="mx-auto w-full max-w-52 rounded-2xl border border-primary/20 bg-background/80 p-3 backdrop-blur" aria-label="QR Code demonstrativo para PIX">
      <div className="grid aspect-square grid-cols-[repeat(19,minmax(0,1fr))] gap-0.5">
        {Array.from({ length: 361 }).map((_, i) => (
          <span key={i} className={qrCells.includes(i) ? "rounded-[1px] bg-primary" : "rounded-[1px] bg-secondary/30"} />
        ))}
      </div>
      <p className="mt-2 text-center text-[0.65rem] font-bold uppercase text-foreground/40">QR Code demonstrativo</p>
    </div>
  );
}

function DonationDialog({ open, onOpenChange, copied, onCopyPix }: { open: boolean; onOpenChange: (open: boolean) => void; copied: boolean; onCopyPix: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-3xl border border-purple-500/20 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="text-heart" /> <span className="gradient-text">Apoie a AMEAS</span>
          </DialogTitle>
          <DialogDescription className="text-foreground/50">Sua doação fortalece esporte adaptado, inclusão e acolhimento.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
          <DemoQr />
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-bold uppercase text-foreground/50">PIX CNPJ</p>
              <p className="mt-1 break-words text-lg font-black text-primary">{pixKey}</p>
            </div>
            <Button onClick={onCopyPix} className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90">
              <Copy /> {copied ? "Chave copiada ✓" : "Copiar PIX"}
            </Button>
            <Button asChild variant="outline" className="w-full rounded-2xl border-heart/40 text-heart hover:bg-heart/10">
              <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle /> Chamar no WhatsApp</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
