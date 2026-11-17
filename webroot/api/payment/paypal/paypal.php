<?php
/**
 * PayPal 在线支付（REST Orders v2）
 *
 * 旧版 NVP/SOAP（API 用户名/密码/签名）已废弃，改用 Client ID + Secret。
 *
 * 流程：
 *   get_code()  换 access token → Create Order(intent=CAPTURE) → 302 到 approve 链接
 *   respond()   三种入口，由同一个方法分发：
 *               1) return.php 回跳（带 token=PayPal 订单号）→ Capture
 *               2) notify.php Webhook（PAYMENT.CAPTURE.COMPLETED）→ 验签后入账
 *               3) 取消回跳（cancel=1）→ 订单保持未支付并提示
 *
 * 幂等：`#@__paypal_txn` 表按 PayPal order id / capture id 唯一；
 *       入账前用 UPDATE 抢锁，且 order_paid() 自身只处理 pay_log.state=0 的订单。
 *
 * @package        HuoNiao.Payment
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "paypal";

    /* 名称 */
    $payment[$i]['pay_name'] = "paypal在线支付";

    /* 版本号 */
    $payment[$i]['version']  = '2.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = 'PayPal（www.paypal.com）REST Orders v2。需在 PayPal 开发者后台 Apps & Credentials 获取 Client ID 与 Secret，并在 Webhooks 中添加回调地址 https://你的域名/api/payment/notify.php?code=paypal ，订阅事件 PAYMENT.CAPTURE.COMPLETED，把生成的 Webhook ID 填到下方。';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',  'name' => 'charge',     'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => 'Client ID',   'name' => 'client_id',  'type' => 'text'),
        array('title' => 'Secret',      'name' => 'secret',     'type' => 'text'),
        array('title' => '环境',        'name' => 'env',        'type' => 'select', 'options' => array(
            'sandbox' => 'Sandbox（测试）',
            'live'    => 'Live（正式）'
        )),
        array('title' => 'Webhook ID',  'name' => 'webhook_id', 'type' => 'text', 'description' => 'PayPal 开发者后台创建 Webhook 后生成的 ID，用于校验回调签名；不填则 Webhook 兜底不可用。'),
        array('title' => '付款页语言/地区', 'name' => 'locale', 'type' => 'text', 'description' => 'PayPal 付款页的语言与地区，如 en-PH（菲律宾英文，默认）、zh-CN。留空使用 en-PH。'),
        array('title' => '支付货币',    'name' => 'type',       'type' => 'select', 'options' => array(
            'PHP' => '菲律宾比索 - PHP',
            'USD' => '美元 - USD',
            'AUD' => '澳元 - AUD',
            'CAD' => '加元 - CAD',
            'EUR' => '欧元 - EUR',
            'GBP' => '英镑 - GBP',
            'JPY' => '日元 - JPY',
            'HKD' => '港元 - HKD',
            'SGD' => '新加坡元 - SGD',
            'THB' => '泰铢 - THB',
            'NZD' => '新西兰元 - NZD',
            'CHF' => '瑞士法郎 - CHF',
            'SEK' => '瑞典克朗 - SEK',
            'PLN' => '波兰兹罗提 - PLN',
            'NOK' => '挪威克朗 - NOK',
            'TWD' => '新台币 - TWD',
            'MXN' => '墨西哥比索 - MXN',
            'MYR' => '马来西亚林吉特 - MYR',
            'ILS' => '以色列新谢克尔 - ILS',
            'HUF' => '匈牙利福林 - HUF',
            'DKK' => '丹麦克朗 - DKK',
            'CZK' => '捷克克朗 - CZK',
            'BRL' => '巴西雷亚尔 - BRL'
        ))
    );

    return;
}

/**
 * 类
 */
class paypal {

    private $_logger = null;

    function __construct(){}

