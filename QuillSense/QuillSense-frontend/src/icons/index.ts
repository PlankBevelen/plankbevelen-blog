 /*
   第一个参数是:'./svg' => 需要检索的目录，
   第二个参数是：false => 是否检索子目录,
   第三个参数是: /\.svg$/ => 匹配文件的正则
  */
const req = require.context('../assets/icons', true, /\.svg$/)
const requireAll = (requireContext: any) => requireContext.keys().map(requireContext)
requireAll(req)

