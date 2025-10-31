/* 
 * 
 * vue响应式原理 
 * @ vue2 Object.defineProperty
 * @ vue3 Proxy
 * */

// Vue2 通过 Objection.defineProperty 劫持对象属性的 getter 和 setter，然后借助 watcher 和 Observer 和 Dep 实现数据响应式
// 
// Vue2 的数据响应式原理：
// 1. 数据初始化和数据劫持：通过 Observer 遍历对象的所有属性，使用Objection.defineProperty劫持每个属性的 getter 和 setter，同时，每个属性会创建一个Dep实例
// 2. 依赖收集：每个属性的 getter 和 setter 都会收集依赖，并在属性值变化时通知 watcher。    
// 3. 数据更新：修改数据会触发 setter，然后调用 Dep.notify 通知 遍历自己的依赖列表的 watcher，watcher 调用 update 方法，更新视图。
// 4. 执行更新：调用函数后，会生成新的虚拟Dom，然后通过Diff算法对比新旧虚拟Dom，找出最小的更新范围，然后调用patch方法更新视图。

// Vue3 通过使用 es6 的 Proxy + Reflect 和 副作用函数实现数据响应式 
// Proxy 是一个内置对象，用来拦截对象操作，可以对对象的读写操作进行拦截，并根据需要自定义相应的操作。
// Reflect 是一个内置对象，提供了一系列的方法，用来操作对象，可以代替 Object 对象的方法，好处是用于统一操作对象的方法。
// 副作用函数：副作用函数是指在数据变化时，需要执行的函数，比如修改dom、发送请求、修改状态等。设置副作用函数时，需要使用effect函数，effect函数接收两个参数，第一个参数是副作用函数，第二个参数是依赖项数组，依赖项数组是指副作用函数所依赖的数据。
// 
// Vue3 引入了两种响应式API：
// reactive + proxy: 使用es6的proxy全方位拦截对象操作，包括get、set、deleleProperty、has、ownKeys等，并通过Reflect.setPrototypeOf方法将对象设置为响应式对象。
// ref: 类似于vue2的v-model，用于包装原始类型的值，使其变成响应式的。

// 改进：
// 1. vue2的方式只拦截了对象的读写，没有拦截对象的新增和删除操作，导致新增和删除属性不会触发视图更新。
// 2. vue3的proxy可以直接拦截数组的set、delete、splice等操作，使得数组变成响应式的。
// 3. vue3的proxy仅在访问嵌套属性的时候才会触发get、set，而不会触发整个对象，因此可以提高性能。而vue2需要遍历整个对象的属性，给每个属性都添加get、set方法，性能较差。


