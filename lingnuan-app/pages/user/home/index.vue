<template>
  <view class="companion-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="nav-left" @tap="toggleSessionList">
        <text class="nav-menu-icon">☰</text>
      </view>
      <text class="navbar-title">情感陪伴</text>
      <view class="emotion-btn" @tap="goToEmotionMonitor">
        <icon-svg name="icon-emotion" size="normal" color="white"></icon-svg>
      </view>
    </view>

    <!-- 历史会话侧边栏 -->
    <view class="session-sidebar" :class="{ 'show': showSessionPanel }" @tap.self="showSessionPanel = false">
      <view class="session-panel">
        <view class="panel-header">
          <text class="panel-title">历史对话</text>
          <view class="panel-close" @tap="showSessionPanel = false">
            <text>✕</text>
          </view>
        </view>
        
        <!-- 新建对话按钮 -->
        <view class="new-session-btn" @tap="createNewSession">
          <icon-svg name="icon-chat" size="small" color="white"></icon-svg>
          <text>新建对话</text>
        </view>
        
        <!-- 会话列表 -->
        <scroll-view scroll-y="true" class="session-list-scroll">
          <!-- 加载中 -->
          <view class="loading-tip" v-if="isLoadingHistory">
            <text>加载中...</text>
          </view>
          
          <!-- 空列表 -->
          <view class="empty-list" v-else-if="historySessions.length === 0">
            <text>暂无历史对话</text>
            <text class="empty-sub">点击上方按钮开始新对话</text>
          </view>
          
          <!-- 会话列表项 -->
          <view 
            class="session-item" 
            :class="{ active: item.sessionId === currentSessionId }"
            v-for="(item, index) in historySessions" 
            :key="index"
            @tap="loadHistorySession(item)"
          >
            <view class="session-item-info">
              <text class="session-item-title">{{ item.title }}</text>
              <text class="session-item-time">{{ formatTime(item.updateTime) }}</text>
            </view>
            <view class="session-delete" @tap.stop="deleteSession(item, index)">
              <text>🗑</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 遮罩层 -->
      <view class="sidebar-mask" v-if="showSessionPanel"></view>
    </view>

    <!-- 聊天内容区域 -->
    <view class="chat-wrapper">
      <scroll-view 
        class="chat-content" 
        scroll-y="true" 
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
        :show-scrollbar="false"
        @tap="hideKeyboard"
      >
        <!-- 会话加载中 -->
        <view class="chat-loading" v-if="isLoadingSession && messages.length === 0">
          <view class="loading-dots">
            <text class="dot"></text>
            <text class="dot"></text>
            <text class="dot"></text>
          </view>
          <text class="loading-text">正在连接陪伴助手...</text>
        </view>
        
        <!-- 消息列表 -->
        <view class="chat-list">
          <view 
            class="message" 
            :class="msg.type === 'ai' ? 'ai-message' : 'user-message'" 
            v-for="(msg, index) in messages" 
            :key="index"
          >
            <view class="avatar ai-avatar" v-if="msg.type === 'ai'">
              <icon-svg name="icon-user" size="normal" color="white"></icon-svg>
            </view>
            
            <view 
              class="message-content" 
              :class="msg.type === 'ai' ? 'ai-content' : 'user-content'"
            >
              <text>{{ msg.content }}</text>
            </view>
          </view>
          
          <!-- AI回复中 -->
          <view class="message ai-message" v-if="isAiTyping">
            <view class="avatar ai-avatar">
              <icon-svg name="icon-user" size="normal" color="white"></icon-svg>
            </view>
            <view class="message-content ai-content typing-indicator">
              <view class="typing-dots">
                <span></span><span></span><span></span>
              </view>
            </view>
          </view>
          
          <view class="bottom-spacer"></view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 底部输入区域 -->
    <view class="input-area">
      <view class="input-wrapper">
        <input 
          class="message-input" 
          type="text" 
          v-model="inputMessage" 
          placeholder="输入消息..." 
          confirm-type="send"
          @confirm="sendMessage"
          :disabled="isLoadingSession || isAiTyping"
        />
        <view class="input-actions">
          <view class="action-btn" @tap="chooseImage">
            <icon-svg name="icon-image" size="normal" color="primary"></icon-svg>
          </view>
          <view class="action-btn" @tap="startVoiceInput">
            <icon-svg name="icon-mic" size="normal" color="primary"></icon-svg>
          </view>
          <view class="send-btn" @tap="sendMessage" :class="{ disabled: !inputMessage.trim() }">
            <icon-svg name="icon-send" size="small" color="white"></icon-svg>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tab-item active" @tap="switchTab('companion')">
        <view class="tab-content">
          <icon-svg name="icon-chat" size="normal" color="white"></icon-svg>
          <text>情感陪伴</text>
        </view>
      </view>
      
      <view class="center-btn" @tap="switchTab('volunteer')">
        <icon-svg name="icon-volunteer" size="medium" color="white"></icon-svg>
      </view>
      
      <view class="tab-item" @tap="switchTab('manage')">
        <view class="tab-content">
          <icon-svg name="icon-settings" size="normal" color="gray"></icon-svg>
          <text>管理中心</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { genTestUserSig } from '../../../debug/GenerateTestUserSig.js';
