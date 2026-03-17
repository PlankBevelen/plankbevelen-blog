import { c as defineEventHandler, r as readBody, u as useRuntimeConfig, e as setResponseStatus, f as setCookie } from '../../../_/nitro.mjs';
import { sha256 } from 'js-sha256';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
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
import 'node:url';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'ipx';
import 'node:crypto';

dotenv.config();
const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { account, password, remember } = body || { account: "", password: "", remember: false };
  const config = useRuntimeConfig();
  const adminAccount = process.env.NUXT_ADMIN_ACCOUNT;
  const secret = config.authSecret;
  const adminPassword = process.env.NUXT_ADMIN_PASSWORD;
  if (!adminAccount || !secret || !adminPassword) {
    setResponseStatus(event, 500);
    return { code: "MISSING_CONFIG", message: "Admin credentials not configured" };
  }
  const hash = sha256(String(adminPassword));
  if (!account || !password) {
    setResponseStatus(event, 400);
    return { code: "BAD_REQUEST", message: "Missing account or password" };
  }
  const inputHash = sha256(String(password));
  if (account !== adminAccount || inputHash !== hash) {
    setResponseStatus(event, 401);
    return { code: "INVALID_CREDENTIALS", message: "Invalid account or password" };
  }
  const expiresIn = remember ? Number(process.env.NUXT_EXPIRATION_TIME) : Number(process.env.NUXT_KEEP_ALIVE_TIME);
  const token = jwt.sign({ sub: adminAccount }, secret, { expiresIn });
  const opts = {
    httpOnly: true,
    path: "/",
    sameSite: "lax"
  };
  if (remember) {
    opts.maxAge = expiresIn;
  }
  const cookieName = (process.env.NUXT_PUBLIC_COOKIE_PREFIX || "") + "user_token";
  setCookie(event, cookieName, token, opts);
  setResponseStatus(event, 200);
  return { message: "Login successful", status: 200, token };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