    /* ------------------------------------------------------------------ */
    /* 入口一：下单                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        loadPlug("payment");
        $payment = $this->normalize($payment);

        $sn = isset($order['order_sn']) ? (string)$order['order_sn'] : '';
        if(!$this->validSn($sn)){
            $this->fatal('Invalid order number / 订单号无效');
        }
        if(empty($payment['client_id']) || empty($payment['secret'])){
            $this->log('get_code: client_id/secret 未配置');
            $this->fatal('PayPal is not configured / PayPal 未配置');
        }

        $currency = $this->currencyOf($payment);

        // 金额以服务端 pay_log 为准；取不到时才退回调用方传入的订单金额（同样来自服务端）
        $log = $this->payLog($sn);
        if($log && (int)$log['state'] === 1){
            $this->fatal('Order already paid / 订单已支付');
        }
        $base   = $log ? $log['amount'] : $order['order_amount'];
        $amount = $this->toPayAmount($base, $currency);

        $subject = isset($order['subject']) ? (string)$order['subject'] : $sn;
        $subject = mb_substr(trim(preg_replace('/\s+/u', ' ', strip_tags($subject))), 0, 120, 'UTF-8');

        $paramUrl  = '&module=' . urlencode($order['service']) . '&sn=' . urlencode($sn);
        $returnURL = return_url("paypal", $paramUrl);
        $cancelURL = return_url("paypal", $paramUrl . '&cancel=1');

        $body = array(
            'intent' => 'CAPTURE',
            'purchase_units' => array(array(
                'reference_id' => $sn,
                'custom_id'    => $sn,
                'description'  => $subject !== '' ? $subject : $sn,
                'amount'       => array(
                    'currency_code' => $currency,
                    'value'         => $amount
                )
            )),
            'payment_source' => array('paypal' => array('experience_context' => array(
                'return_url'          => $returnURL,
                'cancel_url'          => $cancelURL,
                'user_action'         => 'PAY_NOW',
                'shipping_preference' => 'NO_SHIPPING'
            )))
        );

        // 不设置 invoice_id：PayPal 要求其账号内唯一，顾客取消后重试会触发 DUPLICATE_INVOICE_ID
        $res = $this->api($payment, 'POST', '/v2/checkout/orders', $body, array(
            'PayPal-Request-Id: fbs-' . $sn . '-' . bin2hex(random_bytes(6))
        ));

        if($res['code'] < 200 || $res['code'] >= 300 || empty($res['json']['id'])){
            $this->log('create order failed http=' . $res['code'] . ' ' . $this->errBrief($res));
            $this->fatal('Unable to start PayPal checkout, please try again / 无法发起 PayPal 支付，请稍后重试');
        }

        $poid = (string)$res['json']['id'];
        $approve = '';
        if(!empty($res['json']['links']) && is_array($res['json']['links'])){
            // 新版带 payment_source 时 rel 为 payer-action，旧版为 approve
            foreach($res['json']['links'] as $l){
                if(isset($l['rel']) && ($l['rel'] === 'payer-action' || $l['rel'] === 'approve') && !empty($l['href'])){
                    $approve = $l['href'];
                    if($l['rel'] === 'payer-action') break;
                }
            }
        }
        if($approve === '' || !preg_match('#^https://[a-z0-9.\-]*paypal\.com/#i', $approve) || !$this->validId($poid)){
            $this->log('create order: no valid approve link, order=' . $poid);
            $this->fatal('Unable to start PayPal checkout / 无法发起 PayPal 支付');
        }

        // 付款页默认菲律宾英文（区号 +63）。实测创建订单时传 locale 不影响付款页，
        // 需要在跳转链接上加 locale.x / country.x 才生效。
        $loc = $this->localeOf($payment);
        $approve .= (strpos($approve, '?') === false ? '?' : '&') . 'locale.x=' . str_replace('-', '_', $loc) . '&country.x=' . substr($loc, 3);

        $this->ensureTable();
        global $dsql;
        $now = time();
        $env = $this->envOf($payment);
        $sql = $dsql->SetQuery("INSERT INTO `#@__paypal_txn` (`order_sn`, `paypal_order_id`, `status`, `amount`, `currency`, `env`, `created`, `updated`) VALUES ('$sn', '$poid', 'created', '$amount', '$currency', '$env', $now, $now)");
        $dsql->dsqlOper($sql, "update");

        $this->log("create order ok sn=$sn paypal_order=$poid amount=$amount $currency env=$env");

        header("Location: " . $approve);
        die;
    }

    /* ------------------------------------------------------------------ */
    /* 入口二：回跳 / Webhook / 取消                                         */
    /* ------------------------------------------------------------------ */

