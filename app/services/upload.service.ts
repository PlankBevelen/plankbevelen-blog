import http from "~/utils/http"

class UploadService {
  /**
   * 上传文件
   * @param files 文件列表 (FileList 或 File[])
   * @param articleId 文章ID (可选，用于关联文章)
   * @returns 上传结果
   */
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
