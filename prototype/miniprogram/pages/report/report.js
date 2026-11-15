Page({
  data: {
    profile: null,
    plan: null,
    aiText: null,
    volunteerUnit: 'major_group',
    loading: true,
  },

  onLoad() {
    const app = getApp();
    const plan = app.globalData.apiPlan || wx.getStorageSync('apiPlan');
    const profile = app.globalData.submittedProfile || wx.getStorageSync('submittedProfile');
    const aiText = app.globalData.aiText || wx.getStorageSync('aiText');

    if (!plan || !profile) {
      wx.showToast({ title: '请先生成志愿方案', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1500);
      return;
    }

    this.setData({
      profile,
      plan,
      aiText,
      loading: false,
    });
  },

  onShow() {
    // Refresh data when tab is shown
    const app = getApp();
    const plan = app.globalData.apiPlan || wx.getStorageSync('apiPlan');
    const profile = app.globalData.submittedProfile || wx.getStorageSync('submittedProfile');
    const aiText = app.globalData.aiText || wx.getStorageSync('aiText');

    if (plan && profile) {
      this.setData({ profile, plan, aiText, loading: false });
    }
  },
});
