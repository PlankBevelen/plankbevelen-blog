import { E as ElCard } from './el-card-pCxK5Z-h.mjs';
import { E as ElInput } from './el-input-CL5uOxgl.mjs';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { E as ElTable, a as ElTableColumn } from './el-table-column-COYcazmx.mjs';
import { a as ElTag } from './el-scrollbar-D9cqWD0V.mjs';
import { E as ElPagination } from './el-pagination-MTKzq10P.mjs';
import { _ as _export_sfc, q as navigateTo } from './server.mjs';
import { E as ElMessage } from './index-BH4P6TZ1.mjs';
import { E as ElMessageBox } from './el-overlay-B4BI_kaK.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, createBlock, openBlock, Fragment, renderList, withKeys, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as articleService } from './article.service-CFPqqVdc.mjs';
import { a as appCache } from './cache-Bl-VgnBs.mjs';
import { f as formatDateTime } from './format-lZD7NQ9Z.mjs';
import { t as tagService } from './tag.service-BZ4HA-i1.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import '@vueuse/core';
import 'lodash-es';
import './constants-CUtq6qCd.mjs';
import './index-DYDdtqo2.mjs';
import './event-B21lDVQA.mjs';
import './typescript-D6L75muK.mjs';
import './event-D6RlLW-5.mjs';
import './index-ToUTMhai.mjs';
import './index-sS3vk-N3.mjs';
import './el-popper-Da7PzTYS.mjs';
import './el-checkbox-Da1P_Ltn.mjs';
import './el-select-DINKP6dI.mjs';
import './scroll-Hq3mw777.mjs';
import './vnode-BQHIcHPg.mjs';
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
import './validator-ClkLwfZO.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const searchText = ref("");
    const articleList = ref([]);
    ref([]);
    const page = ref(1);
    const limit = ref(10);
    const total = ref(0);
    const handleEdit = (mode, id) => {
      navigateTo({ path: "/admin/content/article/edit", query: { mode, id } });
    };
    const getArticleList = async () => {
      try {
        const res = await articleService.getArticles(page.value, limit.value, (searchText.value || "").trim());
        if (res.status === 200) {
          const list = (res.data || []).map((i) => ({
            ...i,
            createTime: formatDateTime(i.createTime),
            updateTime: formatDateTime(i.updateTime)
          }));
          articleList.value = list;
          total.value = Number(res.total || 0);
        }
      } catch (error) {
        console.error("获取文章列表失败:", error);
      }
    };
    const onPageSizeChange = async (val) => {
      limit.value = val;
      page.value = 1;
      await getArticleList();
    };
    const onPageChange = async (val) => {
      page.value = val;
      await getArticleList();
    };
    const onSearch = async () => {
      page.value = 1;
      await getArticleList();
    };
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确认删除该文章吗？", "提示", { type: "warning" });
        const detail = await articleService.getArticle(id);
        const removeTags = detail.status === 200 ? detail.data?.tags || [] : [];
        const res = await articleService.deleteArticle(id);
        if (res.status === 200) {
          if (removeTags.length) {
            await tagService.syncTags([], removeTags);
          }
          appCache.removeCategories();
          ElMessage.success("删除成功");
          await getArticleList();
        }
      } catch (error) {
        ElMessage.error(error?.msg || "删除失败");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      const _component_el_input = ElInput;
      const _component_el_button = ElButton;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_pagination = ElPagination;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article" }, _attrs))} data-v-048329a7><div class="header" data-v-048329a7><h2 class="title" data-v-048329a7>文章管理</h2></div>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "article-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header-content" data-v-048329a7${_scopeId}><div class="search-area" data-v-048329a7${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_input, {
              placeholder: "搜索文章标题、分类、标签",
              modelValue: searchText.value,
              "onUpdate:modelValue": ($event) => searchText.value = $event,
              clearable: "",
              "prefix-icon": "Search",
              class: "search-input",
              onKeyup: onSearch
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="actions" data-v-048329a7${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              icon: "Plus",
              onClick: ($event) => handleEdit("add")
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`新增文章`);
                } else {
                  return [
                    createTextVNode("新增文章")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "card-header-content" }, [
                createVNode("div", { class: "search-area" }, [
                  createVNode(_component_el_input, {
                    placeholder: "搜索文章标题、分类、标签",
                    modelValue: searchText.value,
                    "onUpdate:modelValue": ($event) => searchText.value = $event,
                    clearable: "",
                    "prefix-icon": "Search",
                    class: "search-input",
                    onKeyup: withKeys(onSearch, ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", { class: "actions" }, [
                  createVNode(_component_el_button, {
                    type: "primary",
                    icon: "Plus",
                    onClick: ($event) => handleEdit("add")
                  }, {
                    default: withCtx(() => [
                      createTextVNode("新增文章")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="article-content" data-v-048329a7${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_table, {
              data: articleList.value,
              style: { "width": "100%" },
              "header-cell-style": { background: "var(--bg-color)", color: "var(--text-color)" }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "title",
                    label: "文章标题",
                    "min-width": "200",
                    "show-overflow-tooltip": ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "category",
                    label: "分类",
                    width: "150"
                  }, {
                    default: withCtx((scope, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_tag, {
                          effect: "light",
                          size: "small"
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(scope.row.category)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(scope.row.category), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_tag, {
                            effect: "light",
                            size: "small"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(scope.row.category), 1)
                            ]),
                            _: 2
                          }, 1024)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "tags",
                    label: "标签",
                    width: "200"
                  }, {
                    default: withCtx((scope, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="tags-wrapper" data-v-048329a7${_scopeId3}><!--[-->`);
                        ssrRenderList(scope.row.tags, (tag, index2) => {
                          _push4(ssrRenderComponent(_component_el_tag, {
                            key: index2,
                            size: "small",
                            effect: "plain",
                            class: "tag-item"
                          }, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(tag)}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(tag), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        });
                        _push4(`<!--]--></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "tags-wrapper" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(scope.row.tags, (tag, index2) => {
                              return openBlock(), createBlock(_component_el_tag, {
                                key: index2,
                                size: "small",
                                effect: "plain",
                                class: "tag-item"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(tag), 1)
                                ]),
                                _: 2
                              }, 1024);
                            }), 128))
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "createTime",
                    label: "创建时间",
                    width: "160",
                    sortable: ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "updateTime",
                    label: "更新时间",
                    width: "160",
                    sortable: ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "操作",
                    width: "180",
                    fixed: "right"
                  }, {
                    default: withCtx((scope, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "primary",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleEdit("update", scope.row.id)
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`编辑`);
                            } else {
                              return [
                                createTextVNode("编辑")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "danger",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleDelete(scope.row.id)
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`删除`);
                            } else {
                              return [
                                createTextVNode("删除")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "primary",
                            link: "",
                            size: "small",
                            onClick: ($event) => handleEdit("update", scope.row.id)
                          }, {
                            default: withCtx(() => [
                              createTextVNode("编辑")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(_component_el_button, {
                            type: "danger",
                            link: "",
                            size: "small",
                            onClick: ($event) => handleDelete(scope.row.id)
                          }, {
                            default: withCtx(() => [
                              createTextVNode("删除")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_table_column, {
                      prop: "title",
                      label: "文章标题",
                      "min-width": "200",
                      "show-overflow-tooltip": ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "category",
                      label: "分类",
                      width: "150"
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_tag, {
                          effect: "light",
                          size: "small"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(scope.row.category), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "tags",
                      label: "标签",
                      width: "200"
                    }, {
                      default: withCtx((scope) => [
                        createVNode("div", { class: "tags-wrapper" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(scope.row.tags, (tag, index2) => {
                            return openBlock(), createBlock(_component_el_tag, {
                              key: index2,
                              size: "small",
                              effect: "plain",
                              class: "tag-item"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(tag), 1)
                              ]),
                              _: 2
                            }, 1024);
                          }), 128))
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "createTime",
                      label: "创建时间",
                      width: "160",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "updateTime",
                      label: "更新时间",
                      width: "160",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      label: "操作",
                      width: "180",
                      fixed: "right"
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleEdit("update", scope.row.id)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("编辑")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(_component_el_button, {
                          type: "danger",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleDelete(scope.row.id)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("删除")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="pagination-wrapper" data-v-048329a7${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_pagination, {
              background: "",
              layout: "total, sizes, prev, pager, next, jumper",
              total: total.value,
              "current-page": page.value,
              "page-size": limit.value,
              "page-sizes": [10, 20, 50],
              onSizeChange: onPageSizeChange,
              onCurrentChange: onPageChange
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "article-content" }, [
                createVNode(_component_el_table, {
                  data: articleList.value,
                  style: { "width": "100%" },
                  "header-cell-style": { background: "var(--bg-color)", color: "var(--text-color)" }
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_table_column, {
                      prop: "title",
                      label: "文章标题",
                      "min-width": "200",
                      "show-overflow-tooltip": ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "category",
                      label: "分类",
                      width: "150"
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_tag, {
                          effect: "light",
                          size: "small"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(scope.row.category), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "tags",
                      label: "标签",
                      width: "200"
                    }, {
                      default: withCtx((scope) => [
                        createVNode("div", { class: "tags-wrapper" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(scope.row.tags, (tag, index2) => {
                            return openBlock(), createBlock(_component_el_tag, {
                              key: index2,
                              size: "small",
                              effect: "plain",
                              class: "tag-item"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(tag), 1)
                              ]),
                              _: 2
                            }, 1024);
                          }), 128))
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "createTime",
                      label: "创建时间",
                      width: "160",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "updateTime",
                      label: "更新时间",
                      width: "160",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      label: "操作",
                      width: "180",
                      fixed: "right"
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleEdit("update", scope.row.id)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("编辑")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(_component_el_button, {
                          type: "danger",
                          link: "",
                          size: "small",
                          onClick: ($event) => handleDelete(scope.row.id)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("删除")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["data"]),
                createVNode("div", { class: "pagination-wrapper" }, [
                  createVNode(_component_el_pagination, {
                    background: "",
                    layout: "total, sizes, prev, pager, next, jumper",
                    total: total.value,
                    "current-page": page.value,
                    "page-size": limit.value,
                    "page-sizes": [10, 20, 50],
                    onSizeChange: onPageSizeChange,
                    onCurrentChange: onPageChange
                  }, null, 8, ["total", "current-page", "page-size"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/article/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-048329a7"]]);

export { index as default };
//# sourceMappingURL=index-BZtsHzXz.mjs.map
