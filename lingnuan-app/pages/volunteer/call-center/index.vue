<template>
  <view class="call-center-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">通话中心</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 待处理请求列表 -->
      <view class="section-header">
        <text class="section-title">待处理请求</text>
        <text class="section-count">{{ pendingRequests.length }}个</text>
      </view>
      
      <view class="call-list">
        <view 
          v-for="(request, index) in pendingRequests" 
          :key="request.id" 
          class="call-item"
          :class="{'active': activeCallIndex === index}"
        >
          <view class="call-item-left">
            <image class="caller-avatar" :src="request.avatar" mode="aspectFill"></image>
            <view class="caller-info">
              <view class="caller-name-row">
                <text class="caller-name">{{ request.name }}</text>
                <text class="caller-age">{{ request.age }}岁</text>
              </view>
              <text class="call-time">{{ formatTime(request.timestamp) }}</text>
            </view>
          </view>
          
          <view class="call-item-right">
            <button 
              class="answer-btn" 
              :class="{'in-call': activeCallIndex !== null && activeCallIndex !== index}"
              :disabled="request.status !== 'pending' || activeCallIndex !== null"
              @tap="answerCall(index)"
            >
              {{ activeCallIndex !== null && activeCallIndex !== index ? '通话中' : '接听' }}
            </button>
          </view>
        </view>
        
        <view v-if="pendingRequests.length === 0" class="empty-state">
          <icon-svg name="icon-phone" size="large" color="rgba(255,255,255,0.3)" class="empty-icon"></icon-svg>
          <text class="empty-text">暂无待处理请求</text>
        </view>
      </view>
      
      <!-- 当前通话控制区域 -->
      <view v-if="activeCallIndex !== null" class="active-call-controls">
        <view class="active-call-info">
          <text class="active-call-title">当前通话</text>
          <text class="active-call-name">{{ pendingRequests[activeCallIndex]?.name }}</text>
        </view>
        
        <!-- 视频通话界面 -->
        <view class="video-call-container">
          <view class="video-placeholder" v-if="!showVideo">
            <view class="video-placeholder-content">
              <icon-svg name="icon-video-off" size="normal" color="#fff" class="video-placeholder-icon"></icon-svg>
              <text class="video-placeholder-text">视频未开启</text>
            </view>
            
            <!-- 麦克风状态指示器 -->
            <view class="mic-status" v-if="!isMuted">
              <view class="status-indicator status-connected"></view>
              <text>麦克风开启</text>
            </view>
          </view>
          <view class="video-frame" v-else>
            <!-- 【后端接口】视频画面接入 -->
            <view class="remote-video" id="remoteVideo"></view>
            <view class="local-video" id="localVideo"></view>
            
            <!-- 视频状态指示器 -->
            <view class="video-status" v-if="videoConnection">
              <view class="status-indicator" :class="videoStatusClass"></view>
              <text>{{ videoStatusText }}</text>
            </view>
            
            <!-- 麦克风状态指示器 -->
            <view class="mic-status" v-if="!isMuted">
              <view class="status-indicator status-connected"></view>
              <text>麦克风开启</text>
            </view>
          </view>
          <view class="video-controls">
            <view class="video-btn" :class="{'active': showVideo}" @tap="toggleVideo">
              <icon-svg :name="showVideo ? 'icon-video' : 'icon-video-off'" size="normal" color="#fff"></icon-svg>
              <text>{{ showVideo ? '关闭视频' : '开启视频' }}</text>
            </view>
            <view class="video-btn" :class="{'active': isMuted}" @tap="toggleMute">
              <icon-svg :name="isMuted ? 'icon-mic-off' : 'icon-mic'" size="normal" color="#fff"></icon-svg>
              <text>{{ isMuted ? '取消静音' : '静音' }}</text>
            </view>
            <view class="video-btn history-btn" @tap="viewHistory">
              <icon-svg name="icon-history" size="normal" color="#FFAB91"></icon-svg>
              <text>查看历史</text>
            </view>
            <view class="video-btn end-call-btn" @tap="endCall">
              <icon-svg name="icon-end-call" size="normal" color="#EF5350"></icon-svg>
              <text>通话结束</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tab-item active" @tap="switchTab('call-center')">
        <view class="tab-content">
          <icon-svg name="icon-phone" size="normal" color="white" class="call-center-icon"></icon-svg>
          <text>通话中心</text>
        </view>
      </view>
      
      <view class="tab-item" @tap="switchTab('community')">
        <view class="tab-content">
          <icon-svg name="icon-topic" size="normal" color="gray"></icon-svg>
          <text>社区</text>
        </view>
      </view>
      
      <view class="tab-item" @tap="switchTab('manage')">
        <view class="tab-content">
          <icon-svg name="icon-settings" size="normal" color="gray"></icon-svg>
          <text>管理中心</text>
        </view>
      </view>
    </view>
    
    <!-- 历史记录弹窗 -->
    <view v-if="showHistoryModal" class="modal-overlay" @tap="closeHistoryModal">
      <view class="history-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ pendingRequests[activeCallIndex]?.name }} 的通话记录</text>
          <view class="close-btn" @tap="closeHistoryModal">×</view>
        </view>
        <view class="modal-content">
          <view v-for="(record, idx) in callHistory" :key="idx" class="history-item">
            <view class="history-date">{{ formatDate(record.date) }}</view>
            <view class="history-content">
              <text class="history-duration">通话时长: {{ record.duration }}</text>
              <text class="history-notes">{{ record.notes }}</text>
            </view>
          </view>
          <view v-if="callHistory.length === 0" class="empty-history">
            <text>暂无历史记录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// TODO: [后端接口] 获取待处理请求列表
