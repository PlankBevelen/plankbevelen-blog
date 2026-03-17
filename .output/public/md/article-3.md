以 vue2 为基础，实现一个简易版的响应式系统。
首先了解 vue2 的响应式系统是如何实现的。首先举例（以下为伪代码）：

```
let val = 1;
val = 2;
<div>{{ val }}</div> => <div>1</div> => <div>2</div>
```

以上总的流程为：改变val值时，vue追踪到val的变化，然后通知所有依赖val的地方，最后更新视图。
vue官方说的是发布订阅模式，核心即：追踪变化，收集依赖，触发更新。

追踪变化 vue2 中是通过 Object.defineProperty 实现的。vue3 中是通过 Proxy 实现的，核心思路是不变的。
```js
function defineReactive(obj, key, val) {
    object.defineProperty(obj, key, {
        get() {
            return val;
        },
        set(newVal) {
            if (newVal !== val) {
                val = newVal;
            }
        }
    })
}
```
这个借助Object.defineProperty，为对象的属性添加了getter和setter，当属性被访问或修改时，会触发getter和setter，达到数据变化追踪的效果。
而这个只能为对象的单个属性，而且只能添加一次，所以可以进行递归遍历，为对象的每个属性都加上getter和setter.
```js
// 检测数据变化
class Observer {
    constructor(value) {
        this.value = value;
        if(value && typeof value === 'object') Array.isArray(value) ? obserbeArray(value) : walk(value);
    }
    walk(obj) {
        for(const key in obj) {
            defineReactive(obj, key, obj[key]);
        }
    }
    obserbeArray(obj) {
        for(let i = 0; i < obj.length; i++) {
            observe(obj[i]);
        }
    }
}

export function observe(val) {
    // 如果不是对象
    if(typeof val !== 'object') return 
    return new Observer(val); // 继续
}
```

Observer类用递归实现了一整个对象的所有属性的监听，如果数据有所变化的话，需要有一个类似于socket的东西去帮它传达更新消息，并执行其对应的业务逻辑。
vue 是使用了一个叫依赖的东西，当数据变化的时候，你所要通知的地方就是依赖。依赖收集的时期在getter时，等你在触发setter的时候就会去触发对应业务。到这儿整个流程大致会清晰一些，最后再做总结。所以中间先建立一个依赖收集器，只实现部分这儿用得到的功能：收集依赖、通知更新，就够了

```js
class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(sub) {
        if(sub && sub.update && !this.subs.includes(sub)) this.subs.push(sub);
    }
    notify() {
        this.subs.foreach((sub) => sub.update());
    }
}
Dep.target = null;
```

（补一下收集依赖的部分）
```js
function defineReactive(obj, key, val) {
    object.defineProperty(obj, key, {
        get() {
            // 收集依赖
            this.addSub(Dep.target);
            return val;
        },
        set(newVal) {
            if (newVal !== val) {
                val = newVal;
                // 通知更新
                this.notify();
                // 监听新值
                observe(newVal);
            }
        }
    })
}
```

最后是实现，依赖所要通知的单位，这个单位呢有很多种，比如用户实现的watch，template中的数据等，为了方便管理起来，vue中把这个叫做watcher进行集中管理

```js
class Watcher {
    // vm是组件实例，expOrFn是监听对应的数据，cb是回调函数，也就是其对应的业务逻辑
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.cb = cb;
        if(typeof expOrFn === 'function') {
            this.expOrFn = expOrFn; // 直接执行
        } else {
            this.expOrFn = parseExp(exp);
        }
        this.value = this.get();
    }
    get() {
        Dep.target = this;
        const val = this.expOrFn(this.vm);
        Dep.target = null;
        return val;
    }
    update() {
        let oldValue = this.value;
        let newValue = this.get();
        if(oldValue !== newValue) {
            this.value = newValue;
            this.cb.call(this.vm, newValue);
        }
    }
    parseExp(exp) {
        if(/[^\w.$]/.test(exp)) throw new Error('表达式格式错误');
        const segments = exp.split('.');
        return function(obj) {
            let val = obj;
            segments.forEach((segment) => {
                val = val[segment];
            })
            return val;
        }
    }
}
```

总的结果就是Observer类负责监听数据变化，Dep类负责收集依赖和通知更新，Watcher类负责订阅数据变化并执行回调函数。