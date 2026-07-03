<template>
  <view class="dialect-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-btn" @tap="goBack">
        <icon-svg name="icon-back" size="normal" color="white"></icon-svg>
      </view>
      <text class="navbar-title">方言/声纹录入</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 录入标题区域 -->
      <view class="record-header">
        <view class="header-icon">
          <icon-svg name="icon-mic" size="large" color="white"></icon-svg>
        </view>
        <text class="header-title">方言/声纹录入</text>
      </view>
      
      <!-- 录入指南 -->
      <view class="guide-section">
        <text class="guide-title">录入指南</text>
        <view class="guide-content">
          <text class="guide-text">1. 请在安静环境下进行录音</text>
          <text class="guide-text">2. 请清晰朗读下方文本内容</text>
          <text class="guide-text">3. 录音完成后系统将自动保存</text>
        </view>
      </view>
      
      <!-- 方言录入区域 -->
      <view class="record-section">
        <view class="section-title">
          <text>方言录入</text>
          <view class="status-tag" :class="{'completed': dialectRecorded}">
            {{ dialectRecorded ? '已完成' : '未完成' }}
          </view>
        </view>
        
        <view class="record-card">
          <view class="text-to-read">
            <text class="text-content">天气真好，我们一起去公园散步吧。今天是个好日子，阳光明媚，微风不燥。</text>
          </view>
          
          <view class="record-controls">
            <view class="record-btn" :class="{'recording': isRecordingDialect}" @tap="handleDialectRecord">
              <icon-svg :name="isRecordingDialect ? 'icon-mic-off' : 'icon-mic'" size="large" color="white"></icon-svg>
            </view>
            <text class="record-tip">{{ isRecordingDialect ? '点击停止录音' : '点击开始录音' }}</text>
          </view>
          
          <view v-if="dialectAudioPath" class="audio-player">
            <view class="play-btn" @tap="playDialectAudio">
              <icon-svg name="icon-phone" size="normal" color="white"></icon-svg>
            </view>
            <text class="play-text">播放录音</text>
          </view>
        </view>
      </view>
      
      <!-- 声纹录入区域 -->
      <view class="record-section">
        <view class="section-title">
          <text>声纹录入</text>
          <view class="status-tag" :class="{'completed': voiceprintRecorded}">
            {{ voiceprintRecorded ? '已完成' : '未完成' }}
          </view>
        </view>
        
        <view class="record-card">
          <view class="text-to-read">
            <text class="text-content">我确认授权使用我的声纹信息进行身份验证，这是我的专属声纹。</text>
          </view>
          
          <view class="record-controls">
            <view class="record-btn" :class="{'recording': isRecordingVoiceprint}" @tap="handleVoiceprintRecord">
              <icon-svg :name="isRecordingVoiceprint ? 'icon-mic-off' : 'icon-mic'" size="large" color="white"></icon-svg>
            </view>
            <text class="record-tip">{{ isRecordingVoiceprint ? '点击停止录音' : '点击开始录音' }}</text>
          </view>
          
          <view v-if="voiceprintAudioPath" class="audio-player">
            <view class="play-btn" @tap="playVoiceprintAudio">
              <icon-svg name="icon-phone" size="normal" color="white"></icon-svg>
            </view>
            <text class="play-text">播放录音</text>
          </view>
        </view>
      </view>
      
      <!-- 提交按钮 -->
      <view class="submit-section">
        <view class="submit-btn" :class="{'disabled': !canSubmit}" @tap="handleSubmit">
          <text>提交</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 录音状态
const isRecordingDialect = ref(false);
const isRecordingVoiceprint = ref(false);

// 录音完成状态
const dialectRecorded = ref(false);
const voiceprintRecorded = ref(false);

// 录音文件路径
const dialectAudioPath = ref('');
const voiceprintAudioPath = ref('');

// 录音实例
let recorderManager = null;
let currentRecordType = ''; // 'dialect' 或 'voiceprint'

// 计算是否可以提交
const canSubmit = computed(() => {
  return dialectRecorded.value && voiceprintRecorded.value;
});

// 页面加载时初始化
onMounted(() => {
  // 检查是否已有录音数据
  checkExistingRecords();
  
  // 初始化录音管理器
  initRecorders();
  
  // 监听页面隐藏事件
  uni.onAppHide(() => {
    stopAllRecordings();
  });
});

// 页面卸载前清理
onBeforeUnmount(() => {
  stopAllRecordings();
});

// 停止所有录音
const stopAllRecordings = () => {
  if (isRecordingDialect.value || isRecordingVoiceprint.value) {
    try {
      recorderManager.stop();
      console.log('页面卸载，停止所有录音');
    } catch (e) {
      console.error('停止录音失败', e);
    }
    
    isRecordingDialect.value = false;
    isRecordingVoiceprint.value = false;
  }
};

