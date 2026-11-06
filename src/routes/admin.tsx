import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Briefcase, CheckCircle2, Eye, EyeOff, HandHeart,
  Handshake, Home, ImagePlus, Images, Info, LogOut, Menu, Pencil, Phone, Plus, QrCode,
  Quote, RotateCcw, Save, Star, Target, Trash2, Upload, UserRound, Users, X,
} from "lucide-react";
import logoAsset from "@/assets/ameas-logo.png";
import {
  defaultGalleryCategories, defaultSiteContent, getContentRows, mergeContent, readableChipColor, supabase,
  type GalleryCategory, type PartnerLink, type SiteContent,
} from "@/lib/supabase";
import {
  MAX_HERO_SLIDES, SECTIONS, getTestimonials, parseStringList, pick,
  type Field, type Group, type HeroSlide, type SectionDef, type Testimonial,
} from "@/lib/cms-schema";
import {
  BUILTIN_PHOTOS, DEFAULT_FIELD_IMAGES, getHeroSlides, resolveImage,
} from "@/lib/builtin-images";
import { uploadSiteImage } from "@/lib/media";
import { readPixCode } from "@/lib/pix";
import { STATIC_GALLERY, mergeEventCategories, parseGalleryOrder, sortPhotos } from "@/lib/gallery-static";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

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
  { title: "Aparência", ids: ["inicio", "galeria"] },
  { title: "Conteúdo", ids: ["sobre", "fundadora", "missao", "servicos", "familias", "voluntariado", "depoimentos"] },
  { title: "Doações e contato", ids: ["doacoes", "parceiros", "contato"] },
];

