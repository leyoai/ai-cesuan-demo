# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# 先安装依赖（利用 Docker 缓存层）
COPY package.json package-lock.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ---- Run Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/package-lock.json ./

# 只安装生产依赖
RUN npm ci --omit=dev

# 容器内部端口
ENV NODE_ENV=production
ENV PORT=8001
EXPOSE 8001

CMD ["node", "dist/server.cjs"]
