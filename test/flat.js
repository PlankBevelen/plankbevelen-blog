const arr = [1,[2,[3,[4,5]]],6]
//  方法一：数组自带的扁平化方法,flat的参数代表的是需要展开几层，如果是Infinity的话，就是不管嵌套几层，全部都展开
console.log(arr.flat(Infinity))

// 方法二
Array.prototype.myFlat = function() {
    // reduce 参数
    // pre 上一次的返回值
    // cur 当前遍历到的元素
    return this.reduce((pre, cur) => {
        return pre.concat(Array.isArray(cur) ? cur.myFlat() : cur)    
    }, [])
}
console.log(arr.myFlat())

// 普通函数实现
function myFlat(arr) {
    var res = []
    for(let i = 0; i < arr.length; i++) {
        if(Array.isArray(arr[i])) {
            res = res.concat(myFlat(arr[i]))
        }else {
            res.push(arr[i])
        }
    }
    return res
}
console.log(myFlat(arr))
