// 深拷贝考虑的基础版
// 判断基础类型、对象、数组

function deepCopy(obj) {
    if(typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const newObj = Array.isArray(obj) ? [] : {};

    for(const key in obj) {
        if(obj.hasOwnProperty(key)) {
            newObj[key] = deepCopy(obj[key]);
        }
    }

    return newObj;
}

const obj = {
    a: 1,
    b: {
        c: 2,
        d: [  3, 4, { e: 2}]
    }
}

console.log(deepCopy(obj));