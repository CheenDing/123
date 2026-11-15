Component({
  properties: {
    label: { type: String, value: '' },
    value: { type: Number, value: 0 },
    invert: { type: Boolean, value: false },
    center: { type: Boolean, value: false },
  },
  observers: {
    'value, invert'(value, invert) {
      const display = Math.round(value || 0);
      let color, level;
      if (invert) {
        color = display >= 82 ? '#b08d57' : display >= 55 ? '#9a9161' : '#9c3d34';
        level = display >= 82 ? '低风险' : display >= 55 ? '中风险' : '高风险';
      } else {
        color = display >= 85 ? '#b08d57' : display >= 70 ? '#9a9161' : display >= 50 ? '#a2542a' : '#9c3d34';
        level = display >= 85 ? '优秀' : display >= 70 ? '良好' : display >= 50 ? '一般' : '偏弱';
      }
      this.setData({ display, color, level });
    },
  },
  data: {
    display: 0,
    color: '#a89f90',
    level: '-',
  },
});
