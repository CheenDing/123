import { useState } from 'react'
import { ArrowRight, Check, Compass, FlaskConical, Quote } from 'lucide-react'
import { Link } from 'react-router'
import AppShell from '../components/AppShell'
import { lifePaths } from '../data/demo'
import { useAppState } from '../store/AppState'

const ratingLabels = ['向往', '把握', '资源', '一致']
const ratingWords = ['很弱', '较弱', '说不清', '较强', '很强']

export default function Paths() {
  const {
    selectedPath, setSelectedPath, pathRatings, setPathRatings,
    completedTasks, setCompletedTasks, notify,
  } = useAppState()
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState('')
  const path = lifePaths.find((item) => item.id === selectedPath) ?? lifePaths[0]
  const ratings = pathRatings[path.id] ?? [3, 3, 3, 3]
  const taskDone = completedTasks.includes(path.id)

  const updateRating = (index: number, value: number) => {
    setPathRatings((current) => ({
      ...current,
      [path.id]: (current[path.id] ?? [3, 3, 3, 3]).map((item, itemIndex) => itemIndex === index ? value : item),
    }))
  }

  return (
    <AppShell>
      <section className="page-heading paths-heading">
        <div><span className="section-mark">第二幕 · 见径</span><h1>你不必只有<br />一种正确的人生。</h1></div>
        <p>延续当下，换一条路，或暂时抛开别人的期待。<br />三条都是 A 计划。先别选，先让每条路活起来。</p>
      </section>

      <div className="path-tabs" role="tablist" aria-label="三种五年路径">
        {lifePaths.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={path.id === item.id} className={path.id === item.id ? 'is-active' : ''} onClick={() => { setSelectedPath(item.id); setShowReflection(false) }}>
            <span>{item.eyebrow}</span>
            <strong>{item.title}</strong>
            <small>{item.subtitle}</small>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>

      <section className={`path-canvas path-canvas--${path.id}`} aria-live="polite">
        <svg className="path-line" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
          <path d={path.id === 'machine' ? 'M0 124C183 119 211 42 394 71C579 100 640 34 808 49C956 61 1028 19 1200 27' : path.id === 'robot' ? 'M0 126C154 131 236 97 356 106C487 116 508 43 642 60C794 80 838 20 972 47C1074 68 1125 41 1200 29' : 'M0 121C178 91 263 124 389 80C506 39 573 85 701 59C849 28 972 77 1087 40C1135 25 1172 29 1200 24'} fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 7" />
        </svg>
        <div className="path-intro">
          <span className="section-mark">五年以后，一个普通的日子</span>
          <h2>{path.title}</h2>
          <p>{path.scene}</p>
          <div className="path-majors">{path.majors.map((major) => <span key={major}>{major}</span>)}</div>
        </div>
        <blockquote className="path-question"><Quote size={19} strokeWidth={1.2} /><p>{path.question}</p><small>这条路真正需要验证的问题</small></blockquote>
      </section>

      <section className="timeline-section" aria-labelledby="timeline-title">
        <div className="section-title-row"><div><span className="section-mark">不是预测，是想象的原型</span><h2 id="timeline-title">把五年，摊在江面上。</h2></div><Compass size={30} strokeWidth={1} aria-hidden="true" /></div>
        <div className="five-year-timeline">
          {path.years.map((year, index) => (
            <article key={year.year}>
              <div className="timeline-marker"><span>{index + 1}</span><i /></div>
              <small>{year.year}</small>
              <h3>{year.title}</h3>
              <p>{year.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="path-bottom-grid">
        <section className="intuition-panel" aria-labelledby="intuition-title">
          <span className="section-mark">只问此刻的自己</span>
          <h2 id="intuition-title">你的直觉，不必和分数一致。</h2>
          <p>由你拖动，不由 AI 打分。它只记录你此刻的感受，不代表未来。</p>
          <div className="rating-list">
            {ratingLabels.map((label, index) => (
              <label key={label}>
                <span>{label}<small>{ratingWords[ratings[index] - 1]}</small></span>
                <input type="range" min="1" max="5" step="1" value={ratings[index]} onChange={(event) => updateRating(index, Number(event.target.value))} aria-label={`${label}程度`} />
              </label>
            ))}
          </div>
          <button className="quiet-button" type="button" onClick={() => notify('此刻的直觉已保存')}>保存此刻直觉</button>
        </section>

        <section className="prototype-panel" aria-labelledby="prototype-title">
          <span className="section-mark"><FlaskConical size={14} /> 最小现实实验</span>
          <h2 id="prototype-title">{path.task.title}</h2>
          <p>{path.task.duration}</p>
          <ol>{path.task.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          {taskDone ? (
            <p className="task-complete"><Check size={16} /> 已留下一次真实体验。路因此更清楚了一点。</p>
          ) : !showReflection ? (
            <button className="ink-button" type="button" onClick={() => setShowReflection(true)}>我试过了，记录感受 <ArrowRight size={15} /></button>
          ) : (
            <form className="reflection-form" onSubmit={(event) => {
              event.preventDefault()
              if (!reflection.trim()) return
              setCompletedTasks((current) => [...current, path.id])
              setShowReflection(false)
              setReflection('')
              notify('体验已记下，成为新的证据')
            }}>
              <label htmlFor="path-reflection">实际体验和想象相比，哪里不一样？</label>
              <textarea id="path-reflection" value={reflection} onChange={(event) => setReflection(event.target.value)} rows={3} placeholder="遇到困难时，我还想继续吗……" autoFocus />
              <div><button className="ink-button" type="submit" disabled={!reflection.trim()}>记下这次体验</button><button className="quiet-button" type="button" onClick={() => setShowReflection(false)}>稍后再写</button></div>
            </form>
          )}
        </section>
      </div>

      <div className="next-step-bar next-step-bar--wide"><span>不用选终身方向。只选几个值得亲自验证的专业。</span><Link className="primary-link" to="/majors">带着这条路，去看专业 <ArrowRight size={16} /></Link></div>
    </AppShell>
  )
}
