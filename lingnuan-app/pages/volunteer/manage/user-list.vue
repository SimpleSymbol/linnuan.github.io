<template>
  <view class="user-list-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @tap="goBack">
        <icon-svg name="icon-back" size="normal" color="white"></icon-svg>
      </view>
      <text class="navbar-title">用户档案列表</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input-wrapper">
        <icon-svg name="icon-search" size="small" color="gray"></icon-svg>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索用户姓名、ID或手机号" 
          @input="handleSearch"
        />
        <view class="clear-btn" v-if="searchKeyword" @tap="clearSearch">
          <text>×</text>
        </view>
      </view>
    </view>
    
    <!-- 用户列表 -->
    <scroll-view class="user-list" scroll-y="true" :show-scrollbar="false">
      <view 
        class="user-item" 
        v-for="(user, index) in filteredUsers" 
        :key="index"
        @tap="viewUserProfile(user)"
      >
        <view class="user-avatar">
          <image :src="user.avatar || '/static/avatars/avatar1.svg'" mode="aspectFill"></image>
        </view>
        <view class="user-info">
          <view class="user-name-id">
            <text class="user-name">{{ user.name }}</text>
            <text class="user-id">ID: {{ user.id }}</text>
          </view>
          <view class="user-details">
            <text class="user-age-gender">{{ user.age }}岁 {{ user.gender }}</text>
            <text class="user-phone">{{ user.phone }}</text>
          </view>
        </view>
        <view class="user-arrow">
          <text>›</text>
        </view>
      </view>
      
      <!-- 无搜索结果提示 -->
      <view class="no-result" v-if="filteredUsers.length === 0">
        <text>未找到匹配的用户</text>
      </view>
      
      <!-- 添加用户按钮 -->
      <view class="add-user-btn" @tap="showAddUserModal">
        <text>+</text>
      </view>
    </scroll-view>
    
    <!-- 添加用户弹窗 -->
    <view class="add-user-modal" v-if="showModal" @touchmove.stop.prevent>
      <view class="modal-mask" @tap="closeModal"></view>
      <view class="modal-container">
        <view class="modal-header">
          <text class="modal-title">新增用户档案</text>
          <view class="close-btn" @tap="closeModal">×</view>
        </view>
        
        <scroll-view class="modal-content" scroll-y="true">
          <view class="form-item">
            <text class="form-label">姓名</text>
            <input class="form-input" v-model="newUser.name" placeholder="请输入用户姓名" />
          </view>
          
          <view class="form-item">
            <text class="form-label">年龄</text>
            <input class="form-input" v-model="newUser.age" placeholder="请输入用户年龄" type="number" />
          </view>
          
          <view class="form-item">
            <text class="form-label">性别</text>
            <view class="gender-selector">
              <view 
                class="gender-option" 
                :class="{'selected': newUser.gender === '男'}" 
                @tap="newUser.gender = '男'"
              >男</view>
              <view 
                class="gender-option" 
                :class="{'selected': newUser.gender === '女'}" 
                @tap="newUser.gender = '女'"
              >女</view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="form-input" v-model="newUser.phone" placeholder="请输入手机号" type="number" />
          </view>
          
          <view class="form-item">
            <text class="form-label">地址</text>
            <input class="form-input" v-model="newUser.address" placeholder="请输入地址" />
          </view>
          
          <view class="form-item">
            <text class="form-label">血型</text>
            <input class="form-input" v-model="newUser.bloodType" placeholder="请输入血型" />
          </view>
          
          <view class="form-item">
            <text class="form-label">过敏史</text>
            <input class="form-input" v-model="newUser.allergies" placeholder='请输入过敏史，无则填"无"' />
          </view>
          
          <view class="form-item">
            <text class="form-label">慢性病</text>
            <input class="form-input" v-model="newUser.chronicDiseases" placeholder='请输入慢性病，无则填"无"' />
          </view>
          
          <view class="form-item">
            <text class="form-label">用药情况</text>
            <input class="form-input" v-model="newUser.medications" placeholder='请输入用药情况，无则填"无"' />
          </view>
          
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea class="form-textarea" v-model="newUser.notes" placeholder="请输入备注信息" />
          </view>
          
          <view class="form-item">
            <text class="form-label">紧急联系人</text>
            <view class="emergency-contacts">
              <view class="emergency-contact" v-for="(contact, index) in newUser.emergencyContacts" :key="index">
                <view class="contact-inputs">
                  <input class="contact-input" v-model="contact.name" placeholder="姓名" />
                  <input class="contact-input" v-model="contact.relation" placeholder="关系" />
                  <input class="contact-input" v-model="contact.phone" placeholder="电话" />
                </view>
                <view class="remove-contact" @tap="removeEmergencyContact(index)">×</view>
              </view>
              <view class="add-contact-btn" @tap="addEmergencyContact">
                <text>+ 添加紧急联系人</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @tap="closeModal">取消</view>
          <view class="modal-btn confirm-btn" @tap="addUser()">
            <text>确认添加</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 搜索关键词
