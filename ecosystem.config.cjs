module.exports = {
  apps: [
    {
      name: 'plankbevelen-blog',
      script: '.output/server/index.mjs',
      exec_mode: 'cluster',
      instances: 'max',
      cwd: '/var/www/plankbevelen-blog'
      // watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      // max_memory_restart: '300M',
      autorestart: true,
      time: true
    }
  ]
};