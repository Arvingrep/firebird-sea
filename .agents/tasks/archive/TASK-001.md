# Task Spec: TASK-001-下载解压官方旗舰版初始安装包与解构

> 状态: `PENDING`  
> 创建时间: 2026-10-08  
> 分支: `feat/TASK-001-download-extract-package`  

---

### 1. 业务目标 (Objective)
- 从酷曼云官方对象存储下载最新的火鸟门户旗舰版初始安装包（~270MB）。
- 解压至 `webroot/` 目录，将官方商业授权证书注入 `webroot/include/huoniao.php`。
- 解构外卖（`waimai`）、跑腿（`paotui`）和支付网关插件（`api/payment/`）目录结构，为下一步接入 USDT 支付与 TG Mini App 做好代码级准备。

---

### 2. 详细执行流程 (Specification)
1. 运行 `curl -L` 下载 `https://obs.kumanyun.com/package_system/火鸟门户初始化安装包.zip?v=2026012904` 至 `downloads/` 目录。
2. 校验文件完整性并解压至 `webroot/`。
3. 检查授权文件 `webroot/include/huoniao.php` 是否正确被加载。
4. 检视 `api/payment/` 目录下的既有支付插件（如 `alipay` / `wxpay` / `paypal`），提取插件标准接口（`pay()`、`notify()`、`return()` 函数签名）。

---

### 3. 验收标准 (Acceptance Criteria - AC)
- [ ] **AC 1**：`webroot/` 目录下存在完整的火鸟核心文件结构（`api/`, `include/`, `templates/`, `static/`）。
- [ ] **AC 2**：`webroot/include/huoniao.php` 存在且包含 `$kumanyun_user_keys` 授权密钥。
- [ ] **AC 3**：同步产出文档 `/docs/internal/PAYMENT_PLUGIN_SPEC.md`，记录火鸟支付插件开发规范。
- [ ] **AC 4**：执行 `make verify` 检查 Docs 卡点全部通过。
