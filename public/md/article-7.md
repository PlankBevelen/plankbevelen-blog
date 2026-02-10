## 浏览器相关问题

### 从URL到页面渲染的过程

总流程为：

1. 浏览器会先通过DNS解析将域名转换为IP地址。

DNS解析过程：
- 浏览器会先检查本地DNS缓存中是否有该域名的IP地址。
- 如果本地DNS缓存中没有，则浏览器会向本地DNS服务器发送DNS查询请求。
- 本地DNS服务器会递归查询，先查询根域名服务器，再查询顶级域名服务器，最后查询二级域名服务器。
- 最终，本地DNS服务器会返回该域名的IP地址，并将其缓存起来。

2. 浏览器会通过TCP协议与服务器建立连接。

TCP 三次握手：
- 浏览器会向服务器发送一个TCP连接请求包，包含自己的IP地址和端口号。
- 服务器会向浏览器发送一个TCP连接确认包，包含自己的IP地址和端口号。
- 浏览器会向服务器发送一个TCP连接请求包，包含自己的IP地址和端口号。
- 服务器会收到该包，并返回一个TCP连接确认包，包含服务器的IP地址和端口号。
- 浏览器会收到确认包，并发送一个确认包，完成TCP连接的建立。

为什么是三次？
    一句话总结，TCP是全双工协议，需要浏览器和服务器都确认连接才能开始传输数据。

3. 浏览器会通过HTTP协议向服务器请求资源。

浏览器缓存分为两种：（强缓存和协商缓存，优先命中强缓存）
- 强缓存
    过期时间可以通过HTTP响应头中的`Expires`字段或`Cache-Control`字段来设置。如果过期时间未设置，则浏览器会根据默认规则判断是否命中强缓存，命中后不会再发起`HTTP`请求。
    另外，`Cache-Control`字段还可以设置`no-cache`、`no-store`、`must-revalidate`等指令，用于控制缓存行为。 `Expires`字段已被`Cache-Control`字段取代，不建议使用，有点丧心病狂，需要设置绝对过期时间，比如2025年11月11日过期 `Expires: Thu, 11 Nov 2025 00:00:00 GMT`。
    `Cache-Control`常见字段：
    - `max-age=秒数`：指定资源的缓存时间，单位为秒。
    - `no-cache`：不缓存资源，每次都向服务器发送请求，服务器会根据请求头中的`If-Modified-Since`字段或`If-None-Match`字段判断资源是否有更新。
  
- 协商缓存
    协商缓存是指浏览器在缓存过期后，向服务器发送请求，询问资源是否有更新。如果资源未更新，则服务器会返回一个304 Not Modified响应，浏览器会从缓存中读取资源。如果资源有更新，则服务器会返回新的资源响应，浏览器会更新缓存资源。
    协商缓存常见字段：
    - `Last-Modified`：指定资源的最后修改时间，单位为秒。
    - `ETag`：指定资源的唯一标识符，用于判断资源是否有更新。

4. 服务器会返回资源的响应，包括HTML文档、CSS文件、JavaScript文件、图片等。
5. TCP 四次挥手
    - 浏览器会向服务器发送一个TCP连接关闭请求包，包含自己的IP地址和端口号。
    - 服务器会向浏览器发送一个TCP连接关闭确认包，包含服务器的IP地址和端口号。
    - 浏览器会收到确认包，并发送一个确认包，完成TCP连接的关闭。
    - 服务器会收到确认包，并发送一个确认包，完成TCP连接的关闭。
    - 浏览器和服务器都关闭了TCP连接，完成了HTTP请求的响应。
6. 浏览器会解析HTML文档，构建DOM树。
7. 浏览器会解析CSS文件，构建CSSOM树。
8. 浏览器会将DOM树和CSSOM树合并为渲染树。

以上部分均只用了解，下载进程，js会阻碍下载进程，导致页面渲染不完整。因为JS可能会修改DOM树或CSSOM树，导致渲染树不一致。可以在HTML文档中使用`defer`或`async`属性来异步加载JS文件，避免阻塞下载进程。
defer属性：
- 浏览器会在解析HTML文档时，遇到`defer`属性的JS文件时，会先下载该文件，但是不会执行该文件，而是将该文件添加到一个延迟执行的队列中。
- 浏览器会在解析完HTML文档后，按照添加到队列中的顺序执行JS文件。

async属性：
- 浏览器会在解析HTML文档时，遇到`async`属性的JS文件时，会先下载该文件，但是不会执行该文件，而是将该文件添加到一个异步执行的队列中。
- 浏览器会在下载完成后，立即执行该文件，但是不会阻塞下载进程。

9. 浏览器会根据渲染树进行布局，计算每个元素的位置和大小。

这个部分就是常说的重绘重排，浏览器会根据渲染树进行布局，计算每个元素的位置和大小。

重绘触发：
- 元素的外观发生变化，比如颜色、背景、边框等。
- 元素的可见性发生变化，比如显示、隐藏等。display、visibility、opacity属性
- 外加重排的条件

重排触发：
- 元素的尺寸发生变化，比如宽度、高度、内边距、外边距等。
- 元素的位置发生变化，比如改变了`top`、`bottom`、`left`、`right`等属性。
- 元素的父元素尺寸发生变化，比如改变了父元素的宽度、高度、内边距、外边距等。
- 元素的可见性发生变化，比如显示、隐藏等。这个部分只是display属性，因为display属性会改变元素的可见性。
- 元素的层级发生变化，比如改变了`z-index`属性。

