// ============================================================
// 聆暖时光 · 后端接口地址配置（全站唯一来源）
// ============================================================
// 地址解析优先级：
//   1. 线上注入：index.html 里 window.__APP_CONFIG__ = { API_BASE: 'https://域名/api' }
//   2. 线上同域：与前端同源的 /api（同域部署自动生效）
//   3. 本地开发：http://localhost:3000/api
// ============================================================

export function getBaseUrl() {
  try {
    // #ifdef H5
    if (typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE) {
      return window.__APP_CONFIG__.API_BASE;
    }
    if (typeof window !== 'undefined' && window.location) {
      const host = window.location.hostname;
      // 本地开发：localhost / 内网IP → 直连本地后端
      if (host === 'localhost' || host === '192.168.1.8' ||
          /^192\.168\./.test(host) || /^10\./.test(host) ||
          /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) {
        return 'http://localhost:3000/api';
      }
      return window.location.origin + '/api';
    }
    // #endif
  } catch (e) {
    console.warn('[config] BASE_URL 判断失败，用兜底', e);
  }
  return 'http://localhost:3000/api';
}

export const BASE_URL = getBaseUrl();
