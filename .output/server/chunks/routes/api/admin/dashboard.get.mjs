import { c as defineEventHandler, q as query, e as setResponseStatus } from '../../../_/nitro.mjs';
import dayjs from 'dayjs';
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

const dashboard_get = defineEventHandler(async (event) => {
  try {
    const [totalArticles] = await query("SELECT COUNT(*) as count FROM articles");
    const [totalCategories] = await query("SELECT COUNT(*) as count FROM categories");
    const [totalTags] = await query("SELECT COUNT(*) as count FROM tags");
    const recentArticles = await query("SELECT id, title, created_at, category_id FROM articles ORDER BY created_at DESC LIMIT 5");
    const categoryStats = await query("SELECT name, count as value FROM categories ORDER BY count DESC LIMIT 10");
    const tagStats = await query("SELECT name, count as value FROM tags ORDER BY count DESC LIMIT 10");
    const trendStats = await query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as count
      FROM articles
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY date
      ORDER BY date ASC
    `);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(dayjs().subtract(i, "month").format("YYYY-MM"));
    }
    const trendMap = new Map(trendStats.map((item) => [item.date, item.count]));
    const finalTrend = months.map((date) => ({
      date,
      count: trendMap.get(date) || 0
    }));
    setResponseStatus(event, 200);
    return {
      status: 200,
      msg: "success",
      data: {
        totalArticles: (totalArticles == null ? void 0 : totalArticles.count) || 0,
        totalCategories: (totalCategories == null ? void 0 : totalCategories.count) || 0,
        totalTags: (totalTags == null ? void 0 : totalTags.count) || 0,
        recentArticles: recentArticles || [],
        categoryStats: categoryStats || [],
        tagStats: tagStats || [],
        publishTrend: finalTrend
      }
    };
  } catch (error) {
    console.error("\u83B7\u53D6\u4EEA\u8868\u76D8\u6570\u636E\u5931\u8D25:", error);
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
