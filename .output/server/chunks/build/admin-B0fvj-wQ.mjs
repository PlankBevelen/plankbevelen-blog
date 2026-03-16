import { _ as _export_sfc, T as __nuxt_component_0$1 } from './server.mjs';
import { defineComponent, computed, ref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import Header from './Header-De-bFSh-.mjs';
import SideBar from './SideBar-CasaW1Tn.mjs';
import { useRouter } from 'vue-router';
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
import 'ipx';
import 'node:crypto';
import 'pinia';
import '@vueuse/core';
import 'lodash-es';
import 'md-editor-v3';
import './nuxt-icon-CaSJaWYu.mjs';
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './index-DYDdtqo2.mjs';
import './el-popper-Da7PzTYS.mjs';
import './event-B21lDVQA.mjs';
import './index-sS3vk-N3.mjs';
import './typescript-D6L75muK.mjs';
import './vnode-BQHIcHPg.mjs';

/* empty css                    */
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const hidden = computed(() => {
      return router.currentRoute.value.path === "/admin/login";
    });
    const isCollapsed = ref(false);
    const toggleCollapsed = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    const navTitle = computed(() => {
      const path = router.currentRoute.value.path;
      if (path === "/admin" || path === "/admin/") return "控制台";
      if (path === "/admin/login") return "登录";
      return "管理";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0$1;
      _push(`<!--[-->`);
      if (!hidden.value) {
        _push(ssrRenderComponent(Header, {
          collapsed: isCollapsed.value,
          navTitle: navTitle.value,
          onToggle: toggleCollapsed
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<main id="main" data-v-3a4c2c39>`);
      if (!hidden.value) {
        _push(ssrRenderComponent(SideBar, { isCollapsed: isCollapsed.value }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (!hidden.value) {
        _push(`<div class="content" data-v-3a4c2c39>`);
        _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      }
      _push(`</main><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3a4c2c39"]]);

export { admin as default };
//# sourceMappingURL=admin-B0fvj-wQ.mjs.map
