class AppCache {
  // 默认缓存时间（毫秒）
  defaultTtlMs = 1e3 * 60 * 60 * 24 * 7;
  // 1 week
  // 缓存键前缀
  cachePrefix = "cache:";
  isClient() {
    return false;
  }
  store() {
    return this.isClient() ? (void 0).localStorage : void 0;
  }
  // 内置缓存管理函数
  read(key) {
    const store = this.store();
    if (!store) return null;
    try {
      const raw = store.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.ts !== "number" || typeof obj.ttl !== "number") return null;
      return obj;
    } catch {
      return null;
    }
  }
  write(key, data) {
    const store = this.store();
    if (!store) return;
    try {
      store.setItem(key, JSON.stringify({ data, ts: Date.now(), ttl: this.defaultTtlMs }));
    } catch {
    }
  }
  remove(key) {
    const store = this.store();
    if (!store) return;
    try {
      store.removeItem(key);
    } catch {
    }
  }
  // 分类缓存
  getCategories() {
    const e = this.read("categories");
    if (!e) return null;
    const ttl = e.ttl;
    if (Date.now() - e.ts > ttl) {
      this.remove("categories");
      return null;
    }
    return e.data;
  }
  setCategories(list) {
    this.write("categories", list);
  }
  removeCategories() {
    this.remove("categories");
  }
}
const appCache = new AppCache();

export { appCache as a };
//# sourceMappingURL=cache-Bl-VgnBs.mjs.map