    /**
     * 响应操作（return.php 与 notify.php 共用）
     */
    function respond(){

        loadPlug("payment");
        $payment = get_payment("paypal");
        if(!$payment){
            return false;
        }
        $payment = $this->normalize($payment);

        // Webhook：PayPal 会带 PAYPAL-TRANSMISSION-SIG 头
        if(!empty($_SERVER['HTTP_PAYPAL_TRANSMISSION_SIG'])){
            $raw = file_get_contents('php://input');
            return $this->handleWebhook($raw, $payment);
        }

        $sn = isset($_REQUEST['sn']) ? (string)$_REQUEST['sn'] : '';
        if(!$this->validSn($sn)){
            return false;
        }

        // 顾客取消
        if(!empty($_REQUEST['cancel'])){
            $this->log("customer cancelled sn=$sn");
            $this->showCancelled();
            return false;
        }

        $poid = isset($_REQUEST['token']) ? (string)$_REQUEST['token'] : '';
        if(!$this->validId($poid)){
            return false;
        }

        return $this->handleReturn($payment, $sn, $poid);
    }

    /**
     * 回跳：核对订单 → Capture → 校验金额币种 → 入账
     */
    private function handleReturn($payment, $sn, $poid){

        $this->ensureTable();
        $row = $this->txnByOrder($poid);
        if(!$row || $row['order_sn'] !== $sn){
            $this->log("return: unknown paypal order $poid for sn=$sn");
            return false;
        }

        $log = $this->payLog($sn);
        if(!$log){
            return false;
        }
        // 已入账（Webhook 先到或重复回跳）：直接视为成功，不再 Capture
        if((int)$log['state'] === 1){
            $this->markPaidIfNeeded($poid);
            return true;
        }

        if(!$this->claim($poid)){
            // Webhook 可能刚好先入账：再看一眼，已入账就算成功
            $again = $this->payLog($sn);
            if($again && (int)$again['state'] === 1){
                return true;
            }
            $this->log("return: sn=$sn order=$poid is being processed elsewhere");
            return false;
        }

        $res = $this->api($payment, 'GET', '/v2/checkout/orders/' . $poid);
        if($res['code'] !== 200 || empty($res['json']['status'])){
            $this->release($poid, 'error');
            $this->log("return: get order failed http={$res['code']} " . $this->errBrief($res));
            return false;
        }
        $status = $res['json']['status'];

        if($status === 'APPROVED'){
            $res = $this->api($payment, 'POST', '/v2/checkout/orders/' . $poid . '/capture', new stdClass(), array(
                'PayPal-Request-Id: fbs-cap-' . $poid
            ));
            if($res['code'] < 200 || $res['code'] >= 300){
                $this->release($poid, 'error');
                $this->log("return: capture failed http={$res['code']} " . $this->errBrief($res));
                return false;
            }
        }elseif($status !== 'COMPLETED'){
            // CREATED（顾客没批准）等
            $this->release($poid, 'created');
            $this->log("return: order $poid status=$status, not capturable");
            return false;
        }

        $cap = $this->firstCapture($res['json']);
        if(!$cap){
            $this->release($poid, 'error');
            $this->log("return: order $poid has no capture");
            return false;
        }

        return $this->settle($sn, $poid, $cap, $row);
    }

