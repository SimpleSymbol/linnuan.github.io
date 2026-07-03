<template>
  <view class="emotion-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-btn" @tap="goBack">
        <icon-svg name="icon-back" size="normal" color="white"></icon-svg>
      </view>
      <text class="navbar-title">情感监测报告</text>
      <!-- 刷新按钮 - 每次点击调用后端重新分析 -->
      <view class="refresh-btn" @tap="refreshEmotionData" :class="{ refreshing: isAnalyzing }">
        <text class="refresh-icon">{{ isAnalyzing ? '⏳' : '↻' }}</text>
        <text class="refresh-text">{{ isAnalyzing ? '分析中...' : '刷新' }}</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content-area" scroll-y="true" :show-scrollbar="false">
      
      <!-- 分析加载中 -->
      <view class="analyzing-overlay" v-if="isFirstLoading">
        <view class="analyzing-card">
          <view class="analyzing-icon">🔍</view>
          <text class="analyzing-text">正在分析您的近48小时对话...</text>
          <text class="analyzing-sub">AI正在综合分析您的聊天记录</text>
          <view class="analyzing-dots">
            <span></span><span></span><span></span>
          </view>
        </view>
      </view>

      <!-- 情感概览卡片（真实分析结果） -->
      <view v-else>
        
        <!-- 概览卡片 -->
        <view class="overview-card" :class="emotionClass">
          <view class="emotion-icon">
            <text class="emotion-emoji">{{ emotionEmoji }}</text>
          </view>
          <view class="emotion-summary">
            <text class="emotion-title">{{ emotionTitle }}</text>
            <text class="emotion-desc">{{ emotionDescription }}</text>
            <view class="analysis-meta" v-if="moodData.analyzedAt">
              <text>基于 {{ moodData.dialogCount || 0 }} 条近48小时对话</text>
              <text> · {{ formatAnalyzedTime(moodData.analyzedAt) }}</text>
            </view>
          </view>
        </view>
        
        <!-- AI分析建议卡片 -->
        <view class="suggestion-card ai-suggestion" v-if="moodData.suggest && !moodData.suggest.includes('无法分析')">
          <view class="suggestion-header">
            <icon-svg name="icon-emotion" size="normal" color="#E64A19"></icon-svg>
            <text class="section-title">AI 情感分析与建议</text>
          </view>
          <view class="ai-analysis-body">
            <text class="mood-label">
              当前情绪状态：
              <text class="mood-tag" :class="'tag-' + (moodData.mood || 'unknown')">
                {{ moodData.mood || '未知' }}
              </text>
            </text>
            <view class="suggest-content">
              <text class="suggest-main">{{ moodData.suggest }}</text>
            </view>
          </view>
          
          <!-- 对话量提示 -->
          <view class="dialog-count-bar" v-if="moodData.dialogCount > 0">
            <view class="count-item">
              <text class="count-num">{{ moodData.dialogCount }}</text>
              <text class="count-label">条有效对话</text>
            </view>
            <view class="count-divider"></view>
            <view class="count-item">
              <text class="count-num">48</text>
              <text class="count-label">小时范围</text>
            </view>
            <view class="count-divider"></view>
            <view class="count-item">
              <text class="count-num">{{ getMoodScore(moodData.mood) }}</text>
              <text class="count-label">情绪指数</text>
            </view>
          </view>
        </view>
        
        <!-- 无足够数据 -->
        <view class="no-data-card" v-if="!moodData.mood || moodData.suggest.includes('无法分析')">
          <view class="no-data-icon">💬</view>
          <text class="no-data-title">暂无足够的对话数据</text>
          <text class="no-data-desc">请先与AI陪伴助手进行至少一次完整对话，再回来查看分析结果。</text>
          <view class="go-chat-btn" @tap="goToChat">
            <text>去聊一聊 →</text>
          </view>
        </view>
        
        <!-- 历史趋势占位（保留UI结构，后续可扩展） -->
        <view class="trend-card" v-if="moodData.mood && !moodData.suggest.includes('无法分析')">
          <text class="section-title">情绪变化参考</text>
          <view class="current-state-display">
            <view class="state-bar">
              <view 
                class="state-segment" 
                :class="getMoodSegmentClass(moodData.mood)"
                :style="{ width: getMoodBarWidth(moodData.mood) }"
              ></view>
            </view>
            <view class="state-labels">
              <text>低落</text>
              <text>平和</text>
              <text>开心</text>
            </view>
          </view>
          <text class="trend-note">* 当前数据基于近48小时全部会话的综合分析，后续将支持周度/月度趋势对比</text>
        </view>
        
        <!-- 温馨提示 -->
        <view class="tip-card" v-if="moodData.mood && !moodData.suggest.includes('无法分析')">
          <text class="section-title">温馨提示</text>
          <view class="tips-list">
            <view class="tip-item" v-for="(tip, idx) in tipsForMood(moodData.mood)" :key="idx">
              <text>{{ tip }}</text>
            </view>
          </view>
        </view>
        
        <!-- 底部安全间距 -->
        <view style="height: 30rpx;"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import IconSvg from '@/components/IconSvg.vue';
