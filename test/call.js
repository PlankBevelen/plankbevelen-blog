// bind、call、apply区别
// 1. 三者都可以改变函数的this对象指向
// 2. 三者第一个参数都是this要指向的对象(改变的是函数的this指针，函数this指针指向context)
// 3. 三者都可以传参，但是apply是数组，call是参数列表，且apply和call是一次性传入参数，而bind可以分多次传入
// 4. bind是返回绑定this后的函数，便于稍后调用；call和apply是立即调用
// 5. call是临时改变函数this指针，apply是永久改变函数this指针

Function.prototype.myCall = function(context, ...args) {
    // 1. 改变函数this指针(非永久性)
    // 2. 传入参数列表
    // 3. 立即执行
    // context为null/undefined时指向window
    context = context || window;
    // 创建唯一的key，避免覆盖原有属性
    const fnSymbol = Symbol();
    context[fnSymbol] = this;
    // 调用函数
    const result = context[fnSymbol](...args);
    // 删除临时属性
    delete context[fnSymbol];
    return result;
}

function add (a, b) {
    return a + b;
}

const obj = {
    a: 1,
    b: 2
}

add.myCall(obj, 1, 2);

console.log(obj);