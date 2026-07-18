# Jenkins 自动化部署

## 分支规则

- `dev`：开发分支，只执行依赖安装和构建验证，不部署服务器。
- `test`：测试环境分支，部署到 `test.plankbevelen.cn`。
- `main`：生产环境分支，部署到 `plankbevelen.cn`。

推荐流程：

```bash
git checkout dev
# 开发完成后
git checkout test
git merge dev
git push origin test

# 测试通过后
git checkout main
git merge test
git push origin main
```

## Jenkins 配置

创建任务：

1. `新建任务`
2. 选择 `多分支流水线`
3. `分支源` 添加 GitHub 仓库
4. `构建配置` 使用 `Jenkinsfile`
5. 点击 `立即扫描多分支流水线`

需要插件：

- Pipeline / 流水线
- Git
- SSH Agent
- Credentials / 凭据
- Multibranch Pipeline / 多分支流水线

需要凭据：

- ID：`plankbevelen-prod-ssh`
- 类型：`SSH Username with private key`
- 用户名：`root`
- 私钥：能 SSH 登录 `8.141.114.140` 的私钥

## 服务器目录

```bash
mkdir -p /var/www/plankbevelen-blog/{test,prod}/{releases,shared/uploads,logs}
```

真实环境变量文件：

```bash
/var/www/plankbevelen-blog/test/shared/.env
/var/www/plankbevelen-blog/prod/shared/.env
```

分别参考仓库中的 `.env.test` 和 `.env.prod`，复制到服务器后再改真实密码。

## 常用检查

```bash
pm2 status
pm2 logs plankbevelen-blog-test
pm2 logs plankbevelen-blog-prod
curl -I https://test.plankbevelen.cn/api/health
curl -I https://plankbevelen.cn/api/health
```
