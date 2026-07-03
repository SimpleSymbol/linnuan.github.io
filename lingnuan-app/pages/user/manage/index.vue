<template>
  <view class="manage-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">管理中心</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 管理中心标题区域 -->
      <view class="manage-header">
        <view class="header-icon">
          <icon-svg name="icon-settings" size="large" color="white"></icon-svg>
        </view>
        <text class="header-title">管理中心</text>
      </view>
      
      <!-- 功能区域 -->
      <view class="function-grid">
        <!-- 数字回忆录（并入模块）-->
        <view class="function-item" @tap="handleFunction('memoir')">
          <view class="function-icon memoir-icon">
            <icon-svg name="icon-text" size="medium" color="white"></icon-svg>
          </view>
          <text class="function-name">数字回忆录</text>
        </view>

        <!-- 方言/声纹录入 -->
        <view class="function-item" @tap="handleFunction('dialect')">
          <view class="function-icon dialect-icon">
            <icon-svg name="icon-text" size="medium" color="white"></icon-svg>
          </view>
          <text class="function-name">方言/声纹录入</text>
        </view>

        <!-- 语音控制 -->
        <view class="function-item" @tap="handleFunction('voice')">
          <view class="function-icon voice-icon">
            <icon-svg name="icon-mic" size="medium" color="white"></icon-svg>
          </view>
          <text class="function-name">语音控制</text>
        </view>

        <!-- 呼叫记录 -->
        <view class="function-item" @tap="handleFunction('callLog')">
          <view class="function-icon call-icon">
            <icon-svg name="icon-phone" size="medium" color="white"></icon-svg>
          </view>
          <text class="function-name">呼叫记录</text>
        </view>
      </view>
      
      <!-- 用户信息区域 -->
      <view class="user-info">
        <view class="user-avatar">
          <icon-svg name="icon-user" size="large" color="white"></icon-svg>
        </view>
        <view class="user-details">
          <text class="user-name">用户：{{ userName }}</text>
        </view>
        <view class="logout-btn" @tap="handleLogout">
          <text>退出登录</text>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tab-item" @tap="switchTab('companion')">
        <view class="tab-content">
          <icon-svg name="icon-chat" size="normal" color="gray"></icon-svg>
          <text>情感陪伴</text>
        </view>
      </view>
      
      <!-- 中间的圆形按钮 -->
      <view class="center-btn" @tap="handleVolunteerCall">
        <icon-svg name="icon-volunteer" size="medium" color="white"></icon-svg>
      </view>
      
      <view class="tab-item active" @tap="switchTab('manage')">
        <view class="tab-content">
          <icon-svg name="icon-settings" size="normal" color="white"></icon-svg>
          <text>管理中心</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 用户信息
const userName = ref('未登录');

// 页面加载时获取登录信息
onMounted(() => {
  // 获取登录用户的手机号
  getUserInfo();
});

// 获取用户信息（统一从 userInfo 读取）
const getUserInfo = () => {
  try {
    const userInfo = uni.getStorageSync('userInfo');
    const token = uni.getStorageSync('token');

    if (userInfo && userInfo.phone) {
      userName.value = userInfo.userName || userInfo.phone;
    } else if (token) {
      userName.value = '已登录用户';
    } else {
      userName.value = '未登录';
    }
  } catch (e) {
    console.error('获取用户信息失败', e);
    userName.value = '获取失败';
  }
};

// 处理功能点击
const handleFunction = (funcType) => {
  switch(funcType) {
    case 'dialect':
      // 【后端接口】方言/声纹录入功能
      
      // 页面跳转
      uni.navigateTo({
        url: '/pages/user/dialect/index'
      });
      break;
      
    case 'voice':
      // 【后端接口】语音控制设置
      uni.showToast({
        title: '正在进入语音控制设置',
        icon: 'none'
      });
      
      // 页面跳转
      // uni.navigateTo({
      //   url: '/pages/user/voice-control/index'
      // });
      break;
      
    case 'callLog':
      // 【后端接口】呼叫记录查询
      uni.showToast({
        title: '正在进入呼叫记录查询',
        icon: 'none'
      });
      break;

    case 'memoir':
      // 数字回忆录（并入模块）→ 跳回忆录功能选择页
      uni.navigateTo({
        url: '/pages/memoir/start'
      });
      break;
      
    default:
      console.log('未知功能类型:', funcType);
  }
};

