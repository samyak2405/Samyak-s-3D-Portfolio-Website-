import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  FogExp2,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import { rng } from '../../lib/rng'

/**
 * The hero's 3D night city: looking down an avenue of instanced towers whose
 * windows are lit procedurally in the shader, with traffic light-trails, street
 * lamps, stars and the moon. The camera glides in on load, leans toward the
 * pointer and pushes down the avenue as the hero scrolls away.
 *
 * Plain three.js (no framework) so it can live in its own lazy chunk.
 */

export interface CityScene {
  /** Hero scroll progress, 0 (top) .. 1 (hero scrolled out). */
  setScroll(p: number): void
  /** Pointer position, -1..1 on both axes. */
  setPointer(x: number, y: number): void
  /** Pause rendering when off-screen / hidden. */
  setActive(active: boolean): void
  dispose(): void
}

interface Options {
  reducedMotion: boolean
  /** Fewer buildings and a lower pixel ratio on small screens. */
  lite: boolean
}

const FOG = new Color('#0f1124')
const FOG_DENSITY = 0.00125
const AVENUE_HALF = 18 // half-width of the avenue (x)
const CITY_NEAR = 30
const CITY_FAR = -1500

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

const buildingVert = /* glsl */ `
  attribute float aSeed;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vSeed;
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vN = normal;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const buildingFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFog;
  uniform float uFogDensity;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vSeed;

  // Dave Hoskins' hash12: no sin(), so it stays stable at large coordinates.
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float seed = floor(vSeed * 997.0 + 0.5) / 997.0;
    float height01 = clamp(vWorld.y / 240.0, 0.0, 1.0);
    vec3 col = mix(vec3(0.030, 0.036, 0.068), vec3(0.070, 0.084, 0.150), height01);

    bool side = abs(vN.y) < 0.5;
    if (side) {
      bool xFace = abs(vN.x) > 0.5;
      vec2 p = xFace ? vec2(vWorld.z, vWorld.y) : vec2(vWorld.x, vWorld.y);
      vec2 g = p / vec2(2.7, 3.5);
      vec2 id = floor(g);
      vec2 f = fract(g);
      vec2 fw = max(fwidth(g), vec2(1e-4));
      // 1 when a window cell spans several pixels, 0 when it is sub-pixel.
      float detail = 1.0 - smoothstep(0.16, 0.42, max(fw.x, fw.y));
      float wx = smoothstep(0.2 - fw.x, 0.2 + fw.x, f.x) * (1.0 - smoothstep(0.8 - fw.x, 0.8 + fw.x, f.x));
      float wy = smoothstep(0.26 - fw.y, 0.26 + fw.y, f.y) * (1.0 - smoothstep(0.74 - fw.y, 0.74 + fw.y, f.y));
      float win = wx * wy;

      float faceKey = xFace ? sign(vN.x) * 3.0 : sign(vN.z) * 7.0;
      float h = hash(id + vec2(seed * 91.0 + faceKey, seed * 17.0));
      // Each window re-rolls every ~30s at its own moment: a city that lives.
      float epoch = floor(uTime / 30.0 + h * 9.0);
      float roll = hash(id * 1.31 + epoch + seed);
      float density = mix(0.07, 0.24, fract(seed * 3.7));
      float lit = step(1.0 - density, roll) * step(1.0, id.y);

      vec3 warm = vec3(1.0, 0.76, 0.46);
      vec3 cool = vec3(0.56, 0.70, 1.0);
      vec3 winCol = mix(warm, cool, step(0.86, h)) * mix(0.5, 0.92, hash(id + 3.1));
      vec3 nearCol = mix(col + win * 0.012, winCol, win * lit); // unlit glass catches a little sky
      vec3 farCol = col + warm * density * 0.29 * 0.75;          // the same windows, averaged
      col = mix(farCol, nearCol, detail);

      // Shopfront glow on the street-level floor.
      float shop = step(id.y, 0.5) * step(0.0, id.y) * step(0.55, hash(id + seed));
      col += vec3(0.9, 0.55, 0.35) * shop * 0.22 * (1.0 - f.y);

      // Red spill from the traffic below, strongest on walls facing the avenue.
      float facing = xFace && (vN.x * -sign(vWorld.x) > 0.5) ? 1.0 : 0.35;
      col += vec3(0.62, 0.07, 0.11) * exp(-vWorld.y / 16.0) * 0.32 * facing;

      // Cool moonlight grazing the upper floors from the right.
      col += vec3(0.20, 0.27, 0.50) * 0.16 * max(dot(vN, normalize(vec3(0.55, 0.3, 0.75))), 0.0) * height01;
    } else if (vN.y > 0.5) {
      col *= 0.7; // rooftops
    }

    float d = distance(cameraPosition, vWorld);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
    gl_FragColor = vec4(mix(col, uFog, fog), 1.0);
  }
`

