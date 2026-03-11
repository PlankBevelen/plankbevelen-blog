<i>[观《JavaScript 深入之从原型到原型链》后的理解](https://juejin.cn/post/6844903472836395022)</i>

从实例开始讲起：
```
function Person() { this.name = 'plankbevelen'; }

const person = new Person();

// Person.prototype
// person.__proto__
// person.constructor

console.log(person.__proto__ === Person.prototype); // true
console.log(person.constructor === Person); // true
console.log(person.__proto__.__proto__ === Object.prototype); // true
console.log(person.constructor === Person.prototype.constructor); // true

```

## proto、__proto__、constructor的关系

每个函数都有一个prototype属性，用来存储该函数的实例共享的属性和方法，它会指向该函数的原型对象。原型就是，JS在创建a对象时，a对象所关联到b对象，那么我们就说b是a的原型，并且a会从b继承属性和方法。

constructor是原型对象的一个属性，用来指向创建该原型对象的构造函数。
__proto__每个对象都有的属性，用来指向该创建对象的原型对象。原型对象也有__proto__属性，用来指向该原型对象的原型对象，最终指向null，这样形成的一个链式结构，就是原型链。

## 实例关系分析

上述代码，通过调用构造函数`Person`创建了实例`person`,`person`的`__proto__`指向他的原型对象`Person.prototype`。

`person.constructor`指向`Person`构造函数。
`Person.prototype.constructor`也指向`Person`构造函数。
这个有个误区，person实例并不含有constructor属性，它是从原型链上继承来的。原型链的核心作用：实现JS的继承机制。具体表现为：访问实例的属性或方法时，会先在实例上查找，如果没有找到，就会去原型链上查找，直到找到或者到达null。

## constructor 与 构造函数

构造函数就是用来创建实例的函数，只要通过new调用这个函数创建了实例，那这个函数就是构造函数。
constructor是原型对象的一个属性，用来指向创建该原型对象的构造函数。

```
class Person { constructor() { this.name = 'plankbevelen' } }
const person = new Person();
```

如果是这样的话，`person.constructor`指向`Person`类的构造函数，不是`Person`类。