// 处理退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录信息（统一 storage）
        try {
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          uni.removeStorageSync('phone');
          uni.removeStorageSync('password');
        } catch (e) {
          console.error('清除登录信息失败', e);
        }
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/index'
        });
      }
    }
  });
};

// 处理志愿者呼叫
const handleVolunteerCall = () => {
  uni.showModal({
    title: '志愿者呼叫',
    content: '是否确认呼叫\n志愿者视频协助',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: '#FF8A65',
    cancelColor: '#A0A6AD',
    success: (res) => {
      if (res.confirm) {
        // 【后端接口】志愿者呼叫功能
        // 实现接口: POST /api/volunteer/call-request
        // 参数: { "userId": "用户ID", "userInfo": { "name": "用户姓名", "age": "用户年龄", "avatar": "用户头像" } }
        uni.showToast({
          title: '已发送志愿者呼叫请求',
          icon: 'none'
        });
      }
    }
  });
};

// 切换标签页
const switchTab = (tabName) => {
  if (tabName === 'companion') {
    // 跳转到情感陪伴页面
    uni.reLaunch({
      url: '/pages/user/home/index'
    });
  } else if (tabName === 'manage') {
    // 当前已在管理中心页面
  }
};
</script>

<style>
/* 管理中心页样式 */
.manage-container {
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

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

/* 管理中心标题区域 */
.manage-header {
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
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
  transition: all 0.3s ease;
}

.header-icon:active {
  transform: scale(0.95);
}

.header-title {
  font-size: 44rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 功能区域 */
.function-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 85%;
  margin-bottom: 40rpx;
}

.function-item {
  width: 100%;
  margin-bottom: 30rpx;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20rpx;
  padding: 35rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(45, 52, 54, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.function-item:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(45, 52, 54, 0.1);
  background-color: rgba(255, 255, 255, 0.75);
}

.function-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.function-item:active::after {
  opacity: 1;
}

.function-icon {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
}

.dialect-icon {
  background: linear-gradient(145deg, rgba(255, 138, 101, 0.7), rgba(230, 74, 25, 0.6));
  box-shadow: 0 4px 10px rgba(255, 138, 101, 0.2);
}

.voice-icon {
  background: linear-gradient(145deg, rgba(255, 138, 101, 0.7), rgba(230, 74, 25, 0.6));
  box-shadow: 0 4px 10px rgba(255, 138, 101, 0.2);
}

.call-icon {
  background: linear-gradient(145deg, rgba(255, 171, 145, 0.7), rgba(230, 74, 25, 0.6));
  box-shadow: 0 4px 10px rgba(255, 171, 145, 0.2);
}

.memoir-icon {
  background: linear-gradient(145deg, rgba(255, 138, 101, 0.8), rgba(230, 74, 25, 0.7));
  box-shadow: 0 4px 10px rgba(255, 138, 101, 0.25);
}

.function-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #2D3436;
}

/* 用户信息区域 */
.user-info {
  width: 85%;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(45, 52, 54, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  margin-top: auto;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(145deg, #E64A19, #FF8A65);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #2D3436;
}

.logout-btn {
  padding: 12rpx 30rpx;
  background-color: #E74C3C;
  border-radius: 30rpx;
  transition: all 0.2s ease;
}

.logout-btn:active {
  transform: scale(0.95);
  background-color: #C0392B;
}

.logout-btn text {
  font-size: 26rpx;
  color: #ffffff;
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
  box-shadow: 0 4px 10px rgba(255, 138, 101, 0.3);
  z-index: 100;
}
</style> 