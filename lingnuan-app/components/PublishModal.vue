<template>
  <view class="publish-modal" v-if="visible" @touchmove.stop.prevent>
    <view class="publish-overlay" @tap="handleCancel"></view>
    <view class="publish-container">
      <view class="publish-header">
        <text class="publish-title">发布新帖子</text>
        <view class="publish-close" @tap="handleCancel">
          <text class="close-icon">×</text>
        </view>
      </view>
      
      <scroll-view class="publish-body" scroll-y scroll-x="false" show-scrollbar="false">
        <!-- 标题输入 -->
        <view class="input-group">
          <input 
            class="title-input" 
            v-model="postData.title" 
            placeholder="请输入标题（必填）" 
            maxlength="50"
            focus
          />
          <text class="input-counter">{{ postData.title.length }}/50</text>
        </view>
        
        <!-- 内容输入 -->
        <view class="input-group content-group">
          <textarea 
            class="content-input" 
            v-model="postData.content" 
            placeholder="请输入内容（必填）" 
            maxlength="500"
            auto-height
            :adjust-position="false"
          />
          <text class="input-counter">{{ postData.content.length }}/500</text>
        </view>
        
        <!-- 图片上传 -->
        <view class="image-upload" v-if="!postData.image">
          <view class="upload-button" @tap="chooseImage">
            <icon-svg name="icon-image" size="medium" color="info"></icon-svg>
            <text>添加图片</text>
          </view>
        </view>
        <view class="image-preview" v-else>
          <image class="preview-image" :src="postData.image" mode="aspectFill"></image>
          <view class="remove-image" @tap="removeImage">
            <text class="remove-icon">×</text>
          </view>
        </view>
        
        <!-- 标签输入 -->
        <view class="input-group">
          <view class="tags-container">
            <view class="tag-item" v-for="(tag, index) in postData.tags" :key="index">
              <text class="tag-text">#{{ tag }}</text>
              <text class="tag-remove" @tap="removeTag(index)">×</text>
            </view>
            <input 
              class="tag-input" 
              v-model="tagInput" 
              placeholder="添加标签，按空格或逗号分隔" 
              @blur="addTagFromInput"
              @confirm="addTagFromInput"
            />
          </view>
          <text class="tag-tip">最多添加5个标签</text>
        </view>
        
        <!-- 分类选择 -->
        <view class="input-group last-group">
          <text class="input-label">选择分类：</text>
          <view class="category-options">
            <view 
              v-for="(category, index) in categories" 
              :key="index"
              :class="['category-option', postData.type === category.value ? 'active' : '']"
              @tap="selectCategory(category.value)"
            >
              <text>{{ category.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="publish-footer">
        <view class="footer-buttons">
          <button 
            class="cancel-button" 
            @tap="handleCancel"
          >
            取消
          </button>
          <button 
            class="publish-button" 
            :disabled="!isValid" 
            :class="{ disabled: !isValid }"
            @tap="handleSubmit"
          >
            发布
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import IconSvg from './IconSvg.vue';

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'submit', 'cancel']);

// 分类选项
const categories = [
  { label: '公告', value: 'announcement' },
  { label: '交流', value: 'discussion' },
  { label: '活动', value: 'activity' }
];

// 帖子数据
const postData = ref({
  title: '',
  content: '',
  image: '',
  tags: [],
  type: 'discussion' // 默认为交流分类
});

// 标签输入
const tagInput = ref('');

// 表单验证
const isValid = computed(() => {
  return postData.value.title.trim() !== '' && 
         postData.value.content.trim() !== '';
});

// 选择分类
const selectCategory = (type) => {
  postData.value.type = type;
};

// 添加标签
const addTagFromInput = () => {
  if (tagInput.value.trim()) {
    // 支持空格或逗号分隔多个标签
    const tags = tagInput.value.split(/[,，\s]+/).filter(tag => tag.trim() !== '');
    
    for (const tag of tags) {
      addTag(tag);
    }
    
    tagInput.value = '';
  }
};

// 添加单个标签
const addTag = (tag) => {
  const trimmedTag = tag.trim();
  if (trimmedTag && !postData.value.tags.includes(trimmedTag) && postData.value.tags.length < 5) {
    postData.value.tags.push(trimmedTag);
  }
};

// 移除标签
const removeTag = (index) => {
  postData.value.tags.splice(index, 1);
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      postData.value.image = res.tempFilePaths[0];
    }
  });
};

