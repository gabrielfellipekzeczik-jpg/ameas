import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle, ArrowDown, ArrowUp, Briefcase, CheckCircle2, Eye, EyeOff, Globe, HandHeart,
  Handshake, Home, ImagePlus, Images, Info, LogOut, Menu, Pencil, Phone, Plus, QrCode,
  Quote, RotateCcw, Save, Target, Trash2, Upload, UserRound, Users, X,
} from "lucide-react";
import logoAsset from "@/assets/ameas-logo.png";
import {
  defaultGalleryCategories, defaultSiteContent, getContentRows, mergeContent, supabase,
  type GalleryCategory, type PartnerLink, type SiteContent,
} from "@/lib/supabase";
import {
  MAX_HERO_SLIDES, SECTIONS, parseStringList, pick,
  type Field, type Group, type HeroSlide, type SectionDef,
} from "@/lib/cms-schema";
import {
  BUILTIN_PHOTOS, DEFAULT_FIELD_IMAGES, getHeroSlides, resolveImage,
} from "@/lib/builtin-images";
import { uploadSiteImage } from "@/lib/media";
import { STATIC_GALLERY } from "@/lib/gallery-static";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const ADMIN_LOGIN = "ameas";
const ADMIN_PASSWORD = "123456789";

type Notify = (text: string, ok?: boolean) => void;

const SECTION_ICONS: Record<string, ReactNode> = {
  inicio: <Home className="h-[18px] w-[18px]" />,
  sobre: <Info className="h-[18px] w-[18px]" />,
  fundadora: <UserRound className="h-[18px] w-[18px]" />,
  missao: <Target className="h-[18px] w-[18px]" />,
  servicos: <Briefcase className="h-[18px] w-[18px]" />,
  familias: <Users className="h-[18px] w-[18px]" />,
  doacoes: <QrCode className="h-[18px] w-[18px]" />,
  voluntariado: <HandHeart className="h-[18px] w-[18px]" />,
  parceiros: <Handshake className="h-[18px] w-[18px]" />,
  galeria: <Images className="h-[18px] w-[18px]" />,
  depoimentos: <Quote className="h-[18px] w-[18px]" />,
  contato: <Phone className="h-[18px] w-[18px]" />,
};

const NAV_GROUPS: { title: string; ids: string[] }[] = [
  { title: "Página inicial", ids: ["inicio", "sobre", "fundadora", "missao", "servicos", "familias"] },
  { title: "Apoio", ids: ["doacoes", "voluntariado", "parceiros"] },
  { title: "Comunidade", ids: ["galeria", "depoimentos", "contato"] },
];

const COLOR_PALETTE = [
  { label: "Azul",     value: "bg-[#1B4B8A] text-white" },
  { label: "Vermelho", value: "bg-[#E8392A] text-white" },
  { label: "Verde",    value: "bg-[#059669] text-white" },
  { label: "Roxo",     value: "bg-[#7c3aed] text-white" },
  { label: "Laranja",  value: "bg-[#f59e0b] text-black" },
  { label: "Rosa",     value: "bg-[#db2777] text-white" },
  { label: "Ciano",    value: "bg-[#0891b2] text-white" },
  { label: "Cinza",    value: "bg-[#475569] text-white" },
];

const defaultPartnerLinks: PartnerLink[] = [
  { slug: "rua-hum",            name: "Rua Hum",                          website_url: "https://www.instagram.com/ruahum",                sort_order: 1,  published: true },
  { slug: "escola-aquarela",    name: "Escola Aquarela",                  website_url: "https://www.instagram.com/escolaaquarelasr",      sort_order: 2,  published: true },
  { slug: "ibicolor",           name: "Ibicolor",                         website_url: "https://www.instagram.com/ibicolor_sr",           sort_order: 3,  published: true },
  { slug: "vila-don-patto",     name: "Vila Don Patto",                   website_url: "https://www.instagram.com/viladonpatto",          sort_order: 4,  published: true },
  { slug: "unimed-sao-roque",   name: "Unimed São Roque",                 website_url: "https://www.unimed.coop.br/site/web/saoroque",    sort_order: 5,  published: true },
  { slug: "emporio-qn",         name: "Empório QN",                       website_url: "",                                                sort_order: 6,  published: true },
  { slug: "tia-lina",           name: "Tia Lina",                         website_url: "https://www.instagram.com/cantinatialina",        sort_order: 7,  published: true },
  { slug: "fernando-araujo",    name: "Fernando Araújo Artista Plástico", website_url: "https://www.instagram.com/araujoartistaplastico", sort_order: 8,  published: true },
  { slug: "qualiser",           name: "Qualiser Contabilidade",           website_url: "",                                                sort_order: 9,  published: true },
  { slug: "jornal-da-economia", name: "Jornal da Economia",               website_url: "",                                                sort_order: 10, published: true },
];

type DbGalleryItem = {
  id: string; title: string; alt: string; image_url: string;
  category: string | null; sort_order: number; published: boolean;
};
type LogoState = { preview: string; normalized: string | null; processing: boolean };

/* Logo normalizada: 400x300, fundo branco, centralizada */
function normalizeLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const W = 400, H = 300, PAD = 24;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("canvas")); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min((W - PAD * 2) / img.naturalWidth, (H - PAD * 2) / img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, Math.round((W - w) / 2), Math.round((H - h) / 2), w, h);
      resolve(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = URL.createObjectURL(file);
  });
}

