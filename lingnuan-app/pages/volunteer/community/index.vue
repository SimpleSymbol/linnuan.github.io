<template>
  <view class="community-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <text class="navbar-title">社区</text>
    </view>
    
    <!-- 顶部分类导航 -->
    <view class="category-nav">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['category-item', currentTab === index ? 'active' : '']"
        @tap="switchCategory(index)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-area">
      <view class="post-list">
        <view 
          v-for="post in filteredPosts" 
          :key="post.id"
          class="post-card"
        >
          <!-- 帖子头部 -->
          <view class="post-header">
            <view class="post-author">
              <image class="author-avatar" :src="post.avatar" mode="aspectFill"></image>
              <view class="author-info">
                <text class="author-name">{{ post.author }}</text>
                <text class="post-time">{{ formatTime(post.time) }}</text>
              </view>
            </view>
            <view class="post-more">
              <view v-if="isCurrentUser(post)" class="delete-btn" @tap.stop="confirmDeletePost(post)">
                <icon-svg name="icon-delete" size="small" color="#ff5252"></icon-svg>
              </view>
              <icon-svg v-else name="icon-more" size="small" color="gray"></icon-svg>
            </view>
          </view>
          
          <!-- 帖子内容 -->
          <view class="post-content">
            <text class="post-title">{{ post.title }}</text>
            <text class="post-text">{{ post.content }}</text>
            <view class="post-image-container" v-if="post.image">
              <image class="post-image" :src="post.image" mode="aspectFill"></image>
            </view>
          </view>
          
          <!-- 帖子底部 -->
          <view class="post-footer">
            <view class="post-tags" v-if="post.tags && post.tags.length > 0">
              <view class="post-tag" v-for="(tag, idx) in post.tags" :key="idx">
                <text>#{{ tag }}</text>
              </view>
            </view>
            <view class="post-actions">
              <view class="action-item" :class="{ liked: post.isLiked }" @tap="likePost(post.id)">
                <icon-svg :name="post.isLiked ? 'icon-like-filled' : 'icon-like'" size="small" :color="post.isLiked ? 'success' : 'gray'"></icon-svg>
                <text>{{ post.likes }}</text>
              </view>
              <view class="action-item" @tap="commentPost(post.id)">
                <icon-svg name="icon-comment" size="small" color="gray"></icon-svg>
                <text>{{ post.comments.length }}</text>
              </view>
              <view class="action-item" @tap="sharePost(post.id)">
                <icon-svg name="icon-share" size="small" color="gray"></icon-svg>
                <text>分享</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="hasMorePosts" @tap="loadMorePosts">
          <text>加载更多</text>
        </view>
        <view class="load-more end" v-else>
          <text>已经到底啦</text>
        </view>
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
      
      <view class="tab-item active" @tap="switchTab('community')">
        <view class="tab-content">
          <icon-svg name="icon-topic" size="normal" color="white"></icon-svg>
          <text>社区</text>
        </view>
      </view>
      
      <view class="tab-item" @tap="switchTab('manage')">
        <view class="tab-content">
          <icon-svg name="icon-settings" size="normal" color="gray"></icon-svg>
          <text>管理中心</text>
        </view>
      </view>
    </view>
    
    <!-- 评论弹窗 -->
    <comment-modal
      v-model:visible="commentModalVisible"
      :title="currentPost ? `评论 (${currentPost.comments.length})` : '评论'"
      :comments="currentPost ? currentPost.comments : []"
      :postId="currentPostId"
      @submit="handleCommentSubmit"
      @cancel="closeCommentModal"
    />

    <!-- 发布按钮 -->
    <view class="publish-fab" @tap="openPublishModal">
      <icon-svg name="icon-publish" size="large"></icon-svg>
    </view>

    <!-- 发布弹窗 -->
    <publish-modal
      v-model:visible="publishModalVisible"
      @submit="handlePublishSubmit"
      @cancel="closePublishModal"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import IconSvg from '@/components/IconSvg.vue';
import CommentModal from '@/components/CommentModal.vue';
import PublishModal from '@/components/PublishModal.vue';

