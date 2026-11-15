Component({
  properties: {
    band: { type: String, value: '' },
  },
  observers: {
    band(val) {
      const map = {
        rush: { label: '冲', cls: 'band-rush' },
        stable: { label: '稳', cls: 'band-stable' },
        safe: { label: '保', cls: 'band-safe' },
      };
      const info = map[val] || { label: '-', cls: '' };
      this.setData({ label: info.label, cls: info.cls });
    },
  },
  data: { label: '-', cls: '' },
});
