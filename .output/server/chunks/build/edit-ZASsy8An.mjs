import { E as ElButton } from './el-button-DKxyzA5S.mjs';
import { E as ElCard } from './el-card-pCxK5Z-h.mjs';
import { E as ElForm, a as ElFormItem } from './el-form-item-DmuF_RFN.mjs';
import { E as ElInput } from './el-input-CL5uOxgl.mjs';
import { E as ElSelect, a as ElOption } from './el-select-DINKP6dI.mjs';
import { _ as _export_sfc, q as navigateTo, h as http } from './server.mjs';
import { E as ElMessage } from './index-BH4P6TZ1.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, createBlock, openBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { MdEditor } from 'md-editor-v3';
import { useRoute } from 'vue-router';
import { a as articleService } from './article.service-CFPqqVdc.mjs';
import { a as appCache } from './cache-Bl-VgnBs.mjs';
import { t as tagService } from './tag.service-BZ4HA-i1.mjs';
import './constants-CUtq6qCd.mjs';
import './plugin-vue_export-helper-BqDg8bah.mjs';
import '@vueuse/core';
import './index-DYDdtqo2.mjs';
import 'lodash-es';
import './index-ToUTMhai.mjs';
import './event-D6RlLW-5.mjs';
import './index-sS3vk-N3.mjs';
import './event-B21lDVQA.mjs';
import './typescript-D6L75muK.mjs';
import './el-popper-Da7PzTYS.mjs';
import './el-scrollbar-D9cqWD0V.mjs';
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

