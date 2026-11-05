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
import capaAleluia from "@/assets/site/capa-corrida-aleluia.webp";
import capaTrackField from "@/assets/site/capa-track-field.webp";
import capaEquipeAleluia from "@/assets/site/capa-equipe-aleluia.webp";
import capaNatal from "@/assets/site/capa-natal-minnas.webp";
import capaCarnaval from "@/assets/site/capa-carnaval-inclusivo.webp";
import capaTapete from "@/assets/site/capa-tapete-agosto.webp";
import capaJantar from "@/assets/site/capa-jantar-maes.webp";
import servicoEsporte from "@/assets/site/servico-esporte-adaptado.webp";
import servicoSocial from "@/assets/site/servico-assistencia-social.webp";
import servicoPsicologico from "@/assets/site/servico-suporte-psicologico.webp";
import servicoPilates from "@/assets/site/servico-pilates-maes.webp";
import servicoEventos from "@/assets/site/servico-eventos.webp";
import servicoVoluntariado from "@/assets/site/servico-voluntariado.webp";
import { parseHeroSlides, type HeroSlide, type SiteContent } from "./cms-schema";

/** Fotos do site que podem ser escolhidas no carrossel ("builtin:<nome>"). */
export const BUILTIN_PHOTOS: Record<string, { src: string; label: string }> = {
  "capa-aleluia": { src: capaAleluia, label: "Corrida de Aleluia — triciclo" },
  "capa-track-field": { src: capaTrackField, label: "Track & Field — largada" },
  "capa-equipe": { src: capaEquipeAleluia, label: "Corrida de Aleluia — equipe" },
  "capa-natal": { src: capaNatal, label: "Natal no Minnas" },
  "capa-carnaval": { src: capaCarnaval, label: "Carnaval inclusivo" },
  "capa-tapete": { src: capaTapete, label: "Tapete das Festas de Agosto" },
  "capa-jantar": { src: capaJantar, label: "Jantar Dia das Mães" },
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
  service1_image: servicoEsporte,
  service2_image: servicoSocial,
  service3_image: servicoPsicologico,
  service4_image: servicoPilates,
  service5_image: servicoEventos,
  service6_image: servicoVoluntariado,
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
      id: "padrao-1", image: "builtin:capa-aleluia",
      title: sc.hero_title, subtitle: sc.hero_subtitle,
      cta_label: "Fazer Doação", cta_link: "#ajudar", active: true,
    },
    {
      id: "padrao-2", image: "builtin:capa-track-field",
      title: "Cada conquista começa com um primeiro passo",
      subtitle: "Atletas de todas as idades encontram no esporte adaptado um caminho de autonomia, saúde e alegria.",
      cta_label: "Conheça a AMEAS", cta_link: "#sobre", active: true,
    },
    {
      id: "padrao-3", image: "builtin:capa-equipe",
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
