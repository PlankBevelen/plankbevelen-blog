# Jenkins Deployment

This project deploys two environments to the same server:

- Production: `plankbevelen.cn` -> `127.0.0.1:3000`
- Test: `test.plankbevelen.cn` -> `127.0.0.1:3001`

## Jenkins Requirements

- Jenkins node has Node.js 22+, `tar`, `ssh`, `scp`, and `curl`.
- Jenkins has an SSH private key credential named `plankbevelen-prod-ssh`.
- The SSH key can log in to `root@8.141.114.140`.
- The pipeline is a multibranch pipeline or otherwise sets `BRANCH_NAME`.

Branch mapping:

- `dev` is the development branch and does not deploy automatically.
- `test` deploys to test.
- `main` deploys to production.

## Server Bootstrap

Create directories:

```bash
mkdir -p /var/www/plankbevelen-blog/{test,prod}/{releases,shared/uploads,logs}
```

Create real env files from the templates:

```bash
cp .env.test.example /var/www/plankbevelen-blog/test/shared/.env
cp .env.production.example /var/www/plankbevelen-blog/prod/shared/.env
```

Edit both files with real MongoDB, admin, and auth values before the first deploy.

Install PM2 on the server if needed:

```bash
npm install -g pm2
```

## Nginx

Use `deploy/nginx/plankbevelen-blog.conf` as the base Nginx config, then issue HTTPS certificates for both domains.

Only expose ports `80`, `443`, and `22` in the cloud security group. Keep Nuxt ports `3000` and `3001` bound to localhost through Nginx.

## Security Note

Any password pasted into chat or logs should be treated as exposed. Rotate the server password and prefer SSH key login for Jenkins.
