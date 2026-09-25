import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, Globe, HandHeart, ImagePlus, LayoutDashboard,
  Link2, LogOut, Moon, QrCode, Save, Settings, Sun, Upload, Users, X,
  Image as ImageIcon, Tag, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultSiteContent, supabase, type PartnerLink, type SiteContent } from "@/lib/supabase";

// Static gallery asset imports — same as index.tsx
import parceirosBannerAsset from "@/assets/ameas-parceiros-banner.png";
import acolhimentoCafeAsset from "@/assets/ameas-acolhimento-cafe.png";
import corridaAdaptadaAsset from "@/assets/ameas-corrida-adaptada.png";
import parceriaTiaLinaAsset from "@/assets/ameas-parceria-tia-lina.png";
import encontroComunidadeAsset from "@/assets/ameas-encontro-comunidade.png";
import karinaAsset from "@/assets/karina-meneguini-retrato.png";
import crossfitGrupoAsset from "@/assets/ameas-crossfit-grupo.png";
import acaoSolidariaAsset from "@/assets/ameas-acao-solidaria.png";
import treinoAdaptadoAsset from "@/assets/ameas-treino-adaptado.png";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const ADMIN_LOGIN = "ameas";
const ADMIN_PASSWORD = "123456789";

type UploadPreview = { file: File; url: string };
type Tab = "hero" | "fundadora" | "depoimentos" | "pix" | "voluntario" | "parceiros" | "logos" | "galeria";

/* ── Event categories ── */
const EVENT_CATEGORIES = [
  { id: "esporte-adaptado", label: "Esporte Adaptado",  color: "bg-[#1B4B8A] text-white" },
  { id: "comunidade",       label: "Comunidade",         color: "bg-[#E8392A] text-white" },
  { id: "acolhimento",      label: "Acolhimento",        color: "bg-[#059669] text-white" },
  { id: "fundadora",        label: "Fundadora",          color: "bg-[#7c3aed] text-white" },
] as const;
type EventCategory = typeof EVENT_CATEGORIES[number]["id"];

/* ── Static gallery items (mirroring index.tsx galleryEvents) ── */
const STATIC_GALLERY: { src: string; alt: string; title: string; category: EventCategory }[] = [
  { src: corridaAdaptadaAsset,    alt: "Atleta em triciclo adaptado", title: "Corrida adaptada",      category: "esporte-adaptado" },
  { src: crossfitGrupoAsset,      alt: "Equipe AMEAS no CrossFit",    title: "Treino coletivo",        category: "esporte-adaptado" },
  { src: treinoAdaptadoAsset,     alt: "Treino adaptado",             title: "Superacao em treino",   category: "esporte-adaptado" },
  { src: encontroComunidadeAsset, alt: "Grupo AMEAS reunido",         title: "Encontro da comunidade",category: "comunidade" },
  { src: acaoSolidariaAsset,      alt: "Acao solidaria",              title: "Acao solidaria",        category: "comunidade" },
  { src: parceirosBannerAsset,    alt: "Banner parceiros",            title: "Parceiros AMEAS",       category: "comunidade" },
  { src: acolhimentoCafeAsset,    alt: "Cafe de acolhimento",         title: "Cafe de acolhimento",   category: "acolhimento" },
  { src: parceriaTiaLinaAsset,    alt: "Parceria Tia Lina",           title: "Parceria Tia Lina",     category: "acolhimento" },
  { src: karinaAsset,             alt: "Karina Meneguini fundadora",  title: "Karina Meneguini",      category: "fundadora" },
];

/* ── Image normalisation helpers (browser Canvas API) ── */

/** Logo: 400x300 canvas, white bg, logo centred with 24 px padding */
function normalizeLogo(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const W = 400, H = 300, PAD = 24;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min((W - PAD * 2) / img.naturalWidth, (H - PAD * 2) / img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, Math.round((W - w) / 2), Math.round((H - h) / 2), w, h);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png", 1);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("load failed"));
    img.src = URL.createObjectURL(file);
  });
}

