# 服务器部署指南

## 环境要求

| 依赖 | 版本要求 |
|------|---------|
| Git | 任意版本 |
| Docker | ≥ 20.x |
| 操作系统 | Linux (CentOS / Ubuntu / Rocky 等) |

---

## 一、首次部署

### 1. 安装 Docker（如果未安装）

```bash
# CentOS / Rocky
curl -fsSL https://get.docker.com | bash
sudo systemctl enable docker && sudo systemctl start docker

# Ubuntu
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER
# 重新登录使组生效
```

### 2. 克隆代码

```bash
git clone git@github.com:leyoai/ai-cesuan-demo.git /data/web/ai-cesuan-demo
cd /data/web/ai-cesuan-demo
```

> 如果服务器 SSH key 未添加到 GitHub，需要先配置：
> ```bash
> ssh-keygen -t ed25519 -C "你的邮箱"
> cat ~/.ssh/id_ed25519.pub
> ```
> 将输出的公钥添加到 GitHub → Settings → SSH and GPG keys

### 3. 一键部署

```bash
bash deploy.sh
```

部署脚本会自动完成：
1. 拉取最新代码
2. 构建 Docker 镜像
3. 关停并删除旧容器（如有）
4. 启动新容器
5. 验证服务是否正常

### 4. 配置防火墙

```bash
# firewalld（CentOS / Rocky）
sudo firewall-cmd --zone=public --add-port=8001/tcp --permanent
sudo firewall-cmd --reload

# ufw（Ubuntu）
sudo ufw allow 8001/tcp
```

---

## 二、日常更新部署

代码提交到 GitHub 后，在服务器上执行：

```bash
cd /data/web/ai-cesuan-demo
bash deploy.sh
```

脚本会自动拉取最新代码并完成部署。

---

## 三、其他命令

| 操作 | 命令 |
|------|------|
| 查看运行状态 | `docker ps -a \| grep ai-cesuan-demo` |
| 查看实时日志 | `docker logs -f ai-cesuan-demo` |
| 停止容器 | `docker stop ai-cesuan-demo` |
| 启动容器 | `docker start ai-cesuan-demo` |
| 重启容器 | `docker restart ai-cesuan-demo` |
| 手动构建镜像 | `docker build -t ai-cesuan-demo:latest .` |
| 删除镜像 | `docker rmi ai-cesuan-demo:latest` |

---

## 四、环境变量

如需配置 Gemini API 等参数，在项目目录创建 `.env.local` 文件：

```bash
cd /data/web/ai-cesuan-demo
cat > .env.local << 'EOF'
ENABLE_GEMINI="true"
GEMINI_API_KEY="你的API密钥"
GEMINI_MODEL="gemini-2.5-flash"
EOF
```

然后重新部署即可生效：

```bash
bash deploy.sh
```

---

## 五、查看服务

部署成功后访问：

```
http://<服务器IP>:8001
```

验证 API 是否正常：

```bash
curl http://localhost:8001/api/session
```
