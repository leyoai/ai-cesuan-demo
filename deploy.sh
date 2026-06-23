#!/bin/bash
#
# ai-cesuan-demo 部署脚本
# 用法: bash deploy.sh
#

set -e

IMAGE_NAME="ai-cesuan-demo:latest"
CONTAINER_NAME="ai-cesuan-demo"
PORT=8001
BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  ai-cesuan-demo 部署脚本"
echo "  镜像: ${IMAGE_NAME}"
echo "  容器: ${CONTAINER_NAME}"
echo "  端口: ${PORT}"
echo "  分支: ${BRANCH}"
echo "  目录: ${SCRIPT_DIR}"
echo "===================================="
echo ""

# ---- Step 1: 检查 Git 并拉取最新代码 ----
echo "[1/6] 检查 Git 仓库 ..."
cd "${SCRIPT_DIR}"
if [ -d .git ]; then
  echo "  当前分支: $(git rev-parse --abbrev-ref HEAD)"
  echo "  拉取最新代码 (${BRANCH}) ..."
  git checkout ${BRANCH}
  git pull origin ${BRANCH}
  echo "✅ 代码已更新"
else
  echo "  ⚠️  当前目录不是 Git 仓库，跳过拉取"
fi

# ---- Step 2: 检查 Docker 是否安装 ----
echo ""
echo "[2/6] 检查 Docker ..."
if ! command -v docker &>/dev/null; then
  echo "❌ Docker 未安装，请先安装 Docker"
  exit 1
fi
echo "✅ Docker 已安装 ($(docker --version))"

# ---- Step 3: 构建 Docker 镜像 ----
echo ""
echo "[3/6] 构建 Docker 镜像 ..."
docker build -t "${IMAGE_NAME}" .
echo "✅ 镜像构建完成"

# ---- Step 4: 检查已有容器并关停 ----
echo ""
echo "[4/6] 检查已有容器 ..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "  发现已有容器 [${CONTAINER_NAME}]"

  # 检查是否正在运行
  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "  容器正在运行，执行关停 ..."
    docker stop "${CONTAINER_NAME}"
    echo "  ✅ 容器已停止"
  else
    echo "  容器已停止"
  fi

  echo "  删除旧容器 ..."
  docker rm "${CONTAINER_NAME}"
  echo "  ✅ 旧容器已删除"
else
  echo "  无已有容器，跳过"
fi

# ---- Step 5: 检查端口是否被占用 ----
echo ""
echo "[5/6] 检查端口 ${PORT} ..."
if docker ps --format '{{.Ports}}' | grep -q ":${PORT}->"; then
  echo "  ⚠️  端口 ${PORT} 已被其他容器占用，请检查"
fi
echo "✅ 端口检查完成"

# ---- Step 6: 启动新容器 ----
echo ""
echo "[6/6] 启动新容器 ..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${PORT}:${PORT}" \
  "${IMAGE_NAME}"

echo "✅ 容器已启动"
echo ""

# ---- 验证 ----
sleep 2
echo "===================================="
echo "  部署验证"
echo "===================================="
echo ""

# 检查运行状态
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "✅ 容器运行中"
  echo ""
  echo "  容器详情:"
  docker ps --filter "name=${CONTAINER_NAME}" --format "  ID: {{.ID}} | 状态: {{.Status}} | 端口: {{.Ports}}"
  echo ""
  echo "  服务测试:"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:${PORT}/ 2>/dev/null || echo "超时")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ 服务正常 (HTTP ${HTTP_CODE})"
  else
    echo "  ⚠️  服务返回 HTTP ${HTTP_CODE}，请检查日志: docker logs ${CONTAINER_NAME}"
  fi
else
  echo "❌ 容器启动失败，请检查日志:"
  echo "   docker logs ${CONTAINER_NAME}"
  echo "   docker ps -a | grep ${CONTAINER_NAME}"
fi

echo ""
echo "===================================="
echo "  部署完成"
echo "  访问地址: http://<服务器IP>:${PORT}"
echo "===================================="