    /**
     * Webhook：验签 → PAYMENT.CAPTURE.COMPLETED → 入账
     * 瞬时失败返回 5xx 让 PayPal 重试；验签失败返回 400。
     */
    private function handleWebhook($raw, $payment){

        $event = json_decode($raw, true);
        if(!is_array($event) || empty($event['event_type'])){
            http_response_code(400);
            return false;
        }

        $v = $this->verifyWebhook($raw, $payment);
        if($v !== true){
            $this->log('webhook: signature verify failed (' . $v . ')');
            // 瞬时故障/未配置 Webhook ID 返回 500，让 PayPal 稍后重试；签名无效返回 400
            http_response_code(($v === 'transient' || $v === 'noconfig') ? 500 : 400);
            return false;
        }

        $type = (string)$event['event_type'];
        $this->log('webhook: ' . $type . ' id=' . (isset($event['id']) ? $event['id'] : ''));

        if($type !== 'PAYMENT.CAPTURE.COMPLETED'){
            // DENIED / REFUNDED 等仅记录，返回 200 避免无意义重试
            return true;
        }

        $cap = isset($event['resource']) && is_array($event['resource']) ? $event['resource'] : array();
        $sn  = isset($cap['custom_id']) ? (string)$cap['custom_id'] : '';
        $poid = '';
        if(isset($cap['supplementary_data']['related_ids']['order_id'])){
            $poid = (string)$cap['supplementary_data']['related_ids']['order_id'];
        }
        if(!$this->validSn($sn) || !$this->validId($poid)){
            $this->log('webhook: capture without usable custom_id/order_id');
            return true;
        }

        $this->ensureTable();
        $row = $this->txnByOrder($poid);
        if(!$row || $row['order_sn'] !== $sn){
            // 不是本站下的单（或其他环境的 Webhook），忽略但应答 200
            $this->log("webhook: unknown paypal order $poid sn=$sn, ignored");
            return true;
        }

        $log = $this->payLog($sn);
        if($log && (int)$log['state'] === 1){
            $this->markPaidIfNeeded($poid, isset($cap['id']) ? (string)$cap['id'] : '');
            return true;
        }

        if(!$this->claim($poid)){
            // 回跳正在处理，让 PayPal 稍后重试
            http_response_code(409);
            return false;
        }

        return $this->settle($sn, $poid, $cap, $row);
    }

    /**
     * 校验 capture 与服务端订单一致后入账。调用前必须已 claim。
     */
    private function settle($sn, $poid, $cap, $row){

        $capId  = isset($cap['id']) ? (string)$cap['id'] : '';
        $status = isset($cap['status']) ? (string)$cap['status'] : '';

        if($status !== 'COMPLETED'){
            // PENDING 等：不入账，等 PAYMENT.CAPTURE.COMPLETED
            $this->release($poid, 'created');
            $this->log("settle: sn=$sn capture=$capId status=$status, wait for COMPLETED");
            return false;
        }
        if(!$this->validId($capId)){
            $this->release($poid, 'error');
            $this->log("settle: sn=$sn invalid capture id");
            return false;
        }

        $log = $this->payLog($sn);
        if(!$log){
            $this->release($poid, 'error');
            return false;
        }

        $currency = $row['currency'];
        $expected = $this->toPayAmount($log['amount'], $currency);
        $gotCur   = isset($cap['amount']['currency_code']) ? (string)$cap['amount']['currency_code'] : '';
        $gotVal   = isset($cap['amount']['value']) ? (string)$cap['amount']['value'] : '';
        $gotCid   = isset($cap['custom_id']) ? (string)$cap['custom_id'] : '';

        // custom_id 在 Capture 响应里可能缺省（已通过 txn 表校验过 order 归属），有则必须一致
        if(($gotCid !== '' && $gotCid !== $sn) || $gotCur !== $currency || $this->minor($gotVal, $currency) !== $this->minor($expected, $currency)){
            $this->release($poid, 'mismatch');
            $this->log("settle: MISMATCH sn=$sn capture=$capId expected=$expected $currency got=$gotVal $gotCur custom_id=$gotCid — 需人工核对/退款");
            return false;
        }

        // 同一笔订单已被另一个 PayPal order 入账（顾客重复付款）：不再入账，留痕待退款
        if((int)$log['state'] === 1){
            $this->release($poid, 'duplicate');
            $this->log("settle: DUPLICATE payment sn=$sn capture=$capId — 订单已入账，此笔需人工退款");
            return true;
        }

        global $dsql;
        $now = time();
        $sql = $dsql->SetQuery("UPDATE `#@__paypal_txn` SET `status` = 'paid', `capture_id` = '$capId', `updated` = $now WHERE `paypal_order_id` = '$poid'");
        $dsql->dsqlOper($sql, "update");

        order_paid($sn, $capId);
        $this->log("settle: paid sn=$sn paypal_order=$poid capture=$capId $gotVal $gotCur");
        return true;
    }

    /* ------------------------------------------------------------------ */
    /* PayPal REST 客户端                                                   */
    /* ------------------------------------------------------------------ */

    /** 后台粘贴常带首尾空格/换行，凭证类字段统一去除，避免 PayPal 返回 invalid_client */
    private function normalize($payment){
        foreach(array('client_id', 'secret', 'webhook_id', 'env', 'type') as $k){
            if(isset($payment[$k]) && is_string($payment[$k])){
                $payment[$k] = trim($payment[$k]);
            }
        }
        return $payment;
    }

