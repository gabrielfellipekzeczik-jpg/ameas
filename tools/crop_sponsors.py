from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "src/assets/ameas-parceiros-banner.png"
out_dir = ROOT / "src/assets"
image = Image.open(source).convert("RGBA")

# Centros medidos no banner original 837 x 835. Cada recorte contém o círculo
# completo e mantém a mesma escala/proporção para o cartão do site.
crops = {
    "sponsor-rua-hum.png": (216, 305),
    "sponsor-escola-aquarela.png": (349, 305),
    "sponsor-ibicolor.png": (480, 305),
    "sponsor-vila-don-patto.png": (612, 305),
    "sponsor-unimed-sao-roque.png": (216, 432),
    "sponsor-emporio-qn.png": (349, 432),
    "sponsor-tia-lina.png": (480, 432),
    "sponsor-fernando-araujo.png": (612, 432),
    "sponsor-qualiser-contabilidade.png": (216, 744),
    "sponsor-jornal-da-economia.png": (640, 744),
}
size = 124
half = size // 2
for filename, (cx, cy) in crops.items():
    crop = image.crop((cx - half, cy - half, cx - half + size, cy - half + size))
    crop.save(out_dir / filename, optimize=True)
print(f"Recortados {len(crops)} logos a partir de {source.name}")
