# PlankBevelen Blog — Skill Documentation

本文面向新成员与维护者，系统梳理本项目的核心技术能力、业务技能、工具链使用方法与最佳实践，目标是：新成员在 1 个工作日内可独立完成环境搭建并提交一次最小功能迭代（含自动化验证）。

**源码关键入口（代码参考）**
- Nuxt 配置：[nuxt.config.ts](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts)
- Tailwind Token：[tailwind.config.ts](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts)
- Mongo 连接与索引：[mongo.ts](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts)
- 鉴权中间件（JWT）：[auth.ts](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/middleware/auth.ts)
- 进程守护（PM2）：[ecosystem.config.cjs](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/ecosystem.config.cjs)
- 项目依赖版本：[package.json](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/package.json)

**可运行的示例代码仓库**
- https://github.com/PlankBevelen/plankbevelen-blog （如实际仓库地址不同，请以组织/仓库为准替换）

---

## 目录

1. [项目技术栈总览](#1-项目技术栈总览)  
2. [核心技能清单](#2-核心技能清单)  
3. [开发环境搭建指南](#3-开发环境搭建指南)  
4. [编码规范与最佳实践](#4-编码规范与最佳实践)  
5. [CI/CD 技能说明](#5-cicd-技能说明)  
6. [监控与可观测性](#6-监控与可观测性)  
7. [安全技能要求](#7-安全技能要求)  
8. [故障应急手册](#8-故障应急手册)  
9. [版本管理与发布策略](#9-版本管理与发布策略)  
10. [交付物与验收标准](#10-交付物与验收标准)  

---

## 1. 项目技术栈总览

### 1.1 前端层（Web App）

| 层级 | 选型 | 版本（以 package.json 为准） | 选型理由 |
|---|---|---:|---|
| 框架 | Nuxt（SSR） | nuxt `^4.2.1` | SSR + 路由/数据获取一体化；Nitro 同仓后端；静态化/预渲染能力可用于站点页 |
| 视图 | Vue | vue `^3.5.24` | Composition API 与生态成熟 |
| 语言 | TypeScript | （由 Nuxt/Vue 生态提供） | 类型约束提升可维护性 |
| 状态 | Pinia | pinia `^3.0.4`、@pinia/nuxt `^0.11.3` | 轻量、DevTools 友好、SSR 兼容 |
| UI | Element Plus | element-plus `^2.11.8`、@element-plus/nuxt `^1.1.4` | 组件齐全、后台页效率高 |
| 样式 | Tailwind CSS + Less | tailwindcss `^3.4.19`、less `^4.4.2` | Tailwind 用于 Token 化与快速布局；Less 用于少量全局主题变量/复杂样式 |
| 国际化 | @nuxtjs/i18n | `^10.2.3` | 路由前缀策略与 JSON 字典管理 |
| SEO | @nuxtjs/seo | `^3.3.0` | 站点级 sitemap/robots/metadata 体系 |
| 图像 | @nuxt/image（ipx）+ sharp | @nuxt/image `^2.0.0`、ipx `3.0.0`、sharp `^0.34.5` | 服务端图像裁切/格式处理、缓存与域名白名单 |
| 请求 | axios | `^1.13.2` | 统一封装、拦截器、错误处理能力 |

代码参考：
- Nuxt 模块与 SSR：见 [nuxt.config.ts:L4-L19](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L4-L19)
- SEO/站点配置：见 [nuxt.config.ts:L20-L39](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L20-L39)
- Tailwind Token（语义色/间距/字号）：见 [tailwind.config.ts:L3-L49](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts#L3-L49)

### 1.2 后端层（BFF / API）

| 层级 | 选型 | 版本 | 选型理由 |
|---|---|---:|---|
| 运行时 | Node.js | 建议 Node 20 LTS（最低 Node 18.17+） | Nuxt 4/Nitro 生态；内置 fetch 可用于脚本化健康检查 |
| 服务端框架 | Nitro（Nuxt 内置）+ h3 | 随 Nuxt | server/api 路由直出，部署形态简单（.output/server） |
| 鉴权 | JWT（header: token） | jsonwebtoken `^9.0.2` | 后台 API 简洁鉴权；无状态扩容友好 |
| 上传 | Nitro API + 文件系统路由 | 项目内实现 | 统一上传入口与静态映射（/uploads） |

代码参考：
- 鉴权中间件：见 [auth.ts:L4-L35](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/middleware/auth.ts#L4-L35)
- 运行时配置（authSecret、baseUrl 等）：见 [nuxt.config.ts:L60-L68](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L60-L68)

### 1.3 数据层

| 层级 | 选型 | 版本 | 选型理由 |
|---|---|---:|---|
| 主数据库 | MongoDB | mongodb driver `^6.15.0` | 文档模型适配文章/标签；索引与全文检索能力 |
| 历史/迁移 | MySQL（仅用于迁移/兼容） | mysql2 `^3.15.3` | 提供迁移脚本与历史 SQL 结构留档 |

代码参考：
- Mongo 连接、连接池、索引与事务降级：见 [mongo.ts:L6-L132](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L6-L132)
- MySQL 迁移脚本入口：见 [migrate-mysql-to-mongo.ts](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/scripts/migrate-mysql-to-mongo.ts)

### 1.4 中间件与 DevOps

| 层级 | 选型 | 版本/形态 | 选型理由 |
|---|---|---|---|
| 静态压缩 | vite-plugin-compression | `^0.5.1` | 产物 gzip 压缩降低带宽与 TTFB |
| 进程管理 | PM2（cluster） | ecosystem.config.cjs | 多进程利用多核、自动重启与日志归档 |
| 部署产物 | Nuxt .output | `pnpm build` | Node 进程直接运行，形态清晰 |

代码参考：
- gzip 压缩配置：见 [nuxt.config.ts:L90-L123](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L90-L123)
- PM2 配置：见 [ecosystem.config.cjs:L1-L20](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/ecosystem.config.cjs#L1-L20)

**本章动手实验（可复制执行）**

```bash
pnpm -v
node -v
pnpm install
pnpm dev
```

---

## 2. 核心技能清单

本章按模块拆分，每项技能包含：业务场景、关键 API/CLI、配置示例、性能调优要点、常见错误排查流程。

### 2.1 Nuxt SSR 与页面数据获取

**业务场景**
- 首页、文章列表页、文章详情页需要 SSR 输出核心内容，提升 SEO 与首屏体验。

**关键能力**
- `useAsyncData` / `useFetch`：SSR/CSR 统一数据通道
- `definePageMeta`：路由元信息
- `Nitro` 端点：`/server/api/**` 提供数据

**关键 API**
- 前端：`useAsyncData(key, handler)`、`useRoute()`、`useHead()`（必要时）
- 后端：`defineEventHandler((event) => {})`（h3）

**配置示例**
- SSR 开启：见 [nuxt.config.ts:L8-L10](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L8-L10)

**性能调优要点**
- SSR 数据请求做收敛：同页面避免多次请求同一资源（以 key 复用、服务端聚合接口为主）
- 大依赖分包：md-editor 已配置手动 chunk：见 [nuxt.config.ts:L109-L122](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L109-L122)
- 图片统一走 @nuxt/image（ipx）以获得压缩与缓存：见 [nuxt.config.ts:L124-L143](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L124-L143)

**常见错误与排查**
- 现象：页面 SSR 空壳、仅 CSR 渲染  
  排查：确认页面使用 `useAsyncData` 且 handler 可在 Node 环境运行；检查是否使用了仅浏览器 API（window/document）
- 现象：构建时 chunk 过大告警  
  排查：确认 `manualChunks` 覆盖关键大库；必要时拆分后台编辑器页

**本章动手实验（自动化脚本）**

```bash
# 1) 启动开发服务
pnpm dev

# 2) Node 一次性验证 SSR 端点可访问（Node 18+）
node -e "fetch('http://localhost:3000/api/home.data').then(r=>r.text()).then(t=>{console.log('home.data ok'); process.exit(0)}).catch(e=>{console.error(e); process.exit(1)})"
```

### 2.2 Tailwind Token 化与主题系统

**业务场景**
- 站点前台与后台统一视觉规范（颜色、字号、间距、圆角），支持暗黑主题切换，降低样式碎片化。

**关键能力**
- 语义 Token：Tailwind `extend.colors/spacing/fontSize/borderRadius`
- 主题变量：CSS Variables（全局 theme.less）

**关键配置**
- Tailwind Token：见 [tailwind.config.ts:L7-L49](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts#L7-L49)
- 全局样式注入顺序：见 [nuxt.config.ts:L7](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L7)

**最佳实践（强约束）**
- 只用语义色：`text-text/bg-bg/border-border/text-primary` 等，不允许 `text-[#333]` 或 `text-blue-500` 作为业务色
- 间距/字号优先使用 Token：`pt-header/py-page/text-body/text-title`

**性能调优要点**
- 尽量使用 utility，减少 scoped less（降低样式编译与覆盖复杂度）
- 避免在模板中引入大量动态 class 拼接，优先用计算属性归并

**常见错误与排查**
- 现象：暗黑模式下颜色不对  
  排查：检查 theme.less 是否覆盖对应 CSS Variable；检查 Tailwind 类是否使用语义色而非硬编码

**本章动手实验**

```bash
# 运行后打开页面，切换主题（若页面提供切换入口）
pnpm dev
```

### 2.3 i18n（多语言）与路由策略

**业务场景**
- 中英文内容切换，且默认中文不加前缀，英文路径以 /en 开头。

**关键配置**
- i18n 策略：见 [nuxt.config.ts:L11-L19](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L11-L19)

**关键 API**
- `const { t, locale } = useI18n()`，模板中 `{{ t('key') }}`

**常见错误与排查**
- 现象：切换语言后路由不正确  
  排查：确认 `strategy: 'prefix_except_default'`；确认 locales 文件在 `i18n/locales/*`

**本章动手实验**

```bash
pnpm dev
# 浏览器访问 / 与 /en，检查文案与路由是否符合预期
```

### 2.4 SEO（sitemap/robots/metadata）与站点收录

**业务场景**
- 文章页可被搜索引擎抓取，站点生成 sitemap.xml，后台页不被索引。

**关键配置**
- site/sitemap/robots：见 [nuxt.config.ts:L20-L39](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L20-L39)
- sitemap 数据源：`/api/sitemap-urls`：见 [nuxt.config.ts:L27-L31](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L27-L31)

**排查流程**
- 现象：sitemap 缺少文章链接  
  排查：检查后端 `server/api/sitemap-urls.ts` 是否返回完整 URLs；检查 DB 查询条件（是否过滤软删）

**本章动手实验**

```bash
pnpm dev
node -e "fetch('http://localhost:3000/sitemap.xml').then(r=>r.text()).then(t=>{console.log(t.includes('<urlset')?'sitemap ok':'sitemap missing'); process.exit(t.includes('<urlset')?0:1)})"
```

### 2.5 后端 API（Nitro/h3）与路由约定

**业务场景**
- 前台：文章/标签/分类与侧边栏聚合数据  
- 后台：admin 登录、内容管理（CRUD）、上传

**关键约定**
- 路由：`/server/api/**` 文件路径映射为 API 路径（如 `server/api/home.data.get.ts` → `GET /api/home.data`）
- 管理端保护：`/api/admin/**` 默认需鉴权（除登录）

**关键 API**
- `defineEventHandler`、`readBody`、`getQuery`、`setResponseStatus`
- 返回统一结构（建议）：`{ code, message, data }`（部分接口已遵循）

**性能调优要点**
- 聚合接口减少前端并发：例如首页统一 `/api/home.data`
- Mongo 索引覆盖常用排序/过滤：见 [mongo.ts:L84-L95](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L84-L95)

**常见错误与排查**
- 现象：本地请求 404  
  排查：确认文件名后缀 `*.get.ts/*.post.ts` 与 HTTP Method 匹配；确认路径层级
- 现象：接口 500 且无堆栈  
  排查：临时启用更高日志级别（见第 4 章日志规范），在 handler 内打印请求 key 字段（避免打印敏感信息）

**本章动手实验**

```bash
pnpm dev
node -e "fetch('http://localhost:3000/api/sidebar.data').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
```

### 2.6 JWT 鉴权（后台 API）

**业务场景**
- 保护后台管理 API（发布文章、删除内容、上传等），前台只读接口无需登录。

**关键机制**
- 请求头 `token` 携带 JWT
- runtimeConfig.authSecret 作为签名密钥：见 [nuxt.config.ts:L60-L62](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L60-L62)
- 中间件验证与注入 `event.context.auth`：见 [auth.ts:L8-L34](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/middleware/auth.ts#L8-L34)

**关键 CLI/调试**

```bash
# 仅用于本地调试：拿到 token 后，验证受保护接口
curl -H "token: <JWT>" http://localhost:3000/api/admin/dashboard
```

**常见错误与排查**
- 现象：401 UNAUTHORIZED  
  排查：确认请求头是否为 `token`；确认是否走了代理导致 header 丢失
- 现象：401 INVALID_TOKEN  
  排查：核对 `NUXT_AUTH_SECRET` 是否一致；检查时钟漂移（exp/iat）

**本章动手实验**

```bash
# 访问不需要登录的接口应成功
node -e "fetch('http://localhost:3000/api/home.data').then(r=>process.exit(r.ok?0:1))"

# 访问受保护接口应失败（未提供 token）
node -e "fetch('http://localhost:3000/api/admin/dashboard').then(r=>process.exit(r.status===401?0:1))"
```

### 2.7 MongoDB 数据建模、索引与事务策略

**业务场景**
- 文章、分类、标签的增删改查，支持软删除与按时间排序。

**关键能力**
- 连接池：`maxPoolSize` 可配置：见 [mongo.ts:L50-L55](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L50-L55)
- 索引：唯一键、排序索引、全文检索：见 [mongo.ts:L84-L95](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L84-L95)
- 事务：单机非副本集环境自动降级为非事务：见 [mongo.ts:L111-L128](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L111-L128)

**关键配置示例（环境变量）**

```bash
NUXT_MONGO_URI=mongodb://127.0.0.1:27017
NUXT_MONGO_DB=plankbevelen-blog
NUXT_MONGO_MAX_POOL_SIZE=10
```

**性能调优要点**
- 写入路径：保证文章 id 生成是原子操作（`counters` 自增）：见 [mongo.ts:L134-L146](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L134-L146)
- 查询路径：排序字段必须有复合索引；分页优先使用“游标/条件 + limit”，避免 skip 深分页

**常见错误与排查**
- 现象：启动时报 “MongoDB 连接初始化失败”  
  排查：检查 URI/端口/认证；本地 docker 是否启动；检查网络策略与防火墙
- 现象：事务报 “Transaction numbers are only allowed on a replica set member”  
  处理：项目已自动降级；如需要强一致事务，必须部署副本集并开启事务

**本章动手实验**

```bash
# MongoDB 已启动后，启动项目观察控制台是否存在连接失败日志
pnpm dev
```

### 2.8 上传与静态资源映射（/uploads）

**业务场景**
- 后台上传封面图/资源，前台展示图片。

**关键点**
- 上传入口：`POST /api/upload`（见 server/api/upload.post.ts）
- 静态映射：Nitro routes 将 /uploads 映射到实际文件：见 [server/routes/uploads](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/routes/uploads)

**排查流程**
- 现象：上传成功但图片访问 404  
  排查：检查上传目录是否落盘；检查 /uploads 路由是否被代理拦截；检查服务器文件权限

**本章动手实验**

```bash
# 仅验证静态路由存在性（返回 200/304/404 取决于文件是否存在）
pnpm dev
curl -I http://localhost:3000/uploads/
```

---

## 3. 开发环境搭建指南

### 3.1 操作系统与基础依赖

**支持环境**
- Windows 10/11（本仓库当前环境）
- macOS / Linux（推荐用于生产一致性）

**必须安装**
- Node.js：建议 20 LTS（最低 18.17+）
- pnpm：建议 9+（与 Nuxt4 生态兼容）
- Git：2.4x+
- MongoDB：6.x/7.x（推荐 docker 运行）

### 3.2 依赖管理与常用命令

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build
pnpm preview
```

脚本来源：见 [package.json:L5-L12](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/package.json#L5-L12)

### 3.3 IDE 与插件（VS Code）

建议插件：
- Vue - Official（Volar）
- TypeScript Vue Plugin（如已由 Volar 处理可不额外安装）
- Tailwind CSS IntelliSense
- ESLint（若 CI 接入后启用）
- EditorConfig（可选）

### 3.4 本地容器化方案（推荐）

本项目最关键的外部依赖是 MongoDB。推荐使用 docker-compose（仅示例，可按组织标准落地到平台工具中）：

```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: plankbevelen-blog
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

### 3.5 环境变量模板（.env）

项目通过 `dotenv` 加载环境变量：见 [mongo.ts:L1-L9](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/server/utils/mongo.ts#L1-L9)

建议模板（在本地创建 `.env`，不要提交密钥）：

```bash
NODE_ENV=development

# Nuxt runtimeConfig（Server）
NUXT_AUTH_SECRET=change-me-in-dev
NUXT_MONGO_URI=mongodb://127.0.0.1:27017
NUXT_MONGO_DB=plankbevelen-blog
NUXT_MONGO_MAX_POOL_SIZE=10

# Nuxt runtimeConfig（Public）
NUXT_BASE_URL=/
NUXT_PUBLIC_COOKIE_PREFIX=
NUXT_EXPIRATION_TIME=432000
NUXT_KEEP_ALIVE_TIME=432000
```

### 3.6 一键初始化脚本（示例）

PowerShell（Windows）：

```powershell
pnpm install
pnpm dev
```

Bash（macOS/Linux）：

```bash
pnpm install
pnpm dev
```

**本章动手实验（健康检查脚本）**

```bash
pnpm dev
node -e "fetch('http://localhost:3000/api/home.data').then(r=>{console.log(r.status);process.exit(r.ok?0:1)}).catch(e=>{console.error(e);process.exit(1)})"
```

---

## 4. 编码规范与最佳实践

### 4.1 命名风格

- Vue 组件：PascalCase（例如 `ArticleToc.vue`），文件名沿用现有风格
- API 文件：`server/api/<path>.<method>.ts`（例如 `home.data.get.ts`）
- 变量/函数：camelCase；类型/接口：PascalCase；常量：UPPER_SNAKE_CASE

### 4.2 目录结构约定（关键）

- `app/`：前端源码（pages/layouts/components/composables/stores/services/utils/types）
- `server/`：后端 API、middleware、plugins、utils、routes、scripts
- `public/`：静态文件直出

目录参考：见项目根目录结构（本仓库）。

### 4.3 样式规范（Tailwind + Less）

以 Token 为中心：
- 颜色：只用语义色（来自 CSS Variables）：见 [tailwind.config.ts:L7-L26](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts#L7-L26)
- 间距：优先 `header/page/gap` 等 Token：见 [tailwind.config.ts:L27-L31](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts#L27-L31)
- 字号：优先 `text-body/text-title/text-h1`：见 [tailwind.config.ts:L32-L39](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/tailwind.config.ts#L32-L39)

class 顺序（统一可读性）：
1) 布局 2) 尺寸 3) 间距 4) 排版 5) 颜色 6) 视觉 7) 状态 8) 响应式

### 4.4 日志格式（建议规范）

目标：可检索、可聚合、可脱敏。

建议统一输出结构化 JSON（避免多行堆栈污染）：

```ts
console.log(JSON.stringify({
  level: 'info',
  ts: new Date().toISOString(),
  event: 'api_request',
  path: '/api/home.data',
  requestId: '...'
}))
```

禁止日志输出：
- 明文 token、密码、Cookie、上传的敏感内容、完整用户隐私数据

### 4.5 异常处理策略

- API handler 内：对可预期错误设置 HTTP 状态码与统一错误码
- 统一错误码建议：`UNAUTHORIZED/INVALID_TOKEN/VALIDATION_ERROR/DB_ERROR/INTERNAL_ERROR`
- 对数据库错误：不回传底层错误信息（仅返回短错误码 + requestId）

### 4.6 单元测试与覆盖率要求（≥80%）

质量门禁要求（CI 强制）：
- 单元测试覆盖率（lines/branches/functions/statements）均 ≥ 80%
- Type check 必须通过
- 安全扫描必须通过（高危/严重漏洞为 0）

测试框架建议（与 Nuxt/Vue 常用生态一致）：
- Vitest + @vitest/coverage-v8
- Playwright（可选，用于 e2e/集成测试）

### 4.7 Code Review Checklist（合并前必须过）

- 功能：需求覆盖完整；边界条件明确；UI/交互符合既有风格
- SSR：页面主要内容可 SSR 输出；避免仅浏览器 API 直用
- Tailwind：无硬编码颜色；尽量使用 Token；不引入重复/冲突样式
- API：错误码/状态码一致；不泄露敏感信息；参数校验齐全
- DB：查询条件命中索引；避免深分页；避免全表扫描
- 安全：无密钥入库；依赖未新增高危漏洞；鉴权路径无绕过
- 测试：新增/改动逻辑有测试；覆盖率 ≥80%；回归脚本可运行

**本章动手实验（建议的最小回归脚本）**

```bash
pnpm build
pnpm preview
node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

---

## 5. CI/CD 技能说明

本仓库可按组织规范落地到 GitHub Actions / GitLab CI / Jenkins。下述以“通用流水线阶段”描述，且给出可直接复用的脚本与质量门禁建议。

### 5.1 流水线阶段与门禁阈值

| 阶段 | 目标 | 推荐脚本/命令 | 质量门禁（示例） |
|---|---|---|---|
| 静态扫描 | 代码风格/类型一致性 | `pnpm lint`、`pnpm typecheck` | 0 error |
| 单元测试 | 逻辑正确性 | `pnpm test:unit -- --coverage` | 覆盖率 ≥80% |
| 集成测试 | API/页面联动 | `pnpm test:integration` | 关键用例 100% 通过 |
| 安全扫描 | 依赖与代码漏洞 | `pnpm audit`、SAST/DAST | 高危=0，严重=0 |
| 构建 | 生成产物 | `pnpm build` | 构建成功；产物可启动 |
| 部署 | 产物上线 | rsync/容器发布/平台发布 | 健康检查通过 |
| 回滚 | 快速恢复 | 版本化产物/镜像回滚 | 回滚后健康检查通过 |

说明：当前仓库脚本仅包含 `dev/build/preview/generate`（见 [package.json:L5-L12](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/package.json#L5-L12)）。如需 CI 门禁，建议补齐 `lint/typecheck/test:*` 等脚本并在流水线中启用。

### 5.2 参考流水线（GitHub Actions 示例）

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: node -e "console.log('artifact ready')"
```

### 5.3 部署与回滚策略（PM2 形态）

部署建议流程：
1) 上传 `.output/` 到目标机版本化目录（如 `/var/www/plankbevelen-blog/releases/<version>`）
2) 软链切换 `current` → 新版本目录
3) `pm2 reload ecosystem.config.cjs --update-env`

回滚策略：
- 保留最近 N 个 release
- 回滚时只需将 `current` 指向上一版本并 reload

PM2 配置参考：见 [ecosystem.config.cjs:L1-L20](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/ecosystem.config.cjs#L1-L20)

**本章动手实验（本地模拟发布检查）**

```bash
pnpm build
pnpm preview
node -e "fetch('http://localhost:3000/api/home.data').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

---

## 6. 监控与可观测性

本项目建议接入 Metrics / Tracing / Logging 三件套，并对关键用户路径定义 SLI/SLO。

### 6.1 必接入方案（推荐组合）

- Metrics：Prometheus（抓取）+ Grafana（展示）
- Tracing：OpenTelemetry（SDK/Collector）+ Tempo/Jaeger（存储/查询）
- Logging：Loki/ELK（采集/检索）+ 结构化日志（JSON）

### 6.2 核心 SLI/SLO（示例）

| 维度 | SLI | SLO（建议） |
|---|---|---|
| 可用性 | `2xx/3xx` 比例 | ≥ 99.9%（30 天） |
| 延迟 | 首页 `GET /` p95 | ≤ 800ms |
| API 延迟 | `GET /api/home.data` p95 | ≤ 300ms |
| 错误率 | `5xx` 比例 | ≤ 0.1% |
| 资源 | Node 进程内存 | ≤ 70% limit（触发预警） |

### 6.3 告警规则示例（Prometheus Rule）

```yaml
groups:
  - name: plankbevelen-blog
    rules:
      - alert: ApiErrorRateHigh
        expr: sum(rate(http_requests_total{job="plankbevelen-blog",status=~"5.."}[5m])) / sum(rate(http_requests_total{job="plankbevelen-blog"}[5m])) > 0.01
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "API 5xx 错误率过高"
```

### 6.4 Dashboard 模板导入步骤（Grafana）

1) Grafana → Dashboards → New → Import  
2) 粘贴 JSON 模板（组织内统一模板或项目自维护模板）  
3) 选择 Prometheus 数据源  
4) 校验核心面板：请求量、错误率、p95 延迟、Node 内存/CPU、Mongo 连接池指标  

**本章动手实验（本地可观测性最小验证）**

```bash
# 通过简单压测观察 p95（示例，需安装 hey 或 wrk；没有则跳过）
# hey -n 200 -c 20 http://localhost:3000/api/home.data
```

---

## 7. 安全技能要求

### 7.1 依赖漏洞扫描

- 必须在 CI 中执行依赖扫描（示例：`pnpm audit --prod`）
- 质量门禁：高危=0、严重=0（可按组织标准调整）

### 7.2 密钥管理

- 任何密钥仅允许通过环境变量/密钥管理服务注入
- 禁止提交 `.env`、证书私钥、访问令牌
- `NUXT_AUTH_SECRET` 必须在生产环境强制设置，不允许默认值

代码参考：runtimeConfig 默认值见 [nuxt.config.ts:L60-L62](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L60-L62)

### 7.3 OAuth2/JWT 集成要点

当前项目采用 JWT header token（后台 API）。如需要对接 OAuth2：
- 使用 OAuth2 Provider 完成登录后，签发内部 JWT（sub=用户名/用户ID）
- JWT 校验放在 server middleware，避免每个 API 重复逻辑
- JWT 过期策略与 refresh 策略需要配套（短 access + 可控 refresh）

### 7.4 CSP（Content Security Policy）

建议开启 CSP 并按第三方脚本最小放行：
- `default-src 'self'`
- 图片/CDN 需明确域名白名单
- 管理后台富文本/编辑器需特别审查 `script-src` 与 `style-src`

### 7.5 SAST/DAST 扫描

- SAST：Semgrep/SonarQube（按组织标准）
- DAST：OWASP ZAP（对预发布环境进行扫描）
- 门禁：Critical/High 为 0

### 7.6 数据脱敏与合规审计

- 日志脱敏：token、Cookie、上传内容、用户隐私字段
- 审计留痕：对后台写操作（发布/删除/修改）记录操作者、时间、目标对象、requestId

**本章动手实验（本地安全自检）**

```bash
# 检查仓库是否意外存在 .env
node -e "const fs=require('fs'); console.log(fs.existsSync('.env') ? 'WARN: .env exists (do not commit)' : 'OK: no .env');"
```

---

## 8. 故障应急手册

### 8.1 应急原则

- 先止损：降低影响面（降级/限流/回滚/关闭写入口）
- 再定位：基于日志/指标/追踪三方一致性定位根因
- 最后修复：补测试与复盘，形成可重复的预防措施

### 8.2 Top10 典型故障场景

1) **MongoDB 连接失败**
- 现象：接口普遍 500 或启动后不断重试连接
- 根因：URI/鉴权错误、网络不可达、Mongo 未启动
- 定位命令：`mongosh <uri>`、查看应用日志关键字 “MongoDB 连接初始化失败”
- 临时止损：切换到备用 Mongo；对写接口返回维护态
- 永久修复：完善连接超时/重试策略；部署副本集；监控连接池与错误率

2) **后台接口 401 大面积出现**
- 现象：管理端所有接口提示未登录
- 根因：token header 丢失（代理/Nginx 配置）、authSecret 变更导致旧 token 失效
- 定位命令：抓包检查请求头是否有 `token`；核对环境变量 `NUXT_AUTH_SECRET`
- 临时止损：提示重新登录；恢复旧 secret（谨慎）
- 永久修复：统一网关转发 header；明确 secret 轮换流程

3) **图片无法加载或 404**
- 现象：/uploads 或 @nuxt/image 输出失败
- 根因：文件权限、路径映射错误、ipx 域名白名单不含目标域
- 定位命令：`curl -I <url>`；检查 [nuxt.config.ts:L124-L143](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/nuxt.config.ts#L124-L143) 的 `domains`
- 临时止损：回退至静态原图直链；扩大白名单（仅临时）
- 永久修复：统一上传落盘目录；权限与生命周期管理

4) **构建失败（sharp 安装/编译问题）**
- 现象：install/build 阶段报 sharp 相关二进制错误
- 根因：平台架构不匹配、缺少构建依赖、pnpm 架构限制
- 定位命令：重装依赖 `pnpm install --force`；核对 `pnpm.supportedArchitectures`
- 临时止损：固定构建镜像与 Node 版本；使用预编译二进制环境
- 永久修复：CI 统一基础镜像；锁定 Node/pnpm 版本

5) **首页/文章页 SSR 变慢**
- 现象：TTFB 增大，p95 上升
- 根因：DB 查询未命中索引、首页聚合过多、冷启动
- 定位命令：Mongo explain（按组织方式）；指标/追踪定位慢点
- 临时止损：缓存热点接口；降低首页接口字段量
- 永久修复：新增/优化索引；拆分接口；接入缓存层

6) **内存持续上涨（疑似泄漏）**
- 现象：PM2 频繁重启或 OOM
- 根因：大对象缓存无上限、请求堆积、上传临时文件未清理
- 定位命令：PM2 监控、heap snapshot（生产需谨慎）
- 临时止损：降低并发、限制上传大小、开启 max_memory_restart
- 永久修复：加限流；修复缓存策略；完善临时文件清理策略

7) **后台编辑器加载慢/卡顿**
- 现象：进入编辑页白屏时间长
- 根因：md-editor 体积大，网络或 chunk 策略不佳
- 定位命令：构建分析、查看分包策略
- 临时止损：懒加载编辑器组件
- 永久修复：继续细化 manualChunks；按路由拆包

8) **sitemap 缺失或内容不全**
- 现象：搜索引擎收录下降
- 根因：sitemap-urls 接口异常、过滤条件错误
- 定位命令：请求 `/sitemap.xml` 与 `/api/sitemap-urls`
- 临时止损：回退到静态 sitemap（短期）
- 永久修复：为 sitemap 接口补测试与监控告警

9) **静态资源未压缩/缓存失效**
- 现象：带宽高、加载慢
- 根因：压缩未生效、CDN 缓存策略错误
- 定位命令：检查响应头 `content-encoding: gzip`；核对压缩配置
- 临时止损：开启 CDN gzip/brotli
- 永久修复：统一静态资源缓存策略与校验

10) **线上 502/连接被拒绝**
- 现象：网关报 502
- 根因：Node 进程挂掉、端口不一致、健康检查失败
- 定位命令：`pm2 status`、`pm2 logs`、端口探测
- 临时止损：回滚到上一版本；重启服务
- 永久修复：完善健康检查、自动回滚与容量规划

### 8.3 复盘模板（Postmortem）

```text
标题：
发生时间 / 发现时间 / 恢复时间：
影响范围（用户数/接口/页面）：
严重级别：
时间线（Timeline）：
根因（Root Cause）：
止损措施（Mitigation）：
永久修复（Fix）：
预防措施（Preventive Actions）：
回归验证（Tests/Checks）：
负责人 / 跟踪项：
```

---

## 9. 版本管理与发布策略

### 9.1 分支模型（推荐主干模式）

- `main`：随时可发布（受保护分支）
- `feature/*`：需求开发分支，完成后提 MR 合并到 main
- `hotfix/*`：线上紧急修复分支，从 main（或 tag）拉出，修复后合并回 main 并打 tag

### 9.2 语义化版本（SemVer）

- `MAJOR.MINOR.PATCH`
- MAJOR：不兼容变更
- MINOR：向后兼容的新功能
- PATCH：向后兼容的问题修复

### 9.3 Hotfix 流程

1) 从当前线上 tag 拉 `hotfix/<issue>`  
2) 最小改动修复 + 补测试  
3) MR → 技术委员会评审通过（100%）  
4) 打 tag：`vX.Y.Z`  
5) 走发布流水线 → 灰度 → 全量  

### 9.4 发布审批单模板

```text
版本号：
发布内容（变更摘要）：
影响评估（功能/性能/安全）：
回滚方案：
灰度策略（比例阶梯）：
验证清单（见 9.5）：
审批人（技术委员会）：
发布日期：
```

### 9.5 灰度比例阶梯与全量发布验证清单

灰度比例（示例）：1% → 5% → 20% → 50% → 100%

全量发布前验证清单：
- 首页/文章列表/文章详情可访问且 SSR 正常
- 后台登录与 CRUD 正常
- `/sitemap.xml` 与 `/robots.txt` 正常
- 关键 API（home.data/sidebar.data）错误率与 p95 正常
- 上传与图片访问正常
- 日志无异常洪峰（错误码聚合无异常）

---

## 10. 交付物与验收标准

### 10.1 文档与目录约束

- 本文档以 Markdown 形式存储于 `/docs/skill/README.md`（已满足）
- 合并请求需通过技术委员会评审：通过率 100%
- 评审通过后需归档到 Confluence（以组织空间为准）

### 10.2 每章配套动手实验与自动化测试脚本

原则：
- 每章至少提供 1 个“可复制执行”的实验命令块（本文已在各章末提供）
- 自动化验证优先使用 Node 内置 `fetch` 或简单 `curl`，避免引入额外依赖
- CI 中应固化为脚本步骤（例如 smoke check：`GET /api/home.data`、`GET /sitemap.xml`、受保护接口 401 校验）

建议的最小 Smoke Test（可直接复制到 CI step 执行）：

```bash
node -e "Promise.all([fetch('http://localhost:3000/api/home.data'),fetch('http://localhost:3000/sitemap.xml')]).then(rs=>{const ok=rs.every(r=>r.ok); if(!ok) process.exit(1)}).catch(()=>process.exit(1))"
```

### 10.3 新成员 1 个工作日达标标准（验收）

- 本地可启动：`pnpm install && pnpm dev` 成功，且 `/api/home.data` 返回 200
- 可构建预览：`pnpm build && pnpm preview` 成功
- 完成一次最小功能迭代：新增一个小的 UI/文案/API 优化，并通过 Smoke Test
- 提 MR：通过 Code Review Checklist；无密钥泄露；无明显性能回退

