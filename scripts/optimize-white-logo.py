"""
Только сжатие white-logo.png — без перерисовки и без обрезки текста.
Положите оригинал в public/icons/white-logo.png и запустите:
  python scripts/optimize-white-logo.py
"""
from PIL import Image
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "public", "icons", "white-logo.png")
OUT = SRC
# Максимальная ширина для PDF (пропорции сохраняются)
MAX_WIDTH = 520


def optimize_in_place() -> None:
    if not os.path.exists(SRC):
        raise SystemExit(f"Нет файла: {SRC}")

    im = Image.open(SRC).convert("RGBA")
    before = os.path.getsize(SRC)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    if im.width > MAX_WIDTH:
        ratio = MAX_WIDTH / im.width
        new_h = max(1, int(im.height * ratio))
        im = im.resize((MAX_WIDTH, new_h), Image.Resampling.LANCZOS)

    im.save(OUT, format="PNG", optimize=True, compress_level=9)
    after = os.path.getsize(OUT)
    print(f"OK {im.size[0]}x{im.size[1]}  {before // 1024} KB -> {after // 1024} KB")


if __name__ == "__main__":
    optimize_in_place()
