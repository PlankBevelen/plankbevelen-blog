# 前端知识 - CSS

## 基本语法

略过

## 选择器

1. 基础选择器

| 选择器 | 示例 | 说明 |
| --- | --- | --- |
| 元素选择器 | `div` | 选择所有 `<div>` 元素 |
| 类选择器 | `.class` | 选择所有带有 `class` 属性的元素 |
| ID选择器 | `#id` | 选择带有 `id` 属性的元素 |
| 通配符选择器 | `*` | 选择所有元素 |

2. 组合选择器

| 选择器 | 示例 | 说明 |
| --- | --- | --- |
| 后代选择器 | `div span` | 选择 `<div>` 元素的所有后代 `<span>` 元素 |
| 子元素选择器 | `div > span` | 选择 `<div>` 元素的直接子元素 `<span>` |
| 相邻兄弟选择器 | `div + span` | 选择 `<div>` 元素的下一个兄弟 `<span>` 元素 |
| 通用兄弟选择器 | `div ~ span` | 选择 `<div>` 元素的所有兄弟 `<span>` 元素 |

3. 属性选择器
   
| 选择器 | 示例 | 说明 |
| --- | --- | --- |
| 存在属性 | `[attr]` | 选择具有 `attr` 属性的元素 |
| 存在且值等于某值 | `[attr=value]` | 选择具有 `attr` 属性且值为 `value` 的元素 |
| 存在且值包含某值 | `[attr~=value]` | 选择具有 `attr` 属性且值包含 `value` 的元素 |
| 存在且值包含某值 | `[attr~=value]` | 选择具有 `attr` 属性且值包含 `value` 的元素 |
| 存在且值以某值开头 | `[attr^=value]` | 选择具有 `attr` 属性且值以 `value` 开头的元素 |
| 存在且值以某值结尾 | `[attr$=value]` | 选择具有 `attr` 属性且值以 `value` 结尾的元素 |
| 存在且值以某值包含 | `[attr*=value]` | 选择具有 `attr` 属性且值包含 `value` 的元素 |

4. 伪类与伪元素 

| 选择器 | 示例 | 说明 |
| --- | --- | --- |
| 伪类 | `:link` | 选择所有未被访问的链接 |
| 伪元素 | `::before` | 在元素前插入内容 |
| 伪类与伪元素 | `a:hover::before` | 鼠标悬停在 `<a>` 元素上时，在其前插入内容 |

5. 优先级

从权重高到权重低：

1. 内联样式（1000）
2. ID选择器（100）
3. 类选择器、属性选择器、伪类（10）
4. 元素选择器、伪元素（1）
5. 通配符选择器（0）

当然如果存在冲突，则以最后出现的样式为准

## 盒模型

盒模型 = margin + border + padding + content

1. 标准盒模型（W3C盒模型）

```css
.standard-box {
  box-sizing: content-box; /* 默认值 */
  width: 100px;
}
```

总宽度 = content(100px) + padding + border + margin

2. 怪异盒模型（IE盒模型）

```css
.ie-box {
  box-sizing: border-box;
  width: 100px;
}
```
总宽度(100px) = content + padding + border + margin

## 布局

### display

| display 值 | 说明 |
| --- | --- |
| inline | 行内，不独占一行，和其他inline元素一行，高度和宽度由内容撑开 *（无法设置宽高）* |
| block | 块级，独占一行，默认宽度=父级宽度，高度默认由内容撑开 |
| inline-block | 行内块，既可以设置宽高，又可以和其他inline元素一行，高度和宽度由内容撑开 |
| flex | 弹性盒子，可以设置宽高，子元素会自动调整大小，高度和宽度由内容撑开 |
| inline-flex | 行内弹性盒子，可以设置宽高，子元素会自动调整大小，高度和宽度由内容撑开 |
| grid | 网格布局，可以设置宽高，可设置几列几行，高度和宽度由内容撑开 |
| none | 不显示，隐藏元素，不占位置，直接不参与渲染树构建 |

#### flex

| 属性 | 说明 |
| --- | --- |
| flex-direction | 主轴方向，row（默认）或 column |
| flex-wrap | 子元素超出宽度是否换行，nowrap（默认）或 wrap |
| justify-content | 主轴对齐方式，flex-start（默认），flex-end，center，space-between，space-around |
| align-items | 交叉轴对齐方式，flex-start，flex-end，center，baseline，stretch（默认） |

基本的三个属性：

flex-shrink：子元素的缩放比例，默认值为1，即子元素的宽度不缩放；

flex-grow：子元素的伸缩比例，默认值为0，即子元素的宽度不伸缩；

flex-basis：子元素的初始宽度，默认值为auto，即子元素的宽度由内容撑开；

flex: 1 => flex-grow: 1, flex-shrink: 1, flex-basis: 0;
flex: auto => flex-grow: 1, flex-shrink: 1, flex-basis: auto;
flex: initial => flex-grow: 0, flex-shrink: 1, flex-basis: auto;
flex: none => flex-grow: 0, flex-shrink: 0, flex-basis: auto;

