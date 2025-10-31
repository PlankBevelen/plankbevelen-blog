/* setup */

// setup是组合式API的入口函数，其设计核心为：将组件逻辑按功能拆分，而非按选项拆分。
// 它将组件的创建、渲染、更新、销毁等流程封装成一个整体，并提供统一的接口，让开发者可以专注于业务逻辑的实现。

// setup函数的调用时机：
// 精确在组件实例创建后，beforeCreate之后，created之前调用。
// 关键特性：
// 此时组建的data、computed、methods、watch、props等选项式API尚未被初始化，且this指向undefined。
// 例：若在 setup 中打印 this，结果为 undefined；若在 setup 中尝试访问 this.data，会直接报错。

// setup的参数：
// setup 函数接收两个参数：props 和 context。
// props：组件的 props 对象，是一个只读的对象，可以直接通过props.xxx访问，用于接收父组件传递的数据。
// context：组件的上下文对象，包含三个属性：attrs、slots、emit。
// attrs：父组件传递的 “未在 props 中声明的属性”
// slots：组件的插槽对象，是一个只读的对象，可以通过this.$slots.xxx访问，用于获取父组件传递的插槽。
// emit：组件的事件发射器，是一个函数，可以通过this.$emit('xxx')触发父组件的事件。
