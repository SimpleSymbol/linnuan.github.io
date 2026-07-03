<template>
  <view class="redirect-container">
    <text>正在跳转...</text>
  </view>
</template>

<script>
export default {
  onLoad() {
    // 页面加载时自动跳转到用户主页
    uni.reLaunch({
      url: '/pages/user/home/index'
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
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
}
.redirect-container text {
  color: #ffffff;
  font-size: 30rpx;
}
</style>
