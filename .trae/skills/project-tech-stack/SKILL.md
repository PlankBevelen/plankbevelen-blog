---
name: "project-tech-stack"
description: "记录 PlankBevelen Blog 的核心技术栈、关键配置与前端开发规范（含 Tailwind 设计系统与审查清单）。当新成员上手、配置调整或页面重构时调用。"
---

# PlankBevelen Blog 技术栈与开发规范

## 项目概览

- 框架：Nuxt 4（SSR）+ Vue 3 + TypeScript
- 样式：Tailwind CSS + Less（全局主题变量与少量复杂样式）
- 状态：Pinia
- UI：Element Plus
- 国际化：@nuxtjs/i18n
- SEO：@nuxtjs/seo（站点级 + 页面级）
- 服务端：Nitro（server/api/**）+ MongoDB（mongodb driver）
- 包管理：pnpm

## 目录结构（关键约定）

- app/：前端源码（pages/layouts/components/composables/assets 等）
- server/：Nitro 服务端 API、middleware、utils、脚本
- public/：静态资源（直接以根路径访问）

## 关键配置说明

### Nuxt 配置（nuxt.config.ts）

- 全局样式注入顺序（css）：
  - tailwind.css（生成 utilities）
  - global.less（reset 与少量全局基础样式）
  - theme.less（CSS Variables：颜色体系与暗黑主题）
  - variables.less（Less 变量：尺寸/字号/圆角等）
- PostCSS：
  - postcss-pxtorem：以 rootValue=24 将 px 转 rem（与全局 html font-size 体系配合）
- 模块：
  - @nuxtjs/tailwindcss / @nuxtjs/seo / @nuxtjs/i18n / @pinia/nuxt / @element-plus/nuxt / @nuxt/image

### Tailwind 配置（tailwind.config.ts）

- 目标：把主题与尺寸 Token 统一进 Tailwind（颜色/间距/字体/圆角），以 utility-first 为主，减少重复的 scoped less。
- 约束：避免使用 Tailwind 自带 container（项目已有全局 .container 约束），页面内优先复用全局 .container。

### 主题与 Token 来源（Less）

- 颜色来源：app/assets/css/theme.less（CSS Variables）
  - 以语义变量为主：--primary-color / --text-color / --bg-color / --card-color 等
  - dark 主题通过 :root[theme="dark"] 覆写同名变量
- 尺寸来源：app/assets/css/variables.less（Less 变量）
  - 例如：@header-height / @max-content-width / 字号 / 圆角 / 基础间距

## 前端开发规范

### Vue / Nuxt 代码风格

- 使用 <script setup lang="ts">（页面与组件一致）
- 页面数据获取优先 useAsyncData（SSR 友好）
- i18n 文案优先使用 useI18n().t，避免模板里写死多语言字符串（除品牌/专有名词）
- SEO：
  - 页面级 SEO 统一通过 composable（usePageSeo）设置 title/description/keywords
  - 首页等特殊页可用 useHead 补充 ld+json，但避免重复写 canonical（由全局统一生成）

### Tailwind CSS 统一规范（必须遵循）

#### 颜色系统（只用语义 Token）

- 只允许使用语义类（示例）：
  - 文字：text-text / text-secondary / text-mute / text-primary
  - 背景：bg-bg / bg-card / bg-header
  - 边框：border-border
- 禁止：
  - 在模板里使用任意 hex/rgb（如 text-[#333]、bg-[rgba(...)]）
  - 直接使用 Tailwind 默认颜色语义（如 text-blue-500）作为业务颜色

#### 间距体系（只用 Token 或必要的 px 值）

- 优先使用 Token 间距（示例）：
  - pt-header（头部占位）
  - py-page（页面容器上下留白）
- 若确需非 Token 值：
  - 允许使用少量明确 px 的 arbitrary value（例如 mt-[12px]），但必须是“无法用现有 Token 表达”的例外情况
- 禁止：
  - 在同一页面/组件内混用多种等价间距写法（例如同时用 py-10 与 py-[40px] 达成同一效果）

#### 字体层级（语义字号）

- 使用语义字号（示例）：
  - text-body / text-title / text-meta / text-h1
- 禁止：
  - 在业务组件里自行定义一套新的字号层级（除非同步更新 Token 并在审查中说明）

#### 响应式断点

- 使用 Tailwind 默认断点（mobile-first）：
  - sm: 640，md: 768，lg: 1024，xl: 1280，2xl: 1536
- 规则：
  - 先写移动端默认样式，再逐级增加 md/lg/xl
  - 同一模块避免断点碎片化（不要出现大量“只差 1-2px 的断点”）

#### 组件命名与复用

- 组件：PascalCase 作为组件名（模板中使用）
- 文件命名：保持现有目录与命名习惯；新增文件推荐 kebab-case.vue，并在 import 时保持路径清晰
- 可复用的 Tailwind 组合：
  - 当同一组 class 在 3 处及以上重复时，优先抽为组件或抽为受控的 class（通过全局样式层或组件内部样式层 @apply）

#### Class 书写顺序（统一可读性）

按下面顺序排列 class（从结构到细节）：

1) 布局：display / flex / grid / position  
2) 尺寸：w/h/min/max  
3) 间距：m/p/gap  
4) 排版：text-*/leading/tracking/font-*  
5) 颜色：text-*/bg-*/border-*  
6) 视觉：rounded/shadow/opacity/backdrop  
7) 状态：hover/focus/active/disabled  
8) 响应式：把 md:/lg:/xl: 放在对应属性附近，不要全部堆到末尾

## 重构准则（视觉一致性优先）

- 优先改动：页面骨架/布局/间距/字体等可由 Token 表达的部分
- 慎改动：全局 .container、全局 reset、Element Plus 与 md-editor 的 deep 覆盖
- 目标：在不改变视觉的前提下，减少 scoped less 与重复样式

## 代码审查清单（合并前必须过）

- 未引入硬编码颜色；颜色全部来自语义 Token
- 间距/字号/圆角优先使用 Token；arbitrary value 有充分理由且数量可控
- 未新增无必要的 scoped less；如新增，必须是 Tailwind 难以表达的复杂选择器/第三方覆盖
- 页面重构前后视觉一致（至少对比首页关键区域：Header 占位、三栏布局、卡片间距、字体层级）
- SEO/SSR 不退化（页面仍能服务端输出主要内容，不出现仅 CSR 空壳）
