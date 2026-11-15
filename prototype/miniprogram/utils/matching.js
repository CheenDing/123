// 核心匹配引擎 — 选科匹配、专业匹配、城市匹配、多维评分、志愿方案生成

import { MAJOR_CATEGORY_MAP, CATEGORY_REMAP, USER_OPTION_MAP, CATEGORY_CROSS, CATEGORY_KEYWORDS } from './major-map';
import { clamp } from './format';
import { isCityInPreferences } from './format';

const SUBJECT_ALIASES = { 政治: '思想政治', 历史: '历史', 物理: '物理', 化学: '化学', 生物: '生物', 地理: '地理' };
const normalizeSubject = s => SUBJECT_ALIASES[s] || s;
const normalizeSubjects = set => new Set([...set].map(normalizeSubject));

export function parseSubjectCombo(subjectStr) {
  const subjects = String(subjectStr || '').split('+').map(s => s.trim()).filter(Boolean);
  if (!subjects.length) return { first: null, second: new Set() };
  return { first: normalizeSubject(subjects[0]), second: normalizeSubjects(new Set(subjects.slice(1))) };
}

export function subjectMatch(userFirst, userSecond, requirement) {
  const req = String(requirement || '').trim();
  if (!req) return true;
  if (!userFirst) return true;
  const firstMatch = req.match(/首选([^，,\s]+)/);
  if (!firstMatch) return true;
  if (normalizeSubject(firstMatch[1]) !== userFirst) return false;
  const secondPart = req.split('再选')[1] || '';
  if (!secondPart || secondPart.includes('不限')) return true;
  const cleaned = secondPart.replace(/\([^)]*\)/g, '').trim();
  const reqSeconds = new Set(cleaned.split(/[/、]/).map(s => s.trim()).filter(Boolean));
  if (!reqSeconds.size) return true;
  const normalized = normalizeSubjects(reqSeconds);
  if (req.includes('2选1')) return [...normalized].some(s => userSecond.has(s));
  return [...normalized].every(s => userSecond.has(s));
}

export function majorNames(item) {
  const names = [];
  for (const m of (item.majors || [])) {
    const n = (m.name || '').trim();
    if (n) names.push(n);
  }
  for (const p of (item.plans || [])) {
    const n = (p.name || '').trim();
    if (n) names.push(n);
  }
  return names;
}

export function majorMatchesOption(names, userOption) {
  const rule = USER_OPTION_MAP[userOption];
  if (!rule) return names.some(n => n.includes(userOption));
  for (const n of names) {
    const rawCat = MAJOR_CATEGORY_MAP[n] || '其他';
    const cat = CATEGORY_REMAP[rawCat] || rawCat;
    if (rule.categories.includes(cat)) {
      if (rule.keywords === null) return true;
      if (rule.keywords.some(kw => n.includes(kw))) return true;
    }
    const crossTargets = CATEGORY_CROSS[rawCat];
    if (crossTargets && crossTargets.some(t => rule.categories.includes(t))) {
      if (rule.keywords === null) return true;
      if (rule.keywords.some(kw => n.includes(kw))) return true;
    }
  }
  return false;
}

export function majorMatchQuality(names, userOption) {
  const rule = USER_OPTION_MAP[userOption];
  if (!rule) return 0;
  const keywords = CATEGORY_KEYWORDS[userOption] || [];
  let best = 0;
  for (const n of names) {
    const rawCat = MAJOR_CATEGORY_MAP[n] || '其他';
    const cat = CATEGORY_REMAP[rawCat] || rawCat;
    if (rule.categories.includes(cat)) {
      if (keywords.some(kw => n.includes(kw))) return 100;
      best = Math.max(best, 70);
    }
    const crossTargets = CATEGORY_CROSS[rawCat];
    if (crossTargets && crossTargets.some(t => rule.categories.includes(t))) {
      if (keywords.some(kw => n.includes(kw))) best = Math.max(best, 60);
      else best = Math.max(best, 50);
    }
  }
  return best;
}

