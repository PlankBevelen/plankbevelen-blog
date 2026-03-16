import { _ as _export_sfc, o as useLocalePath, u as useI18n, b as useHead, p as __nuxt_component_0$2, h as http, q as navigateTo } from './server.mjs';
import { E as ElInput } from './el-input-CL5uOxgl.mjs';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, createBlock, createCommentVNode, openBlock, Fragment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { u as useAsyncData, B as BloggerCard } from './blogger-Y1zoIKkm.mjs';
import { C as Card } from './card-DrI7ehYz.mjs';
import { A as ArticleList } from './articleList-jAiglIJq.mjs';
import { T as ThreeColumnLayout, C as CategoryCard, a as TagCard, R as RecordLinkCard } from './tag-Ba8zo8y-.mjs';
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
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './index-DYDdtqo2.mjs';
import './event-B21lDVQA.mjs';
import './typescript-D6L75muK.mjs';
import './event-D6RlLW-5.mjs';
import './index-ToUTMhai.mjs';
import './index-sS3vk-N3.mjs';
import './nuxt-icon-CaSJaWYu.mjs';
import './el-pagination-MTKzq10P.mjs';
import './el-select-DINKP6dI.mjs';
import './el-popper-Da7PzTYS.mjs';
import './el-scrollbar-D9cqWD0V.mjs';
import './scroll-Hq3mw777.mjs';
import './vnode-BQHIcHPg.mjs';
import './article.service-CFPqqVdc.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const localePath = useLocalePath();
    const { t } = useI18n();
    const keyword = ref("");
    const route = useRoute();
    keyword.value = String(route.query.q || "");
    const currentQuery = computed(() => {
      const cat = String(route.query.category || "");
      if (cat) return cat;
      return String(route.query.q || "");
    });
    const breadcrumbSuffix = computed(() => {
      const cat = String(route.query.category || "");
      if (cat) return `${cat}`;
      const q = String(route.query.q || "").trim();
      if (q) return q;
      return "";
    });
    const { data: homeData, pending: homePending } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("article-page-home-data", async () => {
      const res = await http.get("/api/home.data");
      console.log(res, res.status, res.data);
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => homeData.value?.stats || null);
    const onSearch = async () => {
      const target = localePath("/article");
      await navigateTo({ path: target, query: { q: keyword.value || void 0 } });
    };
    const onSelectCategory = async (item) => {
      const target = localePath("/article");
      await navigateTo({ path: target, query: { category: item.name } });
    };
    watch(() => route.query.q, (val) => {
      keyword.value = String(val || "");
    });
    useHead({
      title: t("pages.article.title"),
      meta: [
        { name: "description", content: t("pages.article.meta.description") },
        { name: "keywords", content: t("pages.article.meta.keywords") }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_el_input = ElInput;
      const _component_el_button = ElButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article" }, _attrs))} data-v-e8dacd04><div class="container" data-v-e8dacd04>`);
      _push(ssrRenderComponent(ThreeColumnLayout, { loading: unref(homePending) }, {
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
            _push2(ssrRenderComponent(Card, { class: "navBar" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="breadcrumb" data-v-e8dacd04${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_NuxtLink, {
                    to: unref(localePath)("/article")
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(_ctx.$t("pages.article.title"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.title")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (breadcrumbSuffix.value) {
                    _push3(`<!--[--><span data-v-e8dacd04${_scopeId2}> / </span><span data-v-e8dacd04${_scopeId2}>${ssrInterpolate(breadcrumbSuffix.value)}</span><!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div><div class="searchArea" data-v-e8dacd04${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_el_input, {
                    modelValue: keyword.value,
                    "onUpdate:modelValue": ($event) => keyword.value = $event,
                    placeholder: _ctx.$t("pages.article.search.placeholder"),
                    clearable: ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_button, {
                    type: "primary",
                    onClick: onSearch
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(_ctx.$t("pages.article.search.btn"))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.search.btn")), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "breadcrumb" }, [
                      createVNode(_component_NuxtLink, {
                        to: unref(localePath)("/article")
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.title")), 1)
                        ]),
                        _: 1
                      }, 8, ["to"]),
                      breadcrumbSuffix.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode("span", null, " / "),
                        createVNode("span", null, toDisplayString(breadcrumbSuffix.value), 1)
                      ], 64)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "searchArea" }, [
                      createVNode(_component_el_input, {
                        modelValue: keyword.value,
                        "onUpdate:modelValue": ($event) => keyword.value = $event,
                        placeholder: _ctx.$t("pages.article.search.placeholder"),
                        clearable: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"]),
                      createVNode(_component_el_button, {
                        type: "primary",
                        onClick: onSearch
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.search.btn")), 1)
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(ArticleList, { q: currentQuery.value }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(Card, { class: "navBar" }, {
                default: withCtx(() => [
                  createVNode("div", { class: "breadcrumb" }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)("/article")
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(_ctx.$t("pages.article.title")), 1)
                      ]),
                      _: 1
                    }, 8, ["to"]),
                    breadcrumbSuffix.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createVNode("span", null, " / "),
                      createVNode("span", null, toDisplayString(breadcrumbSuffix.value), 1)
                    ], 64)) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "searchArea" }, [
                    createVNode(_component_el_input, {
                      modelValue: keyword.value,
                      "onUpdate:modelValue": ($event) => keyword.value = $event,
                      placeholder: _ctx.$t("pages.article.search.placeholder"),
                      clearable: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"]),
                    createVNode(_component_el_button, {
                      type: "primary",
                      onClick: onSearch
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(_ctx.$t("pages.article.search.btn")), 1)
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              }),
              createVNode(ArticleList, { q: currentQuery.value }, null, 8, ["q"])
            ];
          }
        }),
        right: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(CategoryCard, {
              categories: unref(homeData).categories,
              onSelect: onSelectCategory
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(TagCard, {
              tags: unref(homeData).tags
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(CategoryCard, {
                categories: unref(homeData).categories,
                onSelect: onSelectCategory
              }, null, 8, ["categories"]),
              createVNode(TagCard, {
                tags: unref(homeData).tags
              }, null, 8, ["tags"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/article/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e8dacd04"]]);

export { index as default };
//# sourceMappingURL=index-BiHrz_xt.mjs.map
