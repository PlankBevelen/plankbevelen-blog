import http from "~/utils/http"

class UploadService {
  /**
   * 上传文件
   * @param files 文件列表 (FileList 或 File[])
   * @returns 上传结果
   */
  async uploadFiles(files: FileList | File[]) {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('file', file)
    })

    return await http.post('/upload', formData)
  }
}

export default new UploadService()
