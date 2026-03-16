import { _ as _export_sfc, o as useLocalePath, a as useAdminStore, p as __nuxt_component_0$2 } from './server.mjs';
import _sfc_main$1 from './nuxt-icon-CaSJaWYu.mjs';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { defineComponent, defineAsyncComponent, computed, ref, mergeProps, withCtx, unref, createTextVNode, toDisplayString, createVNode, createBlock, openBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { C as Card } from './card-DrI7ehYz.mjs';
import { f as formatDateTime } from './format-lZD7NQ9Z.mjs';
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
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './index-DYDdtqo2.mjs';
import './index-ToUTMhai.mjs';
import './event-D6RlLW-5.mjs';
import './index-sS3vk-N3.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "articleDesc",
  __ssrInlineRender: true,
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const localePath = useLocalePath();
    const MdPreviewAsync = defineAsyncComponent({
      loader: () => import('md-editor-v3').then((m) => m.MdPreview),
      delay: 100
    });
    const admin = useAdminStore();
    const currentTheme = computed(() => admin.getTheme);
    const props = __props;
    const atLeastLines = ref(20);
    const maxLines = ref(60);
    const isExpand = ref(false);
    const lines = computed(() => props.article.content.split("\n"));
    const displayContent = computed(() => {
      if (isExpand.value) {
        return lines.value.slice(0, maxLines.value).join("\n");
      }
      return lines.value.slice(0, atLeastLines.value).join("\n");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_nuxt_icon = _sfc_main$1;
      const _component_el_button = ElButton;
      _push(ssrRenderComponent(Card, mergeProps({
        class: "article-desc",
        tag: "article"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="title-wrapper" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: unref(localePath)("/article/" + __props.article.id),
              class: "title"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.article.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.article.title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</h2><div class="meta" data-v-98bae1ed${_scopeId}><span class="category" data-v-98bae1ed${_scopeId}>${ssrInterpolate(__props.article.category)}</span><span class="dot" data-v-98bae1ed${_scopeId}>·</span><span class="create-time" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(_component_nuxt_icon, { name: "article/create-time" }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(unref(formatDateTime)(__props.article.createTime))}</span><span class="update-time" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(_component_nuxt_icon, { name: "article/update-time" }, null, _parent2, _scopeId));
            _push2(` ${ssrInterpolate(unref(formatDateTime)(__props.article.updateTime))}</span><div class="tags" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(_component_nuxt_icon, { name: "article/tag" }, null, _parent2, _scopeId));
            _push2(`<!--[-->`);
            ssrRenderList(__props.article.tags, (tag) => {
              _push2(`<span data-v-98bae1ed${_scopeId}>${ssrInterpolate(tag)}</span>`);
            });
            _push2(`<!--]--></div></div><div class="content" data-v-98bae1ed${_scopeId}><div class="${ssrRenderClass([{ "is-collapsed": !isExpand.value }, "md-wrapper"])}" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(unref(MdPreviewAsync), {
              modelValue: displayContent.value,
              theme: currentTheme.value,
              noMermaid: true,
              noKatex: true,
              previewOnly: ""
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="ops" data-v-98bae1ed${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              link: "",
              size: "small",
              onClick: ($event) => isExpand.value = !isExpand.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(isExpand.value ? "收起" : "展开更多")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(isExpand.value ? "收起" : "展开更多"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("h2", { class: "title-wrapper" }, [
                createVNode(_component_NuxtLink, {
                  to: unref(localePath)("/article/" + __props.article.id),
                  class: "title"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(__props.article.title), 1)
                  ]),
                  _: 1
                }, 8, ["to"])
              ]),
              createVNode("div", { class: "meta" }, [
                createVNode("span", { class: "category" }, toDisplayString(__props.article.category), 1),
                createVNode("span", { class: "dot" }, "·"),
                createVNode("span", { class: "create-time" }, [
                  createVNode(_component_nuxt_icon, { name: "article/create-time" }),
                  createTextVNode(" " + toDisplayString(unref(formatDateTime)(__props.article.createTime)), 1)
                ]),
                createVNode("span", { class: "update-time" }, [
                  createVNode(_component_nuxt_icon, { name: "article/update-time" }),
                  createTextVNode(" " + toDisplayString(unref(formatDateTime)(__props.article.updateTime)), 1)
                ]),
                createVNode("div", { class: "tags" }, [
                  createVNode(_component_nuxt_icon, { name: "article/tag" }),
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.article.tags, (tag) => {
                    return openBlock(), createBlock("span", { key: tag }, toDisplayString(tag), 1);
                  }), 128))
                ])
              ]),
              createVNode("div", { class: "content" }, [
                createVNode("div", {
                  class: ["md-wrapper", { "is-collapsed": !isExpand.value }]
                }, [
                  createVNode(unref(MdPreviewAsync), {
                    modelValue: displayContent.value,
                    theme: currentTheme.value,
                    noMermaid: true,
                    noKatex: true,
                    previewOnly: ""
                  }, null, 8, ["modelValue", "theme"])
                ], 2),
                createVNode("div", { class: "ops" }, [
                  createVNode(_component_el_button, {
                    type: "primary",
                    link: "",
                    size: "small",
                    onClick: ($event) => isExpand.value = !isExpand.value
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(isExpand.value ? "收起" : "展开更多"), 1)
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/article/articleDesc.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const articleDesc = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-98bae1ed"]]), { __name: "ArticleDesc" });

export { articleDesc as default };
//# sourceMappingURL=articleDesc-Cvu0pTRL.mjs.map