import { request } from '@/utils/request.js';

// ========== 状态 ==========
const isFirstLoading = ref(true);   // 首次加载
const isAnalyzing = ref(false);     // 刷新中

// 后端返回的真实分析结果
const moodData = ref({
  currentMood: null,
  mood: null,
  suggest: '',
  dialogCount: 0,
  analyzedAt: ''
});

// ========== 计算属性 ==========

const emotionEmoji = computed(() => {
  if (!moodData.value.mood) return '😶';
  const map = {
    '开心': '😊', '平和': '😌', '孤单': '🥺', '难过': '😢',
    '思念家人': '🏠', '烦躁': '😤', '焦虑': '😰'
  };
  return map[moodData.value.mood] || '😐';
});

const emotionTitle = computed(() => {
  if (!moodData.value.mood) return '暂无数据';
  return `当前情绪：${moodData.value.mood}`;
});

const emotionDescription = computed(() => {
  if (!moodData.value.mood) return '等待分析...';
  const map = {
    '开心': '状态很好！继续保持积极的心态',
    '平和': '情绪稳定，一切安好',
    '孤单': '似乎有些孤独，多和身边的人聊聊吧',
    '难过': '最近可能有些不顺心，别一个人扛着',
    '思念家人': '想念亲人了，可以打个电话给他们',
    '烦躁': '有些事情让你心烦，试着深呼吸放松一下',
    '焦虑': '不要太担心，慢慢来，一切都会好的'
  };
  return map[moodData.value.mood] || '已为您完成情绪分析';
});

const emotionClass = computed(() => {
  if (!moodData.value.mood) return 'neutral';
  const positive = ['开心', '平和'];
  const negative = ['孤单', '难过', '焦虑', '烦躁'];
  if (positive.includes(moodData.value.mood)) return 'positive';
  if (negative.includes(moodData.value.mood)) return 'negative';
  return 'neutral';
});

// ========== 核心方法 ==========

/**
 * 加载/刷新情感数据 — 调用后端真实接口
 */
async function refreshEmotionData() {
  // 防止重复请求
  if (isAnalyzing.value) return;
  
  isAnalyzing.value = true;
  
  try {
    const userInfo = uni.getStorageSync('userInfo') || {};
    const userId = userInfo.phone || '';
    
    if (!userId) {
      console.warn('未登录，无法获取情感数据');
      moodData.value = { mood: null, suggest: '未检测到用户信息，请先登录', dialogCount: 0, analyzedAt: '' };
      return;
    }
    
    // 调后端 POST /api/analyze-user-mood（每次都实时分析）
    const res = await request.post('/analyze-user-mood', { userId });
    
    if (res.success) {
      moodData.value = {
        mood: res.mood,
        suggest: res.suggest,
        dialogCount: res.dialogCount || 0,
        analyzedAt: new Date().toISOString()
      };
    } else {
      console.error('心情分析失败:', res.message);
      moodData.value = { mood: null, suggest: res.message || '分析服务暂时不可用', dialogCount: 0, analyzedAt: '' };
    }
  } catch (error) {
    console.error('获取情感数据异常:', error);
    moodData.value = { mood: null, suggest: '网络连接异常，请检查网络后重试', dialogCount: 0, analyzedAt: '' };
  } finally {
    isFirstLoading.value = false;
    isAnalyzing.value = false;
  }
}

