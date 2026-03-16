import { S as defineNuxtRouteMiddleware, a as useAdminStore, q as navigateTo } from './server.mjs';
import 'vue';
import '../_/nitro.mjs';
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
import 'pinia';
import '@vueuse/core';
import 'lodash-es';
import 'md-editor-v3';

const authMiddleware = defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return;
  }
  if (to.path === "/admin/login") {
    if (useAdminStore().isAuthenticated) {
      return navigateTo("/admin", { replace: true });
    }
    return;
  }
  if (to.path.startsWith("/admin")) {
    if (!useAdminStore().isAuthenticated) {
      return navigateTo("/admin/login", { replace: true });
    }
    return;
  }
});

export { authMiddleware as default };
//# sourceMappingURL=auth-middleware-CLnEXgn6.mjs.map
