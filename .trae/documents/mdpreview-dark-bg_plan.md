# MdPreview 暗黑背景修复计划

## 1. 问题描述（用户原话）
> `mdpreview在暗黑模式下，背景颜色等，没有按系统的暗黑模式来`

即：整站切换到暗黑（`html[theme="dark"]`）后，**MdPreview 组件渲染出来的 markdown 正文区域（背景 / 引用 / 代码块 / 表格 / 分隔线 / admonition 等）仍然是 md-editor-v3 默认的浅色配色（白底、浅灰分隔线、白色代码块背景等）**，与整站暗黑不一致，呈现「卡片周围黑、正文内容白」的三明治刺眼效果。

## 2. 现状调研结论（§0 根因诊断）

### 2.1 MdPreview 暗黑主题机制（md-editor-v3 源码真相）
从 `node_modules/md-editor-v3/lib/style.css` 提取关键选择器：

| 选择器前缀 | 作用 | 触发条件 |
|---|---|---|
| `.md-editor .md-editor-preview { --md-theme-bg-color:#fff; ... }` | **浅色** 全部主题变量（背景/文字/边框/代码/表格/引用…共 14+ 项） | 根容器有 `.md-editor` class（编辑器模式才有） |
| `.md-editor-dark .md-editor-preview { --md-theme-bg-color:#000; ... }` | **暗黑** 全部主题变量（背景纯黑/文字反色/边框深灰…） | 根容器同时有 `.md-editor-dark` class（组件 prop `theme="dark"` 时才在 MdEditor 根上挂） |
| `.md-editor-preview { color: var(--md-theme-color) }` | 正文文字颜色（消费上面的变量） | **无前提条件**，但只设置了 color，**没设置 background** |
| `.md-editor div.default-theme { --md-theme-quote-border... }` | default-theme 子主题变量 | 需有 `.md-editor` 前缀 |
| `.md-editor-dark div.default-theme { --md-theme-quote-bg-color... }` | default-theme 暗黑版 | 需同时有 `.md-editor-dark` + `.default-theme` |

**关键发现（根因 §0-A）**：md-editor-v3 把「所有暗黑主题 CSS 变量的声明选择器」全部写死成了必须带 `.md-editor` 或 `.md-editor-dark` **前置** —— 但 `MdPreview`（预览模式组件）的 DOM 结构里，**根节点只有 `.md-editor-preview` 而没有外层 `.md-editor` / `.md-editor-dark` 包裹**（这是 md-editor-v3 的设计：MdEditor 有外层，MdPreview 因为是纯预览所以省略了外层包装）。所以我们传 `:theme="currentTheme"` 这个 prop，**对于纯 MdPreview 组件是无效的** —— 它没有地方挂 `.md-editor-dark`，导致 style.css 里所有 `--md-theme-bg-color` 等暗黑变量一个都匹配不上。