/**
 * 页面初始化时自动加载数据
 */
onMounted(() => {
  refreshEmotionData();
});

// ========== 辅助方法 ==========

function formatAnalyzedTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function getMoodScore(mood) {
  if (!mood) return '--';
  const map = { '开心': 9, '平和': 7, '孤单': 4, '难过': 3, '思念家人': 4, '烦躁': 3, '焦虑': 2 };
  return map[mood] || 5;
}

function getMoodSegmentClass(mood) {
  if (!mood) return 'seg-neutral';
  const pos = ['开心'];
  const neg = ['孤单','难过','焦虑','烦躁','思念家人'];
  if (pos.includes(mood)) return 'seg-positive';
  if (neg.includes(mood)) return 'seg-negative';
  return 'seg-neutral';
}

function getMoodBarWidth(mood) {
  if (!mood) return '33%';
  const map = { '开心': '85%', '平和': '60%', '孤单': '35%', '难过': '25%', '思念家人': '32%', '烦躁': '28%', '焦虑': '20%' };
  return map[mood] || '50%';
}

function tipsForMood(mood) {
  if (!mood) return [];
  const allTips = {
    '开心': [
      '保持这份好心情，多和朋友分享快乐',
      '可以把开心的经历记录下来，以后回忆也温暖',
      '适当运动能让好心情持续更久'
    ],
    '平和': [
      '平稳的情绪是最好的养生方式',
      '保持规律作息，让身心更加舒畅',
      '可以尝试一些新的兴趣爱好'
    ],
    '孤单': [
      '试着给老朋友或家人打个电话',
      '社区活动是认识新朋友的好机会',
      '与AI陪伴多聊聊也是一种排解方式'
    ],
    '难过': [
      '难过的时候不要憋着，找人倾诉会好很多',
      '听听喜欢的音乐，看看以前的照片',
      '每一次低谷都是下一次反弹的开始'
    ],
    '思念家人': [
      '现在联系他们还来得及，一个电话就能传递思念',
      '可以翻翻旧照片回忆美好时光',
      '把想对家人说的话写下来，下次见面告诉他们'
    ],
    '烦躁': [
      '深呼吸三次，数到十再行动',
      '出去走走，换个环境心情也会变',
      '喝杯温水，让自己先冷静一下'
    ],
    '焦虑': [
      '把担心的事情写下来，一件件去解决',
      '今天能做的事今天做完，明天的事交给明天',
      '信任身边人，你不必独自承担所有'
    ]
  };
  return allTips[mood] || ['保持良好心态，注意身心健康'];
}

function goBack() {
  uni.navigateBack();
}

function goToChat() {
  uni.navigateBack(); // 回到首页就是聊天页
}
</script>

<style>
.emotion-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #FF8A65 0%, #FFAB91 40%, #E64A19 100%);
  position: relative;
  overflow: hidden;
  max-width: 100%;
}

/* ========== 导航栏 ========== */
.navbar {
  height: 90rpx;
  background-color: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}
