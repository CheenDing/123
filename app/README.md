# 万径 WANJING · Personal Discovery MVP

一个可运行的前端 MVP：从《江雪》的视觉意象进入，以真实表达为证据，经过人生设计对话、三种五年路径、专业试走，最后衔接现有分数匹配系统。

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认由 Vite 启动；可以通过 `npm run dev -- --host 127.0.0.1 --port 7100` 指定地址。

```bash
npm run build       # 类型检查 + 生产构建，输出 dist/
npm run preview     # 本地预览生产构建
npm run lint        # ESLint
npm run test:e2e    # 构建 + Chrome 端到端验证（自动启动并关闭服务器）
```

端到端测试使用本机 Chrome，覆盖桌面与 390px 移动视口、三问对话、画像确认、路径实验、专业清单、表单错误态和志愿衔接。截图写入已被 Git 忽略的 `.verification/`。

## 已实现

- **江雪入径**：纯 SVG/CSS 远山、寒江、孤舟与 Canvas 落雪，支持减少动态效果。
- **记忆证据**：默认演示证据；支持本地读取 TXT / Markdown / JSON，进行明确标注的关键词预分析；每条判断可查看原文、确认或撤回。
- **三问识我**：一次一个问题，支持自由输入与快捷回答，形成可修改的个人理解。
- **三种五年路径**：自然延伸、另一条路、无限可能；含五年时间线、用户自我评分和现实实验记录。
- **专业试走**：搜索专业，同时查看关联、学习代价和小实验，维护探索清单。
- **连接现实**：校验演示分数与位次，复制专业清单，跳转 `gaokao.dawnchasing.com` 的现有决策台。
- **本地持续体验**：探索状态保存在当前浏览器的 `localStorage`，可一键重置。

## 技术结构

React 19 + TypeScript + Vite + React Router（HashRouter）。样式以自研 CSS token 与《江雪》视觉语言为主，图标使用 Lucide。

```text
src/
├── components/       # 品牌、应用壳、山水场景
├── data/demo.ts      # 演示证据、路径、专业、对话问题
├── pages/            # 入径、识我、见径、试路、落定
├── store/AppState.tsx# 全局探索状态与本地持久化
└── index.css         # OKLCH 色板、布局、动效与响应式规则
scripts/verify.mjs    # 生产构建的 Playwright 冷启动验收
```

## 诚实边界

这是**前端交互 MVP**，不是已完成的后端 Agent 产品：

- 对话为确定性的演示引导，尚未调用实时大模型。
- 文件导入仅做浏览器内关键词预分析，不代表完成语义理解。
- 专业内容为通识示例，不是具体高校培养方案或报考依据。
- 与线上决策台目前采用复制后手动衔接，尚未通过 API 自动传递画像或专业清单。
- `localStorage` 只保存在此浏览器，清除浏览器数据会丢失，不会跨设备同步。

开源交互参考与许可证见仓库根目录 `CREDITS.md` 和 `licenses/`。
