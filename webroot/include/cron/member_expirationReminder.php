<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 会员到期前一个月、一周、一天时提醒
 *
 *
 * @version        $Id: member_expirationReminder.php 2017-7-28 上午11:09:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

//查询所有一天内即将到期的会员
$dayArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `level`, `nickname`, `expired` FROM `#@__member` WHERE `level` != 0 AND `expired` - $time <= 86400 AND `expired_notify_day` = 0");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $level = $value['level'];
    $nickname = $value['nickname'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    $levelName = "会员";
    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $level);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $levelName = $ret[0]['name'];
    }

    //记录一天内到期的会员ID
    array_push($dayArr, $id);

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `expired_notify_day` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    //消息通知
    $urlParam = array(
      "service"  => "member",
      "type"     => "user",
      "template" => "upgrade"
    );
    $param = array(
      "username" => $nickname,
      "title"    => $levelName,
      "time"     => $date,
      "date"     => $date,
      "fields" => array(
          'keyword1' => '会员级别',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($value['id'], "会员-特权到期提醒", $urlParam, $param);
  }
}


//查询所有一周内即将到期的会员
$where = "";
if($dayArr){
  $days = join(",", $dayArr);
  $where = " AND `id` not in ($days)";
}
$weekArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `level`, `nickname`, `expired` FROM `#@__member` WHERE `level` != 0 AND `expired` - $time <= 604800 AND `expired_notify_week` = 0".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $level = $value['level'];
    $nickname = $value['nickname'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    $levelName = "会员";
    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $level);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $levelName = $ret[0]['name'];
    }

    //记录一周内到期的会员ID
    array_push($weekArr, $id);

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `expired_notify_week` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    //消息通知
    $urlParam = array(
      "service"  => "member",
      "type"     => "user",
      "template" => "upgrade"
    );
    $param = array(
      "username" => $nickname,
      "title"    => $levelName,
      "time"     => $date,
      "date"     => $date,
      "fields" => array(
          'keyword1' => '会员级别',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($value['id'], "会员-特权到期提醒", $urlParam, $param);
  }
}


//查询所有一月内即将到期的会员
$where = "";
if($weekArr){
  $weeks = join(",", $weekArr);
  $where = " AND `id` not in ($weeks)";
}
$sql = $dsql->SetQuery("SELECT `id`, `level`, `nickname`, `expired` FROM `#@__member` WHERE `level` != 0 AND `expired` - $time <= 2592000 AND `expired_notify_month` = 0".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {

    $id = $value['id'];
    $level = $value['level'];
    $nickname = $value['nickname'];
    $date = date("Y-m-d H:i:s", $value['expired']);

    $levelName = "会员";
    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $level);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $levelName = $ret[0]['name'];
    }

    //更新通知记录
    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `expired_notify_month` = 1 WHERE `id` = " . $value['id']);
    $dsql->dsqlOper($sql, "update");

    //消息通知
    $urlParam = array(
      "service"  => "member",
      "type"     => "user",
      "template" => "upgrade"
    );
    $param = array(
      "username" => $nickname,
      "title"    => $levelName,
      "time"     => $date,
      "date"     => $date,
      "fields" => array(
          'keyword1' => '会员级别',
          'keyword2' => '到期时间'
      )
    );
    updateMemberNotice($value['id'], "会员-特权到期提醒", $urlParam, $param);
  }
}