type Box = { x: number; z: number; w: number; d: number; h: number; seed: number }

function planCity(lite: boolean): Box[] {
  const r = rng(2405)
  const between = (a: number, b: number) => a + r() * (b - a)
  const boxes: Box[] = []

  // Blocks flanking the avenue, a few rows deep, broken by cross streets.
  const rows = lite ? 2 : 3
  for (const side of [-1, 1]) {
    for (let row = 0; row < rows; row++) {
      let z = CITY_NEAR + between(0, 10)
      while (z > CITY_FAR) {
        if (r() < 0.07) {
          z -= between(16, 22) // cross street
          continue
        }
        const d = between(14, 30)
        const w = between(16, 30)
        const x = side * (AVENUE_HALF + 3 + row * 34 + w / 2 + between(0, 3))
        const far = MathUtils.clamp((CITY_NEAR - z) / 900, 0, 1)
        // Keep the nearest towers modest so the sky above the headline stays
        // open; the skyline rises toward the vanishing point.
        const tall = z < -160 && r() < 0.1 + far * 0.2
        const h = tall ? between(130, 240) * (0.5 + far * 0.45) : between(18, 58) + far * between(10, 90)
        boxes.push({ x, z: z - d / 2, w, d, h, seed: r() })
        if (h > 110 && r() < 0.6) {
          // Setback crown.
          const k = between(0.5, 0.75)
          boxes.push({ x, z: z - d / 2, w: w * k, d: d * k, h: h + between(14, 40), seed: r() })
        }
        z -= d + between(2, 6)
      }
    }
  }

  // The skyline at the end of the avenue.
  for (let i = 0; i < (lite ? 50 : 90); i++) {
    const x = between(-900, 900)
    if (Math.abs(x) < AVENUE_HALF + 4) continue
    boxes.push({
      x,
      z: between(CITY_FAR - 260, CITY_FAR + 40),
      w: between(30, 70),
      d: between(30, 70),
      h: between(60, 300) * (1 - Math.abs(x) / 1400),
      seed: r(),
    })
  }
  return boxes
}

