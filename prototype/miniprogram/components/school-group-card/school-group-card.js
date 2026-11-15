import { getAiChat } from '../../utils/api';

Component({
  properties: {
    schoolItems: { type: Array, value: [] },
    index: { type: Number, value: 0 },
    profile: { type: Object, value: null },
  },

  observers: {
    'schoolItems'(items) {
      if (!items || !items.length) return;
      const first = items[0];
      const bi = first.basicInfo || {};
      const cl = first.campusLife || {};
      const lt = first.locationType || {};
      const matchedDisc = first.matchedDisciplines || [];

      const metaParts = [
        first.location, first.ownership,
        first.softRank && `软科${first.softRank}`,
        first.softRating, first.cityLevel,
        first.baoyanRate != null && `保研${(first.baoyanRate * 100).toFixed(0)}%`,
      ].filter(Boolean);

      const lifeParts = [
        bi.maleRatio != null && `男${bi.maleRatio}% 女${bi.femaleRatio}%`,
        lt.type,
        cl.canteens && `食堂: ${(cl.canteens || '').split('（')[0]}`,
      ].filter(Boolean);

      const hasCareer = !!(first.career && first.career.locationFlow);
      const hasSatisfaction = !!(first.satisfaction && first.satisfaction.overallSatisfaction);
      const hasLifeInfo = !!(hasSatisfaction || cl.canteens || cl.dorm || cl.campus_location ||
        cl.nearby || lt.detail || bi.address || lt.address || first.transferPolicy ||
        first.campusArea || first.canteenCount > 0 || first.dormRating !== 'D');

      // Discipline tags
      const directOrRelevant = matchedDisc.filter((d) => d.matchType === 'direct' || d.matchType === 'relevant');
      const discTags = directOrRelevant.length > 0
        ? directOrRelevant.slice(0, 3)
        : matchedDisc.slice(0, 2);

      // Weighted metrics
      const bandWeight = (item) => ({ rush: 0.35, stable: 0.40, safe: 0.25 })[item.band] || 0.33;
      const totalW = items.reduce((s, i) => s + bandWeight(i), 0) || 1;
      const weightedRank = Math.round(items.reduce((s, i) => s + (i.minRank || 0) * bandWeight(i), 0) / totalW);
      const weightedScore = Math.round(items.reduce((s, i) => s + (i.minScore || 0) * bandWeight(i), 0) / totalW);
      const weightedPlan = Math.round(items.reduce((s, i) => s + (i.totalPlan || 0) * bandWeight(i), 0) / totalW);
      const maxFee = Math.max(...items.map((i) => i.maxFee || 0));

      // Band composition
      const bandCounts = {};
      for (const item of items) {
        bandCounts[item.bandLabel] = (bandCounts[item.bandLabel] || 0) + 1;
      }
      const bandDesc = Object.entries(bandCounts).map(([k, v]) => `${v}个${k}`).join('、');
      const weightDesc = `本卡片数据按专业梯度加权（冲×0.35 / 稳×0.40 / 保×0.25），当前${items.length}个匹配（${bandDesc}），位次/分数/计划为加权均值。`;

      // Weighted history
      const planHistories = [];
      for (let i = 0; i < items.length; i++) {
        var histories = items[i].history || [];
        for (var j = 0; j < histories.length; j++) {
          planHistories.push({ ...histories[j], _band: items[i].band });
        }
      }
      const yearGroups = {};
      for (const h of planHistories) {
        if (!yearGroups[h.year]) yearGroups[h.year] = [];
        yearGroups[h.year].push(h);
      }
      const weightedHistory = Object.entries(yearGroups)
        .map(([year, rows]) => {
          const wSum = rows.reduce((s, r) => s + bandWeight({ band: r._band }), 0) || 1;
          return {
            year: Number(year),
            score: Math.round(rows.reduce((s, r) => s + (r.score || 0) * bandWeight({ band: r._band }), 0) / wSum),
            rank: Math.round(rows.reduce((s, r) => s + (r.rank || 0) * bandWeight({ band: r._band }), 0) / wSum),
            plan: Math.round(rows.reduce((s, r) => s + (r.plan || 0) * bandWeight({ band: r._band }), 0) / wSum),
          };
        })
        .sort((a, b) => b.year - a.year)
        .slice(0, 4);

      this.setData({
        first, metaParts, lifeParts, hasCareer, hasSatisfaction, hasLifeInfo, discTags,
        weightedRank, weightedScore, weightedPlan, maxFee, weightDesc,
        displayHistory: weightedHistory,
      });
    },
  },

  data: {
    first: null, metaParts: [], lifeParts: [], hasCareer: false,
    hasSatisfaction: false, hasLifeInfo: false, discTags: [],
    weightedRank: 0, weightedScore: 0, weightedPlan: 0, maxFee: 0,
    weightDesc: '', displayHistory: [],
    expanded: '', expandedMajor: -1,
    aiText: '', aiLoading: false,
  },

  methods: {
    toggleExpand(e) {
      const section = e.currentTarget.dataset.section;
      this.setData({ expanded: this.data.expanded === section ? '' : section });
    },

    toggleMajor(e) {
      const idx = Number(e.currentTarget.dataset.idx);
      this.setData({ expandedMajor: this.data.expandedMajor === idx ? -1 : idx });
    },

    onDetail() {
      this.triggerEvent('schoolclick', { item: this.data.first });
    },

    loadAI() {
      if (this.data.aiText) {
        this.setData({ expanded: this.data.expanded === 'ai' ? '' : 'ai' });
        return;
      }
      this.setData({ aiLoading: true, expanded: 'ai' });
      const first = this.data.first;
      const bi = first.basicInfo || {};
      const cl = first.campusLife || {};
      const profile = this.properties.profile || {};

      let ctx = `用专家的风格，针对${first.school}（${first.location}，软科${first.softRank || '?'}名）给200字点评。`;
      ctx += `\n数据：`;
      if (bi.maleRatio) ctx += `男女比男${bi.maleRatio}%女${bi.femaleRatio}%，`;
      if (cl.canteens) ctx += `食堂${cl.canteens}，`;
      if (cl.dorm) ctx += `宿舍${cl.dorm}，`;
      if (first.career && first.career.locationFlow) ctx += `就业${first.career.locationFlow.substring(0, 80)}，`;
      ctx += `\n要求：1）最突出优势；2）一个容易忽略的坑；3）给${profile.category || ''}考生具体建议。接地气。`;

      getAiChat(profile, null, ctx, [])
        .then((d) => {
          this.setData({ aiText: d.reply || '暂无AI分析', aiLoading: false });
        })
        .catch(() => {
          this.setData({ aiText: '加载失败', aiLoading: false });
        });
    },
  },
});