class UploadService {
  async uploadFiles(files, articleId) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });
    if (articleId) {
      formData.append("articleId", articleId);
    }
    return await http.post("/upload", formData);
  }
}
const uploadService = new UploadService();
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  setup(__props) {
    const onUploadImg = async (files, callback) => {
      try {
        const id = mode.value === "update" ? route.query.id : tempId.value;
        const res = await uploadService.uploadFiles(files, id);
        if (res.status === 200 && res.data) {
          const urls = res.data.map((file) => file.url);
          callback(urls);
        } else {
          ElMessage.error("图片上传失败");
        }
      } catch (e) {
        ElMessage.error("图片上传出错");
      }
    };
    const route = useRoute();
    const mode = computed(() => route.query.mode === "update" ? "update" : "add");
    const pageTitle = computed(() => mode.value === "add" ? "新增文章" : "编辑文章");
    const categoryOptions = ref([]);
    const tagOptions = ref([]);
    const form = ref({
      title: "",
      category: "",
      tags: [],
      content: "",
      tempId: ""
    });
    const tempId = ref("");
    const originalTags = ref([]);
    const rules = ref({
      title: [{ required: true, message: "请输入标题", trigger: ["blur"] }],
      category: [{ required: true, message: "请选择分类", trigger: ["change"] }],
      tags: [{ required: true, message: "请输入标签", trigger: ["blur"] }],
      content: [{ required: true, message: "请输入内容", trigger: ["blur"] }]
    });
    const onSubmit = async () => {
      if (mode.value === "add") {
        try {
          form.value.tempId = tempId.value;
          const res = await articleService.createArticle(form.value);
          if (res.status === 200 && res.data.status === 200) {
            if (Array.isArray(form.value.tags) && form.value.tags.length > 0) {
              await tagService.syncTags(form.value.tags, []);
            }
            appCache.removeCategories();
            ElMessage.success("保存成功");
            navigateTo("/admin/content/article", { replace: true });
          }
        } catch (error) {
          ElMessage.error(error?.msg || "保存失败");
        }
      } else {
        try {
          const id = route.query.id;
          const res = await articleService.updateArticle(id, form.value);
          if (res.status === 200 && res.data.status === 200) {
            const currentTags = Array.isArray(form.value.tags) ? form.value.tags : [];
            const prevTags = originalTags.value;
            const add = currentTags.filter((t) => !prevTags.includes(t));
            const remove = prevTags.filter((t) => !currentTags.includes(t));
            if (add.length || remove.length) {
              await tagService.syncTags(add, remove);
            }
            appCache.removeCategories();
            ElMessage.success("保存成功");
            navigateTo("/admin/content/article", { replace: true });
          }
        } catch (error) {
          ElMessage.error(error?.msg || "保存失败");
        }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_button = ElButton;
      const _component_el_card = ElCard;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_select = ElSelect;
      const _component_el_option = ElOption;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "article-edit" }, _attrs))} data-v-aa0654ce><div class="header" data-v-aa0654ce><h2 class="title" data-v-aa0654ce>${ssrInterpolate(pageTitle.value)}</h2><div class="ops" data-v-aa0654ce>`);
      _push(ssrRenderComponent(_component_el_button, {
        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/content/article")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`取消`);
          } else {
            return [
              createTextVNode("取消")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_button, {
        type: "primary",
        onClick: onSubmit,
        icon: _ctx.Check
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`保存文章`);
          } else {
            return [
              createTextVNode("保存文章")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="editor-layout" data-v-aa0654ce>`);
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "panel form-panel"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-aa0654ce${_scopeId}>文章设置</span>`);
          } else {
            return [
              createVNode("span", null, "文章设置")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_form, {
              model: form.value,
              ref: "formRef",
              rules: rules.value,
              "label-position": "top"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "文章标题",
                    prop: "title"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: form.value.title,
                          "onUpdate:modelValue": ($event) => form.value.title = $event,
                          placeholder: "请输入文章标题",
                          clearable: ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: form.value.title,
                            "onUpdate:modelValue": ($event) => form.value.title = $event,
                            placeholder: "请输入文章标题",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "文章分类",
                    prop: "category"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: form.value.category,
                          "onUpdate:modelValue": ($event) => form.value.category = $event,
                          placeholder: "请选择文章分类",
                          style: { "width": "100%" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<!--[-->`);
                              ssrRenderList(categoryOptions.value, (item) => {
                                _push5(ssrRenderComponent(_component_el_option, {
                                  key: item.value,
                                  label: item.label,
                                  value: item.value
                                }, null, _parent5, _scopeId4));
                              });
                              _push5(`<!--]-->`);
                            } else {
                              return [
                                (openBlock(true), createBlock(Fragment, null, renderList(categoryOptions.value, (item) => {
                                  return openBlock(), createBlock(_component_el_option, {
                                    key: item.value,
                                    label: item.label,
                                    value: item.value
                                  }, null, 8, ["label", "value"]);
                                }), 128))
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: form.value.category,
                            "onUpdate:modelValue": ($event) => form.value.category = $event,
                            placeholder: "请选择文章分类",
                            style: { "width": "100%" }
                          }, {
                            default: withCtx(() => [
                              (openBlock(true), createBlock(Fragment, null, renderList(categoryOptions.value, (item) => {
                                return openBlock(), createBlock(_component_el_option, {
                                  key: item.value,
                                  label: item.label,
                                  value: item.value
                                }, null, 8, ["label", "value"]);
                              }), 128))
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "文章标签",
                    prop: "tags"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: form.value.tags,
                          "onUpdate:modelValue": ($event) => form.value.tags = $event,
                          multiple: "",
                          filterable: "",
                          "allow-create": "",
                          "default-first-option": "",
                          "reserve-keyword": false,
                          placeholder: "输入或选择标签",
                          style: { "width": "100%" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<!--[-->`);
                              ssrRenderList(tagOptions.value, (item) => {
                                _push5(ssrRenderComponent(_component_el_option, {
                                  key: item.value,
                                  label: item.label,
                                  value: item.value
                                }, null, _parent5, _scopeId4));
                              });
                              _push5(`<!--]-->`);
                            } else {
                              return [
                                (openBlock(true), createBlock(Fragment, null, renderList(tagOptions.value, (item) => {
                                  return openBlock(), createBlock(_component_el_option, {
                                    key: item.value,
                                    label: item.label,
                                    value: item.value
                                  }, null, 8, ["label", "value"]);
                                }), 128))
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: form.value.tags,
                            "onUpdate:modelValue": ($event) => form.value.tags = $event,
                            multiple: "",
                            filterable: "",
                            "allow-create": "",
                            "default-first-option": "",
                            "reserve-keyword": false,
                            placeholder: "输入或选择标签",
                            style: { "width": "100%" }
                          }, {
                            default: withCtx(() => [
                              (openBlock(true), createBlock(Fragment, null, renderList(tagOptions.value, (item) => {
                                return openBlock(), createBlock(_component_el_option, {
                                  key: item.value,
                                  label: item.label,
                                  value: item.value
                                }, null, 8, ["label", "value"]);
                              }), 128))
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, {
                      label: "文章标题",
                      prop: "title"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: form.value.title,
                          "onUpdate:modelValue": ($event) => form.value.title = $event,
                          placeholder: "请输入文章标题",
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "文章分类",
                      prop: "category"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: form.value.category,
                          "onUpdate:modelValue": ($event) => form.value.category = $event,
                          placeholder: "请选择文章分类",
                          style: { "width": "100%" }
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(categoryOptions.value, (item) => {
                              return openBlock(), createBlock(_component_el_option, {
                                key: item.value,
                                label: item.label,
                                value: item.value
                              }, null, 8, ["label", "value"]);
                            }), 128))
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "文章标签",
                      prop: "tags"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: form.value.tags,
                          "onUpdate:modelValue": ($event) => form.value.tags = $event,
                          multiple: "",
                          filterable: "",
                          "allow-create": "",
                          "default-first-option": "",
                          "reserve-keyword": false,
                          placeholder: "输入或选择标签",
                          style: { "width": "100%" }
                        }, {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(tagOptions.value, (item) => {
                              return openBlock(), createBlock(_component_el_option, {
                                key: item.value,
                                label: item.label,
                                value: item.value
                              }, null, 8, ["label", "value"]);
                            }), 128))
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
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
                ref: "formRef",
                rules: rules.value,
                "label-position": "top"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, {
                    label: "文章标题",
                    prop: "title"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: form.value.title,
                        "onUpdate:modelValue": ($event) => form.value.title = $event,
                        placeholder: "请输入文章标题",
                        clearable: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "文章分类",
                    prop: "category"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: form.value.category,
                        "onUpdate:modelValue": ($event) => form.value.category = $event,
                        placeholder: "请选择文章分类",
                        style: { "width": "100%" }
                      }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(categoryOptions.value, (item) => {
                            return openBlock(), createBlock(_component_el_option, {
                              key: item.value,
                              label: item.label,
                              value: item.value
                            }, null, 8, ["label", "value"]);
                          }), 128))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "文章标签",
                    prop: "tags"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: form.value.tags,
                        "onUpdate:modelValue": ($event) => form.value.tags = $event,
                        multiple: "",
                        filterable: "",
                        "allow-create": "",
                        "default-first-option": "",
                        "reserve-keyword": false,
                        placeholder: "输入或选择标签",
                        style: { "width": "100%" }
                      }, {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(tagOptions.value, (item) => {
                            return openBlock(), createBlock(_component_el_option, {
                              key: item.value,
                              label: item.label,
                              value: item.value
                            }, null, 8, ["label", "value"]);
                          }), 128))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model", "rules"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "panel editor-panel"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(MdEditor), {
              modelValue: form.value.content,
              "onUpdate:modelValue": ($event) => form.value.content = $event,
              class: "md-editor",
              placeholder: "开始创作你的文章...",
              "toolbars-exclude": ["github"],
              onOnUploadImg: onUploadImg
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(MdEditor), {
                modelValue: form.value.content,
                "onUpdate:modelValue": ($event) => form.value.content = $event,
                class: "md-editor",
                placeholder: "开始创作你的文章...",
                "toolbars-exclude": ["github"],
                onOnUploadImg: onUploadImg
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content/article/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const edit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-aa0654ce"]]);

export { edit as default };
//# sourceMappingURL=edit-ZASsy8An.mjs.map
