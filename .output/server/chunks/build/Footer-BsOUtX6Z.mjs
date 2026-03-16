import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "footer" }, _attrs))} data-v-396e93ff><div class="footer-content container" data-v-396e93ff><div class="site-info" data-v-396e93ff><h3 class="site-title" data-v-396e93ff>${ssrInterpolate(_ctx.$t("header.title"))}</h3><p class="site-description" data-v-396e93ff>${ssrInterpolate(_ctx.$t("footer.description"))}</p></div><div class="footer-bottom" data-v-396e93ff><p class="copy" data-v-396e93ff>© ${ssrInterpolate(unref(year))} ${ssrInterpolate(_ctx.$t("footer.copyright"))}</p><a href="https://beian.miit.gov.cn/" target="_blank" data-v-396e93ff>${ssrInterpolate(_ctx.$t("footer.beian"))}</a></div></div></footer>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/defaultLayout/Footer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Footer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-396e93ff"]]);

export { Footer as default };
//# sourceMappingURL=Footer-BsOUtX6Z.mjs.map
