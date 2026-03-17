import { c as defineEventHandler, r as readBody, e as setResponseStatus, g as execute, q as query } from '../../../_/nitro.mjs';
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

const _id__put = defineEventHandler(async (event) => {
  var _a, _b, _c;
  try {
    const id = Number((_b = (_a = event == null ? void 0 : event.context) == null ? void 0 : _a.params) == null ? void 0 : _b.id);
    const body = await readBody(event);
    const name = (_c = body == null ? void 0 : body.name) == null ? void 0 : _c.trim();
    if (!id || !name) {
      setResponseStatus(event, 400);
      return { status: 400, msg: "\u53C2\u6570\u9519\u8BEF", data: null };
    }
    await execute("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    const rows = await query("SELECT * FROM categories WHERE id = ?", [id]);
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u66F4\u65B0\u6210\u529F", data: (rows == null ? void 0 : rows[0]) || { id, name } };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