import IconSvg from '@/components/IconSvg.vue';
import { request } from '@/utils/request.js';

export default {
  components: {
    IconSvg
  },
  data() {
    return {
      // 输入相关
      inputMessage: '',
      scrollTop: 0,
      
      // 消息数据
      messages: [],           // 显示用消息 [{type, content, timestamp}]
      sessionMessages: [],     // 后端格式（传给AI作上下文）[{msgId, userContent, aiContent}]
      
      // 会话管理
      currentSessionId: '',   // 当前会话ID
      isLoadingSession: true, // 会话创建/加载状态
      isAiTyping: false,       // AI回复中
      
      // 历史会话侧边栏
      showSessionPanel: false,
      historySessions: [],     // 历史会话列表
      isLoadingHistory: false  // 历史加载中
    }
  },
  
  // ==================== 生命周期 ====================
  
  /**
   * 页面加载时自动创建新会话
   */
  mounted() {
    this.createSession();
  },
  
  methods: {
    // ==================== 会话生命周期 ====================
    
    /**
     * 创建新会话 → 调后端 /api/create-session → 获取AI温暖开场白
     */
    async createSession() {
      // 先清空状态、隐藏loading
      this.isLoadingSession = true;
      this.messages = [];
      this.sessionMessages = [];
      this.currentSessionId = '';
      
      try {
        const userInfo = uni.getStorageSync('userInfo') || {};
        
        // 设置超时保护：8秒内必须返回，否则降级为本地开场白
        const res = await Promise.race([
          request.post('/create-session', {
            userId: userInfo.phone || 'guest'
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('连接超时')), 8000)
          )
        ]);
        
        if (res && res.success) {
          this.currentSessionId = res.sessionId;
          // AI开场白写入两个列表
          const greetingMsg = {
            msgId: 'greeting-' + Date.now(),
            timestamp: new Date().toISOString(),
            userContent: '',
            aiContent: res.firstGreeting
          };
          this.sessionMessages.push(greetingMsg);
          this.messages.push({
            type: 'ai',
            content: res.firstGreeting,
            timestamp: greetingMsg.timestamp
          });
          // 刷新历史列表
          this.loadHistorySessions();
        } else {
          this._fallbackGreeting();
        }
      } catch (error) {
        console.error('创建会话异常:', error);
        this._fallbackGreeting();
      } finally {
        // 无论成败都关闭loading
        this.isLoadingSession = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    
    /**
     * 兜底开场白（网络异常等）
     */
    _fallbackGreeting() {
      const fallbackText = '你好，我是你的情感陪伴助手。有什么可以帮到你的吗？';
      this.messages.push({ type: 'ai', content: fallbackText, timestamp: new Date().toISOString() });
    },
    
    /**
     * 手动新建对话（从侧边栏触发）
     */
    async createNewSession() {
      this.showSessionPanel = false;
      uni.showLoading({ title: '创建新对话...' });
      await this.createSession();
      uni.hideLoading();
    },
    
    /**
     * 加载历史会话 → 调后端 /api/load-session
     */
    async loadHistorySession(sessionItem) {
      this.showSessionPanel = false;
      if (sessionItem.sessionId === this.currentSessionId) return;
      
      uni.showLoading({ title: '加载对话...' });
      try {
        const res = await request.post('/load-session', {
          sessionId: sessionItem.sessionId
        });
        if (res.success && res.messages) {
          this.currentSessionId = sessionItem.sessionId;
          // 后端原始数据 → sessionMessages
          this.sessionMessages = res.messages;
          // 转换为显示格式 → messages
          this.messages = [];
          for (const m of res.messages) {
            if (m.userContent && m.userContent.trim()) {
              this.messages.push({ type: 'user', content: m.userContent, timestamp: m.timestamp });
            }
            if (m.aiContent && m.aiContent.trim()) {
              this.messages.push({ type: 'ai', content: m.aiContent, timestamp: m.timestamp });
            }
          }
        }
      } catch (error) {
        console.error('加载会话失败:', error);
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
      } finally {
        uni.hideLoading();
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    
    /**
     * 删除历史会话
     */
    async deleteSession(sessionItem, index) {
      const that = this;
      uni.showModal({
        title: '确认删除',
        content: '确定删除该条对话记录？',
        success: async (modalRes) => {
          if (!modalRes.confirm) return;
          try {
            await request.delete(`/session/${sessionItem.sessionId}`);
            // 如果删除的是当前会话，自动创建新会话
            if (that.currentSessionId === sessionItem.sessionId) {
              await that.createSession();
            }
            that.historySessions.splice(index, 1);
            uni.showToast({ title: '已删除', icon: 'success' });
          } catch (error) {
            console.error('删除失败:', error);
            uni.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      });
    },
    
    /**
     * 加载历史会话列表
     */
    async loadHistorySessions() {
      this.isLoadingHistory = true;
      try {
        const userInfo = uni.getStorageSync('userInfo') || {};
        const res = await request.get('/get-session-list/' + (userInfo.phone || 'guest'));
        if (res.success && res.list) {
          this.historySessions = res.list;
        }
      } catch (error) {
        console.error('获取历史列表失败:', error);
      } finally {
        this.isLoadingHistory = false;
      }
    },
    
    /**
     * 切换侧边栏
     */
    toggleSessionList() {
      this.showSessionPanel = !this.showSessionPanel;
      if (this.showSessionPanel) {
        this.loadHistorySessions();
      }
    },
    
    // ==================== 消息发送与AI回复 ====================
    
    /**
     * 发送用户消息
     */
    sendMessage() {
      if (!this.inputMessage.trim()) return;
      if (this.isLoadingSession || this.isAiTyping) return;
      
      const userInput = this.inputMessage.trim();
      this.inputMessage = '';
      
      // 显示用户消息
      this.messages.push({
        type: 'user',
        content: userInput,
        timestamp: new Date().toISOString()
      });
      
      this.$nextTick(() => this.scrollToBottom());
      
      // 调AI接口
      this.getAIResponse(userInput);
    },
    
    /**
     * 调后端 /api/ai/chat — 多轮对话 + 会话持久化
     */
    async getAIResponse(userInput) {
      this.isAiTyping = true;
      this.$nextTick(() => this.scrollToBottom());
      
      try {
        const userInfo = uni.getStorageSync('userInfo') || {};
        const requestData = {
          userId: userInfo.phone || 'guest',
          message: userInput,
          historyMessages: this.sessionMessages
        };
        
        if (this.currentSessionId) {
          requestData.sessionId = this.currentSessionId;
        }
        
        const res = await request.post('/ai/chat', requestData);
        if (res.success && res.reply) {
          // 同步到sessionMessages（下次请求的上下文）
          if (this.currentSessionId) {
            this.sessionMessages.push({
              msgId: 'msg-' + Date.now(),
              timestamp: new Date().toISOString(),
              userContent: userInput,
              aiContent: res.reply
            });
          }
          
          // 显示AI回复
          this.messages.push({
            type: 'ai',
            content: res.reply,
            timestamp: new Date().toISOString()
          });
        } else {
          this.messages.push({
            type: 'ai',
            content: res.message || '抱歉，我暂时无法回应。'
          });
        }
      } catch (error) {
        console.error('AI回复失败:', error);
        this.messages.push({
          type: 'ai',
          content: '抱歉，网络出了点问题，请稍后再试吧。'
        });
      } finally {
        this.isAiTyping = false;
        this.$nextTick(() => this.scrollToBottom());
      }
    },
    
    // ==================== UI辅助方法 ====================
    
    scrollToBottom() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.chat-list').boundingClientRect(data => {
        if (data) this.scrollTop = data.height + 99999;
      }).exec();
    },
    
    hideKeyboard() {
      uni.hideKeyboard();
    },
    
    formatTime(isoStr) {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: () => {
          uni.showToast({ title: '图片发送功能开发中', icon: 'none' });
        }
      });
    },
    
    startVoiceInput() {
      uni.showToast({ title: '语音输入功能开发中', icon: 'none' });
    },
    
    switchTab(tabName) {
      if (tabName === 'companion') return;
      if (tabName === 'volunteer') {
        uni.showModal({
          title: '志愿者呼叫',
          content: '是否确认呼叫\n志愿者视频协助',
          confirmText: '确定',
          cancelText: '取消',
          confirmColor: '#FF8A65',
          cancelColor: '#A0A6AD',
          borderRadius: 40,
          success: async (res) => {
            if (!res.confirm) return;
            // #ifndef APP-PLUS
            uni.showToast({ title: '视频通话需在 App 端体验', icon: 'none', duration: 3000 });
            return;
            // #endif
            try {
              const userInfo = uni.getStorageSync('userInfo') || {};
              const userID = userInfo.phone || ('user_' + Date.now());
              const userName = userInfo.userName || userID;
              const { userSig } = genTestUserSig(userID);
              
              uni.$TUICallKit.login({
                SDKAppID: 1600134350,
                userID,
                userSig,
                success: () => {
                  uni.$TUICallKit.setSelfInfo({ nickName: userName, avatar: 'https://picsum.photos/200' });
                  uni.$TUICallKit.calls({
                    userIDList: ['denny'],
                    mediaType: 2
                  }, (callRes) => {
                    callRes.code === 0
                      ? uni.showToast({ title: '正在呼叫志愿者...', icon: 'success' })
                      : uni.showToast({ title: '呼叫失败', icon: 'none' });
                  });
                },
                fail: () => uni.showToast({ title: '登录失败，无法呼叫', icon: 'none' })
              });
            } catch (e) {}
          }
        });
        return;
      }
      if (tabName === 'manage') {
        uni.reLaunch({ url: '/pages/user/manage/index' });
      }
    },
    
    goToEmotionMonitor() {
      uni.navigateTo({ url: '/pages/user/emotion-monitor/index' });
    }
  }
};
</script>

