import { c as defineEventHandler, r as readBody, e as setResponseStatus, w as withTransaction, g as execute, k as getUploadsBaseDir, h as updateTagsCount, i as updateCategoryCount, q as query } from '../../_/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const title = (body == null ? void 0 : body.title) || "";
    const category = (body == null ? void 0 : body.category) || "";
    let content = (body == null ? void 0 : body.content) || "";
    const tempId = (body == null ? void 0 : body.tempId) || "";
    const tagsStr = Array.isArray(body == null ? void 0 : body.tags) ? body.tags.join(",") : "";
    if (!title || !category || !content) {
      setResponseStatus(event, 400);
      return { status: 400, msg: "\u53C2\u6570\u9519\u8BEF", data: null };
    }
    const data = await withTransaction(async (conn) => {
      const result = await execute(
        "INSERT INTO articles (title, tags, category_id, file_path) VALUES (?, ?, ?, ?)",
        [title, tagsStr, category, ""],
        conn
      );
      const id = result == null ? void 0 : result.insertId;
      let finalContent = content;
      if (tempId && tempId.trim()) {
        const uploadsBase = getUploadsBaseDir();
        const tempDir = path.join(uploadsBase, "temp", tempId);
        const legacyTempDir = path.join(uploadsBase, tempId);
        const targetDir = path.join(uploadsBase, id.toString());
        try {
          let sourceDir = tempDir;
          try {
            await promises.access(sourceDir);
          } catch {
            sourceDir = legacyTempDir;
            await promises.access(sourceDir);
          }
          try {
            await promises.rename(sourceDir, targetDir);
          } catch (err) {
            if (err && err.code === "EXDEV") {
              await promises.cp(sourceDir, targetDir, { recursive: true });
              await promises.rm(sourceDir, { recursive: true, force: true });
            } else {
              throw err;
            }
          }
          finalContent = finalContent.replace(new RegExp(`/uploads/temp/${tempId}/`, "g"), `/uploads/${id}/`).replace(new RegExp(`/uploads/${tempId}/`, "g"), `/uploads/${id}/`);
        } catch (e) {
        }
      }
      const mdDir = path.join(process.cwd(), "public", "md");
      const fileName = `article-${id}.md`;
      const absPath = path.join(mdDir, fileName);
      const relPath = `/md/${fileName}`;
      try {
        await promises.mkdir(mdDir, { recursive: true });
        await promises.writeFile(absPath, finalContent, "utf-8");
      } catch (e) {
        console.error("\u5199\u5165\u6587\u7AE0\u6587\u4EF6\u5931\u8D25:", e);
        throw new Error("\u6587\u4EF6\u5199\u5165\u5931\u8D25");
      }
      await execute("UPDATE articles SET file_path = ? WHERE id = ?", [relPath, id], conn);
      await updateTagsCount(null, tagsStr, conn);
      await updateCategoryCount(null, category, conn);
      const rows = await query("SELECT * FROM articles WHERE id = ?", [id], conn);
      return (rows == null ? void 0 : rows[0]) || { id, title, file_path: relPath, tags: tagsStr, category_id: category };
    });
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u65B0\u589E\u6210\u529F", data };
  } catch (error) {
    console.error("\u65B0\u589E\u6587\u7AE0\u5931\u8D25:", error);
    setResponseStatus(event, 500);
    const msg = error.message === "\u6587\u4EF6\u5199\u5165\u5931\u8D25" ? "\u6587\u4EF6\u5199\u5165\u5931\u8D25" : "\u670D\u52A1\u5668\u9519\u8BEF";
    return { status: 500, msg, data: null };
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
