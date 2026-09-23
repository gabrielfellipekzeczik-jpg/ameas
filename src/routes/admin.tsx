import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, LayoutDashboard, LogOut, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteContent,
  supabase,
  type PartnerLink,
  type SiteContent,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin")({ component: AdminPage });

// Credenciais fixas do painel
const ADMIN_LOGIN = "ameas";
const ADMIN_PASSWORD = "123456789";

type UploadPreview = { file: File; url: string };

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
  const [message, setMessage] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !supabase) return;
    supabase.from("ameas_partners").select("slug,name,website_url,sort_order,published").order("sort_order").then(({ data: partners }) => {
      if (partners?.length) setPartnerLinks(partners);
    });
  }, [isLoggedIn]);

  const uploadCountLabel = useMemo(
    () => `${uploads.length} ${uploads.length === 1 ? "imagem selecionada" : "imagens selecionadas"}`,
    [uploads.length],
  );

  function login() {
    if (loginInput === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Login ou senha incorretos.");
    }
  }

  function handleLoginKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") login();
  }

  async function saveContent() {
    if (!supabase) return setMessage("Supabase ainda não configurado. O formulário está pronto para conexão.");
    setBusy(true);
    const rows = Object.entries(content).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("ameas_site_content").upsert(rows, { onConflict: "key" });
    setBusy(false);
    setMessage(error ? error.message : "Conteúdo salvo com sucesso.");
  }

  async function savePartnerLinks() {
    if (!supabase) return setMessage("Supabase ainda não configurado.");
    setBusy(true);
    const { error } = await supabase.from("ameas_partners").upsert(partnerLinks, { onConflict: "slug" });
    setBusy(false);
    setMessage(error ? error.message : "Links dos parceiros salvos com sucesso.");
  }

  async function uploadImages() {
    const client = supabase;
    if (!client || !uploads.length) return setMessage("Selecione pelo menos uma imagem.");
    setBusy(true);
    const results = await Promise.all(
      uploads.map(async ({ file }) => {
        const path = `gallery/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
        const upload = await client.storage.from("ameas-site-media").upload(path, file, { upsert: false });
        if (upload.error) return upload.error.message;
        const { data } = client.storage.from("ameas-site-media").getPublicUrl(path);
        const insert = await client.from("ameas_gallery_items").insert({
          title: file.name.replace(/\.[^.]+$/, ""),
          alt: "Imagem da AMEAS",
          image_url: data.publicUrl,
          sort_order: 0,
          published: true,
        });
        return insert.error?.message;
      }),
    );
    setBusy(false);
    setMessage(results.filter(Boolean).join(" ") || "Imagens publicadas na galeria.");
    setUploads([]);
  }

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
        <Card className="w-full max-w-sm rounded-3xl border-0 shadow-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-brand-navy">
              <LayoutDashboard />
            </div>
            <CardTitle className="text-2xl text-brand-navy">Painel AMEAS</CardTitle>
            <p className="text-sm text-muted-foreground">Área restrita</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={handleLoginKey}
                placeholder="ameas"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleLoginKey}
                autoComplete="current-password"
              />
            </div>
            {loginError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{loginError}</p>}
            <Button className="w-full bg-heart text-heart-foreground hover:bg-heart/90" onClick={login}>
              Entrar
            </Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-brand-navy">
              ← Voltar para o site
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/40 text-foreground">
      <header className="border-b border-border bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-heart">AMEAS CMS</p><h1 className="text-xl font-black text-brand-navy sm:text-2xl">Painel administrativo</h1></div>
          <div className="flex items-center gap-2"><Link to="/" className="hidden text-sm font-semibold text-muted-foreground hover:text-brand-navy sm:block">Ver site</Link><Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)}><LogOut className="mr-2 h-4 w-4" /> Sair</Button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr] lg:py-10">
        <aside className="hidden rounded-3xl bg-brand-navy p-5 text-primary-foreground lg:block"><p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50">Gerenciamento</p><div className="mt-5 space-y-3 text-sm"><div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 p-3"><LayoutDashboard className="h-4 w-4 text-gold" /> Visão geral</div><div className="flex items-center gap-3 p-3 text-primary-foreground/60"><ImagePlus className="h-4 w-4" /> Galeria e mídia</div></div></aside>
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Status</p><p className="mt-2 font-black text-green-700">Publicado</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Administrador</p><p className="mt-2 truncate font-black text-brand-navy">ameas</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Mídia</p><p className="mt-2 font-black text-brand-navy">{uploadCountLabel}</p></CardContent></Card></div>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-brand-navy">Textos principais</CardTitle><p className="text-sm text-muted-foreground">Altere o conteúdo sem editar o código do site.</p></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><Field label="Título do hero" value={content.hero_title} onChange={(value) => setContent({ ...content, hero_title: value })} /><Field label="WhatsApp" value={content.contact_whatsapp} onChange={(value) => setContent({ ...content, contact_whatsapp: value })} /><div className="sm:col-span-2"><Field label="Subtítulo do hero" value={content.hero_subtitle} onChange={(value) => setContent({ ...content, hero_subtitle: value })} multiline /></div><div className="sm:col-span-2"><Field label="Texto sobre a AMEAS" value={content.about_text} onChange={(value) => setContent({ ...content, about_text: value })} multiline /></div><Field label="Chave PIX" value={content.pix_key} onChange={(value) => setContent({ ...content, pix_key: value })} /><Field label="Instagram" value={content.instagram_url} onChange={(value) => setContent({ ...content, instagram_url: value })} /><Button className="sm:col-span-2 sm:w-fit" onClick={saveContent} disabled={busy}><Save className="mr-2 h-4 w-4" /> Salvar alterações</Button></CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-brand-navy">Páginas dos parceiros</CardTitle><p className="text-sm text-muted-foreground">Cole a URL do site ou Instagram. O logo ficará clicável na página pública.</p></CardHeader><CardContent className="space-y-4">{partnerLinks.map((partner, index) => <div key={partner.slug} className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr] sm:items-center"><Label htmlFor={`partner-${partner.slug}`} className="font-bold text-brand-navy">{partner.name}</Label><Input id={`partner-${partner.slug}`} type="url" placeholder="https://..." value={partner.website_url} onChange={(event) => setPartnerLinks(partnerLinks.map((item, itemIndex) => itemIndex === index ? { ...item, website_url: event.target.value } : item))} /></div>)}<Button onClick={savePartnerLinks} disabled={busy}><Save className="mr-2 h-4 w-4" /> Salvar links dos parceiros</Button></CardContent></Card>
          <Card className="rounded-3xl"><CardHeader><CardTitle className="text-brand-navy">Galeria de fotos</CardTitle><p className="text-sm text-muted-foreground">Selecione várias imagens de uma vez. Elas vão para o Storage seguro do Supabase.</p></CardHeader><CardContent><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-6 text-center transition hover:border-heart hover:bg-secondary"><Upload className="mb-3 h-7 w-7 text-heart" /><span className="font-bold text-brand-navy">Selecionar fotos</span><span className="mt-1 text-sm text-muted-foreground">PNG, JPG ou WEBP · múltipla seleção</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={(event) => setUploads(Array.from(event.target.files ?? []).map((file) => ({ file, url: URL.createObjectURL(file) })))} /></label>{uploads.length > 0 && <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{uploads.map((item) => <div key={item.url} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary"><img src={item.url} alt={item.file.name} className="h-full w-full object-cover" /><button className="absolute right-1 top-1 rounded-full bg-brand-navy/80 p-1 text-white" onClick={() => setUploads(uploads.filter((current) => current.url !== item.url))}><X className="h-3 w-3" /></button></div>)}</div><Button className="mt-5" onClick={uploadImages} disabled={busy}><Upload className="mr-2 h-4 w-4" /> {busy ? "Enviando…" : "Publicar imagens"}</Button></>}{message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}</CardContent></Card>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label>{multiline ? <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} /> : <Input value={value} onChange={(event) => onChange(event.target.value)} />}</div>;
}