const searchKeyword = ref('');

// TODO: [后端接口] 获取用户档案列表
// 实现接口: GET /api/user/profiles?keyword=xxx
// 以下为模拟数据，后端实现后移除
const userList = ref([
  {
    id: '001',
    name: '张大爷',
    age: '78',
    gender: '男',
    phone: '13888888888',
    avatar: '/static/avatars/avatar1.svg',
    address: '上海市黄浦区人民路100号',
    bloodType: 'A型',
    allergies: '青霉素',
    chronicDiseases: '高血压、糖尿病',
    medications: '降压药、降糖药',
    emergencyContacts: [
      {
        name: '张小明',
        relation: '儿子',
        phone: '13999990000'
      },
      {
        name: '李护士',
        relation: '社区护工',
        phone: '13777770000'
      }
    ],
    notes: '老人有轻度认知障碍，需要定期提醒服药。喜欢听京剧，可以作为交流话题。'
  },
  {
    id: '002',
    name: '李奶奶',
    age: '82',
    gender: '女',
    phone: '13555555678',
    avatar: '/static/avatars/avatar2.svg',
    address: '上海市徐汇区华山路200号',
    bloodType: 'B型',
    allergies: '无',
    chronicDiseases: '关节炎',
    medications: '止痛药',
    emergencyContacts: [
      {
        name: '李小红',
        relation: '女儿',
        phone: '13666660000'
      }
    ],
    notes: '行动不便，需要协助。听力较差，交流时需要放慢语速并提高音量。'
  },
  {
    id: '003',
    name: '王爷爷',
    age: '75',
    gender: '男',
    phone: '13999992345',
    avatar: '/static/avatars/avatar3.svg',
    address: '上海市静安区南京西路300号',
    bloodType: 'O型',
    allergies: '海鲜',
    chronicDiseases: '心脏病',
    medications: '心脏药',
    emergencyContacts: [
      {
        name: '王小刚',
        relation: '儿子',
        phone: '13888880000'
      },
      {
        name: '王小丽',
        relation: '女儿',
        phone: '13777770000'
      }
    ],
    notes: '老人性格开朗，喜欢聊天。每周三需要去医院复查心脏。'
  },
  {
    id: '004',
    name: '赵婆婆',
    age: '80',
    gender: '女',
    phone: '13699999012',
    avatar: '/static/avatars/avatar2.svg',
    address: '上海市长宁区长宁路400号',
    bloodType: 'AB型',
    allergies: '花粉',
    chronicDiseases: '哮喘',
    medications: '哮喘药',
    emergencyContacts: [
      {
        name: '赵医生',
        relation: '家庭医生',
        phone: '13333330000'
      }
    ],
    notes: '独居老人，需要定期心理疏导。喜欢养花，可以围绕植物话题交流。'
  }
]);

// 根据搜索关键词过滤用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) return userList.value;
  
  const keyword = searchKeyword.value.toLowerCase();
  return userList.value.filter(user => {
    return user.name.toLowerCase().includes(keyword) ||
           user.id.toLowerCase().includes(keyword) ||
           user.phone.includes(keyword);
  });
});

// 处理搜索
const handleSearch = () => {
  // 实时搜索，不需要额外处理
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
};

// 查看用户档案
const viewUserProfile = (user) => {
  // 保存选中的用户数据到本地存储
  uni.setStorageSync('currentUserProfile', JSON.stringify(user));
  
  // 跳转到用户档案页面
  uni.navigateTo({
    url: '/pages/volunteer/manage/profile'
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    success: function() {
      console.log('返回成功');
    },
    fail: function() {
      uni.reLaunch({
        url: '/pages/volunteer/manage/index'
      });
    }
  });
};

