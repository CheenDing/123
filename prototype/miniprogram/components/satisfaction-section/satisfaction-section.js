Component({
  properties: {
    satisfaction: { type: Object, value: null },
  },

  observers: {
    satisfaction(s) {
      if (!s || !s.overallSatisfaction) {
        this.setData({ hasData: false });
        return;
      }
      this.setData({
        hasData: true,
        overall: s.overallSatisfaction,
        overallPct: Math.round((s.overallSatisfaction / 5) * 100),
        env: s.environmentSatisfaction || 0,
        envPct: Math.round(((s.environmentSatisfaction || 0) / 5) * 100),
        life: s.lifeSatisfaction || 0,
        lifePct: Math.round(((s.lifeSatisfaction || 0) / 5) * 100),
        votes: s.overallVotes || 0,
      });
    },
  },

  data: {
    hasData: false,
    overall: 0,
    overallPct: 0,
    env: 0,
    envPct: 0,
    life: 0,
    lifePct: 0,
    votes: 0,
  },
});
