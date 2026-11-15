// 格式化与通用工具函数

/** 数字千分位格式化 */
export function formatNumber(n) {
  if (n == null || isNaN(n)) return '-';
  return Number(n).toLocaleString('zh-CN');
}

/** 限制范围 */
export function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

/** 字符串是否包含任意关键词 */
export function containsAny(str, keywords = []) {
  if (!str) return false;
  const s = str.toLowerCase();
  return keywords.some(kw => s.includes(kw.toLowerCase()));
}

/** 列表转逗号分隔 */
export function toList(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
  return [];
}

/** 多选数组 toggle */
export function toggleArrayValue(values, value, options = []) {
  if (value.includes('不限')) return [value];
  const validValues = values.filter(v => options.length === 0 || options.includes(v));
  const current = validValues.filter(v => !v.includes('不限'));
  const idx = current.indexOf(value);
  if (idx >= 0) return current.filter(v => v !== value);
  return [...current, value];
}

/** 标准化自定义输入 */
export function normalizeCustom(text, separator = /[,，、]/) {
  if (!text) return [];
  return String(text).split(separator).map(s => s.trim()).filter(Boolean);
}

// ===== 地域判断 =====

const REGION_CLOSE = {
  '江苏': ['江苏', '上海', '浙江', '安徽'],
  '浙江': ['浙江', '上海', '江苏', '安徽', '福建'],
  '上海': ['上海', '江苏', '浙江'],
  '安徽': ['安徽', '江苏', '浙江', '湖北', '河南'],
  '北京': ['北京', '天津', '河北'],
  '广东': ['广东', '深圳'],
};

const REGION_MAP = {
  '南方': ['江苏', '上海', '浙江', '安徽', '福建', '广东', '广西', '海南', '湖北', '湖南', '江西', '四川', '重庆', '云南', '贵州', '深圳'],
  '北方': ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '山东', '河南', '陕西', '甘肃', '宁夏', '青海', '新疆', '西藏'],
  '长三角': ['上海', '江苏', '浙江', '安徽'],
  '珠三角': ['广东', '深圳'],
};

const CITY_ALIASES = {
  '深圳': '广东',
};

function resolveCity(location) {
  return CITY_ALIASES[location] || location;
}

/** 判断城市是否命中偏好 */
export function isCityInPreferences(location, preferences = []) {
  const city = resolveCity(location);
  if (!preferences.length || preferences.includes('不限地域')) return true;
  if (preferences.includes(city)) return true;

  if (REGION_CLOSE[city]) {
    const neighbors = REGION_CLOSE[city];
    for (const p of preferences) {
      if (neighbors.includes(p)) return true;
    }
  }

  for (const p of preferences) {
    const region = REGION_MAP[p];
    if (region && region.includes(city)) return true;
  }

  return false;
}
