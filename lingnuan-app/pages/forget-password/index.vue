<template>
  <view class="forget-container">
    <!-- 背景 -->
    <view class="forget-bg">
      <view class="forget-card">
        <!-- 头部 -->
        <view class="forget-header">
          <view class="forget-logo">
            <view class="logo-icon">
              <icon-svg name="icon-lock" size="large" color="white"></icon-svg>
            </view>
          </view>
          <text class="forget-title">找回密码</text>
          <text class="forget-subtitle">{{ step === 1 ? '请输入您的手机号以接收验证码' : '请输入验证码完成验证' }}</text>
        </view>
        
        <!-- 表单 -->
        <view class="input-group">
          <!-- 步骤1：输入手机号 -->
          <view v-if="step === 1">
            <view class="input-item">
              <view class="input-icon">
                <icon-svg name="icon-user" color="primary"></icon-svg>
              </view>
              <input 
                type="number" 
                class="forget-input" 
                placeholder="请输入手机号" 
                v-model="phone"
                maxlength="11"
              />
            </view>
          </view>
          
          <!-- 步骤2：输入验证码 -->
          <view v-if="step === 2">
            <view class="input-item">
              <view class="input-icon">
                <icon-svg name="icon-lock" color="primary"></icon-svg>
              </view>
              <input 
                type="number" 
                class="forget-input" 
                placeholder="请输入验证码" 
                v-model="verificationCode"
                maxlength="6"
              />
              <view class="verify-code-btn" @tap="resendVerificationCode" :class="{ 'disabled': countdown > 0 }">
                {{ countdown > 0 ? `${countdown}秒后重新获取` : '重新获取' }}
              </view>
            </view>
            
            <view class="input-item" v-if="step === 2">
              <view class="input-icon">
                <icon-svg name="icon-lock" color="primary"></icon-svg>
              </view>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="forget-input" 
                placeholder="请输入新密码" 
                v-model="newPassword"
              />
              <view class="password-toggle" @tap="togglePassword">
                <icon-svg :name="showPassword ? 'icon-eye' : 'icon-eye-close'" color="gray"></icon-svg>
              </view>
            </view>
            
            <view class="input-item" v-if="step === 2">
              <view class="input-icon">
                <icon-svg name="icon-lock" color="primary"></icon-svg>
              </view>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="forget-input" 
                placeholder="请确认新密码" 
                v-model="confirmPassword"
              />
              <view class="password-toggle" @tap="togglePassword">
                <icon-svg :name="showPassword ? 'icon-eye' : 'icon-eye-close'" color="gray"></icon-svg>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 按钮 -->
        <button class="forget-btn" :loading="loading" @tap="handleSubmit">
          {{ step === 1 ? (loading ? '发送中...' : '获取验证码') : (loading ? '提交中...' : '重置密码') }}
        </button>
        
        <!-- 返回登录 -->
        <view class="login-link">
          <text>返回</text>
          <text class="login-text" @tap="goLogin">登录页面</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 表单数据
const step = ref(1); // 1: 输入手机号, 2: 输入验证码
const phone = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const countdown = ref(0);
const showPassword = ref(false);

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 重发验证码
const resendVerificationCode = () => {
  if (countdown.value > 0) return;
  
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
  
  // 模拟发送验证码请求
  uni.showToast({
    title: '验证码已重新发送',
    icon: 'success'
  });
};

// 提交处理
const handleSubmit = () => {
  if (step.value === 1) {
    // 步骤1：验证手机号并发送验证码
    if (!phone.value.trim() || phone.value.length !== 11) {
      uni.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    loading.value = true;
    
    // 模拟发送验证码请求
    setTimeout(() => {
      loading.value = false;
      
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
      
      // 进入步骤2
      step.value = 2;
      countdown.value = 60;
      
      // 开始倒计时
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
    }, 1500);
  } else {
    // 步骤2：验证验证码并重置密码
    if (!verificationCode.value.trim() || verificationCode.value.length !== 6) {
      uni.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      });
      return;
    }
    
    if (!newPassword.value.trim()) {
      uni.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword.value !== confirmPassword.value) {
      uni.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }
    
    loading.value = true;
    
    // 模拟验证码验证和重置密码请求
    setTimeout(() => {
      loading.value = false;
      
      // 模拟成功和失败的情况
      if (verificationCode.value === '123456') { // 假设123456是正确的验证码
        uni.showToast({
          title: '密码重置成功',
          icon: 'success'
        });
        
        // 延迟后返回登录页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        uni.showToast({
          title: '验证码错误',
          icon: 'error'
        });
      }
    }, 1500);
  }
};

// 返回登录页面
const goLogin = () => {
  uni.navigateBack();
};
</script>

<style>
/* 忘记密码页样式 */
.forget-container {
  width: 100%;
  min-height: 100vh;
}

.forget-bg {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.forget-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 24px;
  padding: 50rpx 40rpx;
  box-shadow: 0 8px 32px rgba(45, 52, 54, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.forget-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.forget-logo {
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

.forget-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #E64A19;
  margin-bottom: 10rpx;
}

.forget-subtitle {
  font-size: 28rpx;
  color: #636E72;
  text-align: center;
  padding: 0 20rpx;
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
  color: #E64A19;
  z-index: 1;
}

.forget-input {
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

.forget-input:focus {
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

.forget-btn {
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

.forget-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4px 8px rgba(255, 138, 101, 0.3);
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