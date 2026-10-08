<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 视频直播定时更新状态
 *
 * 半小时未直播，更新状态为：2，结束直播
 *
 *
 * @version        $Id: live_updateState.php 2018-04-25 下午13:50:30 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           http://www.huoniao.cn/
 */

$time = GetMkTime(time()) - 1800;
/**
 * starttime随直播记录时间，与当前时间进行比较，大于半小时就更新状态。
 * 当前时间 2.40-1800 2.30
 * 意外时间 starttime 1.00
 * 正在直播 starttime 2.40
 */
$sql = $dsql->SetQuery("SELECT id FROM `#@__livelist`  WHERE `state` = 1 AND `starttime` < $time");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {
	$id = $value['id'];
	$sql = $dsql->SetQuery("UPDATE `#@__livelist` SET `state` = 2 WHERE id='$id'");
	$dsql->dsqlOper($sql, "update");
  }
}