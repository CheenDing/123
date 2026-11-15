Component({
  properties: {
    phase: { type: Number, value: 0 },
  },
  data: {
    steps: [
      { icon: '\u{1F504}', label: '过滤候选院校数据' },
      { icon: '\u{1F4CA}', label: '多维度评分排序' },
      { icon: '\u{1F4D0}', label: '冲稳保梯度分层' },
      { icon: '✅', label: '生成推荐方案' },
    ],
  },
});
