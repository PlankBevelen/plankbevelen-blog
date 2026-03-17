import { c as defineEventHandler, j as getQuery, q as query, e as setResponseStatus } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const q = getQuery(event);
    const pageNum = Math.max(1, Number(q.page || 1));
    const pageSize = Math.max(1, Number(q.limit || 10));
    const keyword = String(q.q || "").trim();
    const sort = String(q.sort || "created").toLowerCase();
    const offset = (pageNum - 1) * pageSize;
    const params = [];
    const conditions = ["a.deleted_at IS NULL"];
    if (keyword) {
      conditions.push("(a.title LIKE ? OR a.tags LIKE ? OR c.name LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    const where = "WHERE " + conditions.join(" AND ");
    const orderBy = sort === "created" ? "ORDER BY a.created_at DESC, a.id DESC" : "ORDER BY a.updated_at DESC, a.created_at DESC, a.id DESC";
    const listSql = `
      SELECT a.id, a.title, a.tags, a.file_path, a.created_at, a.updated_at, a.category_id, c.name AS category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const countSql = `
      SELECT COUNT(*) AS total
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      ${where}
    `;
    const listParams = [...params, pageSize, offset];
    const countParams = params;
    const rows = await query(listSql, listParams);
    const countRows = await query(countSql, countParams);
    const total = Number(((_a = countRows == null ? void 0 : countRows[0]) == null ? void 0 : _a.total) || 0);
    const data = await Promise.all((rows || []).map(async (r) => {
      let content = "";
      const filePath = String(r.file_path || "");
      if (filePath) {
        const absPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
        try {
          content = await promises.readFile(absPath, "utf-8");
        } catch (e) {
          content = "";
        }
      }
      return {
        id: String(r.id),
        title: r.title,
        tags: (r.tags || "").split(",").filter((t) => !!t),
        category: r.category_name || "",
        content,
        createTime: r.created_at,
        updateTime: r.updated_at
      };
    }));
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u67E5\u8BE2\u6210\u529F", data, total, page: pageNum, limit: pageSize };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