// 检查已有录音数据
const checkExistingRecords = () => {
  try {
    // TODO: [后端接口] 获取用户已有的方言和声纹录音
    // 实现接口: GET /api/user/dialect-voiceprint
    
    // 以下为模拟数据，后端实现后移除
    setTimeout(() => {
      // 使用固定值而不是随机值，确保状态一致
      const hasData = false; // 默认为未完成状态
      if (hasData) {
        dialectRecorded.value = true;
        voiceprintRecorded.value = true;
        dialectAudioPath.value = 'mock_dialect_audio_path';
        voiceprintAudioPath.value = 'mock_voiceprint_audio_path';
      }
    }, 500);
  } catch (e) {
    console.error('获取录音数据失败', e);
    uni.showToast({
      title: '获取录音数据失败',
      icon: 'none'
    });
  }
};

// 初始化录音管理器
const initRecorders = () => {
  // 获取全局唯一的录音管理器实例
  recorderManager = uni.getRecorderManager();
  
  // 录音结束事件
  recorderManager.onStop((res) => {
    console.log('录音停止事件触发', res);
    if (res && res.tempFilePath) {
      if (currentRecordType === 'dialect') {
        // 保存临时文件路径
        dialectAudioPath.value = res.tempFilePath;
        dialectRecorded.value = true;
        isRecordingDialect.value = false;
        
        // TODO: [后端接口] 上传方言录音文件
        // 实现接口: POST /api/user/dialect-upload
        
        uni.showToast({
          title: '方言录音完成',
          icon: 'success'
        });
      } else if (currentRecordType === 'voiceprint') {
        // 保存临时文件路径
        voiceprintAudioPath.value = res.tempFilePath;
        voiceprintRecorded.value = true;
        isRecordingVoiceprint.value = false;
        
        // TODO: [后端接口] 上传声纹录音文件
        // 实现接口: POST /api/user/voiceprint-upload
        
        uni.showToast({
          title: '声纹录音完成',
          icon: 'success'
        });
      }
    } else {
      // 处理没有返回tempFilePath的情况
      if (currentRecordType === 'dialect') {
        isRecordingDialect.value = false;
      } else if (currentRecordType === 'voiceprint') {
        isRecordingVoiceprint.value = false;
      }
      
      uni.showToast({
        title: '录音未能正确保存',
        icon: 'none'
      });
    }
  });
  
  // 录音开始事件
  recorderManager.onStart(() => {
    console.log('录音开始事件触发');
  });
  
  // 录音错误事件
  recorderManager.onError((err) => {
    console.error('录音错误', err);
    
    if (currentRecordType === 'dialect') {
      isRecordingDialect.value = false;
      uni.showToast({
        title: '方言录音失败: ' + (err.errMsg || '未知错误'),
        icon: 'none'
      });
    } else if (currentRecordType === 'voiceprint') {
      isRecordingVoiceprint.value = false;
      uni.showToast({
        title: '声纹录音失败: ' + (err.errMsg || '未知错误'),
        icon: 'none'
      });
    }
  });
};

