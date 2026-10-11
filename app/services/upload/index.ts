import http from '~/utils/http'
import type { UploadedFile } from '@/types/response/upload'

class UploadService {
  uploadFiles(files: FileList | File[], articleId?: string) {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('file', file)
    })
    if (articleId) {
      formData.append('articleId', articleId)
    }
    return http.post<UploadedFile[]>('/upload', formData)
  }
}

export default new UploadService()