.back-btn {
  position: absolute;
  left: 30rpx;
  height: 60rpx; width: 60rpx;
  display: flex; align-items: center; justify-content: center;
}
.navbar-title {
  font-size: 36rpx; font-weight: 600; color: white;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* 刷新按钮 */
.refresh-btn {
  position: absolute;
  right: 30rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  background-color: rgba(255,255,255,0.18);
  border-radius: 24rpx;
  padding: 8rpx 18rpx;
  transition: opacity 0.2s;
}
.refresh-btn:active, .refresh-btn.refreshing { opacity: 0.6; }
.refresh-icon { font-size: 26rpx; color: white; animation: rotate 1.5s linear infinite; }
.refresh-btn:not(.refreshing) .refresh-icon { animation: none; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.refresh-text { font-size: 22rpx; color: white; }

/* ========== 内容区域 ========== */
.content-area {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* ========== 分析中覆盖层 ========== */
.analyzing-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500rpx;
}
.analyzing-card {
  background: rgba(255,255,255,0.85);
  border-radius: 28rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.12);
}
.analyzing-icon { font-size: 80rpx; margin-bottom: 16rpx; }
.analyzing-text {
  font-size: 32rpx; font-weight: 600; color: #2D3436; display: block; margin-bottom: 10rpx;
}
.analyzing-sub {
  font-size: 26rpx; color: #636E72; display: block; margin-bottom: 30rpx;
}
.analyzing-dots { display: inline-flex; gap: 12rpx; }
.analyzing-dots span {
  width: 16rpx; height: 16rpx; border-radius: 50%; background: #E64A19;
  animation: bounceDot 1.4s infinite ease-in-out both;
}
.analyzing-dots span:nth-child(1){animation-delay:-0.32s;}
.analyzing-dots span:nth-child(2){animation-delay:-0.16s;}
@keyframes bounceDot{0%,80%,100%{transform:scale(0.5);opacity:0.3;}40%{transform:scale(1);opacity:1;}}

/* ========== 概览卡片 ========== */
.overview-card {
  width: 100%; border-radius: 24rpx; padding: 44rpx 24rpx; margin-bottom: 24rpx;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  backdrop-filter: blur(8px); box-sizing: border-box;
}
.overview-card.positive { background-color: rgba(102,187,106,0.3); }
.overview-card.neutral { background-color: rgba(158,158,158,0.3); }
.overview-card.negative { background-color: rgba(231,76,60,0.3); }

.emotion-icon { margin-bottom: 18rpx; }
.emotion-emoji { font-size: 110rpx; line-height: 1.2; }
.emotion-summary { display: flex; flex-direction: column; align-items: center; width: 100%; }
.emotion-title { font-size: 34rpx; font-weight: 600; color: white; margin-bottom: 8rpx; text-align: center; }
.emotion-desc { font-size: 27rpx; color: rgba(255,255,255,0.88); text-align: center; padding: 0 16rpx; }
.analysis-meta {
  margin-top: 14rpx; font-size: 22rpx; color: rgba(255,255,255,0.65);
  display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 4rpx;
}

/* ========== AI分析建议卡片 ========== */
.suggestion-card.ai-suggestion {
  background-color: rgba(255,255,255,0.78);
  border-radius: 24rpx; padding: 28rpx 24rpx; margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  backdrop-filter: blur(8px); box-sizing: border-box;
}
.suggestion-header {
  display: flex; align-items: center; gap: 10rpx; margin-bottom: 18rpx;
}
.section-title { font-size: 31rpx; font-weight: 600; color: #2D3436; display: block; }
.ai-analysis-body { margin-bottom: 20rpx; }
.mood-label {
  font-size: 27rpx; color: #636E72; display: block; margin-bottom: 14rpx;
}
.mood-tag {
  font-weight: 600; font-size: 29rpx; padding: 4rpx 18rpx; border-radius: 20rpx; margin-left: 8rpx;
}
.tag-开心,.tag-平和 { background: rgba(102,187,106,0.15); color: #43A047; }
.tag-孤单,.tag-难过 { background: rgba(231,76,60,0.12); color: #C0392B; }
.tag-烦躁,.tag-焦虑 { background: rgba(230,126,34,0.13); color: #D35400; }
.tag-思念家人 { background: rgba(155,89,182,0.12); color: #8E44AD; }
.tag-unknown { background: rgba(149,165,166,0.15); color: #7F8C8D; }

.suggest-content {
  background: rgba(230,74,25,0.06); border-radius: 16rpx; padding: 20rpx 22rpx;
}
.suggest-main { font-size: 29rpx; color: #2D3436; line-height: 1.6; word-break: break-all; }

/* 对话统计条 */
.dialog-count-bar {
  display: flex; align-items: center; justify-content: space-around;
  background: rgba(45,52,54,0.04); border-radius: 16rpx; padding: 22rpx 16rpx; margin-top: 16rpx;
}
.count-item { display: flex; flex-direction: column; align-items: center; }
.count-num { font-size: 38rpx; font-weight: 700; color: #E64A19; }
.count-label { font-size: 22rpx; color: #a0a6ad; margin-top: 4rpx; }
.count-divider { width: 1rpx; height: 48rpx; background: rgba(0,0,0,0.08); }

/* ========== 无数据卡片 ========== */
.no-data-card {
  background: rgba(255,255,255,0.75); border-radius: 24rpx; padding: 56rpx 32rpx; margin-bottom: 24rpx;
  text-align: center; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}
.no-data-icon { font-size: 70rpx; margin-bottom: 16rpx; }
.no-data-title { font-size: 33rpx; font-weight: 600; color: #2D3436; display: block; margin-bottom: 10rpx; }
.no-data-desc { font-size: 27rpx; color: #636E72; display: block; margin-bottom: 28rpx; line-height: 1.5; }
.go-chat-btn {
  display: inline-block; background: linear-gradient(90deg,#FF8A65,#E64A19);
  color: white; font-size: 29rpx; font-weight: 500; padding: 18rpx 48rpx; border-radius: 30rpx;
}
.go-chat-btn:active { opacity: 0.85; transform: scale(0.97); }

/* ========== 趋势卡片 ========== */
.trend-card {
  width: 100%; border-radius: 24rpx; padding: 28rpx 24rpx; margin-bottom: 24rpx;
  background-color: rgba(255,255,255,0.75); box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  backdrop-filter: blur(8px); box-sizing: border-box;
}
.current-state-display { margin-top: 16rpx; }
.state-bar {
  height: 16rpx; background: rgba(189,195,199,0.4); border-radius: 8rpx; overflow: hidden; margin-bottom: 10rpx;
}
.state-segment { height: 100%; border-radius: 8rpx; transition: width 0.6s ease; }
.seg-positive { background: linear-gradient(90deg, #66BB6A, #43A047); }
.seg-neutral { background: linear-gradient(90deg, #9E9E9E, #757575); }
.seg-negative { background: linear-gradient(90deg, #E74C3C, #C0392B); }
.state-labels {
  display: flex; justify-content: space-between;
}
.state-labels text { font-size: 23rpx; color: #95a5a6; }
.trend-note {
  font-size: 23rpx; color: #bdc3c7; margin-top: 14rpx; display: block; line-height: 1.4;
}

/* ========== 提示卡片 ========== */
.tip-card {
  width: 100%; border-radius: 24rpx; padding: 28rpx 24rpx; margin-bottom: 24rpx;
  background-color: rgba(255,255,255,0.75); box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  backdrop-filter: blur(8px); box-sizing: border-box;
}
.tips-list { margin-top: 12rpx; }
.tip-item {
  padding: 14rpx 0; border-bottom: 1rpx solid rgba(0,0,0,0.05); width: 100%; box-sizing: border-box;
}
.tip-item:last-child { border-bottom: none; }
.tip-item text {
  font-size: 28rpx; color: #555; line-height: 1.5; word-break: break-all; display: block;
  padding-left: 1.2em; position: relative;
}
/* 全局溢出保护 */
.overview-card,.ai-suggestion,.no-data-card,.trend-card,.tip-card { max-width: 100%; overflow: hidden; }
.emotion-title,.emotion-desc,.section-title,.suggest-main,.no-data-title,.no-data-desc,.trend-note,.tip-item text {
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; word-break: break-word;
}
</style>
