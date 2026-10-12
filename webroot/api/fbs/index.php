<?php
/**
 * FBS 内部网关（AD-3 / AD-14）：仅供集群内 Node(services/api) 调用，外部 /api/fbs 由 Traefik 返回 403（AD-19）。
 * 薄层：只做签名校验、参数校验与调用，不含业务规则；不修改火鸟核心文件。
 * 约定：POST /api/fbs/index.php?action=<action>，JSON 体；
 *       头 X-Fbs-Timestamp(秒)、X-Fbs-Signature = HMAC-SHA256(secret, timestamp\naction\nbody) 十六进制。
 * 当前动作：member_find_or_create（T2.3）、issue_session（T3.2，仅为 Telegram 创建的会员签发火鸟会话凭证，密钥不出火鸟进程）。
 */
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

function fbs_out($state, $info) {
	echo json_encode(array('state' => $state, 'info' => $info), JSON_UNESCAPED_UNICODE);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	fbs_out(405, 'method not allowed');
}

$secret = getenv('FBS_GATEWAY_SECRET');
if (!$secret || strlen($secret) < 16) {
	http_response_code(503);
	fbs_out(503, 'gateway not configured');
}

$action = isset($_GET['action']) ? (string)$_GET['action'] : '';
$body = file_get_contents('php://input');
$ts = isset($_SERVER['HTTP_X_FBS_TIMESTAMP']) ? (string)$_SERVER['HTTP_X_FBS_TIMESTAMP'] : '';
$sig = isset($_SERVER['HTTP_X_FBS_SIGNATURE']) ? (string)$_SERVER['HTTP_X_FBS_SIGNATURE'] : '';

// issue_session 返回的是活凭证，重放窗口收紧到 15 秒；其余动作 60 秒
$window = ($action === 'issue_session') ? 15 : 60;
if (!ctype_digit($ts) || abs(time() - (int)$ts) > $window) {
	http_response_code(401);
	fbs_out(401, 'stale or invalid timestamp');
}
$expected = hash_hmac('sha256', $ts . "\n" . $action . "\n" . $body, $secret);
if (!hash_equals($expected, $sig)) {
	http_response_code(401);
	fbs_out(401, 'bad signature');
}

$params = json_decode($body, true);
if (!is_array($params)) {
	http_response_code(400);
	fbs_out(400, 'invalid json');
}

if ($action !== 'member_find_or_create' && $action !== 'issue_session') {
	http_response_code(404);
	fbs_out(404, 'unknown action');
}

// 仅在签名校验通过后才加载火鸟（避免未认证请求触发核心初始化）
require_once dirname(__FILE__) . '/../../include/common.inc.php';
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);

if ($action === 'issue_session') {
	// 只为 Telegram 创建的会员签发（username=tg_<数字>、regfrom=telegram、启用），绝不为其他会员/管理员签发
	$mid = isset($params['member_id']) ? (string)$params['member_id'] : '';
	if (!preg_match('/^[1-9][0-9]{0,18}$/', $mid)) {
		http_response_code(400);
		fbs_out(400, 'invalid member_id');
	}
	$sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `id` = $mid AND `state` = 1 AND `regfrom` = 'telegram' AND `username` REGEXP '^tg_[0-9]+$' LIMIT 1");
	$rows = $dsql->dsqlOper($sql, "results");
	if (!$rows) {
		http_response_code(403);
		fbs_out(403, 'member not eligible');
	}
	global $cfg_cookiePre;
	$crypt = new RenrenCrypt();
	$value = base64_encode($crypt->php_encrypt($rows[0]['id'] . '&' . $rows[0]['password']));
	// 凭证只出现在响应体，不写任何日志；ttl 为建议缓存时长（火鸟凭证本身随密码哈希失效）
	fbs_out(100, array('cookie_name' => $cfg_cookiePre . $userLogin->keepMemberID, 'cookie_value' => $value, 'ttl' => 300));
}

$tgId = isset($params['tg_id']) ? (string)$params['tg_id'] : '';
if (!preg_match('/^[1-9][0-9]{0,18}$/', $tgId)) {
	http_response_code(400);
	fbs_out(400, 'invalid tg_id');
}

// 幂等：以 username = tg_<id> 查找；不存在则创建（昵称固定为 TG_<id>，不信任外部文本）
$username = 'tg_' . $tgId;
$sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__member` WHERE `username` = '$username' LIMIT 1");
$rows = $dsql->dsqlOper($sql, "results");
if ($rows) {
	if ((int)$rows[0]['state'] !== 1) {
		http_response_code(403);
		fbs_out(403, 'member disabled');
	}
	fbs_out(100, array('member_id' => (int)$rows[0]['id'], 'created' => false));
}

$passwd = $userLogin->_getSaltedHash(bin2hex(random_bytes(16)));
$regtime = GetMkTime(time());
$nickname = 'TG_' . $tgId;
$sql = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `regtime`, `regip`, `state`, `regfrom`) VALUES (1, '$username', '$passwd', '$nickname', '', '0', '', '0', '$regtime', '', '1', 'telegram')");
$rid = $dsql->dsqlOper($sql, "lastid");
if (!is_numeric($rid) || (int)$rid <= 0) {
	http_response_code(500);
	fbs_out(500, 'create failed');
}
fbs_out(100, array('member_id' => (int)$rid, 'created' => true));
