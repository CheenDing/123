import { useEffect, useRef } from 'react'
import { useAppState } from '../store/AppState'

function Snow({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !enabled) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let flakes: { x: number; y: number; r: number; speed: number; drift: number; phase: number }[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = width < 600 ? 34 : 64
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.5,
        speed: 7 + Math.random() * 11,
        drift: 4 + Math.random() * 9,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time = 0) => {
      ctx.clearRect(0, 0, width, height)
      flakes.forEach((flake) => {
        const x = flake.x + Math.sin(time * 0.0005 + flake.phase) * flake.drift
        ctx.beginPath()
        ctx.arc(x, flake.y, flake.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(91, 111, 116, .32)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x - 0.35, flake.y - 0.35, flake.r * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(250, 250, 246, .82)'
        ctx.fill()
      })
    }

    const loop = (time: number) => {
      const dt = Math.min((time - last) / 1000 || 0, 0.05)
      last = time
      flakes.forEach((flake) => {
        flake.y += flake.speed * dt
        if (flake.y > height + 4) {
          flake.y = -4
          flake.x = Math.random() * width
        }
      })
      draw(time)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reduced) draw()
      else if (!document.hidden) raf = requestAnimationFrame(loop)
    }
    const visibility = () => start()
    resize()
    start()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled])

  return enabled ? <canvas ref={ref} className="snow-canvas" aria-hidden="true" /> : null
}

export function Boat() {
  return (
    <svg className="boat" viewBox="0 0 240 150" aria-hidden="true">
      <ellipse cx="120" cy="132" rx="92" ry="5" fill="rgba(35,40,43,.06)" />
      <path d="M14 102C58 122 182 122 226 100C186 112 54 114 14 102Z" fill="rgba(35,40,43,.82)" />
      <path d="M20 101C62 113 178 113 222 99" fill="none" stroke="rgba(250,250,246,.58)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M118 100C117 83 124 71 134 67C143 64 150 72 152 85C153 92 152 97 151 100Z" fill="rgba(35,40,43,.84)" />
      <path d="M134 46L104 63Q134 56 164 63Z" fill="rgba(35,40,43,.88)" />
      <path d="M110 58Q134 46 158 58" fill="none" stroke="rgba(250,250,246,.6)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M146 78Q184 54 224 28" fill="none" stroke="rgba(35,40,43,.5)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M224 28Q228 78 226 124" fill="none" stroke="rgba(35,40,43,.3)" strokeWidth=".8" />
      <ellipse cx="226" cy="128" rx="12" ry="2" fill="none" stroke="rgba(94,107,112,.24)" strokeWidth=".8" />
    </svg>
  )
}

export default function InkScene({ compact = false }: { compact?: boolean }) {
  const { motionEnabled } = useAppState()
  return (
    <div className={`ink-scene ${compact ? 'ink-scene--compact' : ''}`} aria-hidden="true">
      <svg className="ridge ridge--far" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M0 574C139 553 209 579 324 528C434 480 493 524 610 490C731 455 775 386 895 424C1006 459 1062 420 1165 447C1281 477 1357 451 1440 479V900H0Z" fill="currentColor" />
      </svg>
      <svg className="ridge ridge--middle" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M0 645C112 628 211 636 305 594C392 555 465 601 560 565C658 528 705 488 799 505C895 523 956 569 1048 527C1142 484 1224 521 1312 548C1367 565 1409 555 1440 563V900H0Z" fill="currentColor" />
        <path d="M0 645C112 628 211 636 305 594C392 555 465 601 560 565C658 528 705 488 799 505C895 523 956 569 1048 527C1142 484 1224 521 1312 548C1367 565 1409 555 1440 563" fill="none" stroke="rgba(35,40,43,.25)" strokeWidth="2" />
        <path d="M555 566C643 534 706 490 790 505M1049 527C1112 500 1166 499 1228 522" fill="none" stroke="rgba(250,250,246,.58)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="mist-band" />
      <svg className="ridge ridge--near" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M0 701C133 676 238 698 349 665C456 633 533 672 642 650C755 627 838 584 950 610C1058 635 1124 604 1230 627C1328 648 1383 637 1440 650V900H0Z" fill="currentColor" />
        <path d="M0 701C133 676 238 698 349 665C456 633 533 672 642 650C755 627 838 584 950 610C1058 635 1124 604 1230 627C1328 648 1383 637 1440 650" fill="none" stroke="rgba(35,40,43,.25)" strokeWidth="2.4" />
      </svg>
      <div className="river-lines"><i /><i /><i /><i /><i /></div>
      <div className="scene-boat"><Boat /></div>
      <Snow enabled={motionEnabled} />
    </div>
  )
}