/** Gallery image: max 1200x900, keeps ratio, JPEG 88% */
function normalizeGalleryImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX_W = 1200, MAX_H = 900;
      const scale = Math.min(MAX_W / img.naturalWidth, MAX_H / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.88);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("load failed"));
    img.src = URL.createObjectURL(file);
  });
}

/* ── Partner defaults ── */
const defaultPartnerLinks: PartnerLink[] = [
  { slug: "rua-hum",            name: "Rua Hum",                          website_url: "https://www.instagram.com/ruahum",                sort_order: 1,  published: true },
  { slug: "escola-aquarela",    name: "Escola Aquarela",                  website_url: "https://www.instagram.com/escolaaquarelasr",       sort_order: 2,  published: true },
  { slug: "ibicolor",           name: "Ibicolor",                         website_url: "https://www.instagram.com/ibicolor_sr",           sort_order: 3,  published: true },
  { slug: "vila-don-patto",     name: "Vila Don Patto",                   website_url: "https://www.instagram.com/viladonpatto",          sort_order: 4,  published: true },
  { slug: "unimed-sao-roque",   name: "Unimed Sao Roque",                 website_url: "https://www.unimed.coop.br/site/web/saoroque",    sort_order: 5,  published: true },
  { slug: "emporio-qn",         name: "Emporio QN",                       website_url: "",                                                sort_order: 6,  published: true },
  { slug: "tia-lina",           name: "Tia Lina",                         website_url: "https://www.instagram.com/cantinatialina",        sort_order: 7,  published: true },
  { slug: "fernando-araujo",    name: "Fernando Araujo Artista Plastico", website_url: "https://www.instagram.com/araujoartistaplastico", sort_order: 8,  published: true },
  { slug: "qualiser",           name: "Qualiser Contabilidade",           website_url: "",                                                sort_order: 9,  published: true },
  { slug: "jornal-da-economia", name: "Jornal da Economia",               website_url: "",                                                sort_order: 10, published: true },
];
const PARTNER_SLUGS = defaultPartnerLinks.map((p) => ({ slug: p.slug, name: p.name }));

/* ── DB gallery item type ── */
type GalleryItem = {
  id: string;
  title: string;
  alt: string;
  image_url: string;
  category: EventCategory | null;
  sort_order: number;
  published: boolean;
};