// 顶部分类标签
const tabs = ref([
  { name: '公告', type: 'announcement' },
  { name: '交流', type: 'discussion' },
  { name: '活动', type: 'activity' }
]);

// 当前选中的标签
const currentTab = ref(0);

// 评论弹窗相关
const commentModalVisible = ref(false);
const currentPostId = ref('');
const currentPost = ref(null);

// TODO: [后端接口] 获取当前登录用户信息
// 实现接口: GET /api/user/info
// 以下为模拟数据，后端实现后移除
const currentUser = ref({
  id: '001',
  name: '志愿者用户',
  avatar: '/static/avatars/avatar1.svg'
});

// 切换分类
const switchCategory = (index) => {
  currentTab.value = index;
};

// TODO: [后端接口] 获取帖子列表
// 实现接口: GET /api/community/posts?type=xxx&page=1&pageSize=10
// 以下为模拟数据，后端实现后移除
const posts = ref([
  {
    id: '001',
    author: '系统管理员',
    avatar: '/static/avatars/avatar1.svg',
    time: Date.now() - 3600000 * 2,
    title: '志愿者系统更新公告',
    content: '亲爱的志愿者们，我们的系统已更新至1.0版本，新增了视频通话功能和社区互动模块，请大家及时更新应用。同时，我们将于本周六举办线上培训会，欢迎参加！',
    image: '',
    likes: 42,
    isLiked: false,
    comments: [
      { id: '101', author: '张志愿', content: '新版本非常好用！', time: Date.now() - 3600000 * 1, avatar: '/static/avatars/avatar2.svg' },
      { id: '102', author: '李助手', content: '视频通话功能很实用', time: Date.now() - 3600000 * 1.5, avatar: '/static/avatars/avatar3.svg' }
    ],
    tags: ['系统更新', '重要通知'],
    type: 'announcement',
    isTop: true
  },
  {
    id: '002',
    author: '王主任',
    avatar: '/static/avatars/avatar2.svg',
    time: Date.now() - 86400000 * 1,
    title: '本月优秀志愿者表彰',
    content: '恭喜张明、李华、王芳三位志愿者获得本月"星级志愿者"称号！他们在过去一个月中分别完成了超过50次的通话服务，受到了老人们的一致好评。',
    image: '',
    likes: 38,
    isLiked: true,
    comments: [
      { id: '201', author: '张明', content: '感谢大家的支持！', time: Date.now() - 86400000 * 0.5, avatar: '/static/avatars/avatar1.svg' },
      { id: '202', author: '李华', content: '很荣幸能帮助到老人们', time: Date.now() - 86400000 * 0.7, avatar: '/static/avatars/avatar3.svg' }
    ],
    tags: ['优秀志愿者', '表彰'],
    type: 'announcement',
    isTop: true
  },
  {
    id: '003',
    author: '李志愿',
    avatar: '/static/avatars/avatar3.svg',
    time: Date.now() - 86400000 * 2,
    title: '如何与听力不好的老人沟通',
    content: '在与听力不好的老人沟通时，我发现以下几点很有效：1. 语速放慢，音量适当提高；2. 使用简单清晰的语言；3. 耐心倾听，给予足够的回应时间；4. 必要时可以使用文字或图片辅助沟通。',
    image: '',
    likes: 26,
    isLiked: false,
    comments: [
      { id: '301', author: '张助手', content: '这些建议非常实用！', time: Date.now() - 86400000 * 1.5, avatar: '/static/avatars/avatar1.svg' }
    ],
    tags: ['经验分享', '沟通技巧'],
    type: 'discussion',
    isTop: false
  },
  {
    id: '004',
    author: '张社工',
    avatar: '/static/avatars/avatar1.svg',
    time: Date.now() - 86400000 * 3,
    title: '社区文化节活动总结',
    content: '上周末的社区文化节非常成功，共有32位老人和25位志愿者参加。通过歌曲演唱、太极展示、书法交流等环节，增进了老人与志愿者之间的情感联系。感谢所有参与者的热情付出！',
    image: '',
    likes: 35,
    isLiked: false,
    comments: [
      { id: '401', author: '王志愿', content: '活动很有意义，期待下次参加！', time: Date.now() - 86400000 * 2.5, avatar: '/static/avatars/avatar2.svg' },
      { id: '402', author: '李助手', content: '老人们玩得很开心', time: Date.now() - 86400000 * 2.8, avatar: '/static/avatars/avatar3.svg' }
    ],
    tags: ['活动总结', '社区文化'],
    type: 'activity',
    isTop: false
  },
  {
    id: '005',
    author: '赵志愿',
    avatar: '/static/avatars/avatar2.svg',
    time: Date.now() - 86400000 * 4,
    title: '处理紧急情况的经验分享',
    content: '上周我在通话中遇到一位老人突然感到胸闷气短的情况。分享一下我的处理经验：1. 保持冷静，安抚老人情绪；2. 询问具体症状和持续时间；3. 建议老人采取舒适姿势并保持通话；4. 及时联系其家人或拨打急救电话。',
    image: '',
    likes: 45,
    isLiked: true,
    comments: [
      { id: '501', author: '系统管理员', content: '非常专业的处理方式，值得大家学习！', time: Date.now() - 86400000 * 3.5, avatar: '/static/avatars/avatar1.svg' },
      { id: '502', author: '王主任', content: '建议将这些经验整理成培训材料', time: Date.now() - 86400000 * 3.8, avatar: '/static/avatars/avatar2.svg' }
    ],
    tags: ['紧急情况', '经验分享'],
    type: 'discussion',
    isTop: false
  },
  {
    id: '006',
    author: '活动组委会',
    avatar: '/static/avatars/avatar3.svg',
    time: Date.now() - 86400000 * 5,
    title: '健康讲座活动预告',
    content: '我们将于下周三下午2点举办"老年人常见疾病预防"线上讲座，特邀市第一人民医院张教授主讲。欢迎各位志愿者参与并协助老人们进行线上观看。',
    image: '',
    likes: 28,
    isLiked: false,
    comments: [
      { id: '601', author: '李志愿', content: '已报名，期待参加！', time: Date.now() - 86400000 * 4.5, avatar: '/static/avatars/avatar1.svg' }
    ],
    tags: ['健康讲座', '活动预告'],
    type: 'activity',
    isTop: false
  }
]);

