# Animated characters (moving avatars)

Each guide pose in `public/characters/<pose>.webp` can be upgraded to a looping,
muted **idle video**. The `<Character>` component plays the video when the pose
is listed in `src/lib/animatedPoses.ts`, and otherwise renders the static WebP.
The WebP is always the poster and the fallback (reduced-motion, unsupported
browser, or load error), so adding a video never regresses anyone.

## Why opaque video on a dark background (no green screen)

The character WebPs are **dark studio portraits** feathered into the page, not
tight cutouts — the character sits on the site's own dark background (`#0a0b0d`)
with a blue/magenta rim light. So the animated version is generated the same
way: an **opaque** clip on that same dark background. It blends seamlessly and
plays in every browser (H.264 MP4 + VP9 WebM), with no chroma-key artifacts and
no need for alpha video. The `.character-glow` neon still bleeds around it.

## Pipeline

1. **Source frame** — an opaque PNG of the pose on `#0a0b0d` (the exact site
   background), produced from the shipped WebP:
   ```bash
   convert public/characters/<pose>.webp -background '#0a0b0d' -flatten <pose>.png
   ```
2. **Generate** an image-to-video clip from that PNG (4–6 s, seamless loop,
   subtle idle motion — see per-pose prompts). Keep the dark background
   unchanged. Output is an MP4.
3. **Encode** to web-ready MP4 + WebM at the pose's intrinsic size (e.g. 921×1280):
   ```bash
   # H.264 MP4 (universal)
   ffmpeg -y -i raw.mp4 -vf "scale=921:1280:flags=lanczos,format=yuv420p" \
     -c:v libx264 -crf 23 -preset slow -movflags +faststart -an \
     public/characters/<pose>.mp4
   # VP9 WebM (smaller, served first)
   ffmpeg -y -i raw.mp4 -vf "scale=921:1280:flags=lanczos,format=yuv420p" \
     -c:v libvpx-vp9 -b:v 0 -crf 32 -an public/characters/<pose>.webm
   ```
   Keep each clip short and well-compressed (aim < ~400 KB) so the hero stays fast.
4. **Enable** the pose by adding its name to the set in
   `src/lib/animatedPoses.ts`. Done.

## Poses

`hero-wave`, `hero-style`, `about-arms-crossed`, `skills-gesturing`,
`projects-thinking`, `work-laptop`, `contact-thumbsup`.
