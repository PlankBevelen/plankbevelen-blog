import { c as defineEventHandler, r as readBody, g as execute, e as setResponseStatus } from '../../../_/nitro.mjs';
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

const sync_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const add = Array.isArray(body == null ? void 0 : body.add) ? body.add : [];
    const remove = Array.isArray(body == null ? void 0 : body.remove) ? body.remove : [];
    const normalize = (arr) => Array.from(new Set(arr.map((t) => String(t).replace(/，/g, ",").trim()).filter(Boolean)));
    const addTags = normalize(add);
    const removeTags = normalize(remove);
    for (const tag of addTags) {
      await execute("INSERT INTO `tags` (`name`, `count`) VALUES (?, 0) ON DUPLICATE KEY UPDATE `name`=`name`", [tag]);
    }
    for (const tag of removeTags) {
      await execute("DELETE FROM `tags` WHERE `name` = ? AND `count` <= 0", [tag]);
    }
    setResponseStatus(event, 200);
    return { status: 200, msg: "\u540C\u6B65\u6210\u529F", data: { add: addTags.length, remove: removeTags.length } };
  } catch (error) {
    setResponseStatus(event, 500);
    return { status: 500, msg: "\u670D\u52A1\u5668\u9519\u8BEF", data: null };
  }
});

export { sync_post as default };
//# sourceMappingURL=sync.post.mjs.map
