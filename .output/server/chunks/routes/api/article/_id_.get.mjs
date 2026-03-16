import { c as defineEventHandler, e as setResponseStatus, q as query } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const id = Number((_b = (_a = event == null ? void 0 : event.context) == null ? void 0 : _a.params) == null ? void 0 : _b.id);
    if (!id) {
      setResponseStatus(event, 400);
      return { status: 400, msg: "\u53C2\u6570\u9519\u8BEF", data: null };
    }
    const rows = await query("SELECT * FROM articles WHERE id = ? AND deleted_at IS NULL", [id]);
    const r = rows == null ? void 0 : rows[0];
    if (!r) {
      setResponseStatus(event, 404);
      return { status: 404, msg: "\u672A\u627E\u5230\u6587\u7AE0", data: null };
    }
    const prevRows = await query("SELECT id, title FROM articles WHERE id < ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1", [id]);
    const nextRows = await query("SELECT id, title FROM articles WHERE id > ? AND deleted_at IS NULL ORDER BY id ASC LIMIT 1", [id]);
    const prev = (prevRows == null ? void 0 : prevRows[0]) ? { id: String(prevRows[0].id), title: prevRows[0].title } : null;
    const next = (nextRows == null ? void 0 : nextRows[0]) ? { id: String(nextRows[0].id), title: nextRows[0].title } : null;
    let content = "";
    const filePath = String(r.file_path || "");
    if (filePath) {
      const absPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
      try {
        content = await promises.readFile(absPath, "utf-8");
        content = content.replace(/\]\(uploads\\/g, "](/uploads/");
        content = content.replace(/\]\(uploads\//g, "](/uploads/");
        content = content.replace(/src="uploads\\/g, 'src="/uploads/');
        content = content.replace(/src="uploads\//g, 'src="/uploads/');
      } catch (e) {
        content = "";
      }
    }
    const data = {
      id: String(r.id),
      title: r.title,
      tags: String(r.tags || "").split(",").map((t) => t.trim()).filter((t) => !!t),
      category: String(r.category_id),
      content,
      createTime: r.created_at,
      updateTime: r.updated_at,
      prev,
      next
    };
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u67E5\u8BE2\u6210\u529F", data };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
