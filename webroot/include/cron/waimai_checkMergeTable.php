<?php if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 合并表（MRG_MyISAM）UNION 健康巡检与自愈
 *
 * ## 为什么需要这个任务
 *
 * `huoniao_waimai_order_all` 这类表是 MySQL `MRG_MyISAM` 合并表，本身不存数据，
 * 只把成员表（基础表 + 分表）UNION 起来。一旦 UNION 成员列表为空，所有
 * `SELECT ... FROM <table>_all` 会**恒返回 0 行**，但 SQL 不报错、接口照样返回
 * `state=100` + 空列表 —— 故障完全静默，没有任何错误信号。
 *
 * 2026-10 就发生过：订单列表、取消订单、支付回调写状态、商家后台打印、3 个订单
 * cron 全部静默失效数月，直到用户反馈「下单后看不到订单」才被发现。上游
 * hawaiihub 导出的 `hn_waimai_order_all` 本身就缺 `INSERT_METHOD/UNION`，
 * 经 scripts/extract_waimai_tables.py 原样灌进了 canary 与生产两库。
 *
 * ## 本任务做什么
 *
 * 扫描库内**所有** `MRG_MyISAM` 表，逐张检查 DDL 是否含 `UNION=`；缺失则判定
 * 为损坏，调用火鸟自带的 `SubTableAsync::run()` 重建（与
 * `include/class/dsql.class.php` 自愈分支同一路径，不另造一套）。
 *
 * ## 登记方式
 *
 * `huoniao_site_cron` 列序为
 * `module, name, type, runtime, filename, state, addtime, edittime, updatetime`，
 * 按现有外卖任务同样式追加一行（每 30 分钟一次）：
 *
 * ```sql
 * INSERT INTO `#@__site_cron`
 *   (`module`, `name`, `type`, `runtime`, `filename`, `state`, `addtime`, `edittime`, `updatetime`)
 * VALUES
 *   ('waimai', '合并表 UNION 健康巡检', 'now', '0-0-30', 'waimai_checkMergeTable', '1',
 *    UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
 * ```
 *
 * 也可直接访问该文件手动执行一次（需已登录后台管理员）。
 *
 * @version 1.0
 */

global $dsql;

@set_time_limit(0);

require_once HUONIAOROOT . '/include/class/SubTableAsync.class.php';

// 表名前缀（#@__ 实际值）：本项目固定为 huoniao_
$DB_PREFIX = 'huoniao_';

$report = array();

// ── 1. 列出所有表 ────────────────────────────────────────────────────────────
$sql    = $dsql->SetQuery("SHOW TABLES");
$tables = array();
$list   = $dsql->dsqlOper($sql, "results");
if (is_array($list)) {
    foreach ($list as $row) {
        // SHOW TABLES 的列名是动态的 `Tables_in_<db>`，取第一个值
        $tables[] = (string)reset($row);
    }
}

// ── 2. 逐张检查 MRG_MyISAM ───────────────────────────────────────────────────
foreach ($tables as $table) {

    $sql = $dsql->SetQuery("SHOW CREATE TABLE `$table`");
    $res = $dsql->dsqlOper($sql, "results");
    if (empty($res) || empty($res[0]['Create Table'])) continue;

    $ddl = $res[0]['Create Table'];
    if (strpos($ddl, 'MRG_MyISAM') === false) continue;   // 非合并表，跳过

    $hasUnion = strpos($ddl, 'UNION=') !== false;

    // 当前合并表可见行数（损坏时恒为 0）
    $rows = 0;
    $csql = $dsql->SetQuery("SELECT COUNT(*) AS c FROM `$table`");
    $cres = $dsql->dsqlOper($csql, "results");
    if (!empty($cres) && isset($cres[0]['c'])) $rows = (int)$cres[0]['c'];

    $fixed = '—';

    if (!$hasUnion) {
        // 从 `huoniao_waimai_order_all` 反推基础表名 `waimai_order`
        $base = $table;
        if (strpos($base, $DB_PREFIX) === 0) $base = substr($base, strlen($DB_PREFIX));
        if (substr($base, -4) === '_all')    $base = substr($base, 0, -4);

        if ($base !== '' && $base !== $table) {
            // SubTableAsync::run() 会 DROP + 从基础表 SHOW CREATE TABLE 重建，
            // 自动带上 INSERT_METHOD=LAST UNION=(基础表[,分表...])
            $ok    = SubTableAsync::run($base);
            $fixed = $ok ? '已重建' : '重建失败';

            // 重建后复核
            if ($ok) {
                $vres = $dsql->dsqlOper($dsql->SetQuery("SHOW CREATE TABLE `$table`"), "results");
                if (!empty($vres[0]['Create Table']) && strpos($vres[0]['Create Table'], 'UNION=') !== false) {
                    $fixed = '已重建 ✓';
                    $cres  = $dsql->dsqlOper($dsql->SetQuery("SELECT COUNT(*) AS c FROM `$table`"), "results");
                    if (!empty($cres) && isset($cres[0]['c'])) $rows = (int)$cres[0]['c'];
                } else {
                    $fixed = '重建后仍无 UNION ✗';
                }
            }
        } else {
            $fixed = '无法推断基础表，跳过';
        }
    }

    $report[] = array(
        'table' => $table,
        'union' => $hasUnion ? 'UNION' : 'MISSING',
        'rows'  => $rows,
        'fixed' => $fixed,
    );
}

// ── 3. 输出（cron 跑批时写入日志；手动访问时直接看表格） ──────────────────────
if (PHP_SAPI === 'cli') {
    echo "合并表巡检 " . date('Y-m-d H:i:s') . PHP_EOL;
    foreach ($report as $r) {
        printf("  %-40s union=%-8s rows=%-8d %s%s", $r['table'], $r['union'], $r['rows'], $r['fixed'], PHP_EOL);
    }
    if (empty($report)) echo "  （库内无 MRG_MyISAM 表）" . PHP_EOL;
} else {
    echo '<h1 style="padding:30px 0;text-align:center;">合并表 UNION 健康巡检</h1>';
    echo '<p style="text-align:center;">' . date('Y-m-d H:i:s') . '</p>';
    echo '<table border="1" cellpadding="8" cellspacing="0" style="margin:0 auto;border-collapse:collapse;">';
    echo '<tr><th>表名</th><th>UNION</th><th>可见行数</th><th>处理</th></tr>';
    if (empty($report)) {
        echo '<tr><td colspan="4" align="center">库内无 MRG_MyISAM 表</td></tr>';
    }
    foreach ($report as $r) {
        $color = $r['union'] === 'MISSING' ? '#c00' : '#080';
        echo '<tr><td>' . htmlspecialchars($r['table']) . '</td>'
            . '<td style="color:' . $color . ';">' . $r['union'] . '</td>'
            . '<td align="right">' . $r['rows'] . '</td>'
            . '<td>' . htmlspecialchars($r['fixed']) . '</td></tr>';
    }
    echo '</table>';
}
