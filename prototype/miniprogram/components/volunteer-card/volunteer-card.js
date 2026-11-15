import { getAiChat } from '../../utils/api';

Component({
  properties: {
    item: { type: Object, value: null },
    index: { type: Number, value: 0 },
    volunteerUnit: { type: String, value: 'major_group' },
    hasAdjustment: { type: Boolean, value: true },
    profile: { type: Object, value: null },
  },

  observers: {
    'item'(item) {
      if (!item) return;
      const bi = item.basicInfo || {};
      const cl = item.campusLife || {};
      const lt = item.locationType || {};
      const matchedDisc = item.matchedDisciplines || [];

      const metaParts = [
        item.location,
        item.ownership,
        item.softRank && `软科${item.softRank}`,
        item.softRating,
        item.cityLevel,
        item.baoyanRate != null && `保研${(item.baoyanRate * 100).toFixed(0)}%`,
      ].filter(Boolean);

      const lifeParts = [
        bi.maleRatio != null && `男${bi.maleRatio}% 女${bi.femaleRatio}%`,
        lt.type,
        cl.canteens && `食堂: ${(cl.canteens || '').split('（')[0]}`,
      ].filter(Boolean);

      const mainMajors = (item.majors && item.majors.length ? item.majors : item.plans || []).slice(0, 6);

      const hasCareer = !!(item.career && item.career.locationFlow);
      const hasSatisfaction = !!(item.satisfaction && item.satisfaction.overallSatisfaction);
      const hasLifeInfo = !!(hasSatisfaction || cl.canteens || cl.dorm || cl.campus_location ||
        cl.nearby || lt.detail || bi.address || lt.address || item.transferPolicy);

      // discipline tags
      const directOrRelevant = matchedDisc.filter((d) => d.matchType === 'direct' || d.matchType === 'relevant');
      const discTags = directOrRelevant.length > 0
        ? directOrRelevant.slice(0, 3)
        : matchedDisc.slice(0, 2);

      this.setData({
        metaParts,
        lifeParts,
        mainMajors,
        hasCareer,
        hasSatisfaction,
        hasLifeInfo,
        discTags,
        itemId: item.id,
      });
    },
  },

  data: {
    metaParts: [],
    lifeParts: [],
    mainMajors: [],
    hasCareer: false,
    hasSatisfaction: false,
    hasLifeInfo: false,
    discTags: [],
    itemId: '',
    expanded: '',
    aiText: '',
    aiLoading: false,
  },

  methods: {
    toggleExpand(e) {
      const section = e.currentTarget.dataset.section;
      this.setData({ expanded: this.data.expanded === section ? '' : section });
    },

    onDetail() {
      this.triggerEvent('schoolclick', { item: this.data.item });
    },

    loadAI() {
      if (this.data.aiText) {
        this.setData({ expanded: this.data.expanded === 'ai' ? '' : 'ai' });
        return;
      }
      this.setData({ aiLoading: true, expanded: 'ai' });
      const item = this.properties.item;
      const bi = item.basicInfo || {};
      const cl = item.campusLife || {};
      const profile = this.properties.profile || {};

      let ctx = `用专家的风格，针对${item.school}（${item.location}，软科${item.softRank || '?'}名）给200字点评。`;
      ctx += `\n数据：`;
      if (bi.maleRatio) ctx += `男女比男${bi.maleRatio}%女${bi.femaleRatio}%，`;
      if (cl.canteens) ctx += `食堂${cl.canteens}，`;
      if (cl.dorm) ctx += `宿舍${cl.dorm}，`;
      if (cl.nearby) ctx += `附近${cl.nearby}，`;
      if (item.career && item.career.locationFlow) ctx += `就业${item.career.locationFlow.substring(0, 80)}，`;
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
