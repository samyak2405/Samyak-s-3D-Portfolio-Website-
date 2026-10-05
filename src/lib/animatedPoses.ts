/**
 * Poses that ship a looping idle video alongside their static WebP.
 *
 * For each name here, public/characters/ must contain `<pose>.mp4` (H.264) and
 * ideally `<pose>.webm` (VP9) — both opaque, rendered on the site's dark
 * background (#0a0b0d) so they blend seamlessly. The <Character> component then
 * plays the video (looping, muted) and uses the WebP as the poster and as the
 * fallback for reduced-motion, older browsers, or any load error.
 *
 * Until a pose is listed here, it renders exactly as before (static WebP), so
 * adding a video is a one-line change once the files are in public/characters/.
 */
export const ANIMATED_POSES = new Set<string>([
  // 'hero-wave',
])
