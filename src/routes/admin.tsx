import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Globe, HandHeart, ImagePlus, LayoutDashboard,
  Link2, LogOut, Moon, QrCode, Save, Settings, Sun, Upload, Users, X,
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
type Tab = "hero" | "fundadora" | "organograma" | "depoimentos" | "pix" | "voluntario" | "parceiros" | "galeria";

const defaultPartnerLinks: PartnerLink[] = ([
  ["rua-hum", "Rua Hum"], ["escola-aquarela", "Escola Aquarela"], ["ibicolor", "Ibicolor"],
  ["vila-don-patto", "Vila Don Patto"], ["unimed-sao-roque", "Unimed São Roque"],
  ["emporio-qn", "Empório QN"], ["tia-lina", "Tia Lina"],
  ["fernando-araujo", "Fernando Araújo Artista Plástico"],
  ["qualiser", "Qualiser Contabilidade"], ["jornal-da-economia", "Jornal da Economia"],
] as const).map(([slug, name], i) => ({ slug, name, website_url: "", sort_order: i + 1, published: true }));

export default function AdminPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>(defaultPartnerLinks);
  const [uploads, setUploads] = useState<UploadPreview[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("hero");

  /* ── Tema ── */
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ameas-theme") === "light";
  });
  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light-mode", next);
    localStorage.setItem("ameas-theme", next ? "light" : "dark");
  }

  useEffect(() => {
    if (!isLoggedIn || !supabase) return;
    supabase.from("ameas_partners").select("slug,name,website_url,sort_order,published").order("sort_order")
      .then(({ data }) => { if (data?.length) setPartnerLinks(data); });
    supabase.from("ameas_site_content").select("key,value")
      .then(({ data }) => {
        if (!data) return;
        const loaded = data.reduce<SiteContent>((acc, row) => {
          if (row.key in acc) acc[row.key as keyof SiteContent] = row.value;
          return acc;
        }, { ...defaultSiteContent });
        setContent(loaded);
      });
  }, [isLoggedIn]);

  const uploadLabel = useMemo(() => `${uploads.length} ${uploads.length === 1 ? "arquivo" : "arquivos"}`, [uploads.length]);

  function login() {
    if (loginInput === ADMIN_LOGIN && password === ADMIN_PASSWORD) { setIsLoggedIn(true); setLoginError(""); }
    else setLoginError("Login ou senha incorretos.");
  }
  function onKey(e: React.KeyboardEvent) { if (e.key === "Enter") login(); }

  function notify(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  /* ── Save helpers ── */
  async function saveAll() {
    if (!supabase) return notify("Supabase não configurado.", false);
    setBusy(true);
    const rows = Object.entries(content).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("ameas_site_content").upsert(rows, { onConflict: "key" });
    setBusy(false);
    notify(error ? error.message : "Salvo com sucesso!", !error);
  }

  async function savePartners() {
    if (!supabase) return notify("Supabase não configurado.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_partners").upsert(partnerLinks, { onConflict: "slug" });
    setBusy(false);
    notify(error ? error.message : "Parceiros salvos!", !error);
  }

  async function uploadImages() {
    if (!supabase || !uploads.length) return notify("Selecione pelo menos uma imagem.", false);
    setBusy(true);
    const results = await Promise.all(uploads.map(async ({ file }) => {
      const path = `gallery/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
      const up = await supabase!.storage.from("ameas-site-media").upload(path, file, { upsert: false });
      if (up.error) return up.error.message;
      const { data } = supabase!.storage.from("ameas-site-media").getPublicUrl(path);
      const ins = await supabase!.from("ameas_gallery_items").insert({ title: file.name.replace(/\.[^.]+$/, ""), alt: "Imagem da AMEAS", image_url: data.publicUrl, sort_order: 0, published: true });
      return ins.error?.message;
    }));
    setBusy(false);
    notify(results.filter(Boolean).join(" ") || `${uploads.length} imagem(ns) publicada(s)!`);
    setUploads([]);
  }

  function set(k: keyof SiteContent, v: string) { setContent((c) => ({ ...c, [k]: v })); }

  /* ══ LOGIN ══ */
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
            <p className="mt-1 text-sm text-foreground/50">Área restrita de gerenciamento</p>
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
              ← Voltar para o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ══ PAINEL ══ */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "hero",        label: "Hero / Sobre",   icon: <Settings className="h-4 w-4" /> },
    { id: "fundadora",   label: "Fundadora",      icon: <Users className="h-4 w-4" /> },
    { id: "organograma", label: "Organograma",    icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "depoimentos", label: "Depoimentos",    icon: <CheckCircle2 className="h-4 w-4" /> },
    { id: "pix",         label: "PIX / Doação",   icon: <QrCode className="h-4 w-4" /> },
    { id: "voluntario",  label: "Voluntário",     icon: <HandHeart className="h-4 w-4" /> },
    { id: "parceiros",   label: "Parceiros",      icon: <Link2 className="h-4 w-4" /> },
    { id: "galeria",     label: "Galeria",        icon: <ImagePlus className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
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

      {/* Toast */}
      {msg && (
        <div className={`fixed right-5 top-20 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${msg.ok ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400" : "border-red-500/30 bg-red-500/15 text-red-400"}`}>
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Status",   value: "Publicado",      color: "text-emerald-400" },
            { label: "Admin",    value: "ameas",           color: "text-[#7eb5f5]" },
            { label: "Parceiros",value: `${partnerLinks.length}`, color: "text-[#38bdf8]" },
            { label: "Upload",   value: uploadLabel,       color: "text-[#f59e0b]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-2xl border border-border/30 p-4">
              <p className="text-xs text-foreground/40">{label}</p>
              <p className={`mt-1 text-base font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs scrollable */}
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
          <AdminCard title="Hero e Sobre" desc="Textos principais da página inicial.">
            <div className="grid gap-5 sm:grid-cols-2">
              <F label="Título do hero" value={content.hero_title} onChange={(v) => set("hero_title", v)} />
              <F label="WhatsApp" value={content.contact_whatsapp} onChange={(v) => set("contact_whatsapp", v)} />
              <div className="sm:col-span-2"><F label="Subtítulo do hero" value={content.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} multi /></div>
              <div className="sm:col-span-2"><F label="Texto sobre a AMEAS" value={content.about_text} onChange={(v) => set("about_text", v)} multi /></div>
              <F label="Instagram URL" value={content.instagram_url} onChange={(v) => set("instagram_url", v)} />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Fundadora ── */}
        {tab === "fundadora" && (
          <AdminCard title="Seção Fundadora" desc="Nome e textos biográficos da fundadora.">
            <div className="grid gap-5">
              <F label="Nome da fundadora" value={content.founder_name} onChange={(v) => set("founder_name", v)} />
              <F label="Biografia — parágrafo 1" value={content.founder_bio1} onChange={(v) => set("founder_bio1", v)} multi />
              <F label="Biografia — parágrafo 2" value={content.founder_bio2} onChange={(v) => set("founder_bio2", v)} multi />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Organograma ── */}
        {tab === "organograma" && (
          <AdminCard title="Organograma" desc="Nomes dos cargos exibidos no organograma hierárquico.">
            <div className="grid gap-5 sm:grid-cols-2">
              <F label="Presidente" value={content.org_president_name} onChange={(v) => set("org_president_name", v)} />
              <F label="Vice-Presidente" value={content.org_vp_name} onChange={(v) => set("org_vp_name", v)} />
              <div className="sm:col-span-2 border-t border-border/20 pt-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#7eb5f5]/70">Secretaria</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="Primeiro Secretário" value={content.org_sec1_name} onChange={(v) => set("org_sec1_name", v)} />
                  <F label="Segundo Secretário" value={content.org_sec2_name} onChange={(v) => set("org_sec2_name", v)} />
                </div>
              </div>
              <div className="sm:col-span-2 border-t border-border/20 pt-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#38bdf8]/70">Tesouraria</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="Primeiro Tesoureiro" value={content.org_treas1_name} onChange={(v) => set("org_treas1_name", v)} />
                  <F label="Segundo Tesoureiro" value={content.org_treas2_name} onChange={(v) => set("org_treas2_name", v)} />
                </div>
              </div>
              <div className="sm:col-span-2 border-t border-border/20 pt-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#E8392A]/70">Fiscalização</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="Primeiro Fiscal" value={content.org_audit1_name} onChange={(v) => set("org_audit1_name", v)} />
                  <F label="Segundo Fiscal" value={content.org_audit2_name} onChange={(v) => set("org_audit2_name", v)} />
                </div>
              </div>
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Depoimentos ── */}
        {tab === "depoimentos" && (
          <AdminCard title="Depoimentos" desc="Os três depoimentos exibidos na seção de vozes.">
            <div className="space-y-6">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="rounded-2xl border border-border/20 bg-secondary/20 p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-foreground/40">Depoimento {n}</p>
                  <div className="grid gap-4">
                    <F label="Texto da citação" value={content[`test${n}_quote` as keyof SiteContent]} onChange={(v) => set(`test${n}_quote` as keyof SiteContent, v)} multi />
                    <F label="Autor" value={content[`test${n}_author` as keyof SiteContent]} onChange={(v) => set(`test${n}_author` as keyof SiteContent, v)} />
                  </div>
                </div>
              ))}
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── PIX / Doação ── */}
        {tab === "pix" && (
          <AdminCard title="PIX e Dados Bancários" desc="Informações de doação exibidas no site e no modal de PIX.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <F label="Chave PIX (CNPJ)" value={content.pix_key} onChange={(v) => set("pix_key", v)} />
              </div>
              <F label="Banco" value={content.pix_bank} onChange={(v) => set("pix_bank", v)} />
              <F label="Agência" value={content.pix_agency} onChange={(v) => set("pix_agency", v)} />
              <F label="Conta Corrente" value={content.pix_account} onChange={(v) => set("pix_account", v)} />
            </div>
            <div className="mt-5 rounded-2xl border border-[#1B4B8A]/20 bg-[#1B4B8A]/5 p-4 text-sm text-foreground/60">
              <p className="font-bold text-[#7eb5f5] mb-1">Prévia no site:</p>
              <p>PIX CNPJ <strong className="text-foreground">{content.pix_key}</strong></p>
              <p>{content.pix_bank} · Ag. {content.pix_agency} · CC {content.pix_account}</p>
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Voluntário ── */}
        {tab === "voluntario" && (
          <AdminCard title="Seção Voluntário" desc="Título e descrição do card de voluntariado na seção Como Ajudar.">
            <div className="grid gap-5">
              <F label="Título" value={content.volunteer_title} onChange={(v) => set("volunteer_title", v)} />
              <F label="Descrição" value={content.volunteer_desc} onChange={(v) => set("volunteer_desc", v)} multi />
            </div>
            <SaveBtn onClick={saveAll} busy={busy} />
          </AdminCard>
        )}

        {/* ── Parceiros ── */}
        {tab === "parceiros" && (
          <AdminCard title="Links dos Parceiros" desc="O logo de cada parceiro ficará clicável no site. Ative/desative a visibilidade.">
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
                    {p.published ? "Visível" : "Oculto"}
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={savePartners} disabled={busy} className="mt-6 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
              <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando…" : "Salvar parceiros"}
            </Button>
          </AdminCard>
        )}

        {/* ── Galeria ── */}
        {tab === "galeria" && (
          <AdminCard title="Galeria de Fotos" desc="Selecione várias imagens. Elas vão para o storage seguro do Supabase.">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1B4B8A]/30 bg-[#1B4B8A]/5 p-8 text-center transition hover:border-[#1B4B8A]/60 hover:bg-[#1B4B8A]/10">
              <Upload className="mb-3 h-8 w-8 text-[#7eb5f5]" />
              <span className="font-black text-foreground">Clique para selecionar fotos</span>
              <span className="mt-1 text-sm text-foreground/50">PNG, JPG ou WEBP · múltipla seleção</span>
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
                <Button onClick={uploadImages} disabled={busy} className="mt-5 rounded-2xl bg-[#1B4B8A] text-white hover:bg-[#1B4B8A]/90">
                  <Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando…" : `Publicar ${uploads.length} imagem(ns)`}
                </Button>
              </>
            )}
          </AdminCard>
        )}
      </div>
    </main>
  );
}

/* ─── Componentes auxiliares ─── */

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
      <Save className="mr-2 h-4 w-4" /> {busy ? "Salvando…" : "Salvar alterações"}
    </Button>
  );
}

function F({ label, value, onChange, multi = false }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide text-foreground/50">{label}</Label>
      {multi
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="rounded-xl border-border/30 bg-white/5 text-foreground resize-none" />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border-border/30 bg-white/5 text-foreground" />}
    </div>
  );
}

// Re-export necessário para TS — Save já importado no topo