// 根据当前选中的标签过滤帖子
const filteredPosts = computed(() => {
  const type = tabs.value[currentTab.value].type;
  if (type === 'announcement') {
    return posts.value.filter(post => post.isTop || post.type === type);
  } else {
    return posts.value.filter(post => !post.isTop && post.type === type);
  }
});

// 是否有更多帖子
const hasMorePosts = ref(true);

// 加载更多帖子
const loadMorePosts = () => {
  // TODO: [后端接口] 加载更多帖子
  // 实现接口: GET /api/community/posts?type=xxx&page=2&pageSize=10
  setTimeout(() => {
    hasMorePosts.value = false;
  }, 1000);
};

// 判断帖子是否为当前用户发布
const isCurrentUser = (post) => {
  return post.authorId === currentUser.value.id;
};

// 确认删除帖子
const confirmDeletePost = (post) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条帖子吗？',
    success: (res) => {
      if (res.confirm) {
        deletePost(post.id);
      }
    }
  });
};

// 删除帖子
const deletePost = (postId) => {
  // TODO: [后端接口] 删除帖子
  // 实现接口: POST /api/community/delete-post
  const index = posts.value.findIndex(p => p.id === postId);
  if (index !== -1) {
    posts.value.splice(index, 1);
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
};

// 点赞帖子
const likePost = (postId) => {
  // TODO: [后端接口] 点赞/取消点赞帖子
  // 实现接口: POST /api/community/like
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    if (post.isLiked) {
      post.likes--;
      post.isLiked = false;
    } else {
      post.likes++;
      post.isLiked = true;
    }
  }
};

// 评论帖子
const commentPost = (postId) => {
  currentPostId.value = postId;
  currentPost.value = posts.value.find(p => p.id === postId);
  commentModalVisible.value = true;
};

