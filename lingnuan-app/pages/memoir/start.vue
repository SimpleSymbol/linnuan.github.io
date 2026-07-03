<template>
  <view class="page-container">
    <view class="header">
      <text class="welcome-text">数字回忆录</text>
      <text class="welcome-sub">{{ userName }}，记录您的珍贵时光</text>
    </view>

    <view class="btn-grid">
      <view class="btn-card" @click="createNewMemoir">
        <view class="icon-wrapper">
          <text class="iconfont">✏️</text>
        </view>
        <view class="card-title">新建回忆录</view>
        <view class="card-desc">通过 AI 对话引导创作新的回忆录</view>
      </view>

      <view class="btn-card" @click="manageMemoirs">
        <view class="icon-wrapper">
          <text class="iconfont">📚</text>
        </view>
        <view class="card-title">我的回忆录</view>
        <view class="card-desc">查看和管理已保存的回忆录</view>
      </view>
    </view>

    <!-- 返回管理中心 -->
    <view class="back-btn" @click="goBack">← 返回管理中心</view>
  </view>
</template>

<script>
import request from '@/utils/request.js';

export default {
  data() {
    return {
      userId: '',
      userName: '用户'
    };
  },
  onLoad() {
    // 统一从 userInfo 读取用户身份（与主应用登录态对齐）
    const userInfo = uni.getStorageSync('userInfo') || {};
    this.userId = userInfo.phone || userInfo.userId || uni.getStorageSync('userId') || '';
    this.userName = userInfo.userName || userInfo.phone || '用户';

    if (!this.userId) {
      uni.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => uni.reLaunch({ url: '/pages/login/index' }), 1000);
      return;
    }
    // 清除编辑状态
    uni.removeStorageSync('editMode');
    uni.removeStorageSync('editOldFileName');
    uni.removeStorageSync('editSessionId');
  },
  methods: {
    async createNewMemoir() {
      if (!this.userId) {
        uni.showToast({ title: '用户ID不能为空', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '初始化中...' });
      try {
        const res = await request.post('/generate-session', { userId: this.userId });
        if (res.success) {
          uni.setStorageSync('sessionId', res.sessionId);
          uni.navigateTo({
            url: `/pages/memoir/chat?userId=${this.userId}&sessionId=${res.sessionId}&editMode=false`
          });
        } else {
          uni.showToast({ title: res.message || '创建失败', icon: 'none' });
        }
      } catch (err) {
        uni.showToast({ title: err.message || '网络异常，请检查后端服务', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    manageMemoirs() {
      uni.navigateTo({ url: `/pages/memoir/memoirs?userId=${this.userId}` });
    },
    goBack() {
      uni.reLaunch({ url: '/pages/user/manage/index' });
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  /* 紫色已统一为主应用蓝色主题 */
  background: var(--primary-gradient);
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 60rpx;
  margin-top: 40rpx;
}

.welcome-text {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.welcome-sub {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
}

.btn-grid {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.btn-card {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8px 24px rgba(45, 52, 54, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.btn-card:active {
  transform: scale(0.98);
}

.icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  background: var(--primary-gradient-h);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 6px 16px rgba(255, 138, 101, 0.3);
}

.iconfont {
  font-size: 60rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 10rpx;
}

.card-desc {
  font-size: 28rpx;
  color: #636E72;
  text-align: center;
}

.back-btn {
  margin-top: auto;
  padding: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}
</style>
