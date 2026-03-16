import { _ as _export_sfc, n as __nuxt_component_0, a as useAdminStore, q as navigateTo } from './server.mjs';
import _sfc_main$1 from './nuxt-icon-CaSJaWYu.mjs';
import { E as ElForm, a as ElFormItem } from './el-form-item-DmuF_RFN.mjs';
import { E as ElInput } from './el-input-CL5uOxgl.mjs';
import { E as ElCheckbox } from './el-checkbox-Da1P_Ltn.mjs';
import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { E as ElMessage } from './index-BH4P6TZ1.mjs';
import { defineComponent, ref, mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { C as Card } from './card-DrI7ehYz.mjs';
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
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import './index-DYDdtqo2.mjs';
import './event-D6RlLW-5.mjs';
import './event-B21lDVQA.mjs';
import './typescript-D6L75muK.mjs';
import './index-ToUTMhai.mjs';
import './index-sS3vk-N3.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const formRef = ref();
    const loading = ref(false);
    const form = ref({ account: "", password: "", remember: true });
    const rules = {
      account: [{ required: true, message: "请输入账号", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }]
    };
    const onSubmit = async () => {
      formRef.value?.validate(async (valid) => {
        if (!valid) return;
        loading.value = true;
        try {
          const success = await useAdminStore().login(form.value.account, form.value.password, form.value.remember);
          if (success) {
            navigateTo("/admin", { replace: true });
          } else {
            ElMessage.error("登录失败，请检查账号或密码");
          }
        } catch (e) {
          const msg = e?.data?.message || "登录失败，请检查账号或密码";
          ElMessage.error(msg);
        } finally {
          loading.value = false;
        }
      });
    };
    ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0;
      const _component_nuxt_icon = _sfc_main$1;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_button = ElButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login" }, _attrs))} data-v-dabfa541><canvas class="bg-canvas" data-v-dabfa541></canvas><div class="login-wrapper" data-v-dabfa541><div class="left" data-v-dabfa541><div class="left-wrapper" data-v-dabfa541>`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "/img/logo.webp",
        alt: "logo",
        quality: "70",
        loading: "eager",
        fetchpriority: "high",
        class: "logo",
        width: 40,
        height: 40
      }, null, _parent));
      _push(`<h1 class="title" data-v-dabfa541>PlankBevelen Blog Admin</h1><p class="subtitle" data-v-dabfa541>后台管理系统</p><ul class="feature-list" data-v-dabfa541><li class="feature-item" data-v-dabfa541><div class="feature-icon" data-v-dabfa541>`);
      _push(ssrRenderComponent(_component_nuxt_icon, { name: "global/check" }, null, _parent));
      _push(`</div>现代化UI设计</li><li class="feature-item" data-v-dabfa541><div class="feature-icon" data-v-dabfa541>`);
      _push(ssrRenderComponent(_component_nuxt_icon, { name: "global/check" }, null, _parent));
      _push(`</div>响应式布局</li><li class="feature-item" data-v-dabfa541><div class="feature-icon" data-v-dabfa541>`);
      _push(ssrRenderComponent(_component_nuxt_icon, { name: "global/check" }, null, _parent));
      _push(`</div>开箱即用</li></ul></div></div><div class="right" data-v-dabfa541>`);
      _push(ssrRenderComponent(Card, { class: "login-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 class="title" data-v-dabfa541${_scopeId}>欢迎回来</h2><p class="subtitle" data-v-dabfa541${_scopeId}>登录您的账户</p>`);
            _push2(ssrRenderComponent(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: form.value,
              rules,
              "label-position": "top",
              class: "form"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    prop: "account",
                    class: "form-item"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: form.value.account,
                          "onUpdate:modelValue": ($event) => form.value.account = $event,
                          placeholder: "请输入账号",
                          clearable: ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: form.value.account,
                            "onUpdate:modelValue": ($event) => form.value.account = $event,
                            placeholder: "请输入账号",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    prop: "password",
                    class: "form-item"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: form.value.password,
                          "onUpdate:modelValue": ($event) => form.value.password = $event,
                          type: "password",
                          placeholder: "请输入密码",
                          "show-password": ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: form.value.password,
                            "onUpdate:modelValue": ($event) => form.value.password = $event,
                            type: "password",
                            placeholder: "请输入密码",
                            "show-password": ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="form-item extras" data-v-dabfa541${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_el_checkbox, {
                    modelValue: form.value.remember,
                    "onUpdate:modelValue": ($event) => form.value.remember = $event
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`记住我`);
                      } else {
                        return [
                          createTextVNode("记住我")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_el_button, {
                    type: "primary",
                    class: "submit",
                    loading: loading.value,
                    onClick: onSubmit
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`登录`);
                      } else {
                        return [
                          createTextVNode("登录")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, {
                      prop: "account",
                      class: "form-item"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: form.value.account,
                          "onUpdate:modelValue": ($event) => form.value.account = $event,
                          placeholder: "请输入账号",
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      prop: "password",
                      class: "form-item"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: form.value.password,
                          "onUpdate:modelValue": ($event) => form.value.password = $event,
                          type: "password",
                          placeholder: "请输入密码",
                          "show-password": ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "form-item extras" }, [
                      createVNode(_component_el_checkbox, {
                        modelValue: form.value.remember,
                        "onUpdate:modelValue": ($event) => form.value.remember = $event
                      }, {
                        default: withCtx(() => [
                          createTextVNode("记住我")
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    createVNode(_component_el_button, {
                      type: "primary",
                      class: "submit",
                      loading: loading.value,
                      onClick: onSubmit
                    }, {
                      default: withCtx(() => [
                        createTextVNode("登录")
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("h2", { class: "title" }, "欢迎回来"),
              createVNode("p", { class: "subtitle" }, "登录您的账户"),
              createVNode(_component_el_form, {
                ref_key: "formRef",
                ref: formRef,
                model: form.value,
                rules,
                "label-position": "top",
                class: "form"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, {
                    prop: "account",
                    class: "form-item"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: form.value.account,
                        "onUpdate:modelValue": ($event) => form.value.account = $event,
                        placeholder: "请输入账号",
                        clearable: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    prop: "password",
                    class: "form-item"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: form.value.password,
                        "onUpdate:modelValue": ($event) => form.value.password = $event,
                        type: "password",
                        placeholder: "请输入密码",
                        "show-password": ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "form-item extras" }, [
                    createVNode(_component_el_checkbox, {
                      modelValue: form.value.remember,
                      "onUpdate:modelValue": ($event) => form.value.remember = $event
                    }, {
                      default: withCtx(() => [
                        createTextVNode("记住我")
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode(_component_el_button, {
                    type: "primary",
                    class: "submit",
                    loading: loading.value,
                    onClick: onSubmit
                  }, {
                    default: withCtx(() => [
                      createTextVNode("登录")
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ]),
                _: 1
              }, 8, ["model"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-dabfa541"]]);

export { login as default };
//# sourceMappingURL=login-Bi7CZZKR.mjs.map
