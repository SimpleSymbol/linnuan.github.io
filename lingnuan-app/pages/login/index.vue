<template>
  <view class="login-container">
    <!-- 登录背景 -->
    <view class="login-bg">
      <view class="login-card">
        <!-- 登录头部 -->
        <view class="login-header">
          <view class="login-logo">
            <view class="logo-icon">
              <icon-svg name="icon-user" size="large" color="white"></icon-svg>
            </view>
          </view>
          <text class="login-title">欢迎回来</text>
          <text class="login-subtitle">请登录您的账号继续</text>
        </view>
        
        <!-- 登录表单 -->
        <view class="input-group">
          <view class="input-item">
            <view class="input-icon">
              <icon-svg name="icon-user" color="primary"></icon-svg>
            </view>
            <input 
              type="number" 
              class="login-input" 
              placeholder="请输入手机号" 
              v-model="phone"
              maxlength="11"
            />
          </view>
          
          <view class="input-item">
            <view class="input-icon">
              <icon-svg name="icon-lock" color="primary"></icon-svg>
            </view>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="login-input" 
              placeholder="请输入密码" 
              v-model="password"
            />
            <view class="password-toggle" @tap="togglePassword">
              <icon-svg :name="showPassword ? 'icon-eye' : 'icon-eye-close'" color="gray"></icon-svg>
            </view>
          </view>
        </view>
        
        <!-- 登录选项 -->
        <view class="login-options">
          <view class="remember-me" @tap="toggleRemember">
            <icon-svg :name="rememberPassword ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'" size="small" color="primary"></icon-svg>
            <text class="remember-text">记住密码</text>
          </view>
          <text class="forgot-password" @tap="goForgetPassword">忘记密码？</text>
        </view>
        
        <!-- 登录按钮 -->
        <button class="login-btn" :loading="loading" @tap="handleLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <!-- 注册链接 -->
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="register-text" @tap="goRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IconSvg from '@/components/IconSvg.vue';
import { request } from '@/utils/request.js';

// 表单数据
const phone = ref('');
const password = ref('');
const rememberPassword = ref(false);
const showPassword = ref(false);
const loading = ref(false);

// 页面加载时检查本地存储
onMounted(() => {
  try {
    // 清除之前可能保存的测试数据
    uni.removeStorageSync('phone');
    uni.removeStorageSync('password');
  } catch (e) {
    console.error('清除存储信息失败', e);
  }
});

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 切换记住密码状态
const toggleRemember = () => {
  rememberPassword.value = !rememberPassword.value;
};

// 登录处理
const handleLogin = () => {
  if (!phone.value.trim() || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }
  
  if (!password.value.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    });
    return;
  }
  
  loading.value = true;
  
  // 准备登录请求参数
  const loginParams = {
    phone: phone.value,
    password: password.value
  };
  
  // 【后端接口】用户登录
  loginUser(loginParams);
};

// 调用后端登录接口，失败回退本地 mock（保证无后端也能体验）
const loginUser = async (params) => {
  try {
    const res = await request.post('/auth/login', params);
    if (res.success) {
      handleLoginSuccess(res.data);
    } else {
      handleLoginFail(res.message || '登录失败');
    }
  } catch (err) {
    // 后端不可用时回退 mock，保证 demo 可体验
    console.warn('登录接口不可用，回退本地 mock', err);
    setTimeout(() => {
      const mockResponse = {
        token: 'mock-token-' + new Date().getTime(),
        userInfo: {
          phone: params.phone,
          userName: '测试用户',
          // 手机号 188 开头视为志愿者，否则普通用户
          userType: params.phone.startsWith('188') ? 'volunteer' : 'user'
        }
      };
      handleLoginSuccess(mockResponse);
    }, 800);
  } finally {
    loading.value = false;
  }
};

// 登录成功处理
const handleLoginSuccess = (data) => {
  try {
    // 保存token和用户信息
    uni.setStorageSync('token', data.token);
    uni.setStorageSync('userInfo', data.userInfo);
    
    // 如果需要保存登录状态
    if (rememberPassword.value) {
      uni.setStorageSync('phone', phone.value);
      uni.setStorageSync('password', password.value);
    } else {
      // 确保清除本地存储的账号密码
      uni.removeStorageSync('phone');
      uni.removeStorageSync('password');
    }
    
    // 根据用户类型跳转到相应页面
    if (data.userInfo.userType === 'volunteer') {
      // 志愿者跳转到志愿者页面
      uni.reLaunch({
        url: '/pages/volunteer/call-center/index'
      });
    } else {
      // 普通用户跳转到用户首页
      uni.reLaunch({
        url: '/pages/user/home/index'
      });
    }
    
  } catch (e) {
    console.error('保存登录信息失败', e);
    handleLoginFail('登录处理失败');
  }
};

// 登录失败处理
const handleLoginFail = (message) => {
  uni.showToast({
    title: message || '登录失败',
    icon: 'none'
  });
  loading.value = false;
};

// 前往忘记密码页面
const goForgetPassword = () => {
  uni.navigateTo({
    url: '/pages/forget-password/index'
  });
};

// 前往注册页面
const goRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  });
};
</script>

<style>
/* 登录页样式 */
.login-container {
  width: 100%;
  min-height: 100vh;
  /* 使用 dvh 作为后备，解决移动端 100vh 包含导航栏的问题 */
  min-height: 100dvh;
}

.login-bg {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 适配底部安全区域（iPhone X+ 的 Home Indicator、Android 虚拟导航栏） */
  padding: 40rpx;
  padding-top: calc(40rpx + env(safe-area-inset-top));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  /* 内容超出时可滚动，防止小屏手机显示不全 */
  overflow-y: auto;
}

.login-card {
  width: 100%;
  max-width: 700rpx;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 24px;
  padding: 50rpx 40rpx;
  box-shadow: 0 8px 32px rgba(45, 52, 54, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  /* 防止卡片在小屏幕上被挤压 */
  flex-shrink: 0;
  margin: auto;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.login-logo {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(145deg, #FF8A65, #E64A19);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  box-shadow: 0 10px 20px rgba(255, 138, 101, 0.3);
}

.logo-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #E64A19;
  margin-bottom: 10rpx;
}

.login-subtitle {
  font-size: 28rpx;
  color: #636E72;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  position: relative;
  margin-bottom: 30rpx;
}

.input-icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #FF8A65;
  z-index: 1;
}

.login-input {
  width: 100%;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 16rpx;
  padding: 0 30rpx 0 80rpx;
  font-size: 28rpx;
  color: #2D3436;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.login-input:focus {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.15);
}

.password-toggle {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  font-size: 26rpx;
  color: #636E72;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-text {
  margin-left: 10rpx;
}

.forgot-password {
  color: #E64A19;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(90deg, #FF8A65, #E64A19);
  border: none;
  border-radius: 20rpx;
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 15px rgba(255, 138, 101, 0.3);
  transition: all 0.3s ease;
}

.login-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4px 8px rgba(255, 138, 101, 0.3);
}

.register-link {
  text-align: center;
  font-size: 28rpx;
  color: #636E72;
}

.register-text {
  color: #E64A19;
  font-weight: 600;
  margin-left: 10rpx;
}
</style> 