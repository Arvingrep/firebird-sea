<?php   
if(!defined('HUONIAOINC') && !isset($_GET['auto'])) exit('Request Error!');

$is_auto = false;
if($_GET['auto'] && !defined('HUONIAOINC')){
  $is_auto = true;
  //系统核心配置文件
  require_once(dirname(__FILE__).'/../common.inc.php');
}

if($is_auto){
  $now = GetMkTime(time());
  // $hour = date("H", $now);
  // if($hour > 6 && $hour < 24) return;
  $sql = $dsql->SetQuery("SELECT `ltime` FROM `#@__site_cron` WHERE `file` = 'article_updateTotalCache'");
  $res = $dsql->dsqlOper($sql, "results");
  if($res){
    if($now - $res[0]['ltime'] < 3600){
      die('距离上次更新间隔时间太短，请在后台手动执行计划任务');
    }
  }
}

if(!class_exists('article_updateTotalCache', false)){
  set_time_limit(0);
  class article_updateTotalCache{
    public static function run($module){
      global $HN_memory;
      $cache = $HN_memory->get($module.'_total_all_key');
      if($cache){
        global $dsql;
        foreach ($cache as $key => $sql) {
          $count = 0;
          $res = $dsql->dsqlOper($sql, "results");
          if($res){
            $count = current($res[0]);
          }
          $HN_memory->set($key, $count, 86400);
        }
      }
    }
  }
  article_updateTotalCache::run('article');
}