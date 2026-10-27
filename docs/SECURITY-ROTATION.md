# 凭据轮换操作单

> 触发原因：2026-10-27 研发框架审计发现多处凭据以明文形式存在于 Git 仓库与历史提交中。
> **仓库里删除文件不等于风险解除** —— 密钥一旦进过 Git 历史，就必须假设它已泄露。

本文按「风险从高到低」排列。每项都写明：为什么必须换、谁来换、换完怎么验证、换完还要做什么。

---

## 0. 微信支付商户 API 私钥（最高优先级）

**风险**：4 份 2048-bit RSA 商户私钥在仓库中，`wxpayTransfers.php`（企业付款到零钱）与
`wxpayRefund.php`（退款）直接引用它们。持有私钥即可伪造商户签名，向微信支付发起
退款 / 转账类请求。

**泄露面**：

| 文件 | 用途 |
|---|---|
| `webroot/api/payment/wxpay/cert/apiclient_key.pem` | 主商户号 |
| `webroot/api/payment/wxpay/cert/app/apiclient_key.pem` | 子商户 / App 支付 |
| `webroot/api/payment/wxpay/cert/app_bak/apiclient_key.pem` | 历史备份（轮换后直接删） |
| `webroot/api/payment/wxpay/cert/partner/apiclient_key.pem` | 服务商 |

**换法**（必须你本人操作，需要商户平台管理员权限）：

1. 微信支付商户平台 → 账户中心 → API 安全 → **API 证书 / 密钥管理**
2. 为受影响商户号 **重新申请 API 证书**，得到新的 `apiclient_key.pem` + `apiclient_cert.pem`
3. 在平台侧**作废旧证书**（作废后旧私钥立即失效，这是关键一步）
4. 新私钥不要放回 Git，改为：

   ```bash
   kubectl --context gcp-gke create secret generic firebird-wxpay-cert \
     -n default \
     --from-file=apiclient_key.pem=/path/to/new/apiclient_key.pem \
     --from-file=apiclient_cert.pem=/path/to/new/apiclient_cert.pem \
     --from-file=apiclient_cert.p12=/path/to/new/apiclient_cert.p12
   ```

5. 把 `wxpayTransfers.php` / `wxpayRefund.php` 里的 `key_path` 改成读挂载路径
   （建议 `/secrets/wxpay/apiclient_key.pem`），Pod 挂载该 Secret。
   **这一步会动支付代码，必须先在 canary 用真实小额走一遍退款再上生产。**
6. 完成后从 `.agents/secret-scan-allow.txt` 删除对应 4 行，门禁会重新全绿。

**在此之前**：`app_bak` 那份是纯历史备份，代码不引用，可以先删（`git rm`），零风险。

---

## 1. Telegram Bot Token

**已完成的**：邮件中继的 token 已从 `deploy/k8s-mail-server.yaml` 移除，改由
`Secret/firebird-mail-secrets` 注入；旧清单归档至 `docs/archive/mail-server-manual-2026-10-27.tar.gz`。

**需要你做的**：

1. Telegram 里对 `@BotFather` 发 `/mybots` → 选 `@fbird_men_bot` → **API Token** → **Revoke current token**
2. 拿到新 token 后更新两处：

   ```bash
   # ① 邮件中继
   kubectl --context gcp-gke patch secret firebird-mail-secrets -n default \
     --type merge -p "{\"stringData\":{\"telegram-bot-token\":\"<NEW_TOKEN>\"}}"
   kubectl --context gcp-gke rollout restart deployment/firebird-mail -n default

   # ② n8n 派单链（webhook 与卡片发送都用它）
   #    n8n 控制台 → Credentials → Telegram account → 更新 token
   ```

3. 更新本机 `.env` 的 `TELEGRAM_BOT_TOKEN`（该文件不入 Git）
4. 验证：`curl -s "https://api.telegram.org/bot<NEW_TOKEN>/getMe"` 应返回 `"ok":true`

> 注意：轮换后旧的 `8865562503:AAG...` 会立即失效。仓库里这串已随旧清单归档，
> 但**归档文件仍在 Git 历史中**，所以轮换是必须的，不能只靠删文件。

---

## 2. SMTP 密码

**已完成的**：`SMTP_PASS` 已改由 `Secret/firebird-mail-secrets` 的 `smtp-pass` 注入；
`server.js` 改为 **fail-closed**：没有 `SMTP_PASS` 时进程拒绝启动，任何密码都无法通过认证。

**需要你做的**：

1. 决定新密码（建议 24 位随机：`openssl rand -base64 24`）
2. 更新 Secret：

   ```bash
   kubectl --context gcp-gke patch secret firebird-mail-secrets -n default \
     --type merge -p "{\"stringData\":{\"smtp-pass\":\"<NEW_PASS>\"}}"
   kubectl --context gcp-gke rollout restart deployment/firebird-mail -n default
   ```

3. 通知所有使用该 SMTP 的服务（`n8n` 邮件节点、`services/api` 的发信配置）同步改密码
4. 验证（集群内）：

   ```bash
   POD=$(kubectl --context gcp-gke get pod -n default -l app=firebird-mail -o name | head -1)
   kubectl --context gcp-gke exec -n default ${POD#pod/} -- \
     node -e "console.log('SMTP_PASS 已注入:', !!process.env.SMTP_PASS)"
   ```

---

## 3. 邮件服务 TLS 私钥

**已完成的**：`key.pem` 已从 ConfigMap 移到 `Secret/firebird-mail-tls`，
以只读方式挂载到 `/tls`（`defaultMode: 0400`）；`cert.pem` 是公钥证书，仍在
ConfigMap 中随 Git 管理，无风险。

**需要你做的**（自签证书，10 年有效期，当前到 2036-10-06）：

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout key.pem -out cert.pem -subj "/CN=firebird-mail"

kubectl --context gcp-gke create secret generic firebird-mail-tls -n default \
  --from-file=key.pem=./key.pem --dry-run=client -o yaml | kubectl --context gcp-gke apply -f -

cp cert.pem deploy/mail-relay/cert.pem   # 公钥证书可入库，随 Git 更新

kubectl --context gcp-gke rollout restart deployment/firebird-mail -n default
```

---

## 4. 换完之后的自检

```bash
# 门禁应当全绿（欠债项清空）
make gates

# 邮件中继健康
kubectl --context gcp-gke get pods -n default -l app=firebird-mail
kubectl --context gcp-gke logs -n default -l app=firebird-mail --tail=10

# ArgoCD 应显示 Synced / Healthy
kubectl --context mac-mini-orbstack get application firebird-mail -n argocd
```

---

## 关于 Git 历史

即使完成上述全部轮换，**旧凭据仍然存在于 Git 历史中**。这不要紧，因为轮换后它们已失效。
但如果仓库将来要公开，或用 `git subtree` 提取子目录给别人，必须先用
`git filter-repo` 清洗历史。当前仓库为私有，暂不强制。
