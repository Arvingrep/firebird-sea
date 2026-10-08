<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 团购在时间提醒用户
 *
 * 1. 判断团购是否在有效时间，如果是就发送信息通知订阅者
 *
 * @version        $Id: tuan_remind.php 2018-08-17 上午11:14:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
$today    = GetMkTime(date("Y-m-d"));
$nextHour = GetMkTime(date("Y-m-d H", $now + 3600).":00:00");
$start    = $nextHour - 3600;

$sql = $dsql->SetQuery("SELECT `id`,`tid`,`uid` FROM `#@__tuan_remind` where state = '0'");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$uid = $value['uid'];

		$sql    = $dsql->SetQuery("SELECT `title` FROM `#@__tuanlist` where `startdate` >= '$start' AND `enddate` <= '$nextHour' and id = ".$value['tid']);
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			$sql = $dsql->SetQuery("UPDATE `#@__tuan_remind` SET `state` = 1 WHERE `id` = ".$value['id']);
			$dsql->dsqlOper($sql, "update");

			$title  = $result[0]['title'];
			$param = array(
				"service"  => "tuan",
				"template" => "detail",
				"id"       => $value['tid']
			);

	        $sql    = $dsql->SetQuery("SELECT `username` FROM `#@__member`  WHERE `id`='$uid' ");
			$member = $dsql->dsqlOper($sql, "results");
			$username = $member[0]['username'];

			$url = getUrlPath($param);//

			updateMemberNotice($uid, "会员-团购订阅提醒", $param, array("username" => $username, 'code' => $url));
		}
	}
}
