前文提及，先捋一遍vue2实现响应式的思路（后面对比要用）：
首先是Observer遍历data的每个属性，为每个属性加一层Object.defineProperty追踪属性数据变化。
在getter()=>读取属性数据的时候，将依赖（当前Watcher）收入依赖收集器中。
在setter()=>更新属性数据的时候，触发Dep.notify()通知收集器中的每个Watcher进行update()。

顺带说一下vue2响应式没有做到的事情：
1. 只在最开始劫持了数据属性，无法监听整个数据，也就意味着，无法监听数据属性的增加、删除。（这个部分vue2调用Vue.set、Vue.delete去帮助实现，实际上也是借助Dep.notify()去通知）
2. 对于数组，无法监听数组的下标、长度的变化，vue2在这部分是选择去重写数组的关键修改方法如：push、pop、slice等方法，当然arr[0] = 1，arr.length = 0无法响应
3. vue2对于依赖收集是组件级的，无法精确到是组件到底是更新了`name1`还是`name2`，只知道这个watcher更新会将组件内的这俩都更新掉
4. 劫持数据阶段是递归遍历劫持所有的数据属性，性能消耗太大

### 实现流程

vue3 重构底层，彻底抛弃 Object.defineProperty，转而采用 ES6 中的 Proxy 来实现对象级响应式。并引入了 effect 副作用函数重构依赖收集、触发逻辑
其实现逻辑依然不变，仍然是劫持数据、依赖收集、触发更新，第一步仍然是劫持数据：

```javascript

export function reactive(target) {
  // 只对对象进行代理
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  return new Proxy(target, {
    get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        if(typeof res === 'object' && res !== null) {
          return reactive(res);
        }
        return res;
    },
    set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        const res = Reflect.set(target, key, value, receiver);
        return res;
    },
    deleteProperty(target, key) {
        const res = Reflect.deleteProperty(target, key);
        return res;
    }
  })
}

export function ref(val) {
  return reactive({
    value: val
  })
}

```

这里就没有必要再用Observer调用Object.defineProperty递归劫持数据属性了，因为Proxy是直接代理对象，而不是对象的属性，所以递归劫持数据属性的工作已经在getter()中完成了。（其实，Observer可以说在vue3已经被废弃了）

劫持数据后就是依赖收集阶段，和vue2一样，都是在getter()中收集依赖，setter()中触发更新，不同的是，vue3采用了effect副作用函数来重构依赖收集、触发逻辑，并且收集的时候更新了：vue2是让Dep去收集组件级别的依赖，不能知道属性到底是哪个组件的，只能通知组件更新。而vue3是让effect去收集依赖，每个属性都有一个effect，当属性变化时，只需要调用对应的effect即可。

```javascript
const targetMap = new WeakMap();    // vue3 依赖收集器
let activeEffect = null;    // 等同于 Dep.target

function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
    return fn;
}

function track(target, key) {
    if(!activeEffect) return;
    let depsMap = targetMap.get(target);  
    if(!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if(!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    dep.add(activeEffect);
}

```

这里的track()函数就是收集依赖的函数，当属性被读取时，会调用track()函数，将当前的effect收集到属性的依赖集合中。(补充到reactive里面的set去)


然后是触发更新的函数trigger()，当属性被设置时，会调用trigger()函数，将属性的依赖集合中的每个effect都调用一遍。（补充到reactive里面的set和deleteProperty去）
```javascript
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    const dep = depsMap.get(key);
    if(!dep) return;
    dep.forEach((effect) => effect());
}
```

然后最终实现的完整代码如下:

```
function reactive(target) {
  // 只对对象进行代理
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  return new Proxy(target, {
    get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        if(typeof res === 'object' && res !== null) {
          return reactive(res);
        }
        track(target, key);
        return res;
    },
    set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        const res = Reflect.set(target, key, value, receiver);
        if(oldValue !== value) {
          trigger(target, key);
        }
        return res;
    },
    deleteProperty(target, key) {
        const res = Reflect.deleteProperty(target, key);
        if(res) {
          trigger(target, key);
        }
        return res;
    }
  })
}

function ref(val) {
  return reactive({
    value: val
  })
}

function effect(fn) {
    activeEffect = fn;
    fn();
    activeEffect = null;
    return fn;
}

function track(target, key) {
    if(!activeEffect) return;
    let depsMap = targetMap.get(target);  
    if(!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if(!dep) {
        depsMap.set(key, (dep = new Set()));
    }
    dep.add(activeEffect);
}

function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    const dep = depsMap.get(key);
    if(!dep) return;
    dep.forEach((effect) => effect());
}

```
![](/uploads/1771799404525-190043123.jpeg)![](/uploads/1771799482812-735802807.jpeg)