export function cityMatch(item, profile) {
  if (!profile.cities.length || profile.cities.includes('不限地域')) return true;
  return isCityInPreferences(item.location, profile.cities)
    || (profile.localFirst && item.location === (profile.province || '江苏'));
}

export function majorMatch(item, profile) {
  if (!profile.majors.length) return true;
  const names = majorNames(item);
  return profile.majors.some(major => majorMatchesOption(names, major));
}

export function hasMajorPreference(profile) {
  return Boolean((profile.majors || []).filter(m => !String(m).includes('不限')).length);
}

// ===== 需求关键词检测 =====

const NEEDS_KW = {
  dorm: ['宿舍', '住宿', '空调', '独卫', '四人间', '上床下桌', '热水', '寝室'],
  canteen: ['食堂', '伙食', '餐厅', '饮食', '好吃', '美食', '饭菜'],
  area: ['面积', '占地', '校园大', '大校园', '校区大'],
  baoyan: ['保研', '推免', '研究生推免', '保送研究生'],
  doctoral: ['博士', '博士点', '硕博', '本硕博', '博士学位'],
  academician: ['院士', '名师', '知名教授', '学者'],
  faculty: ['师资', '老师', '教学水平', '教学质量', '教得好'],
  cityTier: ['大城市', '一线', '省会', '发达', '城市发展', '城市等级', '城市规模'],
  subway: ['地铁', '交通', '公交', '通勤', '出行', '火车站', '机场'],
  climate: ['气候', '天气', '暖和', '凉快', '不冷', '不热', '温度', '湿润', '干燥', '宜居', '南方', '北方'],
};

const SUBWAY_CITIES = new Set(['北京','上海','广州','深圳','成都','重庆','杭州','武汉','西安','南京','长沙','郑州','天津','苏州','青岛','东莞','沈阳','合肥','佛山','昆明','福州','无锡','厦门','济南','大连','哈尔滨','温州','石家庄','贵阳','南宁','兰州','南昌','常州','徐州','长春','太原','宁波','乌鲁木齐','洛阳','绍兴','芜湖','呼和浩特','南通','金华','咸阳','嘉兴','三亚','天水','珠海']);

const CITY_CLIMATE = {
  '哈尔滨':'severe_cold','齐齐哈尔':'severe_cold','牡丹江':'severe_cold','佳木斯':'severe_cold','大庆':'severe_cold',
  '长春':'severe_cold','吉林':'severe_cold','四平':'severe_cold',
  '沈阳':'cold','大连':'cold','鞍山':'cold','锦州':'cold',
  '呼和浩特':'severe_cold','包头':'severe_cold','乌鲁木齐':'severe_cold','石河子':'severe_cold',
  '西宁':'severe_cold','拉萨':'severe_cold','银川':'cold',
  '北京':'cold','天津':'cold','石家庄':'cold','唐山':'cold','保定':'cold','秦皇岛':'cold','廊坊':'cold',
  '太原':'cold','大同':'cold','临汾':'cold','西安':'cold','咸阳':'cold','宝鸡':'cold',
  '兰州':'cold','天水':'cold','济南':'cold','青岛':'cold','烟台':'cold','威海':'cold',
  '淄博':'cold','潍坊':'cold','泰安':'cold','郑州':'cold','洛阳':'cold','开封':'cold','新乡':'cold',
  '徐州':'cold','连云港':'cold',
  '南京':'temperate','苏州':'temperate','无锡':'temperate','常州':'temperate','南通':'temperate',
  '扬州':'temperate','镇江':'temperate','泰州':'temperate','盐城':'temperate','淮安':'temperate',
  '上海':'temperate','杭州':'temperate','宁波':'temperate','温州':'temperate','嘉兴':'temperate',
  '绍兴':'temperate','金华':'temperate','湖州':'temperate','合肥':'temperate','芜湖':'temperate',
  '蚌埠':'temperate','马鞍山':'temperate','武汉':'temperate','宜昌':'temperate','襄阳':'temperate',
  '荆州':'temperate','重庆':'temperate','成都':'temperate','绵阳':'temperate','德阳':'temperate',
  '宜宾':'temperate','昆明':'temperate','贵阳':'temperate','遵义':'temperate',
  '南宁':'temperate','桂林':'temperate','柳州':'temperate',
  '广州':'hot','深圳':'hot','东莞':'hot','佛山':'hot','珠海':'hot','中山':'hot',
  '惠州':'hot','汕头':'hot','湛江':'hot','长沙':'hot','株洲':'hot','湘潭':'hot','衡阳':'hot',
  '南昌':'hot','九江':'hot','赣州':'hot','福州':'hot','厦门':'hot','泉州':'hot','漳州':'hot',
  '海口':'hot','三亚':'hot',
};