function buildingsMesh(boxes: Box[], material: ShaderMaterial) {
  const geo = new BoxGeometry(1, 1, 1)
  geo.translate(0, 0.5, 0)
  const mesh = new InstancedMesh(geo, material, boxes.length)
  const seeds = new Float32Array(boxes.length)
  const m = new Matrix4()
  const q = new Quaternion()
  boxes.forEach((b, i) => {
    m.compose(new Vector3(b.x, 0, b.z), q, new Vector3(b.w, b.h, b.d))
    mesh.setMatrixAt(i, m)
    seeds[i] = b.seed
  })
  geo.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

// ---------------------------------------------------------------------------
// Lights, sky, moon
// ---------------------------------------------------------------------------

function glowTexture(size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

function moonTexture() {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')!
  const R = s * 0.46
  g.save()
  g.beginPath()
  g.arc(s / 2, s / 2, R, 0, Math.PI * 2)
  g.clip()
  const body = g.createRadialGradient(s * 0.4, s * 0.36, 0, s / 2, s / 2, R)
  body.addColorStop(0, '#eceaf3')
  body.addColorStop(0.5, '#c7c4d6')
  body.addColorStop(1, '#6b6884')
  g.fillStyle = body
  g.fillRect(0, 0, s, s)
  const r = rng(77)
  for (let i = 0; i < 26; i++) {
    const cx = s / 2 + (r() * 2 - 1) * R * 0.8
    const cy = s / 2 + (r() * 2 - 1) * R * 0.8
    const cr = R * (0.03 + r() * r() * 0.16)
    const crater = g.createRadialGradient(cx, cy, 0, cx, cy, cr)
    crater.addColorStop(0, 'rgba(80,78,108,0.32)')
    crater.addColorStop(1, 'rgba(80,78,108,0)')
    g.fillStyle = crater
    g.beginPath()
    g.arc(cx, cy, cr, 0, Math.PI * 2)
    g.fill()
  }
  // Terminator shade on the lower left.
  const shade = g.createRadialGradient(s * 0.68, s * 0.3, R * 0.6, s * 0.6, s * 0.38, R * 1.25)
  shade.addColorStop(0, 'rgba(7,8,15,0)')
  shade.addColorStop(1, 'rgba(7,8,15,0.6)')
  g.fillStyle = shade
  g.fillRect(0, 0, s, s)
  g.restore()
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

function points(positions: Float32Array, material: PointsMaterial) {
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  const p = new Points(geo, material)
  p.frustumCulled = false
  return p
}

// ---------------------------------------------------------------------------

export function createCityScene(canvas: HTMLCanvasElement, opts: Options): CityScene {
  const renderer = new WebGLRenderer({ canvas, antialias: !opts.lite, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lite ? 1.5 : 1.75))

  const scene = new Scene()
  scene.fog = new FogExp2(FOG.getHex(), FOG_DENSITY)

  const camera = new PerspectiveCamera(42, 1, 1, 4000)
  const disposables: Array<{ dispose(): void }> = []

  // Buildings
  const buildingMat = new ShaderMaterial({
    vertexShader: buildingVert,
    fragmentShader: buildingFrag,
    uniforms: {
      uTime: { value: 0 },
      // The shader writes display (sRGB) values directly, so the fog colour
      // goes in as sRGB too (#0f1124) to match scene.fog on the other materials.
      uFog: { value: new Vector3(15 / 255, 17 / 255, 36 / 255) },
      uFogDensity: { value: FOG_DENSITY },
    },
  })
  const city = buildingsMesh(planCity(opts.lite), buildingMat)
  scene.add(city)
  disposables.push(city.geometry, buildingMat)

  // Asphalt
  const groundGeo = new PlaneGeometry(4000, 3000)
  groundGeo.rotateX(-Math.PI / 2)
  const groundMat = new MeshBasicMaterial({ color: '#05060b' })
  const ground = new Mesh(groundGeo, groundMat)
  ground.position.z = -1200
  scene.add(ground)
  disposables.push(groundGeo, groundMat)

  const glow = glowTexture()
  disposables.push(glow)
  const lightMat = (color: string, size: number) =>
    new PointsMaterial({
      color,
      size,
      map: glow,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    })

  // Street lamps along both kerbs.
  const lamps: number[] = []
  for (let z = CITY_NEAR; z > CITY_FAR; z -= 26) {
    lamps.push(-AVENUE_HALF + 0.5, 9, z, AVENUE_HALF - 0.5, 9, z - 13)
  }
  const lampMat = lightMat('#ffb15c', 5)
  const lampPts = points(new Float32Array(lamps), lampMat)
  scene.add(lampPts)
  disposables.push(lampPts.geometry, lampMat)

  // Traffic: taillights head away on the right lanes, headlights come toward
  // us on the left. Each car is a pair of points.
  const r = rng(99)
  const CARS = opts.lite ? 40 : 70
  type Car = { z: number; speed: number; lane: number }
  const makeCars = (dir: 1 | -1): Car[] =>
    Array.from({ length: CARS }, () => ({
      z: CITY_FAR + r() * (CITY_NEAR - CITY_FAR),
      speed: (22 + r() * 18) * dir,
      lane: dir < 0 ? 3 + Math.floor(r() * 3) * 3.6 : -(3 + Math.floor(r() * 3) * 3.6),
    }))
  const away = makeCars(-1)
  const toward = makeCars(1)
  const tailPos = new Float32Array(CARS * 2 * 3)
  const headPos = new Float32Array(CARS * 2 * 3)
  const tailMat = lightMat('#ff2a3a', 2.4)
  const headMat = lightMat('#fff1d6', 2.8)
  const tails = points(tailPos, tailMat)
  const heads = points(headPos, headMat)
  scene.add(tails, heads)
  disposables.push(tails.geometry, heads.geometry, tailMat, headMat)

  const writeCars = (cars: Car[], buf: Float32Array) => {
    cars.forEach((c, i) => {
      buf.set([c.lane - 0.8, 1.1, c.z, c.lane + 0.8, 1.1, c.z], i * 6)
    })
  }
  const stepCars = (cars: Car[], dt: number) => {
    for (const c of cars) {
      c.z += c.speed * dt
      if (c.z < CITY_FAR) c.z = CITY_NEAR
      if (c.z > CITY_NEAR + 20) c.z = CITY_FAR
    }
  }
  writeCars(away, tailPos)
  writeCars(toward, headPos)

  // Stars (screen-sized, unaffected by fog).
  const stars: number[] = []
  const sr = rng(5)
  for (let i = 0; i < 650; i++) {
    const a = (sr() * 2 - 1) * Math.PI * 0.55
    const y = 260 + sr() * 1300
    stars.push(Math.sin(a) * 2200, y, -Math.cos(a) * 2200)
  }
  const starMat = new PointsMaterial({ color: '#c9d4ff', size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.7, fog: false, depthWrite: false })
  const starPts = points(new Float32Array(stars), starMat)
  scene.add(starPts)
  disposables.push(starPts.geometry, starMat)

  // Moon + halo.
  const moonTex = moonTexture()
  const moonMat = new SpriteMaterial({ map: moonTex, fog: false, depthWrite: false })
  const moon = new Sprite(moonMat)
  moon.scale.setScalar(250)
  const haloMat = new SpriteMaterial({ map: glow, color: '#8aa2ff', fog: false, transparent: true, opacity: 0.28, blending: AdditiveBlending, depthWrite: false })
  const halo = new Sprite(haloMat)
  halo.scale.setScalar(900)
  scene.add(halo, moon)
  const smogMat = new SpriteMaterial({ map: glow, color: '#ff3b4a', fog: false, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false })
  const smog = new Sprite(smogMat)
  smog.scale.set(2600, 700, 1)
  smog.position.set(0, 60, CITY_FAR - 400)
  scene.add(smog)
  disposables.push(smogMat)
  disposables.push(moonTex, moonMat, haloMat)

  // ---------------------------------------------------------------------------
  // Camera rig
  // ---------------------------------------------------------------------------
  const rest = { y: 92, z: 60 }
  const state = {
    intro: opts.reducedMotion ? 1 : 0,
    scroll: 0,
    px: 0,
    py: 0,
    sx: 0,
    sy: 0,
    time: 0,
  }
  const look = new Vector3()

  const placeCamera = () => {
    const e = 1 - Math.pow(1 - state.intro, 3) // ease-out cubic
    const p = state.scroll
    const y = MathUtils.lerp(190, rest.y, e) - p * 30
    const z = MathUtils.lerp(340, rest.z, e) - p * 230
    const sway = opts.reducedMotion ? 0 : Math.sin(state.time * 0.35) * 0.8
    camera.position.set(state.sx * 8 + sway, y + state.sy * 4, z)
    look.set(state.sx * 60, 50 - p * 22 + state.sy * 20, z - 800)
    camera.lookAt(look)
  }

  let width = 0
  let height = 0
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h || (w === width && h === height)) return
    width = w
    height = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    // Keep the moon in the upper right whatever the aspect ratio. On portrait
    // screens it tucks into the top corner, above the headline.
    const hfov = Math.atan(Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
    const dist = 1500
    const portrait = camera.aspect < 0.9
    moon.scale.setScalar(portrait ? 150 : 250)
    moon.position.set(Math.tan(hfov) * dist * (portrait ? 0.8 : 0.58), portrait ? 540 : 330, rest.z - dist)
    halo.position.copy(moon.position).add(new Vector3(0, 0, -10))
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  let active = true
  let last = performance.now()
  const introStart = performance.now()
  const frame = () => {
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    state.time += dt
    if (state.intro < 1) state.intro = Math.min(1, (now - introStart) / 2800)
    // Ease the pointer so the camera leans, never snaps.
    const k = 1 - Math.exp(-dt / 0.6)
    state.sx += (state.px - state.sx) * k
    state.sy += (state.py - state.sy) * k

    stepCars(away, dt)
    stepCars(toward, dt)
    writeCars(away, tailPos)
    writeCars(toward, headPos)
    tails.geometry.attributes.position.needsUpdate = true
    heads.geometry.attributes.position.needsUpdate = true

    buildingMat.uniforms.uTime.value = state.time
    placeCamera()
    renderer.render(scene, camera)
  }

  const renderOnce = () => {
    placeCamera()
    renderer.render(scene, camera)
  }

  const run = () => {
    if (opts.reducedMotion) {
      renderer.setAnimationLoop(null)
      renderOnce()
      return
    }
    last = performance.now()
    renderer.setAnimationLoop(active ? frame : null)
  }
  run()

  return {
    setScroll(p) {
      state.scroll = MathUtils.clamp(p, 0, 1)
      if (opts.reducedMotion) renderOnce()
    },
    setPointer(x, y) {
      if (opts.reducedMotion) return
      state.px = MathUtils.clamp(x, -1, 1)
      state.py = MathUtils.clamp(y, -1, 1)
    },
    setActive(next) {
      if (next === active) return
      active = next
      run()
    },
    dispose() {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
