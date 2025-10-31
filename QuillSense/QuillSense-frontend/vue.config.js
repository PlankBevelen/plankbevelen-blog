const path = require("path");
const webpack = require('webpack');

module.exports = {
  transpileDependencies: true,
  
  // 输出文件目录
  outputDir: 'dist',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: false,
  pages: {
    index: {
      // page入口
      entry: 'src/main.ts',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      title: '羽毛笔-AI智能文档处理工具',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({symbolId: 'icon-[name]'})

    config.resolve.symlinks(true); // 修复热更新失效

    config.module
      .rule("i18n")
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use("i18n")
        .loader("@kazupon/vue-i18n-loader")
        .end();
  }
}