// 页面加载时获取用户列表
onMounted(() => {
  // TODO: [后端接口] 获取用户列表
  // 实现接口: GET /api/user/profiles
  getUserList();
});

// 获取用户列表
const getUserList = () => {
  // TODO: [后端接口] 获取用户档案列表
  // 实现接口: GET /api/user/profiles
  // 以下为模拟获取数据的代码，后端实现后移除
  console.log('获取用户列表');
};

// 添加用户相关逻辑
const showModal = ref(false);
const newUser = reactive({
  name: '',
  age: '',
  gender: '男',
  phone: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  medications: '',
  notes: '',
  emergencyContacts: [
    {
      name: '',
      relation: '',
      phone: ''
    }
  ]
});

// 显示添加用户弹窗
const showAddUserModal = () => {
  showModal.value = true;
};

// 关闭添加用户弹窗
const closeModal = () => {
  showModal.value = false;
  // 重置表单
  Object.assign(newUser, {
    name: '',
    age: '',
    gender: '男',
    phone: '',
    address: '',
    bloodType: '',
    allergies: '',
    chronicDiseases: '',
    medications: '',
    notes: '',
    emergencyContacts: [
      {
        name: '',
        relation: '',
        phone: ''
      }
    ]
  });
};

// 添加紧急联系人
const addEmergencyContact = () => {
  newUser.emergencyContacts.push({
    name: '',
    relation: '',
    phone: ''
  });
};

// 移除紧急联系人
const removeEmergencyContact = (index) => {
  if (newUser.emergencyContacts.length > 1) {
    newUser.emergencyContacts.splice(index, 1);
  }
};

// 添加用户
const addUser = () => {
  // 表单验证
  if (!newUser.name) {
    uni.showToast({
      title: '请输入用户姓名',
      icon: 'none'
    });
    return;
  }
  
  if (!newUser.age) {
    uni.showToast({
      title: '请输入用户年龄',
      icon: 'none'
    });
    return;
  }
  
  if (!newUser.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    });
    return;
  }
  
  // TODO: [后端接口] 创建用户档案
  // 实现接口: POST /api/user/create-profile
  // 以下为模拟创建用户的代码，后端实现后移除
  
  // 生成新ID (简单实现，实际应由后端生成)
  const newId = (parseInt(userList.value[userList.value.length - 1].id) + 1).toString().padStart(3, '0');
  
  // 创建新用户对象
  const user = {
    id: newId,
    name: newUser.name,
    age: newUser.age,
    gender: newUser.gender,
    phone: newUser.phone,
    avatar: newUser.gender === '男' ? '/static/avatars/avatar1.svg' : '/static/avatars/avatar2.svg',
    address: newUser.address,
    bloodType: newUser.bloodType,
    allergies: newUser.allergies,
    chronicDiseases: newUser.chronicDiseases,
    medications: newUser.medications,
    notes: newUser.notes,
    emergencyContacts: newUser.emergencyContacts.filter(contact => contact.name && contact.phone)
  };
  
  // 添加到用户列表
  userList.value.push(user);
  
  // 关闭弹窗
  closeModal();
  
  // 提示添加成功
  uni.showToast({
    title: '添加用户成功',
    icon: 'success'
  });
};
</script>

<style>
/* 全局隐藏滚动条 */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

/* Firefox */
* {
  scrollbar-width: none !important;
}

/* IE and Edge */
* {
  -ms-overflow-style: none !important;
}

/* 用户列表页样式 */
.user-list-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(125deg, #66BB6A 0%, #A5D6A7 40%, #2E7D32 100%);
  position: relative;
  overflow-x: hidden; /* 防止横向滚动 */
}

/* 顶部导航栏 */
.navbar {
  height: 90rpx;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  position: relative;
  z-index: 10;
}

.navbar-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-right: 15rpx;
}

.navbar-title {
  flex: 1;
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
}

