import http from '~/utils/http'
import type { ApiResponse } from '~/types/api'

export type NoteCategory = {
  id: string
  name: string
  count?: number
  createTime?: string
  updateTime?: string
  firstNoteId?: string
  firstNoteTitle?: string
}

export type NoteItem = {
  id: string
  title: string
  category: string
  categoryId?: string
  chapter: string
  chapterOrder: number
  noteOrder?: number
  content?: string
  shortContent?: string
  longContent?: string
  createTime: string
  updateTime: string
}

export type NewNote = {
  title: string
  category: string
  chapter: string
  chapterOrder: number
  noteOrder: number
  content: string
  tempId?: string
}

export type NoteSidebarItem = {
  id: string
  title: string
  chapter?: string
}

export type NoteSidebarGroup = {
  id: string
  title: string
  count: number
  chapterOrder?: number
  items: NoteSidebarItem[]
}

export type NoteDetail = {
  note?: {
    id: string
    title: string
    category: string
    categoryName: string
    chapter: string
    chapterOrder: number
    noteOrder?: number
    content: string
    createTime: string
    updateTime: string
  }
  article: {
    id: string
    title: string
    category: string
    categoryName: string
    chapter: string
    chapterOrder: number
    noteOrder?: number
    content: string
    createTime: string
    updateTime: string
  }
  flatItems?: NoteSidebarItem[]
  navGroups: NoteSidebarGroup[]
  currentGroupId: string
  siblingNotes: NoteSidebarItem[]
}

class NoteService {
  async getNoteCategories() {
    return await http.get<ApiResponse<NoteCategory[]>>('/note-category')
  }

  async getAdminNoteCategories() {
    return await http.get<ApiResponse<NoteCategory[]>>('/admin/note-category')
  }

  async createNoteCategory(name: string, id?: number | string) {
    return await http.post<ApiResponse<NoteCategory>>('/note-category', { name, ...(id ? { id } : {}) })
  }

  async createAdminNoteCategory(name: string, id?: number | string) {
    return await http.post<ApiResponse<NoteCategory>>('/admin/note-category', { name, ...(id ? { id } : {}) })
  }

  async updateNoteCategory(id: number | string, name: string) {
    return await http.put<ApiResponse<NoteCategory>>(`/note-category/${id}`, { name })
  }

  async updateAdminNoteCategory(id: number | string, name: string) {
    return await http.put<ApiResponse<NoteCategory>>(`/admin/note-category/${id}`, { name })
  }

  async deleteNoteCategory(id: number | string) {
    return await http.delete<ApiResponse>(`/note-category/${id}`)
  }

  async deleteAdminNoteCategory(id: number | string) {
    return await http.delete<ApiResponse>(`/admin/note-category/${id}`)
  }

  async getNotes(
    page: number = 1,
    limit: number = 10,
    q?: string,
    sort?: string,
    categoryId?: number | string
  ) {
    return await http.get<ApiResponse<NoteItem[]>>('/note', { page, limit, q, sort, categoryId })
  }

  async getAdminNotes(
    page: number = 1,
    limit: number = 10,
    q?: string,
    sort?: string,
    categoryId?: number | string
  ) {
    return await http.get<ApiResponse<NoteItem[]>>('/admin/note', { page, limit, q, sort, categoryId })
  }

  async getNoteChapters(categoryId: string) {
    return await http.get<ApiResponse<Array<{ name: string; chapterOrder: number }>>>('/admin/note/chapters', {
      categoryId
    })
  }

  async createNote(note: NewNote) {
    return await http.post<ApiResponse<NoteItem>>('/note', note)
  }

  async createAdminNote(note: NewNote) {
    return await http.post<ApiResponse<NoteItem>>('/admin/note', note)
  }

  async getNoteDetail(id: number | string) {
    return await http.get<ApiResponse<any>>(`/note/${id}`)
  }

  async getAdminNoteDetail(id: number | string) {
    return await http.get<ApiResponse<any>>(`/admin/note/${id}`)
  }

  async updateNote(id: number | string, note: NewNote) {
    return await http.post<ApiResponse<NoteItem>>(`/note/${id}`, note)
  }

  async updateAdminNote(id: number | string, note: NewNote) {
    return await http.post<ApiResponse<NoteItem>>(`/admin/note/${id}`, note)
  }

  async deleteNote(id: number | string) {
    return await http.delete<ApiResponse>(`/note/${id}`)
  }

  async deleteAdminNote(id: number | string) {
    return await http.delete<ApiResponse>(`/admin/note/${id}`)
  }

  /** 按笔记 ID 获取手册详情（正文 + 导航元数据） */
  async getNoteHandbook(noteId: number | string) {
    return await http.get<ApiResponse<NoteDetail>>(`/notes/${noteId}`)
  }

  /** @deprecated 使用 getNoteHandbook(noteId) */
  async getNote(id: number | string, _noteId?: number | string) {
    return await this.getNoteHandbook(_noteId || id)
  }
}

export default new NoteService()
