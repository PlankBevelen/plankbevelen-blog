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

export type NoteChapterOption = {
  name: string
  chapterOrder: number
}
