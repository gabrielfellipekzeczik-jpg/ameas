import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Globe, ImagePlus, Instagram, LayoutDashboard,
  Link2, LogOut, MessageCircle, Save, Settings, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultSiteContent, supabase, type PartnerLink, type SiteContent } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const ADMIN_LOGIN = "ameas";
const ADMIN_PASSWORD = "123456789";

type UploadPreview = { file: File; url: string };
type Tab = "conteudo" | "parceiros" | "galeria" | "configuracoes";

const defaultPartnerLinks: PartnerLink[] = ([
  ["rua-hum", "Rua Hum"],
  ["escola-aquarela", "Escola Aquarela"],
  ["ibicolor", "Ibicolor"],
  ["vila-don-patto", "Vila Don Patto"],
  ["unimed-sao-roque", "Unimed São Roque"],
  ["emporio-qn", "Empório QN"],
  ["tia-lina", "Tia Lina"],
  ["fernando-araujo", "Fernando Araújo Artista Plástico"],
  ["qualiser", "Qualiser Contabilidade"],
  ["jornal-da-economia", "Jornal da Economia"],
] as const).map(([slug, name], sort_order) => ({ slug, name, website_url: "", sort_order: sort_order + 1, published: true }));

export default function AdminPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>(defaultPartnerLinks);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("conteudo");

  useEffect(() => {
    if (!isLoggedIn || !supabase) return;
    supabase.from("ameas_partners").select("slug,name,website_url,sort_order,published").order("sort_order").then(({ data }) => {
      if (data?.length) setPartnerLinks(data);
    });
    supabase.from("ameas_site_content").select("key,value").then(({ data }) => {
      if (!data) return;
      const loaded = data.reduce<SiteContent>((acc, row) => {
        if (row.key in acc) acc[row.key as keyof SiteContent] = row.value;
        return acc;
      }, { ...defaultSiteContent });
      setContent(loaded);
    });
  }, [isLoggedIn]);

  const uploadCountLabel = useMemo(
    () => `${uploads.length} ${uploads.length === 1 ? "arquivo" : "arquivos"}`,
    [uploads.length],
  );

  function login() {
    if (loginInput === ADMIN_LOGIN && password === ADMIN_PASSWORD) { setIsLoggedIn(true); setLoginError(""); }
    else setLoginError("Login ou senha incorretos.");
  }
  function handleLoginKey(e: React.KeyboardEvent) { if (e.key === "Enter") login(); }

  function notify(text: string, ok = true) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 3500);
  }

  async function saveContent() {
    if (!supabase) return notify("Supabase não configurado.", false);
    setBusy(true);
    const rows = Object.entries(content).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("ameas_site_content").upsert(rows, { onConflict: "key" });
    setBusy(false);
    notify(error ? error.message : "Conteúdo salvo com sucesso!", !error);
  }

  async function savePartnerLinks() {
    if (!supabase) return notify("Supabase não configurado.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_partners").upsert(partnerLinks, { onConflict: "slug" });
    setBusy(false);
    notify(error ? error.message : "Links dos parceiros salvos!", !error);
  }

  async function uploadImages() {
    if (!supabase || !uploads.length) return notify("Selecione pelo menos uma imagem.", false);
    setBusy(true);
    const results = await Promise.all(
      uploads.map(async ({ file }) => {
        const path = `gallery/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
        const up = await supabase!.storage.from("ameas-site-media").upload(path, file, { upsert: false });
        if (up.error) return up.error.message;
        const { data } = supabase!.storage.from("ameas-site-media").getPublicUrl(path);
        const ins = await supabase!.from("ameas_gallery_items").insert({ title: file.name.replace(/\.[^.]+$/, ""), alt: "Imagem da AMEAS", image_url: data.publicUrl, sort_order: 0, published: true });
        return ins.error?.message;
      }),
    );
    setBusy(false);
    notify(results.filter(Boolean).join(" ") || `${uploads.length} imagem(ns) publicada(s)!`);
    setUploads([]);
  }

  // ── LOGIN ──────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/15 blur-3xl" />

        <div className="glass-purple relative w-full max-w-sm overflow-hidden rounded-3xl border border-purple-500/30 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/15 glow-purple">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <p className="gradient-text text-2xl font-black">Painel AMEAS</p>
            <p className="mt-1 text-sm text-foreground/50">Área restrita de gerenciamento</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login" className="text-xs font-bold uppercase tracking-wide text-foreground/50">Login</Label>
              <Input id="login" type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyDown={handleLoginKey}
                placeholder="ameas" autoComplete="username"
                className="rounded-2xl border-border/40 bg-white/5 text-foreground placeholder:text-foreground/30 focus:border-primary/60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-foreground/50">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleLoginKey}
                autoComplete="current-password"
                className="rounded-2xl border-border/40 bg-white/5 text-foreground placeholder:text-foreground/30 focus:border-primary/60" />
            </div>
            {loginError && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{loginError}</p>
            )}
            <Button onClick={login} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
              Entrar no painel
            </Button>
            <Link to="/" className="block text-center text-sm text-foreground/40 hover:text-primary transition-colors">
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── PAINEL LOGADO ──────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "conteudo", label: "Textos", icon: <Settings className="h-4 w-4" /> },
    { id: "parceiros", label: "Parceiros", icon: <Link2 className="h-4 w-4" /> },
    { id: "galeria", label: "Galeria", icon: <ImagePlus className="h-4 w-4" /> },
    { id: "configuracoes", label: "Contato", icon: <MessageCircle className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 glow-purple">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">AMEAS CMS</p>
              <p className="text-sm font-black text-foreground">Painel administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden rounded-xl border border-border/40 px-3 py-1.5 text-xs font-semibold text-foreground/50 hover:text-primary sm:block transition-colors">
              <Globe className="inline h-3.5 w-3.5 mr-1" />Ver site
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}
              className="rounded-xl border border-border/30 text-xs text-foreground/50 hover:text-red-400 hover:border-red-500/30">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Toast notification */}
      {message && (
        <div className={`fixed right-5 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur transition-all ${message.ok ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"}`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Status", value: "Publicado", color: "text-emerald-400" },
            { label: "Admin", value: "ameas", color: "text-primary" },
            { label: "Parceiros", value: `${partnerLinks.length}`, color: "text-cyan-400" },
            { label: "Arquivos prontos", value: uploadCountLabel, color: "text-gold" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-2xl border border-border/30 p-5">
              <p className="text-xs text-foreground/40">{label}</p>
              <p className={`mt-1.5 text-lg font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-border/30 bg-secondary/30 p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:gap-2 ${activeTab === tab.id ? "bg-primary/20 text-primary border border-primary/30 glow-purple" : "text-foreground/50 hover:text-foreground"}`}>
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Textos ── */}
        {activeTab === "conteudo" && (
          <div className="glass rounded-3xl border border-border/30 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-lg font-black text-foreground">Textos do site</p>
              <p className="text-sm text-foreground/50">Edite os conteúdos principais sem tocar no código.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Título do hero" value={content.hero_title} onChange={(v) => setContent({ ...content, hero_title: v })} />
              <AdminField label="WhatsApp" value={content.contact_whatsapp} onChange={(v) => setContent({ ...content, contact_whatsapp: v })} />
              <div className="sm:col-span-2">
                <AdminField label="Subtítulo do hero" value={content.hero_subtitle} onChange={(v) => setContent({ ...content, hero_subtitle: v })} multiline />
              </div>
              <div className="sm:col-span-2">
                <AdminField label="Texto sobre a AMEAS" value={content.about_text} onChange={(v) => setContent({ ...content, about_text: v })} multiline />
              </div>
              <AdminField label="Chave PIX" value={content.pix_key} onChange={(v) => setContent({ ...content, pix_key: v })} />
              <AdminField label="Instagram URL" value={content.instagram_url} onChange={(v) => setContent({ ...content, instagram_url: v })} />
            </div>
            <Button onClick={saveContent} disabled={busy} className="mt-6 rounded-2xl bg-primary text-white hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando…" : "Salvar textos"}
            </Button>
          </div>
        )}

        {/* ── Tab: Parceiros ── */}
        {activeTab === "parceiros" && (
          <div className="glass rounded-3xl border border-border/30 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-lg font-black text-foreground">Links dos parceiros</p>
              <p className="text-sm text-foreground/50">O logo de cada parceiro ficará clicável no site após salvar.</p>
            </div>
            <div className="space-y-3">
              {partnerLinks.map((partner, index) => (
                <div key={partner.slug} className="grid items-center gap-3 rounded-2xl border border-border/20 bg-secondary/20 p-4 sm:grid-cols-[1fr_2fr_auto]">
                  <div>
                    <p className="text-xs font-black text-foreground/80">{partner.name}</p>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-wide">{partner.slug}</p>
                  </div>
                  <Input type="url" placeholder="https://..." value={partner.website_url}
                    onChange={(e) => setPartnerLinks(partnerLinks.map((p, i) => i === index ? { ...p, website_url: e.target.value } : p))}
                    className="rounded-xl border-border/30 bg-white/5 text-sm text-foreground placeholder:text-foreground/30" />
                  <button onClick={() => setPartnerLinks(partnerLinks.map((p, i) => i === index ? { ...p, published: !p.published } : p))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${partner.published ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-border/30 text-foreground/40"}`}>
                    {partner.published ? "Visível" : "Oculto"}
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={savePartnerLinks} disabled={busy} className="mt-6 rounded-2xl bg-primary text-white hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando…" : "Salvar parceiros"}
            </Button>
          </div>
        )}

        {/* ── Tab: Galeria ── */}
        {activeTab === "galeria" && (
          <div className="glass rounded-3xl border border-border/30 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-lg font-black text-foreground">Galeria de fotos</p>
              <p className="text-sm text-foreground/50">Selecione várias imagens de uma vez. Elas vão para o storage do Supabase.</p>
            </div>
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center transition hover:border-primary/60 hover:bg-primary/10">
              <Upload className="mb-3 h-8 w-8 text-primary" />
              <span className="font-black text-foreground">Clique para selecionar fotos</span>
              <span className="mt-1 text-sm text-foreground/50">PNG, JPG ou WEBP · múltipla seleção</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only"
                onChange={(e) => setUploads(Array.from(e.target.files ?? []).map((file) => ({ file, url: URL.createObjectURL(file) })))} />
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
                <Button onClick={uploadImages} disabled={busy} className="mt-5 rounded-2xl bg-primary text-white hover:bg-primary/90">
                  <Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando…" : `Publicar ${uploads.length} imagem(ns)`}
                </Button>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Configurações / Contato ── */}
        {activeTab === "configuracoes" && (
          <div className="glass rounded-3xl border border-border/30 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-lg font-black text-foreground">Contato e redes sociais</p>
              <p className="text-sm text-foreground/50">Atualize as informações de contato do site.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                  <MessageCircle className="inline h-3.5 w-3.5 mr-1" /> WhatsApp
                </Label>
                <Input value={content.contact_whatsapp} onChange={(e) => setContent({ ...content, contact_whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999" className="rounded-xl border-border/30 bg-white/5 text-foreground placeholder:text-foreground/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">
                  <Instagram className="inline h-3.5 w-3.5 mr-1" /> Instagram URL
                </Label>
                <Input value={content.instagram_url} onChange={(e) => setContent({ ...content, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/ameas" className="rounded-xl border-border/30 bg-white/5 text-foreground placeholder:text-foreground/30" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">Chave PIX</Label>
                <Input value={content.pix_key} onChange={(e) => setContent({ ...content, pix_key: e.target.value })}
                  className="rounded-xl border-border/30 bg-white/5 text-foreground" />
              </div>
            </div>
            <Button onClick={saveContent} disabled={busy} className="mt-6 rounded-2xl bg-primary text-white hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando…" : "Salvar configurações"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function AdminField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">{label}</Label>
      {multiline
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="rounded-xl border-border/30 bg-white/5 text-foreground placeholder:text-foreground/30 resize-none" />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border-border/30 bg-white/5 text-foreground" />}
    </div>
  );
}