// 处理方言录音
const handleDialectRecord = () => {
  if (isRecordingDialect.value) {
    // 停止录音
    console.log('停止方言录音');
    currentRecordType = 'dialect';
    try {
      recorderManager.stop();
      // 添加一个备用方案，防止onStop事件不触发
      setTimeout(() => {
        if (isRecordingDialect.value) {
          isRecordingDialect.value = false;
          uni.showToast({
            title: '录音已停止',
            icon: 'none'
          });
        }
      }, 500);
    } catch (e) {
      console.error('停止录音失败', e);
      isRecordingDialect.value = false;
    }
  } else {
    // 确保另一个录音已停止
    if (isRecordingVoiceprint.value) {
      uni.showToast({
        title: '请先停止声纹录音',
        icon: 'none'
      });
      return;
    }
    
    // 开始录音
    currentRecordType = 'dialect';
    isRecordingDialect.value = true;
    
    // 请求录音权限
    uni.authorize({
      scope: 'scope.record',
      success: () => {
        // 确保设置正确的录音参数
        const options = {
          duration: 60000, // 最长录音时间，单位ms
          sampleRate: 16000, // 采样率
          numberOfChannels: 1, // 录音通道数
          encodeBitRate: 96000, // 编码码率
          format: 'mp3', // 音频格式
          frameSize: 50 // 指定帧大小
        };
        
        try {
          recorderManager.start(options);
          console.log('开始方言录音');
          
          uni.showToast({
            title: '开始方言录音',
            icon: 'none'
          });
        } catch (e) {
          console.error('开始录音失败', e);
          isRecordingDialect.value = false;
          uni.showToast({
            title: '开始录音失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        isRecordingDialect.value = false;
        uni.showModal({
          title: '提示',
          content: '需要您授权录音权限才能进行录音',
          showCancel: false
        });
      }
    });
  }
};

// 处理声纹录音
const handleVoiceprintRecord = () => {
  if (isRecordingVoiceprint.value) {
    // 停止录音
    console.log('停止声纹录音');
    currentRecordType = 'voiceprint';
    try {
      recorderManager.stop();
      // 添加一个备用方案，防止onStop事件不触发
      setTimeout(() => {
        if (isRecordingVoiceprint.value) {
          isRecordingVoiceprint.value = false;
          uni.showToast({
            title: '录音已停止',
            icon: 'none'
          });
        }
      }, 500);
    } catch (e) {
      console.error('停止录音失败', e);
      isRecordingVoiceprint.value = false;
    }
  } else {
    // 确保另一个录音已停止
    if (isRecordingDialect.value) {
      uni.showToast({
        title: '请先停止方言录音',
        icon: 'none'
      });
      return;
    }
    
    // 开始录音
    currentRecordType = 'voiceprint';
    isRecordingVoiceprint.value = true;
    
    // 请求录音权限
    uni.authorize({
      scope: 'scope.record',
      success: () => {
        // 确保设置正确的录音参数
        const options = {
          duration: 60000, // 最长录音时间，单位ms
          sampleRate: 16000, // 采样率
          numberOfChannels: 1, // 录音通道数
          encodeBitRate: 96000, // 编码码率
          format: 'mp3', // 音频格式
          frameSize: 50 // 指定帧大小
        };
        
        try {
          recorderManager.start(options);
          console.log('开始声纹录音');
          
          uni.showToast({
            title: '开始声纹录音',
            icon: 'none'
          });
        } catch (e) {
          console.error('开始录音失败', e);
          isRecordingVoiceprint.value = false;
          uni.showToast({
            title: '开始录音失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        isRecordingVoiceprint.value = false;
        uni.showModal({
          title: '提示',
          content: '需要您授权录音权限才能进行录音',
          showCancel: false
        });
      }
    });
  }
};

// 播放方言录音
const playDialectAudio = () => {
  if (!dialectAudioPath.value) return;
  
  const innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.src = dialectAudioPath.value;
  innerAudioContext.autoplay = true;
  
  innerAudioContext.onPlay(() => {
    uni.showToast({
      title: '正在播放方言录音',
      icon: 'none'
    });
  });
  
  innerAudioContext.onError((err) => {
    console.error('播放方言录音失败', err);
    uni.showToast({
      title: '播放失败',
      icon: 'none'
    });
  });
};

// 播放声纹录音
const playVoiceprintAudio = () => {
  if (!voiceprintAudioPath.value) return;
  
  const innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.src = voiceprintAudioPath.value;
  innerAudioContext.autoplay = true;
  
  innerAudioContext.onPlay(() => {
    uni.showToast({
      title: '正在播放声纹录音',
      icon: 'none'
    });
  });
  
  innerAudioContext.onError((err) => {
    console.error('播放声纹录音失败', err);
    uni.showToast({
      title: '播放失败',
      icon: 'none'
    });
  });
};

// 提交录音数据
const handleSubmit = () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请先完成方言和声纹录入',
      icon: 'none'
    });
    return;
  }
  
  uni.showLoading({
    title: '提交中...'
  });
  
  // TODO: [后端接口] 提交方言和声纹录音数据
  // 实现接口: POST /api/user/dialect-voiceprint
  
  // 以下为模拟提交过程，后端实现后移除
  setTimeout(() => {
    uni.hideLoading();
    
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    });
    
    // 延迟返回上一页
    setTimeout(() => {
      goBack();
    }, 1500);
  }, 2000);
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style>
/* 方言/声纹录入页样式 */
.dialect-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  position: relative;
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

.back-btn {
  position: absolute;
  left: 30rpx;
  height: 60rpx;
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 录入标题区域 */
.record-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  width: 100%;
}

.header-icon {
  width: 90rpx;
  height: 90rpx;
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.header-title {
  font-size: 44rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 录入指南 */
.guide-section {
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4px 12px rgba(45, 52, 54, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.guide-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 20rpx;
}

.guide-content {
  display: flex;
  flex-direction: column;
}

.guide-text {
  font-size: 28rpx;
  color: #555555;
  line-height: 1.6;
}

/* 录入区域 */
.record-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15rpx;
  padding: 0 10rpx;
}

.section-title text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.status-tag.completed {
  background-color: rgba(102, 187, 106, 0.7);
}

.record-card {
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4px 12px rgba(45, 52, 54, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.text-to-read {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.text-content {
  font-size: 30rpx;
  color: #2D3436;
  line-height: 1.6;
}

.record-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.record-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.3);
  transition: all 0.3s ease;
}

.record-btn:active {
  transform: scale(0.95);
}

.record-btn.recording {
  background: linear-gradient(145deg, #E74C3C, #E74C3C);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.record-tip {
  font-size: 28rpx;
  color: #2D3436;
}

.audio-player {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(45, 52, 54, 0.1);
}

.play-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(125deg, #FF8A65, #E64A19);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  box-shadow: 0 4px 12px rgba(230, 74, 25, 0.3);
}

.play-btn:active {
  transform: scale(0.95);
}

.play-text {
  font-size: 28rpx;
  color: #2D3436;
}

/* 提交按钮 */
.submit-section {
  margin-top: 20rpx;
  padding: 20rpx 0;
}

.submit-btn {
  height: 96rpx;
  background: linear-gradient(125deg, #FF8A65, #E64A19);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(230, 74, 25, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn.disabled {
  background: linear-gradient(145deg, #9e9e9e, #757575);
  box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}

.submit-btn text {
  font-size: 32rpx;
  font-weight: 500;
  color: #ffffff;
}
</style> 