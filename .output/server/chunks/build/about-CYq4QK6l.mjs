import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createBlock, createCommentVNode, toDisplayString, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, u as useI18n, a as useAdminStore, b as useHead, h as http } from './server.mjs';
import { u as useAsyncData, B as BloggerCard } from './blogger-Y1zoIKkm.mjs';
import { T as ThreeColumnLayout, C as CategoryCard, a as TagCard, R as RecordLinkCard } from './tag-Ba8zo8y-.mjs';
import { C as Card } from './card-DrI7ehYz.mjs';
import { MdPreview } from 'md-editor-v3';
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
import './index-DYDdtqo2.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './nuxt-icon-CaSJaWYu.mjs';
import './typescript-D6L75muK.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "about",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t, locale, setLocale } = useI18n();
    const { data, pending } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("about-home-data", async () => {
      const res = await http.get("/api/home.data");
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => data.value?.stats || null);
    const admin = useAdminStore();
    const currentTheme = computed(() => admin.getTheme);
    const mdPath = computed(() => locale.value === "en" ? "/md/about-en.md" : "/md/about.md");
    const { data: aboutData } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("about-md", async () => {
      return await $fetch(mdPath.value, { responseType: "text" });
    }, { watch: [mdPath] })), __temp = await __temp, __restore(), __temp);
    const aboutMd = computed(() => aboutData.value || "");
    useHead({
      title: t("pages.about.title"),
      meta: [
        { name: "description", content: t("pages.about.meta.description") },
        { name: "keywords", content: t("pages.about.meta.keywords") }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "about" }, _attrs))} data-v-cb932ec2><div class="container" data-v-cb932ec2>`);
      _push(ssrRenderComponent(ThreeColumnLayout, { loading: unref(pending) }, {
        left: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(BloggerCard, {
              articleCount: stats.value?.articles || 0,
              categoryCount: stats.value?.categories || 0,
              tagCount: stats.value?.tags || 0
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(RecordLinkCard, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(BloggerCard, {
                articleCount: stats.value?.articles || 0,
                categoryCount: stats.value?.categories || 0,
                tagCount: stats.value?.tags || 0
              }, null, 8, ["articleCount", "categoryCount", "tagCount"]),
              createVNode(RecordLinkCard)
            ];
          }
        }),
        middle: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(Card, { class: "aboutContent" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<h1 class="title" data-v-cb932ec2${_scopeId2}>${ssrInterpolate(_ctx.$t("pages.about.title"))}</h1>`);
                  if (aboutMd.value) {
                    _push3(ssrRenderComponent(unref(MdPreview), {
                      modelValue: aboutMd.value,
                      theme: currentTheme.value
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    createVNode("h1", { class: "title" }, toDisplayString(_ctx.$t("pages.about.title")), 1),
                    aboutMd.value ? (openBlock(), createBlock(unref(MdPreview), {
                      key: 0,
                      modelValue: aboutMd.value,
                      theme: currentTheme.value
                    }, null, 8, ["modelValue", "theme"])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(Card, { class: "aboutContent" }, {
                default: withCtx(() => [
                  createVNode("h1", { class: "title" }, toDisplayString(_ctx.$t("pages.about.title")), 1),
                  aboutMd.value ? (openBlock(), createBlock(unref(MdPreview), {
                    key: 0,
                    modelValue: aboutMd.value,
                    theme: currentTheme.value
                  }, null, 8, ["modelValue", "theme"])) : createCommentVNode("", true)
                ]),
                _: 1
              })
            ];
          }
        }),
        right: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(CategoryCard, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(TagCard, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(CategoryCard),
              createVNode(TagCard)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const about = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cb932ec2"]]);

export { about as default };
//# sourceMappingURL=about-CYq4QK6l.mjs.map
