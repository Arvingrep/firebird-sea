# 东南亚（菲律宾）本地化工程规范 (Philippines Localization Spec)

---

## 1. 语言与字典架构 (English / Tagalog / 中文)

### 1.1 字典组织机制
火鸟系统前端模板采用 `include/lang/{langCode}.js` 进行客户端异步翻译，服务端采用 `include/lang/{langCode}/` 数组字典。
- 默认语系：`en-US`（菲律宾商务主导语言）
- 次级支持：`zh-CN`（在菲华人与海外商家）
- 骑手/本地消费者：`tl-PH`（塔加洛语，针对跑腿骑手端交互）

### 1.2 动态语言切换挂载点
在 `include/common.inc.php` 中注入语言拦截器：
```php
// 优先依据 Telegram WebApp 传入的 language_code，其次读取 Cookie
$lang = !empty($_GET['lang']) ? $_GET['lang'] : (!empty($_COOKIE['lang']) ? $_COOKIE['lang'] : 'en-US');
define('HUONIAOLANG', $lang);
```

---

## 2. 货币与清算体系 (PHP ₱ / USDT)

### 2.1 标价与法币显示
- 官方货币符号：`₱` (Philippine Peso)
- 货币代码：`PHP`
- 小数点格式：`₱ 1,250.00`

### 2.2 汇率折算与 USDT 清算
- 汇率服务：`services/api` 中内置每日/定时汇率中间件（自 OKX / Binance 获取 USDT/PHP 实时盘口，例 `1 USDT ≈ 58.2 PHP`）。
- 前端展示：
  $$\text{菜品原价：} ₱ 580.00 \quad \longleftrightarrow \quad \approx 10.00 \text{ USDT}$$
- 链上支付：实际扫码金额包含防碰撞尾数（例如 `10.02 USDT`）。

---

## 3. 手机号与短信通道 (+63 Philippines)

### 3.1 手机格式正规化校验
菲律宾手机号格式规则（主流电信运营商：Globe / Smart / DITO）：
- 国际标准：`+63 9XX XXX XXXX`（总长 12 位）
- 本地输入：`09XX XXX XXXX`（总长 11 位）
- 校验正则表达式：
  ```javascript
  const PH_PHONE_REGEX = /^(?:\+63|0)9\d{9}$/;
  ```

### 3.2 短信通道插件化
替换国内阿里云短信，在火鸟的短信接口层接入国际通道：
- **Primary**：Twilio SMS API (`+63` 抵达率 > 99%)
- **Backup**：Sinch / Infobip
