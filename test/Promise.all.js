
function promiseAll(promises) {
    // 所有promise成功，才返回成功
    // 如果有一个promise失败，立马返回失败
    return new Promise((resolve, reject) => {
        const results = [];
        let count = 0;
        for(let i = 0; i < promises.length; i++) {
            promises[i].then((value) => {
                results[i] = value;
                count++;
                if(count === promises.length) {
                    resolve(results);
                }
            }).catch((reason) => {
                reject(reason);
            })
        }
    })
}