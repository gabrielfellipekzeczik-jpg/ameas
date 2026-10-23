import { supabase } from "./supabase";

const BUCKET = "ameas-site-media";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível ler a imagem.")); };
    img.src = url;
  });
}

function toCanvas(img: HTMLImageElement, maxW: number, maxH: number): HTMLCanvasElement {
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Navegador sem suporte a canvas.");
  // fundo branco para PNGs com transparência virarem JPEG sem ficar preto
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao converter a imagem."))), "image/jpeg", quality),
  );
}

/**
 * Redimensiona a foto (máx. 1600 × 1200) e envia para o Storage do Supabase.
 * Retorna a URL pública. Se o Storage recusar o envio, guarda a foto
 * (já reduzida) dentro do próprio texto, para o painel nunca ficar sem salvar.
 */
export async function uploadSiteImage(
  file: File,
  folder: string,
  maxW = 1600,
  maxH = 1200,
): Promise<{ url: string; viaStorage: boolean }> {
  const img = await loadImage(file);
  const canvas = toCanvas(img, maxW, maxH);

  if (supabase) {
    try {
      const blob = await canvasToBlob(canvas, 0.88);
      const path = `${folder}/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (!up.error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return { url: data.publicUrl, viaStorage: true };
      }
    } catch {
      /* cai no plano B abaixo */
    }
  }
  // Plano B: versão menor embutida no texto
  const small = toCanvas(img, 1200, 900);
  return { url: small.toDataURL("image/jpeg", 0.8), viaStorage: false };
}