// 实现接口: GET /api/call-center/pending-requests
// 以下为模拟数据，后端实现后移除
const pendingRequests = ref([
  {
    id: '001',
    name: '张阿姨',
    age: 78,
    avatar: '/static/avatars/avatar1.svg',
    timestamp: Date.now() - 120000,
    status: 'pending'
  },
  {
    id: '002',
    name: '李爷爷',
    age: 82,
    avatar: '/static/avatars/avatar2.svg',
    timestamp: Date.now() - 300000,
    status: 'pending'
  },
  {
    id: '003',
    name: '王奶奶',
    age: 75,
    avatar: '/static/avatars/avatar3.svg',
    timestamp: Date.now() - 600000,
    status: 'pending'
  }
]);

// TODO: [后端接口] 获取通话历史记录
// 实现接口: GET /api/call-center/call-history?userId=xxx
// 以下为模拟数据，后端实现后移除
const callHistory = ref([
  {
    date: new Date(Date.now() - 86400000 * 2),
    duration: '5分36秒',
    notes: '询问如何使用手机支付功能，已指导完成'
  },
  {
    date: new Date(Date.now() - 86400000 * 5),
    duration: '3分12秒',
    notes: '反馈社区活动参与情况，表示很满意'
  },
  {
    date: new Date(Date.now() - 86400000 * 8),
    duration: '7分45秒',
    notes: '需要帮助预约挂号，已协助完成'
  }
]);

// 当前活跃通话索引
// 用于跟踪当前是否有活跃通话，并禁止多线程通话
const activeCallIndex = ref(null);

// 是否显示历史记录弹窗
const showHistoryModal = ref(false);

// 视频通话相关状态
const showVideo = ref(true); // 默认开启视频
const isMuted = ref(false);
// TODO: [后端接口] 视频通话连接对象
// 实现接口: POST /api/video-call/init 和 POST /api/video-call/status
const videoConnection = ref(null);

// 视频状态文本
const videoStatusText = computed(() => {
  if (!videoConnection.value) return '';
  
  switch (videoConnection.value.status) {
    case 'initialized':
      return '准备就绪';
    case 'connecting':
      return '正在连接...';
    case 'connected':
      return '视频通话中';
    case 'paused':
      return '视频已暂停';
    case 'error':
      return '连接错误';
    default:
      return '未知状态';
  }
});

// 视频状态样式类
const videoStatusClass = computed(() => {
  if (!videoConnection.value) return '';
  
  switch (videoConnection.value.status) {
    case 'initialized':
      return 'status-ready';
    case 'connecting':
      return 'status-connecting';
    case 'connected':
      return 'status-connected';
    case 'paused':
      return 'status-paused';
    case 'error':
      return 'status-error';
    default:
      return '';
  }
});

// 格式化时间戳为相对时间
const formatTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};