// 移除图片
const removeImage = () => {
  postData.value.image = '';
};

// 提交表单
const handleSubmit = () => {
  if (!isValid.value) return;
  
  // 构建提交数据
  const submitData = {
    ...postData.value,
    time: Date.now(),
    id: 'post_' + Date.now(),
    author: '志愿者用户', // 从用户信息中获取
    avatar: '/static/avatars/avatar1.svg', // 从用户信息中获取
    likes: 0,
    isLiked: false,
    comments: []
  };
  
  // 触发提交事件
  emit('submit', submitData);
  
  // 重置表单
  resetForm();
  
  // 关闭弹窗
  emit('update:visible', false);
};

// 取消发布
const handleCancel = () => {
  resetForm();
  emit('cancel');
  emit('update:visible', false);
};

// 重置表单
const resetForm = () => {
  postData.value = {
    title: '',
    content: '',
    image: '',
    tags: [],
    type: 'discussion'
  };
  tagInput.value = '';
};
</script>

<style>
.publish-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.publish-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1101;
}

.publish-container {
  position: relative;
  width: 92%;
  max-width: 650rpx;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1102;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.publish-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #FFF8F3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1103;
  background-color: #fff;
}

.publish-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.publish-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  z-index: 1103;
}

.close-icon {
  font-size: 40rpx;
  color: #A0A6AD;
}

.publish-body {
  flex: 1;
  padding: 16rpx;
  max-height: calc(80vh - 180rpx); 
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.input-group {
  margin-bottom: 20rpx;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.input-group.content-group {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #636E72;
  margin-bottom: 8rpx;
  display: block;
}

.title-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #E8E0D8;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

.content-input {
  width: 100%;
  min-height: 160rpx;
  max-height: none;
  border: 1rpx solid #E8E0D8;
  border-radius: 8rpx;
  padding: 12rpx;
  font-size: 26rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
  height: auto;
  overflow-y: visible;
}

.input-counter {
  position: absolute;
  right: 16rpx;
  bottom: 8rpx;
  font-size: 24rpx;
  color: #A0A6AD;
  background-color: rgba(249, 249, 249, 0.8);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.image-upload {
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.upload-button {
  width: 160rpx;
  height: 160rpx;
  border: 1rpx dashed #E8E0D8;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
}

.upload-button text {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #A0A6AD;
}

.image-preview {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.remove-image {
  position: absolute;
  top: -16rpx;
  right: -16rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1103;
}

.remove-icon {
  color: #fff;
  font-size: 28rpx;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 8rpx;
  min-height: 60rpx;
  padding: 10rpx;
  border: 1rpx solid #E8E0D8;
  border-radius: 8rpx;
  background-color: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: #e6f7ff;
  border-radius: 6rpx;
  padding: 4rpx 10rpx;
  margin-right: 4rpx;
  margin-bottom: 4rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #1890ff;
}

.tag-remove {
  margin-left: 6rpx;
  font-size: 22rpx;
  color: #A0A6AD;
}

.tag-input {
  flex: 1;
  min-width: 100rpx;
  height: 50rpx;
  font-size: 22rpx;
  background: transparent;
}

.tag-tip {
  font-size: 24rpx;
  color: #A0A6AD;
  margin-top: 8rpx;
}

.category-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  width: 100%;
  box-sizing: border-box;
}

.category-option {
  padding: 8rpx 16rpx;
  border-radius: 30rpx;
  background-color: #FFF8F3;
  font-size: 24rpx;
  color: #636E72;
  margin-right: 4rpx;
  margin-bottom: 4rpx;
}

.category-option.active {
  background-color: #2E7D32;
  color: #fff;
}

.publish-footer {
  padding: 16rpx 20rpx;
  border-top: 1rpx solid #FFF8F3;
  z-index: 1103;
  background-color: #fff;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  width: 100%;
}

.cancel-button {
  flex: 1;
  height: 76rpx;
  background: #FFF8F3;
  color: #636E72;
  font-size: 26rpx;
  border-radius: 38rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1rpx solid #E8E0D8;
}

.publish-button {
  flex: 2;
  height: 76rpx;
  background: linear-gradient(to right, #2E7D32, #2E7D32);
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 38rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.publish-button.disabled {
  background: #E8E0D8;
  color: #ffffff;
}
</style> 