import { c as defineEventHandler, r as readBody, e as setResponseStatus, w as withTransaction, q as query, g as execute, h as updateTagsCount, i as updateCategoryCount } from '../../../_/nitro.mjs';
import { promises } from 'node:fs';
import path from 'node:path';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'vue';
import 'vue-router';
import 'mysql2/promise';
import 'dotenv';
import 'node:url';
import 'jsonwebtoken';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'ipx';
import 'node:crypto';

const _id__post = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const id = Number((_b = (_a = event == null ? void 0 : event.context) == null ? void 0 : _a.params) == null ? void 0 : _b.id);
    const body = await readBody(event);
    const title = (body == null ? void 0 : body.title) || "";
    const category = (body == null ? void 0 : body.category) || "";
    let content = (body == null ? void 0 : body.content) || "";
    const tagsStr = Array.isArray(body == null ? void 0 : body.tags) ? body.tags.join(",") : "";
    if (!id || !title || !category || !content) {
      setResponseStatus(event, 400);
      return { status: 400, msg: "\u53C2\u6570\u9519\u8BEF", data: null };
    }
    const data = await withTransaction(async (conn) => {
      const rows0 = await query("SELECT * FROM articles WHERE id = ?", [id], conn);
      const oldArticle = rows0 == null ? void 0 : rows0[0];
      if (!oldArticle) throw new Error("Article not found");
      let filePath = oldArticle.file_path || "";
      if (!filePath) {
        filePath = `/md/article-${id}.md`;
        await execute("UPDATE articles SET file_path = ? WHERE id = ?", [filePath, id], conn);
      }
      content = content.replace(/\]\(uploads\\/g, "](/uploads/");
      content = content.replace(/\]\(uploads\//g, "](/uploads/");
      content = content.replace(/src="uploads\\/g, 'src="/uploads/');
      content = content.replace(/src="uploads\//g, 'src="/uploads/');
      const absPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
      try {
        await promises.mkdir(path.dirname(absPath), { recursive: true });
        await promises.writeFile(absPath, content, "utf-8");
      } catch (e) {
        console.error("\u66F4\u65B0\u6587\u7AE0\u6587\u4EF6\u5931\u8D25:", e);
        throw new Error("\u6587\u4EF6\u5199\u5165\u5931\u8D25");
      }
      await execute(
        "UPDATE articles SET title = ?, tags = ?, category_id = ? WHERE id = ?",
        [title, tagsStr, category, id],
        conn
      );
      await updateTagsCount(oldArticle.tags, tagsStr, conn);
      await updateCategoryCount(oldArticle.category_id, category, conn);
      const rows = await query("SELECT * FROM articles WHERE id = ?", [id], conn);
      const r = rows == null ? void 0 : rows[0];
      return {
        id: String(r.id),
        title: r.title,
        tags: String(r.tags || "").split(",").map((t) => t.trim()).filter((t) => !!t),
        category: String(r.category_id),
        content,
        createTime: r.created_at,
        updateTime: r.updated_at
      };
    });
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u66F4\u65B0\u6210\u529F", data };
  } catch (error) {
    console.error("\u66F4\u65B0\u6587\u7AE0\u5931\u8D25:", error);
    setResponseStatus(event, 500);
    const msg = error.message === "\u6587\u4EF6\u5199\u5165\u5931\u8D25" ? "\u6587\u4EF6\u5199\u5165\u5931\u8D25" : "\u670D\u52A1\u5668\u9519\u8BEF";
    return { status: 500, msg, data: null };
  }
});

export { _id__post as default };
//# sourceMappingURL=_id_.post.mjs.map
