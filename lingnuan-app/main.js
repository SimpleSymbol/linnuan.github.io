import App from './App'

// ============================================================
// TUICallKit 为原生 UTS 插件，仅 APP-PLUS 端可用。
// H5/小程序端用条件编译屏蔽其静态 import，避免 esbuild 依赖扫描报错。
// 采用「在条件编译块内 import」的写法，uni 编译器预处理时会整段移除。
// ============================================================

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
App.mpType = 'app'

// #ifdef APP-PLUS
import { TUICallKit } from "@/uni_modules/TencentCloud-Call/callkit/callServices/services/index"
import { TUIStore } from "@/uni_modules/TencentCloud-Call/callkit/callServices/TUIStore/index"
uni.$TUICallKit = TUICallKit
uni.$TUIStore = TUIStore
// #endif

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'

// #ifdef APP-PLUS
import { TUICallKit } from "@/uni_modules/TencentCloud-Call/callkit/callServices/services/index"
import { TUIStore } from "@/uni_modules/TencentCloud-Call/callkit/callServices/TUIStore/index"
// #endif

export function createApp() {
  const app = createSSRApp(App)

  // #ifdef APP-PLUS
  uni.$TUICallKit = TUICallKit
  uni.$TUIStore = TUIStore
  // #endif

  return {
    app
  }
}
// #endif
