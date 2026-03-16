import { E as ElCard } from './el-card-pCxK5Z-h.mjs';
import { E as ElInput } from './el-input-CL5uOxgl.mjs';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { E as ElTable, a as ElTableColumn } from './el-table-column-COYcazmx.mjs';
import { a as ElTag } from './el-scrollbar-D9cqWD0V.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, useSlots, provide, createBlock, openBlock, unref, Transition, withDirectives, createElementVNode, normalizeStyle, normalizeClass, createCommentVNode, createSlots, renderSlot, vShow, getCurrentInstance, watch, nextTick, inject, createElementBlock, resolveDynamicComponent, useSSRContext } from 'vue';
import { E as ElMessageBox, u as useSameTarget, a as ElOverlay, b as useLockscreen, c as useDraggable } from './el-overlay-B4BI_kaK.mjs';
import { b as ElTeleport, a as ElFocusTrap, t as teleportProps, F as FOCUS_TRAP_INJECTION_KEY } from './el-popper-Da7PzTYS.mjs';
import { b as addUnit, i as iconPropType, E as ElIcon, C as CloseComponents } from './constants-CUtq6qCd.mjs';
import { _ as _export_sfc, w as withInstall, h as http, G as isBoolean, f as buildProps, j as useNamespace, g as definePropType, E as useZIndex, A as useId, L as useGlobalConfig, R as defaultNamespace, s as shared_cjs_prodExports, r as useLocale } from './server.mjs';
import { _ as _export_sfc$1 } from './plugin-vue_export-helper-BqDg8bah.mjs';
import { U as UPDATE_MODEL_EVENT } from './event-D6RlLW-5.mjs';
import { useTimeoutFn, isClient } from '@vueuse/core';
import { u as useDeprecated } from './index-ToUTMhai.mjs';
import { E as ElForm, a as ElFormItem } from './el-form-item-DmuF_RFN.mjs';
import { E as ElMessage } from './index-BH4P6TZ1.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
import { f as formatDateTime } from './format-lZD7NQ9Z.mjs';
import { a as appCache } from './cache-Bl-VgnBs.mjs';
import 'lodash-es';
import './index-DYDdtqo2.mjs';
import './event-B21lDVQA.mjs';
import './typescript-D6L75muK.mjs';
import './index-sS3vk-N3.mjs';
import './el-checkbox-Da1P_Ltn.mjs';
import './vnode-BQHIcHPg.mjs';
import './validator-ClkLwfZO.mjs';
import './scroll-Hq3mw777.mjs';
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

