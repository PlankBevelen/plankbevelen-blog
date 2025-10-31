const path = require("path");
const webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, dir)
}

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
      title: 'JoyMart | 简约高端电商体验',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
   // css 配置
  css: {
    loaderOptions: {
      less: {
        // 全局引入less样式
        additionalData: `
          @import "@/assets/styles/common.less";
        `,
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  },
  chainWebpack: config => {
    config.module
    .rule('svg')
    .exclude.add(resolve('./src/components/SvgIcon/icon'))
    .end()
    config.module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('./src/components/SvgIcon/icon'))
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({symbolId: 'icon-[name]'})
    .end()

    config.resolve.symlinks(true); // 修复热更新失效

    config.module
      .rule("i18n")
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use("i18n")
        .loader("@kazupon/vue-i18n-loader")
        .end();
  },
  /* devServer: {
    client: {
      overlay: {
        warnings: true,
        errors: true
      }
    },
    
    allowedHosts: 'all',
    host: "0.0.0.0",
    port: process.env.VUE_APP_DEV_PORT,
    https: false, 
    // public: 'http://0.0.0.0:8080',
    hot: true,  // 启用热模块替换
    historyApiFallback: true, // 当使用HTML5路由时重定向到index.html
    proxy: {
      '/api': {
        'target': 'http://localhost:9527',  // 目标服务器地址
        changeOrigin: true, // 是否改变源
        pathRewrite: { '^/api': '' }, // 路由路径，去除前缀
      }
    }
  } */
}
