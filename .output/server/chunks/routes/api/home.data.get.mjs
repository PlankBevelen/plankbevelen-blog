import { c as defineEventHandler, q as query, e as setResponseStatus } from '../../_/nitro.mjs';
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

async function getArticles(limit, sort = "updated") {
  const orderBy = sort === "created" ? "ORDER BY a.created_at DESC, a.id DESC" : "ORDER BY a.updated_at DESC, a.created_at DESC, a.id DESC";
  const sql = `
    SELECT a.id, a.title, a.tags, a.file_path, a.created_at, a.updated_at, a.category_id, c.name AS category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.deleted_at IS NULL
    ${orderBy}
    LIMIT ?
  `;
  const rows = await query(sql, [limit]);
  return Promise.all((rows || []).map(async (r) => {
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
}
const home_data_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const [articles, categories, tags, latestArticlesRaw, articleCountRes] = await Promise.all([
      getArticles(10, "updated"),
      query("SELECT * FROM categories"),
      query("SELECT `name`, `count` FROM `tags` ORDER BY `count` DESC, `name` ASC"),
      getArticles(5, "created"),
      query("SELECT COUNT(*) as total FROM articles WHERE deleted_at IS NULL")
    ]);
    const articleCount = Number(((_a = articleCountRes == null ? void 0 : articleCountRes[0]) == null ? void 0 : _a.total) || 0);
    const latestArticles = latestArticlesRaw.map((r) => ({
      title: r.title,
      category: r.category,
      createTime: r.createTime,
      id: r.id
    }));
    setResponseStatus(event, 200);
    return {
      status: 200,
      msg: "\u67E5\u8BE2\u6210\u529F",
      data: {
        articles,
        categories: categories || [],
        tags: tags || [],
        latestArticles,
        stats: {
          articles: articleCount,
          categories: (categories || []).length,
          tags: (tags || []).length
        }
      }
    };
  } catch (error) {
    console.error("Home data error:", error);
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF: " + ((error == null ? void 0 : error.message) || "\u672A\u77E5\u9519\u8BEF"), data: null };
  }
});

export { home_data_get as default };
//# sourceMappingURL=home.data.get.mjs.map
