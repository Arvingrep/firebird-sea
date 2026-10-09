# 火鸟门户 (Firebird SEA) 不可变镜像基座与生产升级交付规范

## 1. 概述与核心原则
为了彻底避免云原生多副本与 HPA 自动水平伸缩环境下的“配置/扩展偶发缺失”，火鸟门户生产镜像实施严格的**不可变基座（Immutable Base Image）**标准：
- **严禁容器内手工热修（No Hotfix In Pod）**：杜绝通过 `kubectl exec` / `cp` 方式临时打补丁。
- **构建期固化（Build-time Immutability）**：所有商业解密扩展（`huoniao.so` / `swoole_loader`）、系统级配置、Nginx FastCGI 缓冲均固化至 Dockerfile 镜像层与 Helm Chart 声明式配置中。
- **GitOps 与 CI/CD 自动化**：所有发布必须经过代码仓库 Commit ➔ GitHub Actions CI 自动化构建并推送 GAR ➔ ArgoCD 声明式滚动更新。

---

## 2. 核心架构固化细节

### 2.1 底层 PHP 扩展固化 (Dockerfile.web)
- 镜像构建阶段直接将 `huoniao.so` COPY 到 `/usr/local/lib/php/extensions/no-debug-non-zts-20190902/` 官方扩展目录。
- 自动写入 `/usr/local/etc/php/conf.d/docker-php-ext-swoole_loader.ini`：
  ```ini
  extension=huoniao.so
  swoole_loader.license_files=/var/www/html/huoniao
  ```
- 启动钩子 `entrypoint-web.sh` 在容器 cold start 时进行双重检查兜底，保证无论挂载何种 emptyDir 卷，扩展绝对存在且正常加载。

### 2.2 生产与金丝雀数据库物理隔离
- **生产环境 (Production)**：连接独立数据库 `firebird_manila`。
- **金丝雀环境 (Canary)**：连接独立克隆数据库 `firebird_canary`。
- 严禁 Canary 跨环境读写生产库，实现真实环境验收零污染。

### 2.3 动态域名自适应与 FastCGI 缓冲优化
- 移除 Nginx 硬编码的 `HTTP_HOST`，恢复 `common.inc.php` 动态当前 Host 桥接逻辑，多域名及金丝雀环境静态资源无缝同源加载。
- Nginx FastCGI 缓冲区扩大配置：
  ```nginx
  fastcgi_buffer_size 128k;
  fastcgi_buffers 4 256k;
  fastcgi_busy_buffers_size 256k;
  ```
  彻底解决火鸟系统超大 Cookie 导致的 502 Bad Gateway 响应头溢出问题。

### 2.4 地图 SDK 缺 AK 安全降级保护 (Map Safe Fallback)
- 当系统未配置第三方商业地图 AK（如百度、谷歌、高德地图 Key 为空）时，自动降级至本地安全 Mock 桩 `/static/js/map_fallback.js`。
- 彻底杜绝百度地图官方 JS SDK 在无 AK 访问时向终端用户弹出 `APP不存在，AK有误请检查再重试` 模态弹窗，提供透明兼容保护。


---

## 3. CI/CD 流水线与发布拓扑
1. **CI 触发**：推送至 `main` 分支 ➔ 触发 `.github/workflows/ci-gke.yml`。
2. **自动化质检**：
   - 一人团队 Quality & Documentation Gate 验证 (`scripts/verify-task.sh`)。
   - Helm Lint 与模板语法渲染验证。
3. **镜像构建与推送**：
   - Docker Buildx 多架构构建 `firebird-web` 与 `firebird-api`。
   - 推送至 Google Artifact Registry (GAR)：
     - `asia-southeast1-docker.pkg.dev/fh580-70533/containers/firebird-php:<Git-SHA>`
     - `asia-southeast1-docker.pkg.dev/fh580-70533/containers/firebird-php:latest`
4. **CD 自动同步**：
   - ArgoCD 监听到镜像/代码更新，实施 GKE 无损平滑滚动升级（RollingUpdate）。
