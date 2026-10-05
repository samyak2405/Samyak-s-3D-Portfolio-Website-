#!/usr/bin/env python3
"""
Prepare the dark-background character renders for the site.

These are rendered on a dark #0A0B0D spotlight backdrop that matches the theme,
so the background is KEPT (not removed) and the images blend into the page. We
only auto-crop to the lit character + spotlight, resize, and encode WebP.

Put the sources in `characters-src/` (gitignored) and run:
    python3 scripts/process-characters.py
Outputs go to `public/characters/*.webp`.
"""
import os
from PIL import Image, ImageChops, ImageDraw

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
    "skill-gesturing.png": "skills-gesturing",
    "contact-thumbsup.png": "contact-thumbsup",
}

MAX_DIM = 1280
PAD_FRAC = 0.03  # padding around the detected content, as a fraction of size
THRESH = 30      # higher = crop tighter to the character, ignoring faint glow


def paint_out_watermark(img: Image.Image) -> Image.Image:
    """Cover the AI sparkle watermark in the bottom-right corner with the dark
    corner colour."""
    img = img.convert("RGB")
    w, h = img.size
    corner = img.getpixel((2, 2))
    d = ImageDraw.Draw(img)
    d.rectangle([int(w * 0.90), int(h * 0.84), w, h], fill=corner)
    return img


def feather_edges(img: Image.Image, fx: float = 0.22, fy_top: float = 0.05,
                  fy_bot: float = 0.10) -> Image.Image:
    """Fade the outer edges to transparent so the dark backdrop melts into the
    page instead of showing as a rectangle. Keeps the centre (character) opaque."""
    img = img.convert("RGBA")
    w, h = img.size

    def ramp(n, lo, hi):
        row = Image.new("L", (n, 1))
        px = row.load()
        a = max(1, int(n * lo))
        b = n - max(1, int(n * hi))
        for i in range(n):
            if i < a:
                v = int(255 * i / a)
            elif i > b:
                v = int(255 * (n - i) / max(1, n - b))
            else:
                v = 255
            px[i, 0] = max(0, min(255, v))
        return row

    hgrad = ramp(w, fx, fx).resize((w, h))
    vgrad = ramp(h, fy_top, fy_bot).transpose(Image.ROTATE_90).resize((w, h))
    alpha = ImageChops.darker(hgrad, vgrad)
    img.putalpha(alpha)
    return img


def content_mask(img: Image.Image, thresh: int = THRESH) -> Image.Image:
    """Mask of pixels that differ from the (dark) top-left corner."""
    rgb = img.convert("RGB")
    corner = rgb.getpixel((2, 2))
    bg = Image.new("RGB", rgb.size, corner)
    diff = ImageChops.difference(rgb, bg).convert("L")
    return diff.point(lambda p: 255 if p > thresh else 0)


def main():
    for src, name in JOBS.items():
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print("MISSING", p)
            continue
        img = paint_out_watermark(Image.open(p))
        w, h = img.size
        mask = content_mask(img)
        bbox = mask.getbbox()
        if bbox:
            l, t, r, b = bbox
            pady = int(h * PAD_FRAC)
            t = max(0, t - pady)
            b = min(h, b + pady)
            ch = b - t
            # Center the crop on the HEAD (top band of content), which sits on the
            # character's centre line, not on the glow-skewed full bbox.
            head = mask.crop((0, t, w, t + max(1, int(ch * 0.28)))).getbbox()
            cx = ((head[0] + head[2]) // 2) if head else ((l + r) // 2)
            cw = min(w, int(ch * 0.72))  # portrait frame around the character
            cl = max(0, min(cx - cw // 2, w - cw))
            img = img.crop((cl, t, cl + cw, b))
        scale = MAX_DIM / max(img.size)
        if scale < 1:
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        img = feather_edges(img)
        outp = os.path.join(OUT, name + ".webp")
        img.save(outp, "WEBP", quality=84, method=6)
        print(f"{name:20s} {img.size[0]}x{img.size[1]}  {os.path.getsize(outp)//1024} KB")


if __name__ == "__main__":
    main()
