<script>
export default {
  onLaunch: function () {
    console.log('App Launch');
    // 登录守卫：无 token 跳登录页
    try {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.reLaunch({
          url: '/pages/login/index'
        });
      }
    } catch (e) {
      console.error('获取存储信息失败', e);
    }
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  },
}
</script>

<style>
/* 引入全局 Design Token（主题变量）*/
@import './static/css/theme.css';

/* 每个页面公共 css */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: var(--text-primary, #333);
  line-height: 1.5;
  box-sizing: border-box;
}

/* 去除默认样式 */
button {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  line-height: inherit;
  font-size: inherit;
  color: inherit;
  outline: none;
  border-radius: 0;
  overflow: visible;
}

button::after {
  border: none;
}

input {
  outline: none;
}
</style>
