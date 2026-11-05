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

export const STATIC_CATEGORIES: StaticCategory[] = [
  { id: "esporte-adaptado", label: "Esporte Adaptado", color: "bg-[#1B4B8A] text-white" },
  { id: "comunidade",       label: "Comunidade",       color: "bg-[#d62f21] text-white" },
  { id: "acolhimento",      label: "Acolhimento",      color: "bg-[#047857] text-white" },
  { id: "fundadora",        label: "Fundadora",        color: "bg-[#7c3aed] text-white" },
];

export const STATIC_GALLERY: StaticPhoto[] = [
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
