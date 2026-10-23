/**
 * Fotos que já vêm junto com o código do site. Servem de padrão quando o
 * painel ainda não tem uma foto própria.
 */
import treinoAdaptado from "@/assets/ameas-treino-adaptado.png";
import corridaAdaptada from "@/assets/ameas-corrida-adaptada.png";
import crossfitGrupo from "@/assets/ameas-crossfit-grupo.png";
import encontroComunidade from "@/assets/ameas-encontro-comunidade.png";
import acaoSolidaria from "@/assets/ameas-acao-solidaria.png";
import acolhimentoCafe from "@/assets/ameas-acolhimento-cafe.png";
import parceriaTiaLina from "@/assets/ameas-parceria-tia-lina.png";
import karina from "@/assets/karina-meneguini-retrato.png";
import pixQr from "@/assets/pix-qrcode.png";
import { parseHeroSlides, type HeroSlide, type SiteContent } from "./cms-schema";

/** Fotos do site que podem ser escolhidas no carrossel ("builtin:<nome>"). */
export const BUILTIN_PHOTOS: Record<string, { src: string; label: string }> = {
  treino: { src: treinoAdaptado, label: "Treino adaptado" },
  corrida: { src: corridaAdaptada, label: "Corrida adaptada" },
  crossfit: { src: crossfitGrupo, label: "Treino coletivo" },
  comunidade: { src: encontroComunidade, label: "Encontro da comunidade" },
  solidaria: { src: acaoSolidaria, label: "Ação solidária" },
  acolhimento: { src: acolhimentoCafe, label: "Café de acolhimento" },
  tialina: { src: parceriaTiaLina, label: "Parceria Tia Lina" },
  karina: { src: karina, label: "Karina Meneguini" },
};

/** Foto padrão de cada campo de imagem do schema. */
export const DEFAULT_FIELD_IMAGES: Record<string, string> = {
  about_image: encontroComunidade,
  founder_image: karina,
  pix_qr_image: pixQr,
};

/** Converte "builtin:treino" ou uma URL real no endereço final da imagem. */
export function resolveImage(value: string): string {
  if (value.startsWith("builtin:")) return BUILTIN_PHOTOS[value.slice(8)]?.src ?? "";
  return value;
}

/** Slides padrão (usados enquanto o painel não salvou nenhum). */
export function defaultHeroSlides(sc: SiteContent): HeroSlide[] {
  return [
    {
      id: "padrao-1", image: "builtin:treino",
      title: sc.hero_title, subtitle: sc.hero_subtitle,
      cta_label: "Fazer Doação", cta_link: "#ajudar", active: true,
    },
    {
      id: "padrao-2", image: "builtin:corrida",
      title: "Cada conquista começa com um primeiro passo",
      subtitle: "Atletas de todas as idades encontram no esporte adaptado um caminho de autonomia, saúde e alegria.",
      cta_label: "Conheça a AMEAS", cta_link: "#sobre", active: true,
    },
    {
      id: "padrao-3", image: "builtin:crossfit",
      title: "Juntos, o esporte vai mais longe",
      subtitle: "Voluntários, famílias e parceiros fazem a diferença em cada treino. Venha fazer parte.",
      cta_label: "Quero ser voluntário(a)", cta_link: "#voluntario", active: true,
    },
  ];
}

/** Slides a mostrar: os salvos no painel ou, se não houver, os padrão. */
export function getHeroSlides(sc: SiteContent): HeroSlide[] {
  return parseHeroSlides(sc.hero_slides) ?? defaultHeroSlides(sc);
}
