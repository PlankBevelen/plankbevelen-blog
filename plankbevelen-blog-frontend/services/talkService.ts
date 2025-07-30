import http from '@/utils/http-common'
import type { Talk } from '~/types/talk'

// 说说服务类
class TalkService {
    // 获取全部说说
    async getAllTalks(): Promise<Talk[]> {
        try {
            const response = await http.post('/talk/all')
            console.log(response.data.data[0])
            return response.data.data[0] as Talk[]
        } catch (error) {
            console.error('获取说说列表失败:', error)
            throw error
        }
    }

    // 获取全部已发布说说
    async getPublishedTalks(): Promise<Talk[]> {
        try {
            const response = await http.get('/talk/published')
            console.log(response.data.data)
            return response.data.data[0] as Talk[]
        } catch (error) {
            console.error('获取已发布说说列表失败:', error)
            throw error
        }
    }

    // 创建说说
    async publish(content: string, status: 'published' | 'draft', images: string | null, userId: number = 1) {
        try {
            const response = await http.post('/talk/publish', {
                content,
                status,
                images,
                userId
            })
            return response.data
        } catch (error) {
            console.error('创建说说失败:', error)
            throw error
        }
    }

    // 更新说说
    async update(id: number, content: string, status: 'published' | 'draft', images: string | null) {
        try {
            const response = await http.post(`/talk/update`, {
                id,
                content,
                status,
                images
            })
            return response.data
        } catch (error) {
            console.error('更新说说失败:', error)
            throw error
        }
    }

    // 删除说说
    async delete(id: number) {
        try {
            const response = await http.delete(`/talk/delete/${id}`)
            return response.data
        } catch (error) {
        console.error('删除说说失败:', error)
            throw error
        }
    }

    // 上传图片
    /* static async uploadImage(file: File): Promise<UploadResponse> {
        try {
            const formData = new FormData()
            formData.append('image', file)
            
            const response = await http.post('/talk/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            console.error('上传图片失败:', error)
            throw error
        }
    } */
}

export default new TalkService()