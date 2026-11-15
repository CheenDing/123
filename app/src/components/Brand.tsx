import { Link } from 'react-router'

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand--light' : ''}`} aria-label="万径首页">
      <span className="brand__name">万径</span>
      <span className="brand__latin">WANJING</span>
      <span className="brand__seal" aria-hidden="true">万径</span>
    </Link>
  )
}
