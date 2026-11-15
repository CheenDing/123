export type EvidenceStatus = 'pending' | 'confirmed' | 'rejected'

export type Evidence = {
  id: string
  topic: string
  claim: string
  excerpt: string
  source: string
  date: string
  status: EvidenceStatus
}

export type LifePath = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  scene: string
  question: string
  majors: string[]
  years: { year: string; title: string; detail: string }[]
  task: { title: string; duration: string; steps: string[] }
}

export type Major = {
  id: string
  name: string
  category: string
  essence: string
  courses: string[]
  like: string
  caution: string
  prototype: string
  pathId: string
}

export const initialEvidence: Evidence[] = [
  {
    id: 'memory-1',
    topic: '智能如何发生',
    claim: '你反复追问的不是“能做什么”，而是“它为什么能做到”。',
    excerpt: '如果一个神经网络没有被人明确写下规则，它最后是怎么学会认出一张脸的？',
    source: 'AI 对话 · 机器学习',
    date: '2026.09.18',
    status: 'confirmed',
  },
  {
    id: 'memory-2',
    topic: '从结构到系统',
    claim: '你更容易被“结构如何产生行为”吸引，而不只是被成品吸引。',
    excerpt: '我把机械臂拆开了。真正有意思的是，几个很简单的关节组合起来，动作突然就灵活了。',
    source: '学习记录 · 机器人',
    date: '2026.10.03',
    status: 'pending',
  },
  {
    id: 'memory-3',
    topic: '脑与机器',
    claim: '“脑”与“机器”在你的探索里出现了交叉，而不只是两个孤立话题。',
    excerpt: '脑机接口是不是也在做类似的事：把一种信号变成另一种系统能理解的语言？',
    source: 'AI 对话 · 神经科学',
    date: '2026.11.02',
    status: 'pending',
  },
]

export const lifePaths: LifePath[] = [
  {
    id: 'machine',
    eyebrow: '路径 · 自然延伸',
    title: '让机器学会感知',
    subtitle: '从计算机制出发，逼近“智能”这件事本身。',
    scene: '清晨的实验室，你正在调试一个视觉模型。屏幕上不只是准确率，还有它究竟在哪一步误读了世界。',
    question: '我喜欢的是智能应用的结果，还是模型逐层学会表示世界的过程？',
    majors: ['人工智能', '计算机科学与技术', '数据科学'],
    years: [
      { year: '第一年', title: '把地基打厚', detail: '数学、程序设计、数据结构；复现一个最小神经网络。' },
      { year: '第二年', title: '让模型看见', detail: '进入视觉或语言方向，完成第一个可解释的小项目。' },
      { year: '第三年', title: '走进真实问题', detail: '加入实验室或开源社区，让模型面对不干净的真实数据。' },
      { year: '第四年', title: '形成自己的问题', detail: '从一个别人给定的题目，走向一个你主动提出的问题。' },
      { year: '第五年', title: '继续深入或转向', detail: '读研深入智能机制，或进入需要学习能力的工程现场。' },
    ],
    task: {
      title: '亲手训练一个会认错东西的模型',
      duration: '7 天 · 每天约 40 分钟',
      steps: ['用现成教程训练一个图像分类器', '故意给它三张容易误判的图片', '记录它错在哪里，以及你是否仍想继续弄懂'],
    },
  },
  {
    id: 'robot',
    eyebrow: '路径 · 另一条路',
    title: '让智能拥有身体',
    subtitle: '把算法放回真实世界，让感知、决策与动作连成系统。',
    scene: '工作台上散落着齿轮和线束。你花了一下午，只为让机械臂在碰到杯子的那一刻，力量刚刚好。',
    question: '当理论必须面对摩擦、误差和失败时，我会烦躁，还是反而更投入？',
    majors: ['自动化', '机器人工程', '电子信息工程'],
    years: [
      { year: '第一年', title: '理解物与电', detail: '数学、物理、电路与编程并行，做一个能被控制的小装置。' },
      { year: '第二年', title: '让系统闭环', detail: '学习控制与传感，让机器不只动作，还能根据反馈修正。' },
      { year: '第三年', title: '从零件到协作', detail: '在团队里负责一个子系统，理解接口与系统可靠性。' },
      { year: '第四年', title: '接受真实约束', detail: '让作品在成本、能耗与安全限制下仍然工作。' },
      { year: '第五年', title: '走向复杂系统', detail: '进入机器人、智能制造，或继续研究控制与智能的交叉。' },
    ],
    task: {
      title: '让一个小装置根据反馈修正动作',
      duration: '一个周末 · 约 3 小时',
      steps: ['选择循迹小车、机械臂或仿真机器人', '制造一次偏差，观察系统如何纠正', '写下你最喜欢的是搭建、调参还是理解控制原理'],
    },
  },
  {
    id: 'brain',
    eyebrow: '路径 · 无限可能',
    title: '读懂意识的信号',
    subtitle: '在生物、计算与工程的交界处，追问心智从何而来。',
    scene: '夜色里，一段脑电信号在屏幕上起伏。你关心的不只是波形能否被解码，还有它背后那个正在思考的人。',
    question: '我是否愿意接受交叉学科更长的基础建设，以及许多暂时没有答案的问题？',
    majors: ['生物医学工程', '智能医学工程', '认知科学相关方向'],
    years: [
      { year: '第一年', title: '学习两种语言', detail: '同时补生物与数学、编程，不急着把自己限定成一种人。' },
      { year: '第二年', title: '理解生命信号', detail: '接触生理、信号处理与实验方法，学习尊重数据的复杂性。' },
      { year: '第三年', title: '做一次交叉实验', detail: '从脑电、医学影像或辅助设备中选择一个具体问题。' },
      { year: '第四年', title: '面对伦理与人', detail: '理解技术之外，还有受试者、临床需求与真实生活。' },
      { year: '第五年', title: '选择交叉坐标', detail: '继续深造，或在医疗设备、神经工程等领域继续试路。' },
    ],
    task: {
      title: '读懂一篇脑机接口科普背后的实验',
      duration: '3 次 · 每次 30 分钟',
      steps: ['找一篇有原始论文出处的脑机接口报道', '画出信号从采集到解码的流程', '记录你最想继续追问的是生物机制、算法还是设备'],
    },
  },
]

