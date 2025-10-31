// 节流
// n秒只能触发一次
function throtle(func, delay){
    let timeout = null;
    return () => {
        if(!timeout) {
            setTimeout(() => {
                timeout = null;
                func();
            }, delay);
        }
    }
}

// test
const throtleFunc = throtle(() => {
    console.log('throtle');
}, 1000);

throtleFunc();
throtleFunc();
throtleFunc();