function parseOtherNeeds(text) {
  const t = String(text || '').toLowerCase();
  const needs = {};
  for (const [key, kws] of Object.entries(NEEDS_KW)) {
    needs[key] = kws.some(kw => t.includes(kw));
  }
  return needs;
}

function otherNeedsScore(item, needs, otherNeedsText) {
  if (!needs) return 50;
  let total = 0, count = 0;

  if (needs.dorm) {
    count++;
    const r = item.dormRating || 'D';
    total += r === 'A' ? 25 : r === 'B' ? 15 : r === 'C' ? 5 : -10;
  }
  if (needs.canteen) {
    count++;
    const cnt = item.canteenCount || 0;
    total += cnt >= 10 ? 25 : cnt >= 6 ? 15 : cnt >= 3 ? 5 : -10;
  }
  if (needs.area) {
    count++;
    const a = item.campusArea || 0;
    total += a >= 4000 ? 25 : a >= 2000 ? 15 : a >= 1000 ? 5 : -5;
  }
  if (needs.baoyan) {
    count++;
    total += item.hasBaoyan ? 30 : -20;
  }
  if (needs.doctoral) {
    count++;
    total += item.hasDoctoral ? 30 : -20;
  }
  if (needs.academician) {
    count++;
    const acad = item.academicians || 0;
    total += acad >= 10 ? 25 : acad >= 3 ? 15 : acad >= 1 ? 5 : -5;
  }
  if (needs.faculty) {
    count++;
    const fl = item.facultyLevel || 'D';
    total += fl === 'A' ? 25 : fl === 'B' ? 15 : fl === 'C' ? 5 : -10;
  }
  if (needs.cityTier) {
    count++;
    const cl = item.cityLevel || '';
    if (cl.includes('一线') && !cl.includes('新')) total += 25;
    else if (cl.includes('新一线')) total += 20;
    else if (cl.includes('二线')) total += 12;
    else if (cl.includes('三线')) total += 4;
    else if (cl.includes('四线')) total -= 8;
    else if (cl.includes('五线')) total -= 15;
  }
  if (needs.subway) {
    count++;
    total += SUBWAY_CITIES.has(item.location || '') ? 25 : -15;
  }
  if (needs.climate) {
    count++;
    const city = item.location || '';
    const zone = CITY_CLIMATE[city] || 'temperate';
    const t = (otherNeedsText || '').toLowerCase();
    const warmKw = ['暖和', '不冷', '温暖', '南方', '热带'];
    const coolKw = ['凉快', '不热', '凉爽', '北方', '寒冷', '东北'];
    const wantsWarm = warmKw.some(kw => t.includes(kw));
    const wantsCool = coolKw.some(kw => t.includes(kw));
    if (wantsWarm && !wantsCool) {
      if (zone === 'hot') total += 25;
      else if (zone === 'temperate') total += 12;
      else if (zone === 'cold') total -= 5;
      else if (zone === 'severe_cold') total -= 15;
    } else if (wantsCool && !wantsWarm) {
      if (zone === 'severe_cold') total += 25;
      else if (zone === 'cold') total += 18;
      else if (zone === 'temperate') total += 8;
      else if (zone === 'hot') total -= 15;
    } else {
      if (zone === 'temperate') total += 20;
      else if (zone === 'cold' || zone === 'hot') total += 5;
      else if (zone === 'severe_cold') total -= 10;
    }
  }
  if (count === 0) return 50;
  return clamp(50 + total / count * 2.5, 0, 100);
}

