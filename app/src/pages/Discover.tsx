import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, FileJson, MessageCircle, Quote, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router'
import AppShell from '../components/AppShell'
import { conversationPrompts, initialEvidence, type Evidence } from '../data/demo'
import { useAppState } from '../store/AppState'

const topicWords: Record<string, string[]> = {
  '人工智能': ['人工智能', '机器学习', '神经网络', '模型', '算法'],
  '机器人': ['机器人', '机械臂', '自动化', '控制', '传感器'],
  '脑科学': ['脑科学', '神经', '脑机', '意识', '认知'],
  '设计与创造': ['设计', '产品', '创作', '原型', '作品'],
  '数学与原理': ['数学', '推导', '原理', '证明', '公式'],
}

export default function Discover() {
  const {
    evidence, setEvidence, messages, setMessages, insightConfirmed, setInsightConfirmed,
    memoryName, setMemoryName, notify,
  } = useAppState()
  const [answer, setAnswer] = useState('')
  const [displayStep, setDisplayStep] = useState(Math.min(messages.length, 3))
  const [thinking, setThinking] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [editingInsight, setEditingInsight] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const completed = messages.length >= 3

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const submitAnswer = (text: string) => {
    const clean = text.trim()
    if (!clean || thinking || completed) return
    setMessages((current) => [...current, { role: 'user', text: clean }])
    setAnswer('')
    setThinking(true)
    timer.current = window.setTimeout(() => {
      setDisplayStep((step) => step + 1)
      setThinking(false)
    }, 520)
  }

  const importFile = async (file?: File) => {
    if (!file) return
    setUploadError('')
    if (!/\.(txt|md|json)$/i.test(file.name)) {
      setUploadError('这一版支持 TXT、Markdown 和 JSON 文件。')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('演示版请上传 5 MB 以内的文件。')
      return
    }
    try {
      const text = await file.text()
      const ranked = Object.entries(topicWords).map(([topic, words]) => ({
        topic,
        count: words.reduce((sum, word) => sum + (text.toLowerCase().split(word.toLowerCase()).length - 1), 0),
      })).sort((a, b) => b.count - a.count)
      const best = ranked[0].count > 0 ? ranked[0] : { topic: '反复出现的问题', count: 0 }
      const excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 150) || '（文件中没有可读取的文字）'
      const item: Evidence = {
        id: `upload-${Date.now()}`,
        topic: best.topic,
        claim: best.count > 0
          ? `本地关键词预分析发现，「${best.topic}」相关内容出现了 ${best.count} 次，值得进一步核对。`
          : '已读入这份材料。还没有足够明确的主题词，需要通过对话继续理解。',
        excerpt,
        source: `${file.name} · 本地预分析`,
        date: '刚刚',
        status: 'pending',
      }
      setEvidence((current) => [item, ...current.filter((entry) => !entry.id.startsWith('upload-'))])
      setMemoryName(`${file.name} · 本地读取`)
      notify('文件已在浏览器内读取，请核对提取线索')
    } catch {
      setUploadError('这次没有读到文件内容，请换一个文件再试。')
    }
  }

  const setStatus = (id: string, status: Evidence['status']) => {
    setEvidence((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    notify(status === 'confirmed' ? '已记下。你可以随时改。' : status === 'rejected' ? '这条判断已撤回，不再作为推荐依据。' : '已放回待验证')
  }

  return (
    <AppShell>
      <section className="page-heading discover-heading">
        <div>
          <span className="section-mark">第一幕 · 识我</span>
          <h1>先别选专业。<br />先看看，你一直在追问什么。</h1>
        </div>
        <p>不测评，不贴标签。<br />只从你的真实表达里，捡起几条值得验证的线索。</p>
      </section>

      <div className="discovery-grid">
        <section className="conversation-panel" aria-labelledby="conversation-title">
          <div className="panel-meta">
            <span><MessageCircle size={15} strokeWidth={1.4} /> 人生设计对谈</span>
            <span>{Math.min(messages.length + 1, 3)} / 3 · 演示引导</span>
          </div>
          <div className="conversation-flow" aria-live="polite">
            {messages.map((message, index) => (
              <div className="past-exchange" key={`${index}-${message.text}`}>
                <p className="past-question">{conversationPrompts[index]?.question}</p>
                <p className="user-answer">{message.text}</p>
              </div>
            ))}

            {!completed ? (
              <div className={`current-question ${thinking ? 'is-thinking' : ''}`}>
                <span className="question-number">{String(displayStep + 1).padStart(2, '0')}</span>
                <h2 id="conversation-title">{thinking ? '这句话，我先放在这里……' : conversationPrompts[displayStep]?.question}</h2>
                {!thinking && <p>{conversationPrompts[displayStep]?.hint}</p>}
              </div>
            ) : (
              <div className="insight-block">
                <span className="insight-label"><Sparkles size={15} strokeWidth={1.4} /> 一个待你确认的理解</span>
                <h2 id="conversation-title">也许，你真正感兴趣的<br />不是某个职业，<br />而是<strong>智能如何发生。</strong></h2>
                <p>三条回答都指向同一件事：你喜欢从表象走到结构，再看着结构产生新的行为。这不是结论，只是一条可以拿去验证的假设。</p>
                {!insightConfirmed && !editingInsight && (
                  <div className="insight-actions">
                    <button className="ink-button" type="button" onClick={() => { setInsightConfirmed(true); notify('这条理解已放入你的画像') }}><Check size={16} /> 这像我，记下</button>
                    <button className="quiet-button" type="button" onClick={() => setEditingInsight(true)}>还不太像</button>
                  </div>
                )}
                {editingInsight && (
                  <div className="insight-edit">
                    <label htmlFor="insight-correction">换成更接近你的说法</label>
                    <textarea id="insight-correction" defaultValue="我喜欢把复杂的问题拆开，直到看见它如何运转。" rows={3} />
                    <div><button className="ink-button" type="button" onClick={() => { setInsightConfirmed(true); setEditingInsight(false); notify('已按你的表述记下') }}>按我的说法记下</button><button className="quiet-button" type="button" onClick={() => setEditingInsight(false)}>返回</button></div>
                  </div>
                )}
                {insightConfirmed && <p className="confirmed-note"><Check size={15} /> 已放入画像 · 可随时回来修改</p>}
              </div>
            )}
          </div>

          {!completed && (
            <div className="answer-area">
              <div className="quick-answers">
                {conversationPrompts[displayStep]?.choices.map((choice) => (
                  <button type="button" key={choice} disabled={thinking} onClick={() => submitAnswer(choice)}>{choice}</button>
                ))}
              </div>
              <form onSubmit={(event) => { event.preventDefault(); submitAnswer(answer) }}>
                <label className="sr-only" htmlFor="discovery-answer">写下你的回答</label>
                <textarea id="discovery-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submitAnswer(answer)
                  }
                }} placeholder="也可以，用自己的话说……" rows={3} disabled={thinking} />
                <button className="round-submit" type="submit" disabled={!answer.trim() || thinking} aria-label="发送回答"><ArrowRight size={19} strokeWidth={1.4} /></button>
              </form>
              <small>Enter 发送 · Shift + Enter 换行 · 没有标准答案</small>
            </div>
          )}

          {completed && insightConfirmed && (
            <div className="next-step-bar"><span>画像不是终点。让它展开成几条路。</span><Link className="primary-link" to="/paths">看见三种五年 <ArrowRight size={16} /></Link></div>
          )}
        </section>

        <aside className="evidence-panel" aria-labelledby="evidence-title">
          <div className="evidence-header">
            <div><span className="section-mark">你的舟</span><h2 id="evidence-title">证据，比结论更重要。</h2></div>
            <span className="evidence-count">{evidence.filter((item) => item.status !== 'rejected').length} 条线索</span>
          </div>
          <div className="memory-import">
            <FileJson size={20} strokeWidth={1.3} aria-hidden="true" />
            <div><strong>{memoryName}</strong><span>TXT / MD / JSON · 仅在浏览器内读取</span></div>
            <label className="upload-button">导入<input type="file" accept=".txt,.md,.json" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = '' }} /></label>
          </div>
          {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
          {memoryName !== '示例记忆 · 28 段对话' && <button className="restore-sample" type="button" onClick={() => { setEvidence(initialEvidence); setMemoryName('示例记忆 · 28 段对话'); notify('已恢复示例记忆') }}>恢复示例记忆</button>}

          <div className="evidence-list">
            {evidence.map((item) => (
              <article className={`evidence-item evidence-item--${item.status}`} key={item.id}>
                <div className="evidence-topic"><span>{item.topic}</span><small>{item.status === 'confirmed' ? '已确认' : item.status === 'rejected' ? '已撤回' : '待验证'}</small></div>
                <h3>{item.claim}</h3>
                <details>
                  <summary><Quote size={13} strokeWidth={1.4} /> 查看原始证据</summary>
                  <blockquote>{item.excerpt}</blockquote>
                  <p>{item.source} · {item.date}</p>
                </details>
                <div className="evidence-actions">
                  <button type="button" className={item.status === 'confirmed' ? 'is-active' : ''} onClick={() => setStatus(item.id, item.status === 'confirmed' ? 'pending' : 'confirmed')} aria-label={item.status === 'confirmed' ? '取消确认' : '确认这条证据'}><Check size={14} /> {item.status === 'confirmed' ? '已确认' : '像我'}</button>
                  <button type="button" className={item.status === 'rejected' ? 'is-active' : ''} onClick={() => setStatus(item.id, item.status === 'rejected' ? 'pending' : 'rejected')} aria-label={item.status === 'rejected' ? '恢复这条证据' : '否定这条证据'}><X size={14} /> {item.status === 'rejected' ? '已撤回' : '不像我'}</button>
                </div>
              </article>
            ))}
          </div>
          <p className="evidence-footnote">判断可以错，证据不会替你说话。每一次纠正，都会改变后面的路。</p>
        </aside>
      </div>
    </AppShell>
  )
}
