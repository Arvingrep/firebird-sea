<?php
/**
 * K8s 深度就绪探针（经 nginx → php-fpm）。
 *
 * 不引导火鸟框架（避免授权加载器/模板引擎开销与副作用），只检查"这个 Pod 能不能正常服务"的最小条件：
 *  1. 仓库以 .example 提供、被 gitignore 的真实配置存在（如 waimai.inc.php；缺失会让对应模块 Fatal → 首页 500）
 *  2. 站点主配置存在
 *  3. 配置了 DB_HOST 时数据库可连通（2 秒超时）
 * 失败只返回 503 + FAIL，细节写 stderr（Pod 日志），不对外泄漏文件名。
 */
header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

$root = __DIR__;
$problems = [];

foreach (glob($root . '/include/config/*.inc.php.example') ?: [] as $example) {
    $real = substr($example, 0, -strlen('.example'));
    if (!is_file($real)) {
        $problems[] = 'missing config ' . basename($real);
    }
}

if (!is_file($root . '/include/config/siteConfig.inc.php')) {
    $problems[] = 'missing config siteConfig.inc.php';
}

$dbHost = getenv('DB_HOST');
if ($dbHost && function_exists('mysqli_init')) {
    mysqli_report(MYSQLI_REPORT_OFF);
    $link = mysqli_init();
    mysqli_options($link, MYSQLI_OPT_CONNECT_TIMEOUT, 2);
    $ok = @mysqli_real_connect(
        $link,
        $dbHost,
        getenv('DB_USER') ?: '',
        getenv('DB_PASS') ?: '',
        getenv('DB_NAME') ?: ''
    );
    if ($ok) {
        mysqli_close($link);
    } else {
        $problems[] = 'db unreachable: ' . mysqli_connect_errno();
    }
}

if ($problems) {
    http_response_code(503);
    error_log('[healthz] ' . implode('; ', $problems));
    echo "FAIL\n";
    exit;
}

echo "OK\n";
