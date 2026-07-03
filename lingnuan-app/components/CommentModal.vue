<template>
  <view class="comment-modal" v-if="visible" @touchmove.stop.prevent>
    <view class="modal-mask" @click="cancelModal"></view>
    <view class="modal-container">
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
        <view class="close-btn" @click="cancelModal">×</view>
      </view>
      
      <view class="comment-list" v-if="comments && comments.length > 0">
        <view class="comment-item" v-for="(comment, index) in comments" :key="index">
          <view class="comment-avatar">
            <image :src="comment.avatar || '/static/avatars/avatar1.svg'" mode="aspectFill"></image>
          </view>
          <view class="comment-content">
            <view class="comment-info">
              <text class="comment-author">{{ comment.author }}</text>
              <text class="comment-time">{{ formatTime(comment.time) }}</text>
            </view>
            <text class="comment-text">{{ comment.content }}</text>
          </view>
        </view>
      </view>
      
      <view class="no-comments" v-else>
        <text>暂无评论，快来发表第一条评论吧！</text>
      </view>
      
      <view class="comment-input-area">
        <textarea 
          class="comment-input" 
          v-model="commentText" 
          placeholder="写下你的评论..." 
          auto-height 
          maxlength="200"
          :adjust-position="true"
          :cursor-spacing="20"
          :show-confirm-bar="false"
          :focus="inputFocus"
        ></textarea>
        <view class="comment-length">{{ commentText.length }}/200</view>
        <view class="comment-buttons">
          <view class="cancel-btn" @click="cancelModal">取消</view>
          <view class="submit-btn" @click="submitComment" :class="{ disabled: !commentText.trim() }">发布</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '评论'
  },
  comments: {
    type: Array,
    default: () => []
  },
  postId: {
    type: String,
    default: ''
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'submit', 'cancel']);

const commentText = ref('');
const inputFocus = ref(false);

// 监听visible变化
watch(() => props.visible, (val) => {
  if (val) {
    setTimeout(() => {
      inputFocus.value = true;
    }, 300);
  } else {
    inputFocus.value = false;
  }
});

// 提交评论
const submitComment = () => {
  if (!commentText.value.trim()) return;
  
  const newComment = {
    id: Date.now().toString(),
    author: '我', // 可以从用户信息中获取
    avatar: '/static/avatars/avatar1.svg', // 可以从用户信息中获取
    content: commentText.value.trim(),
    time: Date.now()
  };
  
  emit('submit', { postId: props.postId, comment: newComment });
  commentText.value = '';
  // 不关闭弹窗，让用户可以继续评论
};

// 取消评论
const cancelModal = () => {
  commentText.value = '';
  emit('cancel');
  emit('update:visible', false);
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};
</script>

<style>
.comment-modal {
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
  width: 90%;
  height: 70%;
  max-width: 650rpx;
  max-height: 1000rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
  transform: translateZ(0);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(45, 52, 54, 0.08);
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2D3436;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #A0A6AD;
}

.comment-list {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx 30rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
}

.comment-avatar {
  width: 70rpx;
  height: 70rpx;
  margin-right: 20rpx;
}

.comment-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-info {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.comment-author {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D3436;
  margin-right: 15rpx;
}

.comment-time {
  font-size: 22rpx;
  color: #A0A6AD;
}

.comment-text {
  font-size: 28rpx;
  color: #636E72;
  line-height: 1.5;
}

.no-comments {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.no-comments text {
  font-size: 28rpx;
  color: #A0A6AD;
}

.comment-input-area {
  padding: 20rpx 30rpx;
  border-top: 1px solid rgba(45, 52, 54, 0.08);
  background-color: #f9f9f9;
}

.comment-input {
  width: 100%;
  min-height: 80rpx;
  max-height: 200rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 10rpx;
  box-sizing: border-box;
  margin-bottom: 10rpx;
}

.comment-length {
  text-align: right;
  font-size: 22rpx;
  color: #A0A6AD;
  margin-bottom: 15rpx;
}

.comment-buttons {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn, .submit-btn {
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  margin-left: 20rpx;
}

.cancel-btn {
  color: #636E72;
  background-color: #FFF8F3;
}

.submit-btn {
  color: #fff;
  background-color: #66BB6A;
}

.submit-btn.disabled {
  background-color: #E8E0D8;
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