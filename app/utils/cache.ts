type Entry<T> = { data: T; ts: number; ttl: number }

class AppCache {
  // 默认缓存时间（毫秒）
  private defaultTtlMs = 1000 * 60 * 60 * 24 * 7 // 1 week
  // 缓存键前缀
  private cachePrefix = 'cache:'

  private isClient() { return typeof window !== 'undefined' }
  private store() { return this.isClient() ? window.localStorage : undefined }
  
  // 内置缓存管理函数
  private read<T>(key: string): Entry<T> | null {
    const store = this.store()
    if (!store) return null
    try {
      const raw = store.getItem(key)
      if (!raw) return null
      const obj = JSON.parse(raw) as Entry<T>
      if (!obj || typeof obj.ts !== 'number' || typeof obj.ttl !== 'number') return null
      return obj
    } catch { return null }
  }
  private write<T>(key: string, data: T): void {
    const store = this.store()
    if (!store) return
    try { store.setItem(key, JSON.stringify({ data, ts: Date.now(), ttl: this.defaultTtlMs })) } catch {}
  }
  private remove(key: string): void {
    const store = this.store()
    if (!store) return
    try { store.removeItem(key) } catch {}
  }
  // 分类缓存
  getCategories(): any[] | null {
    const e = this.read<any[]>('categories')
    if (!e) return null
    const ttl = e.ttl
    if (Date.now() - e.ts > ttl) { this.remove('categories'); return null }
    return e.data
  }
  setCategories(list: any[]): void {
    this.write('categories', list)
  }
  removeCategories(): void { this.remove('categories') }
}

export default new AppCache()
