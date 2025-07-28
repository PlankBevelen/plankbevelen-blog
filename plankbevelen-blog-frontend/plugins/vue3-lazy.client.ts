import Vue3Lazy from 'vue3-lazy'
import loadingGif from '@/assets/img/loading.gif'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
    const lazyOptions = {
        loading: loadingGif,
        useObserver: true,
        observerOptions: {
            rootMargin: '100px',
            threshold: 0.01
        }
    }
    nuxtApp.vueApp.use(Vue3Lazy, lazyOptions)

    // 基本错误处理
    nuxtApp.vueApp.config.globalProperties.$lazyErrorHandle = (el: HTMLImageElement) => {
        console.error('图片加载失败', el.src)
        el.classList.add('lazy-error')
    }
})