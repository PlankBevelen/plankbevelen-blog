import { c as defineEventHandler, q as query } from '../../_/nitro.mjs';
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
import 'node:fs';
import 'node:path';
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

const sitemapUrls = defineEventHandler(async () => {
  try {
    const articles = await query("SELECT id, title, updated_at, created_at FROM articles ORDER BY updated_at DESC");
    return articles.map((article, index) => ({
      loc: `/article/${article.id}`,
      lastmod: article.updated_at || article.created_at,
      changefreq: index < 10 ? "daily" : "weekly",
      priority: index < 5 ? 0.9 : index < 20 ? 0.8 : 0.7
    }));
  } catch (error) {
    console.error("Sitemap fetch failed:", error);
    return [];
  }
});

export { sitemapUrls as default };
//# sourceMappingURL=sitemap-urls.mjs.map
