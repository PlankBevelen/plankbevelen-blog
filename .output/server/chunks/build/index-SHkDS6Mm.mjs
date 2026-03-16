import { defineComponent, reactive, withAsyncContext, watch, mergeProps, unref, withCtx, createVNode, createBlock, openBlock, KeepAlive, ref, computed, toDisplayString, Fragment, renderList, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { T as ThreeColumnLayout, C as CategoryCard, a as TagCard, R as RecordLinkCard } from './tag-Ba8zo8y-.mjs';
import { u as useAsyncData, B as BloggerCard } from './blogger-Y1zoIKkm.mjs';
import { A as ArticleList } from './articleList-jAiglIJq.mjs';
import { _ as _export_sfc, o as useLocalePath, u as useI18n, b as useHead, h as http, q as navigateTo, p as __nuxt_component_0$2 } from './server.mjs';
import { C as Card } from './card-DrI7ehYz.mjs';
import { f as formatDateTime } from './format-lZD7NQ9Z.mjs';
import './index-DYDdtqo2.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './nuxt-icon-CaSJaWYu.mjs';
import './typescript-D6L75muK.mjs';
import '@vueuse/core';
import './el-pagination-MTKzq10P.mjs';
import './constants-CUtq6qCd.mjs';
import 'lodash-es';
import './el-select-DINKP6dI.mjs';
import './el-popper-Da7PzTYS.mjs';
import './event-B21lDVQA.mjs';
import './el-scrollbar-D9cqWD0V.mjs';
import './event-D6RlLW-5.mjs';
import './el-input-CL5uOxgl.mjs';
import './scroll-Hq3mw777.mjs';
import './vnode-BQHIcHPg.mjs';
import './index-ToUTMhai.mjs';
import './article.service-CFPqqVdc.mjs';
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
import 'md-editor-v3';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "latest",
  __ssrInlineRender: true,
  props: {
    articles: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const localePath = useLocalePath();
    const props = __props;
    const fallback = ref([]);
    const latestList = computed(() => {
      if (props.articles && props.articles.length > 0) {
        return props.articles.map((a) => ({ id: a.id, title: a.title, category: a.category, createTime: a.createTime }));
      }
      return fallback.value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(ssrRenderComponent(Card, mergeProps({ type: "latest" }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("latest.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("latest.title")), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ul class="latestList" data-v-542deb9d${_scopeId}><!--[-->`);
            ssrRenderList(latestList.value, (item) => {
              _push2(`<li class="latest-item" data-v-542deb9d${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: unref(localePath)("/article/" + item.id)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="time" data-v-542deb9d${_scopeId2}>${ssrInterpolate(unref(formatDateTime)(item.createTime))}</div><div class="title" data-v-542deb9d${_scopeId2}>${ssrInterpolate(item.title)}</div><div class="category" data-v-542deb9d${_scopeId2}>${ssrInterpolate(item.category)}</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "time" }, toDisplayString(unref(formatDateTime)(item.createTime)), 1),
                      createVNode("div", { class: "title" }, toDisplayString(item.title), 1),
                      createVNode("div", { class: "category" }, toDisplayString(item.category), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</li>`);
            });
            _push2(`<!--]--></ul>`);
          } else {
            return [
              createVNode("ul", { class: "latestList" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(latestList.value, (item) => {
                  return openBlock(), createBlock("li", {
                    key: item.id,
                    class: "latest-item"
                  }, [
                    createVNode(_component_NuxtLink, {
                      to: unref(localePath)("/article/" + item.id)
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "time" }, toDisplayString(unref(formatDateTime)(item.createTime)), 1),
                        createVNode("div", { class: "title" }, toDisplayString(item.title), 1),
                        createVNode("div", { class: "category" }, toDisplayString(item.category), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"])
                  ]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/article/latest.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const LatestArticlesCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-542deb9d"]]), { __name: "ArticleLatest" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const localePath = useLocalePath();
    const { t } = useI18n();
    const homeData = reactive({
      articles: [],
      latestArticles: [],
      categories: [],
      tags: [],
      stats: null
    });
    const { data, pending } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("home-data", async () => {
      try {
        const res = await http.get("/home.data");
        if (res.status === 200) {
          return res.data;
        } else {
          throw Error(res.msg || "获取首页数据失败");
        }
      } catch (err) {
        throw Error(err.message || "获取首页数据失败");
      }
    })), __temp = await __temp, __restore(), __temp);
    const onSelectCategory = async (item) => {
      const target = localePath("/article");
      await navigateTo({ path: target, query: { category: item.name } });
    };
    watch(data, (newData) => {
      if (newData) {
        homeData.articles = newData.articles || [];
        homeData.latestArticles = newData.latestArticles || [];
        homeData.categories = newData.categories || [];
        homeData.tags = newData.tags || [];
        homeData.stats = newData.stats || null;
      }
    }, { immediate: true, deep: true });
    useHead({
      title: t("pages.home.title"),
      meta: [
        { name: "description", content: t("pages.home.meta.description") },
        { name: "keywords", content: t("pages.home.meta.keywords") }
      ],
      script: [
        {
          type: "application/ld+json"
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home" }, _attrs))} data-v-ad8b3746><div class="container" data-v-ad8b3746>`);
      _push(ssrRenderComponent(ThreeColumnLayout, { loading: unref(pending) }, {
        left: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(BloggerCard, {
              articleCount: unref(homeData).stats?.articles,
              categoryCount: unref(homeData).stats?.categories,
              tagCount: unref(homeData).stats?.tags
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(RecordLinkCard, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(BloggerCard, {
                articleCount: unref(homeData).stats?.articles,
                categoryCount: unref(homeData).stats?.categories,
                tagCount: unref(homeData).stats?.tags
              }, null, 8, ["articleCount", "categoryCount", "tagCount"]),
              createVNode(RecordLinkCard)
            ];
          }
        }),
        middle: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            _push2(ssrRenderComponent(ArticleList, {
              single: "",
              articleList: unref(homeData).articles
            }, null, _parent2, _scopeId));
          } else {
            return [
              (openBlock(), createBlock(KeepAlive, null, [
                createVNode(ArticleList, {
                  single: "",
                  articleList: unref(homeData).articles
                }, null, 8, ["articleList"])
              ], 1024))
            ];
          }
        }),
        right: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(LatestArticlesCard, {
              articles: unref(homeData).latestArticles
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(CategoryCard, {
              categories: unref(homeData).categories,
              onSelect: onSelectCategory
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(TagCard, {
              tags: unref(homeData).tags
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(LatestArticlesCard, {
                articles: unref(homeData).latestArticles
              }, null, 8, ["articles"]),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ad8b3746"]]);

export { index as default };
//# sourceMappingURL=index-SHkDS6Mm.mjs.map
