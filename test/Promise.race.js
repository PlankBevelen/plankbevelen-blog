function promiseRace(promises) {
    // 只要有一个promise成功，就返回成功
    // 如果有一个promise失败，立马返回失败
    return new Promise((resolve, reject) => {
        for(let i = 0; i < promises.length; i++) {
            promises[i].then((res) => {
                resolve(res);
            }).then((res) => {
                reject(res);
            })
        }
    })
}