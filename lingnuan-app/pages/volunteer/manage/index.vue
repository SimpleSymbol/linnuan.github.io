<template>
  <view class="manage-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">管理中心</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 用户信息卡片 -->
      <view class="user-card" @tap="openProfileModal">
        <view class="user-avatar-container">
          <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill"></image>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.name }}</text>
          <text class="user-role">{{ userInfo.role }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
        </view>
      </view>
      
      <!-- 账户管理菜单 -->
      <view class="menu-section">
        <view class="menu-title">
          <text>账户管理</text>
        </view>
        
        <view class="menu-list">
          <!-- 系统设置 -->
          <view class="menu-item" @tap="openSettings">
            <view class="menu-icon">
              <icon-svg name="icon-settings" size="normal" color="white"></icon-svg>
            </view>
            <view class="menu-content">
              <text class="menu-label">系统设置</text>
              <text class="menu-desc">通知、隐私和其他设置</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 资料管理菜单 -->
      <view class="menu-section">
        <view class="menu-title">
          <text>资料管理</text>
        </view>
        
        <view class="menu-list">
          <!-- 用户档案 -->
          <view class="menu-item" @tap="editProfile">
            <view class="menu-icon">
              <icon-svg name="icon-user" size="normal" color="white"></icon-svg>
            </view>
            <view class="menu-content">
              <text class="menu-label">用户档案</text>
              <text class="menu-desc">查看和编辑用户资料信息</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
          
          <!-- 通话记录 -->
          <view class="menu-item" @tap="viewCallHistory">
            <view class="menu-icon">
              <icon-svg name="icon-history" size="normal" color="white"></icon-svg>
            </view>
            <view class="menu-content">
              <text class="menu-label">通话记录</text>
              <text class="menu-desc">查看您的历史通话记录</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
          
          <!-- 志愿数据统计 -->
          <view class="menu-item" @tap="viewVolunteerStats">
            <view class="menu-icon">
              <icon-svg name="icon-text" size="normal" color="white"></icon-svg>
            </view>
            <view class="menu-content">
              <text class="menu-label">志愿数据统计</text>
              <text class="menu-desc">查看您的志愿服务数据和统计</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-button" @tap="handleLogout">退出登录</button>
      </view>
      
      <!-- 版本信息 -->
      <view class="app-version">
        <text>版本 1.0.0</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tab-item" @tap="switchTab('call-center')">
        <view class="tab-content">
          <icon-svg name="icon-phone" size="normal" color="gray" class="call-center-icon"></icon-svg>
          <text>通话中心</text>
        </view>
      </view>
      
      <view class="tab-item" @tap="switchTab('community')">
        <view class="tab-content">
          <icon-svg name="icon-topic" size="normal" color="gray"></icon-svg>
          <text>社区</text>
        </view>
      </view>
      
      <view class="tab-item active" @tap="switchTab('manage')">
        <view class="tab-content">
          <icon-svg name="icon-settings" size="normal" color="white"></icon-svg>
          <text>管理中心</text>
        </view>
      </view>
    </view>
    
    <!-- 个人资料编辑弹窗 -->
    <view class="profile-modal" v-if="profileModalVisible" @touchmove.stop.prevent>
      <view class="modal-overlay" @tap="closeProfileModal"></view>
      <view class="modal-container">
        <view class="modal-header">
          <text class="modal-title">编辑个人资料</text>
          <view class="modal-close" @tap="closeProfileModal">
            <text>×</text>
          </view>
        </view>
        
        <view class="modal-body">
          <!-- 头像编辑 -->
          <view class="avatar-edit">
            <image class="current-avatar" :src="userInfo.avatar" mode="aspectFill"></image>
            <button class="avatar-change-btn" @tap="changeAvatar">更换头像</button>
          </view>
          
          <!-- 用户名编辑 -->
          <view class="form-item">
            <text class="form-label">用户名</text>
            <input class="form-input" v-model="editingName" placeholder="请输入用户名" />
          </view>
          
          <!-- 手机号 -->
          <view class="form-item">
            <text class="form-label">手机号</text>
            <text class="form-text">{{ userInfo.phone }}</text>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeProfileModal">取消</button>
          <button class="save-btn" @tap="saveProfile">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 用户信息
const userInfo = ref({
  name: '志愿者用户',
  role: '志愿者',
  id: '001',
  avatar: '/static/avatars/avatar1.svg',
  phone: '188****8888'
});

// 编辑中的用户名
const editingName = ref(userInfo.value.name);

// 个人资料弹窗
const profileModalVisible = ref(false);

// 打开个人资料弹窗
const openProfileModal = () => {
  editingName.value = userInfo.value.name;
  profileModalVisible.value = true;
};

// 关闭个人资料弹窗
const closeProfileModal = () => {
  profileModalVisible.value = false;
};

// 更换头像
const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 这里只是模拟更换头像，实际应用中需要上传到服务器
      userInfo.value.avatar = res.tempFilePaths[0];
    }
  });
};