#### grid

| 属性 | 说明 |
| --- | --- |
| grid-template-columns | 网格列的宽度，可以设置百分比，像素，内容等 |
| grid-template-rows | 网格行的高度，可以设置百分比，像素，内容等 |
| grid-template-areas | 网格区域的名称，可以设置网格单元的名称 |
| grid-column-gap | 网格列之间的间距，可以设置百分比，像素，内容等 |
| grid-row-gap | 网格行之间的间距，可以设置百分比，像素，内容等 |
| grid-gap | 网格行列之间的间距，可以设置百分比，像素，内容等 |
| grid-auto-flow | 网格元素的排列顺序，row（默认）或 column |

### 定位

| 值 | 说明 |
| --- | --- |
| static | 默认值，没有定位，元素出现在正常的流中（忽略 top, bottom, left, right 四个属性） |
| relative | 相对定位，相对于元素在正常流中的位置进行定位，比如 top:20px 就是把元素相对于原来位置往下移动 20px |
| absolute | 绝对定位，参考最近的一个并且不是static的仙人（如果没有就参考浏览器窗口）|
| fixed | 固定定位，相对于浏览器窗口进行定位 |
| sticky | 粘性定位 = relative + fixed，当前窗口视图没到 sticky 元素的位置时，元素固定在原来位置，当窗口滚动到 sticky 元素的位置时，元素固定为设定的阈值，然后开始跟随窗口滚动 |

只有当 position 不是默认的 static 时，top/bottom/left/right 这 4 个属性才生效

## BFC（块级格式化上下文

首先讲出现条件，条件基本就是：

- overflow: hidden/auto/scroll
- float: left/right
- position: absolute/fixed
- display: table-cell/table-row/table-column/inline-block/flex/grid

而出现情况基本是：

- 内部的Box会在垂直方向一个接一个地放置
- 垂直方向的距离由margin决定，相邻的两个Box的margin会发生折叠
- BFC的区域不会与float元素重叠
- BFC高度计算时，浮动元素也参与计算

### 经典布局

#### 两栏布局

1. flex布局

```html
<div class="container">
    <div class="left">左栏</div>
    <div class="right">右栏</div>
</div>

<style>
.container {
    display: flex;
}

.left {
    flex: 1;
    background-color: #f00;
}

.right {
    flex: 1;
    background-color: #0f0;
}
</style>
```

2. float + BFC布局

```html
<div class="container">
    <div class="left">左栏</div>
    <div class="right">右栏</div>
</div>

<style>
.container {
    overflow: hidden;
}

.left {
    float: left;
    width: 200px;
    background-color: #f00;
}

.right {
    margin-left: 200px;
    overflow: hidden;
    background-color: #0f0; 
}
</style>
```

3. grid布局
  
```html
<div class="container">
    <div class="left">左栏</div>
    <div class="right">右栏</div>
</div>

<style>
.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
 }
 
.left {
    background-color: #f00;
 }
 
.right {
    background-color: #0f0;
}
 </style>
 ```

4. 绝对定位 + BFC布局

```html
<div class="container">
    <div class="left">左栏</div>
    <div class="right">右栏</div>
</div>

 <style>
.container {
    position: relative;
}

.left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 50%;
    background-color: #f00;
}

 .right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 50%;
    background-color: #0f0;
}
 </style>
```

#### 三栏布局

1. flex布局

```html
<div class="container">
    <div class="left"></div>
    <div class="main"></div>
    <div class="right"></div>
</div>

 <style>
.container {
    display: flex;
    height: 100vh;
}

.left {
    width: 200px;
    background-color: #f00;
}

.main {
    flex: 3;
    background-color: #0f0;
}

.right {
    width: 200px;
    background-color: #00f;
}
 </style>
```

2. float + BFC布局

```html
<div class="container">
    <div class="left"></div>
    <div class="right"></div>
    <div class="main"></div>
</div>

 <style>
.container {
    overflow: hidden;
}

.left {
    float: left;
    width: 200px;
    background-color: #f00;
}

.right {
    float: right;
    width: 200px;
    background-color: #0f0;
}

.main {
    overflow: hidden;
    background-color: #00f;
    margin: 0 200px;
}

</style>
```

3. grid布局

```html
<div class="container">
    <div class="left"></div>
    <div class="main"></div>
    <div class="right"></div>
</div>

<style>
.container {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
}
```

4. 绝对定位

```html
<div class="container">
    <div class="left"></div>
    <div class="main"></div>
    <div class="right"></div>
</div>

<style>
.container {
    position: relative;
}

.left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 200px;
    background-color: #f00;
}

.main {
    margin: 0 200px;
    background-color: #0f0;
}

.right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 200px;
    background-color: #00f;
}

</style>
```

#### 圣杯布局



#### 双飞翼布局

#### 圣杯 + 双飞翼布局

## 动画

## 适配

## 其他