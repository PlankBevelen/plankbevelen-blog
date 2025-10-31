// 获取当前icon目录所有以.svg为后缀的文件
const context = require.context('./icon', false, /\.svg$/)
// 解析获取.svg文件的文件名称，并返回
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
// 执行
requireAll(context)