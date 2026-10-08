<?php   if(!defined('HUONIAOINC')) exit('Request Error!');

set_time_limit(0);

$now = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT * FROM `#@__site_cron` WHERE `file` = 'system_updateSubTotal.php'");
$res = $dsql->dsqlOper($sql, "results");
$cron = $res[0];
$step = $cron['ntime'] - $cron['ltime'];

$arc = $dsql->SetQuery("SELECT `sql` FROM `#@__site_sub_total` WHERE `gettime` = '$sign'");