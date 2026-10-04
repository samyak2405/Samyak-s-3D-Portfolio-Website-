#!/usr/bin/env python3
"""
Turn the raw white-background character PNGs into cropped, transparent, resized WebP.

Put the source PNGs in `characters-src/` (gitignored, not shipped) and run:
    python3 scripts/process-characters.py
Outputs go to `public/characters/*.webp` (these are what the site ships).

Requires Pillow (`pip install Pillow`). Re-run whenever a pose is added/replaced.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "characters-src")
OUT = os.path.join(ROOT, "public", "characters")
os.makedirs(OUT, exist_ok=True)

# source filename -> output basename
JOBS = {
    "hero-wave.png": "hero-wave",
    "hero-style.png": "hero-style",
    "about-arms-crossed.png": "about-arms-crossed",
    "work-laptop.png": "work-laptop",
    "projects-thinking.png": "projects-thinking",
    "contact-thumbsup.png": "contact-thumbsup",
    "skills-gesturing.png": "skills-gesturing",
}

THRESH = 72      # distance from a corner's white that still counts as background
MAX_DIM = 1200   # longest side after cropping
PAD = 24         # transparent padding kept around the character


def remove_bg(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    sentinel = (255, 0, 255, 0)
    seeds = [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
        (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
    ]
    for s in seeds:
        ImageDraw.floodfill(img, s, sentinel, thresh=THRESH)

    px = img.load()
    alpha = Image.new("L", (w, h), 0)
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            ap[x, y] = 0 if (r == 255 and g == 0 and b == 255) else 255

    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = Image.new("RGBA", (w, h))
    out.paste(img.convert("RGB"), (0, 0))
    out.putalpha(alpha)
    return out


def main():
    for src, name in JOBS.items():
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print("MISSING", p)
            continue
        img = remove_bg(Image.open(p))
        bbox = img.getbbox()
        if bbox:
            l, t, r, b = bbox
            img = img.crop((max(0, l - PAD), max(0, t - PAD),
                            min(img.width, r + PAD), min(img.height, b + PAD)))
        scale = MAX_DIM / max(img.size)
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        outp = os.path.join(OUT, name + ".webp")
        img.save(outp, "WEBP", quality=82, method=6)
        print(f"{name:20s} {img.size[0]}x{img.size[1]}  {os.path.getsize(outp)//1024} KB")


if __name__ == "__main__":
    main()
