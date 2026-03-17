import { c as defineEventHandler, q as query, e as setResponseStatus } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const rows = await query("SELECT `name`, `count` FROM `tags` ORDER BY `count` DESC, `name` ASC");
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u67E5\u8BE2\u6210\u529F", data: rows || [] };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map
