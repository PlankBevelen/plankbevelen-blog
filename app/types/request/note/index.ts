export type NewNote = {
  title: string
  category: string
  chapter: string
  chapterOrder: number
  noteOrder: number
  content: string
  tempId?: string
}

export type NoteListQuery = {
  page?: number
  limit?: number
  q?: string
  sort?: string
  categoryId?: number | string
}

export type NoteCategoryWriteRequest = {
  name: string
  id?: number | string
}
