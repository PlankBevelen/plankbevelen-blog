import { c as defineEventHandler, e as setResponseStatus, w as withTransaction, q as query, g as execute, h as updateTagsCount, i as updateCategoryCount } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a, _b;
  try {
    const id = Number((_b = (_a = event == null ? void 0 : event.context) == null ? void 0 : _a.params) == null ? void 0 : _b.id);
    if (!id) {
      setResponseStatus(event, 400);
      return { status: 400, msg: "\u53C2\u6570\u9519\u8BEF", data: null };
    }
    await withTransaction(async (conn) => {
      const rows0 = await query("SELECT * FROM articles WHERE id = ? AND deleted_at IS NULL", [id], conn);
      const oldArticle = rows0 == null ? void 0 : rows0[0];
      if (!oldArticle) return;
      await execute("UPDATE articles SET deleted_at = NOW() WHERE id = ?", [id], conn);
      await updateTagsCount(oldArticle.tags, null, conn);
      await updateCategoryCount(oldArticle.category_id, null, conn);
    });
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u5220\u9664\u6210\u529F", data: { id } };
  } catch (error) {
    console.error("\u5220\u9664\u6587\u7AE0\u5931\u8D25:", error);
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
