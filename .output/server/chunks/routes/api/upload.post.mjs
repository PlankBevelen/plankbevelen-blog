import { c as defineEventHandler, l as readMultipartFormData, m as createError, k as getUploadsBaseDir } from '../../_/nitro.mjs';
import path from 'node:path';
import fs from 'node:fs/promises';
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

const UPLOAD_BASE = getUploadsBaseDir();
const upload_post = defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No files uploaded"
    });
  }
  const articleIdPart = files.find((f) => f.name === "articleId");
  let articleId = articleIdPart ? articleIdPart.data.toString() : "temp";
  articleId = articleId.replace(/[^a-zA-Z0-9-]/g, "");
  if (!articleId) articleId = "temp";
  const isArticleId = /^\d+$/.test(articleId);
  const uploadSubdir = isArticleId ? articleId : path.join("temp", articleId);
  const uploadDir = path.join(UPLOAD_BASE, uploadSubdir);
  await fs.mkdir(uploadDir, { recursive: true });
  const uploadedFiles = [];
  for (const file of files) {
    if (file.filename) {
      const ext = path.extname(file.filename);
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, file.data);
      const urlSubPath = uploadSubdir.split(path.sep).join("/");
      uploadedFiles.push({
        originalName: file.filename,
        filename: uniqueFilename,
        url: `/uploads/${urlSubPath}/${uniqueFilename}`,
        mimetype: file.type,
        size: file.data.length
      });
    }
  }
  return {
    status: 200,
    message: "Upload successful",
    data: uploadedFiles
  };
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