// 保存个人资料
const saveProfile = () => {
  if (editingName.value.trim()) {
    userInfo.value.name = editingName.value;
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    closeProfileModal();
  } else {
    uni.showToast({
      title: '用户名不能为空',
      icon: 'none'
    });
  }
};

// 编辑用户档案
const editProfile = () => {
  uni.navigateTo({
    url: '/pages/volunteer/manage/user-list'
  });
};

// 查看通话记录
const viewCallHistory = () => {
  uni.showToast({
    title: '通话记录功能开发中',
    icon: 'none'
  });
};

// 查看志愿数据统计
const viewVolunteerStats = () => {
  uni.showToast({
    title: '志愿数据统计功能开发中',
    icon: 'none'
  });
};

// 打开系统设置
const openSettings = () => {
  uni.showToast({
    title: '系统设置功能开发中',
    icon: 'none'
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 实际应用中需要清除登录状态
        uni.reLaunch({
          url: '/pages/login/index'
        });
      }
    }
  });
};

// 切换标签页
const switchTab = (tabName) => {
  if (tabName === 'call-center') {
    // 跳转到通话中心页面
    uni.reLaunch({
      url: '/pages/volunteer/call-center/index'
    });
  } else if (tabName === 'community') {
    // 跳转到社区页面
    uni.reLaunch({
      url: '/pages/volunteer/community/index'
    });
  } else if (tabName === 'manage') {
    // 当前已在管理中心页面
    return;
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
  background: linear-gradient(125deg, #66BB6A 0%, #A5D6A7 40%, #2E7D32 100%);
  position: relative;
  overflow-x: hidden; /* 防止横向滚动 */
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
  padding: 20rpx;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

/* 用户信息卡片 */
.user-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  box-shadow: 0 2px 6px rgba(45, 52, 54, 0.1);
  box-sizing: border-box;
}

.user-avatar-container {
  position: relative;
  margin-right: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6rpx;
}

.user-role {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 菜单部分 */
.menu-section {
  width: 100%;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

.menu-title {
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.menu-title text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.menu-list {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20rpx;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  margin-right: 20rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 25rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-label {
  font-size: 30rpx;
  color: #ffffff;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.menu-arrow {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

/* 退出登录按钮 */
.logout-section {
  width: 100%;
  margin-top: 20rpx;
  margin-bottom: 30rpx;
}

.logout-button {
  width: 100%;
  height: 90rpx;
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.logout-button:active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 版本信息 */
.app-version {
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.app-version text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
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

/* 个人资料弹窗 */
.profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1001;
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 650rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 1002;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #FFF8F3;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
  color: #A0A6AD;
}

.modal-body {
  padding: 30rpx;
}

.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.current-avatar {
  width: 150rpx;
  height: 150rpx;
  border-radius: 75rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #E8E0D8;
}

.avatar-change-btn {
  font-size: 28rpx;
  color: #2E7D32;
  background-color: transparent;
  border: 1rpx solid #2E7D32;
  border-radius: 30rpx;
  padding: 8rpx 30rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #636E72;
  margin-bottom: 10rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #E8E0D8;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
}

.form-text {
  font-size: 28rpx;
  color: #2D3436;
}

.modal-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1rpx solid #FFF8F3;
}

.cancel-btn, .save-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.cancel-btn {
  background-color: #FFF8F3;
  color: #636E72;
  margin-right: 10rpx;
}

.save-btn {
  background-color: #2E7D32;
  color: #ffffff;
  margin-left: 10rpx;
}
</style> 