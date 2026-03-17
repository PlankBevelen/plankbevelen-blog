import { E as ElSkeleton, a as ElSkeletonItem } from './blogger-Y1zoIKkm.mjs';
import { _ as _export_sfc, a as useAdminStore } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, renderSlot, ref, computed, createBlock, openBlock, Fragment, renderList, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { C as Card } from './card-DrI7ehYz.mjs';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ThreeColumnLayout",
  __ssrInlineRender: true,
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_skeleton = ElSkeleton;
      const _component_el_skeleton_item = ElSkeletonItem;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "three-column-layout" }, _attrs))} data-v-6b425b05><div class="content" data-v-6b425b05><div class="left" data-v-6b425b05>`);
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
            _push2(`<div class="slot-wrapper" data-v-6b425b05${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "left", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "slot-wrapper" }, [
                renderSlot(_ctx.$slots, "left", {}, void 0, true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div><div class="middle" data-v-6b425b05>`);
      _push(ssrRenderComponent(_component_el_skeleton, {
        loading: __props.loading,
        animated: ""
      }, {
        template: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_skeleton_item, {
              variant: "image",
              style: { "width": "100%", "height": "220px" }
            }, null, _parent2, _scopeId));
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
                style: { "width": "100%", "height": "220px" }
              }),
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
            _push2(`<div class="slot-wrapper" data-v-6b425b05${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "middle", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "slot-wrapper" }, [
                renderSlot(_ctx.$slots, "middle", {}, void 0, true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div><div class="right" data-v-6b425b05>`);
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
            _push2(`<div class="slot-wrapper" data-v-6b425b05${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "right", {}, null, _push2, _parent2, _scopeId);
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "slot-wrapper" }, [
                renderSlot(_ctx.$slots, "right", {}, void 0, true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layouts/ThreeColumnLayout.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ThreeColumnLayout = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-6b425b05"]]), { __name: "LayoutsThreeColumnLayout" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "recordLink",
  __ssrInlineRender: true,
  setup(__props) {
    const recordLink = ref([
      { title: "Nuxt", target: "nuxt.com.cn", link: "https://nuxt.com.cn/" },
      { title: "Figma", target: "figma.com", link: "https://figma.com/" },
      { title: "Aliyun FC", target: "aliyun.com", link: "https://www.aliyun.com/product/fc" },
      { title: "Apifox", target: "apifox.com", link: "https://www.apifox.com/" },
      { title: "MDN WebRTC", target: "developer.mozilla.org", link: "https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API" },
      { title: "GSAP", target: "gsap.com", link: "https://gsap.com/" },
      { title: "Three.js", target: "threejs.org", link: "https://threejs.org/" }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Card, mergeProps({ type: "record-link" }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("recordLink.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("recordLink.title")), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ul class="links" data-v-46a70acb${_scopeId}><!--[-->`);
            ssrRenderList(recordLink.value, (item) => {
              _push2(`<li class="link-item" data-v-46a70acb${_scopeId}><a${ssrRenderAttr("href", item.link)} target="_blank" rel="noopener noreferrer" class="link" data-v-46a70acb${_scopeId}><span class="title" data-v-46a70acb${_scopeId}>${ssrInterpolate(item.title)}</span><span class="target" data-v-46a70acb${_scopeId}>${ssrInterpolate(item.target)}</span></a></li>`);
            });
            _push2(`<!--]--></ul>`);
          } else {
            return [
              createVNode("ul", { class: "links" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(recordLink.value, (item) => {
                  return openBlock(), createBlock("li", {
                    key: item.link,
                    class: "link-item"
                  }, [
                    createVNode("a", {
                      href: item.link,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: "link"
                    }, [
                      createVNode("span", { class: "title" }, toDisplayString(item.title), 1),
                      createVNode("span", { class: "target" }, toDisplayString(item.target), 1)
                    ], 8, ["href"])
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/cards/recordLink.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const RecordLinkCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-46a70acb"]]), { __name: "CardsRecordLink" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "category",
  __ssrInlineRender: true,
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const props = __props;
    const fallback = ref([]);
    const categoryList = computed(() => {
      if (props.categories && props.categories.length > 0) return props.categories;
      return fallback.value;
    });
    function onSelect(item) {
      emit("select", item);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Card, mergeProps({ type: "category" }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(_ctx.$t("category.title"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(_ctx.$t("category.title")), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<ul class="categoryList" data-v-09d2e882${_scopeId}><!--[-->`);
            ssrRenderList(categoryList.value, (item) => {
              _push2(`<li class="category-item" data-v-09d2e882${_scopeId}><span class="name" data-v-09d2e882${_scopeId}>${ssrInterpolate(item.name)}</span><span class="count" data-v-09d2e882${_scopeId}>${ssrInterpolate(item.count)}</span></li>`);
            });
            _push2(`<!--]--></ul>`);
          } else {
            return [
              createVNode("ul", { class: "categoryList" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(categoryList.value, (item) => {
                  return openBlock(), createBlock("li", {
                    key: item.id,
                    class: "category-item",
                    onClick: ($event) => onSelect(item)
                  }, [
                    createVNode("span", { class: "name" }, toDisplayString(item.name), 1),
                    createVNode("span", { class: "count" }, toDisplayString(item.count), 1)
                  ], 8, ["onClick"]);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/cards/category.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const CategoryCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-09d2e882"]]), { __name: "CardsCategory" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tag",
  __ssrInlineRender: true,
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  setup(__props) {
    const props = __props;
    const tagList = ref([]);
    const admin = useAdminStore();
    const rawTags = computed(() => {
      return props.tags.length > 0 ? props.tags : tagList.value;
    });
    const getThemeColors = () => {
      const isLight = admin.getTheme === "light";
      return isLight ? ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399", "#722ed1", "#13c2c2"] : ["#58a6ff", "#7ee787", "#d29922", "#f78166", "#8b949e", "#bc8cff", "#39c5bb"];
    };
    function hash(s) {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      return Math.abs(h);
    }
    const cloudItems = computed(() => {
      const colors = getThemeColors();
      return rawTags.value.map((t) => {
        const name = typeof t === "string" ? t : t.name || "";
        const count = t.count || 1;
        const h = hash(name);
        const baseSize = 14;
        const weightBonus = Math.min(count * 2, 12);
        const randomBonus = h % 6;
        return {
          name,
          size: baseSize + weightBonus + randomBonus,
          rotate: h % 3 * 11 - 11,
          color: colors[h % colors.length],
          opacity: 0.8 + h % 3 * 0.1
        };
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Card, mergeProps({
        type: "tag",
        class: "tag-cloud-card"
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="header-content" data-v-00b29deb${_scopeId}>${ssrInterpolate(_ctx.$t("tag.title"))}</div>`);
          } else {
            return [
              createVNode("div", { class: "header-content" }, toDisplayString(_ctx.$t("tag.title")), 1)
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="cloud-container" data-v-00b29deb${_scopeId}><div class="cloud-wrapper" data-v-00b29deb${_scopeId}><!--[-->`);
            ssrRenderList(cloudItems.value, (w) => {
              _push2(`<span class="cloud-word" style="${ssrRenderStyle({
                fontSize: w.size + "px",
                color: w.color,
                transform: `rotate(${w.rotate}deg)`,
                opacity: w.opacity
              })}" data-v-00b29deb${_scopeId}>${ssrInterpolate(w.name)}</span>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "cloud-container" }, [
                createVNode("div", { class: "cloud-wrapper" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(cloudItems.value, (w) => {
                    return openBlock(), createBlock("span", {
                      key: w.name,
                      class: "cloud-word",
                      style: {
                        fontSize: w.size + "px",
                        color: w.color,
                        transform: `rotate(${w.rotate}deg)`,
                        opacity: w.opacity
                      }
                    }, toDisplayString(w.name), 5);
                  }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/cards/tag.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const TagCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-00b29deb"]]), { __name: "CardsTag" });

export { CategoryCard as C, RecordLinkCard as R, ThreeColumnLayout as T, TagCard as a };
//# sourceMappingURL=tag-Ba8zo8y-.mjs.map
