import { defineComponent, ref, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import _sfc_main$2 from './nuxt-icon-CaSJaWYu.mjs';
import { E as ElCard } from './el-card-pCxK5Z-h.mjs';
import { a as ElTag } from './el-scrollbar-D9cqWD0V.mjs';
import { E as ElTable, a as ElTableColumn } from './el-table-column-COYcazmx.mjs';
import { _ as _export_sfc, q as navigateTo } from './server.mjs';
import dayjs from 'dayjs';
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import '@vueuse/core';
import './index-DYDdtqo2.mjs';
import 'lodash-es';
import './index-ToUTMhai.mjs';
import './event-D6RlLW-5.mjs';
import './index-sS3vk-N3.mjs';
import './el-popper-Da7PzTYS.mjs';
import './event-B21lDVQA.mjs';
import './el-checkbox-Da1P_Ltn.mjs';
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
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const stats = ref({
      totalArticles: 0,
      totalCategories: 0,
      totalTags: 0,
      recentArticles: [],
      publishTrend: []
    });
    const trendChartRef = ref();
    const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_button = ElButton;
      const _component_nuxt_icon = _sfc_main$2;
      const _component_el_card = ElCard;
      const _component_el_tag = ElTag;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard" }, _attrs))} data-v-9607a205><div class="header" data-v-9607a205><h2 class="title" data-v-9607a205>仪表盘</h2><div class="actions" data-v-9607a205>`);
      _push(ssrRenderComponent(_component_el_button, {
        type: "primary",
        onClick: ($event) => unref(navigateTo)("/admin/content/article/edit")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_nuxt_icon, {
              name: "admin/add",
              class: "mr-1"
            }, null, _parent2, _scopeId));
            _push2(` 写文章 `);
          } else {
            return [
              createVNode(_component_nuxt_icon, {
                name: "admin/add",
                class: "mr-1"
              }),
              createTextVNode(" 写文章 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="overview-cards" data-v-9607a205>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "stat-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-9607a205${_scopeId}><span data-v-9607a205${_scopeId}>文章总数</span>`);
            _push2(ssrRenderComponent(_component_el_tag, { type: "success" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Total`);
                } else {
                  return [
                    createTextVNode("Total")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "文章总数"),
                createVNode(_component_el_tag, { type: "success" }, {
                  default: withCtx(() => [
                    createTextVNode("Total")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-content" data-v-9607a205${_scopeId}><div class="number" data-v-9607a205${_scopeId}>${ssrInterpolate(stats.value.totalArticles)}</div><div class="desc" data-v-9607a205${_scopeId}>篇已发布文章</div></div>`);
          } else {
            return [
              createVNode("div", { class: "card-content" }, [
                createVNode("div", { class: "number" }, toDisplayString(stats.value.totalArticles), 1),
                createVNode("div", { class: "desc" }, "篇已发布文章")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "stat-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-9607a205${_scopeId}><span data-v-9607a205${_scopeId}>分类总数</span>`);
            _push2(ssrRenderComponent(_component_el_tag, { type: "warning" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Category`);
                } else {
                  return [
                    createTextVNode("Category")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "分类总数"),
                createVNode(_component_el_tag, { type: "warning" }, {
                  default: withCtx(() => [
                    createTextVNode("Category")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-content" data-v-9607a205${_scopeId}><div class="number" data-v-9607a205${_scopeId}>${ssrInterpolate(stats.value.totalCategories)}</div><div class="desc" data-v-9607a205${_scopeId}>个活跃分类</div></div>`);
          } else {
            return [
              createVNode("div", { class: "card-content" }, [
                createVNode("div", { class: "number" }, toDisplayString(stats.value.totalCategories), 1),
                createVNode("div", { class: "desc" }, "个活跃分类")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "stat-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-9607a205${_scopeId}><span data-v-9607a205${_scopeId}>标签总数</span>`);
            _push2(ssrRenderComponent(_component_el_tag, { type: "info" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Tags`);
                } else {
                  return [
                    createTextVNode("Tags")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "标签总数"),
                createVNode(_component_el_tag, { type: "info" }, {
                  default: withCtx(() => [
                    createTextVNode("Tags")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-content" data-v-9607a205${_scopeId}><div class="number" data-v-9607a205${_scopeId}>${ssrInterpolate(stats.value.totalTags)}</div><div class="desc" data-v-9607a205${_scopeId}>个内容标签</div></div>`);
          } else {
            return [
              createVNode("div", { class: "card-content" }, [
                createVNode("div", { class: "number" }, toDisplayString(stats.value.totalTags), 1),
                createVNode("div", { class: "desc" }, "个内容标签")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="dashboard-grid" data-v-9607a205>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "chart-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-9607a205${_scopeId}><span data-v-9607a205${_scopeId}>发布趋势 (近6个月)</span></div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "发布趋势 (近6个月)")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-container" data-v-9607a205${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", {
                ref_key: "trendChartRef",
                ref: trendChartRef,
                class: "chart-container"
              }, null, 512)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "list-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-9607a205${_scopeId}><span data-v-9607a205${_scopeId}>最新文章</span>`);
            _push2(ssrRenderComponent(_component_el_button, {
              link: "",
              type: "primary",
              onClick: ($event) => unref(navigateTo)("/admin/content/article")
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`全部`);
                } else {
                  return [
                    createTextVNode("全部")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "最新文章"),
                createVNode(_component_el_button, {
                  link: "",
                  type: "primary",
                  onClick: ($event) => unref(navigateTo)("/admin/content/article")
                }, {
                  default: withCtx(() => [
                    createTextVNode("全部")
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_table, {
              data: stats.value.recentArticles,
              style: { "width": "100%" },
              "show-header": false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "title",
                    label: "标题",
                    "show-overflow-tooltip": ""
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="article-title" data-v-9607a205${_scopeId3}>${ssrInterpolate(row.title)}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "article-title" }, toDisplayString(row.title), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "created_at",
                    label: "时间",
                    width: "120",
                    align: "right"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-gray-400 text-xs" data-v-9607a205${_scopeId3}>${ssrInterpolate(formatDate(row.created_at))}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-gray-400 text-xs" }, toDisplayString(formatDate(row.created_at)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_table_column, {
                      prop: "title",
                      label: "标题",
                      "show-overflow-tooltip": ""
                    }, {
                      default: withCtx(({ row }) => [
                        createVNode("span", { class: "article-title" }, toDisplayString(row.title), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "created_at",
                      label: "时间",
                      width: "120",
                      align: "right"
                    }, {
                      default: withCtx(({ row }) => [
                        createVNode("span", { class: "text-gray-400 text-xs" }, toDisplayString(formatDate(row.created_at)), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_table, {
                data: stats.value.recentArticles,
                style: { "width": "100%" },
                "show-header": false
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_table_column, {
                    prop: "title",
                    label: "标题",
                    "show-overflow-tooltip": ""
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode("span", { class: "article-title" }, toDisplayString(row.title), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "created_at",
                    label: "时间",
                    width: "120",
                    align: "right"
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode("span", { class: "text-gray-400 text-xs" }, toDisplayString(formatDate(row.created_at)), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["data"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/dashboard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const Dashboard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-9607a205"]]), { __name: "AdminDashboard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Dashboard, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1a435b39"]]);

export { index as default };
//# sourceMappingURL=index-DxUjayqS.mjs.map