// 格式化日期
const formatDate = (date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 接听电话
// 当接听一个通话时，其他通话请求将被禁用，以防止多线程通话
const answerCall = (index) => {
  // 只有当没有活跃通话时才能接听新通话
  activeCallIndex.value = index;
  pendingRequests.value[index].status = 'active';
  
  // TODO: [后端接口] 初始化视频通话
  // 实现接口: POST /api/call-center/answer-call
  initVideoCall(pendingRequests.value[index].id);
  
  isMuted.value = false;
  startVideo();
};

// 结束通话
const endCall = () => {
  if (activeCallIndex.value !== null) {
    // TODO: [后端接口] 关闭视频通话
    // 实现接口: POST /api/call-center/end-call
    closeVideoCall();
    
    // TODO: [后端接口] 保存通话记录
    // 实现接口: POST /api/video-call/save-record
    // 参数: { "callId": "通话ID", "duration": "通话时长(秒)", "notes": "通话备注", "userId": "用户ID", "volunteerId": "志愿者ID" }
    pendingRequests.value.splice(activeCallIndex.value, 1);
    activeCallIndex.value = null;
  }
};

// 查看历史记录
const viewHistory = () => {
  showHistoryModal.value = true;
};

// 关闭历史记录弹窗
const closeHistoryModal = () => {
  showHistoryModal.value = false;
};

// 切换标签页
const switchTab = (tabName) => {
  if (tabName === 'call-center') {
    // 当前已在通话中心页面
    return;
  } else if (tabName === 'community') {
    // 跳转到社区页面
    uni.reLaunch({
      url: '/pages/volunteer/community/index'
    });
  } else if (tabName === 'manage') {
    // 跳转到管理中心页面
    uni.reLaunch({
      url: '/pages/volunteer/manage/index'
    });
  }
};

// TODO: [后端接口] 初始化视频通话
const initVideoCall = (callId) => {
  console.log('初始化视频通话接口，通话ID:', callId);
  // 视频通话初始化逻辑，后端实现后移除
  videoConnection.value = {
    id: callId,
    status: 'initialized',
  };
};

// 切换视频通话界面
const toggleVideo = () => {
  showVideo.value = !showVideo.value;
  
  if (showVideo.value) {
    startVideo();
  } else {
    pauseVideo();
  }
};

// 切换静音状态
const toggleMute = () => {
  isMuted.value = !isMuted.value;
  
  // TODO: [后端接口] 静音控制
  // 实现接口: POST /api/video-call/control
  // 参数: { "callId": "通话ID", "action": "mute/unmute", "timestamp": "操作时间戳" }
};

// 开启视频
const startVideo = () => {
  // TODO: [后端接口] 开启视频
  // 实现接口: POST /api/video-call/control
  // 参数: { "callId": "通话ID", "action": "resume", "timestamp": "操作时间戳" }
  if (videoConnection.value) {
    videoConnection.value.status = 'connected';
  }
};

// 暂停视频
const pauseVideo = () => {
  // TODO: [后端接口] 暂停视频
  // 实现接口: POST /api/video-call/control
  // 参数: { "callId": "通话ID", "action": "pause", "timestamp": "操作时间戳" }
  if (videoConnection.value) {
    videoConnection.value.status = 'paused';
  }
};

// 关闭视频通话
const closeVideoCall = () => {
  // TODO: [后端接口] 关闭视频通话
  // 实现接口: POST /api/video-call/status
  if (videoConnection.value) {
    videoConnection.value.status = 'closed';
    videoConnection.value = null;
  }
};

// 组件挂载时初始化
onMounted(() => {
  videoConnection.value = {
    id: null,
    status: 'initialized'
  };
  
  isMuted.value = false;
  
  if (activeCallIndex.value !== null) {
    initVideoCall(pendingRequests.value[activeCallIndex.value].id);
    startVideo();
  }
});

onBeforeUnmount(() => {
  closeVideoCall();
});
</script>

<style>
/* 通话中心页样式 */
.call-center-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #66BB6A 0%, #A5D6A7 40%, #2E7D32 100%);
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 顶部导航栏 */
.navbar {
  height: 90rpx;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20rpx 24rpx;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: 100vw;
}

/* 区域标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 20rpx;
  padding: 0 6rpx;
  width: 100%;
  max-width: 750rpx;
  box-sizing: border-box;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.section-count {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

/* 通话列表 */
.call-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin: 0 auto 30rpx;
  width: 100%;
  max-width: 750rpx;
  align-items: center;
}

.call-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 0 auto;
  width: 100%;
  max-width: 750rpx;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.call-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 6px rgba(45, 52, 54, 0.1);
  transform: scale(1.01);
  border-left: 4rpx solid rgba(255, 255, 255, 0.8);
}

.call-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  overflow: hidden;
}

.caller-avatar {
  width: 80rpx;
  height: 80rpx;
  min-width: 80rpx;
  border-radius: 50%;
  background-color: #E8E0D8;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  object-fit: cover;
}

