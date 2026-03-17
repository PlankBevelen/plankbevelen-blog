import _sfc_main$3 from './nuxt-icon-CaSJaWYu.mjs';
import { _ as _export_sfc, u as useI18n, a as useAdminStore, q as navigateTo, b as useHead, p as __nuxt_component_0$2, c as createError, h as http } from './server.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, createBlock, createCommentVNode, openBlock, Fragment, renderList, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { u as useAsyncData, B as BloggerCard, E as ElSkeleton, a as ElSkeletonItem } from './blogger-Y1zoIKkm.mjs';
import { C as Card } from './card-DrI7ehYz.mjs';
import { MdPreview } from 'md-editor-v3';
import { f as formatDateTime } from './format-lZD7NQ9Z.mjs';
import { a as articleService } from './article.service-CFPqqVdc.mjs';
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
import './index-DYDdtqo2.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './typescript-D6L75muK.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TwoColumnLayout",
  __ssrInlineRender: true,
  props: {
    type: {
      type: String,
      default: "rightbigger"
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_skeleton = ElSkeleton;
      const _component_el_skeleton_item = ElSkeletonItem;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "two-column-layout" }, _attrs))} data-v-4d96d795><div class="${ssrRenderClass([[__props.type], "content"])}" data-v-4d96d795><div class="left" data-v-4d96d795>`);
      _push(ssrRenderComponent(_component_el_skeleton, {
        loading: __props.loading,
        animated: ""
      }, {
        template: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "image",
              style: { "width": "100%", "height": "140px" }
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "image",
              style: { "width": "100%", "height": "140px" }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_skeleton_item, {
                variant: "image",
                style: { "width": "100%", "height": "140px" }
              }),
              createVNode(_component_el_skeleton_item, {
                variant: "image",
                style: { "width": "100%", "height": "140px" }
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "left", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "left", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div><div class="right" data-v-4d96d795>`);
      _push(ssrRenderComponent(_component_el_skeleton, {
        loading: __props.loading,
        animated: ""
      }, {
        template: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "h1",
              style: { "width": "60%", "margin": "0 auto 10px" }
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "text",
              style: { "width": "40%", "margin": "0 auto 20px" }
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, { variant: "text" }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, { variant: "text" }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "text",
              style: { "width": "80%" }
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "image",
              style: { "width": "100%", "height": "400px" }
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_skeleton_item, {
                variant: "h1",
                style: { "width": "60%", "margin": "0 auto 10px" }
              }),
              createVNode(_component_el_skeleton_item, {
                variant: "text",
                style: { "width": "40%", "margin": "0 auto 20px" }
              }),
              createVNode(_component_el_skeleton_item, { variant: "text" }),
              createVNode(_component_el_skeleton_item, { variant: "text" }),
              createVNode(_component_el_skeleton_item, {
                variant: "text",
                style: { "width": "80%" }
              }),
              createVNode(_component_el_skeleton_item, {
                variant: "image",
                style: { "width": "100%", "height": "400px" }
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "right", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "right", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layouts/TwoColumnLayout.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const TwoColumnLayout = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-4d96d795"]]), { __name: "LayoutsTwoColumnLayout" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "toc",
  __ssrInlineRender: true,
  props: {
    content: { type: String, default: "" }
  },
  setup(__props) {
    const props = __props;
    const tocItems = computed(() => {
      const lines = (props.content || "").split("\n");
      const items = [];
      for (const line of lines) {
        const m = line.match(/^(#{1,6})\s+(.+)/);
        if (m) items.push({ level: m[1].length, title: m[2].trim() });
      }
      return items.slice(0, 100);
    });
    function onJump(item) {
      const container = (void 0).querySelector(".md-editor-preview");
      if (!container) return;
      const hs = Array.from(container.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      const t = hs.find((h) => (h.textContent || "").trim() === item.title);
      if (!t) return;
      const header = (void 0).querySelector(".header");
      const hh = header?.offsetHeight || 80;
      const rect = t.getBoundingClientRect();
      const top = rect.top + (void 0).scrollY - hh - 16;
      (void 0).scrollTo({ top, behavior: "smooth" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Card, mergeProps({
        class: "toc-card",
        type: "toc"
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("toc.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("toc.title")), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (tocItems.value.length > 0) {
              _push2(`<ul class="toc-list" data-v-577d8cd0${_scopeId}><!--[-->`);
              ssrRenderList(tocItems.value, (item, i) => {
                _push2(`<li class="${ssrRenderClass(["toc-item", "lvl-" + item.level])}" data-v-577d8cd0${_scopeId}><span class="text" data-v-577d8cd0${_scopeId}>${ssrInterpolate(item.title)}</span></li>`);
              });
              _push2(`<!--]--></ul>`);
            } else {
              _push2(`<a class="toTop" href="#" data-v-577d8cd0${_scopeId}>${ssrInterpolate(_ctx.$t("toc.toTop"))}</a>`);
            }
          } else {
            return [
              tocItems.value.length > 0 ? (openBlock(), createBlock("ul", {
                key: 0,
                class: "toc-list"
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(tocItems.value, (item, i) => {
                  return openBlock(), createBlock("li", {
                    key: i,
                    class: ["toc-item", "lvl-" + item.level],
                    onClick: ($event) => onJump(item)
                  }, [
                    createVNode("span", { class: "text" }, toDisplayString(item.title), 1)
                  ], 10, ["onClick"]);
                }), 128))
              ])) : (openBlock(), createBlock("a", {
                key: 1,
                class: "toTop",
                href: "#"
              }, toDisplayString(_ctx.$t("toc.toTop")), 1))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/article/toc.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const Toc = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-577d8cd0"]]), { __name: "ArticleToc" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { t } = useI18n();
    const admin = useAdminStore();
    const currentTheme = computed(() => admin.getTheme);
    const route = useRoute();
    const id = computed(() => {
      return String(route.params.id || "");
    });
    if (!id.value) {
      [__temp, __restore] = withAsyncContext(() => navigateTo("/article", { replace: true })), await __temp, __restore();
    }
    const { data: detailData, pending } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "article-detail",
      async () => {
        const rid = id.value;
        if (!rid) {
          throw createError({ statusCode: 400, statusMessage: "参数错误" });
        }
        const res = await articleService.getArticle(rid);
        if (res?.status === 200) {
          return res.data;
        }
        return null;
      },
      {
        watch: [id]
      }
    )), __temp = await __temp, __restore(), __temp);
    const article = computed(() => detailData.value || null);
    const timeText = computed(() => formatDateTime(article.value?.updateTime || article.value?.createTime || ""));
    const displayContent = computed(() => String(article.value?.content || ""));
    const { data: homeData } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("article-detail-home-data", async () => {
      const res = await http.get("/home.data");
      if (res?.status === 200) return res.data;
      return null;
    })), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => homeData.value?.stats || null);
    const categories = computed(() => homeData.value?.categories || []);
    const articleCategory = computed(() => {
      const cid = String(article.value?.category || "");
      const c = (categories.value || []).find((x) => String(x.id) === cid);
      return c ? c.name : "";
    });
    useHead({
      title: article.value?.title ? `${article.value.title}` : t("pages.article.articleDetail.fallback"),
      meta: [
        { name: "description", content: (article.value?.content || "").slice(0, 120).replace(/[#*`]/g, "") || t("pages.article.articleDetail.meta.description") },
        { name: "keywords", content: (article.value?.tags || []).join(",") + ",plankbevelen, plank, bevelen, PlankBevelen" || t("pages.article.articleDetail.meta.keywords") }
      ],
      link: [
        { rel: "canonical", href: `https://plankbevelen.cn/article/${id.value}` }
      ],
      script: [
        {
          type: "application/ld+json",
          children: computed(() => JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.value?.title,
            image: [],
            datePublished: article.value?.createTime,
            dateModified: article.value?.updateTime || article.value?.createTime,
            author: [{
              "@type": "Person",
              name: "PlankBevelen",
              url: "https://plankbevelen.cn"
            }]
          }))
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_icon = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article-detail" }, _attrs))} data-v-b6aa425a><div class="container" data-v-b6aa425a>`);
      _push(ssrRenderComponent(TwoColumnLayout, {
        loading: unref(pending),
        type: "rightbigger"
      }, {
        left: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(BloggerCard, {
              articleCount: stats.value?.articles || 0,
              categoryCount: stats.value?.categories || 0,
              tagCount: stats.value?.tags || 0
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(Toc, {
              content: article.value?.content || ""
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(BloggerCard, {
                articleCount: stats.value?.articles || 0,
                categoryCount: stats.value?.categories || 0,
                tagCount: stats.value?.tags || 0
              }, null, 8, ["articleCount", "categoryCount", "tagCount"]),
              createVNode(Toc, {
                content: article.value?.content || ""
              }, null, 8, ["content"])
            ];
          }
        }),
        right: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(Card, {
              class: "detailCard",
              tag: "article"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<h1 class="title" data-v-b6aa425a${_scopeId2}>${ssrInterpolate(article.value?.title)}</h1><div class="meta" data-v-b6aa425a${_scopeId2}><span class="category" data-v-b6aa425a${_scopeId2}>${ssrInterpolate(articleCategory.value)}</span><span class="dot" data-v-b6aa425a${_scopeId2}>·</span><span class="time" data-v-b6aa425a${_scopeId2}>${ssrInterpolate(timeText.value)}</span>`);
                  if ((article.value?.tags || []).length) {
                    _push3(`<div class="tags" data-v-b6aa425a${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_nuxt_icon, { name: "article/tag" }, null, _parent3, _scopeId2));
                    _push3(`<!--[-->`);
                    ssrRenderList(article.value?.tags || [], (tag) => {
                      _push3(`<span data-v-b6aa425a${_scopeId2}>${ssrInterpolate(tag)}</span>`);
                    });
                    _push3(`<!--]--></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(unref(MdPreview), {
                    modelValue: displayContent.value,
                    theme: currentTheme.value,
                    noMermaid: true,
                    noKatex: true
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="prev-next" data-v-b6aa425a${_scopeId2}>`);
                  if (article.value?.prev) {
                    _push3(`<div class="item prev" data-v-b6aa425a${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_NuxtLink, {
                      to: { path: "/article/" + article.value.prev.id },
                      class: "link"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(_ctx.$t("pages.article.articleDetail.prev"))}：${ssrInterpolate(article.value.prev.title)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.prev")) + "：" + toDisplayString(article.value.prev.title), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (article.value?.next) {
                    _push3(`<div class="item next" data-v-b6aa425a${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_NuxtLink, {
                      to: { path: "/article/" + article.value.next.id },
                      class: "link"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(_ctx.$t("pages.article.articleDetail.next"))}：${ssrInterpolate(article.value.next.title)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.next")) + "：" + toDisplayString(article.value.next.title), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("h1", { class: "title" }, toDisplayString(article.value?.title), 1),
                    createVNode("div", { class: "meta" }, [
                      createVNode("span", { class: "category" }, toDisplayString(articleCategory.value), 1),
                      createVNode("span", { class: "dot" }, "·"),
                      createVNode("span", { class: "time" }, toDisplayString(timeText.value), 1),
                      (article.value?.tags || []).length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "tags"
                      }, [
                        createVNode(_component_nuxt_icon, { name: "article/tag" }),
                        (openBlock(true), createBlock(Fragment, null, renderList(article.value?.tags || [], (tag) => {
                          return openBlock(), createBlock("span", { key: tag }, toDisplayString(tag), 1);
                        }), 128))
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode(unref(MdPreview), {
                      modelValue: displayContent.value,
                      theme: currentTheme.value,
                      noMermaid: true,
                      noKatex: true
                    }, null, 8, ["modelValue", "theme"]),
                    createVNode("div", { class: "prev-next" }, [
                      article.value?.prev ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "item prev"
                      }, [
                        createVNode(_component_NuxtLink, {
                          to: { path: "/article/" + article.value.prev.id },
                          class: "link"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.prev")) + "：" + toDisplayString(article.value.prev.title), 1)
                          ]),
                          _: 1
                        }, 8, ["to"])
                      ])) : createCommentVNode("", true),
                      article.value?.next ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "item next"
                      }, [
                        createVNode(_component_NuxtLink, {
                          to: { path: "/article/" + article.value.next.id },
                          class: "link"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.next")) + "：" + toDisplayString(article.value.next.title), 1)
                          ]),
                          _: 1
                        }, 8, ["to"])
                      ])) : createCommentVNode("", true)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(Card, {
                class: "detailCard",
                tag: "article"
              }, {
                default: withCtx(() => [
                  createVNode("h1", { class: "title" }, toDisplayString(article.value?.title), 1),
                  createVNode("div", { class: "meta" }, [
                    createVNode("span", { class: "category" }, toDisplayString(articleCategory.value), 1),
                    createVNode("span", { class: "dot" }, "·"),
                    createVNode("span", { class: "time" }, toDisplayString(timeText.value), 1),
                    (article.value?.tags || []).length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "tags"
                    }, [
                      createVNode(_component_nuxt_icon, { name: "article/tag" }),
                      (openBlock(true), createBlock(Fragment, null, renderList(article.value?.tags || [], (tag) => {
                        return openBlock(), createBlock("span", { key: tag }, toDisplayString(tag), 1);
                      }), 128))
                    ])) : createCommentVNode("", true)
                  ]),
                  createVNode(unref(MdPreview), {
                    modelValue: displayContent.value,
                    theme: currentTheme.value,
                    noMermaid: true,
                    noKatex: true
                  }, null, 8, ["modelValue", "theme"]),
                  createVNode("div", { class: "prev-next" }, [
                    article.value?.prev ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "item prev"
                    }, [
                      createVNode(_component_NuxtLink, {
                        to: { path: "/article/" + article.value.prev.id },
                        class: "link"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.prev")) + "：" + toDisplayString(article.value.prev.title), 1)
                        ]),
                        _: 1
                      }, 8, ["to"])
                    ])) : createCommentVNode("", true),
                    article.value?.next ? (openBlock(), createBlock("div", {
                      key: 1,
                      class: "item next"
                    }, [
                      createVNode(_component_NuxtLink, {
                        to: { path: "/article/" + article.value.next.id },
                        class: "link"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(_ctx.$t("pages.article.articleDetail.next")) + "：" + toDisplayString(article.value.next.title), 1)
                        ]),
                        _: 1
                      }, 8, ["to"])
                    ])) : createCommentVNode("", true)
                  ])
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/article/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b6aa425a"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-Bn_BCZ0t.mjs.map