export const majors: Major[] = [
  {
    id: 'ai',
    name: '人工智能',
    category: '工学 · 电子信息类',
    essence: '研究如何让机器从数据与经验中获得感知、推理、决策等能力。',
    courses: ['数学基础', '程序设计', '数据结构', '机器学习', '智能系统实践'],
    like: '如果你会为了“模型为什么这样判断”继续追问，而不只满足于调用现成工具，这里值得试走。',
    caution: '热门应用不等于日常学习。数学、编程与反复实验会占据相当大的比重。',
    prototype: '复现一个小模型，再解释它的一次错误。',
    pathId: 'machine',
  },
  {
    id: 'cs',
    name: '计算机科学与技术',
    category: '工学 · 计算机类',
    essence: '从计算理论、系统结构到软件方法，理解计算如何发生并解决实际问题。',
    courses: ['离散数学', '计算机组成', '操作系统', '算法设计', '软件工程'],
    like: '如果你喜欢从底层结构一路追问到系统行为，它比单一应用方向提供更宽的基础。',
    caution: '“喜欢玩电脑”与“喜欢计算机科学”不同，抽象理论和系统细节需要耐心。',
    prototype: '不写框架，亲手实现一个极简搜索或排序可视化。',
    pathId: 'machine',
  },
  {
    id: 'automation',
    name: '自动化',
    category: '工学 · 自动化类',
    essence: '研究感知、控制、决策与执行如何构成能在真实世界工作的系统。',
    courses: ['电路与电子', '自动控制原理', '信号与系统', '传感与检测', '控制系统实践'],
    like: '如果你在“调了很久终于按预期动作”的时刻特别有成就感，这可能是一个重要线索。',
    caution: '它不是单纯的机器人拼装；数学、物理、电路和抽象控制模型同样重要。',
    prototype: '在仿真环境里调一个闭环控制，记录误差如何变化。',
    pathId: 'robot',
  },
  {
    id: 'bme',
    name: '生物医学工程',
    category: '工学 · 交叉工程方向',
    essence: '把工程方法用于理解生命信号、医学信息与医疗健康中的实际问题。',
    courses: ['生理学基础', '信号与系统', '医学图像', '生物传感器', '医疗仪器设计'],
    like: '如果你同时对生命机制和工程实现有兴趣，交叉带来的不是“学得杂”，而是多一种问题语言。',
    caution: '不同高校培养侧重差异很大，需要具体核对课程，而不能只看专业名称。',
    prototype: '选一段公开生理信号，试着画出它的处理流程。',
    pathId: 'brain',
  },
]

export const conversationPrompts = [
  {
    question: '先不谈专业。最近一次，你明明可以去休息，却仍然愿意继续做下去的事是什么？',
    hint: '一件具体的小事，比“我喜欢科技”更有用。',
    choices: ['拆开一个东西，非弄懂不可', '把一个想法做成能运行的作品', '读懂一个一直困扰我的问题'],
  },
  {
    question: '那时候，最让你舍不得停下来的，是哪一个瞬间？',
    hint: '是想通的一瞬间、作品跑起来的一瞬间，还是别人使用它的一瞬间？',
    choices: ['发现背后的原理时', '终于把问题跑通时', '看到别人真的用上时'],
  },
  {
    question: '如果暂时不考虑分数，也没有人评价你，你还愿意花五年弄清楚哪个问题？',
    hint: '不需要是一个专业名。一个会反复回来的问题就好。',
    choices: ['智能究竟如何产生', '机器如何与真实世界协作', '人脑如何形成意识与思考'],
  },
]
