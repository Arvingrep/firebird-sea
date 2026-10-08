<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新抽奖插件活动、中奖名单状态
 *
 * @version        $Id: plugins_22_updateState.php 2023-11-06 下午13:28:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $dsql;

$time = GetMkTime(time());

//更新已经结束的活动状态
$sql = $dsql->SetQuery("UPDATE `#@__site_plugins_22_list` SET `state` = 3 WHERE `endTime` < $time");
$dsql->dsqlOper($sql, "update");

//更新已经过了兑奖时间的中奖名单状态
$sql = $dsql->SetQuery("UPDATE `#@__site_plugins_22_award` SET `state` = 2 WHERE (`type` = 0 OR `type` = 1) AND `prize` != 0 AND `cashEndTime` < $time");
$dsql->dsqlOper($sql, "update");