function uid() { return Math.random().toString(36).slice(2, 10); }
function slugify(label: string) {
  return label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* ══════════════════════════ PÁGINA ══════════════════════════ */
export default function AdminPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [baseline, setBaseline] = useState<SiteContent>(defaultSiteContent);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [partnerLinks, setPartnerLinks] = useState<PartnerLink[]>(defaultPartnerLinks);

  const [section, setSection] = useState<string>("inicio");
  const [navOpen, setNavOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  /* sessão simples (some ao fechar a aba) */
  useEffect(() => {
    try { if (sessionStorage.getItem("ameas-admin") === "1") setIsLoggedIn(true); } catch { /* ignora */ }
  }, []);

  const notify: Notify = (text, ok = true) => {
    setMsg({ text, ok });
    window.setTimeout(() => setMsg(null), 4500);
  };

  /* carrega tudo ao entrar */
  useEffect(() => {
    if (!isLoggedIn || !supabase) return;
    let alive = true;
    getContentRows().then((rows) => {
      if (!alive) return;
      const merged = mergeContent(rows);
      setContent(merged);
      setBaseline(merged);
      const l: Record<string, string> = {};
      for (const [k, v] of Object.entries(rows)) if (k.startsWith("logo_b64_")) l[k.slice(9)] = v;
      setLogos(l);
    });
    supabase.from("ameas_partners").select("slug,name,website_url,sort_order,published").order("sort_order")
      .then(({ data }) => { if (alive && data?.length) setPartnerLinks(data); });
    return () => { alive = false; };
  }, [isLoggedIn]);

  const dirtyKeys = useMemo(
    () => Object.keys(defaultSiteContent).filter((k) => pick(content, k) !== pick(baseline, k)),
    [content, baseline],
  );
  const dirty = dirtyKeys.length > 0;

  /* avisa antes de fechar a aba com alterações não salvas */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  function setField(key: string, value: string) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  function login() {
    if (loginInput === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true); setLoginError("");
      try { sessionStorage.setItem("ameas-admin", "1"); } catch { /* ignora */ }
    } else setLoginError("Login ou senha incorretos.");
  }
  function logout() {
    if (dirty && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    setIsLoggedIn(false);
    try { sessionStorage.removeItem("ameas-admin"); } catch { /* ignora */ }
  }

  async function saveContent() {
    if (!supabase) return notify("Supabase não configurado.", false);
    if (!dirty) return notify("Nenhuma alteração para salvar.");
    setBusy(true);
    const rows = dirtyKeys.map((key) => ({ key, value: pick(content, key) }));
    const { error } = await supabase.from("ameas_site_content").upsert(rows, { onConflict: "key" });
    setBusy(false);
    if (error) return notify(`Não foi possível salvar: ${error.message}`, false);
    setBaseline(content);
    notify("Alterações salvas! O site já está atualizado.");
  }

  /* ══ LOGIN ══ */
  if (!isLoggedIn) {
    return (
      <main className="adm flex min-h-screen items-center justify-center px-4">
        <div className="adm-card w-full max-w-sm overflow-hidden">
          <div className="adm-side px-8 py-7 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <img src={logoAsset} alt="AMEAS" className="h-full w-full object-contain" />
            </span>
            <p className="mt-4 text-xl font-extrabold text-white">Painel AMEAS</p>
            <p className="mt-0.5 text-sm text-[#cfdcf0]">Área restrita</p>
          </div>
          <div className="space-y-4 p-8">
            <div>
              <label htmlFor="login" className="adm-label">Login</label>
              <input id="login" className="adm-input" value={loginInput} autoComplete="username"
                onChange={(e) => setLoginInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
            <div>
              <label htmlFor="pw" className="adm-label">Senha</label>
              <input id="pw" type="password" className="adm-input" value={password} autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
            {loginError && (
              <p role="alert" className="rounded-lg border border-[#f2c4bf] bg-[#fdecea] px-3 py-2 text-sm font-semibold text-[#a3281c]">{loginError}</p>
            )}
            <button onClick={login} className="adm-btn adm-btn-primary w-full">Entrar</button>
            <Link to="/" className="adm-mute block text-center text-sm font-semibold hover:underline">← Voltar ao site</Link>
          </div>
        </div>
      </main>
    );
  }

  /* ══ PAINEL ══ */
  const current: SectionDef = SECTIONS.find((s) => s.id === section && !s.hidden) ?? SECTIONS[0]!;

  return (
    <div className="adm min-h-screen">
      {/* fundo escuro do menu no celular */}
      {navOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} aria-hidden="true" />}

      {/* ── MENU LATERAL ── */}
      <aside
        className={`adm-side fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col transition-transform duration-200 lg:translate-x-0 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Menu do painel"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
            <img src={logoAsset} alt="AMEAS" className="h-full w-full object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8fb4e8]">AMEAS CMS</p>
            <p className="truncate text-sm font-extrabold text-white">Painel administrativo</p>
          </div>
          <button onClick={() => setNavOpen(false)} aria-label="Fechar menu"
            className="ml-auto rounded-lg p-1.5 text-[#cfdcf0] hover:bg-white/10 lg:hidden"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-1.5 px-3 text-[11px] font-extrabold uppercase tracking-widest text-[#8fb4e8]">{g.title}</p>
              <div className="space-y-0.5">
                {g.ids.map((id) => {
                  const s = SECTIONS.find((x) => x.id === id);
                  if (!s) return null;
                  const active = section === id;
                  return (
                    <button key={id} className="adm-nav-item" aria-current={active ? "page" : undefined}
                      onClick={() => { setSection(id); setNavOpen(false); window.scrollTo({ top: 0 }); }}>
                      {SECTION_ICONS[id]}
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 px-3 py-3">
          <Link to="/" className="adm-nav-item"><Globe className="h-[18px] w-[18px]" /> Ver o site</Link>
          <button className="adm-nav-item" onClick={logout}><LogOut className="h-[18px] w-[18px]" /> Sair</button>
        </div>
      </aside>

      {/* ── CONTEÚDO ── */}
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[color:var(--adm-line)] bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
          <button onClick={() => setNavOpen(true)} aria-label="Abrir menu"
            className="adm-btn adm-btn-ghost adm-btn-sm lg:hidden"><Menu className="h-4 w-4" /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold">{current.title}</p>
            <p className="adm-mute hidden text-xs sm:block">
              {dirty ? `${dirtyKeys.length} alteração(ões) ainda não salva(s)` : "Tudo salvo"}
            </p>
          </div>
          <span className={`adm-chip ${dirty ? "bg-[#fff3d6] text-[#8a5a00]" : "adm-ok-chip"}`}>
            {dirty ? "Não salvo" : <><CheckCircle2 className="h-3.5 w-3.5" /> Salvo</>}
          </span>
          <button onClick={saveContent} disabled={busy || !dirty} className="adm-btn adm-btn-primary">
            <Save className="h-4 w-4" /> {busy ? "Salvando…" : "Salvar alterações"}
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
          <div>
            <h1 className="text-2xl font-extrabold">{current.title}</h1>
            <p className="adm-mute mt-1 text-sm">{current.desc}</p>
          </div>

          {current.special === "hero" && (
            <HeroEditor content={content} setField={setField} notify={notify} />
          )}

          {current.groups.map((g) => (
            <GroupCard key={g.title} group={g} content={content} setField={setField} notify={notify} />
          ))}

          {current.special === "partners" && (
            <PartnersEditor
              partnerLinks={partnerLinks} setPartnerLinks={setPartnerLinks}
              logos={logos} setLogos={setLogos} notify={notify}
            />
          )}

          {current.special === "gallery" && (
            <GalleryEditor content={content} setField={setField} notify={notify} />
          )}
        </main>
      </div>

      {msg && (
        <div role="status" className={`adm-toast ${msg.ok ? "adm-toast-ok" : "adm-toast-err"}`}>
          {msg.ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} {msg.text}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ Formulários genéricos ══════════════════ */
function GroupCard({ group, content, setField, notify }: {
  group: Group; content: SiteContent; setField: (k: string, v: string) => void; notify: Notify;
}) {
  return (
    <section className="adm-card p-5 sm:p-6">
      <h2 className="text-base font-extrabold">{group.title}</h2>
      {group.desc && <p className="adm-mute mt-1 text-sm">{group.desc}</p>}
      <div className={`mt-4 grid gap-4 ${group.cols === 2 ? "md:grid-cols-2" : ""}`}>
        {group.fields.map((fl) => (
          <div key={fl.key} className={fl.type === "text" ? "" : group.cols === 2 ? "md:col-span-2" : ""}>
            <FieldInput field={fl} value={pick(content, fl.key)} onChange={(v) => setField(fl.key, v)} notify={notify} />
          </div>
        ))}
      </div>
    </section>
  );
}

function FieldInput({ field, value, onChange, notify }: {
  field: Field; value: string; onChange: (v: string) => void; notify: Notify;
}) {
  const id = `f-${field.key}`;
  if (field.type === "image") {
    return (
      <ImageField
        label={field.label} hint={field.hint} value={value}
        fallback={DEFAULT_FIELD_IMAGES[field.key] ?? ""}
        folder="site" onChange={onChange} notify={notify}
      />
    );
  }
  return (
    <div>
      <label htmlFor={id} className="adm-label">{field.label}</label>
      {field.type === "text" ? (
        <input id={id} className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <textarea id={id} rows={field.type === "code" ? 2 : 3}
          className={`adm-input ${field.type === "code" ? "adm-code" : ""}`}
          placeholder={field.type === "code" ? "00020126…" : undefined}
          value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.hint && <p className="adm-hint">{field.hint}</p>}
    </div>
  );
}

function ImageField({ label, hint, value, fallback, folder, onChange, notify }: {
  label: string; hint?: string | undefined; value: string; fallback: string; folder: string;
  onChange: (url: string) => void; notify: Notify;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const shown = resolveImage(value) || fallback;

  async function onFile(file: File) {
    setUploading(true);
    try {
      const { url, viaStorage } = await uploadSiteImage(file, folder);
      onChange(url);
      notify(viaStorage ? "Foto enviada. Clique em “Salvar alterações”." : "Foto pronta. Clique em “Salvar alterações”.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro ao enviar a foto.", false);
    }
    setUploading(false);
  }

  return (
    <div>
      <span className="adm-label">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div className="adm-img-box h-32 w-44">
          {shown
            ? <img src={shown} alt="" className="h-full w-full object-contain" />
            : <span className="adm-mute text-xs">Sem foto</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="adm-btn adm-btn-primary adm-btn-sm" disabled={uploading}
            onClick={() => inputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> {uploading ? "Enviando…" : "Trocar foto"}
          </button>
          {value && (
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onChange("")}>
              <RotateCcw className="h-3.5 w-3.5" /> Voltar à original
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
            onChange={(e) => { const fl = e.target.files?.[0]; if (fl) void onFile(fl); e.target.value = ""; }} />
        </div>
      </div>
      {hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
}

/* ══════════════════ Carrossel inicial ══════════════════ */
function HeroEditor({ content, setField, notify }: {
  content: SiteContent; setField: (k: string, v: string) => void; notify: Notify;
}) {
  const slides = getHeroSlides(content);
  const usingDefault = !content.hero_slides;

  function commit(next: HeroSlide[]) { setField("hero_slides", JSON.stringify(next)); }
  function update(i: number, patch: Partial<HeroSlide>) {
    commit(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    const a = next[i]; const b = next[j];
    if (!a || !b) return;
    next[i] = b; next[j] = a;
    commit(next);
  }
  function remove(i: number) {
    if (!window.confirm("Remover este slide do carrossel?")) return;
    commit(slides.filter((_, j) => j !== i));
  }
  function add() {
    if (slides.length >= MAX_HERO_SLIDES) return notify(`O máximo é ${MAX_HERO_SLIDES} slides.`, false);
    commit([...slides, { id: uid(), image: "", title: "Novo slide", subtitle: "", cta_label: "", cta_link: "", active: true }]);
  }
  function restore() {
    if (!window.confirm("Voltar aos 3 slides originais? Suas alterações no carrossel serão descartadas (depois de salvar).")) return;
    setField("hero_slides", "");
  }

  return (
    <section className="adm-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">Slides do carrossel</h2>
          <p className="adm-mute mt-1 text-sm">
            Cada slide tem uma foto, um título, um texto e, se quiser, um botão. Eles passam na ordem abaixo.
            {usingDefault && " Hoje o site usa os 3 slides originais — editar qualquer um já cria a sua versão."}
          </p>
        </div>
        <div className="flex gap-2">
          {!usingDefault && (
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={restore}><RotateCcw className="h-3.5 w-3.5" /> Restaurar originais</button>
          )}
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={add} disabled={slides.length >= MAX_HERO_SLIDES}>
            <Plus className="h-3.5 w-3.5" /> Novo slide
          </button>
        </div>
      </div>

      <datalist id="adm-links">
        <option value="#ajudar">Como ajudar / doação</option>
        <option value="#voluntario">Voluntariado</option>
        <option value="#sobre">Sobre</option>
        <option value="#servicos">Serviços</option>
        <option value="#galeria">Galeria</option>
        <option value="#parceiros">Parceiros</option>
        <option value="#contato">Contato</option>
      </datalist>

      <div className="mt-5 space-y-4">
        {slides.length === 0 && (
          <p className="adm-sub adm-mute p-5 text-center text-sm">Nenhum slide. Clique em “Novo slide” para começar.</p>
        )}
        {slides.map((s, i) => (
          <SlideCard key={s.id} slide={s} index={i} total={slides.length}
            onChange={(p) => update(i, p)} onMove={(d) => move(i, d)} onRemove={() => remove(i)} notify={notify} />
        ))}
      </div>
    </section>
  );
}

function SlideCard({ slide, index, total, onChange, onMove, onRemove, notify }: {
  slide: HeroSlide; index: number; total: number;
  onChange: (p: Partial<HeroSlide>) => void; onMove: (d: -1 | 1) => void; onRemove: () => void; notify: Notify;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const src = resolveImage(slide.image);
  const builtinKey = slide.image.startsWith("builtin:") ? slide.image : "";

  async function onFile(file: File) {
    setUploading(true);
    try {
      const { url } = await uploadSiteImage(file, "hero");
      onChange({ image: url });
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro ao enviar a foto.", false);
    }
    setUploading(false);
  }

  return (
    <article className={`adm-sub p-4 ${slide.active ? "" : "opacity-75"}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="adm-chip bg-[color:var(--adm-blue)] text-white">Slide {index + 1}</span>
        <span className={`adm-chip ${slide.active ? "adm-ok-chip" : "adm-off-chip"}`}>{slide.active ? "Aparece no site" : "Oculto"}</span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onChange({ active: !slide.active })}>
            {slide.active ? <><EyeOff className="h-3.5 w-3.5" /> Ocultar</> : <><Eye className="h-3.5 w-3.5" /> Mostrar</>}
          </button>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima"><ArrowUp className="h-3.5 w-3.5" /></button>
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Mover para baixo"><ArrowDown className="h-3.5 w-3.5" /></button>
          <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <div className="adm-img-box aspect-[4/3] w-full bg-white">
            {src ? <img src={src} alt="" className="h-full w-full object-contain" />
                 : <span className="adm-mute px-2 text-center text-xs">Sem foto — escolha uma</span>}
          </div>
          <div className="mt-2 grid gap-2">
            <button className="adm-btn adm-btn-primary adm-btn-sm w-full" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Enviando…" : "Enviar nova foto"}
            </button>
            <label className="sr-only" htmlFor={`pick-${slide.id}`}>Usar foto do site</label>
            <select id={`pick-${slide.id}`} className="adm-input py-1.5! text-xs!" value={builtinKey}
              onChange={(e) => e.target.value && onChange({ image: e.target.value })}>
              <option value="">{slide.image && !builtinKey ? "Foto enviada ✓" : "Usar foto do site…"}</option>
              {Object.entries(BUILTIN_PHOTOS).map(([k, v]) => <option key={k} value={`builtin:${k}`}>{v.label}</option>)}
            </select>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
              onChange={(e) => { const fl = e.target.files?.[0]; if (fl) void onFile(fl); e.target.value = ""; }} />
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="adm-label" htmlFor={`t-${slide.id}`}>Título</label>
            <input id={`t-${slide.id}`} className="adm-input" value={slide.title} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div>
            <label className="adm-label" htmlFor={`s-${slide.id}`}>Texto abaixo do título</label>
            <textarea id={`s-${slide.id}`} rows={2} className="adm-input" value={slide.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="adm-label" htmlFor={`cl-${slide.id}`}>Texto do botão</label>
              <input id={`cl-${slide.id}`} className="adm-input" placeholder="Ex.: Fazer Doação" value={slide.cta_label} onChange={(e) => onChange({ cta_label: e.target.value })} />
            </div>
            <div>
              <label className="adm-label" htmlFor={`ck-${slide.id}`}>Para onde o botão leva</label>
              <input id={`ck-${slide.id}`} list="adm-links" className="adm-input" placeholder="#ajudar ou https://…" value={slide.cta_link} onChange={(e) => onChange({ cta_link: e.target.value })} />
            </div>
          </div>
          <p className="adm-hint mt-0!">Deixe o texto do botão em branco para o slide não ter botão (o botão de WhatsApp continua).</p>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════ Parceiros ══════════════════ */
function PartnersEditor({ partnerLinks, setPartnerLinks, logos, setLogos, notify }: {
  partnerLinks: PartnerLink[]; setPartnerLinks: (p: PartnerLink[]) => void;
  logos: Record<string, string>; setLogos: (fn: (l: Record<string, string>) => Record<string, string>) => void;
  notify: Notify;
}) {
  const [busy, setBusy] = useState(false);
  const [logoMap, setLogoMap] = useState<Record<string, LogoState>>({});

  async function savePartners() {
    if (!supabase) return notify("Supabase não configurado.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_partners").upsert(partnerLinks, { onConflict: "slug" });
    setBusy(false);
    notify(error ? error.message : "Parceiros salvos!", !error);
  }

  async function handleLogoFile(slug: string, file: File) {
    setLogoMap((m) => ({ ...m, [slug]: { preview: URL.createObjectURL(file), normalized: null, processing: true } }));
    try {
      const dataUrl = await normalizeLogo(file);
      setLogoMap((m) => { const cur = m[slug]; return cur ? { ...m, [slug]: { ...cur, normalized: dataUrl, processing: false } } : m; });
    } catch {
      setLogoMap((m) => { const n = { ...m }; delete n[slug]; return n; });
      notify("Erro ao processar a logo.", false);
    }
  }

  async function saveLogo(slug: string) {
    const item = logoMap[slug];
    if (!item?.normalized || !supabase) return notify("Aguarde o processamento da logo.", false);
    setBusy(true);
    const { error } = await supabase.from("ameas_site_content")
      .upsert({ key: `logo_b64_${slug}`, value: item.normalized }, { onConflict: "key" });
    setBusy(false);
    if (error) return notify(`Erro: ${error.message}`, false);
    const saved = item.normalized;
    setLogos((l) => ({ ...l, [slug]: saved }));
    setLogoMap((m) => { const n = { ...m }; delete n[slug]; return n; });
    notify("Logo salva!");
  }

  return (
    <section className="adm-card p-5 sm:p-6">
      <h2 className="text-base font-extrabold">Apoiadores</h2>
      <p className="adm-mute mt-1 text-sm">
        Link (site ou Instagram), visibilidade e logo de cada parceiro. As logos são salvas na hora; links e visibilidade
        precisam do botão “Salvar parceiros”.
      </p>
      <div className="mt-4 space-y-3">
        {partnerLinks.map((p, i) => {
          const ls = logoMap[p.slug];
          const savedLogo = logos[p.slug];
          return (
            <div key={p.slug} className="adm-sub p-4">
              <div className="grid items-center gap-3 md:grid-cols-[200px_1fr_auto]">
                <p className="text-sm font-extrabold">{p.name}</p>
                <div>
                  <label className="sr-only" htmlFor={`pl-${p.slug}`}>Link de {p.name}</label>
                  <input id={`pl-${p.slug}`} type="url" className="adm-input" placeholder="https://…" value={p.website_url}
                    onChange={(e) => setPartnerLinks(partnerLinks.map((x, j) => (j === i ? { ...x, website_url: e.target.value } : x)))} />
                </div>
                <button type="button"
                  onClick={() => setPartnerLinks(partnerLinks.map((x, j) => (j === i ? { ...x, published: !x.published } : x)))}
                  className={`adm-btn adm-btn-sm ${p.published ? "adm-ok-chip" : "adm-off-chip"}`} style={{ border: "1px solid var(--adm-line-2)" }}>
                  {p.published ? <><Eye className="h-3.5 w-3.5" /> Visível</> : <><EyeOff className="h-3.5 w-3.5" /> Oculto</>}
                </button>
              </div>
              <LogoRow
                state={ls ?? null} savedLogo={savedLogo ?? null} busy={busy}
                onFile={(file) => void handleLogoFile(p.slug, file)}
                onCancel={() => setLogoMap((m) => { const n = { ...m }; delete n[p.slug]; return n; })}
                onSave={() => void saveLogo(p.slug)}
              />
            </div>
          );
        })}
      </div>
      <button onClick={savePartners} disabled={busy} className="adm-btn adm-btn-primary mt-5">
        <Save className="h-4 w-4" /> {busy ? "Salvando…" : "Salvar parceiros"}
      </button>
    </section>
  );
}

function LogoRow({ state, savedLogo, busy, onFile, onCancel, onSave }: {
  state: LogoState | null; savedLogo: string | null; busy: boolean;
  onFile: (f: File) => void; onCancel: () => void; onSave: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const picker = (
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
      onChange={(e) => { const fl = e.target.files?.[0]; if (fl) onFile(fl); e.target.value = ""; }} />
  );
  if (!state) {
    return (
      <div className="mt-3 flex items-center gap-3">
        {savedLogo && (
          <span className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg border border-[color:var(--adm-line)] bg-white">
            <img src={savedLogo} alt="Logo atual" className="max-h-full max-w-full object-contain" />
          </span>
        )}
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> {savedLogo ? "Trocar logo" : "Enviar logo"}
        </button>
        {picker}
      </div>
    );
  }
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-[color:var(--adm-line)] bg-white p-3">
      <div>
        <p className="adm-mute mb-1 text-[11px] font-bold uppercase">Original</p>
        <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-[color:var(--adm-line)] bg-[#f7f9fd]">
          <img src={state.preview} alt="Original" className="max-h-full max-w-full object-contain" />
        </div>
      </div>
      <div>
        <p className="adm-mute mb-1 text-[11px] font-bold uppercase">Como vai ficar</p>
        <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-[color:var(--adm-line)] bg-white">
          {state.processing ? <span className="adm-mute text-[11px]">Processando…</span>
            : state.normalized ? <img src={state.normalized} alt="Prévia" className="max-h-full max-w-full object-contain" />
            : <span className="text-[11px] text-[#a3281c]">Erro</span>}
        </div>
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        {state.normalized && !state.processing && (
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={onSave} disabled={busy}><Save className="h-3.5 w-3.5" /> {busy ? "Salvando…" : "Salvar logo"}</button>
        )}
        <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => inputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Outra imagem</button>
        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={onCancel}><X className="h-3.5 w-3.5" /> Cancelar</button>
        {picker}
      </div>
    </div>
  );
}

/* ══════════════════ Galeria ══════════════════ */
function GalleryEditor({ content, setField, notify }: {
  content: SiteContent; setField: (k: string, v: string) => void; notify: Notify;
}) {
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbGallery, setDbGallery] = useState<DbGalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>(defaultGalleryCategories);
  const [uploadCategory, setUploadCategory] = useState<string>(defaultGalleryCategories[0]?.id ?? "esporte-adaptado");
  const [uploads, setUploads] = useState<{ file: File; url: string }[]>([]);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState<string>(COLOR_PALETTE[0]?.value ?? "");
  const [editingCat, setEditingCat] = useState<GalleryCategory | null>(null);

  const hidden = parseStringList(content.gallery_hidden);

  async function reloadPhotos() {
    if (!supabase) return;
    const { data } = await supabase.from("ameas_gallery_items")
      .select("id,title,alt,image_url,category,sort_order,published").order("sort_order");
    setDbGallery((data ?? []) as DbGalleryItem[]);
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    Promise.all([
      supabase.from("ameas_gallery_items").select("id,title,alt,image_url,category,sort_order,published").order("sort_order"),
      supabase.from("ameas_gallery_categories").select("id,label,color,sort_order").order("sort_order"),
    ]).then(([items, cats]) => {
      if (!alive) return;
      setDbGallery((items.data ?? []) as DbGalleryItem[]);
      if (cats.data?.length) {
        setCategories(cats.data as GalleryCategory[]);
        setUploadCategory((cur) => (cats.data!.some((c) => c.id === cur) ? cur : (cats.data![0] as GalleryCategory).id));
      }
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  async function uploadImages() {
    if (!supabase || !uploads.length) return notify("Selecione pelo menos uma foto.", false);
    setBusy(true);
    const errors: string[] = [];
    for (const { file } of uploads) {
      try {
        const { url } = await uploadSiteImage(file, "gallery", 1200, 900);
        const ins = await supabase.from("ameas_gallery_items").insert({
          title: file.name.replace(/\.[^.]+$/, ""), alt: "Imagem da AMEAS",
          image_url: url, category: uploadCategory, sort_order: 0, published: true,
        });
        if (ins.error) errors.push(ins.error.message);
      } catch (e) { errors.push(e instanceof Error ? e.message : "Erro no envio"); }
    }
    setBusy(false);
    if (errors.length) notify(errors.join(" | "), false);
    else { notify(`${uploads.length} foto(s) publicada(s)!`); setUploads([]); }
    await reloadPhotos();
  }

  async function patchPhoto(item: DbGalleryItem, patch: Partial<DbGalleryItem>) {
    if (!supabase) return;
    setDbGallery((prev) => prev.map((g) => (g.id === item.id ? { ...g, ...patch } : g)));
    const { error } = await supabase.from("ameas_gallery_items").update(patch).eq("id", item.id);
    if (error) notify(error.message, false);
  }
  async function deletePhoto(item: DbGalleryItem) {
    if (!supabase || !window.confirm("Excluir esta foto da galeria?")) return;
    setDbGallery((prev) => prev.filter((g) => g.id !== item.id));
    const { error } = await supabase.from("ameas_gallery_items").delete().eq("id", item.id);
    if (error) notify(error.message, false);
  }

  async function createCategory() {
    if (!newCatLabel.trim() || !supabase) return notify("Digite um nome.", false);
    const id = slugify(newCatLabel);
    if (!id || categories.some((c) => c.id === id)) return notify("Já existe um evento com esse nome.", false);
    const cat: GalleryCategory = { id, label: newCatLabel.trim(), color: newCatColor, sort_order: categories.length + 1 };
    setBusy(true);
    const { error } = await supabase.from("ameas_gallery_categories").insert(cat);
    setBusy(false);
    if (error) return notify(error.message, false);
    setCategories((p) => [...p, cat]); setNewCatLabel(""); notify("Evento criado!");
  }
  async function saveEditCategory() {
    if (!editingCat || !supabase) return;
    setBusy(true);
    const { error } = await supabase.from("ameas_gallery_categories")
      .update({ label: editingCat.label, color: editingCat.color }).eq("id", editingCat.id);
    setBusy(false);
    if (error) return notify(error.message, false);
    setCategories((p) => p.map((c) => (c.id === editingCat.id ? editingCat : c)));
    setEditingCat(null); notify("Evento atualizado!");
  }
  async function deleteCategory(id: string) {
    if (!supabase) return;
    if (dbGallery.some((g) => g.category === id)) return notify("Mova ou exclua as fotos desse evento antes.", false);
    if (!window.confirm("Excluir este evento?")) return;
    setBusy(true);
    const { error } = await supabase.from("ameas_gallery_categories").delete().eq("id", id);
    setBusy(false);
    if (error) return notify(error.message, false);
    setCategories((p) => p.filter((c) => c.id !== id)); notify("Evento removido.");
  }

  function toggleStatic(title: string) {
    const next = hidden.includes(title) ? hidden.filter((h) => h !== title) : [...hidden, title];
    setField("gallery_hidden", next.length ? JSON.stringify(next) : "");
  }

  const catChip = (c: { label: string; color: string }) => (
    <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${c.color}`}>{c.label}</span>
  );

  return (
    <>
      {/* Eventos */}
      <section className="adm-card p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Eventos (categorias)</h2>
        <p className="adm-mute mt-1 text-sm">Cada evento vira um cartão na galeria do site.</p>
        <div className="mt-4 space-y-2">
          {loading && <p className="adm-mute py-3 text-sm">Carregando…</p>}
          {categories.map((cat) => (
            <div key={cat.id} className="adm-sub flex flex-wrap items-center gap-3 p-3">
              {editingCat?.id === cat.id ? (
                <>
                  <input aria-label="Nome do evento" className="adm-input w-auto! min-w-[160px] flex-1" value={editingCat.label}
                    onChange={(e) => setEditingCat({ ...editingCat, label: e.target.value })} />
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PALETTE.map((cp) => (
                      <button key={cp.value} title={cp.label} aria-label={cp.label}
                        onClick={() => setEditingCat({ ...editingCat, color: cp.value })}
                        className={`h-7 w-7 rounded-full border-2 ${cp.value.split(" ")[0]} ${editingCat.color === cp.value ? "border-[color:var(--adm-ink)]" : "border-white"}`} />
                    ))}
                  </div>
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={saveEditCategory} disabled={busy}><Save className="h-3.5 w-3.5" /> Salvar</button>
                  <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setEditingCat(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  {catChip(cat)}
                  <span className="adm-mute text-xs">{dbGallery.filter((g) => g.category === cat.id).length} foto(s) enviadas</span>
                  <div className="ml-auto flex gap-2">
                    <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setEditingCat(cat)}><Pencil className="h-3.5 w-3.5" /> Editar</button>
                    <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => void deleteCategory(cat.id)}><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="adm-sub mt-5 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold"><Plus className="h-4 w-4" /> Novo evento</p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="newcat" className="adm-label">Nome</label>
              <input id="newcat" className="adm-input" placeholder="Ex.: Corrida de Rua" value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void createCategory()} />
            </div>
            <div>
              <span className="adm-label">Cor</span>
              <div className="flex flex-wrap gap-1.5 py-1">
                {COLOR_PALETTE.map((cp) => (
                  <button key={cp.value} title={cp.label} aria-label={cp.label} onClick={() => setNewCatColor(cp.value)}
                    className={`h-7 w-7 rounded-full border-2 ${cp.value.split(" ")[0]} ${newCatColor === cp.value ? "border-[color:var(--adm-ink)]" : "border-white"}`} />
                ))}
              </div>
            </div>
            <div>
              <span className="adm-label">Prévia</span>
              <div className="py-0.5">{catChip({ label: newCatLabel || "Nome", color: newCatColor })}</div>
            </div>
            <button className="adm-btn adm-btn-primary" onClick={() => void createCategory()} disabled={busy || !newCatLabel.trim()}>
              <Plus className="h-4 w-4" /> Criar evento
            </button>
          </div>
        </div>
      </section>

      {/* Upload */}
      <section className="adm-card p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Adicionar fotos</h2>
        <p className="adm-mute mt-1 text-sm">Escolha o evento e envie quantas fotos quiser. Elas são reduzidas automaticamente.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} onClick={() => setUploadCategory(c.id)}
              className={`rounded-full border-2 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide ${uploadCategory === c.id ? `${c.color} border-[color:var(--adm-ink)]` : "border-[color:var(--adm-line-2)] bg-white text-[color:var(--adm-ink)]"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[color:var(--adm-line-2)] bg-[#f7f9fd] p-6 text-center hover:border-[color:var(--adm-blue)] hover:bg-[color:var(--adm-tint)]">
          <Upload className="mb-2 h-7 w-7 adm-blue" />
          <span className="font-extrabold">Clique para escolher as fotos</span>
          <span className="adm-mute mt-1 text-sm">PNG, JPG ou WEBP</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only"
            onChange={(e) => setUploads(Array.from(e.target.files ?? []).map((fl) => ({ file: fl, url: URL.createObjectURL(fl) })))} />
        </label>
        {uploads.length > 0 && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
              {uploads.map((u) => (
                <div key={u.url} className="relative aspect-square overflow-hidden rounded-lg border border-[color:var(--adm-line)]">
                  <img src={u.url} alt={u.file.name} className="h-full w-full object-cover" />
                  <button aria-label="Tirar da lista" onClick={() => setUploads(uploads.filter((x) => x.url !== u.url))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--adm-red)] text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => void uploadImages()} disabled={busy} className="adm-btn adm-btn-primary mt-4">
              <Upload className="h-4 w-4" /> {busy ? "Enviando…" : `Publicar ${uploads.length} foto(s)`}
            </button>
          </>
        )}
      </section>

      {/* Fotos enviadas */}
      <section className="adm-card p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Fotos enviadas pelo painel</h2>
        <p className="adm-mute mt-1 text-sm">Mude o título ou o evento, oculte ou exclua. Essas mudanças valem na hora.</p>
        {dbGallery.length === 0 ? (
          <p className="adm-mute py-6 text-center text-sm">{loading ? "Carregando…" : "Nenhuma foto enviada ainda."}</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {dbGallery.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-[color:var(--adm-line)] bg-white">
                <div className="aspect-[4/3] bg-[#f7f9fd]"><img src={item.image_url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" /></div>
                <div className="space-y-2 p-2.5">
                  <input aria-label="Título da foto" className="adm-input px-2! py-1.5! text-xs!" defaultValue={item.title}
                    onBlur={(e) => e.target.value !== item.title && void patchPhoto(item, { title: e.target.value })} />
                  <select aria-label="Evento" className="adm-input px-2! py-1.5! text-xs!" value={item.category ?? ""}
                    onChange={(e) => void patchPhoto(item, { category: e.target.value })}>
                    {!item.category && <option value="">Sem evento</option>}
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <div className="flex gap-1.5">
                    <button onClick={() => void patchPhoto(item, { published: !item.published })}
                      className={`adm-btn adm-btn-sm flex-1 ${item.published ? "adm-ok-chip" : "adm-off-chip"}`} style={{ border: "1px solid var(--adm-line-2)" }}>
                      {item.published ? "Visível" : "Oculta"}
                    </button>
                    <button onClick={() => void deletePhoto(item)} aria-label="Excluir foto" className="adm-btn adm-btn-danger adm-btn-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fotos fixas do site */}
      <section className="adm-card p-5 sm:p-6">
        <h2 className="text-base font-extrabold">Fotos que já vêm com o site</h2>
        <p className="adm-mute mt-1 text-sm">Você pode ocultar qualquer uma delas. Depois clique em “Salvar alterações”.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STATIC_GALLERY.map((p) => {
            const off = hidden.includes(p.title);
            return (
              <div key={p.title} className="overflow-hidden rounded-xl border border-[color:var(--adm-line)] bg-white">
                <div className={`aspect-[4/3] bg-[#f7f9fd] ${off ? "opacity-40" : ""}`}><img src={p.src} alt={p.alt} className="h-full w-full object-cover" loading="lazy" /></div>
                <div className="space-y-2 p-2.5">
                  <p className="truncate text-xs font-bold">{p.title}</p>
                  <button onClick={() => toggleStatic(p.title)}
                    className={`adm-btn adm-btn-sm w-full ${off ? "adm-off-chip" : "adm-ok-chip"}`} style={{ border: "1px solid var(--adm-line-2)" }}>
                    {off ? <><EyeOff className="h-3.5 w-3.5" /> Oculta</> : <><Eye className="h-3.5 w-3.5" /> Visível</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