.caller-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  overflow: hidden;
  flex: 1;
}

.caller-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.caller-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.caller-age {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

.call-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.call-item-right {
  display: flex;
  align-items: center;
  margin-left: 10rpx;
}

.answer-btn {
  background-color: #66BB6A;
  color: white;
  border: none;
  border-radius: 30rpx;
  padding: 12rpx 30rpx;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.answer-btn:disabled {
  background-color: #9E9E9E;
  opacity: 0.6;
}

.answer-btn[disabled]:not(.in-call) {
  background-color: #9E9E9E;
  opacity: 0.6;
}

.answer-btn[disabled].in-call {
  background-color: #FF5722;
  opacity: 0.8;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  transform: scale(1.2);
  margin-bottom: 10rpx;
}

/* 当前通话控制区域 */
.active-call-controls {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16rpx;
  padding: 16rpx 16rpx 10rpx;
  margin: 15rpx auto 0;
  width: 100%;
  max-width: 750rpx;
  box-sizing: border-box;
}

.active-call-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 12rpx;
}

.active-call-title {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.active-call-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 视频通话界面 */
.video-call-container {
  margin: 30rpx 0 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 0;
  padding-bottom: 177.78%; 
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  position: relative;
  max-height: none; 
}

.video-placeholder-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-placeholder-icon {
  transform: scale(1.8);
  margin-bottom: 30rpx; 
  opacity: 0.7;
}

.video-placeholder-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30rpx;
}

.video-frame {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 177.78%; 
  overflow: hidden;
  background-color: #1a1a1a;
  max-height: none; 
}

.remote-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #2a2a2a;
}

.local-video {
  position: absolute;
  top: 5%;
  right: 5%;
  width: 180rpx;
  height: 240rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #3a3a3a;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.video-controls {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 5rpx;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom-left-radius: 16rpx;
  border-bottom-right-radius: 16rpx;
}

.video-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 10rpx;
  width: 22%; 
  border-radius: 12rpx;
  transition: all 0.2s ease;
}

.video-btn:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.video-btn text {
  font-size: 22rpx;
  color: #ffffff;
  text-align: center;
  width: 100%;
}

.video-btn icon-svg {
  margin-bottom: 6rpx;
}

.video-btn.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.history-btn icon-svg {
  color: #FFAB91;
}

.end-call-btn icon-svg {
  color: #EF5350;
}

/* 历史记录弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.history-modal {
  width: 85%;
  max-height: 80%;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #2E7D32;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #ffffff;
  cursor: pointer;
}

.modal-content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

.history-item {
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #E8E0D8;
}

.history-date {
  font-size: 26rpx;
  color: #757575;
  margin-bottom: 10rpx;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.history-duration {
  font-size: 28rpx;
  color: #424242;
}

.history-notes {
  font-size: 26rpx;
  color: #616161;
  line-height: 1.5;
}

.empty-history {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  color: #9E9E9E;
  font-size: 28rpx;
}

/* 底部导航栏 */
.tabbar {
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 90;
}

.tab-item {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.tab-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 40rpx; 
  line-height: 40rpx; 
}

.tab-content icon-svg {
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40rpx; 
}

.call-center-icon {
  transform: scale(0.9);
  margin-top: -2rpx;
}

.tab-content text {
  height: 40rpx;
  line-height: 40rpx;
  display: inline-flex;
  align-items: center;
}

.tab-item.active {
  color: #ffffff;
  font-weight: 500;
}

/* 状态指示器区域 */
.status-indicators {
  display: none;
}

/* 视频状态指示器 */
.video-status {
  position: absolute;
  top: 5%;
  left: 5%;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  gap: 10rpx;
}

.video-status text {
  font-size: 26rpx; 
  color: #ffffff;
}

/* 麦克风状态指示器 */
.mic-status {
  position: absolute;
  top: calc(5% + 65rpx);
  left: 5%;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  gap: 10rpx;
}

.mic-status text {
  color: #ffffff;
  font-size: 26rpx;
}

.video-placeholder .mic-status {
  position: absolute;
  top: auto;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
}

.status-indicator {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #9E9E9E;
}

.status-ready {
  background-color: #FFC107;
}

.status-connecting {
  background-color: #FFC107;
  animation: blink 1s infinite;
}

.status-connected {
  background-color: #66BB6A;
}

.status-paused {
  background-color: #FF9800;
}

.status-error {
  background-color: #E74C3C;
}

@keyframes blink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style> 