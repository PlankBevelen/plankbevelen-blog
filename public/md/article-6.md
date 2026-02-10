## VUE

### 生命周期

从 深入浅出vue.js 这本书中给的图，主要是分成了初始化、模板编译、挂载、更新、卸载这5个阶段。

new Vue() 到 created 之间的阶段为初始化。这个阶段主要目的是在vue实例上初始化一些属性：props、methods、data、computed、watch等。

created 到 beforeMount 之间的阶段为模板编译。这个阶段主要目的是将模板编译成渲染函数，渲染函数是一个无参数的函数，返回的是一个VNode节点。

beforeMount 到 mounted 之间的阶段为挂载。这个阶段主要目的是将组件实例挂载到DOM上，渲染成真实DOM。在挂载的过程中，vue会开启watcher持续追踪依赖的变化。

![vue生命周期](https://cn.vuejs.org/guide/essentials/lifecycle.html)
从vue官方文档给的生命周期图中可以看出，vue的生命周期分为8个阶段，分别是：
- beforeCreate
- created
- beforeMount
- mounted
- beforeUpdate
- updated
- beforeUnmount
- unmounted

创建前后、挂载前后、更新前后、卸载前后

这些生命周期钩子必须同步执行（是同步不是异步、也不是同时执行）当调用生命周期钩子时，vue会通过回调函数注册到当前<b>正在执行的组件实例</b>上。

#### 为什么不能是异步？
vue依赖当前活跃的组件实例上下文来绑定生命周期钩子，异步执行时，当前组件实例已经丢失。

### 组件通信

- 父组件向子组件通信：props
- 子组件向父组件通信：$emit
- 非父子组件通信：事件总线、Vuex、$attrs、$listeners、provide/inject

事件总线：
事件总线是一种在组件之间进行通信的机制，它允许组件之间通过触发和监听事件来进行通信。事件总线通常是一个空的Vue实例，我们可以在其中定义事件和触发事件的方法。

### 响应式原理

响应式原理的核心是靠：数据劫持、依赖收集、发布订阅

Data 依靠 Observer 转换成了 通过 getter/setter 的方式 追踪数据变化。
当外界通过 Wather 读取数据，会触发 getter 把 Wather 收集到 Deps 中。
当数据发生变化时，会触发 setter , 从而让 Dep 中的 依赖（Wather） 发送通知。

#### 什么是依赖收集？

我的理解是：首先要知道什么是依赖，为什么要收集依赖，怎么去收集依赖。

- 依赖是响应式数据被哪些业务逻辑使用到了，它不是具体数据，而是业务逻辑。比如模板里的数据，用户watch、computed监听、计算的数据。这些用到数据的业务逻辑，都被认为是依赖。
- 如果不收集依赖，当数据发生变化时，无法通知到依赖，依赖也不知道具体去更新哪些业务逻辑。
- 收集依赖过程是在渲染过程中进行的，具体是在渲染当中使用响应式数据的时候，触发数据的getter，把当前数据的watcher收到Dep实例当中

#### 什么是发布订阅？

我的理解是：首先要知道什么是发布订阅，为什么要发布订阅，怎么去发布订阅。

- 发布订阅是一种组件之间进行通信的机制，它允许组件之间通过触发和监听事件来进行通信。发布订阅通常是一个空的Vue实例，我们可以在其中定义事件和触发事件的方法。
- 如果不发布订阅，当数据发生变化时，无法通知到依赖，依赖也不知道具体去更新哪些业务逻辑。
- 发布订阅过程是在数据发生变化时进行的，具体是在数据发生变化时，触发setter，把当前数据的watcher发送到Dep实例当中，Dep实例再把watcher发送到发布订阅中心。

参考：
- [深入浅出Vue响应式原理（完整版）](https://juejin.cn/post/6844903882208837640?searchId=20251203164324DF17879E4E9B76832A62)

### 虚拟DOM

#### 虚拟DOM的构成

虚拟DOM就是一个普通的JS对象，用来描述真实DOM的结构和属性。虚拟DOM是多个vnode结合形成的一个树结构，每个vnode都对应着一个真实DOM节点。

每个vnode都有自己的属性，比如tag、attrs、children等，这些属性都对应着真实DOM节点的属性。一般来说有元素节点、文本节点、注释节点、组件节点等。（其实真实DOM节点只包含了元素节点、文本节点、注释节点），vnode节点包含的属性更多，比如key、ref、事件监听还有什么tag、props、children等

```javascript
const vnode = {
  tag: 'div', // 标签名（元素节点）/ 组件构造函数（组件节点）
  props: { id: 'app', style: { width: '100px' } }, // 属性、样式、事件等
  children: [vnode1, vnode2], // 子vnode（数组/文本）
  text: 'hello', // 文本节点专属（替代children）
  elm: null, // 对应的真实DOM节点（挂载后赋值）
  key: 'unique-key', // 列表节点的唯一标识（diff优化用）
  shapeFlag: 1, // 节点类型标记（元素/文本/组件/注释等）
  patchFlag: 6, // 补丁标记（标记哪些属性变了，Vue3优化）
  dynamicProps: ['style'], // 动态属性（Vue3优化）
  component: null, // 组件节点专属（对应组件实例）
  comment: '这是注释', // 注释节点专属
};
```