import http from "~/utils/http"

class UploadService {
  async uploadFiles(files: FileList | File[], articleId?: string) {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('file', file)
    })
    if (articleId) {
      formData.append('articleId', articleId)
    } 
    return await http.post('/upload', formData)
  }
}

export default new UploadService()
