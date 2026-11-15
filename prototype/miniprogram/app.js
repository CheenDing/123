import { defaultProfile, buildProfile } from './utils/profile';

App({
  onLaunch() {
    const rawProfile = wx.getStorageSync('rawProfile');
    const provinces = wx.getStorageSync('provinces');
    const lastPlan = wx.getStorageSync('lastPlan');
    const lastAiText = wx.getStorageSync('lastAiText');
    const submittedProfile = wx.getStorageSync('submittedProfile');

    this.globalData.rawProfile = rawProfile || { ...defaultProfile };
    this.globalData.submittedProfile = submittedProfile || null;
    if (provinces) this.globalData.provinces = provinces;
    if (lastPlan) {
      this.globalData.apiPlan = lastPlan;
      this.globalData.hasSubmitted = true;
    }
    if (lastAiText) {
      this.globalData.aiText = lastAiText;
      this.globalData.reportReady = true;
    }
  },

  globalData: {
    rawProfile: null,
    submittedProfile: null,
    hasSubmitted: false,
    apiPlan: null,
    apiStatus: 'idle',
    aiText: null,
    aiLoading: false,
    reportProgress: 0,
    reportReady: false,
    selectedSchool: null,
    showChat: false,
    profileFeedback: null,
  },
});
