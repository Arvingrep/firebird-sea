<?php

global $dsql;
require_once(dirname(__FILE__).'/../common.inc.php');
$dsql  = new dsql($dbo);
//更新商城活动
$time = 86400;
$sql = $dsql->SetQuery("UPDATE  `#@__shop_huodongsign`  SET `ktime` = `ktime`+$time,`etime` = `etime`+$time, `state` = 1");
$shop = $dsql->dsqlOper($sql, "update");
//更新整点团购商品
$sql = $dsql->SetQuery("UPDATE  `#@__tuanlist`  SET `startdate` = `startdate`+$time,`enddate` = `enddate`+$time WHERE `hourly` = 1");
$tuan = $dsql->dsqlOper($sql, "results");

//更新顺风车发车时间和出发时间
$_now = GetMkTime(date('Y-m-d')) + 86400;
$sql = $dsql->SetQuery("SELECT * FROM `#@__sfcar_list`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret && is_array($ret)){
    foreach($ret as $k=>$v){
        $_id = $v['id'];
        $_missiontime = GetMkTime($v['missiontime']);
        if($_missiontime < $_now){
            $_his = date('H:i:s', $_missiontime);
            if($_his == '00:00:00'){
                $_his = rand(5, 23) . ':' . rand(0, 59) . ':' . rand(0, 59);
            }
            $_new_time = date('Y-m-d') . ' ' . $_his;
            $sql = $dsql->SetQuery("UPDATE `#@__sfcar_list` SET `missiontime` = '$_new_time' WHERE `id` = $_id");
            $dsql->dsqlOper($sql, "update");
        }
    }
}