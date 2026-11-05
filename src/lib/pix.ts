/**
 * Gera o código PIX "copia e cola" (BR Code estático, padrão do Banco Central).
 * O mesmo texto vira o QR Code. Sem valor, quem paga digita o valor no banco.
 */
const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** O padrão só aceita letras e números sem acento, em tamanho limitado. */
function plain(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

/** CPF e CNPJ vão só com números; e-mail, telefone e chave aleatória têm formato próprio. */
function normalizeKey(key: string) {
  const k = key.trim();
  if (k.includes("@")) return k.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase();
  if (k.startsWith("+")) return `+${k.replace(/\D/g, "")}`;
  return k.replace(/\D/g, "");
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no fim do código. */
function crc16(text: string) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixCode({ key, name, city, amount }: {
  key: string; name: string; city: string; amount?: number;
}) {
  const body = [
    field("00", "01"),
    field("26", field("00", "br.gov.bcb.pix") + field("01", normalizeKey(key))),
    field("52", "0000"),
    field("53", "986"),
    amount && amount > 0 ? field("54", amount.toFixed(2)) : "",
    field("58", "BR"),
    field("59", plain(name, 25) || "AMEAS"),
    field("60", plain(city, 15) || "SAO ROQUE"),
    field("62", field("05", "***")),
    "6304",
  ].join("");
  return body + crc16(body);
}

/** Confere um código colado pelo painel. Devolve null se estiver incompleto ou alterado. */
export function readPixCode(raw: string): { amount: number | null } | null {
  const code = raw.trim();
  if (!code.startsWith("000201") || !/6304[0-9A-Fa-f]{4}$/.test(code)) return null;
  if (crc16(code.slice(0, -4)) !== code.slice(-4).toUpperCase()) return null;
  for (let i = 0; i + 4 <= code.length;) {
    const size = Number(code.slice(i + 2, i + 4));
    if (!Number.isInteger(size)) break;
    if (code.slice(i, i + 2) === "54") return { amount: Number(code.slice(i + 4, i + 4 + size)) };
    i += 4 + size;
  }
  return { amount: null };
}

type PixSettings = {
  pix_key: string; pix_name: string; pix_city: string;
  pix_25: string; pix_50: string; pix_100: string; pix_200: string;
};

/** Código do valor: o cadastrado no painel, se for válido, ou um gerado na hora. */
export function pixCodeFor(sc: PixSettings, amount: string) {
  const saved = { "25": sc.pix_25, "50": sc.pix_50, "100": sc.pix_100, "200": sc.pix_200 }[amount]?.trim();
  if (saved && readPixCode(saved)) return saved;
  return buildPixCode({ key: sc.pix_key, name: sc.pix_name, city: sc.pix_city, amount: Number(amount) || 0 });
}
