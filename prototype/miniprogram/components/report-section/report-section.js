import { isCityInPreferences, formatNumber } from '../../utils/format';

Component({
  properties: {
    profile: { type: Object, value: null },
    plan: { type: Object, value: null },
    aiText: { type: Object, value: null },
    volunteerUnit: { type: String, value: 'major_group' },
  },

  observers: {
    'plan'(plan) {
      if (!plan || !plan.selected || !plan.selected.length) {
        this.setData({ hasPlan: false });
        return;
      }
      try {
      const selected = plan.selected;
      const bands = {
        rush: selected.filter((i) => i.band === 'rush').length,
        stable: selected.filter((i) => i.band === 'stable').length,
        safe: selected.filter((i) => i.band === 'safe').length,
      };
      const bandTotal = bands.rush + bands.stable + bands.safe || 1;
      const duplicatedSchools = [...new Set(
        selected.map((i) => i.school).filter((s, _, list) => list.filter((x) => x === s).length > 1)
      )];

      // Score averages
      const dims = [
        ['录取安全', 'safety'], ['专业匹配', 'major'], ['城市匹配', 'city'],
        ['调剂风险', 'adjustment'], ['位次稳定', 'trend'], ['计划规模', 'plan'],
      ];
      const scoreAvgs = dims.map(([label, key]) => ({
        label,
        avg: selected.length > 0 ? Math.round(selected.reduce((s, i) => s + i.scores[key], 0) / selected.length) : 0,
      }));

      // Aggregates for subreports
      const n985 = selected.filter((i) => i.is985).length;
      const n211 = selected.filter((i) => i.is211 && !i.is985).length;
      const nDoubleFirst = selected.filter((i) => i.isDoubleFirstClass && !i.is985 && !i.is211).length;
      const nBaoyan = selected.filter((i) => i.hasBaoyan).length;
      const nDoctoral = selected.filter((i) => i.hasDoctoral).length;
      const weakMajorCount = selected.filter((i) => i.scores.major < 48).length;
      const citiesAll = [...new Set(selected.map((i) => i.location))];
      const majorsFlat = [];
      for (let i = 0; i < selected.length; i++) {
        const majors = selected[i].majors || [];
        for (let j = 0; j < majors.length; j++) {
          const name = (majors[j].name || majors[j]);
          if (name) majorsFlat.push(name);
        }
      }
      const majorsSample = [...new Set(majorsFlat.slice(0, 20))].slice(0, 12);
      const discFlat = [];
      for (let i = 0; i < selected.length; i++) {
        const discs = selected[i].matchedDisciplines || [];
        for (let j = 0; j < discs.length; j++) {
          const d = discs[j].discipline;
          if (d) discFlat.push(d);
        }
      }
      const disciplinesAll = [...new Set(discFlat)].slice(0, 8);
      const nCoop = selected.filter((i) => i.isCoop).length;
      const nHighfee = selected.filter((i) => i.isHighFee).length;
      const feeValues = selected.map((i) => i.maxFee || 0).filter((f) => f > 0);
      const feeMin = feeValues.length ? Math.min(...feeValues) : 0;
      const feeMax = feeValues.length ? Math.max(...feeValues) : 0;
      const overBudgetCount = selected.filter((i) => (i.maxFee || 0) > this.data.profileMaxFee).length;
      const totalPlanSlots = selected.reduce((s, i) => s + ((i.plans && i.plans.length) || 1), 0);
      const gradPlan = Array.isArray(this.properties.profile?.graduatePlan)
        ? this.properties.profile.graduatePlan
        : (this.properties.profile?.graduatePlan ? [this.properties.profile.graduatePlan] : []);
      const careerPlan = this.properties.profile?.careerPlan || '';
      const prefCities = this.properties.profile?.cities || [];
      const prefMajors = this.properties.profile?.majors || [];
      const citiesMatched = citiesAll.filter((c) => prefCities.includes(c));
      const citiesUnmatched = citiesAll.filter((c) => !prefCities.includes(c));

      const duplicatedSchoolsStr = duplicatedSchools.length ? duplicatedSchools.join('、') : '暂无';
      const citiesMatchedStr = citiesMatched.length > 0 ? citiesMatched.join('、') : '';
      const citiesUnmatchedStr = citiesUnmatched.length > 0 ? citiesUnmatched.join('、') : '';
      const adviceRush = Math.max(1, Math.min(2, bands.rush));
      const adviceStable = Math.max(2, bands.stable);
      const adviceSafe = Math.max(1, bands.safe);

      // Enrich each selected item with data-driven reason and risk texts
      const profile = this.properties.profile || {};
      const hasMajorPref = Boolean((profile.majors || []).filter(function(m) { return !String(m).includes('不限'); }).length);
      const enrichedSelected = selected.map(function(item) {
        // ---- reason text ----
        var rp = [];
        if (item.is985) rp.push('985工程高校，全国顶尖层次');
        else if (item.is211) rp.push('211工程高校，行业认可度高');
        else if (item.isDoubleFirstClass) rp.push('双一流建设高校');
        else rp.push(item.ownership === '公办' ? '公办本科院校' : (item.ownership || '院校'));

        var prefCities = profile.cities || [];
        if (!prefCities.length) rp.push(item.location + '可接受');
        else if (isCityInPreferences(item.location, prefCities)) rp.push(item.location + '命中城市偏好');
        else rp.push(item.location + '未直接命中偏好城市');

        var discs = (item.matchedDisciplines || []).filter(function(d) { return d.matchType === 'direct' || d.matchType === 'relevant'; });
        if (discs.length) rp.push('匹配学科：' + discs.map(function(d) { return d.discipline; }).join('、'));

        var majorNames = (item.majors && item.majors.length ? item.majors : item.plans || [])
          .map(function(m) { return m.name; }).filter(Boolean).slice(0, 4);
        if (majorNames.length) rp.push('开设：' + majorNames.join('、'));
        else rp.push('专业信息待复核');

        rp.push('参考位次' + formatNumber(item.avgRank || item.minRank) + '，归入"' + item.bandLabel + '"梯度');

        // ---- risk text ----
        var risks = [];
        if (item.band === 'rush') risks.push('位次边际偏紧，适合作为冲刺项');
        var rankSwing = item.rankSwing || 0;
        if (rankSwing > 0) risks.push('近年位次波动' + formatNumber(rankSwing));
        var totalPlan = item.totalPlan || 0;
        if (totalPlan > 0 && totalPlan < 20) risks.push('专业组计划偏少（' + totalPlan + '人），偶然波动影响大');
        if (item.scores && item.scores.major < 48 && hasMajorPref) risks.push('专业偏好弱命中，需确认组内可接受专业比例');
        var profileMaxFee = Number(profile.maxFee) || 20000;
        if (item.maxFee && item.maxFee > profileMaxFee) risks.push('学费超过当前上限' + formatNumber(profileMaxFee) + '元');
        if (!risks.length) risks.push('位次、计划和偏好之间相对均衡，主要风险来自年度报考热度变化');

        return Object.assign({}, item, {
          reasonText: rp.join('；') + '。',
          riskText: risks.join('；') + '。',
        });
      });

      this.setData({
        hasPlan: true,
        selected: enrichedSelected,
        bands,
        bandTotal,
        bandRushPct: Math.round((bands.rush / bandTotal) * 100),
        bandStablePct: Math.round((bands.stable / bandTotal) * 100),
        bandSafePct: Math.round((bands.safe / bandTotal) * 100),
        duplicatedSchools,
        duplicatedSchoolsStr,
        scoreAvgs,
        n985, n211, nDoubleFirst, nBaoyan, nDoctoral,
        weakMajorCount, citiesAll, majorsSample, disciplinesAll,
        nCoop, nHighfee, feeMin, feeMax, overBudgetCount, totalPlanSlots,
        gradPlan, careerPlan, citiesMatched, citiesUnmatched,
        citiesMatchedStr, citiesUnmatchedStr,
        prefCitiesStr: prefCities.join('、') || '未指定',
        prefMajorsStr: prefMajors.join('、') || '未指定',
        recallMin: plan.recallRange?.min || 0,
        recallMax: plan.recallRange?.max || 0,
        alternatives: plan.alternatives || [],
        majorPreferredCount: plan.majorPreferredCandidateCount || 0,
        legalCount: plan.legalCandidateCount || 0,
        adviceRush, adviceStable, adviceSafe,
      });
      } catch (e) {
        console.error('report-section observer error:', e);
        this.setData({ hasPlan: true });
      }
    },
  },

  data: {
    hasPlan: false,
    selected: [],
    bands: { rush: 0, stable: 0, safe: 0 },
    bandTotal: 0, bandRushPct: 0, bandStablePct: 0, bandSafePct: 0,
    duplicatedSchools: [],
    duplicatedSchoolsStr: '暂无',
    scoreAvgs: [],
    n985: 0, n211: 0, nDoubleFirst: 0, nBaoyan: 0, nDoctoral: 0,
    weakMajorCount: 0, citiesAll: [], majorsSample: [], disciplinesAll: [],
    nCoop: 0, nHighfee: 0, feeMin: 0, feeMax: 0, overBudgetCount: 0, totalPlanSlots: 0,
    gradPlan: [], careerPlan: '', citiesMatched: [], citiesUnmatched: [],
    citiesMatchedStr: '', citiesUnmatchedStr: '',
    prefCitiesStr: '', prefMajorsStr: '',
    recallMin: 0, recallMax: 0,
    alternatives: [],
    majorPreferredCount: 0, legalCount: 0,
    profileMaxFee: Infinity,
    adviceRush: 1, adviceStable: 2, adviceSafe: 1,
  },

  lifetimes: {
    attached() {
      const profile = this.properties.profile;
      this.setData({ profileMaxFee: Number(profile?.maxFee) || Infinity });
    },
  },
});
