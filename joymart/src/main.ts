import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import SvgIcon from "./components/SvgIcon/index.vue"
import "./components/SvgIcon/index.js" // 批量导入svg文件

import AOS from 'aos'
import 'aos/dist/aos.css'
import '@/assets/styles/common.less'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).component("svg-icon", SvgIcon).use(ElementPlus).use(store).use(router).mount('#app')

AOS.init({
    duration: 1000,
    once: true, // 只执行一次动画
    offset: 100 // 提前100px触发动画
})