    /** PayPal 付款页语言/地区（如 en-PH）；格式不合法时退回 en-PH */
    private function localeOf($payment){
        $l = isset($payment['locale']) ? trim($payment['locale']) : '';
        return preg_match('/^[a-z]{2}-[A-Z]{2}$/', $l) ? $l : 'en-PH';
    }

    private function envOf($payment){
        return (isset($payment['env']) && $payment['env'] === 'live') ? 'live' : 'sandbox';
    }

    private function baseUrl($payment){
        return $this->envOf($payment) === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    }

    /**
     * 取 access token（文件缓存，过期前 60 秒刷新）。
     * 缓存放在系统临时目录，权限 0600，不在 web 目录内。
     */
    private function accessToken($payment, $force = false){

        $cid = (string)$payment['client_id'];
        $key = sys_get_temp_dir() . '/fbs_paypal_' . md5($cid . '|' . $this->envOf($payment)) . '.json';

        if(!$force && is_file($key)){
            $c = json_decode((string)@file_get_contents($key), true);
            if(is_array($c) && !empty($c['t']) && !empty($c['exp']) && $c['exp'] > time() + 60){
                return $c['t'];
            }
        }

        $r = $this->http('POST', $this->baseUrl($payment) . '/v1/oauth2/token', array(
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded'
        ), 'grant_type=client_credentials', $cid . ':' . (string)$payment['secret']);

        $j = json_decode($r['raw'], true);
        if($r['code'] !== 200 || empty($j['access_token'])){
            $this->log('oauth failed http=' . $r['code'] . ' ' . (is_array($j) && isset($j['error']) ? $j['error'] : ''));
            return '';
        }

        $ttl = isset($j['expires_in']) ? (int)$j['expires_in'] : 300;
        $tmp = @tempnam(sys_get_temp_dir(), 'fbspp');
        if($tmp){
            @file_put_contents($tmp, json_encode(array('t' => $j['access_token'], 'exp' => time() + $ttl)));
            @chmod($tmp, 0600);
            @rename($tmp, $key);
        }
        return $j['access_token'];
    }

    /**
     * 带 token 的 API 调用，401 时刷新 token 重试一次。
     * @return array ['code'=>int, 'json'=>array|null, 'raw'=>string]
     */
    private function api($payment, $method, $path, $body = null, $headers = array()){

        $url = $this->baseUrl($payment) . $path;
        $payload = $body === null ? null : json_encode($body);

        for($try = 0; $try < 2; $try++){
            $token = $this->accessToken($payment, $try === 1);
            if($token === ''){
                return array('code' => 0, 'json' => null, 'raw' => '');
            }
            $h = array_merge(array(
                'Authorization: Bearer ' . $token,
                'Accept: application/json',
                'Content-Type: application/json'
            ), $headers);

            $r = $this->http($method, $url, $h, $payload);
            if($r['code'] !== 401){
                break;
            }
        }
        $r['json'] = json_decode($r['raw'], true);
        return $r;
    }

    protected function http($method, $url, $headers, $body = null, $userpwd = null){
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 25);
        if($body !== null){
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        if($userpwd !== null){
            curl_setopt($ch, CURLOPT_USERPWD, $userpwd);
        }
        $raw  = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if($raw === false){
            $this->log('curl error: ' . curl_error($ch));
            $raw = '';
        }
        curl_close($ch);
        return array('code' => $code, 'raw' => (string)$raw, 'json' => null);
    }

