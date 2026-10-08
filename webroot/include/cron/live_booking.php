<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 直播预约，通知用户
 *
 * 1. 提前10分钟通知用户
 *
 * @version        $Id: live_booking.php 2019-07-11 上午11:14:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$now = GetMkTime(time());
$start = $now - 10 * 60; //检查已开播10分钟内的直播
$end = $now + 30 * 60;  //提前30分钟开始提醒
$limit = 30;  //每次通知人数
$sql = $dsql->SetQuery("SELECT * FROM `#@__live_booking` where `ftime` BETWEEN $start AND $end  AND `notice` = 0 ORDER BY `ftime` ASC, `id` ASC LIMIT $limit");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	set_time_limit(0);
	$ids = [];
	foreach ($ret as $key => $value) {
		$id = $value['id'];
		$uid = $value['uid'];
		$aid = $value['aid'];
		$ftime = $value['ftime'];
		
		if(isset($_G['live_'.$aid])){
			$d = $_G['live_'.$aid];
		}else{
			$sql = $dsql->SetQuery("SELECT `title`, `state`, `arcrank`, `ftime` FROM `#@__livelist` WHERE `id` = $aid");
			$res = $dsql->dsqlOper($sql, "results");
			$d = $res[0];
			$_G['live_'.$aid] = $d;
		}
		if($d['arcrank'] != 1) continue;
		if($d['state'] == 2) continue;

		$ids[] = $id;
		$param = array(
			"service"  => "live",
			"template" => "detail",
			"id"       => $value['aid']
		);
		//自定义配置
		$config = array(
            "first" => "您预约的直播已经开播",
            "content" => $d['title'],
            "date" => date("Y-m-d H:i:s", $ftime),
            "status" => "正在直播中",
            "color" => "",
            "remark" => "点击立即进入直播间！",
            "fields" => array(
                'keyword1' => '直播信息',
                'keyword2' => '直播时间',
                'keyword3' => '当前状态'
            )
		);
		updateMemberNotice($uid, "直播-预约直播开播提醒", $param, $config);
	}
	if($ids){
		$sql = $dsql->SetQuery("UPDATE `#@__live_booking` SET `notice` = 1 WHERE `id` IN (".join(",", $ids).")");
		$dsql->dsqlOper($sql, "update");
	}
}