const COLOR_PALETTE = [
  { label: "Azul",     value: "bg-[#1B4B8A] text-white" },
  { label: "Vermelho", value: "bg-[#d62f21] text-white" },
  { label: "Verde",    value: "bg-[#047857] text-white" },
  { label: "Roxo",     value: "bg-[#7c3aed] text-white" },
  { label: "Laranja",  value: "bg-[#f59e0b] text-black" },
  { label: "Rosa",     value: "bg-[#be185d] text-white" },
  { label: "Ciano",    value: "bg-[#0e7490] text-white" },
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

  function leaveToSite(e: { preventDefault: () => void }) {
    if (dirty && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) e.preventDefault();
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
          <div className="adm-login-head px-8 py-7 text-center">
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
    <div className="adm adm-shell">
      {/* ── MENU LATERAL ── */}
      <aside className="adm-side" aria-label="Menu do painel">
        <div className="adm-side-top">
          <div className="adm-brand">
            <span className="adm-brand-logo"><img src={logoAsset} alt="" /></span>
            <b>AMEAS Admin</b>
          </div>
          <button className="adm-mobile-toggle" onClick={() => setNavOpen((o) => !o)}
            aria-expanded={navOpen} aria-label={navOpen ? "Fechar menu" : "Abrir menu"}>
            {navOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <nav className={`adm-nav-list ${navOpen ? "open" : ""}`}>
          <Link to="/" className="adm-nav-item adm-nav-back" onClick={leaveToSite}>
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="adm-nav-group">{g.title}</p>
              {g.ids.map((id) => {
                const s = SECTIONS.find((x) => x.id === id);
                if (!s) return null;
                return (
                  <button key={id} className="adm-nav-item" aria-current={section === id ? "page" : undefined}
                    onClick={() => { setSection(id); setNavOpen(false); window.scrollTo({ top: 0 }); }}>
                    {SECTION_ICONS[id]}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="adm-side-footer">
            <button className="adm-nav-item" onClick={logout}><LogOut className="h-4 w-4" /> Sair</button>
          </div>
        </nav>
      </aside>

      {/* ── CONTEÚDO ── */}
      <main className="adm-main">
        <header className="adm-header">
          <h1>{current.title}</h1>
          <p className="adm-subtitle">{current.desc}</p>
        </header>

        <div className="space-y-[18px]">
          {current.special === "hero" && (
            <HeroEditor content={content} setField={setField} notify={notify} />
          )}

          {current.groups.map((g) => (
            <GroupCard key={g.title} group={g} content={content} setField={setField} notify={notify} />
          ))}

          {current.special === "testimonials" && (
            <TestimonialsEditor content={content} setField={setField} />
          )}

          {current.special === "partners" && (
            <PartnersEditor
              partnerLinks={partnerLinks} setPartnerLinks={setPartnerLinks}
              logos={logos} setLogos={setLogos} notify={notify}
            />
          )}

          {current.special === "gallery" && (
            <GalleryEditor content={content} setField={setField} notify={notify} />
          )}
        </div>

        <div className="adm-save-bar">
          <span className={`adm-chip ${dirty ? "bg-[#fff3d6] text-[#7a4f00]" : "adm-ok-chip"}`}>
            {dirty ? `${dirtyKeys.length} alteração(ões) sem salvar` : <><CheckCircle2 className="h-3.5 w-3.5" /> Tudo salvo</>}
          </span>
          <button onClick={saveContent} disabled={busy || !dirty} className="adm-btn adm-btn-primary">
            <Save className="h-4 w-4" /> {busy ? "Salvando…" : "Salvar e publicar alterações"}
          </button>
        </div>
      </main>

      {msg && (
        <div role="status" className={`adm-toast ${msg.ok ? "adm-toast-ok" : "adm-toast-err"}`}>
          {msg.ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />} {msg.text}
        </div>
      )}
    </div>
  );
}

/* ══════════════════ Listas (miniatura + título + ações) ══════════════════ */
function CrudRow({ image, title, sub, off, contain, actions }: {
  image?: string | undefined; title: string; sub?: string | undefined; off?: boolean; contain?: boolean; actions: ReactNode;
}) {
  return (
    <div className={`adm-crud-row ${off ? "is-off" : ""}`}>
      {image
        ? <img src={image} alt="" className={`adm-crud-thumb ${contain ? "contain" : ""}`} />
        : <span className="adm-crud-thumb adm-crud-fallback">{(title || "?").charAt(0).toUpperCase()}</span>}
      <div className="min-w-0 flex-1">
        <p className="adm-crud-title">{title || "Sem título"}</p>
        {sub && <p className="adm-crud-sub">{sub}</p>}
      </div>
      <div className="adm-crud-actions">{actions}</div>
    </div>
  );
}

function IconBtn({ label, danger, disabled, onClick, children }: {
  label: string; danger?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode;
}) {
  return (
    <button type="button" className={`adm-icon-btn ${danger ? "danger" : ""}`} title={label} aria-label={label}
      disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="adm-form-card">
      <div className="adm-form-head">
        <h3>{title}</h3>
        <button type="button" className="adm-form-close" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
      </div>
      {children}
      <div className="mt-4">
        <button type="button" className="adm-btn adm-btn-primary adm-btn-sm" onClick={onClose}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
        </button>
      </div>
    </div>
  );
}

/* ══════════════════ Formulários genéricos ══════════════════ */
function GroupCard({ group, content, setField, notify }: {
  group: Group; content: SiteContent; setField: (k: string, v: string) => void; notify: Notify;
}) {
  return (
    <section className="adm-card p-5 sm:p-6">
      <h2 className="adm-panel-title">{group.title}</h2>
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

/* Avisa na hora se o código colado está quebrado ou é de outro valor. */
function PixCodeStatus({ code, expected }: { code: string; expected: number }) {
  const info = readPixCode(code);
  const problem = !info
    ? "Código inválido ou incompleto. O site vai gerar outro no lugar. Copie de novo do banco."
    : info.amount !== null && info.amount !== expected
      ? `Atenção: este código é de R$ ${info.amount.toFixed(2).replace(".", ",")}, não de R$ ${expected},00.`
      : "";
  return problem
    ? <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-bold text-[#a3281c]"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> {problem}</p>
    : (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0f7a4d]">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Código válido{info?.amount === null ? " (sem valor definido: a pessoa digita no banco)" : ""}
      </p>
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
      {field.type === "code" && value.trim() && <PixCodeStatus code={value} expected={Number(field.key.replace("pix_", ""))} />}
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
  const [editing, setEditing] = useState<string | null>(null);

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
    const id = uid();
    commit([...slides, { id, image: "", title: "Novo slide", subtitle: "", cta_label: "", cta_link: "", active: true }]);
    setEditing(id);
  }
  function restore() {
    if (!window.confirm("Voltar aos 3 slides originais? Suas alterações no carrossel serão descartadas (depois de salvar).")) return;
    setField("hero_slides", "");
  }

  return (
    <section className="adm-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="adm-panel-title">Slides do carrossel</h2>
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
            <Plus className="h-3.5 w-3.5" /> Adicionar slide
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

      <div className="adm-crud-list mt-4">
        {slides.length === 0 && (
          <p className="adm-sub adm-mute p-5 text-center text-sm">Nenhum slide. Clique em “Adicionar slide” para começar.</p>
        )}
        {slides.map((s, i) => (
          <Fragment key={s.id}>
            {editing === s.id ? (
              <SlideForm slide={s} index={i} onChange={(p) => update(i, p)} onClose={() => setEditing(null)} notify={notify} />
            ) : (
              <CrudRow
                image={resolveImage(s.image) || undefined} title={s.title} off={!s.active}
                sub={s.active ? s.subtitle || "Sem texto" : "Oculto no site"}
                actions={<>
                  <IconBtn label="Mover para cima" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Mover para baixo" disabled={i === slides.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                  <IconBtn label={s.active ? "Ocultar" : "Mostrar"} onClick={() => update(i, { active: !s.active })}>
                    {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn label="Editar" onClick={() => setEditing(s.id)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Excluir" danger onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></IconBtn>
                </>}
              />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function SlideForm({ slide, index, onChange, onClose, notify }: {
  slide: HeroSlide; index: number;
  onChange: (p: Partial<HeroSlide>) => void; onClose: () => void; notify: Notify;
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
    <FormCard title={`Editar slide ${index + 1}`} onClose={onClose}>
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
    </FormCard>
  );
}

/* ══════════════════ Parceiros ══════════════════ */
/* ══════════════════ Depoimentos ══════════════════ */
function TestimonialsEditor({ content, setField }: {
  content: SiteContent; setField: (k: string, v: string) => void;
}) {
  const items = getTestimonials(content);
  const [editing, setEditing] = useState<string | null>(null);

  function commit(next: Testimonial[]) { setField("testimonials", JSON.stringify(next)); }
  function update(i: number, patch: Partial<Testimonial>) {
    commit(items.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  }
  function move(i: number, dir: -1 | 1) {
    const a = items[i]; const b = items[i + dir];
    if (!a || !b) return;
    const next = [...items];
    next[i] = b; next[i + dir] = a;
    commit(next);
  }
  function remove(i: number) {
    if (!window.confirm("Excluir este depoimento?")) return;
    commit(items.filter((_, j) => j !== i));
  }
  function add() {
    const id = uid();
    commit([...items, { id, quote: "", author: "", active: true }]);
    setEditing(id);
  }

  return (
    <section className="adm-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="adm-panel-title">Depoimentos</h2>
          <p className="adm-mute mt-1 text-sm">Eles aparecem no site na ordem abaixo. Depois de mexer, clique em “Salvar e publicar alterações”.</p>
        </div>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={add}><Plus className="h-3.5 w-3.5" /> Adicionar depoimento</button>
      </div>

      <div className="adm-crud-list mt-4">
        {items.length === 0 && (
          <p className="adm-sub adm-mute p-5 text-center text-sm">Nenhum depoimento. Clique em “Adicionar depoimento” para começar.</p>
        )}
        {items.map((t, i) => (
          <Fragment key={t.id}>
            {editing === t.id ? (
              <FormCard title={`Depoimento ${i + 1}`} onClose={() => setEditing(null)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`dep-q-${t.id}`} className="adm-label">Depoimento</label>
                    <textarea id={`dep-q-${t.id}`} rows={4} className="adm-input" value={t.quote} autoFocus
                      onChange={(e) => update(i, { quote: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor={`dep-a-${t.id}`} className="adm-label">Quem disse</label>
                    <input id={`dep-a-${t.id}`} className="adm-input" placeholder="Ex.: Família atendida" value={t.author}
                      onChange={(e) => update(i, { author: e.target.value })} />
                  </div>
                </div>
              </FormCard>
            ) : (
              <CrudRow
                title={t.quote || "Depoimento vazio"} off={!t.active}
                sub={!t.active ? "Oculto no site" : !t.quote.trim() ? "Sem texto: não aparece no site" : t.author || "Sem autor"}
                actions={<>
                  <IconBtn label="Mover para cima" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Mover para baixo" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                  <IconBtn label={t.active ? "Ocultar" : "Mostrar"} onClick={() => update(i, { active: !t.active })}>
                    {t.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn label="Editar" onClick={() => setEditing(t.id)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Excluir" danger onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></IconBtn>
                </>}
              />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function PartnersEditor({ partnerLinks, setPartnerLinks, logos, setLogos, notify }: {
  partnerLinks: PartnerLink[]; setPartnerLinks: (p: PartnerLink[]) => void;
  logos: Record<string, string>; setLogos: (fn: (l: Record<string, string>) => Record<string, string>) => void;
  notify: Notify;
}) {
  const [busy, setBusy] = useState(false);
  const [logoMap, setLogoMap] = useState<Record<string, LogoState>>({});
  const [editing, setEditing] = useState<string | null>(null);

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
      <h2 className="adm-panel-title">Apoiadores</h2>
      <p className="adm-mute mt-1 text-sm">
        Link (site ou Instagram), visibilidade e logo de cada parceiro. As logos são salvas na hora; links e visibilidade
        precisam do botão “Salvar parceiros”.
      </p>
      <div className="adm-crud-list mt-4">
        {partnerLinks.map((p, i) => {
          const ls = logoMap[p.slug];
          const savedLogo = logos[p.slug];
          if (editing !== p.slug) {
            return (
              <CrudRow key={p.slug} image={savedLogo} contain title={p.name} off={!p.published}
                sub={p.published ? p.website_url || "Sem link" : "Oculto no site"}
                actions={<>
                  <IconBtn label={p.published ? "Ocultar" : "Mostrar"}
                    onClick={() => setPartnerLinks(partnerLinks.map((x, j) => (j === i ? { ...x, published: !x.published } : x)))}>
                    {p.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </IconBtn>
                  <IconBtn label="Editar" onClick={() => setEditing(p.slug)}><Pencil className="h-4 w-4" /></IconBtn>
                </>}
              />
            );
          }
          return (
            <FormCard key={p.slug} title={`Editar ${p.name}`} onClose={() => setEditing(null)}>
              <label className="adm-label" htmlFor={`pl-${p.slug}`}>Link (site ou Instagram)</label>
              <input id={`pl-${p.slug}`} type="url" className="adm-input" placeholder="https://…" value={p.website_url}
                onChange={(e) => setPartnerLinks(partnerLinks.map((x, j) => (j === i ? { ...x, website_url: e.target.value } : x)))} />
              <LogoRow
                state={ls ?? null} savedLogo={savedLogo ?? null} busy={busy}
                onFile={(file) => void handleLogoFile(p.slug, file)}
                onCancel={() => setLogoMap((m) => { const n = { ...m }; delete n[p.slug]; return n; })}
                onSave={() => void saveLogo(p.slug)}
              />
            </FormCard>
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
  const [dragging, setDragging] = useState<{ event: string; from: number } | null>(null);

  const hidden = parseStringList(content.gallery_hidden);
  const hiddenEvents = parseStringList(content.gallery_hidden_events);
  const liveCategories = categories.filter((c) => !hiddenEvents.includes(c.id));
  const removedCategories = categories.filter((c) => hiddenEvents.includes(c.id));
  const photoOrder = parseGalleryOrder(content.gallery_order);

  /* Fotos do evento (do site e enviadas pelo painel) na sequência que vai para o site. */
  function eventPhotos(eventId: string) {
    return sortPhotos([
      ...STATIC_GALLERY.filter((p) => p.category === eventId)
        .map((p) => ({ key: p.title, src: p.src, alt: p.alt, title: p.title, off: hidden.includes(p.title), item: null as DbGalleryItem | null })),
      ...dbGallery.filter((g) => g.category === eventId)
        .map((g) => ({ key: `db:${g.id}`, src: g.image_url, alt: g.alt, title: g.title, off: !g.published, item: g as DbGalleryItem | null })),
    ], photoOrder[eventId]);
  }

  function movePhoto(eventId: string, keys: string[], from: number, to: number) {
    if (from === to || to < 0 || to >= keys.length) return;
    const next = [...keys];
    const [moved] = next.splice(from, 1);
    if (moved === undefined) return;
    next.splice(to, 0, moved);
    setField("gallery_order", JSON.stringify({ ...photoOrder, [eventId]: next }));
  }

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
      const saved = (cats.data ?? []) as GalleryCategory[];
      const all: GalleryCategory[] = mergeEventCategories(saved.map((c) => ({ ...c, color: readableChipColor(c.color) })));
      setCategories(all);
      setUploadCategory((cur) => (all.some((c) => c.id === cur) ? cur : (all[0]?.id ?? cur)));
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
    // upsert: os eventos que vêm com o site ainda não têm linha no banco
    const { id, label, color, sort_order } = editingCat;
    const { error } = await supabase.from("ameas_gallery_categories").upsert({ id, label, color, sort_order }, { onConflict: "id" });
    setBusy(false);
    if (error) return notify(error.message, false);
    setCategories((p) => p.map((c) => (c.id === editingCat.id ? editingCat : c)));
    setEditingCat(null); notify("Evento atualizado!");
  }
  async function deleteCategory(id: string) {
    if (!supabase) return;
    if (dbGallery.some((g) => g.category === id)) return notify("Mova ou exclua as fotos desse evento antes.", false);
    if (!window.confirm("Excluir este evento?")) return;
    // As fotos que vêm com o site não saem do código: o evento só deixa de aparecer e pode voltar.
    if (STATIC_GALLERY.some((p) => p.category === id)) {
      setField("gallery_hidden_events", JSON.stringify([...hiddenEvents, id]));
      return notify("Evento removido. Clique em “Salvar e publicar alterações” para aplicar no site.");
    }
    setBusy(true);
    const { error } = await supabase.from("ameas_gallery_categories").delete().eq("id", id);
    setBusy(false);
    if (error) return notify(error.message, false);
    setCategories((p) => p.filter((c) => c.id !== id)); notify("Evento removido.");
  }

  function restoreEvent(id: string) {
    const next = hiddenEvents.filter((h) => h !== id);
    setField("gallery_hidden_events", next.length ? JSON.stringify(next) : "");
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
        <h2 className="adm-panel-title">Eventos (categorias)</h2>
        <p className="adm-mute mt-1 text-sm">Cada evento vira um cartão na galeria do site.</p>
        <div className="adm-crud-list mt-4">
          {loading && <p className="adm-mute py-3 text-sm">Carregando…</p>}
          {liveCategories.map((cat) => (
            <div key={cat.id} className="adm-crud-row flex-wrap">
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
                  <span className="adm-mute text-xs">
                    {STATIC_GALLERY.filter((p) => p.category === cat.id).length} do site · {dbGallery.filter((g) => g.category === cat.id).length} enviada(s)
                  </span>
                  <div className="adm-crud-actions ml-auto">
                    <IconBtn label="Editar" onClick={() => setEditingCat(cat)}><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn label="Excluir" danger onClick={() => void deleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></IconBtn>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {removedCategories.length > 0 && (
          <div className="mt-4">
            <p className="adm-label">Eventos excluídos</p>
            <div className="adm-crud-list">
              {removedCategories.map((cat) => (
                <div key={cat.id} className="adm-crud-row is-off flex-wrap">
                  {catChip(cat)}
                  <button className="adm-btn adm-btn-ghost adm-btn-sm ml-auto" onClick={() => restoreEvent(cat.id)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
        <h2 className="adm-panel-title">Adicionar fotos</h2>
        <p className="adm-mute mt-1 text-sm">Escolha o evento e envie quantas fotos quiser. Elas são reduzidas automaticamente.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {liveCategories.map((c) => (
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
        <h2 className="adm-panel-title">Fotos enviadas pelo painel</h2>
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
        <h2 className="adm-panel-title">Fotos de cada evento</h2>
        <p className="adm-mute mt-1 text-sm">Abra um evento e arraste as fotos, ou use as setas, para mudar a sequência. A primeira foto é a capa do evento no site. Depois clique em “Salvar e publicar alterações”.</p>
        <div className="mt-4 space-y-2">
          {liveCategories.map((cat) => {
            const photos = eventPhotos(cat.id);
            if (!photos.length) return null;
            const keys = photos.map((p) => p.key);
            const coverKey = photos.find((p) => !p.off)?.key;
            const offCount = photos.filter((p) => p.off).length;
            return (
              <details key={cat.id} className="adm-sub p-3">
                <summary className="cursor-pointer text-sm font-extrabold">
                  {cat.label}
                  <span className="adm-mute ml-2 text-xs font-semibold">{photos.length} foto(s){offCount ? ` · ${offCount} fora do site` : ""}</span>
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
                  {photos.map((p, i) => {
                    const isCover = p.key === coverKey;
                    return (
                      <div key={p.key} draggable
                        onDragStart={(e) => { e.dataTransfer.setData("text/plain", p.key); setDragging({ event: cat.id, from: i }); }}
                        onDragEnd={() => setDragging(null)}
                        onDragOver={(e) => { if (dragging?.event === cat.id) e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragging?.event === cat.id) movePhoto(cat.id, keys, dragging.from, i);
                          setDragging(null);
                        }}
                        className={`cursor-move overflow-hidden rounded-xl border bg-white ${isCover ? "border-[color:var(--adm-blue)] ring-2 ring-[color:var(--adm-blue)]" : "border-[color:var(--adm-line)]"} ${dragging?.event === cat.id && dragging.from === i ? "opacity-50" : ""}`}>
                        <div className="relative aspect-[4/3] bg-[#f7f9fd]">
                          <img src={p.src} alt={p.alt} className={`h-full w-full object-cover ${p.off ? "opacity-40" : ""}`} loading="lazy" />
                          <span className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${isCover ? "bg-[color:var(--adm-blue)] text-white" : "bg-black/60 text-white"}`}>
                            {isCover ? "Capa" : i + 1}
                          </span>
                        </div>
                        <div className="space-y-2 p-2.5">
                          <p className="truncate text-xs font-bold">{p.title}</p>
                          <div className="flex gap-1.5">
                            <button type="button" aria-label={`Mover ${p.title} para trás`} disabled={i === 0}
                              onClick={() => movePhoto(cat.id, keys, i, i - 1)} className="adm-btn adm-btn-ghost adm-btn-sm flex-1">
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" aria-label={`Mover ${p.title} para frente`} disabled={i === photos.length - 1}
                              onClick={() => movePhoto(cat.id, keys, i, i + 1)} className="adm-btn adm-btn-ghost adm-btn-sm flex-1">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {!isCover && !p.off && (
                            <button type="button" onClick={() => movePhoto(cat.id, keys, i, 0)} className="adm-btn adm-btn-ghost adm-btn-sm w-full">
                              <Star className="h-3.5 w-3.5" /> Usar como capa
                            </button>
                          )}
                          {p.item ? (
                            <button type="button" onClick={() => p.item && void deletePhoto(p.item)} className="adm-btn adm-btn-danger adm-btn-sm w-full">
                              <Trash2 className="h-3.5 w-3.5" /> Excluir
                            </button>
                          ) : (
                            <button type="button" onClick={() => toggleStatic(p.title)}
                              className={`adm-btn adm-btn-sm w-full ${p.off ? "adm-btn-ghost" : "adm-btn-danger"}`}>
                              {p.off ? <><RotateCcw className="h-3.5 w-3.5" /> Restaurar</> : <><Trash2 className="h-3.5 w-3.5" /> Excluir</>}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}
