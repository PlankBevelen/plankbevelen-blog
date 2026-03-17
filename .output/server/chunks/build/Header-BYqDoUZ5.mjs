import { _ as _export_sfc, a as useAdminStore, o as useLocalePath, U as useSwitchLocalePath, n as __nuxt_component_0, p as __nuxt_component_0$2, w as withInstall, f as buildProps, g as definePropType, G as isBoolean, s as shared_cjs_prodExports, k as isNumber, j as useNamespace, x as debugWarn, z as throwError } from './server.mjs';
import _sfc_main$2 from './nuxt-icon-CaSJaWYu.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, shallowRef, createElementBlock, openBlock, withModifiers, normalizeClass, createElementVNode, createCommentVNode, withKeys, createBlock, resolveDynamicComponent, normalizeStyle, renderSlot, useSSRContext, nextTick } from 'vue';
import { u as useAriaProps, i as iconPropType, b as addUnit, E as ElIcon } from './constants-CUtq6qCd.mjs';
import { l as loading_default } from './index-DYDdtqo2.mjs';
import { i as isValidComponentSize } from './validator-ClkLwfZO.mjs';
import { u as useFormItem, b as useFormSize, a as useFormItemInputId, c as useFormDisabled, U as UPDATE_MODEL_EVENT, C as CHANGE_EVENT, I as INPUT_EVENT } from './event-D6RlLW-5.mjs';
import { _ as _export_sfc$1 } from './plugin-vue_export-helper-BqDg8bah.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

