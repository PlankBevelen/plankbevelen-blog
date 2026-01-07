### position

position属性用于指定元素的定位方式。
它有5个值：static、relative、absolute、fixed、sticky。

### 盒模型

box-sizing属性用于指定元素的盒模型。
它有2个值：content-box、border-box。
content-box：元素的宽度和高度只包括内容区域，不包括内边距、边框、外边距。
border-box：元素的宽度和高度包括内容区域、内边距、边框、外边距。

### BFC

1. 元素的position属性值为absolute或fixed时，它会形成BFC。
2. 元素的position属性值为relative时，它的子元素的position属性值为absolute或fixed时，它会形成BFC。
3. 元素的overflow属性值为auto、scroll或hidden时，它会形成BFC。
4. 元素的display属性值为flex、inline-flex、grid或inline-grid时，它会形成BFC。

### 怎么实现水平垂直居中

1. position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
2. display: flex; justify-content: center; align-items: center;
3. display: grid; place-items: center;
4. display: table-cell; vertical-align: middle;
5. line-height 等于 height，文字垂直居中

### 怎么实现隐藏元素

z-index、display、visibility、opacity、transform、position

### 
