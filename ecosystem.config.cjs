module.exports = {
  apps: [
    {
      name: 'plankbevelen-blog-prod',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      node_args: '--env-file /var/www/plankbevelen-blog/prod/shared/.env',
      exec_mode: 'fork',
      instances: 1,
      cwd: '/var/www/plankbevelen-blog/prod/current',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      out_file: '/var/www/plankbevelen-blog/prod/logs/out.log',
      error_file: '/var/www/plankbevelen-blog/prod/logs/error.log',
      merge_logs: true,
      max_memory_restart: '400M',
      autorestart: true,
      time: true
    },
    {
      name: 'plankbevelen-blog-test',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      node_args: '--env-file /var/www/plankbevelen-blog/test/shared/.env',
      exec_mode: 'fork',
      instances: 1,
      cwd: '/var/www/plankbevelen-blog/test/current',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      out_file: '/var/www/plankbevelen-blog/test/logs/out.log',
      error_file: '/var/www/plankbevelen-blog/test/logs/error.log',
      merge_logs: true,
      max_memory_restart: '400M',
      autorestart: true,
      time: true
    }
  ]
};
