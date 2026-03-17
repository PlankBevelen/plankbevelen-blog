import { h as http } from './server.mjs';

class TagService {
  async getTags() {
    return await http.get("/tag");
  }
  async syncTags(add = [], remove = []) {
    return await http.post("/tag/sync", { add, remove });
  }
}
const tagService = new TagService();

export { tagService as t };
//# sourceMappingURL=tag.service-BZ4HA-i1.mjs.map
