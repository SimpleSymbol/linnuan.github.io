<template>
  <view class="video-call-container">
    <!-- 视频通话界面 -->
    <view class="video-frame" v-if="showVideo">
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
      
      <!-- 圆形挂断按钮 -->
      <view class="end-call-btn" @tap="endCall">
        <icon-svg name="icon-end-call" size="normal" color="#ffffff"></icon-svg>
      </view>
    </view>
    
    <!-- 视频未开启时的占位符 -->
    <view class="video-placeholder" v-else>
      <view class="video-placeholder-content">
        <icon-svg name="icon-video-off" size="normal" color="#fff" class="video-placeholder-icon"></icon-svg>
        <text class="video-placeholder-text">视频未开启</text>
      </view>
      
      <!-- 麦克风状态指示器 -->
      <view class="mic-status" v-if="!isMuted">
        <view class="status-indicator status-connected"></view>
        <text>麦克风开启</text>
      </view>
      
      <!-- 挂断按钮 -->
      <view class="end-call-btn" @tap="endCall">
        <icon-svg name="icon-end-call" size="normal" color="#ffffff"></icon-svg>
      </view>
    </view>
    
    <!-- 通话等待提示框 -->
    <view class="waiting-indicator" v-if="isWaiting">
      <view class="waiting-content">
        <view class="waiting-pulse"></view>
        <text class="waiting-text">正在等待志愿者接听</text>
        <text class="waiting-time">已等待 {{ waitingTime }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 视频通话相关状态
const showVideo = ref(true); // 默认开启视频
const isMuted = ref(false);
// TODO: [后端接口] 视频通话连接对象
// 实现接口: POST /api/video-call/init
const videoConnection = ref(null);
const isWaiting = ref(true); // 是否正在等待接听
const waitingTime = ref('00:00'); // 等待时间
let waitingTimer = null; // 等待计时器
let waitingSeconds = 0; // 等待秒数

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

// 更新等待时间
const updateWaitingTime = () => {
  waitingSeconds++;
  const minutes = Math.floor(waitingSeconds / 60);
  const seconds = waitingSeconds % 60;
  waitingTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 开始等待计时
const startWaitingTimer = () => {
  waitingSeconds = 0;
  waitingTimer = setInterval(updateWaitingTime, 1000);
};

// 停止等待计时
const stopWaitingTimer = () => {
  if (waitingTimer) {
    clearInterval(waitingTimer);
    waitingTimer = null;
  }
};

// 结束通话
const endCall = () => {
  // TODO: [后端接口] 关闭视频通话
  // 实现接口: POST /api/video-call/status
  closeVideoCall();
  
  // 返回到首页
  uni.reLaunch({
    url: '/pages/user/home/index'
  });
};

// TODO: [后端接口] 初始化视频通话
// 实现接口: POST /api/video-call/init 和 POST /api/video-call/request
const initVideoCall = () => {
  console.log('初始化视频通话接口');
  // 视频通话初始化逻辑，后端实现后移除
  videoConnection.value = {
    status: 'initialized',
  };
  
  // 以下为模拟连接过程，后端实现后移除
  setTimeout(() => {
    if (videoConnection.value) {
      videoConnection.value.status = 'connecting';
    }
  }, 1000);
  
  // 以下为模拟连接成功，后端实现后移除
  // 志愿者接听后回调
  setTimeout(() => {
    if (videoConnection.value) {
      videoConnection.value.status = 'connected';
      isWaiting.value = false;
      stopWaitingTimer();
    }
  }, 5000);
};

// TODO: [后端接口] 关闭视频通话
// 实现接口: POST /api/video-call/status
const closeVideoCall = () => {
  if (videoConnection.value) {
    console.log('关闭视频通话');
    
    videoConnection.value.status = 'closed';
    videoConnection.value = null;
    showVideo.value = false;
    isMuted.value = false;
    isWaiting.value = false;
    stopWaitingTimer();
  }
};

// 组件挂载时初始化
onMounted(() => {
  initVideoCall();
  startWaitingTimer();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  closeVideoCall();
  stopWaitingTimer();
});
</script>

<style>
/* 视频通话页面样式 */
.video-call-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000000;
  position: relative;
  overflow: hidden;
}

/* 视频框架 */
.video-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1a1a1a;
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

/* 视频占位符 */
.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  position: relative;
}

.video-placeholder-content {
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

/* 圆形挂断按钮 */
.end-call-btn {
  position: absolute;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #E74C3C;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.end-call-btn:active {
  background-color: #D32F2F;
  transform: translateX(-50%) scale(0.95);
}

/* 状态指示器 */
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
  background-color: #FF8A65;
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

/* 通话等待提示框 */
.waiting-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 138, 101, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.waiting-pulse {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: rgba(255, 138, 101, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.waiting-pulse::before {
  content: '';
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: rgba(255, 138, 101, 0.5);
}

.waiting-pulse::after {
  content: '';
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 138, 101, 0.8);
  animation: pulse 1.5s infinite;
}

.waiting-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}

.waiting-time {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

@keyframes blink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
</style> 