// 处理评论提交
const handleCommentSubmit = ({ postId, comment }) => {
  // TODO: [后端接口] 提交评论
  // 实现接口: POST /api/community/comment
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.comments.unshift(comment); // 将新评论添加到评论列表的开头
    // 更新当前帖子的评论
    if (currentPost.value && currentPost.value.id === postId) {
      currentPost.value = post;
    }
  }
};

// 关闭评论弹窗
const closeCommentModal = () => {
  commentModalVisible.value = false;
  currentPostId.value = '';
  currentPost.value = null;
};

// 打开发布弹窗
const publishModalVisible = ref(false);

// 打开发布弹窗
const openPublishModal = () => {
  publishModalVisible.value = true;
};

// 关闭发布弹窗
const closePublishModal = () => {
  publishModalVisible.value = false;
};

// 处理发布提交
const handlePublishSubmit = (postData) => {
  // TODO: [后端接口] 发布帖子
  // 实现接口: POST /api/community/publish
  // 添加当前用户信息
  postData.authorId = currentUser.value.id;
  
  // 添加到帖子列表
  posts.value.unshift(postData);
  
  // 提示发布成功
  uni.showToast({
    title: '发布成功',
    icon: 'success'
  });
};

// 分享帖子
const sharePost = (postId) => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  });
};

// 格式化时间
const formatTime = (timestamp) => {
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

// 切换标签页
const switchTab = (tabName) => {
  if (tabName === 'call-center') {
    uni.reLaunch({
      url: '/pages/volunteer/call-center/index'
    });
  } else if (tabName === 'community') {
    return;
  } else if (tabName === 'manage') {
    uni.reLaunch({
      url: '/pages/volunteer/manage/index'
    });
  }
};
</script>

<style>
/* 社区页样式 */
.community-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #66BB6A 0%, #A5D6A7 40%, #2E7D32 100%);
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

/* 顶部分类导航 */
.category-nav {
  display: flex;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16rpx 0;
  position: sticky;
  top: 0;
  z-index: 9;
}

.category-item {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.category-item.active {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-weight: 500;
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

/* 帖子列表 */
.post-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  box-sizing: border-box;
}

/* 帖子卡片 */
.post-card {
  background-color: rgba(255, 255, 255, 0.60);
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2px 6px rgba(45, 52, 54, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #E8E0D8;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-time {
  font-size: 22rpx;
  color: #A0A6AD;
}

.post-more {
  padding: 6rpx;
}

/* 帖子内容 */
.post-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.post-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3436;
  line-height: 1.4;
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.post-text {
  font-size: 28rpx;
  color: #636E72;
  line-height: 1.6;
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.post-image-container {
  margin-top: 16rpx;
  width: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.post-image {
  width: 100%;
  height: 400rpx;
  object-fit: cover;
}

/* 帖子底部 */
.post-footer {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 8rpx;
  width: 100%;
  box-sizing: border-box;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

.post-tag {
  background-color: rgba(102, 187, 106, 0.1);
  border-radius: 6rpx;
  padding: 4rpx 12rpx;
}

.post-tag text {
  font-size: 22rpx;
  color: #2E7D32;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 8rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(45, 52, 54, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 30rpx;
  transition: all 0.2s ease;
}

.action-item:active {
  background-color: rgba(45, 52, 54, 0.08);
  transform: scale(0.95);
}

.action-item text {
  font-size: 24rpx;
  color: #636E72;
}

/* 已点赞状态 */
.action-item.liked text {
  color: var(--success-color, #26c274d8);
}

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 30rpx 0;
}

.load-more text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.load-more.end text {
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

/* 发布按钮 */
.publish-fab {
  position: fixed;
  bottom: 120rpx;
  right: 30rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 89;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.publish-fab:active {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0.9);
}

.publish-fab icon-svg {
  width: 60rpx;
  height: 60rpx;
}

/* 删除按钮样式 */
.delete-btn {
  padding: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.delete-btn:active {
  background-color: rgba(255, 82, 82, 0.1);
  transform: scale(0.95);
}
</style>