10.  浏览器会根据渲染树进行绘制，将元素绘制到屏幕上。

### 浏览器渲染优化

1. 减少HTTP

这个分为静态资源获取、动态资源获取：

静态资源获取：主要针对JS、CSS、图片等静态资源。可以采用压缩、合并、缓存等方法

动态资源获取：主要针对要从服务器获取数据的情况。可以采用合并多个请求为一个请求、对请求进行压缩、设置缓存策略等方法。

2. 减少动画开销

最好不要在 * 或 body 使用 transition 或 animation 属性，因为这会导致所有元素都进行动画或过渡，影响性能。

3. 按需引入

比如element-plus组件库，只引入需要的组件，而不是全部引入。打包时会根据引入的组件进行打包，减少打包体积。

4. 懒加载

懒加载是指在需要的时候才加载资源，而不是在页面加载时就加载所有资源。可以采用事件委托、IntersectionObserver等技术实现。可以实现路由、组件、图片等懒加载

5. 图片压缩

图片压缩是指将图片文件大小压缩，减少图片加载时间。可以采用在线压缩工具、图片编辑软件等实现。我自己常用TinyPNG

6. 缓存策略

反正localStorage有个5M，不如存点常用的配置信息，比如userInfo、theme等

7. 骨架屏

说白了就是先把位置占着，不要让页面元素跳来跳去，影响用户体验。
书面一点，骨架屏是指在页面加载时，先显示一个简单的骨架屏，等页面加载完成后再显示真实的内容。可以采用CSS实现。

### 浏览器本地存储

cookie、sessionStorage、localStorage

只用了解大小、生命周期、安全问题等即可

cookie一般在5kb，sessionStorage和localStorage一般在5mb左右。

生命周期：
- cookie：可以设置过期时间，默认是会话结束时过期。
- sessionStorage：仅在当前会话有效，关闭浏览器后过期。
- localStorage：永久有效，除非手动删除。

以上三者都受浏览器同源策略限制，只能在相同域名下访问。

安全问题：
- cookie：可以设置为httpOnly，防止XSS攻击。
- sessionStorage和localStorage：数据存储在客户端，容易被窃取。

解决方案：
- 设置 HttpOnly; Secure; SameSite=Strict
- 对敏感数据进行加密存储，比如用户密码、token等。要不然就不存了

### 浏览器缓存策略

url部分已写

### 跨域

受浏览器同源策略限制，不同端口、不同域名、不同协议都被视为不同的域，不能直接进行跨域请求。

解决跨域问题的方法有很多种，比如：
- JSONP：利用<script>标签没有跨域限制的漏洞，通过<script>标签.src的方式请求跨域数据。
- CORS：服务端设置Access-Control-Allow-Origin等响应头，允许指定域名跨域访问。一般来说要配置origin、methods、headers等。
- 代理：在同源的服务器上设置一个代理，将跨域请求发送到代理服务器，再由代理服务器发送到目标服务器。
- WebSocket：利用WebSocket协议进行跨域通信。
- 服务器端渲染（SSR）：将页面渲染在服务器端，返回给客户端，避免跨域问题。

### 浏览器如何获取视窗

视窗尺寸
window.innerHeight  // 视窗高度
window.innerWidth  // 视窗宽度
document.documentElement.clientHeight  // 文档高度 有滚动条
document.documentElement.clientWidth  // 文档宽度

视窗滚动
window.scrollY  // 滚动高度
window.scrollX  // 滚动宽度
element.scrollTop  // 元素滚动高度
element.scrollLeft  // 元素滚动宽度

元素尺寸
element.clientHeight  // 元素高度 可视区域 = padding + height
element.clientWidth  // 元素宽度 可视区域 = padding + width
element.offsetHeight  // 元素高度 有滚动条 包括padding、border
element.offsetWidth  // 元素宽度 有滚动条 包括padding、border
element.offsetTop  // 元素顶部距离文档顶部的距离 有滚动条 包括padding、border
element.offsetLeft  // 元素左侧距离文档左侧的距离 有滚动条 包括padding、border

IntersectionObserver
IntersectionObserver 是浏览器提供的一个 API，用于监听元素是否进入了视口。它可以用于实现懒加载、无限滚动等功能。 

比如，我要做一个虚拟列表，需要知道的要有：
视窗高度、列表高度、item高度宽度、item数量，rowItem数量
以vue3为例，我要获取视窗高度，我可以在mounted钩子函数中获取，代码如下：

``` js
const itemHeight = ref(100)
const itemWidth = ref(100)
const windowWidth = computed(() => window.innerWidth)
const windowHeight = computed(() => window.innerHeight)
const itemsPerRow = computed(() => Math.floor(windowHeight.windowWidth / itemWidth.value))
const itemsPerColumn = computed(() => Math.floor(windowHeight.value / itemHeight.value))
const curRow = ref(0)

const products = ref([])
const productsSplited = computed(() => {
    const splited = []
    for (let i = 0; i < products.value.length; i += itemsPerRow.value) {
        splited.push(products.value.slice(i, i + itemsPerRow.value))
    }
    return splited
})
onMounted(()=>{
    await initProducts()

})
```
