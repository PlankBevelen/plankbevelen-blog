## JS

### es6 新特性

### 原型、原型链

#### 原型
每个函数（箭头函数、`Function.prototype`等特殊函数除外）都有一个`prototype`属性，指向它的原型对象。
原型对象的用途就是，当函数作为构造函数时，它的`prototype`属性指向的对象就是它的实例对象的原型对象。

#### 原型链
每个对象都有一个`__proto__`属性，指向它的原型对象（实质上是创建该对象的构造函数的`prototype`属性）。如果原型对象也有`__proto__`属性，就形成了一个原型链，一直找到null为止。

#### __proto__、prototype

抽象来说，.prototype每个函数都有，也就是每个函数的仓库。而.__proto__每个对象都有，指向它的生产仓库，该对象就是从该函数仓库拿出来的工具，.__proto__起到指针的作用，记录了它的生产仓库的地址。

### 数据类型怎么判断？

- typeof 可以判断基本数据类型（number、string、boolean、undefined、symbol）,对于引用数据类型（Array、Object、Function、null等）只能判断为object。
- instanceof 可以判断引用数据类型（Array、Object、Function等）
- constructor 可以判断引用数据类型（Array、Object、Function等）
- Object.prototype.toString.call() 可以判断所有数据类型

### 构造函数是什么东西

构造函数是一种特殊的函数，它本质上是对象的模板，它的核心作用为：初始化对象的<b>属性</b>、共享对象的<b>方法</b>。
构造函数构建和使用有两个必要规则：
1. 函数名首字母大写（如 Person、User）—— 区分普通函数，是行业通用规范；
2. 必须使用`new`关键字来调用构造函数（如果不用`new`就只是普通函数，其this指向全局对象window，可能会造成全局污染）。

下面是对new关键字的模拟实现：
```
function Person(name, age) {
    this.name = name;
    this.age = age;
}

function mockNew(constructor, ...args) {
    // 创建新对象、改变this指向、返回新对象
    const obj = Object.create(constructor.prototype);
    constructor.apply(obj, args);
    return obj;
}
```

### 事件循环机制

前提是JS是单线程的，一次只执行一个任务。为了不阻塞主线程的执行，JS把执行任务划分成了同步任务和异步任务。
同步任务扔进执行栈，异步任务扔进任务队列。异步任务又划分了宏任务队列和异任务队列。
浏览器首先执行掉执行栈中的同步任务，把执行栈清空。
清空微任务队列，包括执行过程中新增的微任务。
浏览器的话，会更新UI，渲染页面。
然后再拿一个宏任务出来，丢执行栈。
重复以上过程，直到执行栈和任务队列都为空。

核心优先级：同步任务 > 微任务 > 宏任务（微任务会 “插队” 在宏任务前执行）

#### 什么是宏任务、微任务

宏任务：异步任务中耗时相对较长的任务，比如`<script>`标签中的代码、setTimeout、setInterval等、I/O操作等。
微任务：异步任务中耗时相对较短的任务，包括Promise、async/await、MutationObserver等。

### js如何实现多线程

JS实现多线程的方式有很多种，比如Web Worker、Shared Worker、Service Worker等。
这些方式都可以在浏览器中创建多个线程，每个线程都有自己的执行环境和内存空间。
它们之间可以通过消息传递来通信，实现数据的共享和协作。

### js如何处理http请求

JS处理http请求的方式有很多种，比如XMLHttpRequest、Fetch API、axios等。
这些方式都可以向服务器发送http请求，获取服务器返回的数据。
不同的方式有不同的特点和适用场景。

### 闭包

闭包是指一个函数可以访问并操作其词法作用域外部的变量。
闭包的形成条件是：函数嵌套函数，内部函数可以访问外部函数的变量，外部函数返回内部函数，外部函数被调用。
闭包的作用是：保护变量不被销毁，延长变量的生命周期。

闭包应用场景实例：

### 浅拷贝和深拷贝

浅拷贝：只复制对象的引用，而不复制对象的属性。
深拷贝：递归复制对象的所有属性，包括属性值为对象的情况。

实现浅拷贝的方法有很多种，比如Object.assign()、展开运算符（...）等。
实现深拷贝的方法有很多种，比如JSON.parse(JSON.stringify(obj))、递归复制等。

```
const obj = {
    a: 1,
    b: 2,
    c: {
        d: 3,
    }
}
```

浅拷贝示例：
```
const shallowCopy = Object.assign({}, obj);
shallowCopy.a = 100;
shallowCopy.c.d = 300;
console.log(obj.a); // 1
console.log(shallowCopy.a); // 100
console.log(obj.c.d); // 300
console.log(shallowCopy.c.d); // 300
```

深拷贝示例：
```
const deepCopy = JSON.parse(JSON.stringify(obj));
deepCopy.a = 100;
deepCopy.c.d = 300;
console.log(obj.a); // 1
console.log(deepCopy.a); // 100
console.log(obj.c.d); // 3
console.log(deepCopy.c.d); // 300
```

### 箭头函数

箭头函数是一种特殊的函数，它没有自己的`this`、`arguments`、`super`或`new.target`，也没有`prototype`属性。
箭头函数的`this`指向定义时所在的对象，而不是调用时所在的对象。
箭头函数的`arguments`对象是定义时所在的对象的`arguments`对象，而不是调用时所在的对象的`arguments`对象。

### `this` 指向问题

- 普通函数：this指向调用它的对象
- 箭头函数：没有自己的this, this取自上下文
- 构造函数：this指向新创建的对象
- 调用函数：this指向指定的对象
- 绑定函数：this指向绑定的对象

下面是各种情况举例

```
const obj = {
    a: 1,
    b: 2,
    c: function() {
        console.log(this.a);
    }
}

obj.c(); // this 指向 obj

function func() {
    console.log(this.a);
}

// 非严格模式下
func(); // this 指向 window
// 严格模式下
func(); // this 指向 undefined 避免全局污染

func.call(obj); // this 指向 obj，立即执行，返回调用函数的返回值
func.apply(obj); // this 指向 obj，返回一个数组，数组元素为调用函数的返回值

const bindFunc = func.bind(obj); // this 指向 obj，返回一个新函数
bindFunc(); // this 指向 obj

const arrowFunc = () => {
    console.log(this.a); // this 指向 window
}

class MyClass {
    constructor() {
        this.a = 1;
    }
}
const myClass = new MyClass();
myClass.c(); // this 指向 myClass
```


### js 如何管理内存？

js采用自动内存管理机制（垃圾回收机制），核心是 “开发者无需手动分配 / 释放内存，由 JS 引擎（如 V8）自动完成内存分配、使用和回收”。其内存管理流程可概括为 “分配内存 → 使用内存 → 回收空闲内存”，关键在于 JS 引擎如何识别 “不再使用的内存” 并安全释放。


