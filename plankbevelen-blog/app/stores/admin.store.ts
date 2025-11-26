import { defineStore } from 'pinia'
import { useAuthentication } from '~/composables/useAuthentication'
import adminService from '@/services/admin.service'

export const useAdminStore = defineStore('admin', {
    state: () => ({
        userInfo: null as any,

    }),
    getters: {
        isAuthenticated: (state) => { return useAuthentication().getToken() !== undefined }
    },
    actions: {        
        async login(account: string, password: string, remember?: boolean) {
            try {
                const res = await adminService.login(account, useAuthentication().hashPassword(password), remember || false)
                if (res.status === 200) {
                    this.userInfo = res.data
                    useAuthentication().setToken(res.data.token, remember)
                    return true
                }
            } catch (error) {
                console.log(error, '登录失败')
                return false
            }
        },
        async logout() {
            try {
                const res = await adminService.logout()
                if (res.status === 200) {
                    this.userInfo = null
                    useAuthentication().clearUp()
                    return true
                }
            } catch (error) {
                console.log(error, '退出登录失败')
                return false
            }
        }        
    }
})