import { defineComponent, computed, createElementBlock, openBlock, mergeProps, unref, renderSlot } from 'vue';
import { w as withInstall, g as definePropType, f as buildProps, j as useNamespace, k as isNumber, K as isStringNumber, s as shared_cjs_prodExports } from './server.mjs';
import { _ as _export_sfc } from './plugin-vue_export-helper-BqDg8bah.mjs';
import { isClient } from '@vueuse/core';
import { e as circle_close_default, f as circle_check_default, l as loading_default, g as close_default, i as info_filled_default, h as circle_close_filled_default, w as warning_filled_default, s as success_filled_default } from './index-DYDdtqo2.mjs';
import { pick } from 'lodash-es';

const iconProps = buildProps({
  size: {
    type: definePropType([Number, String])
  },
  color: {
    type: String
  }
});
const classNameToArray = (cls = "") => cls.split(" ").filter((item) => !!item.trim());
const hasClass = (el, cls) => {
  if (!el || !cls)
    return false;
  if (cls.includes(" "))
    throw new Error("className should not contain space.");
  return el.classList.contains(cls);
};
const addClass = (el, cls) => {
  if (!el || !cls.trim())
    return;
  el.classList.add(...classNameToArray(cls));
};
const removeClass = (el, cls) => {
  if (!el || !cls.trim())
    return;
  el.classList.remove(...classNameToArray(cls));
};
const getStyle = (element, styleName) => {
  var _a;
  if (!isClient || !element || !styleName)
    return "";
  let key = shared_cjs_prodExports.camelize(styleName);
  if (key === "float")
    key = "cssFloat";
  try {
    const style = element.style[key];
    if (style)
      return style;
    const computed2 = (_a = (void 0).defaultView) == null ? void 0 : _a.getComputedStyle(element, "");
    return computed2 ? computed2[key] : "";
  } catch (e) {
    return element.style[key];
  }
};
function addUnit(value, defaultUnit = "px") {
  if (!value && value !== 0)
    return "";
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`;
  } else if (shared_cjs_prodExports.isString(value)) {
    return value;
  }
}
const __default__ = defineComponent({
  name: "ElIcon",
  inheritAttrs: false
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: iconProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("icon");
    const style = computed(() => {
      const { size, color } = props;
      const fontSize = addUnit(size);
      if (!fontSize && !color)
        return {};
      return {
        fontSize,
        "--color": color
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("i", mergeProps({
        class: unref(ns).b(),
        style: unref(style)
      }, _ctx.$attrs), [
        renderSlot(_ctx.$slots, "default")
      ], 16);
    };
  }
});
var Icon = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "icon.vue"]]);
const ElIcon = withInstall(Icon);
const iconPropType = definePropType([
  String,
  Object,
  Function
]);
const CloseComponents = {
  Close: close_default
};
const TypeComponents = {
  Close: close_default,
  SuccessFilled: success_filled_default,
  InfoFilled: info_filled_default,
  WarningFilled: warning_filled_default,
  CircleCloseFilled: circle_close_filled_default
};
const TypeComponentsMap = {
  primary: info_filled_default,
  success: success_filled_default,
  warning: warning_filled_default,
  error: circle_close_filled_default,
  info: info_filled_default
};
const ValidateComponentsMap = {
  validating: loading_default,
  success: circle_check_default,
  error: circle_close_default
};
const ariaProps = buildProps({
  ariaLabel: String,
  ariaOrientation: {
    type: String,
    values: ["horizontal", "vertical", "undefined"]
  },
  ariaControls: String
});
const useAriaProps = (arias) => {
  return pick(ariaProps, arias);
};
const formContextKey = Symbol("formContextKey");
const formItemContextKey = Symbol("formItemContextKey");

export { CloseComponents as C, ElIcon as E, TypeComponentsMap as T, ValidateComponentsMap as V, formItemContextKey as a, addUnit as b, addClass as c, TypeComponents as d, formContextKey as f, getStyle as g, hasClass as h, iconPropType as i, removeClass as r, useAriaProps as u };
//# sourceMappingURL=constants-CUtq6qCd.mjs.map
