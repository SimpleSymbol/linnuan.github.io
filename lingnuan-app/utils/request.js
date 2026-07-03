// ============================================================
// 聆暖时光 · 统一接口请求封装（全站唯一入口）
// ============================================================
// 后端地址来自 config.js 的 getBaseUrl()，token 自动注入。
// 所有页面统一用：import { request } from '@/utils/request.js'
// 调用：request.post('/api/xxx', data) / request.get / request.delete
// ============================================================

import { getBaseUrl } from '../static/js/config.js';

// 取本地 token（登录后写入）
function getToken() {
  try {
    return uni.getStorageSync('token') || '';
  } catch (e) {
    return '';
  }
}

export const request = {
  // POST 请求
  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: getBaseUrl() + url,
        method: 'POST',
        data: data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            console.error('POST 失败：', url, res.statusCode, res.data);
            uni.showToast({
              title: (res.data && res.data.message) || ('请求失败：' + res.statusCode),
              icon: 'none',
              duration: 3000
            });
            reject(res.data || { message: '请求失败：' + res.statusCode });
          }
        },
        fail: (err) => {
          console.error('POST 网络错误：', url, err);
          uni.showToast({
            title: '网络错误：' + (err.errMsg || '请检查后端服务'),
            icon: 'none',
            duration: 3000
          });
          reject(err);
        }
      });
    });
  },

  // GET 请求
  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: getBaseUrl() + url,
        method: 'GET',
        data: data,
        header: {
          'Authorization': 'Bearer ' + getToken()
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            console.error('GET 失败：', url, res.statusCode, res.data);
            uni.showToast({
              title: (res.data && res.data.message) || ('请求失败：' + res.statusCode),
              icon: 'none',
              duration: 3000
            });
            reject(res.data || { message: '请求失败：' + res.statusCode });
          }
        },
        fail: (err) => {
          console.error('GET 网络错误：', url, err);
          uni.showToast({
            title: '网络错误：' + (err.errMsg || '请检查后端服务'),
            icon: 'none',
            duration: 3000
          });
          reject(err);
        }
      });
    });
  },

  // DELETE 请求
  delete(url, data = {}) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: getBaseUrl() + url,
        method: 'DELETE',
        data: data,
        header: {
          'Authorization': 'Bearer ' + getToken()
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            console.error('DELETE 失败：', url, res.statusCode, res.data);
            uni.showToast({
              title: (res.data && res.data.message) || ('请求失败：' + res.statusCode),
              icon: 'none',
              duration: 3000
            });
            reject(res.data || { message: '请求失败：' + res.statusCode });
          }
        },
        fail: (err) => {
          console.error('DELETE 网络错误：', url, err);
          uni.showToast({
            title: '网络错误：' + (err.errMsg || '请检查后端服务'),
            icon: 'none',
            duration: 3000
          });
          reject(err);
        }
      });
    });
  }
};

// 兼容默认导出（回忆录页面用 import request from '...'）
export default request;
