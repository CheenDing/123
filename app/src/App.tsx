import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { AppStateProvider } from './store/AppState'
import Landing from './pages/Landing'
import Discover from './pages/Discover'
import Paths from './pages/Paths'
import Majors from './pages/Majors'
import Admission from './pages/Admission'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <main className="not-found">
      <span>空江</span>
      <h1>这一条路，还没有铺开。</h1>
      <p>回到江面，重新选择一个方向。</p>
      <Link className="ink-button" to="/"><ArrowLeft size={16} /> 回到万径</Link>
    </main>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/paths" element={<Paths />} />
        <Route path="/majors" element={<Majors />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppStateProvider>
  )
}
