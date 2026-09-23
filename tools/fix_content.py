"""Script Python para corrigir encoding dos textos no Supabase."""
import json, urllib.request, urllib.parse

SUPABASE_URL = "https://yqbyizasqzgijnkxzcep.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnlpemFzcXpnaWpua3h6Y2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjQxODYsImV4cCI6MjA5OTU0MDE4Nn0.O8PvxKLvhrpApRm3-UalVgs7D31p4bh-RLFS-vaKLC8"

rows = [
  {"key": "hero_title",      "value": "Esporte adaptado. Inclusão que transforma."},
  {"key": "hero_subtitle",   "value": "A AMEAS promove acolhimento, autonomia e superação por meio do esporte adaptado em São Roque e região."},
  {"key": "about_text",      "value": "A AMEAS é uma associação que acredita no esporte como caminho de inclusão, desenvolvimento e pertencimento para pessoas com deficiência e suas famílias."},
  {"key": "founder_bio1",    "value": "Karina Meneguini representa a liderança que aproxima pessoas, organiza esforços e transforma propósito em ação. Sua trajetória é marcada pela dedicação ao esporte adaptado, pelo cuidado com as famílias e pela construção de oportunidades reais de superação."},
  {"key": "founder_bio2",    "value": "À frente da AMEAS, inspira atletas, voluntários e parceiros a acreditarem em um ambiente mais inclusivo, acolhedor e comprometido com o desenvolvimento de cada pessoa."},
  {"key": "test1_quote",     "value": "A AMEAS mostra que o esporte também é pertencimento. Cada treino fortalece o corpo, a confiança e os vínculos."},
  {"key": "test1_author",    "value": "Família atendida"},
  {"key": "test2_quote",     "value": "Ver a evolução dos atletas é acompanhar histórias de coragem sendo escritas com apoio, técnica e afeto."},
  {"key": "test2_author",    "value": "Parceiro institucional"},
  {"key": "test3_quote",     "value": "Aqui a superação acontece em equipe. O incentivo certo transforma limites em novas conquistas."},
  {"key": "test3_author",    "value": "Atleta AMEAS"},
  {"key": "volunteer_title", "value": "Seja Voluntário(a)"},
  {"key": "volunteer_desc",  "value": "Venha fazer parte da AMEAS! Precisamos de voluntários para apoiar treinos, eventos, atividades administrativas e muito mais. Cada hora doada transforma vidas."},
  {"key": "org_sec1_name",   "value": "Secretário(a) Geral"},
  {"key": "org_sec2_name",   "value": "Secretário(a) Adjunto(a)"},
  {"key": "org_treas1_name", "value": "Tesoureiro(a) Geral"},
  {"key": "org_treas2_name", "value": "Tesoureiro(a) Adjunto(a)"},
  {"key": "org_audit1_name", "value": "Fiscal Geral"},
  {"key": "org_audit2_name", "value": "Fiscal Adjunto(a)"},
]

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

body = json.dumps(rows).encode("utf-8")
req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/ameas_site_content",
    data=body, headers=headers, method="POST"
)
with urllib.request.urlopen(req) as resp:
    print(f"Status: {resp.status} - OK")

# Verifica
req2 = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/ameas_site_content?key=in.(hero_title,test1_quote)",
    headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"},
    method="GET"
)
with urllib.request.urlopen(req2) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    for row in data:
        print(f"{row['key']}: {row['value'][:80]}")