export const careerAliases = {
  '技术/研发': ['技术', '研发', '工程师', '开发', '程序员', 'coding', '敲代码', '写代码', 'it', '码农'],
  '产品/运营': ['产品', '运营', '策划', '项目管理', 'pm'],
  '金融/咨询': ['金融', '咨询', '投行', '证券', '银行', '保险', '基金', '投资'],
  '医疗/健康': ['医疗', '健康', '医生', '护士', '药师', '药剂', '医院'],
  '教育/科研': ['教育', '科研', '教师', '教授', '学术', '研究', '老师', '高校', '大学老师'],
  '体制内/公务员': ['体制', '公务员', '编制', '考公', '考编', '选调', '事业单位', '国企'],
  '创业': ['创业', '自己干', '老板', '开店'],
};

function careerScore(text, profile) {
  const keys = careerAliases[profile.careerPlan] || [];
  let score = keys.length && containsAny(text, keys) ? 72 : 58;
  const gradPlan = Array.isArray(profile.graduatePlan) ? profile.graduatePlan : (profile.graduatePlan ? [profile.graduatePlan] : []);
  const wantsPostgrad = gradPlan.some(p => p === '考研' || p === '保研');
  if (wantsPostgrad && containsAny(text, ['临床', '法学', '计算机', '电子信息', '人工智能', '数学', '物理', '化学'])) {
    score += 10;
  }
  const wantsCivil = gradPlan.some(p => p === '考公/考编')
    || String(profile.careerPlan).includes('体制内')
    || String(profile.careerPlan).includes('公务员');
  if (wantsCivil) {
    score += containsAny(text, ['法学', '汉语言', '会计', '财政', '税收', '思想政治', '计算机', '师范']) ? 12 : -6;
  }
  return clamp(score, 35, 96);
}

function containsAny(text, keys) {
  const full = String(text || '').toLowerCase();
  return keys.some(key => full.includes(String(key).toLowerCase()));
}

const riskBands = [
  { key: 'rush', label: '冲', risk: '中高风险', min: 0.9, max: 0.98 },
  { key: 'stable', label: '稳', risk: '相对稳妥', min: 0.98, max: 1.08 },
  { key: 'safe', label: '保', risk: '稳妥', min: 1.08, max: 1.2 },
];

