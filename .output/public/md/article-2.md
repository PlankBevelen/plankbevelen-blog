虚拟DOM由React最先引入，它的出现解决了React在DOM操作上的性能问题：
寻常的DOM操作是非常耗时的，因为每次操作都需要浏览器重新渲染页面，尤其是在批量操作时（循环创建多个DOM元素），性能开销很大。

虚拟DOM是一个JS对象，并没有标准的规范，它是对真实DOM的一种抽象表示，它用vnode来描述DOM树的结构，每个vnode都对应着一个真实的DOM节点。框架在操作DOM时，不是直接操作真实DOM，而是先操作虚拟DOM，最后再将虚拟DOM树的差异批量更新到真实DOM树上，从而提高了性能。

<b><i>那么虚拟DOM一定比真实DOM性能好吗？</i></b>
不一定，如果你只想改变一个button的text内容，那么虚拟DOM的性能优势就体现不出来了。

虚拟DOM的工作流程（以Vue为例）：
1. 当组件的状态发生改变时，Vue会通过响应式系统检测到状态的改变。
2. Vue会根据新的状态，将模板通过render函数渲染成新的虚拟DOM树。
3. Vue会将新的虚拟DOM树与旧的虚拟DOM树进行对比，找出差异。
4. Vue会将差异批量更新到真实DOM树上，从而实现高效的DOM操作。

<b><i>那么每次状态改变时，Vue都需要重新渲染虚拟DOM树吗？</i></b>
答案是不一定，Vue会根据状态的改变，智能地判断是否需要重新渲染虚拟DOM树。
如果状态的改变不会影响到DOM树的结构，那么Vue会直接跳过虚拟DOM树的对比过程，直接将差异批量更新到真实DOM树上。

<b><i>那怎么去实现一个简易的虚拟DOM呢？</i></b>
核心就是 生成虚拟DOM => 对比新旧虚拟DOM => 更新真实DOM

下面将简单实现一个简易的虚拟DOM，它的功能包括渲染、对比、更新。

#### 生成虚拟DOM

假如我这儿有一段html代码如下：
```html
<div id="app" class="container">
  <h1 class="title">Hello Vue!</h1>
  "嘻嘻"
</div>
```
那么我们描述一个标签所必要的信息要有：
1. 标签名
2. 属性
3. 子节点

我们可以用一个JS对象来描述一个标签，如下：
```js
{
  tag: 'div',
  attrs: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      tag: 'h1',
      attrs: {
        class: 'title'
      },
      children: ['Hello Vue!']
    },
    "嘻嘻"
  ]
}
```

生成一个虚拟DOM树的函数如下：
```js
function createVNode(tag, attrs = {}, children = []) {
  return {
    tag,
    attrs,
    children
  }
}
```

#### 将虚拟DOM渲染成真实DOM

递归地将虚拟DOM树转换为真实的DOM节点
同时这里介绍一下真实DOM所包含的节点类型：（其他的自行了解）
1. 元素节点
2. 文本节点
3. 注释节点，这个特殊一点的是，他有特殊标识，isComment，值为true。这里就不写了

```
function render(vnode) {
    // 文本节点
    if(typeof vnode === 'string')  {
        return document.createTextNode(vnode)
    }
    // 元素节点
    // 创建元素 => 添加属性 => 设置子节点 => 返回元素
    const el = document.createElement(vnode.tag) 
    for(const key in vnode.attrs) {
        el.setAttribute(key, vnode.attrs[key])
    }
    for(const child of vnode.children) {
        el.appendChild(render(child))
    }
    return el
}
```

#### 对比两个虚拟DOM节点的差异(diff)

这里可以说是虚拟DOM的核心，对比两个虚拟DOM节点的差异，找出差异——diff算法。
diff算法的核心思想（仅谈React/Vue优化之后的diff算法）：
1. 同级比较，oldVNode和newVNode只比较同层级的节点，不同层级的节点直接视为不同。
2. 深度优先（DFS）遍历

对于节点的操作有四种：增、删、改（更新|移动），这四种方式规则如下：
1. 增：如果newVNode在oldVNode中不存在，那么就需要创建一个新的真实DOM节点，并将其添加到真实DOM树中。
2. 删：如果oldVNode在newVNode中不存在，那么就需要从真实DOM树中删除该节点。
3. 改（更新）：如果oldVNode和newVNode在相同位置，但是属性或文本内容不同，那么就需要更新该节点的属性或文本内容。
4. 改（移动）：如果oldVNode和newVNode在不同位置，但是标签名相同，那么就需要将该节点从旧位置移动到新位置。

```
// 对比三个方面：tag、attrs、children

function diff(oldVNode, newVNode) {
    if(typeof newVNode === undefined) {
        return { type: 'REMOVE' }
    }
    // 文本节点
    if(typeof oldVNode === 'string' && typeof newVNode === 'string' || 
        typeof oldVNode === 'number' && typeof newVNode === 'number'
    ) {
        if(oldVNode !== newVNode) {
            return { type: 'TEXT', vnode: newVNode }
        }
        return { type: 'none' }
    }
    // tag
    if(oldVNode.tag !== newVNode.tag) {
        return { type: 'REPLACE', vnode: newVNode }
    }
    // attrs
    const diffAttrs = diffAttrs(oldVNode.attrs, newVNode.attrs)
    const diffChildren = diffChildren(oldVNode.children, newVNode.children)
    if(Object.keys(diffAttrs).length) {
        return { type: 'UPDATE', diffAttrs, diffChildren }
    }
    // no diff
    return { type: 'none' }
}

function diffAttrs(oldAttrs, newAttrs) {
    const attrsPatches = {}
    // 新增的
    for(const key in newAttrs) {
        if(oldAttrs[key] !== newAttrs[key]) {
            attrsPatches[key] = newAttrs[key]
        }
    }
    // 删除的
    for(const key in oldAttrs) {
        if(!newAttrs[key]) {
            attrsPatches[key] = null
        }
    }
    return attrsPatches;
}

function diffChildren(oldChildren, newChildren) {
    const childrenPatches = []
    for(let i = 0; i < newChildren.length; i++) {
        const diff = diff(oldChildren[i], newChildren[i])
        if(diff.type !== 'none') {
           childrenPatches.push(diff)
        }
    }
    return childrenPatches;
}
```

#### 更新真实DOM(patch)

patch，中文直译为补丁，很形象的描述了虚拟DOM是对比两个虚拟DOM节点的差异，找出差异，然后将差异批量更新到真实DOM树上。

```
function patch(el, patches) {
    if(!patches) return
    switch(patches.type) {
        case 'REMOVE':
            el.parentNode.removeChild(el)
            return null;
        case 'TEXT':
            if(el.nodeType === Node.TEXT_NODE) {
                el.textContent = patches.vnode
            }else {
                const textNode = document.createTextNode(patches.vnode)
                el.parentNode.replaceChild(textNode, el)
                return textNode
            }
            return el;
        case 'REPLACE':
            const newEl = render(patches.vnode)
            el.parentNode.replaceChild(newEl, el)
            return newEl;
        case 'UPDATE':
            for(const key in patches.diffAttrs) {
                if(patches.diffAttrs[key]) {
                    el.setAttribute(key, patches.diffAttrs[key])
                }else {
                    el.removeAttribute(key)
                }
            }
            for(let i = 0; i < patches.diffChildren.length; i++) {
                const childEl = el.children[i]
                patch(childEl, patches.diffChildren[i])
            }
            return el;
    }
    return el;
}
```


