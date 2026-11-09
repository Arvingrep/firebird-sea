# ==============================================================================
# 🔥 Firebird Go 迁移服务 — services/firebird-go（#231）
# ==============================================================================
#
# PHP→Go 主站迁移的宿主服务骨架。与 Dockerfile.api-go（/tg-api 线）互相独立：
# 两个服务各一个 Dockerfile、各一个镜像，合并会让两条迁移线共享发布节奏。
# 构建上下文必须是仓库根（`docker build -f deploy/docker/Dockerfile.go .`）。

# Stage 1: 编译（依赖层单独缓存，改动源码不重新下载依赖）
FROM golang:1.27-alpine AS builder

WORKDIR /src

ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOFLAGS=-mod=readonly

# 先只拷 go.mod / go.sum：依赖层缓存不随源码变化失效
COPY services/firebird-go/go.mod services/firebird-go/go.sum ./services/firebird-go/
RUN cd services/firebird-go && go mod download

COPY services/firebird-go ./services/firebird-go

# CGO 已关：纯静态二进制，配 distroless/static 运行层
RUN cd services/firebird-go && \
    go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# Stage 2: 运行 —— distroless/static，非 root（#231 约定）
# 没有 shell / wget，K8s 探针走 HTTP（deployment-go.yaml），不用 HEALTHCHECK。
FROM gcr.io/distroless/static-debian12:nonroot AS runner

WORKDIR /app

COPY --from=builder /out/server /app/server

ENV PORT=8080

USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/server"]
