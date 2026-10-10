<?php
/**
 * 火鸟模块注册与菜单同步脚本
 * 将 moduleList.php 中的官方模块子菜单 (subnav) 同步写入数据库 huoniao_site_module
 */

$dbHost = $argv[1] ?? '127.0.0.1';
$dbName = $argv[2] ?? 'firebird_canary';
$dbUser = $argv[3] ?? 'firebird_user';
$dbPass = $argv[4] ?? 'firebirdpassword';

$dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
$pdo = new PDO($dsn, $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
]);

// 读取 moduleList.php 中的 getDefaultData
$moduleListFile = file_exists(__DIR__ . '/../webroot/admin/siteConfig/moduleList.php')
    ? __DIR__ . '/../webroot/admin/siteConfig/moduleList.php'
    : '/var/www/html/admin/siteConfig/moduleList.php';
$content = file_get_contents($moduleListFile);

// 提取 getDefaultData 函数体
if (preg_match('/function getDefaultData\(\)\s*\{([\s\S]*?)\n\}/', $content, $matches)) {
    eval('function extractDefaultData() {' . $matches[1] . '}');
    $defaultData = extractDefaultData();
} else {
    die("无法提取 getDefaultData\n");
}

$moduleTitles = [
    'waimai' => '外卖',
    'article' => '资讯',
    'info' => '分类信息',
    'house' => '房产',
    'shop' => '商城',
    'renovation' => '装修',
    'paper' => '报刊',
    'job' => '招聘',
    'car' => '汽车',
    'special' => '专题',
    'website' => '建站',
    'dating' => '交友',
    'quanjing' => '全景',
    'image' => '图集',
    'tieba' => '贴吧',
    'tuan' => '团购',
    'huodong' => '活动',
    'huangye' => '黄页',
    'video' => '视频',
    'vote' => '投票',
    'integral' => '积分商城',
    'live' => '直播',
    'homemaking' => '家政',
    'marry' => '婚嫁',
    'travel' => '旅游',
    'education' => '教育',
    'pension' => '养老',
    'circle' => '圈子',
    'sfcar' => '顺风车',
    'awardlegou' => '乐购',
    'paimai' => '拍卖',
    'task' => '任务',
    'zhaopin' => '招聘小程序',
    'business' => '商家'
];

echo "总共读取到 " . count($defaultData) . " 个模块默认子菜单配置\n";

// 确保默认根分类 (parentid=0) 存在
$stmt = $pdo->prepare("SELECT id FROM huoniao_site_module WHERE parentid = 0 AND name = ''");
$stmt->execute();
$rootId = $stmt->fetchColumn();
if (!$rootId) {
    $pdo->exec("INSERT INTO huoniao_site_module (parentid, title, name, state, weight) VALUES (0, '系统默认模块', '', 0, 0)");
    $rootId = $pdo->lastInsertId();
}

$updated = 0;
$inserted = 0;

foreach ($defaultData as $name => $subnavJson) {
    $title = $moduleTitles[$name] ?? $name;
    $subject = $title;

    // 检查模块是否已在数据库
    $stmt = $pdo->prepare("SELECT id FROM huoniao_site_module WHERE name = ?");
    $stmt->execute([$name]);
    $existId = $stmt->fetchColumn();

    if ($existId) {
        $updateStmt = $pdo->prepare("UPDATE huoniao_site_module SET title = ?, subject = ?, subnav = ?, state = 0, parentid = ? WHERE id = ?");
        $updateStmt->execute([$title, $subject, $subnavJson, $rootId, $existId]);
        $updated++;
    } else {
        $insertStmt = $pdo->prepare("INSERT INTO huoniao_site_module (parentid, title, subject, name, subnav, state, weight, date) VALUES (?, ?, ?, ?, ?, 0, 50, ?)");
        $insertStmt->execute([$rootId, $title, $subject, $name, $subnavJson, time()]);
        $inserted++;
    }
}

echo "✅ 同步完成！更新已有模块: {$updated} 个，新注册模块: {$inserted} 个。\n";
