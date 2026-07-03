<template>
  <view class="custom-modal" v-if="visible" @touchmove.stop.prevent>
    <view class="modal-mask" @click="cancelModal"></view>
    <view class="modal-container">
      <view class="modal-title">{{ title }}</view>
      <view class="modal-content">{{ content }}</view>
      <view class="modal-buttons">
        <view class="modal-button cancel-button" @click="cancelModal">取消</view>
        <view class="modal-button confirm-button" @click="confirmModal">确定</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: ''
    }
  },
  methods: {
    confirmModal() {
      this.$emit('confirm');
      this.$emit('update:visible', false);
    },
    cancelModal() {
      this.$emit('cancel');
      this.$emit('update:visible', false);
    }
  }
}
</script>

<style>
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-container {
  width: 80%;
  max-width: 600rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
  transform: translateZ(0);
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #FF8A65;
  padding: 40rpx 30rpx 20rpx;
  text-align: center;
}

.modal-content {
  padding: 20rpx 40rpx 40rpx;
  font-size: 30rpx;
  color: #2D3436;
  text-align: center;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  border-top: 1px solid rgba(45, 52, 54, 0.08);
}

.modal-button {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 32rpx;
}

.cancel-button {
  color: #A0A6AD;
  border-right: 1px solid rgba(45, 52, 54, 0.08);
}

.confirm-button {
  color: #FF8A65;
  font-weight: 500;
  background: linear-gradient(90deg, rgba(255, 138, 101, 0.1), rgba(255, 138, 101, 0.05));
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}
</style> 