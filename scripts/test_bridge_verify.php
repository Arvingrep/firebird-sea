<?php
/**
 * bridge.php 验签自测脚本
 * 运行：php scripts/test_bridge_verify.php
 * （宿主机无 PHP 时可用 Docker：docker run --rm -v "$PWD":/app -w /app php:7.4-cli php scripts/test_bridge_verify.php）
 */
define('FBS_BRIDGE_TEST', true);
require __DIR__ . '/../webroot/api/fbs/bridge.php';

/* ---- 测试环境：假 bot（自己当 bot，自定 token），隔离防重放存储 ---- */
$TEST_TOKEN = '123456:TEST-FAKE-BOT-TOKEN';
putenv('FBS_TG_BOT_TOKEN=' . $TEST_TOKEN);
$REPLAY_DIR = sys_get_temp_dir() . '/fbs_bridge_test_' . getmypid();
define('FBS_BRIDGE_REPLAY_DIR', $REPLAY_DIR);

/* ---- 辅助：构造带正确签名的 initData ---- */
function make_init_data($token, $overrides = array())
{
    $user = isset($overrides['user'])
        ? $overrides['user']
        : json_encode(array('id' => 777, 'first_name' => 'Test', 'username' => 'tester'));
    unset($overrides['user']);

    $fields = array_merge(array(
        'auth_date'   => (string)time(),
        'query_id'    => 'AAG-testquery',
        'signature'   => 'fake_signature_field_should_participate',
        'user'        => $user,
    ), $overrides);

    // 构造 data_check_string（剔除 hash，按 key 升序）
    $dcs = fbs_bridge_build_data_check_string($fields);
    $secret = fbs_bridge_make_secret($token);
    $fields['hash'] = hash_hmac('sha256', $dcs, $secret);

    // 拼回 URL query 格式（值 rawurlencode）
    $parts = array();
    foreach ($fields as $k => $v) {
        $parts[] = rawurlencode($k) . '=' . rawurlencode($v);
    }
    return implode('&', $parts);
}

function run_case($name, $initData, $expectHttp)
{
    list($http, $payload) = fbs_bridge_handle_request($initData);
    $pass = ($http === $expectHttp);
    printf(
        "%s  %-28s expect=%d actual=%d  payload=%s\n",
        $pass ? '[PASS]' : '[FAIL]',
        $name,
        $expectHttp,
        $http,
        json_encode($payload, JSON_UNESCAPED_UNICODE)
    );
    return $pass;
}

$allPass = true;

/* ---- 用例 1：正确签名通过 ---- */
$ok = make_init_data($TEST_TOKEN);
$allPass = run_case('正确签名通过', $ok, 200) && $allPass;

/* ---- 用例 2：篡改 hash 拒绝(403) ---- */
$tampered = make_init_data($TEST_TOKEN);
$tampered = preg_replace('/hash=[0-9a-f]{8}/i', 'hash=00000000', $tampered, 1, $cnt);
if (!$cnt) { // 兜底：直接截断替换
    $tampered = make_init_data($TEST_TOKEN);
    $tampered = substr($tampered, 0, -64) . str_repeat('0', 64);
}
$allPass = run_case('篡改 hash 拒绝', $tampered, 403) && $allPass;

/* ---- 用例 3：auth_date 过期(2 小时前)拒绝(401) ---- */
$expired = make_init_data($TEST_TOKEN, array('auth_date' => (string)(time() - 7200)));
$allPass = run_case('auth_date 过期拒绝', $expired, 401) && $allPass;

/* ---- 用例 4：auth_date 在未来(+120s)拒绝(401) ---- */
$future = make_init_data($TEST_TOKEN, array('auth_date' => (string)(time() + 120)));
$allPass = run_case('未来时间拒绝', $future, 401) && $allPass;

/* ---- 用例 5：无 user.id 拒绝(403) ---- */
$noUser = make_init_data($TEST_TOKEN, array('user' => json_encode(array('first_name' => 'NoId'))));
$allPass = run_case('无 user.id 拒绝', $noUser, 403) && $allPass;

/* ---- 用例 6：重放超阈值(5 次)返回 429 ---- */
$replayed = make_init_data($TEST_TOKEN, array('query_id' => 'replay-case-6'));
$codes = array();
for ($i = 1; $i <= 6; $i++) {
    list($http) = fbs_bridge_handle_request($replayed);
    $codes[] = $http;
}
$replayPass = (count(array_slice($codes, 0, 5)) === 5 && $codes[5] === 429);
printf(
    "%s  %-28s 前5次=%s 第6次=%d(期望429) 全部响应=%s\n",
    $replayPass ? '[PASS]' : '[FAIL]',
    '重放超阈值 429',
    implode(',', array_slice($codes, 0, 5)),
    $codes[5],
    implode(',', $codes)
);
$allPass = $replayPass && $allPass;

/* ---- 附加：验证 signature 字段参与 data_check_string（从串内剔除后签名应失效） ---- */
$pairs = fbs_bridge_parse_init_data(make_init_data($TEST_TOKEN));
unset($pairs['signature']);
$withoutSig = fbs_bridge_verify_signature($pairs, $TEST_TOKEN);
printf(
    "%s  %-28s signature 参与串内：剔除后验签应失败，actual=%s\n",
    $withoutSig ? '[FAIL]' : '[PASS]',
    'signature 参与串内',
    $withoutSig ? 'true(错误)' : 'false(正确)'
);
$allPass = !$withoutSig && $allPass;

/* ---- 清理 ---- */
foreach (glob($REPLAY_DIR . '/*.cnt') as $f) @unlink($f);
@rmdir($REPLAY_DIR);

echo $allPass ? "\nALL TESTS PASSED\n" : "\nSOME TESTS FAILED\n";
exit($allPass ? 0 : 1);