const switchProps = buildProps({
  modelValue: {
    type: [Boolean, String, Number],
    default: false
  },
  disabled: Boolean,
  loading: Boolean,
  size: {
    type: String,
    validator: isValidComponentSize
  },
  width: {
    type: [String, Number],
    default: ""
  },
  inlinePrompt: Boolean,
  inactiveActionIcon: {
    type: iconPropType
  },
  activeActionIcon: {
    type: iconPropType
  },
  activeIcon: {
    type: iconPropType
  },
  inactiveIcon: {
    type: iconPropType
  },
  activeText: {
    type: String,
    default: ""
  },
  inactiveText: {
    type: String,
    default: ""
  },
  activeValue: {
    type: [Boolean, String, Number],
    default: true
  },
  inactiveValue: {
    type: [Boolean, String, Number],
    default: false
  },
  name: {
    type: String,
    default: ""
  },
  validateEvent: {
    type: Boolean,
    default: true
  },
  beforeChange: {
    type: definePropType(Function)
  },
  id: String,
  tabindex: {
    type: [String, Number]
  },
  ...useAriaProps(["ariaLabel"])
});
const switchEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isBoolean(val) || shared_cjs_prodExports.isString(val) || isNumber(val),
  [CHANGE_EVENT]: (val) => isBoolean(val) || shared_cjs_prodExports.isString(val) || isNumber(val),
  [INPUT_EVENT]: (val) => isBoolean(val) || shared_cjs_prodExports.isString(val) || isNumber(val)
};
const COMPONENT_NAME = "ElSwitch";
const __default__ = defineComponent({
  name: COMPONENT_NAME
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: switchProps,
  emits: switchEmits,
  setup(__props, { expose, emit }) {
    const props = __props;
    const { formItem } = useFormItem();
    const switchSize = useFormSize();
    const ns = useNamespace("switch");
    const { inputId } = useFormItemInputId(props, {
      formItemContext: formItem
    });
    const switchDisabled = useFormDisabled(computed(() => props.loading));
    const isControlled = ref(props.modelValue !== false);
    const input = shallowRef();
    const switchKls = computed(() => [
      ns.b(),
      ns.m(switchSize.value),
      ns.is("disabled", switchDisabled.value),
      ns.is("checked", checked.value)
    ]);
    const labelLeftKls = computed(() => [
      ns.e("label"),
      ns.em("label", "left"),
      ns.is("active", !checked.value)
    ]);
    const labelRightKls = computed(() => [
      ns.e("label"),
      ns.em("label", "right"),
      ns.is("active", checked.value)
    ]);
    const coreStyle = computed(() => ({
      width: addUnit(props.width)
    }));
    watch(() => props.modelValue, () => {
      isControlled.value = true;
    });
    const actualValue = computed(() => {
      return isControlled.value ? props.modelValue : false;
    });
    const checked = computed(() => actualValue.value === props.activeValue);
    if (![props.activeValue, props.inactiveValue].includes(actualValue.value)) {
      emit(UPDATE_MODEL_EVENT, props.inactiveValue);
      emit(CHANGE_EVENT, props.inactiveValue);
      emit(INPUT_EVENT, props.inactiveValue);
    }
    watch(checked, (val) => {
      var _a;
      input.value.checked = val;
      if (props.validateEvent) {
        (_a = formItem == null ? void 0 : formItem.validate) == null ? void 0 : _a.call(formItem, "change").catch((err) => debugWarn());
      }
    });
    const handleChange = () => {
      const val = checked.value ? props.inactiveValue : props.activeValue;
      emit(UPDATE_MODEL_EVENT, val);
      emit(CHANGE_EVENT, val);
      emit(INPUT_EVENT, val);
      nextTick(() => {
        input.value.checked = checked.value;
      });
    };
    const switchValue = () => {
      if (switchDisabled.value)
        return;
      const { beforeChange } = props;
      if (!beforeChange) {
        handleChange();
        return;
      }
      const shouldChange = beforeChange();
      const isPromiseOrBool = [
        shared_cjs_prodExports.isPromise(shouldChange),
        isBoolean(shouldChange)
      ].includes(true);
      if (!isPromiseOrBool) {
        throwError(COMPONENT_NAME, "beforeChange must return type `Promise<boolean>` or `boolean`");
      }
      if (shared_cjs_prodExports.isPromise(shouldChange)) {
        shouldChange.then((result) => {
          if (result) {
            handleChange();
          }
        }).catch((e) => {
        });
      } else if (shouldChange) {
        handleChange();
      }
    };
    const focus = () => {
      var _a, _b;
      (_b = (_a = input.value) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
    };
    expose({
      focus,
      checked
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(unref(switchKls)),
        onClick: withModifiers(switchValue, ["prevent"])
      }, [
        createElementVNode("input", {
          id: unref(inputId),
          ref_key: "input",
          ref: input,
          class: normalizeClass(unref(ns).e("input")),
          type: "checkbox",
          role: "switch",
          "aria-checked": unref(checked),
          "aria-disabled": unref(switchDisabled),
          "aria-label": _ctx.ariaLabel,
          name: _ctx.name,
          "true-value": _ctx.activeValue,
          "false-value": _ctx.inactiveValue,
          disabled: unref(switchDisabled),
          tabindex: _ctx.tabindex,
          onChange: handleChange,
          onKeydown: withKeys(switchValue, ["enter"])
        }, null, 42, ["id", "aria-checked", "aria-disabled", "aria-label", "name", "true-value", "false-value", "disabled", "tabindex", "onKeydown"]),
        !_ctx.inlinePrompt && (_ctx.inactiveIcon || _ctx.inactiveText) ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: normalizeClass(unref(labelLeftKls))
        }, [
          _ctx.inactiveIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
            default: withCtx(() => [
              (openBlock(), createBlock(resolveDynamicComponent(_ctx.inactiveIcon)))
            ]),
            _: 1
          })) : createCommentVNode("v-if", true),
          !_ctx.inactiveIcon && _ctx.inactiveText ? (openBlock(), createElementBlock("span", {
            key: 1,
            "aria-hidden": unref(checked)
          }, toDisplayString(_ctx.inactiveText), 9, ["aria-hidden"])) : createCommentVNode("v-if", true)
        ], 2)) : createCommentVNode("v-if", true),
        createElementVNode("span", {
          class: normalizeClass(unref(ns).e("core")),
          style: normalizeStyle(unref(coreStyle))
        }, [
          _ctx.inlinePrompt ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(unref(ns).e("inner"))
          }, [
            _ctx.activeIcon || _ctx.inactiveIcon ? (openBlock(), createBlock(unref(ElIcon), {
              key: 0,
              class: normalizeClass(unref(ns).is("icon"))
            }, {
              default: withCtx(() => [
                (openBlock(), createBlock(resolveDynamicComponent(unref(checked) ? _ctx.activeIcon : _ctx.inactiveIcon)))
              ]),
              _: 1
            }, 8, ["class"])) : _ctx.activeText || _ctx.inactiveText ? (openBlock(), createElementBlock("span", {
              key: 1,
              class: normalizeClass(unref(ns).is("text")),
              "aria-hidden": !unref(checked)
            }, toDisplayString(unref(checked) ? _ctx.activeText : _ctx.inactiveText), 11, ["aria-hidden"])) : createCommentVNode("v-if", true)
          ], 2)) : createCommentVNode("v-if", true),
          createElementVNode("div", {
            class: normalizeClass(unref(ns).e("action"))
          }, [
            _ctx.loading ? (openBlock(), createBlock(unref(ElIcon), {
              key: 0,
              class: normalizeClass(unref(ns).is("loading"))
            }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            }, 8, ["class"])) : unref(checked) ? renderSlot(_ctx.$slots, "active-action", { key: 1 }, () => [
              _ctx.activeActionIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(_ctx.activeActionIcon)))
                ]),
                _: 1
              })) : createCommentVNode("v-if", true)
            ]) : !unref(checked) ? renderSlot(_ctx.$slots, "inactive-action", { key: 2 }, () => [
              _ctx.inactiveActionIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(_ctx.inactiveActionIcon)))
                ]),
                _: 1
              })) : createCommentVNode("v-if", true)
            ]) : createCommentVNode("v-if", true)
          ], 2)
        ], 6),
        !_ctx.inlinePrompt && (_ctx.activeIcon || _ctx.activeText) ? (openBlock(), createElementBlock("span", {
          key: 1,
          class: normalizeClass(unref(labelRightKls))
        }, [
          _ctx.activeIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
            default: withCtx(() => [
              (openBlock(), createBlock(resolveDynamicComponent(_ctx.activeIcon)))
            ]),
            _: 1
          })) : createCommentVNode("v-if", true),
          !_ctx.activeIcon && _ctx.activeText ? (openBlock(), createElementBlock("span", {
            key: 1,
            "aria-hidden": !unref(checked)
          }, toDisplayString(_ctx.activeText), 9, ["aria-hidden"])) : createCommentVNode("v-if", true)
        ], 2)) : createCommentVNode("v-if", true)
      ], 10, ["onClick"]);
    };
  }
});
var Switch = /* @__PURE__ */ _export_sfc$1(_sfc_main$1, [["__file", "switch.vue"]]);
const ElSwitch = withInstall(Switch);
function useUserAgent() {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(true);
  const deviceType = ref("desktop");
  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const admin = useAdminStore();
    const themeSwitch = computed({ get() {
      return admin.getTheme === "dark";
    }, set(v) {
      admin.setTheme(v ? "dark" : "light");
    } });
    const currentLocale = computed(() => admin.getLocale);
    const localePath = useLocalePath();
    useSwitchLocalePath();
    const navList = [
      { key: "header.nav.home", path: "/" },
      { key: "header.nav.article", path: "/article" },
      { key: "header.nav.about", path: "/about" },
      { key: "header.nav.project", path: "/project" }
    ];
    const { isMobile } = useUserAgent();
    const mobileMenuOpen = ref(false);
    watch(isMobile, (val) => {
      if (!val) {
        mobileMenuOpen.value = false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_nuxt_icon = _sfc_main$2;
      const _component_el_switch = ElSwitch;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: ["header", { "is-mobile": unref(isMobile) }]
      }, _attrs))} data-v-303da426><div class="headerWrapper container" data-v-303da426><div class="logo" data-v-303da426>`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        provider: "ipx",
        src: "/img/logo.webp",
        alt: "logo",
        quality: "70",
        loading: "eager",
        fetchpriority: "high",
        class: "logo-img",
        width: "40",
        height: "40"
      }, null, _parent));
      _push(`<span class="logo-text" data-v-303da426>${ssrInterpolate(_ctx.$t("site.name"))}</span></div>`);
      if (!unref(isMobile)) {
        _push(`<ul class="nav-menu" data-v-303da426><!--[-->`);
        ssrRenderList(navList, (item) => {
          _push(`<li class="nav-item" data-v-303da426>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(item.path),
            class: "nav-link"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(_ctx.$t(item.key))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(_ctx.$t(item.key)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isMobile)) {
        _push(`<div class="mobile-menu-btn" data-v-303da426>`);
        _push(ssrRenderComponent(_component_nuxt_icon, {
          name: mobileMenuOpen.value ? "header/close" : "header/menu"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(isMobile)) {
        _push(`<div class="controls" data-v-303da426>`);
        _push(ssrRenderComponent(_component_el_switch, {
          modelValue: themeSwitch.value,
          "onUpdate:modelValue": ($event) => themeSwitch.value = $event,
          "inline-prompt": ""
        }, {
          "active-action": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_nuxt_icon, { name: "header/moon" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_nuxt_icon, { name: "header/moon" })
              ];
            }
          }),
          "inactive-action": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_nuxt_icon, { name: "header/sun" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_nuxt_icon, { name: "header/sun" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span class="lang" data-v-303da426>`);
        _push(ssrRenderComponent(_component_nuxt_icon, { name: "header/language" }, null, _parent));
        _push(`<div class="lang-choose" data-v-303da426><span class="${ssrRenderClass([{ "active": currentLocale.value === "en" }, "lang-item"])}" data-v-303da426>${ssrInterpolate(_ctx.$t("lang.en"))}</span><span class="${ssrRenderClass([{ "active": currentLocale.value === "zh" }, "lang-item"])}" data-v-303da426>${ssrInterpolate(_ctx.$t("lang.zh"))}</span></div></span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(isMobile) && mobileMenuOpen.value) {
        _push(`<div class="mobile-menu-drawer" data-v-303da426><ul class="mobile-nav-list" data-v-303da426><!--[-->`);
        ssrRenderList(navList, (item) => {
          _push(`<li class="mobile-nav-item" data-v-303da426>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(localePath)(item.path),
            class: "mobile-nav-link"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(_ctx.$t(item.key))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(_ctx.$t(item.key)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul><div class="mobile-controls" data-v-303da426><div class="control-item" data-v-303da426><span data-v-303da426>${ssrInterpolate(_ctx.$t("theme." + (themeSwitch.value ? "dark" : "light")))}</span>`);
        _push(ssrRenderComponent(_component_el_switch, {
          modelValue: themeSwitch.value,
          "onUpdate:modelValue": ($event) => themeSwitch.value = $event,
          "inline-prompt": ""
        }, {
          "active-action": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_nuxt_icon, { name: "header/moon" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_nuxt_icon, { name: "header/moon" })
              ];
            }
          }),
          "inactive-action": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_nuxt_icon, { name: "header/sun" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_nuxt_icon, { name: "header/sun" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="control-item" data-v-303da426><span data-v-303da426>${ssrInterpolate(_ctx.$t("lang." + currentLocale.value))}</span><div class="lang-toggle" data-v-303da426><span class="${ssrRenderClass([{ active: currentLocale.value === "zh" }, "lang-opt"])}" data-v-303da426>ZH</span><span class="divider" data-v-303da426>/</span><span class="${ssrRenderClass([{ active: currentLocale.value === "en" }, "lang-opt"])}" data-v-303da426>EN</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/defaultLayout/Header.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Header = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-303da426"]]);

export { Header as default };
//# sourceMappingURL=Header-BYqDoUZ5.mjs.map
