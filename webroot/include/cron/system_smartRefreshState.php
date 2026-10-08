<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 智能刷新计划任务
 *
 * @version        $Id: system_smartRefreshState.php 2018-08-27 下午16:36:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $installModuleArr;
$smartRefresh_time = GetMkTime(time());
$smartRefresh_tab = array();

if(in_array('info', $installModuleArr)){
  array_push($smartRefresh_tab, 'infolist');
}

if(in_array('house', $installModuleArr)){
  array_push($smartRefresh_tab, 'house_property_listing'); //新房产房源表-二手房+新房
  array_push($smartRefresh_tab, 'house_sale');
  array_push($smartRefresh_tab, 'house_zu');
  array_push($smartRefresh_tab, 'house_xzl');
  array_push($smartRefresh_tab, 'house_sp');
  array_push($smartRefresh_tab, 'house_cf');
}

if(in_array('job', $installModuleArr)){
  array_push($smartRefresh_tab, 'job_resume'); //招聘仅刷新简历，职位的在job_refresh_top.php中执行
}

if(in_array('car', $installModuleArr)){
  array_push($smartRefresh_tab, 'car_list');
}

if(in_array('education', $installModuleArr)){
  array_push($smartRefresh_tab, 'education_courses');
}

if(in_array('sfcar', $installModuleArr)){
  array_push($smartRefresh_tab, 'sfcar_list');
}

if($smartRefresh_tab){
  foreach ($smartRefresh_tab as $key => $value) {
    $sql = $dsql->SetQuery("SELECT `id`, `refreshCount`, `refreshTimes`, `refreshNext`, `refreshSurplus` FROM `#@__".$value."` WHERE `refreshSmart` = 1 AND `refreshNext` <= '$smartRefresh_time' AND `refreshSurplus` > 0");
    $ret = $dsql->dsqlOper($sql, "results");
    if(is_array($ret)){
      foreach ($ret as $k => $v) {
        $id = $v['id'];
        $refreshCount = $v['refreshCount'];
        $refreshTimes = $v['refreshTimes'];
        $refreshNext = $v['refreshNext'];
        $refreshSurplus = $v['refreshSurplus'];

        //下次刷新时间
        $nextRefreshTime = $smartRefresh_time + (int)(24/($refreshCount/$refreshTimes)) * 3600;
        $refreshSurplus = $refreshSurplus - 1;

        $where = '';
        //最后一次
        if($refreshSurplus <= 0){
          $where = ', `refreshSmart` = 0';
        }

        $upTimeField = ($value == 'house_property_listing') ? 'publish_time' : 'pubdate'; //兼容新房产中房源的更新时间字段
        $sql = $dsql->SetQuery("UPDATE `#@__".$value."` SET `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `$upTimeField` = '$smartRefresh_time'".$where." WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");

      }
    }
  }
}
