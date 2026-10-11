import http from '~/utils/http'
import type {
  NoteCategory,
  NoteChapterOption,
  NoteDetail,
  NoteItem,
} from '@/types/data/note'
import type { NewNote } from '@/types/request/note'

class NoteService {
  getNoteCategories() {
    return http.get<NoteCategory[]>('/note-category')
  }

  getAdminNoteCategories() {
    return http.get<NoteCategory[]>('/admin/note-category')
  }

  createNoteCategory(name: string, id?: number | string) {
    return http.post<NoteCategory>('/note-category', { name, ...(id ? { id } : {}) })
  }

  createAdminNoteCategory(name: string, id?: number | string) {
    return http.post<NoteCategory>('/admin/note-category', { name, ...(id ? { id } : {}) })
  }

  updateNoteCategory(id: number | string, name: string) {
    return http.put<NoteCategory>(`/note-category/${id}`, { name })
  }

  updateAdminNoteCategory(id: number | string, name: string) {
    return http.put<NoteCategory>(`/admin/note-category/${id}`, { name })
  }

  deleteNoteCategory(id: number | string) {
    return http.delete<null>(`/note-category/${id}`)
  }

  deleteAdminNoteCategory(id: number | string) {
    return http.delete<null>(`/admin/note-category/${id}`)
  }

  getNotes(
    page = 1,
    limit = 10,
    q?: string,
    sort?: string,
    categoryId?: number | string
  ) {
    return http.getPage<NoteItem[]>('/note', { page, limit, q, sort, categoryId })
  }

  getAdminNotes(
    page = 1,
    limit = 10,
    q?: string,
    sort?: string,
    categoryId?: number | string
  ) {
    return http.getPage<NoteItem[]>('/admin/note', { page, limit, q, sort, categoryId })
  }

  getNoteChapters(categoryId: string) {
    return http.get<NoteChapterOption[]>('/admin/note/chapters', { categoryId })
  }

  createNote(note: NewNote) {
    return http.post<NoteItem>('/note', note)
  }

  createAdminNote(note: NewNote) {
    return http.post<NoteItem>('/admin/note', note)
  }

  getNoteDetail(id: number | string) {
    return http.get<NoteItem>(`/note/${id}`)
  }

  getAdminNoteDetail(id: number | string) {
    return http.get<NoteItem>(`/admin/note/${id}`)
  }

  updateNote(id: number | string, note: NewNote) {
    return http.post<NoteItem>(`/note/${id}`, note)
  }

  updateAdminNote(id: number | string, note: NewNote) {
    return http.post<NoteItem>(`/admin/note/${id}`, note)
  }

  deleteNote(id: number | string) {
    return http.delete<null>(`/note/${id}`)
  }

  deleteAdminNote(id: number | string) {
    return http.delete<null>(`/admin/note/${id}`)
  }

  getNoteHandbook(noteId: number | string) {
    return http.get<NoteDetail>(`/notes/${noteId}`)
  }

  getNote(id: number | string, noteId?: number | string) {
    return this.getNoteHandbook(noteId || id)
  }
}

export default new NoteService()

export type {
  NoteCategory,
  NoteItem,
  NoteSidebarItem,
  NoteSidebarGroup,
  NoteDetail,
} from '@/types/data/note'
export type { NewNote } from '@/types/request/note'
