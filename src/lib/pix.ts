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
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
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
