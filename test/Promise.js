class Promise {
    constructor(executor) {
        this.status = 'pending';
        this.value = undefined; // 成功时的返回值
        this.reason = undefined; // 失败时的返回值

        // 成功回调
        this.onFulfilledCallbacks = [];
        // 失败回调
        this.onRejectedCallbacks = [];

        // 成功时调用
        const resolve = (value) => {
            if(this.status === 'pending') {
                this.status = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(fn => fn(this.value));
            }
        }
        // 失败时调用
        const reject = (reason) => {
            if(this.status === 'pending') {
                this.status = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn(this.reason));
            }
        }

        try {
            executor(resolve, reject); // executor是构造函数传入的参数
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        // 1. then方法返回一个新的Promise
        // 2. onFulfilled和onRejected都是可选参数
        // 3. 如果onFulfilled不是函数，就忽略它
        // 4. 如果onRejected不是函数，就忽略它
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r };
        if(this.status === 'fulfilled') {
            onFulfilled(this.value);
        }
        if(this.status === 'rejected') {
            onRejected(this.reason);
        }
        if(this.status === 'pending') {
            // 1. 如果Promise是pending状态，就把onFulfilled和onRejected回调函数分别添加到成功回调和失败回调数组中
            // 2. 当Promise状态改变时，就调用对应的回调函数
            this.onFulfilledCallbacks.push(() => {
                setTimeout(() => onFulfilled(this.value)); // 异步执行成功回调
            });
            this.onRejectedCallbacks.push(() => {
                setTimeout(() => onRejected(this.reason)); // 异步执行失败回调
            });
        }
    }
}

// test
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('success');
    }, 2000);
});

promise.then((value) => {
    console.log(value);
});
