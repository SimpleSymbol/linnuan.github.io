<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-left" @tap="goBack">
        <icon-svg name="icon-back" size="normal" color="white"></icon-svg>
      </view>
      <text class="navbar-title">用户档案</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view class="content-area" scroll-y="true" :show-scrollbar="false">
      <!-- 用户基本信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="edit-btn" @tap="editSection('basic')">
            <icon-svg name="icon-edit" size="small" color="success"></icon-svg>
            <text>编辑</text>
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">姓名</text>
            <text class="info-value">{{ userProfile.name || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">年龄</text>
            <text class="info-value">{{ userProfile.age || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">性别</text>
            <text class="info-value">{{ userProfile.gender || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">身份证号</text>
            <text class="info-value">{{ formatIdCard(userProfile.idCard) || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">手机号码</text>
            <text class="info-value">{{ userProfile.phone || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">居住地址</text>
            <text class="info-value">{{ userProfile.address || '未填写' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 健康信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">健康信息</text>
          <view class="edit-btn" @tap="editSection('health')">
            <icon-svg name="icon-edit" size="small" color="success"></icon-svg>
            <text>编辑</text>
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">血型</text>
            <text class="info-value">{{ userProfile.bloodType || '未填写' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">过敏史</text>
            <text class="info-value">{{ userProfile.allergies || '无' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">慢性病</text>
            <text class="info-value">{{ userProfile.chronicDiseases || '无' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">用药情况</text>
            <text class="info-value">{{ userProfile.medications || '无' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 紧急联系人卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">紧急联系人</text>
          <view class="edit-btn" @tap="editSection('emergency')">
            <icon-svg name="icon-edit" size="small" color="success"></icon-svg>
            <text>编辑</text>
          </view>
        </view>
        
        <view class="card-content">
          <view v-if="userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0">
            <view 
              class="contact-item" 
              v-for="(contact, index) in userProfile.emergencyContacts" 
              :key="index"
            >
              <view class="contact-info">
                <text class="contact-name">{{ contact.name }}</text>
                <text class="contact-relation">{{ contact.relation }}</text>
              </view>
              <text class="contact-phone">{{ contact.phone }}</text>
            </view>
          </view>
          <view v-else class="empty-contacts">
            <text>暂无紧急联系人</text>
          </view>
        </view>
      </view>
      
      <!-- 备注卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">备注</text>
          <view class="edit-btn" @tap="editSection('notes')">
            <icon-svg name="icon-edit" size="small" color="success"></icon-svg>
            <text>编辑</text>
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-item notes-item">
            <text class="notes-content">{{ userProfile.notes || '暂无备注信息' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 编辑弹窗 -->
    <view class="edit-modal" v-if="showEditModal" @touchmove.stop.prevent>
      <view class="modal-mask" @tap="closeEditModal"></view>
      <view class="modal-container">
        <view class="modal-header">
          <text class="modal-title">{{ getEditTitle() }}</text>
          <view class="close-btn" @tap="closeEditModal">×</view>
        </view>
        
        <scroll-view class="modal-content" scroll-y="true">
          <!-- 基本信息编辑表单 -->
          <view v-if="currentSection === 'basic'">
            <view class="form-item">
              <text class="form-label">姓名</text>
              <input class="form-input" v-model="editForm.name" placeholder="请输入用户姓名" />
            </view>
            
            <view class="form-item">
              <text class="form-label">年龄</text>
              <input class="form-input" v-model="editForm.age" placeholder="请输入用户年龄" type="number" />
            </view>
            
            <view class="form-item">
              <text class="form-label">性别</text>
              <view class="gender-selector">
                <view 
                  class="gender-option" 
                  :class="{'selected': editForm.gender === '男'}" 
                  @tap="editForm.gender = '男'"
                >男</view>
                <view 
                  class="gender-option" 
                  :class="{'selected': editForm.gender === '女'}" 
                  @tap="editForm.gender = '女'"
                >女</view>
              </view>
            </view>
            
            <view class="form-item">
              <text class="form-label">身份证号</text>
              <input class="form-input" v-model="editForm.idCard" placeholder="请输入身份证号" />
            </view>
            
            <view class="form-item">
              <text class="form-label">手机号码</text>
              <input class="form-input" v-model="editForm.phone" placeholder="请输入手机号" type="number" />
            </view>
            
            <view class="form-item">
              <text class="form-label">居住地址</text>
              <input class="form-input" v-model="editForm.address" placeholder="请输入地址" />
            </view>
          </view>
          
          <!-- 健康信息编辑表单 -->
          <view v-if="currentSection === 'health'">
            <view class="form-item">
              <text class="form-label">血型</text>
              <input class="form-input" v-model="editForm.bloodType" placeholder="请输入血型" />
            </view>
            
            <view class="form-item">
              <text class="form-label">过敏史</text>
              <input class="form-input" v-model="editForm.allergies" placeholder='请输入过敏史，无则填"无"' />
            </view>
            
            <view class="form-item">
              <text class="form-label">慢性病</text>
              <input class="form-input" v-model="editForm.chronicDiseases" placeholder='请输入慢性病，无则填"无"' />
            </view>
            
            <view class="form-item">
              <text class="form-label">用药情况</text>
              <input class="form-input" v-model="editForm.medications" placeholder='请输入用药情况，无则填"无"' />
            </view>
          </view>
          
          <!-- 紧急联系人编辑表单 -->
          <view v-if="currentSection === 'emergency'">
            <view class="emergency-contacts">
              <view class="emergency-contact" v-for="(contact, index) in editForm.emergencyContacts" :key="index">
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
          
          <!-- 备注编辑表单 -->
          <view v-if="currentSection === 'notes'">
            <view class="form-item">
              <textarea class="form-textarea" v-model="editForm.notes" placeholder="请输入备注信息" auto-height />
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @tap="closeEditModal">取消</view>
          <view class="modal-btn confirm-btn" @tap="saveChanges">确认修改</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import IconSvg from '@/components/IconSvg.vue';

// 当前选择的编辑区块
const currentSection = ref('');

// 是否显示编辑弹窗
const showEditModal = ref(false);

// TODO: [后端接口] 获取用户档案详情
// 实现接口: GET /api/user/profile?profileId=xxx
// 以下为模拟数据，后端实现后移除
const userProfile = ref({
  id: '',
  name: '',
  age: '',
  gender: '',
  idCard: '',
  phone: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  medications: '',
  emergencyContacts: [],
  notes: ''
});

// 编辑表单数据
const editForm = reactive({
  name: '',
  age: '',
  gender: '男',
  idCard: '',
  phone: '',
  address: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  medications: '',
  emergencyContacts: [],
  notes: ''
});

// 组件挂载时获取用户档案
onMounted(() => {
  // 从本地存储获取用户数据
  try {
    const userProfileData = uni.getStorageSync('currentUserProfile');
    if (userProfileData) {
      userProfile.value = JSON.parse(userProfileData);
      // TODO: [后端接口] 获取用户档案详情
      // 实现接口: GET /api/user/profile?profileId=xxx
      // 实际项目中应通过API获取最新数据
      getUserProfile();
    } else {
      // 如果没有数据，返回上一页
      uni.showToast({
        title: '未找到用户数据',
        icon: 'none',
        complete: () => {
          setTimeout(() => {
            goBack();
          }, 1500);
        }
      });
    }
  } catch (e) {
    console.error('获取或解析用户数据失败', e);
    uni.showToast({
      title: '获取用户数据失败',
      icon: 'none',
      complete: () => {
        setTimeout(() => {
          goBack();
        }, 1500);
      }
    });
  }
});

// 获取用户档案
const getUserProfile = () => {
  // TODO: [后端接口] 获取用户档案详情
  // 实现接口: GET /api/user/profile?profileId=xxx
  // 以下为模拟获取用户档案的代码，后端实现后移除
  console.log('获取用户档案');
};

// 格式化身份证号，只显示前4位和后4位
const formatIdCard = (idCard) => {
  if (!idCard) return '';
  if (idCard.length < 8) return idCard;
  
  const firstFour = idCard.substring(0, 4);
  const lastFour = idCard.substring(idCard.length - 4);
  return `${firstFour}****${lastFour}`;
};

// 编辑指定区块
const editSection = (section) => {
  currentSection.value = section;
  
  // 复制当前用户数据到编辑表单
  switch(section) {
    case 'basic':
      Object.assign(editForm, {
        name: userProfile.value.name || '',
        age: userProfile.value.age || '',
        gender: userProfile.value.gender || '男',
        idCard: userProfile.value.idCard || '',
        phone: userProfile.value.phone || '',
        address: userProfile.value.address || ''
      });
      break;
      
    case 'health':
      Object.assign(editForm, {
        bloodType: userProfile.value.bloodType || '',
        allergies: userProfile.value.allergies || '',
        chronicDiseases: userProfile.value.chronicDiseases || '',
        medications: userProfile.value.medications || ''
      });
      break;
      
    case 'emergency':
      editForm.emergencyContacts = userProfile.value.emergencyContacts && userProfile.value.emergencyContacts.length > 0 
        ? JSON.parse(JSON.stringify(userProfile.value.emergencyContacts)) 
        : [{name: '', relation: '', phone: ''}];
      break;
      
    case 'notes':
      editForm.notes = userProfile.value.notes || '';
      break;
  }
  
  showEditModal.value = true;
};

// 获取编辑弹窗标题
const getEditTitle = () => {
  switch(currentSection.value) {
    case 'basic': return '编辑基本信息';
    case 'health': return '编辑健康信息';
    case 'emergency': return '编辑紧急联系人';
    case 'notes': return '编辑备注';
    default: return '编辑信息';
  }
};

// 添加紧急联系人
const addEmergencyContact = () => {
  editForm.emergencyContacts.push({
    name: '',
    relation: '',
    phone: ''
  });
};

// 移除紧急联系人
const removeEmergencyContact = (index) => {
  if (editForm.emergencyContacts.length > 1) {
    editForm.emergencyContacts.splice(index, 1);
  }
};

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false;
  currentSection.value = '';
};

// 保存修改
const saveChanges = () => {
  // 表单验证
  if (currentSection.value === 'basic') {
    if (!editForm.name) {
      uni.showToast({
        title: '请输入用户姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!editForm.phone) {
      uni.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
  }
  
  // TODO: [后端接口] 更新用户档案
  // 实现接口: POST /api/user/update-profile
  // 以下为模拟更新用户档案的代码，后端实现后移除
  
  // 根据当前编辑的区块更新用户数据
  switch(currentSection.value) {
    case 'basic':
      Object.assign(userProfile.value, {
        name: editForm.name,
        age: editForm.age,
        gender: editForm.gender,
        idCard: editForm.idCard,
        phone: editForm.phone,
        address: editForm.address
      });
      break;
      
    case 'health':
      Object.assign(userProfile.value, {
        bloodType: editForm.bloodType,
        allergies: editForm.allergies,
        chronicDiseases: editForm.chronicDiseases,
        medications: editForm.medications
      });
      break;
      
    case 'emergency':
      userProfile.value.emergencyContacts = editForm.emergencyContacts.filter(contact => contact.name && contact.phone);
      break;
      
    case 'notes':
      userProfile.value.notes = editForm.notes;
      break;
  }
  
  // 更新本地存储
  uni.setStorageSync('currentUserProfile', JSON.stringify(userProfile.value));
  
  // 关闭弹窗
  closeEditModal();
  
  // 提示更新成功
  uni.showToast({
    title: '更新成功',
    icon: 'success'
  });
  
  // 如果是在用户列表页面过来的，更新用户列表中的数据
  try {
    const userListData = uni.getStorageSync('userListData');
    if (userListData) {
      const userList = JSON.parse(userListData);
      const index = userList.findIndex(user => user.id === userProfile.value.id);
      if (index !== -1) {
        userList[index] = userProfile.value;
        uni.setStorageSync('userListData', JSON.stringify(userList));
      }
    }
  } catch (e) {
    console.error('更新用户列表数据失败', e);
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    delta: 1,
    success: function() {
      // 如果navigateBack失败（例如历史堆栈为空），则重定向到管理中心
      console.log('返回成功');
    },
    fail: function() {
      uni.reLaunch({
        url: '/pages/volunteer/manage/index'
      });
    }
  });
};
</script>

<style>
/* 用户档案页样式 */
.profile-container {
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

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 10rpx;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

/* 信息卡片样式 */
.info-card {
  background-color: rgba(255, 255, 255, 0.55);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2px 6px rgba(45, 52, 54, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  border-bottom: 1rpx solid rgba(45, 52, 54, 0.08);
  padding-bottom: 10rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.edit-btn {
  display: flex;
  align-items: center;
  padding: 6rpx 16rpx;
  background-color: rgba(102, 187, 106, 0.1);
  border-radius: 30rpx;
}

.edit-btn text {
  font-size: 24rpx;
  color: #66BB6A;
  margin-left: 6rpx;
}

.card-content {
  padding: 10rpx 0;
}

/* 信息项样式 */
.info-item {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #636E72;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #2D3436;
  word-break: break-all;
  padding-right: 10rpx;
}

/* 联系人样式 */
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(45, 52, 54, 0.08);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 6rpx;
}

.contact-relation {
  font-size: 24rpx;
  color: #636E72;
}

.contact-phone {
  font-size: 28rpx;
  color: #66BB6A;
}

.empty-contacts {
  display: flex;
  justify-content: center;
  padding: 30rpx 0;
}

.empty-contacts text {
  font-size: 28rpx;
  color: #A0A6AD;
}

/* 备注样式 */
.notes-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.notes-content {
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

/* 编辑弹窗样式 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-container {
  width: 92%;
  max-width: 650rpx;
  max-height: 55%;
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
  position: relative;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.close-btn {
  font-size: 44rpx;
  color: white;
  line-height: 1;
  padding: 0 10rpx;
  flex-shrink: 0;
  z-index: 1;
  position: relative;
}

.modal-content {
  flex: 1;
  padding: 15rpx 15rpx;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
}

.form-item {
  margin-bottom: 15rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #2D3436;
  margin-bottom: 5rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 70rpx;
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
  min-height: 160rpx;
  max-height: none;
  background-color: #FFF8F3;
  border-radius: 10rpx;
  padding: 10rpx;
  font-size: 26rpx;
  color: #2D3436;
  box-sizing: border-box;
  border: 1rpx solid #E8E0D8;
  line-height: 1.5;
}

.gender-selector {
  display: flex;
  width: 100%;
}

.gender-option {
  flex: 1;
  height: 65rpx;
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
  margin-bottom: 10rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 8rpx;
  box-sizing: border-box;
  width: 100%;
}

.contact-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5rpx;
  margin-bottom: 5rpx;
  width: 100%;
  box-sizing: border-box;
}

.contact-input {
  width: 100%;
  height: 60rpx;
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
  margin-top: 5rpx;
  padding: 10rpx 0;
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
  height: 80rpx;
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