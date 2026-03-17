import { c as defineEventHandler, m as createError, k as getUploadsBaseDir, n as setHeader, o as sendStream } from '../../_/nitro.mjs';
import { promises, createReadStream } from 'node:fs';
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

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4"
};
const ____path__get = defineEventHandler(async (event) => {
  var _a;
  let filePathParam = ((_a = event.context.params) == null ? void 0 : _a.path) || "";
  if (!filePathParam) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }
  const cleanPath = path.normalize(String(filePathParam)).replace(/^(\.\.[\/\\])+/, "");
  const uploadDir = getUploadsBaseDir();
  const fullPath = path.resolve(uploadDir, cleanPath);
  const rel = path.relative(uploadDir, fullPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw createError({ statusCode: 403, statusMessage: "Access denied" });
  }
  try {
    await promises.access(fullPath);
    const stats = await promises.stat(fullPath);
    if (!stats.isFile()) {
      throw createError({ statusCode: 404, statusMessage: "Not a file" });
    }
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    setHeader(event, "Content-Type", mimeType);
    setHeader(event, "Content-Length", stats.size);
    setHeader(event, "Cache-Control", "public, max-age=86400");
    return sendStream(event, createReadStream(fullPath));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createError({ statusCode: 404, statusMessage: "File not found" });
    }
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
});

export { ____path__get as default };
//# sourceMappingURL=_...path_.get.mjs.map