    /**
     * 调 PayPal 验签接口。成功返回 true；否则返回 'invalid' / 'transient' / 'noconfig'。
     * webhook_event 直接拼入原始报文，避免 decode/encode 改变字节导致验签失败。
     */
    private function verifyWebhook($raw, $payment){

        if(empty($payment['webhook_id'])){
            return 'noconfig';
        }
        $need = array('AUTH_ALGO', 'CERT_URL', 'TRANSMISSION_ID', 'TRANSMISSION_SIG', 'TRANSMISSION_TIME');
        $h = array();
        foreach($need as $n){
            $k = 'HTTP_PAYPAL_' . $n;
            if(empty($_SERVER[$k])){
                return 'invalid';
            }
            $h[$n] = (string)$_SERVER[$k];
        }

        $body = '{"auth_algo":' . json_encode($h['AUTH_ALGO'])
              . ',"cert_url":' . json_encode($h['CERT_URL'])
              . ',"transmission_id":' . json_encode($h['TRANSMISSION_ID'])
              . ',"transmission_sig":' . json_encode($h['TRANSMISSION_SIG'])
              . ',"transmission_time":' . json_encode($h['TRANSMISSION_TIME'])
              . ',"webhook_id":' . json_encode((string)$payment['webhook_id'])
              . ',"webhook_event":' . $raw . '}';

        $token = $this->accessToken($payment);
        if($token === ''){
            return 'transient';
        }
        $r = $this->http('POST', $this->baseUrl($payment) . '/v1/notifications/verify-webhook-signature', array(
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
            'Content-Type: application/json'
        ), $body);

        if($r['code'] >= 500 || $r['code'] === 0){
            return 'transient';
        }
        $j = json_decode($r['raw'], true);
        return (is_array($j) && isset($j['verification_status']) && $j['verification_status'] === 'SUCCESS') ? true : 'invalid';
    }

    private function firstCapture($order){
        if(isset($order['purchase_units'][0]['payments']['captures'][0]) && is_array($order['purchase_units'][0]['payments']['captures'][0])){
            return $order['purchase_units'][0]['payments']['captures'][0];
        }
        return null;
    }

    private function errBrief($res){
        $j = $res['json'];
        if(!is_array($j)){
            $j = json_decode($res['raw'], true);
        }
        if(!is_array($j)){
            return '';
        }
        $s = (isset($j['name']) ? $j['name'] : '') . ' ' . (isset($j['debug_id']) ? 'debug_id=' . $j['debug_id'] : '');
        if(isset($j['details'][0]['issue'])){
            $s .= ' issue=' . $j['details'][0]['issue'];
        }
        return trim($s);
    }

    /* ------------------------------------------------------------------ */
    /* 金额 / 币种                                                          */
    /* ------------------------------------------------------------------ */

    private function currencyOf($payment){
        $c = isset($payment['type']) ? strtoupper(trim($payment['type'])) : '';
        return preg_match('/^[A-Z]{3}$/', $c) ? $c : 'PHP';
    }

    private function decimals($currency){
        return in_array($currency, array('JPY', 'HUF', 'TWD'), true) ? 0 : 2;
    }

    /** 站点金额 → 支付币种金额（与 check_money / 其他插件一致：除以 $currency_rate） */
    private function toPayAmount($siteAmount, $currency){
        global $currency_rate;
        $rate = (float)$currency_rate;
        if($rate <= 0){
            $rate = 1;
        }
        return number_format((float)$siteAmount / $rate, $this->decimals($currency), '.', '');
    }

    private function minor($value, $currency){
        return (int)round((float)$value * pow(10, $this->decimals($currency)));
    }

    /* ------------------------------------------------------------------ */
    /* 数据库：pay_log 与 paypal_txn                                         */
    /* ------------------------------------------------------------------ */

    private function validSn($s){
        return is_string($s) && preg_match('/^[A-Za-z0-9_.\-]{1,64}$/', $s) === 1;
    }

    private function validId($s){
        return is_string($s) && preg_match('/^[A-Za-z0-9_\-]{1,64}$/', $s) === 1;
    }

    private function payLog($sn){
        global $dsql;
        $sql = $dsql->SetQuery("SELECT `amount`, `state` FROM `#@__pay_log` WHERE `ordernum` = '$sn'");
        $ret = $dsql->dsqlOper($sql, "results");
        return $ret ? $ret[0] : null;
    }

