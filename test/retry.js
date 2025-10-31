//重试失败的异步请求
// 接收一个返回Promise的函数、最大重试次数、重试间隔时间
// 如果请求成功则返回结果，失败则按间隔重试
// 达到最大次数仍失败则抛出错误


async function retry(func ,maxTimes, duration) {
    for(let i = 0; i < maxTimes; i++) {
        try {
            const res = await mockPromise(i);
            return res;
        } catch (error) {
            // 未到到最大次数，等待重试
            if(i !== maxTimes - 1) {
                await new Promise(resolve => setTimeout(resolve, duration));
            }
        }
    }
}

function mockPromise(i) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(i === 2) {
                resolve();
            }
            reject();
        }, 300)
    })
}