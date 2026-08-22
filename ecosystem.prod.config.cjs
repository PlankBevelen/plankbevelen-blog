/**
 * PM2 生产环境
 *
 *   pm2 startOrReload ecosystem.prod.config.cjs --update-env
 */

module.exports = {
  apps: [
    {
      name: 'plankbevelen-blog-prod',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      node_args: '--max-old-space-size=768 --env-file=.env',
      exec_mode: 'cluster',
      instances: 2,
      cwd: '/var/www/plankbevelen-blog',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        APP_ENV: 'prod',
      },
      out_file: '/var/www/plankbevelen-blog-logs/prod/logs/out.log',
      error_file: '/var/www/plankbevelen-blog-logs/prod/logs/error.log',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      time: true,
      wait_ready: true,
      listen_timeout: 30000,
      kill_timeout: 10000,
      listen_timeout_retry: 5000,
    },
  ],
}
