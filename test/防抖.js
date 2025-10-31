// 防抖
function debounce(func, delay) {
    // n秒内被触发，则重新计时
    let timeout = null 
    return function() {
        // 清空上次
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func();
        }, delay);
    }
}

// test
const debounceFunc = debounce(() => {
    console.log('debounce');
}, 2000);

debounceFunc();
debounceFunc();
debounceFunc();