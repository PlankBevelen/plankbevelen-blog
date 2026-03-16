import { defineComponent, ref, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs } from 'vue/server-renderer';
import { E as ElCard } from './el-card-pCxK5Z-h.mjs';
import { _ as _export_sfc } from './server.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "statistics",
  __ssrInlineRender: true,
  setup(__props) {
    const categoryChartRef = ref();
    const tagChartRef = ref();
    const trendChartRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "statistics" }, _attrs))} data-v-20a8c141><div class="header" data-v-20a8c141><h2 class="title" data-v-20a8c141>数据统计</h2></div><div class="charts-grid" data-v-20a8c141>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "chart-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-20a8c141${_scopeId}><span data-v-20a8c141${_scopeId}>分类文章占比</span></div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "分类文章占比")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-container" data-v-20a8c141${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", {
                ref_key: "categoryChartRef",
                ref: categoryChartRef,
                class: "chart-container"
              }, null, 512)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "chart-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-20a8c141${_scopeId}><span data-v-20a8c141${_scopeId}>热门标签 Top 10</span></div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "热门标签 Top 10")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-container" data-v-20a8c141${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", {
                ref_key: "tagChartRef",
                ref: tagChartRef,
                class: "chart-container"
              }, null, 512)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "chart-card full-width"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-20a8c141${_scopeId}><span data-v-20a8c141${_scopeId}>内容发布趋势</span></div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode("span", null, "内容发布趋势")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="chart-container" data-v-20a8c141${_scopeId}></div>`);
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
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/statistics.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const Statistics = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-20a8c141"]]), { __name: "AdminStatistics" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(Statistics, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/statistics/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ab4d2f6b"]]);

export { index as default };
//# sourceMappingURL=index-DYKlsQOe.mjs.map
