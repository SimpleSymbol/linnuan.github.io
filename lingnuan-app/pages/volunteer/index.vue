<template>
  <view class="redirect-container">
    <text>正在跳转...</text>
  </view>
</template>

<script>
export default {
  onLoad() {
    // 页面加载时自动跳转到志愿者通话中心页
    uni.reLaunch({
      url: '/pages/volunteer/call-center/index'
    });
  }
}
</script>

<style>
.redirect-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(125deg, #66BB6A 0%, #A5D6A7 40%, #2E7D32 100%);
}
.redirect-container text {
  color: #ffffff;
  font-size: 30rpx;
}
</style> 