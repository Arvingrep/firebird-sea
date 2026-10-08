<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 标题加粗加红计划任务
 *
 * @version        $Id: system_boldRedState.php 2019-05-14 下午16:36:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $installModuleArr;
$smartRefresh_time = strtotime("-1 day");
$smartRefresh_tab = array();

if(in_array('info', $installModuleArr)){
  array_push($smartRefresh_tab, 'infolist');
}

if(in_array('sfcar', $installModuleArr)){
  array_push($smartRefresh_tab, 'infolist');
}


if($smartRefresh_tab){
  foreach ($smartRefresh_tab as $key => $value) {
    $sql = $dsql->SetQuery("SELECT `id`, `titleBlod`, `titleBlodDay`, `titleRed`, `titleRedDay` FROM `#@__".$value."` WHERE (`titleBlod` = 1 AND `titleBlodDay` <= '$smartRefresh_time') OR (`titleRed` = 1 AND `titleRedDay` <= '$smartRefresh_time')");
    $ret = $dsql->dsqlOper($sql, "results");
    if(is_array($ret)){
      foreach ($ret as $k => $v) {
        $id           = $v['id'];
        $titleBlod    = $v['titleBlod'];
        $titleBlodDay = $v['titleBlodDay'];
        $titleRed     = $v['titleRed'];
        $titleRedDay  = $v['titleRedDay'];
  
        if($titleBlod == 1 && $titleBlodDay <= $smartRefresh_time){
            $sql = $dsql->SetQuery("UPDATE `#@__".$value."` SET `titleBlod` = '0', `titleBlodDay` = '0' WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
        }

        if($titleRed == 1 && $titleRedDay <= $smartRefresh_time){
          $sql = $dsql->SetQuery("UPDATE `#@__".$value."` SET `titleRed` = '0', `titleRedDay` = '0' WHERE `id` = $id");
          $ret = $dsql->dsqlOper($sql, "update");
        }

      }
    }
  }
}