/* ══════════════════════════════ COMPONENT ══════════════════════════════ */
export default function AdminPage() {
  const [loginInput, setLoginInput]   = useState("");
  const [password, setPassword]       = useState("");
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [content, setContent]         = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>(defaultPartnerLinks);
  const [uploads, setUploads]         = useState<UploadPreview[]>([]);
  const [uploadCategory, setUploadCategory] = useState<EventCategory>("esporte-adaptado");
  const [busy, setBusy]               = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);
  const [loginError, setLoginError]   = useState("");
  const [tab, setTab]                 = useState<Tab>("hero");
  const [dbGallery, setDbGallery]     = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [logoUploads, setLogoUploads] = useState<{
    slug: string; name: string; file: File;
    preview: string; normalized: string | null; processing: boolean;
  }[]>([]);

  /* ── Theme ── */
  const [isLight, setIsLight] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("ameas-theme") === "light"
  );
  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light-mode", next);
    localStorage.setItem("ameas-theme", next ? "light" : "dark");
  }

  /* ── Load on login ── */
  useEffect(() => {
    if (!isLoggedIn || !supabase) return;
    supabase.from("ameas_partners").select("slug,name,website_url,sort_order,published").order("sort_order")
      .then(({ data }) => { if (data?.length) setPartnerLinks(data); });
    supabase.from("ameas_site_content").select("key,value")
      .then(({ data }) => {
        if (!data) return;
        setContent(data.reduce<SiteContent>((acc, row) => {
          if (row.key in acc) acc[row.key as keyof SiteContent] = row.value;
          return acc;
        }, { ...defaultSiteContent }));
      });
  }, [isLoggedIn]);

  /* ── Load gallery when tab opens ── */
  useEffect(() => {
    if (tab !== "galeria" || !isLoggedIn || !supabase) return;
    setLoadingGallery(true);
    supabase.from("ameas_gallery_items")
      .select("id,title,alt,image_url,category,sort_order,published")
      .order("sort_order")
      .then(({ data }) => {
        setDbGallery((data ?? []) as GalleryItem[]);
        setLoadingGallery(false);
      });
  }, [tab, isLoggedIn]);

  const uploadLabel = useMemo(() =>
    `${uploads.length} ${uploads.length === 1 ? "arquivo" : "arquivos"}`, [uploads.length]);

  function login() {
    if (loginInput === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true); setLoginError("");
    } else setLoginError("Login ou senha incorretos.");
  }
  function onKey(e: React.KeyboardEvent) { if (e.key === "Enter") login(); }
  function notify(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }
  function set(k: keyof SiteContent, v: string) { setContent((c) => ({ ...c, [k]: v })); }

  /* ── Save helpers ── */
  async function saveAll() {
    if (!supabase) return notify("Supabase nao configurado.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_site_content")
      .upsert(Object.entries(content).map(([key, value]) => ({ key, value })), { onConflict: "key" });
    setBusy(false);
    notify(error ? error.message : "Salvo com sucesso!", !error);
  }

  async function savePartners() {
    if (!supabase) return notify("Supabase nao configurado.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_partners").upsert(partnerLinks, { onConflict: "slug" });
    setBusy(false);
    notify(error ? error.message : "Parceiros salvos!", !error);
  }

  /* ── Upload gallery images ── */
  async function uploadImages() {
    if (!supabase || !uploads.length) return notify("Selecione pelo menos uma imagem.", false);
    setBusy(true);
    const errors: string[] = [];
    for (const { file } of uploads) {
      let blob: Blob;
      try { blob = await normalizeGalleryImage(file); } catch { blob = file; }
      const path = `gallery/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, "-").replace(/\.[^.]+$/, "")}.jpg`;
      const up = await supabase.storage.from("ameas-site-media").upload(path, blob, { upsert: false, contentType: "image/jpeg" });
      if (up.error) { errors.push(up.error.message); continue; }
      const { data: urlData } = supabase.storage.from("ameas-site-media").getPublicUrl(path);
      const ins = await supabase.from("ameas_gallery_items").insert({
        title: file.name.replace(/\.[^.]+$/, ""),
        alt: "Imagem da AMEAS",
        image_url: urlData.publicUrl,
        category: uploadCategory,
        sort_order: 0,
        published: true,
      });
      if (ins.error) errors.push(ins.error.message);
    }
    setBusy(false);
    if (errors.length) notify(errors.join(" | "), false);
    else { notify(`${uploads.length} imagem(ns) publicada(s)!`); setUploads([]); }
    // Refresh gallery list
    supabase.from("ameas_gallery_items")
      .select("id,title,alt,image_url,category,sort_order,published").order("sort_order")
      .then(({ data }) => setDbGallery((data ?? []) as GalleryItem[]));
  }

  /* ── Toggle gallery item published ── */
  async function toggleGalleryPublished(item: GalleryItem) {
    if (!supabase) return;
    const next = !item.published;
    setDbGallery((prev) => prev.map((g) => g.id === item.id ? { ...g, published: next } : g));
    await supabase.from("ameas_gallery_items").update({ published: next }).eq("id", item.id);
  }

  /* ── Update gallery item category ── */
  async function updateGalleryCategory(item: GalleryItem, category: EventCategory) {
    if (!supabase) return;
    setDbGallery((prev) => prev.map((g) => g.id === item.id ? { ...g, category } : g));
    await supabase.from("ameas_gallery_items").update({ category }).eq("id", item.id);
  }

  /* ── Delete gallery item ── */
  async function deleteGalleryItem(item: GalleryItem) {
    if (!supabase) return;
    setDbGallery((prev) => prev.filter((g) => g.id !== item.id));
    await supabase.from("ameas_gallery_items").delete().eq("id", item.id);
  }

  /* ── Logo upload helpers ── */
  async function addLogoFile(slug: string, name: string, file: File) {
    const preview = URL.createObjectURL(file);
    setLogoUploads((prev) => [...prev.filter((l) => l.slug !== slug),
      { slug, name, file, preview, normalized: null, processing: true }]);
    try {
      const blob = await normalizeLogo(file);
      setLogoUploads((prev) => prev.map((l) =>
        l.slug === slug ? { ...l, normalized: URL.createObjectURL(blob), processing: false } : l));
    } catch {
      setLogoUploads((prev) => prev.map((l) => l.slug === slug ? { ...l, processing: false } : l));
      notify("Erro ao processar logo.", false);
    }
  }

  async function publishLogos() {
    if (!supabase) return notify("Supabase nao configurado.", false);
    const ready = logoUploads.filter((l) => l.normalized && !l.processing);
    if (!ready.length) return notify("Nenhuma logo processada para publicar.", false);
    setBusy(true);
    const errors: string[] = [];
    for (const item of ready) {
      try {
        const blob = await normalizeLogo(item.file);
        const path = `logos/${item.slug}.png`;
        const up = await supabase.storage.from("ameas-site-media").upload(path, blob, { upsert: true, contentType: "image/png" });
        if (up.error) { errors.push(`${item.name}: ${up.error.message}`); continue; }
        const { data: urlData } = supabase.storage.from("ameas-site-media").getPublicUrl(path);
        await supabase.from("ameas_partners").update({ logo_url: urlData.publicUrl }).eq("slug", item.slug);
      } catch (e: unknown) {
        errors.push(`${item.name}: ${e instanceof Error ? e.message : "erro"}`);
      }
    }
    setBusy(false);
    if (errors.length) notify(errors.join(" | "), false);
    else { notify(`${ready.length} logo(s) publicada(s)!`); setLogoUploads([]); }
  }

  /* ══ LOGIN SCREEN ══ */
  if (!isLoggedIn) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#1B4B8A]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#E8392A]/10 blur-3xl" />
        <div className="glass-blue relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#1B4B8A]/30 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1B4B8A]/40 bg-[#1B4B8A]/15 glow-blue">
              <LayoutDashboard className="h-6 w-6 text-[#7eb5f5]" />
            </div>
            <p className="gradient-text text-2xl font-black">Painel AMEAS</p>
            <p className="mt-1 text-sm text-foreground/50">Area restrita de gerenciamento</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login" className="text-xs font-bold uppercase tracking-wide text-foreground/50">Login</Label>
              <Input id="login" type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyDown={onKey}
                placeholder="ameas" autoComplete="username"
                className="rounded-2xl border-border/40 bg-white/5 text-foreground placeholder:text-foreground/30" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs font-bold uppercase tracking-wide text-foreground/50">Senha</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey}
                autoComplete="current-password"
                className="rounded-2xl border-border/40 bg-white/5 text-foreground placeholder:text-foreground/30" />
            </div>
            {loginError && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{loginError}</p>}
            <Button onClick={login} className="w-full rounded-2xl bg-[#1B4B8A] text-white shadow-lg shadow-[#1B4B8A]/30 hover:bg-[#1B4B8A]/90 hover:shadow-[#1B4B8A]/50">
              Entrar no painel
            </Button>
            <Link to="/" className="block text-center text-sm text-foreground/40 hover:text-[#7eb5f5] transition-colors">
              &larr; Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ══ PAINEL ══ */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "hero",        label: "Hero / Sobre",  icon: <Settings className="h-4 w-4" /> },
    { id: "fundadora",   label: "Fundadora",     icon: <Users className="h-4 w-4" /> },
    { id: "depoimentos", label: "Depoimentos",   icon: <CheckCircle2 className="h-4 w-4" /> },
    { id: "pix",         label: "PIX / Doacao",  icon: <QrCode className="h-4 w-4" /> },
    { id: "voluntario",  label: "Voluntario",    icon: <HandHeart className="h-4 w-4" /> },
    { id: "parceiros",   label: "Parceiros",     icon: <Link2 className="h-4 w-4" /> },
    { id: "logos",       label: "Logos",         icon: <ImageIcon className="h-4 w-4" /> },
    { id: "galeria",     label: "Galeria",       icon: <ImagePlus className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1B4B8A]/30 bg-[#1B4B8A]/10 glow-blue">
              <LayoutDashboard className="h-4 w-4 text-[#7eb5f5]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7eb5f5]/70">AMEAS CMS</p>
              <p className="text-sm font-black text-foreground">Painel administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-xl border border-border/40 px-3 py-1.5 text-xs font-semibold text-foreground/50 hover:text-[#7eb5f5] sm:block transition-colors">
              <Globe className="inline h-3.5 w-3.5 mr-1" />Ver site
            </Link>
            <button onClick={toggleTheme} title={isLight ? "Modo Escuro" : "Modo Claro"}
              className="flex items-center gap-1.5 rounded-xl border border-border/40 px-3 py-1.5 text-xs font-semibold text-foreground/60 transition-all hover:border-[#1B4B8A]/40 hover:text-[#7eb5f5]">
              {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isLight ? "Escuro" : "Claro"}</span>
            </button>
            <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}
              className="rounded-xl border border-border/30 text-xs text-foreground/50 hover:text-red-400 hover:border-red-500/30">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* ── Toast ── */}
      {msg && (
        <div className={`fixed right-5 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${msg.ok ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"}`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Status",    value: "Publicado",              color: "text-emerald-400" },
            { label: "Admin",     value: "ameas",                  color: "text-[#7eb5f5]" },
            { label: "Parceiros", value: `${partnerLinks.length}`, color: "text-[#38bdf8]" },
            { label: "Upload",    value: uploadLabel,              color: "text-[#f59e0b]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-2xl border border-border/30 p-4">
              <p className="text-xs text-foreground/40">{label}</p>
              <p className={`mt-1 text-base font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-2xl border border-border/30 bg-secondary/30 p-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${tab === t.id ? "bg-[#1B4B8A]/25 text-[#7eb5f5] border border-[#1B4B8A]/30 glow-blue" : "text-foreground/50 hover:text-foreground"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Hero / Sobre ── */}
        {tab === "hero" && (
          <AdminCard title="Hero e Sobre" desc="Textos principais da pagina inicial.">
            <div className="grid gap-5 sm:grid-cols-2">
              <F label="Titulo do hero" value={content.hero_title} onChange={(v) => set("hero_title", v)} />
              <F label="WhatsApp" value={content.contact_whatsapp} onChange={(v) => set("contact_whatsapp", v)} />
              <div className="sm:col-span-2"><F label="Subtitulo do hero" value={content.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} multi /></div>
              <div className="sm:col-span-2"><F label="Texto sobre a AMEAS" value={content.about_text} onChange={(v) => set("about_text", v)} multi /></div>
              <F label="Instagram URL" value={content.instagram_url} onChange={(v) => set("instagram_url", v)} />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Fundadora ── */}
        {tab === "fundadora" && (
          <AdminCard title="Secao Fundadora" desc="Nome e textos biograficos da fundadora.">
            <div className="grid gap-5">
              <F label="Nome da fundadora" value={content.founder_name} onChange={(v) => set("founder_name", v)} />
              <F label="Biografia — paragrafo 1" value={content.founder_bio1} onChange={(v) => set("founder_bio1", v)} multi />
              <F label="Biografia — paragrafo 2" value={content.founder_bio2} onChange={(v) => set("founder_bio2", v)} multi />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Depoimentos ── */}
        {tab === "depoimentos" && (
          <AdminCard title="Depoimentos" desc="Os tres depoimentos exibidos na secao de vozes.">
            <div className="space-y-6">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="rounded-2xl border border-border/20 bg-secondary/20 p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-foreground/40">Depoimento {n}</p>
                  <div className="grid gap-4">
                    <F label="Texto da citacao" value={content[`test${n}_quote` as keyof SiteContent]} onChange={(v) => set(`test${n}_quote` as keyof SiteContent, v)} multi />
                    <F label="Autor" value={content[`test${n}_author` as keyof SiteContent]} onChange={(v) => set(`test${n}_author` as keyof SiteContent, v)} />
                  </div>
                </div>
              ))}
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── PIX ── */}
        {tab === "pix" && (
          <AdminCard title="PIX e Dados Bancarios" desc="Informacoes de doacao exibidas no site e no modal de PIX.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><F label="Chave PIX (CNPJ)" value={content.pix_key} onChange={(v) => set("pix_key", v)} /></div>
              <F label="Banco" value={content.pix_bank} onChange={(v) => set("pix_bank", v)} />
              <F label="Agencia" value={content.pix_agency} onChange={(v) => set("pix_agency", v)} />
              <F label="Conta Corrente" value={content.pix_account} onChange={(v) => set("pix_account", v)} />
              <div className="sm:col-span-2 border-t border-border/20 pt-5">
                <div className="mb-1.5 flex items-center gap-2">
                  <label className="text-xs font-black uppercase tracking-wide text-foreground/50">Codigo PIX Copia e Cola</label>
                  <span className="rounded-full border border-[#E8392A]/30 bg-[#E8392A]/10 px-2 py-0.5 text-[10px] font-black text-[#E8392A]">Aparece no botao &ldquo;Copiar Codigo PIX&rdquo;</span>
                </div>
                <Textarea value={content.pix_copypaste} onChange={(e) => set("pix_copypaste", e.target.value)} rows={3}
                  placeholder="Cole aqui o codigo longo gerado pelo seu banco (ex: 00020126...)"
                  className="rounded-xl border-border/30 bg-white/5 text-foreground placeholder:text-foreground/30 resize-none font-mono text-xs" />
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/5 p-4 text-sm text-foreground/60">
              <p className="font-bold text-[#7eb5f5] mb-1">Previa:</p>
              <p>PIX CNPJ <strong className="text-foreground">{content.pix_key}</strong></p>
              <p>{content.pix_bank} &middot; Ag. {content.pix_agency} &middot; CC {content.pix_account}</p>
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Voluntario ── */}
        {tab === "voluntario" && (
          <AdminCard title="Secao Voluntario" desc="Titulo e descricao do card de voluntariado na secao Como Ajudar.">
            <div className="grid gap-5">
              <F label="Titulo" value={content.volunteer_title} onChange={(v) => set("volunteer_title", v)} />
              <F label="Descricao" value={content.volunteer_desc} onChange={(v) => set("volunteer_desc", v)} multi />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Parceiros ── */}
        {tab === "parceiros" && (
          <AdminCard title="Links dos Parceiros" desc="O logo de cada parceiro ficara clicavel no site. Ative/desative a visibilidade.">
            <div className="space-y-3">
              {partnerLinks.map((p, i) => (
                <div key={p.slug} className="grid items-center gap-3 rounded-2xl border border-border/20 bg-secondary/20 p-4 sm:grid-cols-[1fr_2fr_auto]">
                  <div>
                    <p className="text-xs font-black text-foreground/80">{p.name}</p>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-wide">{p.slug}</p>
                  </div>
                  <Input type="url" placeholder="https://..." value={p.website_url}
                    onChange={(e) => setPartnerLinks(partnerLinks.map((x, j) => j === i ? { ...x, website_url: e.target.value } : x))}
                    className="rounded-xl border-border/30 bg-white/5 text-sm text-foreground placeholder:text-foreground/30" />
                  <button onClick={() => setPartnerLinks(partnerLinks.map((x, j) => j === i ? { ...x, published: !x.published } : x))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${p.published ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-border/30 text-foreground/40"}`}>
                    {p.published ? "Visivel" : "Oculto"}
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={savePartners} disabled={busy} className="mt-6 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
              <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando..." : "Salvar parceiros"}
            </Button>
          </AdminCard>
        )}

        {/* ── Logos ── */}
        {tab === "logos" && (
          <AdminCard title="Logos dos Apoiadores" desc="Faca upload da nova logo. A imagem e normalizada automaticamente para 400x300 px, fundo branco, logo centralizada.">
            <div className="mb-6 rounded-2xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/5 p-4 text-sm text-foreground/60">
              <p className="font-bold text-[#7eb5f5] mb-1">Como funciona</p>
              <p>Clique em &ldquo;Escolher logo&rdquo;, selecione o arquivo (PNG, JPG ou SVG). O painel exibe a logo original e a versao normalizada para voce confirmar antes de publicar.</p>
            </div>
            <div className="space-y-4">
              {PARTNER_SLUGS.map(({ slug, name }) => {
                const item = logoUploads.find((l) => l.slug === slug);
                return (
                  <LogoUploadRow key={slug} slug={slug} name={name} item={item ?? null}
                    onFile={(file) => addLogoFile(slug, name, file)}
                    onRemove={() => setLogoUploads((prev) => prev.filter((l) => l.slug !== slug))} />
                );
              })}
            </div>
            {logoUploads.some((l) => l.normalized && !l.processing) && (
              <Button onClick={publishLogos} disabled={busy} className="mt-8 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
                <Upload className="mr-2 h-4 w-4" />
                {busy ? "Publicando..." : `Publicar ${logoUploads.filter((l) => l.normalized && !l.processing).length} logo(s)`}
              </Button>
            )}
          </AdminCard>
        )}

        {/* ── Galeria ── */}
        {tab === "galeria" && (
          <div className="space-y-8">
            {/* Upload novas fotos */}
            <AdminCard title="Adicionar Fotos" desc="Selecione imagens e escolha o evento antes de publicar. As imagens sao redimensionadas automaticamente (max 1200x900).">
              {/* Categoria selector */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-foreground/50 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Categoria do evento</p>
                <div className="flex flex-wrap gap-2">
                  {EVENT_CATEGORIES.map((ev) => (
                    <button key={ev.id} onClick={() => setUploadCategory(ev.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-all border ${uploadCategory === ev.id ? `${ev.color} border-transparent shadow` : "border-border/30 text-foreground/50 hover:text-foreground"}`}>
                      {ev.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1B4B8A]/30 bg-[#1B4B8A]/5 p-8 text-center transition hover:border-[#1B4B8A]/60 hover:bg-[#1B4B8A]/10">
                <Upload className="mb-3 h-8 w-8 text-[#7eb5f5]" />
                <span className="font-black text-foreground">Clique para selecionar fotos</span>
                <span className="mt-1 text-sm text-foreground/50">PNG, JPG ou WEBP &middot; multipla selecao</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only"
                  onChange={(e) => setUploads(Array.from(e.target.files ?? []).map((f) => ({ file: f, url: URL.createObjectURL(f) })))} />
              </label>

              {uploads.length > 0 && (
                <>
                  <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
                    {uploads.map((item) => (
                      <div key={item.url} className="group relative aspect-square overflow-hidden rounded-xl">
                        <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
                        <button onClick={() => setUploads(uploads.filter((u) => u.url !== item.url))}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition group-hover:opacity-100">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-foreground/50">Publicar em:</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${EVENT_CATEGORIES.find((e) => e.id === uploadCategory)?.color}`}>
                      {EVENT_CATEGORIES.find((e) => e.id === uploadCategory)?.label}
                    </span>
                  </div>
                  <Button onClick={uploadImages} disabled={busy} className="mt-4 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
                    <Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando..." : `Publicar ${uploads.length} imagem(ns)`}
                  </Button>
                </>
              )}
            </AdminCard>

            {/* Imagens estaticas */}
            <AdminCard title="Fotos do Site (estaticas)" desc="Imagens que fazem parte do codigo-fonte do site, organizadas por evento.">
              {EVENT_CATEGORIES.map((ev) => {
                const items = STATIC_GALLERY.filter((g) => g.category === ev.id);
                if (!items.length) return null;
                return (
                  <div key={ev.id} className="mb-6 last:mb-0">
                    <p className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${ev.color}`}>{ev.label}</span>
                      <span className="text-xs text-foreground/40">{items.length} foto{items.length !== 1 ? "s" : ""}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                      {items.map((img) => (
                        <div key={img.src} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/20">
                          <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2">
                            <p className="text-[10px] font-bold text-white leading-tight">{img.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </AdminCard>

            {/* Fotos do Supabase */}
            <AdminCard title="Fotos do Supabase" desc="Imagens enviadas pelo admin. Clique na categoria para alterar ou oculte/exclua.">
              {loadingGallery ? (
                <p className="py-8 text-center text-sm text-foreground/40 animate-pulse">Carregando...</p>
              ) : dbGallery.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground/40">Nenhuma imagem publicada ainda.</p>
              ) : (
                EVENT_CATEGORIES.map((ev) => {
                  const items = dbGallery.filter((g) => g.category === ev.id);
                  const uncategorised = ev.id === "esporte-adaptado" ? dbGallery.filter((g) => !g.category) : [];
                  const all = ev.id === "esporte-adaptado" ? [...items, ...uncategorised] : items;
                  if (!all.length) return null;
                  return (
                    <div key={ev.id} className="mb-6 last:mb-0">
                      <p className="mb-3 flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${ev.color}`}>{ev.label}</span>
                        <span className="text-xs text-foreground/40">{all.length} foto{all.length !== 1 ? "s" : ""}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {all.map((item) => (
                          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border/20 bg-secondary/20">
                            <div className="aspect-[4/3] overflow-hidden">
                              <img src={item.image_url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                            </div>
                            <div className="p-2 space-y-1.5">
                              <p className="text-[10px] font-bold text-foreground/70 truncate">{item.title}</p>
                              {/* Category selector */}
                              <select
                                value={item.category ?? ""}
                                onChange={(e) => updateGalleryCategory(item, e.target.value as EventCategory)}
                                className="w-full rounded-lg border border-border/30 bg-background/60 px-2 py-1 text-[10px] text-foreground/70 focus:outline-none">
                                {EVENT_CATEGORIES.map((ec) => (
                                  <option key={ec.id} value={ec.id}>{ec.label}</option>
                                ))}
                              </select>
                              <div className="flex gap-1">
                                <button onClick={() => toggleGalleryPublished(item)}
                                  className={`flex-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${item.published ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-border/30 text-foreground/40"}`}>
                                  {item.published ? "Visivel" : "Oculto"}
                                </button>
                                <button onClick={() => deleteGalleryItem(item)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-400 hover:bg-red-500/20 transition-all">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </AdminCard>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── LogoUploadRow ── */
function LogoUploadRow({ slug, name, item, onFile, onRemove }: {
  slug: string; name: string;
  item: { file: File; preview: string; normalized: string | null; processing: boolean } | null;
  onFile: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl border border-border/20 bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">{name}</p>
          <p className="text-[10px] text-foreground/40 uppercase tracking-wide">{slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {item && (
            <button onClick={onRemove}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
              <X className="inline h-3 w-3 mr-1" />Remover
            </button>
          )}
          <button onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-[#1B4B8A]/40 bg-[#1B4B8A]/10 px-3 py-1.5 text-xs font-bold text-[#7eb5f5] hover:bg-[#1B4B8A]/20 transition-all">
            <Upload className="inline h-3 w-3 mr-1" />{item ? "Trocar" : "Escolher logo"}
          </button>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        </div>
      </div>
      {item && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-foreground/40">Original</p>
            <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-border/20 bg-background/40">
              <img src={item.preview} alt="original" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-foreground/40">Normalizada — 400x300, fundo branco</p>
            <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-border/20 bg-white">
              {item.processing
                ? <span className="text-xs text-foreground/40 animate-pulse">Processando...</span>
                : item.normalized
                  ? <img src={item.normalized} alt="normalizada" className="max-h-full max-w-full object-contain" />
                  : <span className="text-xs text-red-400">Erro ao processar</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Utility components ── */
function AdminCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl border border-border/30 p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-lg font-black text-foreground">{title}</p>
        <p className="text-sm text-foreground/50">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function SaveBtn({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <Button onClick={onClick} disabled={busy} className="mt-6 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
      <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando..." : "Salvar alteracoes"}
    </Button>
  );
}

function F({ label, value, onChange, multi = false }: {
  label: string; value: string; onChange: (v: string) => void; multi?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">{label}</Label>
      {multi
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
            className="rounded-xl border-border/30 bg-white/5 text-foreground resize-none" />
        : <Input value={value} onChange={(e) => onChange(e.target.value)}
            className="rounded-xl border-border/30 bg-white/5 text-foreground" />}
    </div>
  );
}
