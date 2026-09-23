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
      {
        name: "description",
        content:
          "Site institucional da AMEAS, associação que promove inclusão, acolhimento e superação por meio do esporte adaptado.",
      },
      { property: "og:title", content: "AMEAS | Esporte Adaptado e Superação" },
      {
        property: "og:description",
        content:
          "Conheça a AMEAS, sua fundadora Karina Meneguini, projetos, parceiros e formas de apoiar o esporte adaptado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AmeasHome,
});

const whatsappNumber = "5511999433480";
const whatsappDisplay = "(11) 99943-3480";
const pixKey = "34017976/0001-99";
const donationMessage = encodeURIComponent(
  "Olá, AMEAS! Quero apoiar a Associação Movimento Esporte Adaptado e Superação.",
);
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${donationMessage}`;

const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#familias", label: "Famílias" },
  { href: "#fundadora", label: "Fundadora" },
  { href: "#missao", label: "Missão e Valores" },
  { href: "#galeria", label: "Galeria" },
  { href: "#ajudar", label: "Como Ajudar" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#contato", label: "Contato" },
];

const primaryHeroImage = {
  src: treinoAdaptadoAsset,
  alt: "Atletas da AMEAS em treino adaptado com halteres no CrossFit",
};

const heroImages = [
  primaryHeroImage,
  {
    src: corridaAdaptadaAsset,
    alt: "Atleta da AMEAS em triciclo adaptado durante atividade ao ar livre",
  },
  {
    src: crossfitGrupoAsset,
    alt: "Grupo da AMEAS reunido em atividade de CrossFit adaptado",
  },
];

const galleryImages = [
  {
    src: parceirosBannerAsset,
    alt: "Banner comemorativo com parceiros e patrocinadores da AMEAS",
    title: "Parceiros AMEAS",
  },
  {
    src: acolhimentoCafeAsset,
    alt: "Grupo da AMEAS reunido em momento de acolhimento no Empório QN",
    title: "Acolhimento",
  },
  {
    src: corridaAdaptadaAsset,
    alt: "Atleta em triciclo adaptado acompanhado durante atividade esportiva",
    title: "Esporte adaptado",
  },
  {
    src: parceriaTiaLinaAsset,
    alt: "Participantes da AMEAS em ação de parceria na Tia Lina",
    title: "Parcerias locais",
  },
  {
    src: encontroComunidadeAsset,
    alt: "Grande grupo da AMEAS reunido com banner institucional",
    title: "Comunidade",
  },
  {
    src: crossfitGrupoAsset,
    alt: "Equipe AMEAS em encontro esportivo no CrossFit",
    title: "Treino coletivo",
  },
  {
    src: acaoSolidariaAsset,
    alt: "Grupo da AMEAS reunido em ação solidária com mesa de bolos",
    title: "Ação solidária",
  },
  {
    src: treinoAdaptadoAsset,
    alt: "Duas mulheres da AMEAS realizando treino adaptado com halteres",
    title: "Superação em treino",
  },
  {
    src: karinaAsset,
    alt: "Retrato oficial de Karina Meneguini, fundadora da AMEAS",
    title: "Karina Meneguini",
  },
  {
    src: logoAsset,
    alt: "Logo oficial da AMEAS",
    title: "Marca AMEAS",
  },
];

const values = [
  {
    icon: Target,
    title: "Missão",
    text: "Promover inclusão, autonomia e qualidade de vida por meio do esporte adaptado, criando caminhos reais de participação social.",
  },
  {
    icon: Trophy,
    title: "Visão",
    text: "Ser referência regional em esporte adaptado, acolhimento e oportunidades para pessoas com deficiência e suas famílias.",
  },
  {
    icon: Heart,
    title: "Valores",
    text: "Respeito, empatia, superação, compromisso, transparência, colaboração e amor pelo desenvolvimento humano.",
  },
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
  {
    quote:
      "A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos.",
    author: "Família atendida",
  },
  {
    quote:
      "Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto.",
    author: "Parceiro institucional",
  },
  {
    quote:
      "Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas.",
    author: "Atleta AMEAS",
  },
];

const donationPresets = [25, 50, 100, 200];

const qrCells = [
  0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25, 26, 27, 28, 29, 30, 33, 35, 37,
  39, 40, 42, 44, 46, 48, 50, 51, 52, 53, 54, 55, 56, 60, 61, 63, 65, 67, 69, 72, 75, 76, 78, 80,
  82, 84, 86, 87, 88, 91, 93, 95, 96, 98, 100, 104, 105, 106, 108, 111, 113, 115, 118, 120, 121,
  122, 124, 126, 128, 130, 132, 133, 135, 137, 139, 140, 141, 144, 147, 149, 151, 153, 155, 157,
  160, 162, 164, 166, 168, 170, 172, 174, 176, 177, 178, 180, 184, 186, 188, 190, 192, 194, 196,
  198, 200, 201, 202, 203, 204, 205, 206, 208, 211, 213, 215, 217, 219, 221, 223, 225, 226, 228,
  230, 232, 234, 236, 238, 240, 242, 244, 245, 246, 247, 248, 249, 250, 252, 254, 256, 258, 260,
  262, 264, 266, 268, 270, 272, 273, 274, 275, 276, 277, 278, 280, 282, 284, 287, 289, 291, 293,
  295, 297, 299, 301, 303, 304, 305, 306, 307, 308, 309, 310, 314, 316, 318, 320, 322, 324, 326,
  329, 331, 333, 335, 337, 339, 341, 342, 344, 346, 348, 350, 352, 354, 356, 358, 360,
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
    .map((partner) => ({
      ...partner,
      website_url: partnerLinks.find((link) => link.slug === partner.slug)?.website_url ?? "",
    }))
    .filter((partner) => !partnerLinks.length || partnerLinks.some((link) => link.slug === partner.slug && link.published));

  const year = useMemo(() => new Date().getFullYear(), []);

  const copyPix = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(pixKey);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#inicio" className="flex shrink-0 items-center gap-2" aria-label="Ir para o início">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card p-1 shadow-sm">
              <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" />
            </span>
            <span className="text-sm font-black uppercase tracking-wide text-brand-navy">AMEAS</span>
          </a>

          {/* Nav central */}
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Ações direita */}
          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="ghost" className="hidden text-xs text-muted-foreground hover:text-brand-navy lg:inline-flex">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
              </a>
            </Button>
            <Button size="sm" onClick={() => setDonationOpen(true)} className="hidden bg-heart px-3 text-xs text-heart-foreground hover:bg-heart/90 lg:inline-flex">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" /> Doar
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden px-2 text-xs text-muted-foreground hover:text-brand-navy lg:inline-flex" title="Painel administrativo">
              <a href="/admin" aria-label="Painel administrativo">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen ? (
          <div className="border-t border-border bg-background px-4 py-3 shadow-md lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Navegação mobile">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-navy hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDonationOpen(true)} className="flex-1 bg-heart text-xs text-heart-foreground hover:bg-heart/90">
                  <Heart className="h-3.5 w-3.5" aria-hidden="true" /> Doar Agora
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs text-muted-foreground">
                  <a href="/admin"><LayoutDashboard className="h-4 w-4" /></a>
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <section id="inicio" className="relative overflow-hidden bg-hero-pattern">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <Badge className="border border-gold/40 bg-gold/15 px-3 py-1 text-brand-navy hover:bg-gold/20">
              Associação Movimento Esporte Adaptado e Superação
            </Badge>
            <h1 className="mt-6 text-4xl font-black leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
              AMEAS
            </h1>
            <p className="mt-5 text-2xl font-bold leading-snug text-heart sm:text-3xl">{siteContent.hero_title}</p>
            <p className="mt-5 text-lg leading-8 text-foreground/80">
              {siteContent.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-heart text-heart-foreground hover:bg-heart/90">
                <a href="#ajudar">
                  <Heart aria-hidden="true" /> Fazer Doação
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle aria-hidden="true" /> Falar no WhatsApp
                </a>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-brand-navy sm:grid-cols-3">
              <span className="flex items-center gap-2"><CheckCircle2 className="text-heart" aria-hidden="true" /> Inclusão</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="text-heart" aria-hidden="true" /> Acolhimento</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="text-heart" aria-hidden="true" /> Superação</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <figure className="flex min-h-[340px] items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-lg">
              <img
                src={primaryHeroImage.src}
                alt={primaryHeroImage.alt}
                className="max-h-[520px] w-full object-contain"
                loading="eager"
              />
            </figure>
            <div className="grid gap-4">
              {heroImages.slice(1).map((image) => (
                <figure
                  key={image.src}
                  className="flex min-h-[160px] items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-md"
                >
                  <img src={image.src} alt={image.alt} className="max-h-60 w-full object-contain" />
                </figure>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl justify-center px-4 pb-8 sm:px-6 lg:px-8">
          <a href="#sobre" className="inline-flex items-center gap-2 text-sm font-bold text-brand-navy">
            Conheça a associação <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="sobre" className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <span className="section-kicker">Sobre a Associação</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Movimento, esporte e acolhimento para transformar vidas.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-foreground/80">
              <p>
                A AMEAS nasceu do compromisso com a inclusão e com a superação diária de pessoas
                que encontram no esporte adaptado um espaço de desenvolvimento, amizade e conquista.
              </p>
              <p>
                A associação promove atividades que unem cuidado, convivência e prática esportiva,
                valorizando cada trajetória e fortalecendo atletas, famílias, voluntários e parceiros.
              </p>
              <p>
                Mais do que treinos, a AMEAS constrói uma rede de apoio em que cada pessoa é vista,
                respeitada e incentivada a alcançar novas possibilidades.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-secondary p-3">
              <img
                src={encontroComunidadeAsset}
                alt="Comunidade AMEAS reunida em frente a banner institucional"
                className="max-h-[360px] w-full object-contain"
                loading="lazy"
              />
            </figure>
            <div className="grid gap-4">
              <Card className="rounded-2xl border-primary/20 bg-card shadow-sm">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-gold" aria-hidden="true" />
                  <CardTitle className="text-xl text-brand-navy">Impacto humano</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Inclusão que começa no treino e alcança a autoestima, a família e a comunidade.
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-heart/20 bg-card shadow-sm">
                <CardHeader>
                  <CalendarHeart className="h-8 w-8 text-heart" aria-hidden="true" />
                  <CardTitle className="text-xl text-brand-navy">Presença contínua</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Projetos, encontros e ações que mantêm o esporte adaptado vivo e acessível.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="familias" className="bg-secondary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Famílias atípicas</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Cuidar de quem cuida também faz parte da nossa missão.
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              Além do esporte adaptado, a AMEAS oferece uma rede de acolhimento e assistência social
              para as famílias atípicas da associação. O suporte é construído com profissionais e
              voluntários que acreditam no cuidado integral.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card className="rounded-3xl border-border bg-card shadow-sm">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heart/10 text-heart"><Heart aria-hidden="true" /></span>
                <CardTitle className="text-2xl text-brand-navy">Suporte psicológico</CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-7 text-muted-foreground">
                Espaço de escuta e acolhimento emocional para mães, pais e responsáveis enfrentarem
                os desafios da rotina com mais apoio e segurança.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-border bg-card shadow-sm">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users aria-hidden="true" /></span>
                <CardTitle className="text-2xl text-brand-navy">Assistência social</CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-7 text-muted-foreground">
                Orientação e encaminhamentos para fortalecer o acesso das famílias a direitos,
                serviços e oportunidades na comunidade.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-border bg-card shadow-sm">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/20 text-brand-navy"><Activity aria-hidden="true" /></span>
                <CardTitle className="text-2xl text-brand-navy">Pilates para as mães</CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-7 text-muted-foreground">
                Aulas de Pilates conduzidas por voluntários, criando um momento de cuidado com o
                corpo, descanso e fortalecimento para quem está sempre cuidando de alguém.
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 rounded-3xl bg-brand-navy p-6 text-primary-foreground sm:p-8">
            <p className="text-lg font-bold sm:text-xl">
              Na AMEAS, atletas e famílias caminham juntos: o esporte abre caminhos e a assistência
              social sustenta a rede de apoio.
            </p>
            <p className="mt-3 text-sm leading-7 text-primary-foreground/75">
              Todas essas ações são realizadas com a dedicação de voluntários e parceiros que doam
              tempo, conhecimento e cuidado para transformar vidas.
            </p>
          </div>
        </div>
      </section>

      <section id="fundadora" className="bg-brand-navy py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <figure className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground p-4 shadow-xl">
            <img
              src={karinaAsset}
              alt="Karina Meneguini, fundadora da AMEAS, em retrato individual com legenda Convidada"
              className="max-h-[560px] w-full object-contain"
              loading="lazy"
            />
          </figure>
          <div>
            <span className="section-kicker-on-dark">Fundadora</span>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Karina Meneguini</h2>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/85">
              Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e
              transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte
              adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de
              superação.
            </p>
            <p className="mt-5 text-lg leading-8 text-primary-foreground/85">
              À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um
              ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Dedicação",
                "Liderança transformadora",
                "Inclusão com afeto",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-4 font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="missao" className="bg-secondary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Missão, Visão e Valores</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Princípios que orientam cada treino, encontro e conquista.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="rounded-2xl border-border bg-card shadow-sm">
                  <CardHeader>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Icon aria-hidden="true" />
                    </span>
                    <CardTitle className="text-2xl text-brand-navy">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-base leading-7 text-muted-foreground">{item.text}</CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20" aria-labelledby="organograma-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Organograma</span>
            <h2 id="organograma-title" className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Uma rede organizada para cuidar, orientar e apoiar.
            </h2>
          </div>

          {/* Organograma em árvore hierárquica */}
          <div className="mt-12 flex flex-col items-center gap-0">

            {/* Nível 1 — Presidente */}
            <div className="flex flex-col items-center">
              <div className="w-72 rounded-2xl bg-brand-navy px-6 py-5 text-center text-primary-foreground shadow-lg">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60">Presidente</p>
                <p className="mt-1 text-lg font-black">Karina Meneguini</p>
              </div>
              {/* Conector vertical */}
              <div className="h-8 w-px bg-border" aria-hidden="true" />
            </div>

            {/* Nível 2 — Vice-Presidente */}
            <div className="flex flex-col items-center">
              <div className="w-72 rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-md">
                <p className="text-xs font-bold uppercase tracking-widest text-heart">Vice-Presidente</p>
                <p className="mt-1 text-lg font-black text-brand-navy">Diretoria Executiva</p>
              </div>
              {/* Conector em T */}
              <div className="h-8 w-px bg-border" aria-hidden="true" />
            </div>

            {/* Linha horizontal conectora */}
            <div className="relative flex w-full max-w-4xl items-start justify-center" aria-hidden="true">
              <div className="absolute top-0 left-1/6 right-1/6 h-px bg-border" />
            </div>

            {/* Nível 3 — 3 colunas */}
            <div className="mt-0 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Secretaria */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-px bg-border" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-widest text-heart">Secretaria</p>
                <OrgCard cargo="Primeiro Secretário" nome="Secretário(a) Geral" />
                <OrgCard cargo="Segundo Secretário" nome="Secretário(a) Adjunto(a)" />
              </div>

              {/* Tesouraria */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-px bg-border" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-widest text-heart">Tesouraria</p>
                <OrgCard cargo="Primeiro Tesoureiro" nome="Tesoureiro(a) Geral" />
                <OrgCard cargo="Segundo Tesoureiro" nome="Tesoureiro(a) Adjunto(a)" />
              </div>

              {/* Fiscalização */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-px bg-border" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-widest text-heart">Fiscalização</p>
                <OrgCard cargo="Primeiro Fiscal" nome="Fiscal Geral" />
                <OrgCard cargo="Segundo Fiscal" nome="Fiscal Adjunto(a)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ajudar" className="bg-donation-pattern py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-kicker">Como Ajudar</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">Apoie a AMEAS</h2>
            <p className="mt-5 text-lg leading-8 text-foreground/80">
              Escolha a forma de contribuir que combina com você. Cada apoio mantém o esporte
              adaptado em movimento.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
            <Card className="rounded-3xl border-border bg-card shadow-sm">
              <CardHeader className="items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Repeat aria-hidden="true" />
                </span>
                <CardTitle className="text-2xl text-brand-navy">Apoiador Mensal</CardTitle>
                <p className="text-3xl font-black text-primary">
                  R$ 30<span className="text-base font-bold text-muted-foreground">/mês</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {["Apoio contínuo aos treinos", "Materiais e equipamentos adaptados", "Relatos das conquistas dos atletas"].map(
                    (item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-heart" aria-hidden="true" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <Button
                  onClick={() => setDonationOpen(true)}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <QrCode aria-hidden="true" /> Doar via PIX
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border-0 bg-linear-to-br from-primary to-brand-navy text-primary-foreground shadow-xl lg:-mt-4">
              <Badge className="absolute right-4 top-4 rounded-full bg-gold px-3 text-brand-navy">
                <Star className="h-3 w-3" aria-hidden="true" /> Mais popular
              </Badge>
              <CardHeader className="items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <Gift aria-hidden="true" />
                </span>
                <CardTitle className="text-2xl">Doação Única</CardTitle>
                <p className="text-3xl font-black">
                  R$ {donationAmount || "0"}
                  <span className="text-base font-bold text-primary-foreground/70"> por doação</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {donationPresets.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDonationAmount(String(value))}
                      className={`rounded-full border px-4 ${
                        donationAmount === String(value)
                          ? "border-gold bg-gold text-brand-navy hover:bg-gold"
                          : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/15"
                      }`}
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>
                <div>
                  <label
                    htmlFor="valor-livre"
                    className="text-xs font-bold uppercase text-primary-foreground/70"
                  >
                    Valor livre
                  </label>
                  <input
                    id="valor-livre"
                    inputMode="numeric"
                    value={donationAmount}
                    onChange={(event) => setDonationAmount(event.target.value.replace(/\D/g, ""))}
                    placeholder="Digite o valor"
                    className="mt-2 w-full rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2 text-base font-bold text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <Button
                  onClick={() => setDonationOpen(true)}
                  className="w-full rounded-full bg-heart text-heart-foreground hover:bg-heart/90"
                >
                  <Heart aria-hidden="true" /> Doar R$ {donationAmount || "0"} via PIX
                </Button>
                <p className="text-xs text-primary-foreground/70">
                  Chave PIX CNPJ {pixKey} · Banco do Brasil Ag. 0523-1 · CC 48681-7
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border bg-card shadow-sm">
              <CardHeader className="items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heart/10 text-heart">
                  <HandHeart aria-hidden="true" />
                </span>
                <CardTitle className="text-2xl text-brand-navy">Seja Colaborador(a)</CardTitle>
                <p className="flex items-center gap-2 text-lg font-black text-heart">
                  <Clock className="h-5 w-5" aria-hidden="true" /> Contribuição: tempo
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {["Voluntariado nos treinos e eventos", "Apoio técnico e multidisciplinar", "Parcerias e patrocínios"].map(
                    (item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-heart text-heart hover:bg-heart/10"
                >
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle aria-hidden="true" /> Quero Participar
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      <section id="parceiros" className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Apoiadores e Patrocinadores</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Parceiros que fortalecem cada história de superação.
            </h2>
            <p className="mt-6 text-lg leading-8 text-foreground/80">
              {siteContent.about_text}
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {visiblePartners.map((partner) => (
              <a
                key={partner.name}
                href={partner.website_url || undefined}
                target={partner.website_url ? "_blank" : undefined}
                rel={partner.website_url ? "noreferrer" : undefined}
                onClick={(event) => !partner.website_url && event.preventDefault()}
                className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-5 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-24 w-full items-center justify-center rounded-2xl bg-white p-3 ring-1 ring-border/60">
                  <img
                    src={partner.logo}
                    alt={`Logo de ${partner.name}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </span>
                <span className="text-sm font-black uppercase leading-snug text-brand-navy">
                  {partner.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="galeria" className="bg-secondary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Galeria</span>
            <h2 className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Histórias da AMEAS em movimento.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(showAllGallery ? galleryImages : galleryImages.slice(0, 4)).map((image) => (
              <Button
                key={`${image.src}-${image.title}`}
                variant="ghost"
                className="group h-auto flex-col items-stretch gap-0 overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-sm hover:bg-card"
                onClick={() => setSelectedImage(image)}
              >
                <span className="flex aspect-[4/3] w-full items-center justify-center bg-secondary p-3">
                  <img src={image.src} alt={image.alt} className="max-h-full w-full object-contain" loading="lazy" />
                </span>
                <span className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-left text-brand-navy">
                  <span className="font-black">{image.title}</span>
                  <ArrowRight className="h-4 w-4 text-heart transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Button>
            ))}
          </div>
          {galleryImages.length > 4 ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllGallery((value) => !value)}
                className="rounded-full border-primary px-8 text-primary hover:bg-primary/10"
              >
                {showAllGallery ? "Ver menos" : "Ver mais fotos"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAllGallery ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20" aria-labelledby="depoimentos-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="section-kicker">Depoimentos</span>
            <h2 id="depoimentos-title" className="mt-3 text-3xl font-black text-brand-navy sm:text-4xl">
              Vozes de quem vive a inclusão de perto.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="rounded-2xl border-border bg-card shadow-sm">
                <CardContent className="space-y-5 p-6">
                  <div className="flex gap-1 text-gold" aria-hidden="true">
                    <Sparkles className="h-5 w-5" />
                    <Sparkles className="h-5 w-5" />
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <blockquote className="text-lg font-semibold leading-8 text-brand-navy">
                    “{testimonial.quote}”
                  </blockquote>
                  <p className="text-sm font-bold text-heart">{testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer id="contato" className="bg-brand-navy py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground p-2">
                <img src={logoAsset} alt="Logo AMEAS" className="h-full w-full object-contain" loading="lazy" />
              </span>
              <div>
                <p className="text-xl font-black">AMEAS</p>
                <p className="text-sm text-primary-foreground/75">Associação Movimento Esporte Adaptado e Superação</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-7 text-primary-foreground/75">
              Inclusão, esporte adaptado, acolhimento e superação construídos com atletas, famílias,
              voluntários e parceiros.
            </p>
          </div>
          <div className="space-y-3 text-sm text-primary-foreground/80">
            <p className="font-black text-primary-foreground">Contato</p>
            <a className="flex items-center gap-2 hover:text-gold" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> {whatsappDisplay}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" /> São Roque e região
            </p>
          </div>
          <div className="space-y-3 text-sm text-primary-foreground/80">
            <p className="font-black text-primary-foreground">Doações</p>
            <p>PIX CNPJ {pixKey}</p>
            <p>Banco do Brasil · Ag. 0523-1 · CC 48681-7</p>
            <Button onClick={() => setDonationOpen(true)} className="bg-heart text-heart-foreground hover:bg-heart/90">
              <Heart aria-hidden="true" /> Doar Agora
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-primary-foreground/15 px-4 pt-6 text-xs text-primary-foreground/60 sm:px-6 lg:px-8">
          © {year} AMEAS. Todos os direitos reservados.
        </div>
      </footer>

      <Button
        onClick={() => setDonationOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 rounded-full bg-heart px-5 text-heart-foreground shadow-xl shadow-heart/25 hover:bg-heart/90 donation-pulse"
        aria-label="Fazer doação"
      >
        <Heart aria-hidden="true" /> Fazer Doação
      </Button>

      <DonationDialog open={donationOpen} onOpenChange={setDonationOpen} copied={copied} onCopyPix={copyPix} />

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto rounded-2xl border-border bg-card p-4">
          <DialogHeader>
            <DialogTitle className="text-brand-navy">{selectedImage?.title}</DialogTitle>
            <DialogDescription>{selectedImage?.alt}</DialogDescription>
          </DialogHeader>
          {selectedImage ? (
            <div className="flex min-h-[55vh] items-center justify-center rounded-2xl bg-secondary p-3">
              <img src={selectedImage.src} alt={selectedImage.alt} className="max-h-[72vh] w-full object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function OrgCard({ cargo, nome }: { cargo: string; nome: string }) {
  return (
    <div className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-heart">{cargo}</p>
      <p className="mt-1 text-sm font-black text-brand-navy">{nome}</p>
    </div>
  );
}

function DemoQr() {
  return (
    <div className="mx-auto w-full max-w-56 rounded-2xl border border-border bg-background p-3" aria-label="QR Code demonstrativo para PIX">
      <div className="grid aspect-square grid-cols-[repeat(19,minmax(0,1fr))] gap-0.5 bg-background">
        {Array.from({ length: 361 }).map((_, index) => (
          <span
            key={index}
            className={qrCells.includes(index) ? "rounded-[1px] bg-brand-navy" : "rounded-[1px] bg-secondary"}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[0.68rem] font-bold uppercase text-muted-foreground">
        QR Code demonstrativo
      </p>
    </div>
  );
}

function DonationDialog({
  open,
  onOpenChange,
  copied,
  onCopyPix,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copied: boolean;
  onCopyPix: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-2xl border-heart/20 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-brand-navy">
            <Heart className="text-heart" aria-hidden="true" /> Apoie a AMEAS
          </DialogTitle>
          <DialogDescription>
            Sua doação fortalece esporte adaptado, inclusão e acolhimento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
          <DemoQr />
          <div className="space-y-4">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">PIX CNPJ</p>
              <p className="mt-1 break-words text-xl font-black text-brand-navy">{pixKey}</p>
            </div>
            <Button onClick={onCopyPix} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Copy aria-hidden="true" /> {copied ? "Chave copiada" : "Copiar PIX"}
            </Button>
            <Button asChild variant="outline" className="w-full border-heart text-heart hover:bg-heart/10">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> Chamar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
