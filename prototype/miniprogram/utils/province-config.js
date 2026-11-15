// 30 省配置 — 科类/批次/选科/志愿模式

const SUBJ_3P1P2_PHYSICS = ['物化生', '物化地', '物化政', '物生地', '物生政', '物政地'];
const SUBJ_3P1P2_HISTORY = ['史地政', '史地化', '史地生', '史政化', '史政生', '史化生'];
const SUBJ_3P3 = ['物化生','物化政','物化地','物化史','物生政','物生地','物生史','物政地','物政史','物地史','化生政','化生地','化生史','化政地','化政史','化地史','生政地','生政史','生地史','政地史'];
const SUBJ_3P3_ZHEJIANG = ['物化生','物化政','物化地','物化史','物化技','物生政','物生地','物生史','物生技','物政地','物政史','物政技','物地史','物地技','物史技','化生政','化生地','化生史','化生技','化政地','化政史','化政技','化地史','化地技','化史技','生政地','生政史','生政技','生地史','生地技','生史技','政地史','政地技','政史技','地史技'];

const COMBOS_312 = { '物理类': SUBJ_3P1P2_PHYSICS, '历史类': SUBJ_3P1P2_HISTORY };
const COMBOS_33 = { '综合': SUBJ_3P3 };
const COMBOS_ZJ = { '综合': SUBJ_3P3_ZHEJIANG };

export const PROVINCE_CONFIG = {
  jiangsu:     { name:'江苏', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:40, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  jiangxi:     { name:'江西', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  guangdong:   { name:'广东', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  hunan:       { name:'湖南', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  hubei:       { name:'湖北', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  anhui:       { name:'安徽', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  sichuan:     { name:'四川', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','本科批B段','专科批','本科提前批','本科提前批B段'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  shaanxi:     { name:'陕西', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  shanxi:      { name:'山西', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  fujian:      { name:'福建', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:40, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  guangxi:     { name:'广西', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  jilin:       { name:'吉林', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  heilongjiang:{ name:'黑龙江',examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  neimenggu:   { name:'内蒙古',examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  ningxia:     { name:'宁夏', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  gansu:       { name:'甘肃', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  qinghai:     { name:'青海', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','本科一段','本科二段','专科批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  shanghai:    { name:'上海', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['本科普通批','专科批','本科提前批'], subjectCombinations:COMBOS_33, volunteerUnit:'major_group', maxVolunteers:24, majorsPerGroup:4, hasAdjustment:true, rankRange:[1,500000] },
  beijing:     { name:'北京', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['本科普通批','专科批','本科提前批'], subjectCombinations:COMBOS_33, volunteerUnit:'major_group', maxVolunteers:30, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  tianjin:     { name:'天津', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['本科普通批','专科批','本科提前批'], subjectCombinations:COMBOS_33, volunteerUnit:'major_group', maxVolunteers:30, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  hainan:      { name:'海南', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['本科普通批','专科批','本科提前批'], subjectCombinations:COMBOS_33, volunteerUnit:'major_group', maxVolunteers:24, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
  hebei:       { name:'河北', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  liaoning:    { name:'辽宁', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:112, hasAdjustment:false, rankRange:[1,500000] },
  chongqing:   { name:'重庆', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  guizhou:     { name:'贵州', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  henan:       { name:'河南', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  yunnan:      { name:'云南', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科批','本科批A段','专科批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  zhejiang:    { name:'浙江', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['普通类一段','普通类二段','普通类提前批'], subjectCombinations:COMBOS_ZJ, volunteerUnit:'major+school', maxVolunteers:80, hasAdjustment:false, rankRange:[1,500000] },
  shandong:    { name:'山东', examMode:'3+3', categoryLabel:'科类', categories:['综合'], batches:['普通类一段','普通类二段','普通类提前批'], subjectCombinations:COMBOS_33, volunteerUnit:'major+school', maxVolunteers:96, hasAdjustment:false, rankRange:[1,500000] },
  xinjiang:    { name:'新疆', examMode:'3+1+2', categoryLabel:'科类', categories:['物理类','历史类'], batches:['本科一批','本科二批','高职高专批','本科提前批'], subjectCombinations:COMBOS_312, volunteerUnit:'major_group', maxVolunteers:45, majorsPerGroup:6, hasAdjustment:true, rankRange:[1,500000] },
};

export const PROVINCE_NAMES = Object.values(PROVINCE_CONFIG).map(c => c.name);

export function getConfigByName(name) {
  return Object.values(PROVINCE_CONFIG).find(c => c.name === name) || null;
}

export function getConfigById(id) {
  return PROVINCE_CONFIG[id] || null;
}

export function getSubjectsForCategory(province, category, metaSubjects) {
  if (metaSubjects && metaSubjects.length) return metaSubjects;
  const cfg = getConfigByName(province);
  if (!cfg) return [];
  const lookupCat = category === '综合类' ? '综合' : category;
  return cfg.subjectCombinations[lookupCat] || cfg.subjectCombinations[category] || [];
}

export function isMainCategory(name) {
  const main = ['物理类','历史类','理科','文科','综合'];
  return main.includes(name);
}

export function isMainBatch(name) {
  const exact = ['本科批','本科普通批','专科批','本科提前批','一段','二段','普通类一段','普通类二段','普通类提前批','提前批','专科提前批','本科批B段','本科提前批B段','本科一批','本科二批','高职高专批','高职(专科)批'];
  if (exact.includes(name)) return true;
  if (name === '本科批A段') return false;
  if ((name.startsWith('本科批') || name.startsWith('本科提前批')) && !name.includes('专项') && !name.includes('预科') && !name.includes('剩余')) return true;
  return false;
}