class CategoryService {
  async getCategories() {
    return await http.get("/category");
  }
  async createCategory(name) {
    return await http.post("/category", { name });
  }
  async updateCategory(id, name) {
    return await http.put(`/category/${id}`, { name });
  }
  async deleteCategory(id) {
    return await http.delete(`/category/${id}`);
  }
}
const categoryService = new CategoryService();
const dialogInjectionKey = Symbol("dialogInjectionKey");
const DEFAULT_DIALOG_TRANSITION = "dialog-fade";
const dialogContentProps = buildProps({
  center: Boolean,
  alignCenter: {
    type: Boolean,
    default: void 0
  },
  closeIcon: {
    type: iconPropType
  },
  draggable: {
    type: Boolean,
    default: void 0
  },
  overflow: {
    type: Boolean,
    default: void 0
  },
  fullscreen: Boolean,
  headerClass: String,
  bodyClass: String,
  footerClass: String,
  showClose: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ""
  },
  ariaLevel: {
    type: String,
    default: "2"
  }
});
const dialogContentEmits = {
  close: () => true
};
const composeRefs = (...refs) => {
  return (el) => {
    refs.forEach((ref2) => {
      ref2.value = el;
    });
  };
};
const __default__$1 = defineComponent({ name: "ElDialogContent" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...__default__$1,
  props: dialogContentProps,
  emits: dialogContentEmits,
  setup(__props, { expose }) {
    const props = __props;
    const { t } = useLocale();
    const { Close } = CloseComponents;
    const { dialogRef, headerRef, bodyId, ns, style } = inject(dialogInjectionKey);
    const { focusTrapRef } = inject(FOCUS_TRAP_INJECTION_KEY);
    const composedDialogRef = composeRefs(focusTrapRef, dialogRef);
    const draggable = computed(() => !!props.draggable);
    const overflow = computed(() => !!props.overflow);
    const { resetPosition, updatePosition, isDragging } = useDraggable(dialogRef, headerRef, draggable, overflow);
    const dialogKls = computed(() => [
      ns.b(),
      ns.is("fullscreen", props.fullscreen),
      ns.is("draggable", draggable.value),
      ns.is("dragging", isDragging.value),
      ns.is("align-center", !!props.alignCenter),
      { [ns.m("center")]: props.center }
    ]);
    expose({
      resetPosition,
      updatePosition
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref: unref(composedDialogRef),
        class: normalizeClass(unref(dialogKls)),
        style: normalizeStyle(unref(style)),
        tabindex: "-1"
      }, [
        createElementVNode("header", {
          ref_key: "headerRef",
          ref: headerRef,
          class: normalizeClass([unref(ns).e("header"), _ctx.headerClass, { "show-close": _ctx.showClose }])
        }, [
          renderSlot(_ctx.$slots, "header", {}, () => [
            createElementVNode("span", {
              role: "heading",
              "aria-level": _ctx.ariaLevel,
              class: normalizeClass(unref(ns).e("title"))
            }, toDisplayString(_ctx.title), 11, ["aria-level"])
          ]),
          _ctx.showClose ? (openBlock(), createElementBlock("button", {
            key: 0,
            "aria-label": unref(t)("el.dialog.close"),
            class: normalizeClass(unref(ns).e("headerbtn")),
            type: "button",
            onClick: ($event) => _ctx.$emit("close")
          }, [
            createVNode(unref(ElIcon), {
              class: normalizeClass(unref(ns).e("close"))
            }, {
              default: withCtx(() => [
                (openBlock(), createBlock(resolveDynamicComponent(_ctx.closeIcon || unref(Close))))
              ]),
              _: 1
            }, 8, ["class"])
          ], 10, ["aria-label", "onClick"])) : createCommentVNode("v-if", true)
        ], 2),
        createElementVNode("div", {
          id: unref(bodyId),
          class: normalizeClass([unref(ns).e("body"), _ctx.bodyClass])
        }, [
          renderSlot(_ctx.$slots, "default")
        ], 10, ["id"]),
        _ctx.$slots.footer ? (openBlock(), createElementBlock("footer", {
          key: 0,
          class: normalizeClass([unref(ns).e("footer"), _ctx.footerClass])
        }, [
          renderSlot(_ctx.$slots, "footer")
        ], 2)) : createCommentVNode("v-if", true)
      ], 6);
    };
  }
});
var ElDialogContent = /* @__PURE__ */ _export_sfc$1(_sfc_main$2, [["__file", "dialog-content.vue"]]);
const dialogProps = buildProps({
  ...dialogContentProps,
  appendToBody: Boolean,
  appendTo: {
    type: teleportProps.to.type,
    default: "body"
  },
  beforeClose: {
    type: definePropType(Function)
  },
  destroyOnClose: Boolean,
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  lockScroll: {
    type: Boolean,
    default: true
  },
  modal: {
    type: Boolean,
    default: true
  },
  modalPenetrable: Boolean,
  openDelay: {
    type: Number,
    default: 0
  },
  closeDelay: {
    type: Number,
    default: 0
  },
  top: {
    type: String
  },
  modelValue: Boolean,
  modalClass: String,
  headerClass: String,
  bodyClass: String,
  footerClass: String,
  width: {
    type: [String, Number]
  },
  zIndex: {
    type: Number
  },
  trapFocus: Boolean,
  headerAriaLevel: {
    type: String,
    default: "2"
  },
  transition: {
    type: definePropType([String, Object]),
    default: void 0
  }
});
const dialogEmits = {
  open: () => true,
  opened: () => true,
  close: () => true,
  closed: () => true,
  [UPDATE_MODEL_EVENT]: (value) => isBoolean(value),
  openAutoFocus: () => true,
  closeAutoFocus: () => true
};
const useDialog = (props, targetRef) => {
  var _a;
  const instance = getCurrentInstance();
  const emit = instance.emit;
  const { nextZIndex } = useZIndex();
  let lastPosition = "";
  const titleId = useId();
  const bodyId = useId();
  const visible = ref(false);
  const closed = ref(false);
  const rendered = ref(false);
  const zIndex = ref((_a = props.zIndex) != null ? _a : nextZIndex());
  let openTimer = void 0;
  let closeTimer = void 0;
  const config = useGlobalConfig();
  const namespace = computed(() => {
    var _a2, _b;
    return (_b = (_a2 = config.value) == null ? void 0 : _a2.namespace) != null ? _b : defaultNamespace;
  });
  const globalConfig = computed(() => {
    var _a2;
    return (_a2 = config.value) == null ? void 0 : _a2.dialog;
  });
  const style = computed(() => {
    const style2 = {};
    const varPrefix = `--${namespace.value}-dialog`;
    if (!props.fullscreen) {
      if (props.top) {
        style2[`${varPrefix}-margin-top`] = props.top;
      }
      const width = addUnit(props.width);
      if (width) {
        style2[`${varPrefix}-width`] = width;
      }
    }
    return style2;
  });
  const _draggable = computed(() => {
    var _a2, _b, _c;
    return ((_c = (_b = props.draggable) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.draggable) != null ? _c : false) && !props.fullscreen;
  });
  const _alignCenter = computed(() => {
    var _a2, _b, _c;
    return (_c = (_b = props.alignCenter) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.alignCenter) != null ? _c : false;
  });
  const _overflow = computed(() => {
    var _a2, _b, _c;
    return (_c = (_b = props.overflow) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.overflow) != null ? _c : false;
  });
  const overlayDialogStyle = computed(() => {
    if (_alignCenter.value) {
      return { display: "flex" };
    }
    return {};
  });
  const transitionConfig = computed(() => {
    var _a2, _b, _c;
    const transition = (_c = (_b = props.transition) != null ? _b : (_a2 = globalConfig.value) == null ? void 0 : _a2.transition) != null ? _c : DEFAULT_DIALOG_TRANSITION;
    const baseConfig = {
      name: transition,
      onAfterEnter: afterEnter,
      onBeforeLeave: beforeLeave,
      onAfterLeave: afterLeave
    };
    if (shared_cjs_prodExports.isObject(transition)) {
      const config2 = { ...transition };
      const _mergeHook = (userHook, defaultHook) => {
        return (el) => {
          if (shared_cjs_prodExports.isArray(userHook)) {
            userHook.forEach((fn) => {
              if (shared_cjs_prodExports.isFunction(fn))
                fn(el);
            });
          } else if (shared_cjs_prodExports.isFunction(userHook)) {
            userHook(el);
          }
          defaultHook();
        };
      };
      config2.onAfterEnter = _mergeHook(config2.onAfterEnter, afterEnter);
      config2.onBeforeLeave = _mergeHook(config2.onBeforeLeave, beforeLeave);
      config2.onAfterLeave = _mergeHook(config2.onAfterLeave, afterLeave);
      if (!config2.name) {
        config2.name = DEFAULT_DIALOG_TRANSITION;
      }
      return config2;
    }
    return baseConfig;
  });
  function afterEnter() {
    emit("opened");
  }
  function afterLeave() {
    emit("closed");
    emit(UPDATE_MODEL_EVENT, false);
    if (props.destroyOnClose) {
      rendered.value = false;
    }
  }
  function beforeLeave() {
    emit("close");
  }
  function open() {
    closeTimer == null ? void 0 : closeTimer();
    openTimer == null ? void 0 : openTimer();
    if (props.openDelay && props.openDelay > 0) {
      ({ stop: openTimer } = useTimeoutFn(() => doOpen(), props.openDelay));
    } else {
      doOpen();
    }
  }
  function close() {
    openTimer == null ? void 0 : openTimer();
    closeTimer == null ? void 0 : closeTimer();
    if (props.closeDelay && props.closeDelay > 0) {
      ({ stop: closeTimer } = useTimeoutFn(() => doClose(), props.closeDelay));
    } else {
      doClose();
    }
  }
  function handleClose() {
    function hide(shouldCancel) {
      if (shouldCancel)
        return;
      closed.value = true;
      visible.value = false;
    }
    if (props.beforeClose) {
      props.beforeClose(hide);
    } else {
      close();
    }
  }
  function onModalClick() {
    if (props.closeOnClickModal) {
      handleClose();
    }
  }
  function doOpen() {
    if (!isClient)
      return;
    visible.value = true;
  }
  function doClose() {
    visible.value = false;
  }
  function onOpenAutoFocus() {
    emit("openAutoFocus");
  }
  function onCloseAutoFocus() {
    emit("closeAutoFocus");
  }
  function onFocusoutPrevented(event) {
    var _a2;
    if (((_a2 = event.detail) == null ? void 0 : _a2.focusReason) === "pointer") {
      event.preventDefault();
    }
  }
  if (props.lockScroll) {
    useLockscreen(visible);
  }
  function onCloseRequested() {
    if (props.closeOnPressEscape) {
      handleClose();
    }
  }
  watch(() => props.zIndex, () => {
    var _a2;
    zIndex.value = (_a2 = props.zIndex) != null ? _a2 : nextZIndex();
  });
  watch(() => props.modelValue, (val) => {
    var _a2;
    if (val) {
      closed.value = false;
      open();
      rendered.value = true;
      zIndex.value = (_a2 = props.zIndex) != null ? _a2 : nextZIndex();
      nextTick(() => {
        emit("open");
        if (targetRef.value) {
          targetRef.value.parentElement.scrollTop = 0;
          targetRef.value.parentElement.scrollLeft = 0;
          targetRef.value.scrollTop = 0;
        }
      });
    } else {
      if (visible.value) {
        close();
      }
    }
  });
  watch(() => props.fullscreen, (val) => {
    if (!targetRef.value)
      return;
    if (val) {
      lastPosition = targetRef.value.style.transform;
      targetRef.value.style.transform = "";
    } else {
      targetRef.value.style.transform = lastPosition;
    }
  });
  return {
    afterEnter,
    afterLeave,
    beforeLeave,
    handleClose,
    onModalClick,
    close,
    doClose,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onCloseRequested,
    onFocusoutPrevented,
    titleId,
    bodyId,
    closed,
    style,
    overlayDialogStyle,
    rendered,
    visible,
    zIndex,
    transitionConfig,
    _draggable,
    _alignCenter,
    _overflow
  };
};
const __default__ = defineComponent({
  name: "ElDialog",
  inheritAttrs: false
});
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...__default__,
  props: dialogProps,
  emits: dialogEmits,
  setup(__props, { expose }) {
    const props = __props;
    const slots = useSlots();
    useDeprecated({
      scope: "el-dialog",
      from: "the title slot",
      replacement: "the header slot",
      version: "3.0.0",
      ref: "https://element-plus.org/en-US/component/dialog.html#slots"
    }, computed(() => !!slots.title));
    const ns = useNamespace("dialog");
    const dialogRef = ref();
    const headerRef = ref();
    const dialogContentRef = ref();
    const {
      visible,
      titleId,
      bodyId,
      style,
      overlayDialogStyle,
      rendered,
      transitionConfig,
      zIndex,
      _draggable,
      _alignCenter,
      _overflow,
      handleClose,
      onModalClick,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onCloseRequested,
      onFocusoutPrevented
    } = useDialog(props, dialogRef);
    provide(dialogInjectionKey, {
      dialogRef,
      headerRef,
      bodyId,
      ns,
      rendered,
      style
    });
    const overlayEvent = useSameTarget(onModalClick);
    const penetrable = computed(() => props.modalPenetrable && !props.modal && !props.fullscreen);
    const resetPosition = () => {
      var _a;
      (_a = dialogContentRef.value) == null ? void 0 : _a.resetPosition();
    };
    expose({
      visible,
      dialogContentRef,
      resetPosition,
      handleClose
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElTeleport), {
        to: _ctx.appendTo,
        disabled: _ctx.appendTo !== "body" ? false : !_ctx.appendToBody
      }, {
        default: withCtx(() => [
          createVNode(Transition, mergeProps(unref(transitionConfig), { persisted: "" }), {
            default: withCtx(() => {
              var _a;
              return [
                withDirectives(createVNode(unref(ElOverlay), {
                  "custom-mask-event": "",
                  mask: _ctx.modal,
                  "overlay-class": [
                    (_a = _ctx.modalClass) != null ? _a : "",
                    `${unref(ns).namespace.value}-modal-dialog`,
                    unref(ns).is("penetrable", unref(penetrable))
                  ],
                  "z-index": unref(zIndex)
                }, {
                  default: withCtx(() => [
                    createElementVNode("div", {
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-label": _ctx.title || void 0,
                      "aria-labelledby": !_ctx.title ? unref(titleId) : void 0,
                      "aria-describedby": unref(bodyId),
                      class: normalizeClass(`${unref(ns).namespace.value}-overlay-dialog`),
                      style: normalizeStyle(unref(overlayDialogStyle)),
                      onClick: unref(overlayEvent).onClick,
                      onMousedown: unref(overlayEvent).onMousedown,
                      onMouseup: unref(overlayEvent).onMouseup
                    }, [
                      createVNode(unref(ElFocusTrap), {
                        loop: "",
                        trapped: unref(visible),
                        "focus-start-el": "container",
                        onFocusAfterTrapped: unref(onOpenAutoFocus),
                        onFocusAfterReleased: unref(onCloseAutoFocus),
                        onFocusoutPrevented: unref(onFocusoutPrevented),
                        onReleaseRequested: unref(onCloseRequested)
                      }, {
                        default: withCtx(() => [
                          unref(rendered) ? (openBlock(), createBlock(ElDialogContent, mergeProps({
                            key: 0,
                            ref_key: "dialogContentRef",
                            ref: dialogContentRef
                          }, _ctx.$attrs, {
                            center: _ctx.center,
                            "align-center": unref(_alignCenter),
                            "close-icon": _ctx.closeIcon,
                            draggable: unref(_draggable),
                            overflow: unref(_overflow),
                            fullscreen: _ctx.fullscreen,
                            "header-class": _ctx.headerClass,
                            "body-class": _ctx.bodyClass,
                            "footer-class": _ctx.footerClass,
                            "show-close": _ctx.showClose,
                            title: _ctx.title,
                            "aria-level": _ctx.headerAriaLevel,
                            onClose: unref(handleClose)
                          }), createSlots({
                            header: withCtx(() => [
                              !_ctx.$slots.title ? renderSlot(_ctx.$slots, "header", {
                                key: 0,
                                close: unref(handleClose),
                                titleId: unref(titleId),
                                titleClass: unref(ns).e("title")
                              }) : renderSlot(_ctx.$slots, "title", { key: 1 })
                            ]),
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "default")
                            ]),
                            _: 2
                          }, [
                            _ctx.$slots.footer ? {
                              name: "footer",
                              fn: withCtx(() => [
                                renderSlot(_ctx.$slots, "footer")
                              ])
                            } : void 0
                          ]), 1040, ["center", "align-center", "close-icon", "draggable", "overflow", "fullscreen", "header-class", "body-class", "footer-class", "show-close", "title", "aria-level", "onClose"])) : createCommentVNode("v-if", true)
                        ]),
                        _: 3
                      }, 8, ["trapped", "onFocusAfterTrapped", "onFocusAfterReleased", "onFocusoutPrevented", "onReleaseRequested"])
                    ], 46, ["aria-label", "aria-labelledby", "aria-describedby", "onClick", "onMousedown", "onMouseup"])
                  ]),
                  _: 3
                }, 8, ["mask", "overlay-class", "z-index"]), [
                  [vShow, unref(visible)]
                ])
              ];
            }),
            _: 3
          }, 16)
        ]),
        _: 3
      }, 8, ["to", "disabled"]);
    };
  }
});
var Dialog = /* @__PURE__ */ _export_sfc$1(_sfc_main$1, [["__file", "dialog.vue"]]);
const ElDialog = withInstall(Dialog);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const searchText = ref("");
    const categoryList = ref([]);
    const dialogVisible = ref(false);
    const mode = ref("add");
    const currentId = ref(null);
    const formRef = ref();
    const form = ref({ name: "" });
    const rules = { name: [{ required: true, message: "请输入分类名称", trigger: "blur" }] };
    const dialogTitle = computed(() => mode.value === "add" ? "新增分类" : "编辑分类");
    const filteredCategoryList = computed(() => {
      const text = (searchText.value || "").trim();
      if (!text) return categoryList.value.map((c) => ({ ...c, created_at: formatDateTime(c.created_at), updated_at: formatDateTime(c.updated_at) }));
      return categoryList.value.filter((c) => String(c.name).includes(text));
    });
    const getCategoryList = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.status === 200) {
          categoryList.value = res.data;
          appCache.setCategories(res.data);
        }
      } catch (error) {
        ElMessage.error(error.msg || "分类查询错误");
      }
    };
    const openDialog = () => {
      dialogVisible.value = true;
    };
    const closeDialog = () => {
      dialogVisible.value = false;
    };
    const handleEdit = (m, id) => {
      mode.value = m;
      if (m === "add") {
        currentId.value = null;
        form.value = { name: "" };
      } else {
        const item = categoryList.value.find((i) => i.id === id);
        currentId.value = item?.id || null;
        form.value = { name: item?.name || "" };
      }
      openDialog();
    };
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm("确认删除该分类吗？", "提示", { type: "warning" });
        const res = await categoryService.deleteCategory(id);
        if (res.status === 200 && res.data.status === 200) {
          ElMessage.success("删除成功");
          await getCategoryList();
        }
      } catch (error) {
        ElMessage.error(error.msg || "删除失败");
      }
    };
    const onSubmit = async () => {
      formRef.value?.validate(async (valid) => {
        if (!valid) return;
        try {
          if (mode.value === "add") {
            const res = await categoryService.createCategory(form.value.name);
            if (res.status === 200 && res.data.status === 200) {
              ElMessage.success("新增成功");
            }
          } else if (currentId.value) {
            const res = await categoryService.updateCategory(currentId.value, form.value.name);
            if (res.status === 200 && res.data.status === 200) {
              ElMessage.success("编辑成功");
            }
          }
          closeDialog();
          await getCategoryList();
        } catch (error) {
          ElMessage.error(error.msg || "保存失败");
        }
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      const _component_el_input = ElInput;
      const _component_el_button = ElButton;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_dialog = ElDialog;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "category" }, _attrs))} data-v-59c045d4><div class="header" data-v-59c045d4><h2 class="title" data-v-59c045d4>分类管理</h2></div>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "category-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header-content" data-v-59c045d4${_scopeId}><div class="search-area" data-v-59c045d4${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_input, {
              modelValue: searchText.value,
              "onUpdate:modelValue": ($event) => searchText.value = $event,
              placeholder: "搜索分类名称",
              clearable: "",
              "prefix-icon": "Search",
              class: "search-input"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="actions" data-v-59c045d4${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              icon: "Plus",
              onClick: ($event) => handleEdit("add")
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`新增分类`);
                } else {
                  return [
                    createTextVNode("新增分类")
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
                    modelValue: searchText.value,
                    "onUpdate:modelValue": ($event) => searchText.value = $event,
                    placeholder: "搜索分类名称",
                    clearable: "",
                    "prefix-icon": "Search",
                    class: "search-input"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", { class: "actions" }, [
                  createVNode(_component_el_button, {
                    type: "primary",
                    icon: "Plus",
                    onClick: ($event) => handleEdit("add")
                  }, {
                    default: withCtx(() => [
                      createTextVNode("新增分类")
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
            _push2(`<div class="category-content" data-v-59c045d4${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_table, {
              data: filteredCategoryList.value,
              style: { "width": "100%" },
              "header-cell-style": { background: "var(--bg-color)", color: "var(--text-color)" }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "name",
                    label: "分类名称"
                  }, {
                    default: withCtx((scope, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span style="${ssrRenderStyle({ "font-weight": "500" })}" data-v-59c045d4${_scopeId3}>${ssrInterpolate(scope.row.name)}</span>`);
                      } else {
                        return [
                          createVNode("span", { style: { "font-weight": "500" } }, toDisplayString(scope.row.name), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "count",
                    label: "文章数",
                    width: "120",
                    sortable: ""
                  }, {
                    default: withCtx((scope, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_tag, {
                          type: "info",
                          effect: "plain",
                          round: ""
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(scope.row.count || 0)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(scope.row.count || 0), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_tag, {
                            type: "info",
                            effect: "plain",
                            round: ""
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(scope.row.count || 0), 1)
                            ]),
                            _: 2
                          }, 1024)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "created_at",
                    label: "创建时间",
                    width: "180",
                    sortable: ""
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "updated_at",
                    label: "更新时间",
                    width: "180",
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
                      prop: "name",
                      label: "分类名称"
                    }, {
                      default: withCtx((scope) => [
                        createVNode("span", { style: { "font-weight": "500" } }, toDisplayString(scope.row.name), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "count",
                      label: "文章数",
                      width: "120",
                      sortable: ""
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_tag, {
                          type: "info",
                          effect: "plain",
                          round: ""
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(scope.row.count || 0), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "created_at",
                      label: "创建时间",
                      width: "180",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "updated_at",
                      label: "更新时间",
                      width: "180",
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
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "category-content" }, [
                createVNode(_component_el_table, {
                  data: filteredCategoryList.value,
                  style: { "width": "100%" },
                  "header-cell-style": { background: "var(--bg-color)", color: "var(--text-color)" }
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_table_column, {
                      prop: "name",
                      label: "分类名称"
                    }, {
                      default: withCtx((scope) => [
                        createVNode("span", { style: { "font-weight": "500" } }, toDisplayString(scope.row.name), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "count",
                      label: "文章数",
                      width: "120",
                      sortable: ""
                    }, {
                      default: withCtx((scope) => [
                        createVNode(_component_el_tag, {
                          type: "info",
                          effect: "plain",
                          round: ""
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(scope.row.count || 0), 1)
                          ]),
                          _: 2
                        }, 1024)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "created_at",
                      label: "创建时间",
                      width: "180",
                      sortable: ""
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "updated_at",
                      label: "更新时间",
                      width: "180",
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
                }, 8, ["data"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_dialog, {
        modelValue: dialogVisible.value,
        "onUpdate:modelValue": ($event) => dialogVisible.value = $event,
        title: dialogTitle.value,
        width: "480px",
        "destroy-on-close": ""
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="dialog-footer" data-v-59c045d4${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_button, {
              onClick: ($event) => dialogVisible.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`取消`);
                } else {
                  return [
                    createTextVNode("取消")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              onClick: onSubmit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`确定`);
                } else {
                  return [
                    createTextVNode("确定")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "dialog-footer" }, [
                createVNode(_component_el_button, {
                  onClick: ($event) => dialogVisible.value = false
                }, {
                  default: withCtx(() => [
                    createTextVNode("取消")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_el_button, {
                  type: "primary",
                  onClick: onSubmit
                }, {
                  default: withCtx(() => [
                    createTextVNode("确定")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_form, {
              model: form.value,
              rules,
              ref_key: "formRef",
              ref: formRef,
              "label-position": "top"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "分类名称",
                    prop: "name"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: form.value.name,
                          "onUpdate:modelValue": ($event) => form.value.name = $event,
                          placeholder: "请输入分类名称"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: form.value.name,
                            "onUpdate:modelValue": ($event) => form.value.name = $event,
                            placeholder: "请输入分类名称"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, {
                      label: "分类名称",
                      prop: "name"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: form.value.name,
                          "onUpdate:modelValue": ($event) => form.value.name = $event,
                          placeholder: "请输入分类名称"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              createVNode(_component_el_form, {
                model: form.value,
                rules,
                ref_key: "formRef",
                ref: formRef,
                "label-position": "top"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, {
                    label: "分类名称",
                    prop: "name"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: form.value.name,
                        "onUpdate:modelValue": ($event) => form.value.name = $event,
                        placeholder: "请输入分类名称"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/category/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-59c045d4"]]);

export { index as default };
//# sourceMappingURL=index-ByWN3luP.mjs.map
