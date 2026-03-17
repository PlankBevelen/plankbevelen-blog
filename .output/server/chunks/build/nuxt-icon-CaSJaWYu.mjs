import { ref, withAsyncContext, watchEffect, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const _sfc_main = {
  __name: "NuxtIcon",
  __ssrInlineRender: true,
  props: {
    name: { type: String, required: true },
    filled: { type: Boolean, required: false, default: false }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const icon = ref("");
    let hasStroke = false;
    async function getIcon() {
      try {
        const iconsImport = /* @__PURE__ */ Object.assign({
          "/assets/icons/add.svg": () => import('./add-rLYTpYwq.mjs').then((m) => m["default"]),
          "/assets/icons/admin/close.svg": () => import('./close-BLwkcnEX.mjs').then((m) => m["default"]),
          "/assets/icons/admin/sidebar/content.svg": () => import('./content-CSv1BDkZ.mjs').then((m) => m["default"]),
          "/assets/icons/admin/sidebar/dashboard.svg": () => import('./dashboard-D50mMRzG.mjs').then((m) => m["default"]),
          "/assets/icons/admin/sidebar/stastics.svg": () => import('./stastics-DFuMMEBp.mjs').then((m) => m["default"]),
          "/assets/icons/article/create-time.svg": () => import('./create-time-BATSxUrg.mjs').then((m) => m["default"]),
          "/assets/icons/article/tag.svg": () => import('./tag-C8TsqVSc.mjs').then((m) => m["default"]),
          "/assets/icons/article/update-time.svg": () => import('./update-time-B9Nf4iEI.mjs').then((m) => m["default"]),
          "/assets/icons/blogger/location.svg": () => import('./location-DgzPAKTF.mjs').then((m) => m["default"]),
          "/assets/icons/blogger/profession.svg": () => import('./profession-CUkLqN3U.mjs').then((m) => m["default"]),
          "/assets/icons/delete.svg": () => import('./delete-bVtITeab.mjs').then((m) => m["default"]),
          "/assets/icons/edit.svg": () => import('./edit-B-hDhdUo.mjs').then((m) => m["default"]),
          "/assets/icons/global/check.svg": () => import('./check-B5z3yXwb.mjs').then((m) => m["default"]),
          "/assets/icons/header/close.svg": () => import('./close-DJcyqCxq.mjs').then((m) => m["default"]),
          "/assets/icons/header/language.svg": () => import('./language-DFrlqecJ.mjs').then((m) => m["default"]),
          "/assets/icons/header/menu.svg": () => import('./menu-BBvF3ov8.mjs').then((m) => m["default"]),
          "/assets/icons/header/moon.svg": () => import('./moon-BdDAtxl_.mjs').then((m) => m["default"]),
          "/assets/icons/header/sun.svg": () => import('./sun-CgShU2TJ.mjs').then((m) => m["default"]),
          "/assets/icons/search.svg": () => import('./search-C3ZhUy2G.mjs').then((m) => m["default"])
        });
        const rawIcon = await iconsImport[`/assets/icons/${props.name}.svg`]();
        if (rawIcon.includes("stroke")) {
          hasStroke = true;
        }
        icon.value = rawIcon;
      } catch {
        console.error(
          `[nuxt-icons] Icon '${props.name}' doesn't exist in 'assets/icons'`
        );
      }
    }
    [__temp, __restore] = withAsyncContext(() => getIcon()), await __temp, __restore();
    watchEffect(getIcon);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["nuxt-icon", { "nuxt-icon--fill": !__props.filled, "nuxt-icon--stroke": unref(hasStroke) && !__props.filled }]
      }, _attrs))}>${unref(icon) ?? ""}</span>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/nuxt-icons@4.0.0_nuxt@4.2.1_08ea087e0f57ea1d24afeef3bdcab6a5/node_modules/nuxt-icons/dist/runtime/components/nuxt-icon.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=nuxt-icon-CaSJaWYu.mjs.map
