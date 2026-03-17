import { E as ElSkeleton, a as ElSkeletonItem } from './blogger-Y1zoIKkm.mjs';
import { E as ElPagination } from './el-pagination-MTKzq10P.mjs';
import { _ as _export_sfc } from './server.mjs';
import { defineComponent, defineAsyncComponent, ref, watch, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrRenderStyle } from 'vue/server-renderer';
import { a as articleService } from './article.service-CFPqqVdc.mjs';
import { C as Card } from './card-DrI7ehYz.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "articleList",
  __ssrInlineRender: true,
  props: {
    single: {
      type: Boolean,
      default: false
    },
    articleList: {
      type: Array,
      default: () => []
    },
    q: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const ArticleDesc = defineAsyncComponent({
      loader: () => import('./articleDesc-Cvu0pTRL.mjs'),
      delay: 100
    });
    const props = __props;
    const single = props.single === true;
    const articleList = ref([]);
    const page = ref(1);
    const limit = ref(10);
    const total = ref(0);
    const loading = ref(false);
    let qTimer = null;
    const loadData = async () => {
      loading.value = true;
      try {
        const res = await articleService.getArticles(page.value, limit.value, props.q || void 0);
        if (res.status === 200) {
          articleList.value = res.data || [];
          total.value = Number(res.total || 0);
        }
      } finally {
        loading.value = false;
      }
    };
    const onPageSizeChange = async (val) => {
      limit.value = val;
      page.value = 1;
      await loadData();
    };
    const onPageChange = async (val) => {
      page.value = val;
      await loadData();
    };
    watch(() => props.q, async () => {
      page.value = 1;
      if (qTimer) clearTimeout(qTimer);
      qTimer = setTimeout(async () => {
        await loadData();
      }, 250);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_skeleton = ElSkeleton;
      const _component_el_skeleton_item = ElSkeletonItem;
      const _component_el_pagination = ElPagination;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article-list" }, _attrs))} data-v-ba0ea9f3>`);
      if (!loading.value) {
        _push(`<div class="list" data-v-ba0ea9f3><!--[-->`);
        ssrRenderList(articleList.value, (item) => {
          _push(ssrRenderComponent(unref(ArticleDesc), {
            key: item.id,
            article: item
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="list" data-v-ba0ea9f3><!--[-->`);
        ssrRenderList(articleList.value, (item) => {
          _push(ssrRenderComponent(Card, {
            key: item.id
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_el_skeleton, { animated: "" }, {
                  template: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_el_skeleton_item, {
                        variant: "h1",
                        style: { "width": "60%", "margin-bottom": "12px" }
                      }, null, _parent3, _scopeId2));
                      _push3(`<div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "margin-bottom": "12px" })}" data-v-ba0ea9f3${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_el_skeleton_item, {
                        variant: "text",
                        style: { "width": "80px" }
                      }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_el_skeleton_item, {
                        variant: "text",
                        style: { "width": "120px" }
                      }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_el_skeleton_item, {
                        variant: "text",
                        style: { "width": "120px" }
                      }, null, _parent3, _scopeId2));
                      _push3(`</div>`);
                      _push3(ssrRenderComponent(_component_el_skeleton_item, { variant: "text" }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_el_skeleton_item, { variant: "text" }, null, _parent3, _scopeId2));
                      _push3(ssrRenderComponent(_component_el_skeleton_item, {
                        variant: "text",
                        style: { "width": "80%" }
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_el_skeleton_item, {
                          variant: "h1",
                          style: { "width": "60%", "margin-bottom": "12px" }
                        }),
                        createVNode("div", { style: { "display": "flex", "gap": "8px", "margin-bottom": "12px" } }, [
                          createVNode(_component_el_skeleton_item, {
                            variant: "text",
                            style: { "width": "80px" }
                          }),
                          createVNode(_component_el_skeleton_item, {
                            variant: "text",
                            style: { "width": "120px" }
                          }),
                          createVNode(_component_el_skeleton_item, {
                            variant: "text",
                            style: { "width": "120px" }
                          })
                        ]),
                        createVNode(_component_el_skeleton_item, { variant: "text" }),
                        createVNode(_component_el_skeleton_item, { variant: "text" }),
                        createVNode(_component_el_skeleton_item, {
                          variant: "text",
                          style: { "width": "80%" }
                        })
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_el_skeleton, { animated: "" }, {
                    template: withCtx(() => [
                      createVNode(_component_el_skeleton_item, {
                        variant: "h1",
                        style: { "width": "60%", "margin-bottom": "12px" }
                      }),
                      createVNode("div", { style: { "display": "flex", "gap": "8px", "margin-bottom": "12px" } }, [
                        createVNode(_component_el_skeleton_item, {
                          variant: "text",
                          style: { "width": "80px" }
                        }),
                        createVNode(_component_el_skeleton_item, {
                          variant: "text",
                          style: { "width": "120px" }
                        }),
                        createVNode(_component_el_skeleton_item, {
                          variant: "text",
                          style: { "width": "120px" }
                        })
                      ]),
                      createVNode(_component_el_skeleton_item, { variant: "text" }),
                      createVNode(_component_el_skeleton_item, { variant: "text" }),
                      createVNode(_component_el_skeleton_item, {
                        variant: "text",
                        style: { "width": "80%" }
                      })
                    ]),
                    _: 1
                  })
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      if (!single) {
        _push(`<div class="pager" data-v-ba0ea9f3>`);
        _push(ssrRenderComponent(_component_el_pagination, {
          background: "",
          layout: "total, sizes, prev, pager, next, jumper",
          total: total.value,
          "current-page": page.value,
          "page-size": limit.value,
          "page-sizes": [10, 20, 50],
          onSizeChange: onPageSizeChange,
          onCurrentChange: onPageChange
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/article/articleList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ArticleList = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-ba0ea9f3"]]), { __name: "ArticleList" });

export { ArticleList as A };
//# sourceMappingURL=articleList-jAiglIJq.mjs.map