export function scoreCandidate(item, profile, allCandidates = []) {
  const rank = Number(profile.rank);
  const latestRank = item.avgRank || item.minRank || 999999;
  const ratio = latestRank / rank;
  const prefMax = 1.08 + 2000 / Math.max(rank, 1);
  const inRecall = ratio >= 0.9 && ratio <= prefMax;
  const cityKeys = profile.cities || [];
  const majorKeys = profile.majors || [];
  const schoolLayer = item.is985 ? 100 : item.is211 ? 92 : item.isDoubleFirstClass ? 82 : item.ownership === '公办' ? 72 : 48;
  const rankGap = ratio - 1;
  const safetyScore = clamp(50 + rankGap / 0.26 * 50, 5, 100);
  const profNames = majorNames(item);

  let purity = 1.0;
  if (majorKeys.length && profNames.length >= 4) {
    const matchCount = profNames.filter(n => majorKeys.some(k => majorMatchesOption([n], k))).length;
    purity = matchCount / Math.max(profNames.length, 1);
  }

  const isMajorPlusSchool = profNames.length <= 1;
  let professionalScore;
  if (!majorKeys.length) {
    professionalScore = 60;
  } else if (isMajorPlusSchool) {
    const qualities = majorKeys.map(k => majorMatchQuality(profNames, k));
    professionalScore = Math.max(...qualities, 30);
  } else {
    professionalScore = clamp(Math.round(majorKeys.filter(k => majorMatchesOption(profNames, k)).length / majorKeys.length * 100), 12, 100);
    if (purity < 0.55 && profNames.length >= 4 && !profile.allowColdMajor) {
      professionalScore = clamp(Math.round(professionalScore * (0.5 + purity)), 12, 100);
    }
  }

  const itemCity = item.city || item.location || '';
  const cityScore = (!cityKeys.length || cityKeys.includes('不限地域'))
    ? (profile.localFirst && item.location === (profile.province || '江苏') ? 88 : 72)
    : cityKeys.includes(itemCity)
      ? 100
      : isCityInPreferences(itemCity, cityKeys) || isCityInPreferences(item.location, cityKeys)
        ? 60
        : profile.localFirst && item.location === (profile.province || '江苏')
          ? 50
          : 18;

  const trendScore = clamp(82 - (item.rankSwing || 0) / Math.max(rank, 1) * 260, 35, 96);
  const planScore = clamp((item.totalPlan || 8) * 3, 35, 90);
  const feeScore = item.maxFee ? clamp(100 - Math.max(0, item.maxFee - profile.maxFee) / 500, 12, 100) : 70;
  const adjustmentRisk = majorKeys.length ? clamp(Math.round(10 + purity * 90), 10, 100) : 85;
  const employmentScore = careerScore(profNames.join(' '), profile);
  const needs = parseOtherNeeds(profile.otherNeeds);
  const otherNeedsNorm = otherNeedsScore(item, needs, profile.otherNeeds || '');

  const score =
    safetyScore * 0.18 +
    professionalScore * 0.34 +
    cityScore * 0.11 +
    schoolLayer * 0.07 +
    employmentScore * 0.07 +
    feeScore * 0.05 +
    adjustmentRisk * 0.05 +
    otherNeedsNorm * 0.13;

  let band = riskBands.find(r => ratio >= r.min && ratio < r.max);
  if (!band) band = ratio < 0.98 ? riskBands[0] : ratio < 1.08 ? riskBands[1] : riskBands[2];

  const nearby = allCandidates
    .filter(x => x.category === item.category && x.batch === item.batch && x.minRank)
    .sort((a, b) => Math.abs(a.minRank - latestRank) - Math.abs(b.minRank - latestRank))
    .slice(1, 4)
    .map(x => x.school);

  return {
    ...item,
    ratio,
    inRecall,
    band: band.key,
    bandLabel: band.label,
    riskLabel: ratio < 0.94 ? '高风险' : band.risk,
    scores: {
      safety: Math.round(safetyScore),
      major: Math.round(professionalScore),
      city: Math.round(cityScore),
      layer: Math.round(schoolLayer),
      career: Math.round(employmentScore),
      fee: Math.round(feeScore),
      adjustment: Math.round(adjustmentRisk),
      trend: Math.round(trendScore),
      plan: Math.round(planScore),
      otherNeeds: Math.round(otherNeedsNorm),
      total: Math.round(score),
    },
    adjustmentRisk: {
      riskLevel: purity >= 0.8 ? 'low' : purity >= 0.5 ? 'medium' : 'high',
      riskLabel: purity >= 0.8 ? '调剂风险低' : purity >= 0.5 ? '调剂风险中' : '调剂风险高',
      totalMajors: profNames.length,
      matchingMajors: profNames.filter(n => majorKeys.some(k => majorMatchesOption([n], k))).slice(0, 5),
      nonMatchingMajors: majorKeys.length ? profNames.filter(n => !majorKeys.some(k => majorMatchesOption([n], k))).slice(0, 5) : [],
      purity: Math.round(purity * 100) / 100,
      advice: '',
    },
    nearby,
  };
}

