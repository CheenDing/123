// API 封装 — 全部 12 个端点 + PDF 下载

const API_BASE_OVERRIDE_KEY = 'gaokao_api_base_override';
const DEFAULT_REMOTE_API_BASE = 'https://django-2rdx-310313-7-1483617927.sh.run.tcloudbase.com';

function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}

function isDirectDevApiBase(value = '') {
  const normalized = trimTrailingSlash(String(value || '')).toLowerCase();
  return normalized.startsWith('http://127.')
    || (normalized.startsWith('http://') && normalized.includes('localhost'))
    || normalized.startsWith('http://192.168.')
    || normalized.startsWith('http://10.')
    || /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);
}

function readRuntimeApiBase() {
  try {
    const storageValue = wx.getStorageSync(API_BASE_OVERRIDE_KEY);
    if (storageValue) {
      return trimTrailingSlash(storageValue);
    }
  } catch (_) {
    // ignore storage failures
  }

  try {
    if (typeof wx.getExtConfigSync === 'function') {
      const extConfig = wx.getExtConfigSync() || {};
      const extValue = extConfig.apiBase || extConfig.GAOKAO_API_BASE || '';
      if (extValue) {
        return trimTrailingSlash(extValue);
      }
    }
  } catch (_) {
    // ignore ext config failures
  }

  return '';
}

const API_BASE = readRuntimeApiBase() || DEFAULT_REMOTE_API_BASE;
const API_PREFIX = isDirectDevApiBase(API_BASE) ? '/api' : '/gaokao/api';

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = API_BASE + API_PREFIX + path;
    console.log('[API]', method, url, data ? 'payload:' + JSON.stringify(data).substring(0, 120) : '');
    wx.request({
      url,
      method,
      data: data != null ? JSON.stringify(data) : undefined,
      timeout: 120000,
      header: { 'Content-Type': 'application/json' },
      success: res => {
        console.log('[API]', res.statusCode, url, typeof res.data);
        if (res.statusCode === 200) {
          const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          console.log('[API] candidates:', parsed?.candidates?.length, 'selected:', parsed?.selected?.length);
          resolve(parsed);
        }
        else reject(res);
      },
      fail: err => {
        console.error('[API] FAIL', url, err);
        reject(err);
      },
    });
  });
}

function get(path, params) {
  if (params) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    path = `${path}?${qs}`;
  }
  return request('GET', path);
}

function post(path, data) {
  return request('POST', path, data);
}

export function getProvinces() {
  return get('/provinces');
}

export function getProvinceMeta(province) {
  return get('/meta', { province });
}

export function getAdmissions(province, category, batch) {
  return get('/admissions', { province, category, batch });
}

export function getRecommend(profile) {
  return post('/recommend', profile);
}

export function getLlmRerank(profile, candidates) {
  return post('/recommend/llm-rerank', { profile, candidates });
}

export function startReportStream(profile, plan) {
  // Use non-stream endpoint because wx.request cannot parse SSE events.
  // The LLM call may take up to 180s — use a dedicated request with longer timeout.
  return new Promise((resolve, reject) => {
    const url = API_BASE + API_PREFIX + '/report/text';
    console.log('[API] POST', url);
    wx.request({
      url,
      method: 'POST',
      data: { profile, plan },
      timeout: 180000,
      header: { 'Content-Type': 'application/json' },
      success: res => {
        console.log('[API]', res.statusCode, url);
        if (res.statusCode === 200) resolve(res.data);
        else reject(res);
      },
      fail: err => {
        console.error('[API] FAIL', url, err);
        reject(err);
      },
    });
  });
}

export function getSchoolDetail(schoolName) {
  return get(`/schools/${encodeURIComponent(schoolName)}`);
}

export function getAiChat(profile, plan, message, history = []) {
  const messages = [...history, { role: 'user', content: message }];
  const recommendations = (plan && plan.selected) ? plan.selected.slice(0, 5) : [];
  const context = {
    candidate: profile || {},
    recommendations,
  };
  return post('/chat', { messages, context, useZhangxuefeng: true });
}

export function healthCheck() {
  return get('/health');
}

export function downloadReportPDF(profile, plan, aiText) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${API_PREFIX}/report/pdf`,
      method: 'POST',
      data: { profile, plan, aiText },
      responseType: 'arraybuffer',
      success: res => {
        if (res.statusCode !== 200) return reject(res);
        const fs = wx.getFileSystemManager();
        const path = `${wx.env.USER_DATA_PATH}/report.pdf`;
        fs.writeFile({
          filePath: path,
          data: res.data,
          encoding: 'binary',
          success: () => resolve(path),
          fail: reject,
        });
      },
      fail: reject,
    });
  });
}

export { API_BASE };
