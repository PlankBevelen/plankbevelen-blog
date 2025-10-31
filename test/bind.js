

Function.prototype.myBind = function(context, ...args) {
    // 1. 永久改变函数this指针
    // 2. 传入参数列表
    // 3. 返回绑定this后的新函数
    const fn = this;
    return (...newArgs) => {
        return fn.apply(context, [...args, ...newArgs]);
    }
}

function add (a, b) {
    return a + b;
}

const obj = {
    a: 1,
    b: 2
}

const addBind = add.myBind(obj, 1, 2);

console.log(addBind());
