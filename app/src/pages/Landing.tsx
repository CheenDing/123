import { ArrowDown, ArrowRight, Snowflake } from 'lucide-react'
import { Link } from 'react-router'
import Brand from '../components/Brand'
import InkScene from '../components/InkScene'
import { useAppState } from '../store/AppState'

export default function Landing() {
  const { motionEnabled, setMotionEnabled } = useAppState()
  return (
    <div className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <InkScene />
        <header className="hero-header">
          <Brand />
          <button className="snow-toggle" type="button" onClick={() => setMotionEnabled(!motionEnabled)}>
            <Snowflake size={15} strokeWidth={1.4} aria-hidden="true" />
            {motionEnabled ? '落雪 · 开' : '落雪 · 关'}
          </button>
        </header>

        <div className="hero-copy">
          <p className="hero-kicker">高考志愿，不该从一张分数表开始</p>
          <h1 id="hero-title">在分数之前，<br />先听见自己。</h1>
          <p className="hero-intro">从你反复追问的问题、舍不得停下的时刻出发，<br className="desktop-only" />看见三条值得亲自走过的人生路径。</p>
          <Link className="primary-cta" to="/discover">
            <span>入径</span><ArrowRight size={18} strokeWidth={1.4} aria-hidden="true" />
          </Link>
        </div>

        <section className="vertical-poem" aria-label="柳宗元《江雪》">
          <p>千山鸟飞绝</p>
          <p>万径人踪灭</p>
          <p>孤舟蓑笠翁</p>
          <p>独钓寒江雪</p>
          <small>柳宗元 · 江雪</small>
        </section>

        <a className="scroll-cue" href="#why"><span>路，从这里开始</span><ArrowDown size={15} strokeWidth={1.3} /></a>
        <p className="hero-note">AI 自我探索 × 人生设计 × 专业发现</p>
      </section>

      <section className="why-section" id="why" aria-labelledby="why-title">
        <div className="why-heading">
          <span className="section-mark">万径之义</span>
          <h2 id="why-title">万径人踪灭，<br />不是没有路。<br />是没有谁的路，可以照抄。</h2>
        </div>
        <div className="why-content">
          <p className="why-lead">我们不想更快地给你一个“标准答案”。我们想让你先看见，自己为什么会被某些问题吸引。</p>
          <div className="principle-list">
            <article>
              <span>识我</span>
              <h3>从真实痕迹，而非人格标签</h3>
              <p>把长期对话、具体经历和一次次回答，变成可以查看、可以否定的证据。</p>
            </article>
            <article>
              <span>见径</span>
              <h3>三种未来，都是 A 计划</h3>
              <p>延续当下、换一条路、暂时抛开期待。先让可能性展开，再慢慢收敛。</p>
            </article>
            <article>
              <span>试路</span>
              <h3>不靠想象，做一次小实验</h3>
              <p>把专业变成课程、难点和七天任务。喜欢它的结果，也喜欢它的过程吗？</p>
            </article>
          </div>
          <Link className="text-link" to="/discover">从一段记忆开始 <ArrowRight size={16} strokeWidth={1.4} /></Link>
        </div>
      </section>
      <footer className="landing-footer"><Brand /><span>先认识自己，再探索专业，最后选择大学。</span></footer>
    </div>
  )
}
