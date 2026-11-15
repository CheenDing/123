import { useState } from 'react'
import { ArrowUpRight, Check, Clipboard, Link2, Route } from 'lucide-react'
import AppShell from '../components/AppShell'
import { majors } from '../data/demo'
import { useAppState } from '../store/AppState'

export default function Admission() {
  const { selectedMajors, notify } = useAppState()
  const [form, setForm] = useState({ province: '江苏', subject: '物理类', score: '612', rank: '18432' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)
  const selected = majors.filter((major) => selectedMajors.includes(major.id))

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setReady(false)
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const submit = () => {
    const nextErrors: Record<string, string> = {}
    const score = Number(form.score)
    const rank = Number(form.rank)
    if (!form.score || score < 0 || score > 750) nextErrors.score = '请输入 0–750 之间的分数'
    if (!form.rank || rank < 1 || !Number.isInteger(rank)) nextErrors.rank = '请输入有效的正整数位次'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      setReady(true)
      notify('现实约束已核对，可以带入志愿决策台')
    }
  }

  const copyList = async () => {
    const text = `我的专业探索清单：${selected.map((major) => major.name).join('、')}。考生约束：${form.province}，${form.subject}，${form.score} 分，位次 ${form.rank}。`
    try {
      await navigator.clipboard.writeText(text)
      notify('专业清单与考生约束已复制')
    } catch {
      notify('浏览器未允许复制，请手动选择清单文字')
    }
  }

  return (
    <AppShell>
      <section className="page-heading admission-heading">
        <div><span className="section-mark">第四幕 · 落定</span><h1>现在，才让分数<br />回到它该在的位置。</h1></div>
        <p>它是很重要的现实约束，<br />但不再替你回答“我想成为谁”。</p>
      </section>

      <section className="journey-recap" aria-label="本次探索摘要">
        <div><Route size={23} strokeWidth={1.2} /><span>从一条理解开始</span><strong>智能如何发生</strong></div>
        <i />
        <div><span>经过三条五年路径</span><strong>感知智能 · 具身智能 · 脑机交叉</strong></div>
        <i />
        <div><span>带着 {selected.length} 个方向</span><strong>{selected.map((major) => major.name).join(' · ') || '尚未选择专业'}</strong></div>
      </section>

      <div className="admission-grid">
        <section className="constraint-panel" aria-labelledby="constraint-title">
          <span className="section-mark">现实约束 · 演示数据</span>
          <h2 id="constraint-title">把可报考的条件，交给规则。</h2>
          <p>当前线上决策台主要使用江苏历史录取数据。这里先完成约束核对，不生成虚构的录取结论。</p>
          <div className="constraint-form">
            <label>省份<select value={form.province} onChange={(event) => update('province', event.target.value)}><option>江苏</option></select></label>
            <label>科类<select value={form.subject} onChange={(event) => update('subject', event.target.value)}><option>物理类</option><option>历史类</option></select></label>
            <label>高考分数<input type="number" min="0" max="750" value={form.score} onChange={(event) => update('score', event.target.value)} aria-describedby={errors.score ? 'score-error' : undefined} />{errors.score && <small className="form-error" id="score-error">{errors.score}</small>}</label>
            <label>全省位次<input type="number" min="1" step="1" value={form.rank} onChange={(event) => update('rank', event.target.value)} aria-describedby={errors.rank ? 'rank-error' : undefined} />{errors.rank && <small className="form-error" id="rank-error">{errors.rank}</small>}</label>
          </div>
          <button className="ink-button" type="button" onClick={submit}><Check size={16} /> 核对约束，准备衔接</button>
        </section>

        <section className={`handoff-panel ${ready ? 'is-ready' : ''}`} aria-labelledby="handoff-title">
          <span className="section-mark"><Link2 size={14} /> 连接现有能力</span>
          <h2 id="handoff-title">探索清单，<br />交给分数匹配引擎。</h2>
          <div className="handoff-list">
            {selected.map((major) => <span key={major.id}>{major.name}</span>)}
          </div>
          <dl className="constraint-summary">
            <div><dt>地区与科类</dt><dd>{form.province} · {form.subject}</dd></div>
            <div><dt>演示分数</dt><dd>{form.score || '—'} 分</dd></div>
            <div><dt>演示位次</dt><dd>{form.rank ? Number(form.rank).toLocaleString('zh-CN') : '—'}</dd></div>
          </dl>
          {!ready ? <p className="handoff-hint">核对左侧约束后，这里会开放复制与跳转。</p> : (
            <div className="handoff-actions">
              <button className="outline-button" type="button" onClick={() => { void copyList() }}><Clipboard size={15} /> 复制专业清单</button>
              <a className="ink-button" href="https://gaokao.dawnchasing.com" target="_blank" rel="noreferrer">打开现有志愿决策台 <ArrowUpRight size={16} /></a>
            </div>
          )}
          <small className="handoff-note">MVP 当前采用复制后手动衔接，尚未自动写入线上系统。历史数据与正式填报要求请以官方发布为准。</small>
        </section>
      </div>
    </AppShell>
  )
}
