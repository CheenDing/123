import { BookOpen, Compass, Map, RotateCcw, Snowflake, SlidersHorizontal } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import Brand from './Brand'
import InkScene from './InkScene'
import { useAppState } from '../store/AppState'

const navItems = [
  { to: '/discover', label: '识我', sub: '从证据开始', icon: Compass },
  { to: '/paths', label: '见径', sub: '三种五年', icon: Map },
  { to: '/majors', label: '试路', sub: '走进专业', icon: BookOpen },
  { to: '/admission', label: '落定', sub: '连接现实', icon: SlidersHorizontal },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { motionEnabled, setMotionEnabled, resetDemo, notice } = useAppState()
  const location = useLocation()
  const current = navItems.find((item) => location.pathname.startsWith(item.to))

  return (
    <div className="app-shell">
      <InkScene compact />
      <header className="app-header">
        <Brand />
        <nav className="main-nav" aria-label="探索流程">
          {navItems.map(({ to, label, sub, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `main-nav__item ${isActive ? 'is-active' : ''}`}>
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>{label}</span>
              <small>{sub}</small>
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={() => setMotionEnabled(!motionEnabled)} aria-label={motionEnabled ? '关闭落雪动效' : '开启落雪动效'} title={motionEnabled ? '关闭落雪' : '开启落雪'}>
            <Snowflake size={18} strokeWidth={1.5} className={motionEnabled ? 'is-on' : ''} />
          </button>
          <button className="icon-button" type="button" onClick={() => { if (window.confirm('要清除本次浏览器里的探索记录，重新演示吗？')) resetDemo() }} aria-label="重置演示" title="重置演示">
            <RotateCcw size={17} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="chapter-strip">
        <span>卷一 · 独钓寒江雪</span>
        <span>{current ? `${current.label} · ${current.sub}` : '万径'}</span>
      </div>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <span>万径不替你决定，只帮你把每条路看清一点。</span>
        <span>MVP 交互原型 · 数据保存在此浏览器</span>
      </footer>

      <nav className="mobile-nav" aria-label="移动端探索流程">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'is-active' : ''}>
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={`toast ${notice ? 'toast--visible' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div>
  )
}
