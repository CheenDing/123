Component({
  properties: {
    career: { type: Object, value: null },
  },

  observers: {
    career(c) {
      if (!c || !c.locationFlow) {
        this.setData({ hasFlow: false, flowList: [], employers: [] });
        return;
      }
      const flow = c.locationFlow || '';
      const flowList = flow.split('、').slice(0, 5).map((f) => {
        const [place, pct] = f.split('：');
        return { place, pct };
      });
      const employersStr = c.topEmployers || '';
      const employers = employersStr.split('、').slice(0, 5)
        .map((e) => e.split('：')[0])
        .filter(Boolean);
      this.setData({ hasFlow: true, flowList, employers });
    },
  },

  data: {
    hasFlow: false,
    flowList: [],
    employers: [],
  },
});
