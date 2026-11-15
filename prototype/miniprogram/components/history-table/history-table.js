Component({
  properties: {
    item: { type: Object, value: null },
    volunteerUnit: { type: String, value: 'major_group' },
  },

  observers: {
    'item, volunteerUnit'(item, volunteerUnit) {
      if (!item) return;
      const isGroupMode = volunteerUnit === 'major_group';
      const groupRows = (item.history || []).slice(0, 4);
      const mainGroup = item.groupLabel || item.group || '';
      const schoolRows = (item.schoolHistory || [])
        .filter((row) => !groupRows.some((gr) => gr.year === row.year))
        .map((row) => ({ ...row, _isSchool: true }));
      const rows = [...groupRows, ...schoolRows].slice(0, 4);
      const refRank = item.avgRank || item.minRank;

      const hasGroupRank = isGroupMode && rows.some(
        (r) => r.groupRank != null && r.groupRank !== r.rank
      );

      const descText = isGroupMode
        ? `匹配参考位次 ${this._fmt(refRank)}（组内各专业位次均值）。"组线"为该组录取门槛（最弱专业位次），"同校"行来自该校其他专业组。`
        : `匹配参考位次 ${this._fmt(refRank)}（该专业近年录取位次）。`;

      this.setData({
        isGroupMode,
        rows,
        hasGroupRank,
        descText,
        mainGroup,
      });
    },
  },

  data: {
    isGroupMode: true,
    rows: [],
    hasGroupRank: false,
    descText: '',
    mainGroup: '',
  },

  methods: {
    _fmt(n) {
      if (n == null || isNaN(n)) return '-';
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
  },
});