.navbar-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 搜索框 */
.search-box {
  padding: 15rpx 15rpx;
  width: 100%;
  box-sizing: border-box;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
  box-shadow: 0 1px 4px rgba(45, 52, 54, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 60rpx;
  margin-left: 15rpx;
  font-size: 28rpx;
  color: #2D3436;
}

.clear-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn text {
  font-size: 40rpx;
  color: #A0A6AD;
}

/* 用户列表 */
.user-list {
  flex: 1;
  padding: 0 10rpx;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.user-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 20rpx;
  padding: 20rpx 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 6px rgba(45, 52, 54, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.user-avatar {
  width: 90rpx;
  height: 90rpx;
  margin-right: 15rpx;
  flex-shrink: 0;
}

.user-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 确保flex子项可以收缩 */
  overflow: hidden; /* 防止内容溢出 */
}

.user-name-id {
  display: flex;
  align-items: baseline;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
}

.user-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3436;
  margin-right: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-id {
  font-size: 22rpx;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-age-gender {
  font-size: 24rpx;
  color: #636E72;
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-phone {
  font-size: 24rpx;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-arrow {
  font-size: 36rpx;
  color: #A0A6AD;
  font-weight: 300;
  margin-left: 10rpx;
  flex-shrink: 0;
}

/* 无搜索结果提示 */
.no-result {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.no-result text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 添加用户按钮 */
.add-user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(46, 125, 50, 0.8);
  border-radius: 50%;
  width: 100rpx;
  height: 100rpx;
  position: fixed;
  bottom: 50rpx;
  right: 50rpx;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.add-user-btn:active {
  transform: scale(0.95);
  background-color: rgba(46, 125, 50, 0.9);
}

.add-user-btn text {
  color: white;
  font-size: 50rpx;
  font-weight: 500;
  line-height: 1;
}

/* 添加用户弹窗 */
.add-user-modal {
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
  width: 92%;
  max-width: 650rpx;
  height: 85%;
  background-color: white;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
  box-sizing: border-box;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(50rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 25rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  background-color: #66BB6A;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  flex: 1;
  text-align: center;
}

.close-btn {
  font-size: 44rpx;
  color: white;
  line-height: 1;
  padding: 0 10rpx;
  flex-shrink: 0;
}

.modal-content {
  flex: 1;
  padding: 20rpx 15rpx;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
}

.form-item {
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #2D3436;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #FFF8F3;
  border-radius: 10rpx;
  padding: 0 10rpx;
  font-size: 26rpx;
  color: #2D3436;
  box-sizing: border-box;
  border: 1rpx solid #E8E0D8;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #FFF8F3;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 26rpx;
  color: #2D3436;
  box-sizing: border-box;
  border: 1rpx solid #E8E0D8;
}

.gender-selector {
  display: flex;
  width: 100%;
}

.gender-option {
  flex: 1;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF8F3;
  border: 1rpx solid #E8E0D8;
  font-size: 26rpx;
  color: #2D3436;
}

.gender-option:first-child {
  border-top-left-radius: 10rpx;
  border-bottom-left-radius: 10rpx;
  border-right: none;
}

.gender-option:last-child {
  border-top-right-radius: 10rpx;
  border-bottom-right-radius: 10rpx;
}

.gender-option.selected {
  background-color: #66BB6A;
  color: white;
  border-color: #66BB6A;
}

.emergency-contacts {
  width: 100%;
  box-sizing: border-box;
}

.emergency-contact {
  display: flex;
  flex-direction: column;
  margin-bottom: 15rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 10rpx;
  box-sizing: border-box;
  width: 100%;
}

.contact-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  margin-bottom: 8rpx;
  width: 100%;
  box-sizing: border-box;
}

.contact-input {
  width: 100%;
  height: 65rpx;
  background-color: #FFF8F3;
  border-radius: 8rpx;
  padding: 0 10rpx;
  font-size: 24rpx;
  color: #2D3436;
  box-sizing: border-box;
  border: 1rpx solid #E8E0D8;
}

.remove-contact {
  align-self: flex-end;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ff5252;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(45, 52, 54, 0.1);
}

.add-contact-btn {
  margin-top: 8rpx;
  padding: 12rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF8F3;
  border-radius: 8rpx;
  border: 1rpx dashed #66BB6A;
}

.add-contact-btn text {
  font-size: 24rpx;
  color: #66BB6A;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
  height: 90rpx;
}

.modal-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.cancel-btn {
  color: #636E72;
  background-color: #FFF8F3;
}

.confirm-btn {
  color: white;
  background-color: #66BB6A;
}
</style> 