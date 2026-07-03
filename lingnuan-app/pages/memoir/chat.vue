<template>
  <view class="page-container">
    <!-- 聊天记录区域 -->
    <scroll-view 
      class="chat-container" 
      scroll-y 
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <view class="chat-messages">
        <!-- 系统欢迎语 -->
        <view class="message-item ai-item" v-if="messages.length === 0">
          <view class="ai-avatar">🤖</view>
          <view class="ai-message">
            {{ editMode ? '您好！请补充/修改您的回忆内容...' : '您好！我是您的回忆录引导师，请问您想回忆哪些美好的时光呢？' }}
          </view>
        </view>
        
        <!-- 聊天记录 -->
        <view v-for="(msg, index) in messages" :key="index">
          <!-- 用户消息 - 右对齐 -->
          <view v-if="msg.role === 'user'" class="message-item user-item">
            <view class="user-avatar">👤</view>
            <view class="user-message">{{ msg.content }}</view>
          </view>
          
          <!-- AI消息 - 左对齐 -->
          <view v-if="msg.role === 'ai'" class="message-item ai-item">
            <view class="ai-avatar">🤖</view>
            <view class="ai-message">{{ msg.content }}</view>
          </view>
        </view>
        
        <!-- 加载中 -->
        <view v-if="loading" class="message-item ai-item">
          <view class="ai-avatar">🤖</view>
          <view class="loading-message">
            <text class="dot">●</text>
            <text class="dot">●</text>
            <text class="dot">●</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入区域 -->
    <view class="input-container">
      <textarea 
        class="message-input" 
        :placeholder="editMode ? '请输入您要修改的回忆内容...' : '请输入您的回忆内容...'"
        v-model="inputContent"
        maxlength="5000"
        @input="onInput"
      ></textarea>
      
      <view class="btn-group">
        <button 
          class="abandon-btn" 
          @click="abandonChat"
        >
          放弃
        </button>
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!canSend || loading"
        >
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </view>
      
      <view class="action-btn-group">
        <button 
          class="complete-btn" 
          @click="completeChat"
          :disabled="messages.length === 0"
        >
          {{ editMode ? '完成修改，更新回忆录' : '完成创作，生成回忆录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';

export default {
  data() {
    return {
      userId: '',
      sessionId: '',
      editMode: false, // 是否为编辑模式
      oldFileName: '', // 要修改的原文件名
      messages: [],
      inputContent: '',
      loading: false,
      scrollTop: 0,
      autoScroll: true,
      canSend: false
    };
  },
  onLoad(options) {
    // 统一从 userInfo 读取（兼容旧 userId storage）
    const userInfo = uni.getStorageSync('userInfo') || {};
    this.userId = options.userId || userInfo.phone || userInfo.userId || uni.getStorageSync('userId');
    this.sessionId = options.sessionId || uni.getStorageSync('sessionId');
    this.editMode = options.editMode === 'true' || uni.getStorageSync('editMode') === true;
    this.oldFileName = options.oldFileName ? decodeURIComponent(options.oldFileName) : uni.getStorageSync('editOldFileName');

    if (!this.userId || !this.sessionId) {
      uni.navigateBack();
      return;
    }
  },
  methods: {
    // 输入内容监听
    onInput(e) {
      this.canSend = e.detail.value.trim().length > 0;
    },
    
    // 滚动监听
    onScroll(e) {
      this.autoScroll = e.detail.scrollTop + 1000 >= e.detail.scrollHeight;
    },
    
    // 发送消息
    async sendMessage() {
      const content = this.inputContent.trim();
      if (!content || this.loading) return;
      
      // 添加用户消息到列表
      this.messages.push({
        role: 'user',
        content: content
      });
      
      // 清空输入框
      this.inputContent = '';
      this.canSend = false;
      this.loading = true;
      
      // 自动滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      try {
        // 调用后端接口（新建/修改模式都用同一个chat接口）
        const res = await request.post('/chat', {
          userId: this.userId,
          sessionId: this.sessionId,
          content: content
        });
        
        if (res.success) {
          // 添加AI回复
          this.messages.push({
            role: 'ai',
            content: res.aiReply
          });
        } else {
          uni.showToast({
            title: res.message || '发送失败',
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
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      if (this.autoScroll) {
        this.scrollTop = 999999;
      }
    },
    
    // 完成创作/修改 - 核心修复：传递oldFileName参数
    async completeChat() {
      const tipText = this.editMode ? '确定要更新这篇回忆录吗？' : '确定要完成创作并生成回忆录吗？';
      
      uni.showModal({
        title: '提示',
        content: tipText,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: this.editMode ? '更新中...' : '生成中...'
            });
            
            try {
              // 构建请求参数（关键：编辑模式传递oldFileName）
              const reqParams = {
                userId: this.userId,
                sessionId: this.sessionId
              };
              // 编辑模式添加旧文件名参数
              if (this.editMode && this.oldFileName) {
                reqParams.oldFileName = this.oldFileName;
              }
              
              // 调用完成接口
              const result = await request.post('/complete-input', reqParams);
              
              if (result.success) {
                uni.hideLoading();
                uni.showToast({
                  title: this.editMode ? '回忆录更新成功！' : '回忆录生成成功！',
                  icon: 'success'
                });
                
                // 跳转到回忆录列表页
                setTimeout(() => {
                  uni.redirectTo({
                    url: `/pages/memoir/memoirs?userId=${this.userId}`
                  });
                }, 1500);
              } else {
                uni.hideLoading();
                uni.showToast({
                  title: result.message || (this.editMode ? '更新失败' : '生成失败'),
                  icon: 'none'
                });
              }
            } catch (err) {
              uni.hideLoading();
              uni.showToast({
                title: this.editMode ? '更新失败' : '生成失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 放弃当前对话
    async abandonChat() {
      const tipText = this.editMode ? '确定要放弃修改吗？所有未保存的内容将会丢失。' : '确定要放弃当前创作吗？所有未保存的内容将会丢失。';
      
      uni.showModal({
        title: '提示',
        content: tipText,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用放弃接口
              await request.post('/abandon-input', {
                userId: this.userId,
                sessionId: this.sessionId
              });
              
              // 清除编辑状态
              if (this.editMode) {
                uni.removeStorageSync('editMode');
                uni.removeStorageSync('editOldFileName');
                uni.removeStorageSync('editSessionId');
              }
              
              uni.showToast({
                title: this.editMode ? '已放弃修改' : '已放弃当前创作',
                icon: 'success'
              });
              
              // 返回上一页
              setTimeout(() => {
                uni.navigateBack();
              }, 1000);
            } catch (err) {
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* 对齐主应用：暖橙渐变背景 */
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
}

.chat-container {
  flex: 1;
  padding: 20rpx;
}

.chat-messages {
  min-height: 100%;
}

/* 基础消息项样式 */
.message-item {
  display: flex;
  margin-bottom: 30rpx;
  align-items: flex-start;
  width: 100%;
}

/* 用户消息 - 右对齐 */
.user-item {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

/* AI消息 - 左对齐 */
.ai-item {
  justify-content: flex-start;
}

.user-avatar, .ai-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  flex-shrink: 0;
}

.user-avatar {
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  color: white;
  margin-left: 20rpx;
}

.ai-avatar {
  margin-right: 20rpx;
}

.user-message {
  max-width: 70%;
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  color: white;
  padding: 20rpx 30rpx;
  border-radius: 22rpx 0 22rpx 22rpx;
  font-size: 30rpx;
  line-height: 1.5;
  box-shadow: 0 2px 6px rgba(230, 74, 25, 0.2);
}

.ai-message {
  max-width: 70%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #2D3436;
  padding: 20rpx 30rpx;
  border-radius: 0 22rpx 22rpx 22rpx;
  font-size: 30rpx;
  line-height: 1.5;
  box-shadow: 0 2px 6px rgba(230, 74, 25, 0.1);
}

.loading-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.loading-message {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20rpx 30rpx;
  border-radius: 0 22rpx 22rpx 22rpx;
  margin-right: 20rpx;
  display: flex;
  gap: 10rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #FF8A65;
  animation: blink 1.4s infinite both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0% { opacity: 0.2; }
  20% { opacity: 1; }
  100% { opacity: 0.2; }
}

.input-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
}

.message-input {
  width: 100%;
  min-height: 120rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.btn-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.abandon-btn {
  width: 200rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: #ffffff;
  border-radius: 20rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 200rpx;
  height: 80rpx;
  background: linear-gradient(125deg, #FF8A65, #E64A19);
  color: white;
  border-radius: 20rpx;
  font-size: 28rpx;
}

.send-btn:disabled {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
}

.action-btn-group {
  width: 100%;
}

.complete-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(125deg, #E64A19, #FF8A65);
  color: white;
  border-radius: 20rpx;
  font-size: 32rpx;
  box-shadow: 0 3px 8px rgba(230, 74, 25, 0.3);
}

.complete-btn:disabled {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}
</style>

<!-- #ifdef H5 -->
<!-- 桌面端聊天页：在 480px 居中栏内优化字号与输入区 -->
<style scoped>
@media (min-width: 768px) {
  .chat-container {
    padding: 24px 20px;
  }
  .message-item {
    margin-bottom: 24px;
  }
  .user-avatar,
  .ai-avatar {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }
  .user-avatar {
    margin-left: 12px;
  }
  .ai-avatar {
    margin-right: 12px;
  }
  .user-message,
  .ai-message {
    max-width: 75%;
    padding: 12px 18px;
    font-size: 16px;
    border-radius: 18px;
  }
  .input-container {
    padding: 16px 20px;
  }
  .message-input {
    min-height: 80px;
    font-size: 16px;
    border-radius: 14px;
    padding: 14px;
  }
  .abandon-btn,
  .send-btn {
    width: 130px;
    height: 48px;
    font-size: 16px;
    border-radius: 24px;
    cursor: pointer;
  }
  .complete-btn {
    height: 52px;
    font-size: 17px;
    border-radius: 26px;
    cursor: pointer;
  }
}
</style>
<!-- #endif -->