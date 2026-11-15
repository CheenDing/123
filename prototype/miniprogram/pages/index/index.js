import { defaultProfile, buildProfile, isValidRank } from '../../utils/profile';
import { getProvinces, getRecommend, getProvinceMeta, startReportStream, downloadReportPDF } from '../../utils/api';
import { getConfigByName, getSubjectsForCategory } from '../../utils/province-config';
import { isMainCategory, isMainBatch } from '../../utils/province-config';
import {
  cityOptions, majorOptions, feeOptions, riskBands,
} from '../../utils/constants';

Page({
  data: {
    // Form
    rawProfile: { ...defaultProfile },
    provinceNames: ['江苏'],
    provincesData: {},
    examMode: '3+1+2',
    volunteerUnit: 'major_group',
    hasAdjustment: true,
    maxVolunteers: 45,

    // UI state
    filterExpanded: true,
    dataStatus: 'loading',

    // Submission state
    hasSubmitted: false,
    submittedProfile: null,
    apiPlan: null,
    apiStatus: 'idle',
    loadingPhase: 0,

    // AI report
    aiText: null,
    aiLoading: false,
    reportProgress: 0,
    reportPhase: '',
    reportReady: false,

    // Modal & Chat
    selectedSchool: null,
    showChat: false,

    // Options from meta
    categories: [],
    batches: [],
    subjectOptions: [],
    preferenceOptions: [
      { value: 'aggressive', label: '激进' },
      { value: 'balanced', label: '均衡' },
      { value: 'conservative', label: '保守' },
    ],
    cityOptions,
    majorOptions,
    feeOptions,

    // Toggles
    toggles: [
      ['allowCoop', '接受中外合作'],
      ['allowHighFee', '接受高收费'],
      ['allowColdMajor', '接受冷门专业'],
      ['localFirst', '省内优先'],
    ],

    showCustomCity: false,
    showCustomMajor: false,
    tipsExpanded: false,

    // Used by WXML
    riskBands,
  },

  onLoad() {
    const cachedProfile = wx.getStorageSync('rawProfile');
    if (cachedProfile) {
      const merged = { ...defaultProfile, ...cachedProfile };
      if (!Array.isArray(merged.cities) || merged.cities.length === 0) merged.cities = ['不限地域'];
      if (!Array.isArray(merged.majors) || merged.majors.length === 0) merged.majors = ['不限专业'];
      this.setData({ rawProfile: merged });
    }

    const cachedPlan = wx.getStorageSync('apiPlan');
    const cachedAiText = wx.getStorageSync('aiText');
    const cachedSubmitted = wx.getStorageSync('submittedProfile');

    if (cachedPlan) {
      // Store full plan for PDF export etc
      this._fullPlan = cachedPlan;
      // Lite-ify for setData: keep only first 5 candidates, add _candidateCount
      if (!cachedPlan._candidateCount) {
        cachedPlan._candidateCount = (cachedPlan.candidates || []).length;
      }
      const litePlan = { ...cachedPlan, candidates: (cachedPlan.candidates || []).slice(0, 5) };
      const updates = {
        apiPlan: litePlan,
        apiStatus: 'online',
        hasSubmitted: true,
        reportReady: true,
        submittedProfile: cachedSubmitted || this.data.rawProfile,
      };
      if (cachedAiText) {
        updates.aiText = cachedAiText;
      }
      this.setData(updates);
    }

    this.fetchProvinces();
  },

  // ========== Province loading ==========
  async fetchProvinces() {
    try {
      const data = await getProvinces();
      if (data && data.ok && data.provinces) {
        const names = Object.keys(data.provinces);
        const provinceList = names.map((n) => ({ name: n, label: n }));
        this.setData({
          provincesData: data.provinces,
          provinceNames: names,
          provinceList,
        });
      }
    } catch (e) {
      console.error('Provinces load failed:', e);
    }
    this.fetchProvinceMeta();
  },

  async fetchProvinceMeta() {
    const province = this.data.rawProfile.province;
    try {
      const data = await getProvinceMeta(province);
      if (data && !data.error) {
        this.applyMeta(province, data);
      } else {
        this.applyStaticConfig(province);
      }
    } catch (e) {
      this.applyStaticConfig(province);
    }
  },

  applyMeta(province, data) {
    const categories = (data.categories || []).filter(isMainCategory);
    const batches = (data.batches || []).filter(isMainBatch);
    const subjects = getSubjectsForCategory(province, this.data.rawProfile.category, data.subjectCombinations);
    const cfg = getConfigByName(province) || {};

    // Fix stale batch/category if the selected one doesn't exist in actual data
    // (e.g. 四川 config says 本科批 but data only has 本科批B段)
    const updates = {
      categories,
      batches,
      subjectOptions: subjects,
      examMode: data.examMode || cfg.examMode || '3+1+2',
      volunteerUnit: cfg.volunteerUnit || 'major_group',
      hasAdjustment: cfg.hasAdjustment !== false,
      maxVolunteers: cfg.maxVolunteers || 45,
      dataStatus: 'ready',
    };
    const rawProfile = { ...this.data.rawProfile };
    let profileChanged = false;
    if (categories.length && !categories.includes(rawProfile.category)) {
      rawProfile.category = categories[0];
      profileChanged = true;
    }
    if (batches.length && !batches.includes(rawProfile.batch)) {
      const prefOrder = ['本科批', '普通类一段', '一段', '本科一批', '本科普通批', '本科批B段'];
      rawProfile.batch = prefOrder.find((b) => batches.includes(b)) || batches[0] || '';
      profileChanged = true;
    }
    if (profileChanged) {
      updates.rawProfile = rawProfile;
      wx.setStorageSync('rawProfile', rawProfile);
    }
    this.setData(updates);
  },

  applyStaticConfig(province) {
    const cfg = getConfigByName(province);
    if (!cfg) { this.setData({ dataStatus: 'ready' }); return; }
    const categories = (cfg.categories || []).filter(isMainCategory);
    const batches = (cfg.batches || []).filter(isMainBatch);
    const subjects = getSubjectsForCategory(province, this.data.rawProfile.category);

    const updates = {
      categories,
      batches,
      subjectOptions: subjects,
      examMode: cfg.examMode || '3+1+2',
      volunteerUnit: cfg.volunteerUnit || 'major_group',
      hasAdjustment: cfg.hasAdjustment !== false,
      maxVolunteers: cfg.maxVolunteers || 45,
      dataStatus: 'ready',
    };
    const rawProfile = { ...this.data.rawProfile };
    let profileChanged = false;
    if (categories.length && !categories.includes(rawProfile.category)) {
      rawProfile.category = categories[0];
      profileChanged = true;
    }
    if (batches.length && !batches.includes(rawProfile.batch)) {
      const prefOrder = ['本科批', '普通类一段', '一段', '本科一批', '本科普通批', '本科批B段'];
      rawProfile.batch = prefOrder.find((b) => batches.includes(b)) || batches[0] || '';
      profileChanged = true;
    }
    if (profileChanged) {
      updates.rawProfile = rawProfile;
      wx.setStorageSync('rawProfile', rawProfile);
    }
    this.setData(updates);
  },

  // ========== Picker handlers ==========
  onProvinceChange(e) {
    const idx = Number(e.detail.value);
    const province = this.data.provinceNames[idx];
    if (!province) return;
    const cfg = getConfigByName(province) || {};
    const cats = cfg.categories || [];
    const defaultCat = cats.includes('物理类') ? '物理类' : (cats[0] || '');
    // Don't blindly trust static config batches — 四川 config says 本科批 but data has 本科批B段
    const prefOrder = ['本科批', '普通类一段', '一段', '本科一批', '本科普通批', '本科批B段'];
    const cfgBatches = (cfg.batches || []).filter(isMainBatch);
    const defaultBatch = prefOrder.find((b) => cfgBatches.includes(b)) || cfgBatches[0] || '';
    const subjects = getSubjectsForCategory(province, defaultCat);

    const rawProfile = {
      ...this.data.rawProfile,
      province,
      category: defaultCat,
      batch: defaultBatch,
      subjectCombination: subjects.length ? subjects[0] : '',
    };

    this.setData({
      rawProfile,
      subjectOptions: subjects,
      categories: cats,
      batches: cfgBatches,
      examMode: cfg.examMode || '3+1+2',
      volunteerUnit: cfg.volunteerUnit || 'major_group',
      hasAdjustment: cfg.hasAdjustment !== false,
      maxVolunteers: cfg.maxVolunteers || 45,
    });
    wx.setStorageSync('rawProfile', rawProfile);
    this.clearResults();
    this.fetchProvinceMeta();
  },

  onCategoryChange(e) {
    const idx = Number(e.detail.value);
    const category = this.data.categories[idx];
    if (!category) return;
    const rawProfile = { ...this.data.rawProfile, category };
    const subjects = getSubjectsForCategory(rawProfile.province, category);
    if (subjects.length && !subjects.includes(rawProfile.subjectCombination)) {
      rawProfile.subjectCombination = subjects[0];
    }
    this.setData({ rawProfile, subjectOptions: subjects });
    wx.setStorageSync('rawProfile', rawProfile);
    this.clearResults();
  },

  onBatchChange(e) {
    const idx = Number(e.detail.value);
    const batch = this.data.batches[idx];
    if (!batch) return;
    const rawProfile = { ...this.data.rawProfile, batch };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
    this.clearResults();
  },

  // ========== Choice group change ==========
  onFieldChange(e) {
    const { field, value } = e.detail;
    if (!field) return;
    const rawProfile = { ...this.data.rawProfile, [field]: value };

    if (field === 'category') {
      const subjects = getSubjectsForCategory(rawProfile.province, value);
      if (subjects.length && !subjects.includes(rawProfile.subjectCombination)) {
        rawProfile.subjectCombination = subjects[0];
      }
      this.setData({ subjectOptions: subjects });
    }

    if (field === 'cities') {
      if (!Array.isArray(value) || value.length === 0) {
        rawProfile.cities = ['不限地域'];
      } else if (value.includes('不限地域') && value.length > 1) {
        rawProfile.cities = value.filter(v => v !== '不限地域');
      }
    }

    if (field === 'majors' && (!Array.isArray(value) || value.length === 0)) {
      rawProfile.majors = ['不限专业'];
    }

    if (field === 'graduatePlan') {
      const prev = Array.isArray(this.data.rawProfile.graduatePlan)
        ? this.data.rawProfile.graduatePlan : [];
      if (value.includes('暂无规划')) {
        rawProfile.graduatePlan = prev.includes('暂无规划')
          ? value.filter((v) => v !== '暂无规划')
          : ['暂无规划'];
      } else if (value.length === 0) {
        rawProfile.graduatePlan = ['暂无规划'];
      }
    }

    const updates = { rawProfile };
    if (field === 'cities') {
      updates.showCustomCity = Array.isArray(value) && value.includes('其他城市');
    }
    if (field === 'majors') {
      updates.showCustomMajor = Array.isArray(value) && value.includes('其他专业');
    }
    this.setData(updates);
    wx.setStorageSync('rawProfile', rawProfile);

    if (['batch', 'category', 'subjectCombination'].includes(field)) {
      this.clearResults();
    }
  },

  // ========== Input handlers ==========
  onRankInput(e) {
    const value = e.detail.value.replace(/\D/g, '').slice(0, 6);
    const rawProfile = { ...this.data.rawProfile, rank: value };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
  },

  onCustomCityInput(e) {
    const rawProfile = { ...this.data.rawProfile, customCity: e.detail.value };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
  },

  onCustomMajorInput(e) {
    const rawProfile = { ...this.data.rawProfile, customMajor: e.detail.value };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
  },

  onOtherNeedsInput(e) {
    const rawProfile = { ...this.data.rawProfile, otherNeeds: e.detail.value };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
  },

  // ========== Toggle ==========
  onToggle(e) {
    const field = e.currentTarget.dataset.field;
    const value = !this.data.rawProfile[field];
    const rawProfile = { ...this.data.rawProfile, [field]: value };
    this.setData({ rawProfile });
    wx.setStorageSync('rawProfile', rawProfile);
  },

  // ========== UI ==========
  onToggleFilter() {
    this.setData({ filterExpanded: !this.data.filterExpanded });
  },

  onToggleTips() {
    this.setData({ tipsExpanded: !this.data.tipsExpanded });
  },

  clearResults() {
    this._clearProgressTimer();
    this._fullPlan = null;
    this.setData({
      hasSubmitted: false,
      apiStatus: 'idle',
      aiText: null,
      reportReady: false,
      reportProgress: 0,
      reportPhase: '',
    });
    wx.removeStorageSync('apiPlan');
    wx.removeStorageSync('aiText');
  },

  // ========== Submit ==========
  async onSubmit() {
    const { rawProfile } = this.data;
    if (!isValidRank(rawProfile.rank)) {
      wx.showToast({ title: '请输入 1-500000 的有效位次', icon: 'none' });
      this.setData({ apiStatus: 'invalid-rank' });
      return;
    }
    if (this.data.dataStatus !== 'ready') {
      wx.showToast({ title: '省份数据加载中，请稍后', icon: 'none' });
      return;
    }

    this.setData({
      hasSubmitted: true,
      apiStatus: 'loading',
      loadingPhase: 0,
      aiText: null,
      aiLoading: false,
      reportReady: false,
    });

    setTimeout(() => this.setData({ loadingPhase: 1 }), 600);
    setTimeout(() => this.setData({ loadingPhase: 2 }), 1200);
    setTimeout(() => this.setData({ loadingPhase: 3 }), 1800);

    const profile = buildProfile(rawProfile);
    this.setData({ submittedProfile: profile });
    wx.setStorageSync('submittedProfile', profile);

    try {
      const plan = await getRecommend(profile);
      console.log('[onSubmit] plan received. candidates:', plan.candidates?.length, 'selected:', plan.selected?.length);

      // Store full plan for PDF export, AI report etc.
      this._fullPlan = plan;
      // setData lite: candidates array can be 700KB+, only .length is used in WXML
      const litePlan = {
        ...plan,
        candidates: plan.candidates ? plan.candidates.slice(0, 5) : [],
      };
      // Preserve correct count for template display
      litePlan._candidateCount = (plan.candidates || []).length;
      this.setData({
        apiPlan: litePlan,
        apiStatus: 'online',
        reportReady: true,
        aiLoading: true,
        reportProgress: 0,
      });
      // Store lite version: candidates array can be 500KB+, exceed storage limit
      wx.setStorageSync('apiPlan', { ...plan, candidates: [] });

      // Start report generation (background, updates aiText when done)
      this.requestReport(profile, plan);
    } catch (err) {
      console.error('Recommend API failed:', err);
      this.setData({
        apiStatus: 'offline',
        loadingPhase: 4,
        reportReady: true,
      });
      wx.showToast({ title: '推荐服务不可用，请稍后重试', icon: 'none' });
    }
  },

  _clearProgressTimer() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
  },

  _startProgressSim() {
    this._clearProgressTimer();
    const PHASES = [
      { max: 30, text: '正在分析录取数据...' },
      { max: 60, text: '正在评估专业匹配度...' },
      { max: 85, text: '正在生成综合报告...' },
      { max: 92, text: '正在优化最终建议...' },
    ];
    const CAP = 92; // never reach 100% until real result arrives
    let pct = 0;
    let phaseIdx = 0;

    this._progressTimer = setInterval(() => {
      // Increment: fast early, slow later (simulates diminishing returns)
      const remaining = CAP - pct;
      if (remaining <= 0) return;
      const step = Math.max(0.3, remaining * 0.06);
      pct = Math.min(CAP, pct + step);

      // Advance phase
      while (phaseIdx < PHASES.length && pct >= PHASES[phaseIdx].max) {
        phaseIdx++;
      }
      const phase = phaseIdx < PHASES.length ? PHASES[phaseIdx].text : PHASES[PHASES.length - 1].text;

      this.setData({
        reportProgress: Math.round(pct),
        reportPhase: phase,
      });
    }, 400);
  },

  async requestReport(profile, plan) {
    this._startProgressSim();
    try {
      const result = await startReportStream(profile, plan);
      this._clearProgressTimer();
      if (result && result.ok) {
        this.setData({ aiText: result, reportProgress: 100, reportPhase: '分析完成' });
        wx.setStorageSync('aiText', result);
      } else {
        this.setData({ reportProgress: 0, reportPhase: '' });
      }
    } catch (e) {
      console.error('Report text failed:', e);
      this._clearProgressTimer();
      this.setData({ reportProgress: 0, reportPhase: '' });
    } finally {
      this.setData({ aiLoading: false, loadingPhase: 4 });
    }
  },

  // ========== School detail ==========
  onSchoolClick(e) {
    this.setData({ selectedSchool: e.detail.item });
  },

  onAltClick(e) {
    const idx = Number(e.currentTarget.dataset.altIdx);
    const alt = this.data.apiPlan?.alternatives?.[idx];
    if (alt) {
      this.setData({ selectedSchool: alt });
    }
  },

  onCloseSchoolDetail() {
    this.setData({ selectedSchool: null });
  },

  // ========== Chat ==========
  toggleChat() {
    this.setData({ showChat: !this.data.showChat });
  },

  onCloseChat() {
    this.setData({ showChat: false });
  },

  // ========== Reset ==========
  onReset() {
    this._clearProgressTimer();
    this.setData({
      rawProfile: { ...defaultProfile },
      hasSubmitted: false,
      apiPlan: null,
      apiStatus: 'idle',
      aiText: null,
      reportReady: false,
      reportProgress: 0,
      reportPhase: '',
    });
    wx.removeStorageSync('rawProfile');
    wx.removeStorageSync('apiPlan');
    wx.removeStorageSync('aiText');
    wx.removeStorageSync('submittedProfile');
  },

  // ========== Export PDF ==========
  async onExportPDF() {
    const plan = this._fullPlan || this.data.apiPlan;
    if (!plan) {
      wx.showToast({ title: '请先生成志愿方案', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '生成PDF中...' });
    try {
      const path = await downloadReportPDF(
        this.data.submittedProfile,
        plan,
        this.data.aiText
      );
      wx.hideLoading();
      wx.openDocument({ filePath: path, fileType: 'pdf', showMenu: true });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: 'PDF生成失败', icon: 'none' });
    }
  },
});
