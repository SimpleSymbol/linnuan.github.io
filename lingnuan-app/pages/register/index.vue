<template>
  <view class="register-container">
    <!-- 注册背景 -->
    <view class="register-bg">
      <view class="register-card">
        <!-- 注册头部 -->
        <view class="register-header">
          <view class="register-logo">
            <view class="logo-icon">
              <icon-svg name="icon-user" size="large" color="white"></icon-svg>
            </view>
          </view>
          <text class="register-title">注册账号</text>
          <text class="register-subtitle">创建新账号以继续使用</text>
        </view>
        
        <!-- 注册表单 -->
        <view class="input-group">
          <!-- 用户类型选择 -->
          <view class="user-type-selector">
            <view class="type-option" 
                  :class="{ 'active': userType === 'user' }" 
                  @tap="userType = 'user'">
              <view class="type-icon">
                <icon-svg name="icon-user" size="small" :color="userType === 'user' ? 'white' : 'primary'"></icon-svg>
              </view>
              <text>普通用户</text>
            </view>
            <view class="type-option" 
                  :class="{ 'active': userType === 'volunteer' }" 
                  @tap="userType = 'volunteer'">
              <view class="type-icon">
                <icon-svg name="icon-volunteer" size="small" :color="userType === 'volunteer' ? 'white' : 'primary'"></icon-svg>
              </view>
              <text>志愿者</text>
            </view>
          </view>
          
          <view class="input-item">
            <view class="input-icon">
              <icon-svg name="icon-user" color="primary"></icon-svg>
            </view>
            <input 
              type="number" 
              class="register-input" 
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
              type="number" 
              class="register-input" 
              placeholder="请输入验证码" 
              v-model="verificationCode"
              maxlength="6"
            />
            <view class="verify-code-btn" @tap="sendVerificationCode" :class="{ 'disabled': countdown > 0 }">
              {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}
            </view>
          </view>
          
          <view class="input-item">
            <view class="input-icon">
              <icon-svg name="icon-lock" color="primary"></icon-svg>
            </view>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="register-input" 
              placeholder="请输入密码" 
              v-model="password"
            />
            <view class="password-toggle" @tap="togglePassword">
              <icon-svg :name="showPassword ? 'icon-eye' : 'icon-eye-close'" color="gray"></icon-svg>
            </view>
          </view>
          
          <view class="input-item">
            <view class="input-icon">
              <icon-svg name="icon-lock" color="primary"></icon-svg>
            </view>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="register-input" 
              placeholder="请确认密码" 
              v-model="confirmPassword"
            />
            <view class="password-toggle" @tap="togglePassword">
              <icon-svg :name="showPassword ? 'icon-eye' : 'icon-eye-close'" color="gray"></icon-svg>
            </view>
          </view>
        </view>
        
        <!-- 注册协议 -->
        <view class="agreement" @tap="toggleAgreement">
          <icon-svg :name="isAgreed ? 'icon-checkbox-checked' : 'icon-checkbox-unchecked'" size="small" color="primary"></icon-svg>
          <text class="agreement-text">我已阅读并同意<text class="agreement-link">《用户协议》</text>和<text class="agreement-link">《隐私政策》</text></text>
        </view>
        
        <!-- 注册按钮 -->
        <button class="register-btn" :disabled="!isAgreed" :loading="loading" @tap="handleRegister">
          {{ loading ? '注册中...' : (userType === 'user' ? '注册用户' : '注册志愿者') }}
        </button>
        
        <!-- 登录链接 -->
        <view class="login-link">
          <text>已有账号？</text>
          <text class="login-text" @tap="goLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 表单数据
const phone = ref('');
const verificationCode = ref('');
const password = ref('');
const confirmPassword = ref('');
const isAgreed = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const countdown = ref(0);
const userType = ref('user'); // 'user' 或 'volunteer'

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 切换同意协议状态
const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value;
};

// 发送验证码
const sendVerificationCode = () => {
  if (countdown.value > 0) return;
  
  // 验证手机号
  if (!phone.value.trim() || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }
  
  // 开始倒计时
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
  
  // 模拟请求发送验证码
  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  });
};

// 注册处理
const handleRegister = () => {
  if (!phone.value.trim() || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }
  
  if (!verificationCode.value.trim() || verificationCode.value.length !== 6) {
    uni.showToast({
      title: '请输入6位验证码',
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
  
  if (password.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none'
    });
    return;
  }
  
  if (!isAgreed.value) {
    uni.showToast({
      title: '请同意用户协议和隐私政策',
      icon: 'none'
    });
    return;
  }
  
  loading.value = true;
  
  // 模拟注册请求
  setTimeout(() => {
    // 验证验证码是否正确
    if (verificationCode.value !== '123456') { // 假设123456是正确的验证码
      loading.value = false;
      uni.showToast({
        title: '验证码错误',
        icon: 'error'
      });
      return;
    }
    
    loading.value = false;
    
    // 注册成功后跳转到登录页
    uni.showToast({
      title: userType.value === 'user' ? '用户注册成功' : '志愿者注册成功',
      icon: 'success'
    });
    
    // 短暂延迟后跳转
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1500);
};

// 前往登录页面
const goLogin = () => {
  uni.navigateBack();
};
</script>

<style>
/* 注册页样式 */
.register-container {
  width: 100%;
  min-height: 100vh;
}

.register-bg {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.register-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 24px;
  padding: 50rpx 40rpx;
  box-shadow: 0 8px 32px rgba(45, 52, 54, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.register-logo {
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

.register-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #E64A19;
  margin-bottom: 10rpx;
}

.register-subtitle {
  font-size: 28rpx;
  color: #636E72;
  text-align: center;
}

.input-group {
  margin-bottom: 30rpx;
}

/* 用户类型选择器样式 */
.user-type-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.type-option {
  flex: 1;
  height: 90rpx;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  margin: 0 10rpx;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.type-option:first-child {
  margin-left: 0;
}

.type-option:last-child {
  margin-right: 0;
}

.type-option.active {
  background: linear-gradient(90deg, #FF8A65, #E64A19);
  box-shadow: 0 4px 12px rgba(255, 138, 101, 0.15);
}

.type-option.active text {
  color: white;
}

.type-icon {
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-option text {
  font-size: 28rpx;
  color: #2D3436;
  font-weight: 500;
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
  color: #E64A19;
  z-index: 1;
}

.register-input {
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

.register-input:focus {
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

.verify-code-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #E64A19;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-left: 1px solid #E8E0D8;
  height: 60rpx;
  line-height: 60rpx;
}

.verify-code-btn.disabled {
  color: #a0aec0;
}

.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  font-size: 26rpx;
  color: #636E72;
}

.agreement-text {
  margin-left: 20rpx;
}

.agreement-link {
  color: #E64A19;
}

.register-btn {
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

.register-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4px 8px rgba(255, 138, 101, 0.3);
}

.register-btn[disabled] {
  opacity: 0.7;
  background: linear-gradient(90deg, #FFAB91, #FF8A65);
}

.login-link {
  text-align: center;
  font-size: 28rpx;
  color: #636E72;
}

.login-text {
  color: #E64A19;
  font-weight: 600;
  margin-left: 10rpx;
}
</style> 