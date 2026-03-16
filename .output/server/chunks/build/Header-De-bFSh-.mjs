import { _ as _export_sfc, n as __nuxt_component_0 } from './server.mjs';
import _sfc_main$1 from './nuxt-icon-CaSJaWYu.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
import 'ipx';
import 'node:crypto';
import 'pinia';
import '@vueuse/core';
import 'lodash-es';
import 'md-editor-v3';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  props: {
    collapsed: { type: Boolean },
    navTitle: {}
  },
  emits: ["toggle"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0;
      const _component_nuxt_icon = _sfc_main$1;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "header" }, _attrs))} data-v-8906876f><div class="headerWrapper" data-v-8906876f><div class="logo" data-v-8906876f>`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        provider: "ipx",
        src: "/img/logo.webp",
        alt: "logo",
        quality: "70",
        loading: "eager",
        fetchpriority: "high",
        class: "logo-img",
        width: 40,
        height: 40
      }, null, _parent));
      _push(`<span class="logo-text" data-v-8906876f>${ssrInterpolate(_ctx.$t("site.name"))}</span></div><div class="navbar" data-v-8906876f><div class="close" data-v-8906876f>`);
      _push(ssrRenderComponent(_component_nuxt_icon, { name: "admin/close" }, null, _parent));
      _push(`</div><div class="title" data-v-8906876f>${ssrInterpolate(__props.navTitle)}</div></div></div></header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/adminLayout/Header.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Header = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8906876f"]]);

export { Header as default };
//# sourceMappingURL=Header-De-bFSh-.mjs.map
