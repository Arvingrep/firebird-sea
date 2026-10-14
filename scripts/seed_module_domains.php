<?php
/**
 * 模块域名/子目录补齐脚本（幂等）
 * 把「子目录」模块的路径写入 huoniao_domain(part='config')，仅补空、不覆盖已有值；
 * OFFLINE 模块在 huoniao_site_module 置 state=1（入口隐藏）。
 *
 * 用法: php seed_module_domains.php <host> <db> <user> <pass> [--apply]
 * 不带 --apply 只打印将要执行的变更。执行后需在后台「清除缓存」。
 */

// 模块 => 子目录路径（与 values.yaml configVars 的 customSubDomain=2 配套）
$paths = [
    'article'    => 'news',
    'shop'       => 'shop',
    'renovation' => 'zhuang',
    'paper'      => 'baokan',
    'website'    => 'jianzhan',
    'info'       => 'info',
    'job'        => 'job',
    'car'        => 'car',
    'special'    => 'special',
    'quanjing'   => 'quanjing',
    'business'   => 'business',
];
// 服务未开通，先下线入口
$offline = ['zhaopin'];

$apply = in_array('--apply', $argv, true);
$args = array_values(array_filter(array_slice($argv, 1), function ($a) { return $a !== '--apply'; }));
list($dbHost, $dbName, $dbUser, $dbPass) = array_pad($args, 4, '');

$pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

foreach ($paths as $module => $path) {
    $sel = $pdo->prepare("SELECT `id`, `domain` FROM `huoniao_domain` WHERE `module` = ? AND `part` = 'config' AND `iid` = 0");
    $sel->execute([$module]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);

    if ($row && $row['domain'] !== '') {
        echo "[skip] {$module}: 已有 '{$row['domain']}'\n";
        continue;
    }
    // 路径冲突检查：同一路径不能被别的模块占用
    $dup = $pdo->prepare("SELECT `module` FROM `huoniao_domain` WHERE `domain` = ? AND `module` != ?");
    $dup->execute([$path, $module]);
    if ($other = $dup->fetchColumn()) {
        echo "[conflict] {$module}: '{$path}' 已被 {$other} 占用\n";
        continue;
    }
    echo "[set] {$module} => /{$path}\n";
    if (!$apply) { continue; }
    if ($row) {
        $pdo->prepare("UPDATE `huoniao_domain` SET `domain` = ? WHERE `id` = ?")->execute([$path, $row['id']]);
    } else {
        $pdo->prepare("INSERT INTO `huoniao_domain` (`domain`, `module`, `part`, `iid`, `expires`, `note`, `state`, `refund`) VALUES (?, ?, 'config', 0, 0, '', 0, '')")
            ->execute([$path, $module]);
    }
}

foreach ($offline as $module) {
    echo "[offline] {$module}\n";
    if ($apply) {
        $pdo->prepare("UPDATE `huoniao_site_module` SET `state` = 1 WHERE `name` = ?")->execute([$module]);
    }
}

echo $apply ? "✅ 已应用，请在后台清除缓存\n" : "(dry-run，加 --apply 执行)\n";
