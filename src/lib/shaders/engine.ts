import { byId, type ShaderParams } from './library'
import { fragmentSource, GLYPHS, hexToRgb, VERT } from './glsl'

/**
 * One WebGL context draws every background on the page.
 * Each view owns a plain 2D canvas; the engine renders the view's shader into
 * an offscreen GL canvas and copies the pixels across. Views that are
 * offscreen are skipped, and time stops while the engine is paused.
 */

export interface ViewState {
  id: string
  params: ShaderParams
}

interface View {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dprCap: number
  visible: boolean
  current: ViewState
  prev: ViewState | null
  fadeStart: number
  dirty: boolean
  w: number
  h: number
}

const FADE_MS = 300
const UNIFORMS = ['uRes', 'uTime', 'uSpeed', 'uScale', 'uGrain', 'uCell', 'uC0', 'uC1', 'uC2', 'uC3', 'uAtlas'] as const
type Prog = { p: WebGLProgram; u: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null> }

class Engine {
  private gl: WebGLRenderingContext | null = null
  private glCanvas: HTMLCanvasElement | null = null
  private progs = new Map<string, Prog | null>()
  private atlas: WebGLTexture | null = null
  private views = new Set<View>()
  private io: IntersectionObserver | null = null
  private ro: ResizeObserver | null = null
  private clock = 14
  private last = 0
  private listeners = new Set<() => void>()
  paused = false
  readonly reduced: boolean
  failed = false

  constructor() {
    this.reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  private init() {
    if (this.gl || this.failed) return
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' })
    if (!gl) { this.failed = true; this.emit(); return }
    this.gl = gl
    this.glCanvas = c
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    this.buildAtlas()
    document.fonts?.load("64px 'Geist Mono'").then(() => { this.buildAtlas(); this.markAll() }).catch(() => {})

    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) for (const v of this.views) if (v.canvas === e.target) { v.visible = e.isIntersecting; v.dirty = true }
    }, { rootMargin: '120px' })
    this.ro = new ResizeObserver((entries) => {
      for (const e of entries) for (const v of this.views) if (v.canvas === e.target) this.size(v)
    })
    document.addEventListener('visibilitychange', () => { this.last = performance.now() })
    this.last = performance.now()
    requestAnimationFrame(this.frame)
  }

  private buildAtlas() {
    const gl = this.gl
    if (!gl) return
    const gw = 48, gh = 77
    const c = document.createElement('canvas')
    c.width = gw * 10; c.height = gh
    const x = c.getContext('2d')!
    x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height)
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.font = "62px 'Geist Mono', ui-monospace, monospace"
    ;[...GLYPHS].forEach((ch, i) => x.fillText(ch, i * gw + gw / 2, gh / 2 + 3))
    if (!this.atlas) this.atlas = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.atlas)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  private program(id: string): Prog | null {
    if (this.progs.has(id)) return this.progs.get(id)!
    const gl = this.gl!, def = byId(id)
    if (!def) { this.progs.set(id, null); return null }
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(`[aurashades] ${id}`, gl.getShaderInfoLog(s))
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fragmentSource(def)))
    gl.bindAttribLocation(p, 0, 'p')
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { this.progs.set(id, null); return null }
    const u = {} as Prog['u']
    for (const n of UNIFORMS) u[n] = gl.getUniformLocation(p, n)
    const prog = { p, u }
    this.progs.set(id, prog)
    return prog
  }

  private size(v: View) {
    const dpr = Math.min(window.devicePixelRatio || 1, v.dprCap)
    const w = Math.max(1, Math.round(v.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(v.canvas.clientHeight * dpr))
    if (w !== v.w || h !== v.h) {
      v.w = w; v.h = h
      v.canvas.width = w; v.canvas.height = h
      v.dirty = true
    }
  }

  private draw(v: View, s: ViewState, alpha: number) {
    const gl = this.gl!, gc = this.glCanvas!
    const P = this.program(s.id)
    if (!P) return
    if (gc.width < v.w || gc.height < v.h) {
      gc.width = Math.max(gc.width, v.w)
      gc.height = Math.max(gc.height, v.h)
    }
    const dpr = v.w / Math.max(1, v.canvas.clientWidth)
    gl.viewport(0, 0, v.w, v.h)
    gl.useProgram(P.p)
    const u = P.u, pr = s.params
    gl.uniform2f(u.uRes, v.w, v.h)
    gl.uniform1f(u.uTime, this.clock)
    gl.uniform1f(u.uSpeed, pr.speed)
    gl.uniform1f(u.uScale, pr.scale)
    gl.uniform1f(u.uGrain, pr.grain)
    gl.uniform1f(u.uCell, pr.cell * dpr)
    pr.palette.forEach((hx, i) => gl.uniform3fv(u[`uC${i}` as 'uC0'], hexToRgb(hx)))
    if (u.uAtlas) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.atlas)
      gl.uniform1i(u.uAtlas, 0)
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    v.ctx.globalAlpha = alpha
    v.ctx.drawImage(gc, 0, gc.height - v.h, v.w, v.h, 0, 0, v.w, v.h)
  }

  private frame = (now: number) => {
    requestAnimationFrame(this.frame)
    const dt = Math.min(0.1, (now - this.last) / 1000)
    this.last = now
    const moving = !this.paused && !this.reduced
    if (moving) this.clock += dt
    for (const v of this.views) {
      if (!v.visible) continue
      const fading = v.prev && now - v.fadeStart < FADE_MS
      if (!moving && !v.dirty && !fading) continue
      if (v.w < 2 || v.h < 2) this.size(v)
      v.ctx.globalAlpha = 1
      if (fading && v.prev) {
        const k = (now - v.fadeStart) / FADE_MS
        const e = 1 - Math.pow(1 - k, 3)
        this.draw(v, v.prev, 1)
        this.draw(v, v.current, e)
      } else {
        v.prev = null
        this.draw(v, v.current, 1)
      }
      v.dirty = false
    }
  }

  register(canvas: HTMLCanvasElement, state: ViewState, dprCap = 1.5) {
    this.init()
    if (!this.gl) return () => {}
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return () => {}
    const v: View = { canvas, ctx, dprCap, visible: true, current: state, prev: null, fadeStart: 0, dirty: true, w: 0, h: 0 }
    this.views.add(v)
    this.size(v)
    this.io!.observe(canvas)
    this.ro!.observe(canvas)
    return () => {
      this.views.delete(v)
      this.io?.unobserve(canvas)
      this.ro?.unobserve(canvas)
    }
  }

  update(canvas: HTMLCanvasElement, state: ViewState, fade = false) {
    for (const v of this.views) if (v.canvas === canvas) {
      if ((fade || v.current.id !== state.id) && !this.reduced) {
        v.prev = { id: v.current.id, params: v.current.params }
        v.fadeStart = performance.now()
      }
      v.current = state
      v.dirty = true
    }
  }

  private markAll() { for (const v of this.views) v.dirty = true }

  setPaused(p: boolean) { this.paused = p; this.markAll(); this.emit() }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
  private emit() { this.listeners.forEach((f) => f()) }
}

let engine: Engine | null = null
export const getEngine = () => (engine ??= new Engine())