<style>
.companion-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  position: relative; 
  overflow: hidden;
}

/* ========== 导航栏 ========== */
.navbar {
  height: 90rpx;
  background-color: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  position: relative;
  z-index: 20;
}

.nav-left {
  position: absolute;
  left: 24rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-left:active {
  background-color: rgba(255,255,255,0.15);
}

.nav-menu-icon {
  font-size: 36rpx;
  color: white;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.emotion-btn {
  position: absolute;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.emotion-btn:active { transform: scale(0.9); background-color: rgba(255,255,255,0.1); }

/* ========== 历史会话侧边栏 ========== */
.session-sidebar .session-panel {
  position: fixed;
  left: -320rpx;
  top: 90rpx;
  bottom: 100rpx;
  width: 300rpx;
  background: rgba(255,255,255,0.95);
  border-radius: 0 24rpx 24rpx 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  box-shadow: 4rpx 0 20rpx rgba(0,0,0,0.15);
  transition: left 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

.session-sidebar.show .session-panel {
  left: 0;
}

.sidebar-mask {
  position: fixed;
  left: 0;
  top: 90rpx;
  bottom: 100rpx;
  width: 750rpx;
  background: rgba(0,0,0,0.3);
  z-index: 45;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx 16rpx;
  border-bottom: 1rpx solid rgba(0,0,0,0.06);
}

.panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.panel-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 28rpx;
  color: #636E72;
}
.panel-close:active { background-color: rgba(0,0,0,0.05); }

/* 新建对话按钮 */
.new-session-btn {
  margin: 16rpx 20rpx;
  padding: 18rpx 24rpx;
  background: linear-gradient(90deg, #FF8A65, #E64A19);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}
.new-session-btn text {
  font-size: 28rpx;
  font-weight: 500;
  color: white;
}
.new-session-btn:active { opacity: 0.85; }

/* 会话滚动区 */
.session-list-scroll {
  flex: 1;
  overflow: hidden;
}

.loading-tip, .empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 20rpx;
  color: #a0a6ad;
  font-size: 26rpx;
}
.empty-list text:first-child { font-size: 28rpx; margin-bottom: 8rpx; color: #636E72; }
.empty-sub { font-size: 24rpx; }

/* 会话列表项 */
.session-item {
  display: flex;
  align-items: center;
  padding: 22rpx 20rpx;
  border-bottom: 1rpx solid rgba(0,0,0,0.04);
  transition: background 0.15s;
}
.session-item:active { background-color: rgba(230,74,25,0.08); }
.session-item.active { background-color: rgba(230,74,25,0.12); border-left: 6rpx solid #E64A19; }

.session-item-info { flex: 1; overflow: hidden; min-width: 0; }
.session-item-title {
  font-size: 27rpx;
  color: #2D3436;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
.session-item-time {
  font-size: 22rpx;
  color: #a0a6ad;
  display: block;
  margin-top: 4rpx;
}

.session-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 26rpx;
  opacity: 0.5;
}
.session-delete:active { opacity: 1; }

/* ========== 聊天区域 ========== */
.chat-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  padding: 20rpx 25rpx;
  overflow-y: auto;
  box-sizing: border-box;
  width: 100%;
}

.chat-list {
  padding-bottom: 30rpx;
  min-height: 200rpx;
}

.bottom-spacer { height: 10rpx; }

/* 加载动画 */
.chat-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}
.loading-dots {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.loading-dots .dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: white;
  animation: bounce 1.4s infinite ease-in-out both;
}
.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.loading-text {
  font-size: 26rpx;
  color: rgba(255,255,255,0.7);
}

/* ========== 消息样式 ========== */
.message {
  display: flex;
  margin-bottom: 24rpx;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.ai-message {
  justify-content: flex-start;
  align-items: flex-start;
  padding-right: 12%;
}

.user-message {
  justify-content: flex-end;
  padding-left: 12%;
  padding-right: 20rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 10rpx;
}

.ai-avatar {
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  margin-right: 12rpx;
}

.message-content {
  max-width: 100%;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  position: relative;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.08);
  background-color: rgba(255,255,255,0.75);
  color: #2D3436;
  word-break: break-all;
  border-radius: 22rpx;
}

.ai-content::before {
  content: '';
  position: absolute;
  left: -8rpx;
  top: 20rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: rgba(255,255,255,0.75);
  transform: rotate(45deg);
  z-index: -1;
}

/* 打字指示器 */
.typing-indicator {
  padding: 20rpx 32rpx;
  min-width: 80rpx;
}
.typing-dots {
  display: inline-flex;
  gap: 8rpx;
}
.typing-dots span {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #a0a6ad;
  animation: typingBounce 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.16s; }
.typing-dots span:nth-child(3) { animation-delay: 0.32s; }
@keyframes typingBounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-8rpx); opacity: 1; }
}

/* ========== 输入区域 ========== */
.input-area {
  padding: 16rpx 20rpx;
  background-color: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(255,255,255,0.9);
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
}

.message-input {
  flex: 1;
  height: 70rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #2D3436;
}
.message-input[disabled] { opacity: 0.5; }

.input-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.action-btn:active { transform: scale(0.88); background-color: rgba(255,255,255,0.15); }

.send-btn {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(90deg, #FF8A65, #E64A19);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
  transition: all 0.2s;
}
.send-btn:active { transform: scale(0.92); }
.send-btn.disabled { opacity: 0.35; pointer-events: none; }

/* ========== 底部导航栏 ========== */
.tabbar {
  height: 100rpx;
  background-color: rgba(255,255,255,0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  border-top: 1rpx solid rgba(255,255,255,0.3);
  z-index: 90;
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: rgba(255,255,255,0.8);
}

.tab-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  line-height: 40rpx;
}

.tab-content icon-svg { margin-right: 8rpx; }
.tab-content text { line-height: 40rpx; display: inline-flex; align-items: center; }
.tab-item.active { color: #ffffff; font-weight: 500; }

.center-btn {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(145deg, #FF8A65, #E64A19);
  border-radius: 50%;
  position: fixed;
  left: 50%;
  bottom: 10rpx;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(255,138,101,0.3);
  z-index: 100;
}
</style>
