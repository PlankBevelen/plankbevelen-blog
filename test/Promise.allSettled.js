// 所有promise都执行完，返回所有promise的执行结果

Promise.myAllSettled = (promises) => {
    return new Promise((resolve, reject) => {
        let results = [];
        let count = 0;
        for(let i = 0; i < promises.length; i++) {
            promises[i].then((res) => {
                results[i] = { status: 'fulfilled', value: res};
                count++;
                if(count === promises.length) {
                    resolve(results);
                }
            }).catch((reason) => {
                results[i] = { status: 'rejected', reason: reason};
                count++;
                if(count === promises.length) {
                    resolve(results);
                }
            })
        }
    })    
}