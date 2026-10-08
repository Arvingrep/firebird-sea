<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 商家到期前一个月、一周、一天时提醒
 *
 *
 * @version        $Id: business_expirationReminder.php 2017-7-28 上午11:09:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

require HUONIAOINC."/config/business.inc.php";

$time = GetMkTime(time());

//查询所有一天内即将到期的商家
$dayArr = array();
$sql = $dsql->SetQuery("SELECT b.`id`, b.`uid`, b.`type`, b.`title`, b.`expired`, m.`company` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE b.`expired` > 0 AND b.`expired` > $time AND b.`expired` <= $time + 86400 AND b.`expired_notify_day` = 0");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $uid = $value['uid'];
    $title = $value['title'];
    $username = $value['company'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    //记录一天内到期的商家ID
    array_push($dayArr, $id);

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `expired_notify_day` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    //消息通知
    $urlParam = array(
      "service"  => "member",
      "template" => "join_renew"
    );
    $param = array(
      "username" => $username,
      "title"    => '企业会员',
      "time"     => $date,
      "fields" => array(
          'keyword1' => '授权账号',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($uid, "会员-企业会员到期提醒", $urlParam, $param);
  }
}


//查询所有一周内即将到期的商家
$where = "";
if($dayArr){
  $days = join(",", $dayArr);
  $where = " AND b.`id` not in ($days)";
}
$weekArr = array();
$sql = $dsql->SetQuery("SELECT b.`id`, b.`uid`, b.`type`, b.`title`, b.`expired`, m.`company` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE b.`expired` > 0 AND b.`expired` > $time AND b.`expired` <= $time + 604800 AND b.`expired_notify_week` = 0".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $uid = $value['uid'];
    $title = $value['title'];
    $username = $value['company'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    //记录一周内到期的商家ID
    array_push($weekArr, $id);

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `expired_notify_week` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    $urlParam = array(
      "service"  => "member",
      "template" => "join_renew"
    );
    $param = array(
      "username" => $username,
      "title"    => '企业会员',
      "time"     => $date,
      "fields" => array(
          'keyword1' => '授权账号',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($uid, "会员-企业会员到期提醒", $urlParam, $param);
  }
}


//查询所有一月内即将到期的商家
$where = "";
if($weekArr){
  $weeks = join(",", $weekArr);
  $where = " AND b.`id` not in ($days) AND b.`id` not in ($weeks)";
}
$sql = $dsql->SetQuery("SELECT b.`id`, b.`uid`, b.`type`, b.`title`, b.`expired`, m.`company` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE b.`expired` > 0 AND b.`expired` > $time AND b.`expired` <= $time + 2592000 AND b.`expired_notify_month` = 0".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $uid = $value['uid'];
    $title = $value['title'];
    $username = $value['company'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `expired_notify_month` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    $urlParam = array(
      "service"  => "member",
      "template" => "join_renew"
    );
    $param = array(
      "username" => $username,
      "title"    => '企业会员',
      "time"     => $date,
      "fields" => array(
          'keyword1' => '授权账号',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($uid, "会员-企业会员到期提醒", $urlParam, $param);
  }
}
