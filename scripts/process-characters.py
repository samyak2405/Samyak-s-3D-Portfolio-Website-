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
from PIL import Image, ImageChops, ImageDraw, ImageFilter

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


def feather_edges(img: Image.Image, rx: float = 0.40, ry: float = 0.58,
                  cx: float = 0.5, cy: float = 0.47, blur: float = 0.085) -> Image.Image:
    """Vignette the backdrop to transparency with a SOFT ELLIPSE centred on the
    character, so the render's own spotlight fades outward into the page as a
    radial glow instead of a rectangular box. A rectangular feather would leave a
    boxy opaque core (the spotlight has the same brightness as the dark clothing,
    so it can't be keyed out per-pixel); a radial fade has no straight edges, so
    the figure reads as part of the dark background."""
    img = img.convert("RGBA")
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse(
        [(cx - rx) * w, (cy - ry) * h, (cx + rx) * w, (cy + ry) * h], fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(max(1, int(w * blur))))
    img.putalpha(mask)
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
