import { useMemo, useState } from 'react'
import { ArrowRight, Check, FlaskConical, Plus, Search } from 'lucide-react'
import { Link } from 'react-router'
import AppShell from '../components/AppShell'
import { lifePaths, majors } from '../data/demo'
import { useAppState } from '../store/AppState'

export default function Majors() {
  const { selectedMajors, setSelectedMajors, selectedPath, notify } = useAppState()
  const [query, setQuery] = useState('')
  const path = lifePaths.find((item) => item.id === selectedPath) ?? lifePaths[0]
  const filtered = useMemo(() => majors.filter((major) => `${major.name}${major.category}${major.essence}`.includes(query.trim())), [query])

  const toggle = (id: string, name: string) => {
    const selected = selectedMajors.includes(id)
    setSelectedMajors((current) => selected ? current.filter((item) => item !== id) : [...current, id])
    notify(selected ? `已移出「${name}」` : `已把「${name}」收进探索清单`)
  }

  return (
    <AppShell>
      <section className="page-heading majors-heading">
        <div><span className="section-mark">第三幕 · 试路</span><h1>专业不是一个名字。<br />是四年里，反复做的事。</h1></div>
        <p>同时看吸引你的部分与需要付出的代价。<br />这里没有“最适合”，只有“值得亲自验证”。</p>
      </section>

      <div className="major-toolbar">
        <div className="path-context"><span>正在从</span><strong>「{path.title}」</strong><span>向外探索</span></div>
        <label className="major-search"><Search size={17} strokeWidth={1.4} /><span className="sr-only">搜索专业</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索专业或学习内容" /></label>
      </div>

      <div className="major-list">
        {filtered.map((major) => {
          const selected = selectedMajors.includes(major.id)
          return (
            <article className={`major-item ${selected ? 'is-selected' : ''}`} key={major.id}>
              <div className="major-item__main">
                <div className="major-title-line"><span>{major.category}</span>{major.pathId === selectedPath && <small>与当前路径相连</small>}</div>
                <h2>{major.name}</h2>
                <p className="major-essence">{major.essence}</p>
                <div className="course-list">{major.courses.map((course) => <span key={course}>{course}</span>)}</div>
              </div>
              <div className="major-item__reflection">
                <div><span>为什么与你有关</span><p>{major.like}</p></div>
                <div><span>也要看见这一面</span><p>{major.caution}</p></div>
              </div>
              <div className="major-item__action">
                <button type="button" className={selected ? 'selected-button' : 'outline-button'} onClick={() => toggle(major.id, major.name)}>
                  {selected ? <Check size={16} /> : <Plus size={16} />}{selected ? '已在探索清单' : '收进探索清单'}
                </button>
                <details>
                  <summary><FlaskConical size={14} /> 可以做的一个小实验</summary>
                  <p>{major.prototype}</p>
                </details>
              </div>
            </article>
          )
        })}
        {filtered.length === 0 && <div className="empty-state"><span>江面无痕</span><h2>没有找到这个名字。</h2><p>试试“智能”“计算”或清空搜索。</p><button className="quiet-button" type="button" onClick={() => setQuery('')}>清空搜索</button></div>}
      </div>

      <p className="content-disclaimer">以上为 MVP 通识示例，用于展示探索方式；具体课程与培养方向请以各高校最新培养方案为准。</p>
      <div className="next-step-bar next-step-bar--wide">
        <span>探索清单 · {selectedMajors.length} 个专业方向</span>
        {selectedMajors.length > 0 ? <Link className="primary-link" to="/admission">连接分数与现实约束 <ArrowRight size={16} /></Link> : <button className="primary-link" type="button" disabled>先收进至少一个方向</button>}
      </div>
    </AppShell>
  )
}