### 2.2 项目现有 MdPreview 使用处（5 处，均为纯预览模式，无 MdEditor 外层）
| 文件 | 组件 | props | 外层是否有 .md-editor |
|---|---|---|---|
| [article/[id].vue:29-34](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/pages/article/[id].vue#L29-L34) | AsyncMdPreview | `:theme="currentTheme"` | ❌ 无（外层是 BaseCard .detailCard） |
| [notes/[id].vue:37-40](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/pages/notes/[id].vue#L37-L40) | AsyncMdPreview | `:theme="currentTheme"` | ❌ 无（外层是 BaseCard .content-card） |
| [PageIntro.vue:8](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/components/widget/PageIntro.vue#L8-L8) | AsyncMdPreview | `:theme="currentTheme" previewOnly` | ❌ 无（外层是 BaseCard .page-intro） |
| [AboutContent.vue:6](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/components/widget/AboutContent.vue#L6-L6) | AsyncMdPreview | `:theme="currentTheme"` | ❌ 无（外层是 BaseCard .about-content） |
| [ArticleDesc.vue:28-34](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/components/article/ArticleDesc.vue#L28-L34) | AsyncMdPreview | `:theme="currentTheme" previewOnly` | ❌ 无（外层是 .md-wrapper） |

**结论（根因 §0-B）**：5 处 MdPreview 全是「纯预览、无外层 .md-editor 容器」，所以 md-editor-v3 的 `.md-editor-dark` 暗黑 CSS 变量规则**完全不命中**。

### 2.3 项目现有对 MdPreview 的 CSS 覆盖（components.less）
从 [components.less:1-22](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/assets/css/components.less#L1-L22) 看，目前只覆盖了：
```less
.md-editor-preview {
    font-size: ...;
    content-visibility: auto;
    --md-theme-color: var(--text-color);   // ✅ 只有文字颜色被覆盖跟随主题
    > *:first-child margin-top; code {...};
}
```
**缺失的关键变量（根因 §0-C）**：只覆盖了 `--md-theme-color`（文字），但 **`--md-theme-bg-color`（背景）、`--md-theme-border-color`（分隔线 / 表格 / 引用边框）、`--md-theme-bg-color-inset`（引用背景 inset）、`--md-theme-code-block-bg-color`、`--md-theme-code-inline-bg-color`、`--md-theme-table-stripe-color`（斑马纹）** 这 6 大核心视觉变量，**一个都没覆盖**。所以暗黑切换后：
- 背景：没设 → 透明 → 看到 BaseCard 的 `--card-color` 暗黑底色（这步是偶对，不是显式适配）
- 文字：已覆盖 → 正常变黑/白 ✅
- 分隔线 hr / 表格 th-td / blockquote 边框：默认浅色 `--md-theme-border-color:#e6e6e6` → 暗黑下也是白边框 ❌
- 行内 code 背景：默认浅色 `rgba(59,170,250,.1)` → 暗黑下亮白条 ❌
- 代码块 pre 背景 `--md-theme-code-block-bg-color`：默认 `#282c34`（编辑器是深色，预览默认是继承的，但 default-theme 下... 读 style.css 第 153 行「`.md-editor div.default-theme blockquote { --md-theme-quote-bg-color: var(--md-theme-bg-color-inset) }`」→ 没有 md-editor 外层 所以也不命中）
- 表格斑马纹 `--md-theme-table-stripe-color`：默认 `#fafafa` 白 → 暗黑下仍然白 ❌
- admonition （note/tip/warning 等 16 种）的 `--md-admonition-*`：默认浅色白背景黑字 → 暗黑下刺目 ❌

### 2.4 theme.less 已定义的主题 token（复用目标）
[theme.less:1-55](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/assets/css/theme.less#L1-L55) 浅色 + [theme.less:57-111](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/assets/css/theme.less#L57-L111) 暗黑已经定义了完整的全站 Design Tokens：

| 语义 token | 浅色值 | 暗黑值 | 对应 md-editor 变量 |
|---|---|---|---|
| `--text-color` | #212529 | #f8f9fa | `--md-theme-color`（已覆盖 ✅） |
| `--border-color` | #dee2e6 | #343a40 | `--md-theme-border-color` / `*-inset` / `*-reverse` |
| `--mute-bg-color` | rgba(108,117,125,0.1) | rgba(173,181,189,0.1) | `--md-theme-bg-color-inset`（引用背景 inset） |
| `--card-color` | #fff | #1b1d1e | `--md-theme-bg-color`（正文背景） |
| `--primary-color` | #0069d9 | #61a8ff | `--md-theme-link-color`（md 默认是 #2d8cf0，蓝色系接近，可以保留或换成 primary） |
| `--mute-color` | #6c757d | #adb5bd | `--md-theme-quote-color` |

**所以不需要新造色值**，直接把 theme.less 定义好的 CSS var 绑定到 md-editor 的主题变量上即可。

## 3. 修改方案（职责清晰：只改 components.less —— 这是「跨组件共享样式」文件的职责）

### 3.1 决策：为什么选「全局 CSS 变量覆盖」而不选其他方案
对比 3 种可能：

| 方案 | 优点 | 缺点 | 是否采纳 |
|---|---|---|---|
| **A. 在 5 个 MdPreview 外层各手动包一个 `<div class="md-editor" :class="{'md-editor-dark': currentTheme==='dark'}">`** | 完全复用 md-editor-v3 自带暗黑变量，不用写额外 CSS | (1) 需改 5 个 Vue 文件；(2) 未来加页面又忘包；(3) `.md-editor` class 上可能带编辑器模式专属样式（高度/布局等冲突） | ❌ 不选 |
| B. 封装 `<BaseMdPreview>` 组件，在内部统一包外层 + 加样式 | 集中一处，后续好维护 | (1) 需改 5 处使用点替换；(2) 现在已有 5 处各自 AsyncMdPreview 动态 import loader（缓存 key 不同），封装成本较高；(3) 用户反馈只是「mdpreview 背景没按暗黑来」，小题大做 | ❌ 不选 |
| **C. 在 components.less 中，对 `.md-editor-preview` 直接声明完整的 md 主题变量（浅色 + `html[theme="dark"]` 暗黑两套），全部绑定到 theme.less 的 tokens** | (1) 改 1 个文件，一次覆盖所有 5 处；(2) 复用已有 tokens，色彩体系与全站 100% 一致；(3) 不需要改 Vue 结构；(4) 完全符合 components.less「放跨组件共享样式」的职责（上一轮拆分时就定位的 md-editor-preview 专用 home） | 需一次性手动映射 14 个 md 变量 → 全站 tokens（一次性工作） | ✅ **采纳** |

### 3.2 变量映射表（核心交付内容）
将在 [components.less](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/assets/css/components.less) 的现有 `.md-editor-preview { ... }` 块内**追加**（不删原有 font-size / content-visibility / code 等已验证无问题的规则，纯追加）：

```less
.md-editor-preview {
    /* ↓ 原有 22 行不动，追加： */

    /* 通用 — 全站语义 token 绑定（这 8 个在浅色/暗黑下通过 var 自动切换） */
    --md-theme-color: var(--text-color);                 /* 正文文字（覆盖原来已有的，显式声明位置保持一致） */
    --md-theme-bg-color: var(--card-color);              /* 正文背景 — 跟随卡片底色（解决用户投诉核心） */
    --md-theme-border-color: var(--border-color);        /* hr / table td / 默认边框 */
    --md-theme-border-color-inset: var(--border-color);  /* 内嵌边框（blockquote 表格等） */
    --md-theme-border-color-reverse: var(--border-color);/* 反色边框（某些 admonition） */
    --md-theme-link-color: var(--primary-color);         /* 链接色跟随主色 */
    --md-theme-link-hover-color: var(--primary-hover-color); /* 链接 hover 跟随主色 hover */
    --md-theme-bg-color-inset: var(--mute-bg-color);     /* 引用/内嵌元素 inset 背景 */

    /* 专用 — 浅色默认（md-editor-v3 style.css 默认的浅色合理值，仅显式钉住避免 fallback） */
    --md-theme-code-inline-color: #3594f7;               /* 行内 code 蓝（和原 md-editor 一致，视觉好看） */
    --md-theme-code-inline-bg-color: rgba(59,170,250,.1);/* 行内 code 浅蓝底 */
    --md-theme-code-block-color: #a9b7c6;                /* 代码块语法高亮文字色（默认 Monokai 经典浅灰蓝，黑底白字里好看） */
    --md-theme-code-block-bg-color: #282c34;             /* 代码块底色（Monokai 经典深海军蓝 —— 浅/暗通用都好看） */
    --md-theme-code-before-bg-color: var(--md-theme-code-block-bg-color); /* 代码块 head（mac 三色点区域）跟随块底色 */
    --md-theme-code-copy-tips-color: var(--md-theme-color);
    --md-theme-code-copy-tips-bg-color: var(--md-theme-bg-color);
    --md-theme-code-active-color: var(--primary-color);  /* tab 激活色跟随主色 */
    --md-theme-heading-color: var(--text-color);         /* 所有标题默认继承正文色（视觉上标题已经有 h1-h6 字号/字重区分，够了） */
    --md-theme-quote-color: var(--secondary-color);      /* 引用文字色用次文本色（柔和） */
    --md-theme-quote-border: 4px solid var(--primary-color); /* 引用左边框用主色粗线（与 default-theme 风格一致） */
    --md-theme-quote-bg-color: var(--mute-bg-color);     /* 引用背景色用柔和内嵌 */
    --md-theme-table-stripe-color: var(--mute-bg-color); /* 表格斑马纹内嵌柔和色 */
    --md-theme-table-td-border-color: var(--border-color);
    --md-theme-table-tr-bg-color: inherit;

    /* 新增 — 组件显式声明背景色（原来 md-editor-preview 只有 color 没 background，透明会「漏」出父卡片的底色 —— 用户投诉的「背景没按暗黑」视觉上是 hr/code 还是亮白，但显式钉住 bg 是双保险） */
    background-color: var(--md-theme-bg-color);
    color: var(--md-theme-color);
}
```

**再追加暗黑下的专用覆盖块（写在上面通用块后面，相同变量暗黑覆盖）**：
```less
/* 暗黑下的 md-editor 变量精确适配（html 属性切换） */
html[theme="dark"] .md-editor-preview {
    /* 大部分已经通过上面的 var(--text-color) / var(--card-color) 等自动跟随暗黑了；
       这里只写「浅色默认值不够暗黑、不能通过 token 自动覆盖」的专用值：
       = 代码块 + code-inline 的暗黑配色（比浅色更护眼） */
    --md-theme-code-inline-color: #61a8ff;               /* 暗黑下行内 code 蓝更亮 */
    --md-theme-code-inline-bg-color: rgba(97,168,255,.15); /* 暗黑下行内 code 蓝底稍深，对比度 AAA */
    --md-theme-code-block-bg-color: #1a1d21;             /* 暗黑代码块底色（比 Monokai #282c34 更暗，和整站 --card-color #1b1d1e 接近 1px 视觉融合） */
    --md-theme-code-before-bg-color: var(--md-theme-code-block-bg-color);
}
```

**最后 — admonition 16 种提示块（原 style.css 里 .md-editor / .md-editor-dark 前缀 + .md-editor-admonition-note/tip/... 共 16 种浅色 + 16 种暗黑 = 32 条规则），同理用相同策略在 components.less 钉住**：
```less
/* admonition — 浅色（直接复用 md-editor-v3 的标准值，前缀去掉 .md-editor，直接钉在 .md-editor-preview 下） */
.md-editor-preview .md-editor-admonition-note { --md-admonition-color:#212121; --md-admonition-bg-color:#FFFFFF; --md-admonition-border-color:rgb(166.2,166.2,166.2); }
.md-editor-preview .md-editor-admonition-tip  { --md-admonition-color:#616161; --md-admonition-bg-color:#F5F5F5; --md-admonition-border-color:rgb(185.8,185.8,185.8); }
.md-editor-preview .md-editor-admonition-info { --md-admonition-color:#424242; --md-admonition-bg-color:#F0F0F0; --md-admonition-border-color:rgb(170.4,170.4,170.4); }
.md-editor-preview .md-editor-admonition-quote{ --md-admonition-color:#455a64; --md-admonition-bg-color:#eceff1; --md-admonition-border-color:rgb(169.2,179.4,184.6); }
.md-editor-preview .md-editor-admonition-abstract { --md-admonition-color:#0288d1; --md-admonition-bg-color:#e1f5fe; --md-admonition-border-color:rgb(135.8,201.4,236); }
.md-editor-preview .md-editor-admonition-attention{ --md-admonition-color:#1e88e5; --md-admonition-bg-color:#e3f2fd; --md-admonition-border-color:rgb(148.2,199.6,243.4); }
.md-editor-preview .md-editor-admonition-example  { --md-admonition-color:#5e35b1; --md-admonition-bg-color:#ede7f6; --md-admonition-border-color:rgb(179.8,159.8,218.4); }
.md-editor-preview .md-editor-admonition-hint     { --md-admonition-color:#00897B; --md-admonition-bg-color:#E0F2F1; --md-admonition-border-color:rgb(134.4,200,193.8); }
.md-editor-preview .md-editor-admonition-success  { --md-admonition-color:#388e3c; --md-admonition-bg-color:#e8f5e9; --md-admonition-border-color:rgb(161.6,203.8,163.8); }
.md-editor-preview .md-editor-admonition-question { --md-admonition-color:#f9a825; --md-admonition-bg-color:#fffde7; --md-admonition-border-color:rgb(252.6,219,153.4); }
.md-editor-preview .md-editor-admonition-caution  { --md-admonition-color:#fb8c00; --md-admonition-bg-color:#fff8e1; --md-admonition-border-color:rgb(253.4,204.8,135); }
.md-editor-preview .md-editor-admonition-warning  { --md-admonition-color:#f57c00; --md-admonition-bg-color:#fff3e0; --md-admonition-border-color:rgb(251,195.4,134.4); }
.md-editor-preview .md-editor-admonition-danger   { --md-admonition-color:#d84315; --md-admonition-bg-color:#ffebee; --md-admonition-border-color:rgb(239.4,167.8,151.2); }
.md-editor-preview .md-editor-admonition-failure  { --md-admonition-color:#d32f2f; --md-admonition-bg-color:#fee2e6; --md-admonition-border-color:rgb(236.8,154.4,156.8); }
.md-editor-preview .md-editor-admonition-bug      { --md-admonition-color:#c31a1a; --md-admonition-bg-color:#fddadd; --md-admonition-border-color:rgb(229.8,141.2,143); }
.md-editor-preview .md-editor-admonition-error    { --md-admonition-color:#b71c1c; --md-admonition-bg-color:#fdd2d6; --md-admonition-border-color:rgb(225,137.2,139.6); }

/* admonition — 暗黑（html[theme="dark"] 精确覆盖，同上 16 种） */
html[theme="dark"] .md-editor-preview .md-editor-admonition-note { --md-admonition-color:#E0E0E0; --md-admonition-bg-color:#1E1E1E; --md-admonition-border-color:rgb(107.6,107.6,107.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-tip  { --md-admonition-color:#B0B0B0; --md-admonition-bg-color:#262626; --md-admonition-border-color:rgb(93.2,93.2,93.2); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-info { --md-admonition-color:#B3B3B3; --md-admonition-bg-color:#2B2B2B; --md-admonition-border-color:rgb(97.4,97.4,97.4); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-quote{ --md-admonition-color:#b0bec5; --md-admonition-bg-color:#263238; --md-admonition-border-color:rgb(93.2,106,112.4); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-abstract { --md-admonition-color:#81d4fa; --md-admonition-bg-color:#012f45; --md-admonition-border-color:rgb(52.2,113,141.4); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-attention{ --md-admonition-color:#64b5f6; --md-admonition-bg-color:#102a4c; --md-admonition-border-color:rgb(49.6,97.6,144); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-example  { --md-admonition-color:#9575cd; --md-admonition-bg-color:#271b52; --md-admonition-border-color:rgb(83,63,131.2); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-hint     { --md-admonition-color:#4DB6AC; --md-admonition-bg-color:#003D3A; --md-admonition-border-color:rgb(30.8,109.4,103.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-success  { --md-admonition-color:#81c784; --md-admonition-bg-color:#1b5e20; --md-admonition-border-color:rgb(67.8,136,72); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-question { --md-admonition-color:#ffd54f; --md-admonition-bg-color:#3e2f00; --md-admonition-border-color:rgb(139.2,113.4,31.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-caution  { --md-admonition-color:#ffcc80; --md-admonition-bg-color:#3e2600; --md-admonition-border-color:rgb(139.2,104.4,51.2); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-warning  { --md-admonition-color:#ffb74d; --md-admonition-bg-color:#3d2600; --md-admonition-border-color:rgb(138.6,96,30.8); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-danger   { --md-admonition-color:#ef9a9a; --md-admonition-bg-color:#3c0000; --md-admonition-border-color:rgb(131.6,61.6,61.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-failure  { --md-admonition-color:#ef9a9a; --md-admonition-bg-color:#3c0900; --md-admonition-border-color:rgb(131.6,67,61.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-bug      { --md-admonition-color:#e68381; --md-admonition-bg-color:#300000; --md-admonition-border-color:rgb(120.8,52.4,51.6); }
html[theme="dark"] .md-editor-preview .md-editor-admonition-error    { --md-admonition-color:#ef5350; --md-admonition-bg-color:#300000; --md-admonition-border-color:rgb(124.4,33.2,32); }
```

**最后 — default-theme 的子主题补充（原来选择器 `.md-editor div.default-theme`，同样去掉前缀直接钉在 `.md-editor-preview` 上）**：
```less
.md-editor-preview div.default-theme {
    --md-theme-quote-border: 5px solid var(--primary-color);
    --md-theme-quote-bg-color: var(--mute-bg-color);
}
html[theme="dark"] .md-editor-preview div.default-theme {
    /* 暗黑下 default-theme quote border 已通过 var(--primary-color) 自动蓝→浅蓝；bg 自动 → mute-bg-color 暗黑版 rgba(173,181,189,.1)，无需另写 */
}
```

### 3.3 是否保留 Vue 里 `:theme="currentTheme"` prop？
**保留，但不作为依赖（纯向下兼容）**。因为：
1. 现在已经用 CSS 变量覆盖做了真正的暗黑适配，不依赖 prop 了；
2. 即使未来升级 md-editor-v3，某版本让 MdPreview 也会在外层挂 `.md-editor-dark`（比如修复了这个 issue），那 prop 继续传也不会有坏处。

## 4. 影响范围 & 验收标准

### 4.1 文件改动清单
| 文件 | 改动类型 | 说明 |
|---|---|---|
| [app/assets/css/components.less](file:///c:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/app/assets/css/components.less) | **追加**规则（无删除无覆盖原有 22 行） | 追加 3 大段：① `.md-editor-preview` 通用变量绑定（8 通用 + 12 专用显式 + `background-color` 新声明）；② `html[theme="dark"] .md-editor-preview` 暗黑专用 code 配色（4 变量）；③ 16×2 admonition 浅 + 暗黑变量（32 条规则）；④ default-theme quote 绑定（浅/暗） |
| 其他 5 个 Vue 文件（article/[id].vue / notes/[id].vue / PageIntro / AboutContent / ArticleDesc） | **不动** | 不需要改模板、不需要改 script（`:theme="currentTheme"` 保留） |

### 4.2 验收视觉矩阵（用户核认清单，代码层全部覆盖）
在 dev 模式下，先点「暗黑模式」按钮切换到 `html[theme="dark"]`，然后依次打开 5 个页面，肉眼核认：

| # | 页面/组件 | 核认项（暗黑下） |
|---|---|---|
| 1 | 文章详情 `/article/xxx` | ✅ 正文背景 ≈ #1b1d1e（不白）；✅ h1-h6 / 正文文字 ≈ #f8f9fa；✅ hr 不亮白；✅ 表格斑马纹不白；✅ blockquote 左边框蓝 + 背景浅内嵌；✅ 行内 code 蓝+浅蓝底不刺眼；✅ 代码块背景 ≈ #1a1d21；✅ 链接 ≈ #61a8ff |
| 2 | 笔记详情 `/notes/xxx` | 同上 8 条 |
| 3 | ArticleDesc（首页/列表文章卡片） | 同上（尤其展开全文后 code / table / hr） |
| 4 | 分类页 PageIntro（如果有 md 内容） | 同上 |
| 5 | 关于页 AboutContent（如果有 md 内容） | 同上 |
| 6 | admonition（如果文章里有 `:::note / :::tip / :::warning` 等） | ✅ 浅 → 深切换后背景/边框/文字都变深不刺眼 |
| 7 | 切回浅色模式 | ✅ 全部恢复「白底+黑字+蓝链接+浅斑马」，无视觉回归（= 和原来一样，因为新增规则在浅色下全部绑定到原 theme.less 浅色 tokens） |

### 4.3 代码层验收（自动化）
- [ ] `pnpm.cmd build` exit 0，client + server 构建成功；
- [ ] `GetDiagnostics` 返回空数组（0 error / 0 warning 都可）；
- [ ] Grep 项目确保「没有在 components.less 之外出现新的 md-editor 全局适配文件」（职责单一）。

## 5. 风险 & 回滚
- **风险1：新增选择器特异性与 md-editor-v3 style.css 的默认规则冲突** → 不冲突。因为选择器都是 `.md-editor-preview {...}` + `html[theme="dark"] .md-editor-preview ...`，特异性（0,1,0 / 0,2,0）比 style.css 里写死的 `.md-editor .md-editor-preview`（0,2,0 持平，后加载的优先，而 nuxt.config 中 components.less 在 css 数组**最末尾**加载 → 肯定后加载，所以 components.less 的新规则一定优先生效）。
- **风险2：代码块底色浅色也改成更黑的 Monokai，老用户不喜欢？** → 不会。原来浅色下代码块底色本来就是 style.css `.md-editor .md-editor-preview` 的 `#282c34`（深色），跟现在方案里的默认值一致；只是暗黑下改成了更暗的 `#1a1d21`（贴合整站 #1b1d1e 卡片色），正向提升。
- **风险3：行内 code 暗黑改成蓝色系，原来浅色下的 code-inline 白+蓝不变？** → 不变。原来的 `#3594f7 + rgba(59,170,250,.1)` 已作为默认值写在通用块里，暗黑下才被覆盖。
- **回滚方案**：如果用户实测后说某一部分不想这么配，直接把 components.less 新增的那段里对应变量行删掉即可，不牵一发动全身（因为所有新规则都集中在 components.less 一个文件，且都是显式追加的，没有删除老规则）。