    private function ensureTable(){
        static $done = false;
        if($done){
            return;
        }
        global $dsql;
        $sql = $dsql->SetQuery("CREATE TABLE IF NOT EXISTS `#@__paypal_txn` (
            `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
            `order_sn` varchar(64) NOT NULL,
            `paypal_order_id` varchar(64) NOT NULL,
            `capture_id` varchar(64) DEFAULT NULL,
            `status` varchar(16) NOT NULL DEFAULT 'created',
            `amount` varchar(32) NOT NULL DEFAULT '',
            `currency` varchar(3) NOT NULL DEFAULT '',
            `env` varchar(8) NOT NULL DEFAULT '',
            `created` int(11) NOT NULL DEFAULT 0,
            `updated` int(11) NOT NULL DEFAULT 0,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uq_paypal_order` (`paypal_order_id`),
            UNIQUE KEY `uq_capture` (`capture_id`),
            KEY `idx_sn` (`order_sn`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        $dsql->dsqlOper($sql, "update");
        $done = true;
    }

    private function txnByOrder($poid){
        global $dsql;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__paypal_txn` WHERE `paypal_order_id` = '$poid'");
        $ret = $dsql->dsqlOper($sql, "results");
        return $ret ? $ret[0] : null;
    }

    /**
     * 抢处理权：只有 created/error 状态，或处理超过 60 秒仍未完成的 processing 才能抢到。
     * 靠 UPDATE 影响行数判断，Webhook 与回跳并发时只有一方成功。
     */
    private function claim($poid){
        global $dsql;
        $now = time();
        $stale = $now - 60;
        $sql = $dsql->SetQuery("UPDATE `#@__paypal_txn` SET `status` = 'processing', `updated` = $now WHERE `paypal_order_id` = '$poid' AND (`status` IN ('created', 'error') OR (`status` = 'processing' AND `updated` < $stale))");
        return (int)$dsql->dsqlOper($sql, "totalCount") === 1;
    }

    private function release($poid, $status){
        global $dsql;
        $now = time();
        $status = preg_match('/^[a-z]{1,16}$/', $status) ? $status : 'error';
        $sql = $dsql->SetQuery("UPDATE `#@__paypal_txn` SET `status` = '$status', `updated` = $now WHERE `paypal_order_id` = '$poid' AND `status` <> 'paid'");
        $dsql->dsqlOper($sql, "update");
    }

    /** 订单已入账时，补齐 txn 状态（不改动已 paid 的行） */
    private function markPaidIfNeeded($poid, $capId = ''){
        global $dsql;
        $now = time();
        $set = "`status` = 'paid', `updated` = $now";
        if($capId !== '' && $this->validId($capId)){
            $set .= ", `capture_id` = IFNULL(`capture_id`, '$capId')";
        }
        $sql = $dsql->SetQuery("UPDATE `#@__paypal_txn` SET $set WHERE `paypal_order_id` = '$poid' AND `status` NOT IN ('paid', 'duplicate')");
        $dsql->dsqlOper($sql, "update");
    }

    /* ------------------------------------------------------------------ */
    /* 杂项                                                                 */
    /* ------------------------------------------------------------------ */

    /** 日志只记录业务事实，不记录 Secret / access token / 请求头 */
    protected function log($msg){
        if($this->_logger === null){
            require_once dirname(__FILE__) . "/../log.php";
            $this->_logger = new CLogFileHandler(HUONIAOROOT . '/log/paypal/' . date('Y-m-d') . '.log', true);
        }
        $this->_logger->DEBUG($msg);
    }

    private function fatal($msg){
        global $cfg_secureAccess, $cfg_basehost;
        $home = htmlspecialchars($cfg_secureAccess . $cfg_basehost, ENT_QUOTES, 'UTF-8');
        header('Content-Type: text/html; charset=utf-8');
        // 返回键会重新请求下单地址再次报错，看起来像「返回不了」，所以给一个明确的出口
        echo '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           . '<div style="font:16px/1.6 sans-serif;padding:24px"><p>' . htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') . '</p>'
           . '<p><a href="' . $home . '">Home / 返回首页</a></p></div>';
        die;
    }

    /** 取消付款：订单保持未支付，给出明确提示 */
    private function showCancelled(){
        global $cfg_secureAccess, $cfg_basehost;
        $home = htmlspecialchars($cfg_secureAccess . $cfg_basehost, ENT_QUOTES, 'UTF-8');
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment cancelled</title></head>'
           . '<body style="font:16px/1.6 sans-serif;padding:24px;text-align:center">'
           . '<h3>Payment cancelled / 付款已取消</h3>'
           . '<p>Your order has not been paid. You can go back and pay again.<br>订单尚未支付，可返回重新支付。</p>'
           . '<p><a href="javascript:history.go(-1)">Back / 返回</a> &nbsp;|&nbsp; <a href="' . $home . '">Home / 首页</a></p>'
           . '</body></html>';
        die;
    }

}
