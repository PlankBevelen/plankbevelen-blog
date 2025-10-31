import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/common.less'

import SvgIcon from '@/components/SvgIcon/index.vue' //svg组件
import '@/icons/index.ts'

const app = createApp(App)

app.component('svg-icon', SvgIcon)

app.use(store)
app.use(router)
app.use(ElementPlus)

app.mount('#app')