export function generatePlan(profile, admissionsData) {
  const rank = Number(profile.rank) || 0;
  const { first: userFirst, second: userSecond } = parseSubjectCombo(profile.subjectCombination);
  const latestYear = admissionsData.meta?.latestYear || 2024;

  const scoredCandidates = admissionsData.candidates
    .filter(item => item.category === profile.category)
    .filter(item => item.batch === profile.batch)
    .filter(item => item.year === latestYear)
    .filter(item => item.minRank)
    .filter(item => subjectMatch(userFirst, userSecond, item.subjectRequirement))
    .filter(item => profile.allowCoop || !item.isCoop)
    .filter(item => profile.allowHighFee || !item.isHighFee)
    .filter(item => profile.allowColdMajor || !item.hasColdMajor)
    .filter(item => !item.maxFee || item.maxFee <= profile.maxFee || profile.allowHighFee)
    .map(item => scoreCandidate(item, { ...profile, rank }, admissionsData.candidates))
    .sort((a, b) => b.scores.total - a.scores.total);

  let legalCandidates = scoredCandidates.filter(item => item.inRecall);
  if (legalCandidates.length < 4) {
    const seenRelaxed = new Set(legalCandidates.map(item => item.id));
    const relaxed = scoredCandidates
      .filter(item => !seenRelaxed.has(item.id) && item.ratio >= 0.75 && item.ratio <= 1.35)
      .sort((a, b) => b.scores.major - a.scores.major || b.scores.city - a.scores.city || b.scores.total - a.scores.total);
    legalCandidates.push(...relaxed.slice(0, 4 - legalCandidates.length));
  }
  if (legalCandidates.length < 4) {
    const seenFallback = new Set(legalCandidates.map(item => item.id));
    legalCandidates.push(...scoredCandidates.filter(item => !seenFallback.has(item.id)).slice(0, 4 - legalCandidates.length));
  }
  legalCandidates.sort((a, b) => b.scores.total - a.scores.total);
  const candidates = legalCandidates.slice(0, 300);

  const majorPreferred = candidates.filter(item => majorMatch(item, profile));
  const strongMajorPreferred = majorPreferred.filter(item => item.scores.major >= 48);
  const cityAndMajorPreferred = majorPreferred.filter(item => cityMatch(item, profile));
  const cityAndStrongMajorPreferred = strongMajorPreferred.filter(item => cityMatch(item, profile));
  const preferred =
    cityAndStrongMajorPreferred.length >= 8 ? cityAndStrongMajorPreferred
    : cityAndMajorPreferred.length >= 8 ? cityAndMajorPreferred
    : strongMajorPreferred.length >= 8 ? strongMajorPreferred
    : majorPreferred;
  const pool = hasMajorPreference(profile) && preferred.length >= 8 ? preferred : candidates;

  const poolBuckets = {
    rush: pool.filter(item => item.band === 'rush').slice(0, 35),
    stable: pool.filter(item => item.band === 'stable').slice(0, 45),
    safe: pool.filter(item => item.band === 'safe').slice(0, 45),
  };

  let target = [
    ...poolBuckets.rush.slice(0, 2),
    ...poolBuckets.stable.slice(0, 4),
    ...poolBuckets.safe.slice(0, 2),
  ];

  if (hasMajorPreference(profile)) {
    const strongPool = pool.filter(item => item.scores.major >= 48);
    const strongBuckets = {
      rush: strongPool.filter(item => item.band === 'rush').slice(0, 35),
      stable: strongPool.filter(item => item.band === 'stable').slice(0, 45),
      safe: strongPool.filter(item => item.band === 'safe').slice(0, 45),
    };
    target = [
      ...strongBuckets.rush.slice(0, 2),
      ...strongBuckets.stable.slice(0, 4),
      ...strongBuckets.safe.slice(0, 2),
    ];
  }

  const selected = [];
  const seen = new Set();
  const schoolCounts = new Map();
  const fillPool = [...pool].sort((a, b) =>
    (b.scores.major >= 48 ? 1 : 0) - (a.scores.major >= 48 ? 1 : 0) || b.scores.major - a.scores.major || b.scores.total - a.scores.total);

  for (const item of [...target, ...fillPool, ...candidates]) {
    const schoolCount = schoolCounts.get(item.school) || 0;
    if (!seen.has(item.id) && schoolCount < 2 && selected.length < 8) {
      selected.push(item);
      seen.add(item.id);
      schoolCounts.set(item.school, schoolCount + 1);
    }
  }

  const minRank = Math.min(...candidates.map(c => c.minRank || 999999));
  const maxRank = Math.max(...candidates.map(c => c.minRank || 0));

  return {
    candidates,
    selected,
    alternatives: candidates.filter(item => !seen.has(item.id)).slice(0, 20),
    recallRange: { min: minRank, max: maxRank },
  };
}
