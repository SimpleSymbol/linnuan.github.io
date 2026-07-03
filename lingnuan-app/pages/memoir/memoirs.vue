<template>
  <view class="page-container">
    <view class="header">
      <text class="page-title">我的回忆录</text>
      <button class="refresh-btn" @click="loadMemoirs">
        <text class="iconfont">🔄</text>
      </button>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-if="memoirs.length === 0 && !loading">
      <text class="empty-icon">📖</text>
      <text class="empty-text">暂无回忆录</text>
      <text class="empty-desc">点击下方按钮开始创作您的第一篇回忆录</text>
      <button class="create-btn" @click="createNewMemoir">
        新建回忆录
      </button>
    </view>
    
    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-icon">●●●</text>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 回忆录列表 -->
    <scroll-view 
      class="memoir-list" 
      scroll-y
    >
      <view 
        class="memoir-item" 
        v-for="(memoir, index) in memoirs" 
        :key="index"
        @click="viewMemoir(memoir)"
      >
        <view class="memoir-header">
          <text class="memoir-name">{{ memoir.fileName }}</text>
          <view class="memoir-actions">
            <button class="edit-btn" @click.stop="editMemoir(memoir)">
              <text class="iconfont">✏️</text>
            </button>
            <button class="delete-btn" @click.stop="deleteMemoir(memoir)">
              <text class="iconfont">🗑️</text>
            </button>
          </view>
        </view>
        
        <view class="memoir-meta">
          <text class="memoir-time">
            更新时间：{{ formatTime(memoir.updateTime) }}
          </text>
        </view>
        
        <view class="memoir-preview">
          {{ getPreviewContent(memoir.content) }}
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部新建按钮 -->
    <view class="fixed-btn" @click="createNewMemoir">
      <text class="btn-icon">+</text>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';

export default {
  data() {
    return {
      userId: '',
      memoirs: [],
      loading: false
    };
  },
  onLoad(options) {
    // 统一从 userInfo 读取（兼容旧 userId storage）
    const userInfo = uni.getStorageSync('userInfo') || {};
    this.userId = options.userId || userInfo.phone || userInfo.userId || uni.getStorageSync('userId');
    if (!this.userId) {
      uni.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.loadMemoirs();
  },
  onShow() {
    // 每次显示页面都刷新列表
    this.loadMemoirs();
  },
  methods: {
    // 加载回忆录列表
    async loadMemoirs() {
      this.loading = true;
      
      try {
        const res = await request.get(`/memoirs/${this.userId}`);
        
        if (res.success) {
          this.memoirs = res.memoirs || [];
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (err) {
        uni.showToast({
          title: '网络异常',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    
    // 获取预览内容
    getPreviewContent(content) {
      if (!content) return '无内容';
      // 截取前100个字符
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    },
    
    // 查看回忆录详情
    viewMemoir(memoir) {
      uni.showModal({
        title: memoir.fileName,
        content: memoir.content,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '修改',
        success: (res) => {
          if (res.confirm) {
            this.editMemoir(memoir);
          }
        }
      });
    },
    
    // 编辑回忆录 - 核心修复：传递旧文件名参数
    async editMemoir(memoir) {
      // 生成新的会话ID用于修改
      uni.showLoading({
        title: '初始化中...'
      });
      
      try {
        // 1. 生成新会话ID
        const res = await request.post('/generate-session', {
          userId: this.userId
        });
        
        if (res.success) {
          const sessionId = res.sessionId;
          // 2. 保存编辑状态（旧文件名+会话ID）
          uni.setStorageSync('editMode', true);
          uni.setStorageSync('editOldFileName', memoir.fileName);
          uni.setStorageSync('editSessionId', sessionId);
          
          // 3. 跳转到对话页面，携带所有参数
          uni.navigateTo({
            url: `/pages/memoir/chat?userId=${this.userId}&sessionId=${sessionId}&editMode=true&oldFileName=${encodeURIComponent(memoir.fileName)}`
          });
        }
      } catch (err) {
        uni.showToast({
          title: '初始化失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 删除回忆录
    async deleteMemoir(memoir) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除 "${memoir.fileName}" 吗？此操作不可恢复。`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });
            
            try {
              const res = await request.delete(`/memoirs/${this.userId}/${memoir.fileName}`);
              
              if (res.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                // 重新加载列表
                this.loadMemoirs();
              } else {
                uni.showToast({
                  title: res.message || '删除失败',
                  icon: 'none'
                });
              }
            } catch (err) {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    },
    
    // 新建回忆录
    createNewMemoir() {
      // 清除编辑状态
      uni.removeStorageSync('editMode');
      uni.removeStorageSync('editOldFileName');
      uni.removeStorageSync('editSessionId');
      
      uni.navigateTo({
        url: '/pages/memoir/start'
      });
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  /* 对齐主应用：暖橙渐变背景 */
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  padding: 20rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-top: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.refresh-btn {
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 6px rgba(230, 74, 25, 0.15);
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  color: rgba(255, 255, 255, 0.6);
}

.empty-text {
  font-size: 36rpx;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 40rpx;
  text-align: center;
  padding: 0 40rpx;
}

.create-btn {
  width: 300rpx;
  height: 96rpx;
  background: linear-gradient(125deg, #FF8A65, #E64A19);
  color: white;
  border-radius: 20rpx;
  font-size: 32rpx;
  box-shadow: 0 3px 8px rgba(230, 74, 25, 0.3);
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
}

.loading-icon {
  font-size: 60rpx;
  color: #ffffff;
  margin-bottom: 20rpx;
  animation: loading 1s infinite;
}

.loading-text {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes loading {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.memoir-list {
  width: 100%;
  flex: 1;
}

.memoir-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 8px rgba(230, 74, 25, 0.12);
}

.memoir-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.memoir-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memoir-actions {
  display: flex;
  gap: 20rpx;
}

.edit-btn, .delete-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-btn {
  background: rgba(255, 138, 101, 0.15);
  color: #E64A19;
}

.delete-btn {
  background: rgba(231, 76, 60, 0.12);
  color: #E74C3C;
}

.memoir-meta {
  margin-bottom: 20rpx;
}

.memoir-time {
  font-size: 24rpx;
  color: #636E72;
}

.memoir-preview {
  font-size: 28rpx;
  color: #636E72;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fixed-btn {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(125deg, #FF8A65, #E64A19);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 10px rgba(230, 74, 25, 0.4);
}

.btn-icon {
  font-size: 60rpx;
  color: white;
  font-weight: bold;
}
</style>

<!-- #ifdef H5 -->
<!-- 桌面端回忆录列表：在 480px 居中栏内优化；固定按钮相对该栏定位 -->
<style scoped>
@media (min-width: 768px) {
  .page-container {
    padding: 32px 24px;
  }
  .page-title {
    font-size: 24px;
  }
  .refresh-btn {
    width: 48px;
    height: 48px;
  }
  .memoir-item {
    padding: 24px;
    border-radius: 16px;
  }
  .memoir-name {
    font-size: 18px;
  }
  .memoir-time {
    font-size: 13px;
  }
  .memoir-preview {
    font-size: 15px;
  }
  /* 固定浮动按钮：跟随居中栏右侧（视口宽 - 栏宽480）/2 + 内边距 */
  .fixed-btn {
    width: 60px;
    height: 60px;
    bottom: 32px;
    right: calc((100vw - 480px) / 2 + 24px);
  }
  .btn-icon {
    font-size: 36px;
  }
  .create-btn {
    width: 220px;
    height: 52px;
    font-size: 17px;
  }
}
</style>
<!-- #endif -->