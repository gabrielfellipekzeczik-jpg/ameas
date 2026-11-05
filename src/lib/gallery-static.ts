/**
 * Fotos e eventos da galeria que vêm junto com o código do site.
 * Usado pelo site público e pelo painel (para mostrar/ocultar cada foto).
 */
import corridaAdaptada from "@/assets/ameas-corrida-adaptada.png";
import crossfitGrupo from "@/assets/ameas-crossfit-grupo.png";
import treinoAdaptado from "@/assets/ameas-treino-adaptado.png";
import encontroComunidade from "@/assets/ameas-encontro-comunidade.png";
import acaoSolidaria from "@/assets/ameas-acao-solidaria.png";
import parceirosBanner from "@/assets/ameas-parceiros-banner.png";
import acolhimentoCafe from "@/assets/ameas-acolhimento-cafe.png";
import parceriaTiaLina from "@/assets/ameas-parceria-tia-lina.png";
import karina from "@/assets/karina-meneguini-retrato.png";

export type StaticPhoto = { src: string; alt: string; title: string; category: string };
export type StaticCategory = { id: string; label: string; color: string };

/** Eventos com fotos em src/assets/eventos/<id>. A foto 01 é a capa do cartão. */
const EVENTS: Array<StaticCategory & { short: string }> = [
  { id: "corrida-aleluia",        short: "Corrida de Aleluia",      label: "Corrida de Aleluia",                                                         color: "bg-[#1B4B8A] text-white" },
  { id: "carnaval-inclusivo",     short: "Carnaval inclusivo",      label: "Carnaval inclusivo com a Escola de Samba Santa Quitéria",                    color: "bg-[#d62f21] text-white" },
  { id: "natal-minnas",           short: "Natal no Minnas",         label: "Natal no Minnas feito como Antigamente",                                     color: "bg-[#047857] text-white" },
  { id: "track-field-catarina",   short: "Track & Field",           label: "Etapa corrida Track & Field no Outlet Catarina com o Projeto Pernas por Você", color: "bg-[#0e7490] text-white" },
  { id: "tapete-festas-agosto",   short: "Tapete de Agosto",        label: "Tapete nas Festas de Agosto com o Colégio São Roque e Escola Aquarela",      color: "bg-[#b45309] text-white" },
  { id: "open-crossfit",          short: "Open CrossFit",           label: "Open CrossFit",                                                              color: "bg-[#7c3aed] text-white" },
  { id: "palestra-maes-atipicas", short: "Palestra mães atípicas",  label: "Palestra para as mães atípicas com café da manhã no Empório QN",             color: "bg-[#be185d] text-white" },
  { id: "jantar-dia-das-maes",    short: "Jantar Dia das Mães",     label: "Jantar Dia das Mães",                                                        color: "bg-[#be185d] text-white" },
  { id: "feijoada-beneficente",   short: "Feijoada beneficente",    label: "Feijoada beneficente no Empório QN",                                         color: "bg-[#b45309] text-white" },
  { id: "convivencia",            short: "Encontro de convivência", label: "Encontro de convivência",                                                    color: "bg-[#0e7490] text-white" },
  { id: "esporte-adaptado",       short: "Cross fit adaptado",      label: "Cross fit adaptado",                                                         color: "bg-[#1B4B8A] text-white" },
];

export const STATIC_CATEGORIES: StaticCategory[] = [
  ...EVENTS.map(({ id, label, color }) => ({ id, label, color })),
  { id: "comunidade",  label: "Comunidade",  color: "bg-[#d62f21] text-white" },
  { id: "acolhimento", label: "Acolhimento", color: "bg-[#047857] text-white" },
  { id: "fundadora",   label: "Fundadora",   color: "bg-[#7c3aed] text-white" },
];

/** Eventos do código na ordem deles, com o nome e a cor salvos no banco, seguidos dos criados no painel. */
export function mergeEventCategories<T extends StaticCategory>(db: T[]) {
  const saved = new Map(db.map((c) => [c.id, c]));
  const known = new Set(STATIC_CATEGORIES.map((c) => c.id));
  return [
    ...STATIC_CATEGORIES.map((c) => saved.get(c.id) ?? { ...c, sort_order: 0 }),
    ...db.filter((c) => !known.has(c.id)),
  ];
}

const eventFiles = import.meta.glob<string>("../assets/eventos/*/*.webp", { eager: true, import: "default" });

const EVENT_PHOTOS: StaticPhoto[] = EVENTS.flatMap((ev) =>
  Object.keys(eventFiles)
    .filter((path) => path.includes(`/eventos/${ev.id}/`))
    .sort()
    .map((path, i) => ({
      src: eventFiles[path] ?? "",
      alt: `${ev.label}: foto ${i + 1} do evento da AMEAS`,
      title: `${ev.short} ${i + 1}`,
      category: ev.id,
    })),
);

export const STATIC_GALLERY: StaticPhoto[] = [
  ...EVENT_PHOTOS,
  { src: corridaAdaptada,    alt: "Atleta em triciclo adaptado durante atividade",    title: "Corrida adaptada",       category: "esporte-adaptado" },
  { src: crossfitGrupo,      alt: "Equipe AMEAS em encontro esportivo no CrossFit",   title: "Treino coletivo",        category: "esporte-adaptado" },
  { src: treinoAdaptado,     alt: "Mulheres da AMEAS realizando treino adaptado",     title: "Superação em treino",    category: "esporte-adaptado" },
  { src: encontroComunidade, alt: "Grande grupo da AMEAS reunido com banner",         title: "Encontro da comunidade", category: "comunidade" },
  { src: acaoSolidaria,      alt: "Grupo da AMEAS em ação solidária",                 title: "Ação solidária",         category: "comunidade" },
  { src: parceirosBanner,    alt: "Banner comemorativo com parceiros da AMEAS",       title: "Parceiros AMEAS",        category: "comunidade" },
  { src: acolhimentoCafe,    alt: "Grupo da AMEAS reunido em momento de acolhimento", title: "Café de acolhimento",    category: "acolhimento" },
  { src: parceriaTiaLina,    alt: "Participantes da AMEAS em ação de parceria",       title: "Parceria Tia Lina",      category: "acolhimento" },
  { src: karina,             alt: "Retrato oficial de Karina Meneguini, fundadora",   title: "Karina Meneguini",       category: "fundadora" },
];
