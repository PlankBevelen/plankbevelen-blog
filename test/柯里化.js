// 什么是柯里化？
// 柯里化是指将一个多参数函数转换为多个单参数函数的技术。
// 柯里化的实现原理是利用闭包，将函数的参数存储在闭包中，返回一个新函数，新函数接收剩余的参数。

function curry(func) {
    return function curried(...args) {
        if(func.length === 0 || args.length >= func.length) {
            return func(...args);
        } else {
            return (...args2) => { return curried(...args2.concat(args)) }
        }
    }
}
