<b><i>虚拟DOM咋来的</i></b>
虚拟DOM由React最先引入，它的出现解决了React在DOM操作上的性能问题：
寻常的DOM操作是非常耗时的，因为每次操作都需要浏览器重新渲染页面，尤其是在批量操作时（循环创建多个DOM元素），性能开销很大。

<b><i>那虚拟DOM是什么</i></b>
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

下面将简单实现一个简易的虚拟DOM，它的功能包括渲染、对比、更新：

## 生成虚拟DOM

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

那么创建一个虚拟DOM的节点的函数如下：
```javascript
function createVNode(tag, attrs = {}, children = []) {
  return {
    tag,
    attrs,
    children
  }
}
```

## 将虚拟DOM渲染成真实DOM

这里简单介绍一下真实DOM所包含的节点类型：（其他的自行了解）
1. 元素节点
2. 文本节点
3. 注释节点，这个特殊一点的是，他有特殊标识，isComment，值为true。这里就不写了

```javascript
function render(vnode) {
    if( typeof vnode === 'string' || typeof vnode === 'number' ) {
        return document.createTextNode(vnode)
    } else {
        const el = document.createElement(vnode.tag);
        for(const key in vnode.attrs) {
            el.setAttribute(key, vnode.attrs[key])
        }
        vnode.children.forEach(child => {
            el.appendChild(render(child))
        })
        return el;
    }
}
```

## 对比两个虚拟DOM节点的差异(diff)

这里可以说是虚拟DOM的核心，对比两个虚拟DOM节点的差异，找出差异——diff算法。
diff算法的核心思想：
1. 同级比较，oldVNode和newVNode只比较同层级的节点，不同层级的节点直接视为不同。
2. 深度优先（DFS）遍历

对于节点的操作有四种：增、删、改（更新|移动）

```javascript
function diff(oldVnode, newVnode) {
    if ( typeof newVnode === 'undefined') {
        return { type: 'REMOVE' }
    }

    if( typeof oldVnode === 'string' || typeof newVnode === 'string' ||
        typeof oldVnode === 'number' || typeof newVnode === 'number'
    ) {
        if( oldVnode !== newVnode) {
            return { type: 'TEXT', text: newVnode }
        }
        return { type: 'NONE' }
    }
    // tag
    if( oldVnode.tag !== newVnode.tag ) {
        return { type: 'REPLACE', newVnode }
    }
    // attrs
    const attrsPatches = diffAttrs(oldVnode.attrs, newVnode.attrs);
    // children
    const childrenPatches = diffChildren(oldVnode.children, newVnode.children);

    if( Object.keys(attrsPatches).length === 0 && childrenPatches.length === 0 ) {
        return { type: 'NONE' }
    } else {
        return { type: 'UPDATE', attrsPatches, childrenPatches }
    }
}

function diffAttrs(oldAttrs, newAttrs) {
    const attrsPatches = {};
    // 新增、更改
    for(const key in newAttrs) {
        if( oldAttrs[key] !== newAttrs[key] ) {
            attrsPatches[key] = newAttrs[key];
        } 
    }
    // 删除
    for(const key in oldAttrs) {
        if( oldAttrs[key] !== newAttrs[key] ) {
            attrsPatches[key] = null;
        }
    }
    return attrsPatches;
}

function diffChildren(oldChildren, newChildren) {
    const childrenPatches = [];
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for(let i = 0; i < maxLen; i++) {
        childrenPatches[i] = diff(oldChildren[i], newChildren[i]);
    }
    return childrenPatches;
}
```

## 更新真实DOM(patch)

patch，中文直译为补丁，很形象的描述了虚拟DOM是对比两个虚拟DOM节点的差异，找出差异，然后将差异批量更新到真实DOM树上。

```javascript
function patch(el, patches) {
    if(patches.type === 'NONE') return el;
    switch (patches.type) {
        case 'REMOVE':
            el.parentNode.removeChild(el);
            return null;
        case 'REPLACE':
            const newEl = render(patches.newVnode);
            el.parentNode.replaceChild(newEl, el);
            return newEl;
        case 'TEXT':
            // 文本节点
            if(el.nodeType === Node.TEXT_NODE) {
                el.textContent = patches.text;
            } else {
                const textNode = document.createTextNode(patches.text)
                el.parentNode.replaceChild(textNode, el)
            }
            return el;
        case 'UPDATE':
            // 更新属性
            for(const key in patches.attrsPatches) {
                if( patches.attrsPatches[key] !== null ) {
                    el.setAttribute(key, patches.attrsPatches[key]);
                } else {
                    el.removeAttribute(key);
                }
            }
            // 更新children
            for(let i = 0; i < patches.childrenPatches.length; i++) {
                const childPatch = patches.childrenPatches[i];
                if( childPatch.type !== 'NONE' ) {
                    patch(el.childNodes[i], childPatch);                    
                }
            }
            return el;
        default:
            return el;
    }    
}
```

## 测试

我这里准备了一段小测试（记得在浏览器环境运行，别跑到nodejs里去了）：

```javascript
const oldVNode = createVNode('div', { id: 'app', class: 'container' }, [
  createVNode('h1', { class: 'title' }, ['Hello Vue!']),
  createVNode('p', {}, ['This is a paragraph.'])
]);

const newVNode = createVNode('div', { id: 'app', class: 'container active' }, [
  createVNode('h1', { class: 'title' }, ['Hello React!']),  
  createVNode('p', {}, ['This is an updated paragraph.']),  
  createVNode('span', {}, ['New element!'])                  
]);

const rootEl = render(oldVNode);
const patches = diff(oldVNode, newVNode);

patch(rootEl, patches);
console.log(rootEl);
```



