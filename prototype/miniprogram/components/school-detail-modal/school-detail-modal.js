Component({
  properties: {
    item: { type: Object, value: null },
    visible: { type: Boolean, value: false },
  },

  observers: {
    'item'(item) {
      if (!item) return;
      const bi = item.basicInfo || {};
      const sat = item.satisfaction || {};
      const ownership = item.ownership || '';

      this.setData({
        schoolName: item.school || '',
        location: item.location || '',
        ownership,
        schoolType: item.schoolType || '',
        softRank: item.softRank || '?',
        maleRatio: bi.maleRatio != null ? `男${bi.maleRatio}% 女${bi.femaleRatio}%` : '暂无',
        baoyanRate: bi.baoyanRate || item.baoyanRate || '暂无',
        masterPrograms: bi.masterPrograms || '?',
        doctoralPrograms: bi.doctoralPrograms || item.phdCount || '?',
        foundingYear: bi.foundingYear || '?',
        cityLevel: item.cityLevel || item.location || '',
        satOverall: sat.overallSatisfaction || '?',
        layerLabel: item.is985 ? '985' : item.is211 ? '211' : item.isDoubleFirstClass ? '双一流' : ownership || '?',
        totalPlan: item.totalPlan || '?',
        description: bi.description || '',
        contentDB: item.contentDB || '',
        nationalMajors: bi.nationalMajors || '',
        disciplineEval: item.disciplineEval || '',
        transferPolicy: item.transferPolicy || '',
      });
    },
  },

  data: {
    schoolName: '', location: '', ownership: '', schoolType: '', softRank: '?',
    maleRatio: '', baoyanRate: '', masterPrograms: '', doctoralPrograms: '',
    foundingYear: '', cityLevel: '', satOverall: '', layerLabel: '',
    totalPlan: '', description: '', contentDB: '', nationalMajors: '',
    disciplineEval: '', transferPolicy: '',
  },

  methods: {
    onClose() {
      this.triggerEvent('close');
    },
    stopPropagation() {
      // prevent close when tapping inside modal
    },
  },
});
