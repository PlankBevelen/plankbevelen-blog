/**
 * PM2 测试环境
 *
 *   pm2 startOrReload ecosystem.test.config.cjs --update-env
 */

module.exports = {
  apps: [
    {
      name: 'plankbevelen-blog-test',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      node_args: '--env-file=.env',
      exec_mode: 'fork',
      instances: 1,
      cwd: '/var/www/plankbevelen-blog',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
        APP_ENV: 'test',
      },
      out_file: '/var/www/plankbevelen-blog-logs/test/logs/out.log',
      error_file: '/var/www/plankbevelen-blog-logs/test/logs/error.log',
      merge_logs: true,
      max_memory_restart: '400M',
      autorestart: true,
      time: true,
    },
  ],
}
