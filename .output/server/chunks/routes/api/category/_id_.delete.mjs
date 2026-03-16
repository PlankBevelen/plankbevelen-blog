import { c as defineEventHandler, e as setResponseStatus, g as execute } from '../../../_/nitro.mjs';
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
    await execute("DELETE FROM categories WHERE id = ?", [id]);
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u5220\u9664\u6210\u529F", data: { id } };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
