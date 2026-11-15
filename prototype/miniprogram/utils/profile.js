// 用户画像构建与校验

import { CITY_REGION_MAP } from './constants';

export const defaultProfile = {
  province: '江苏',
  category: '物理类',
  batch: '本科批',
  rank: '',
  preference: 'balanced',
  subjectCombination: '物化生',
  cities: ['不限地域'],
  customCity: '',
  majors: ['不限专业'],
  customMajor: '',
  maxFee: Infinity,
  graduatePlan: ['暂无规划'],
  careerPlan: '',
  allowCoop: false,
  allowHighFee: false,
  allowColdMajor: false,
  localFirst: false,
  otherNeeds: '',
};

export function isValidRank(rank) {
  const n = Number(rank);
  return Number.isFinite(n) && n >= 1 && n <= 500000;
}

export function buildProfile(rawProfile) {
  const selectedCities = Array.isArray(rawProfile.cities) ? rawProfile.cities : (rawProfile.cities ? [rawProfile.cities] : []);
  const selectedMajors = Array.isArray(rawProfile.majors) ? rawProfile.majors : (rawProfile.majors ? [rawProfile.majors] : []);
  const customCities = selectedCities.includes('其他城市') ? (rawProfile.customCity || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean) : [];
  const customMajors = selectedMajors.includes('其他专业') ? (rawProfile.customMajor || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean) : [];

  // 展开区域选项（长三角→上海/江苏/浙江/安徽），后端只认识省份名
  const expandedCities = [];
  for (let i = 0; i < selectedCities.length; i++) {
    const c = selectedCities[i];
    const provinces = CITY_REGION_MAP[c];
    if (provinces) {
      for (let j = 0; j < provinces.length; j++) {
        expandedCities.push(provinces[j]);
      }
    } else {
      expandedCities.push(c);
    }
  }

  return {
    province: rawProfile.province,
    category: rawProfile.category,
    batch: rawProfile.batch,
    rank: Number(rawProfile.rank) || 0,
    preference: rawProfile.preference,
    subjectCombination: rawProfile.subjectCombination,
    cities: [...new Set([...expandedCities, ...customCities])],
    majors: [...new Set([...selectedMajors, ...customMajors])],
    maxFee: Number(rawProfile.maxFee) || Infinity,
    graduatePlan: Array.isArray(rawProfile.graduatePlan) ? rawProfile.graduatePlan : (rawProfile.graduatePlan ? [rawProfile.graduatePlan] : []),
    careerPlan: rawProfile.careerPlan || '',
    allowCoop: !!rawProfile.allowCoop,
    allowHighFee: !!rawProfile.allowHighFee,
    allowColdMajor: !!rawProfile.allowColdMajor,
    localFirst: !!rawProfile.localFirst,
    otherNeeds: rawProfile.otherNeeds || '',
  };
}
