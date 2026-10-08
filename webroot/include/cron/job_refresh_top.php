<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 招聘专属刷新置顶任务、职位自动下架
 *
 * @version        $Id: job_refresh_top.php 2023-03-15 上午12:36:18 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$day = date("Ymd");
require_once HUONIAOROOT."/api/payment/log.php";
$_job_refresh_top_log= new CLogFileHandler(HUONIAOROOT.'/log/job_refresh_top/'.$day.'/'.date('H').'.log', true);

global $dsql;

$time = GetMkTime(time());
//当前星期几？
$NN = date("N",$time);

/* -------        终止置顶(1/3)  --------- */
//找出所有到达时间（1），但未标记为end的任务（2），添加置顶结束标记 is_end =1
$where = "`is_end`=0 and `top_end`<$time";
$sql = $dsql::SetQuery("select `pid` from `#@__job_top_recode` where ".$where);
$jobs = $dsql->getArr($sql);
$_job_refresh_top_log->DEBUG("查询需要终止置顶的任务：" . $sql);
$_job_refresh_top_log->DEBUG("查询结果：");
$_job_refresh_top_log->DEBUG(json_encode($jobs));
if($jobs && is_array($jobs)){
    $sql = $dsql::SetQuery("update `#@__job_post` set `is_topping`=0 where `id` in(".join(",",$jobs).")");
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶状态_1：" . $sql);

    $sql = $dsql::SetQuery("update `#@__job_top_recode` set `is_end`=1 where ".$where);
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶记录_1：" . $sql);

    unset($jobs);
}
/* --------------   开始置顶(2/3)  ------------- */
//找出所有未结束的（1）、到达开始置顶时间（2）、且今日可置顶（3），但还没开始置顶的任务（4），立刻开始置顶该职位 is_start=1
$where = "`is_end`=0 and `is_start`=0 and `top_start`<=$time and !FIND_IN_SET($NN,`no_top`)";
$sql = $dsql::SetQuery("select `pid` from `#@__job_top_recode` where ".$where);
$jobs = $dsql->getArr($sql);
$_job_refresh_top_log->DEBUG("查询需要开始置顶的任务：" . $sql);
$_job_refresh_top_log->DEBUG("查询结果：");
$_job_refresh_top_log->DEBUG(json_encode($jobs));
if($jobs && is_array($jobs)){
    $sql = $dsql::SetQuery("update `#@__job_post` set `is_topping`=1 where `id` in(".join(",",$jobs).")");
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶状态_2：" . $sql);

    $sql = $dsql::SetQuery("update `#@__job_top_recode` set `is_start`=1 where ".$where);
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶记录_2：" . $sql);

    unset($jobs);
}
/*     --------     暂停置顶(3/3)  ---------- */
//找出所有未结束（1）、已经置顶中（2），但今天不置顶的（2），立刻停止置顶 is_start=0
$where = "`is_end`=0 and `is_start`=1 and FIND_IN_SET($NN,`no_top`)";
$sql = $dsql::SetQuery("select `pid` from `#@__job_top_recode` where ".$where);
$jobs = $dsql->getArr($sql);
$_job_refresh_top_log->DEBUG("查询需要暂停置顶的任务：" . $sql);
$_job_refresh_top_log->DEBUG("查询结果：");
$_job_refresh_top_log->DEBUG(json_encode($jobs));
if($jobs && is_array($jobs)){
    $sql = $dsql::SetQuery("update `#@__job_post` set `is_topping`=0 where `id` in(".join(",",$jobs).")");
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶状态_3：" . $sql);

    $sql = $dsql::SetQuery("update `#@__job_top_recode` set `is_start`=0 where ".$where);
    $dsql->update($sql);
    $_job_refresh_top_log->DEBUG("更新职位置顶记录_3：" . $sql);

    unset($jobs);
}

/*  -------   智能刷新任务  --------- */
//找出所有智能刷新类型（1）、还有未刷新完次数的（1）、下一次刷新时间已到（3），开始刷新并生成记录
$sql = $dsql::SetQuery("select `posts`,`id`,`refresh_count`,`interval`,`cid`,`limit_start`,`limit_end`,`next`,`less` from `#@__job_refresh_record` where `type`=2 and `refresh_count`>`less` and `next`<=$time");
$_job_refresh_top_log->DEBUG("查询需要智能刷新的任务：" . $sql);
$jobs = $dsql->getArrList($sql);
$_job_refresh_top_log->DEBUG("查询结果：");
$_job_refresh_top_log->DEBUG(json_encode($jobs));
if($jobs && is_array($jobs)){
    //必须循环处理，因为每个智能刷新任务不一样
    foreach ($jobs as $job){
        $_job_refresh_top_log->DEBUG(json_encode($job));
        $rid = $job['id'];
        $less = $job['less']; //当前已刷新次数
        $less ++;  //因为要刷新一次，所以++，当前即将执行的是第 n 次
        //正常情况下：next = next+间隔。
        $next = (int)$job['next'] + (int)$job['interval']*60;
        $hour = date("H:i",$next); //新的hour【改：时、分】
        $date = date("Y-m-d",$next); //新的日期
        //如果下一次时间，还没到达允许时间，则：next = 当天开始时间
        if(strtotime('1971-1-1 '.$hour.":00") < strtotime('1970-1-1 '.$job['limit_start'].":00")){
            $next = strtotime($date." ".$job['limit_start']);
        }
        //如果下一次时间，已经过了当天允许的最大时间，则：next = 下一天开始时间
        elseif(strtotime('1970-1-1 '.$hour.':00') > strtotime('1970-1-1 '.$job['limit_end'].":00")){
            $next = strtotime($date." ".$job['limit_start']." +1 day");
        }

        //错误情况，直接删除记录
        if($job['posts'] == 'undefined'){
            $sql = $dsql::SetQuery("delete from `#@__job_refresh_record` where `id` = " . $rid);
            $dsql->update($sql);
            break;
        }

        //刷新该职位
        $sql = $dsql::SetQuery("update `#@__job_post` set `update_time`={$job['next']} where `id` in({$job['posts']})");
        $dsql->update($sql);
        $_job_refresh_top_log->DEBUG("更新职位刷新时间：" . $sql);
        //生成记录到刷新表中
        $job_split = explode(",",$job['posts']);
        $has_insert = 0;
        foreach ($job_split as $job_i){
            //查询是否重复插入，特殊情况下有可能会同时插入两条数据
            $sql = $dsql::SetQuery("select `id` from `#@__job_refresh_log` where `cid` = {$job['cid']} and `pid` = $job_i and `type` = 2 and `pubdate` = {$job['next']} and `current` = $less and `total` = {$job['refresh_count']} and `rid` = $rid");
            $ret = $dsql->getArrList($sql);
            if(!$ret){
                $sql = $dsql::SetQuery("insert into `#@__job_refresh_log`(`cid`,`pid`,`type`,`pubdate`,`current`,`total`,`rid`) values({$job['cid']},$job_i,2,{$job['next']},$less,{$job['refresh_count']},{$rid})");
                $dsql->update($sql);
                $_job_refresh_top_log->DEBUG("增加职位刷新记录：" . $sql);
                //如果该职位刷新次数耗尽，则去除job_post智能刷新标记
                if($less==$job['refresh_count']){
                    $sql = $dsql::SetQuery("update `#@__job_post` set `is_refreshing`=0 where `id`=$job_i");
                    $dsql->update($sql);
                    $_job_refresh_top_log->DEBUG("更新职位刷新状态为已结束：" . $sql);
                }
                $has_insert = 1;
            }            
        }
        //更新已刷新记录和下一次（上一次）刷新时间
        if($has_insert){
            $sql = $dsql::SetQuery("update `#@__job_refresh_record` set `less`=`less`+1,`last`=`next`,`next`=$next where `id`={$rid}");
            $dsql->update($sql);
            $_job_refresh_top_log->DEBUG("更新职位刷新记录：" . $sql);
        }
    }
}

/* --------   智能下架任务    ------------ */
$dsql->update($dsql::SetQuery("update `#@__job_post` set `off`=1,`offdate`=".GetMkTime(time())." where `del`=0 and `off`=0 and `long_valid`=0 and `valid`<$time"));

// 修正已经结束的置顶【假设置顶记录表、和post表不同步了、置顶记录已经结束了或者不在置顶记录表中】
// 如果一个职位置顶了多次，最后的置顶如果还没有结束，这个SQL会强制把职位结束置顶
// $dsql->update($dsql::SetQuery("update `#@__job_post` set `is_topping`=0 where `is_topping`=1 and (`id` in(select `pid` from `#@__job_top_recode` where `is_end`=1) or `id` not in(select `pid` from `#@__job_top_recode`))"));
// 修正已经结束的刷新【假设刷新记录表、和post表不同步了，刷新记录已经结束了或者不在刷新记录表中】
// 如果一个职位刷新了多次，最后的刷新还没有结束，这个SQL会强制把刷新结束掉
// $dsql->update($dsql::SetQuery("update `#@__job_post` set `is_refreshing`=0 where `is_refreshing`=1 and FIND_IN_SET(`id`,(select GROUP_CONCAT(`posts`) from `#@__job_refresh_record` where `type`=2 and `less`=`refresh_count`)) or !FIND_IN_SET(`id`,(select GROUP_CONCAT(`posts`) from `#@__job_refresh_record` where `type`=2))"));

/* ---- 自动释放企业绑定 ----*/
include(HUONIAOINC."/config/job.inc.php");
if(!isset($custom_adminCompanyRelease) || empty($custom_adminCompanyRelease)){
    $custom_adminCompanyRelease = 30;
}
$custom_adminCompanyRelease = (int)$custom_adminCompanyRelease;
//找出需要解绑的id
$releaseArr = $dsql->getArrList($dsql::SetQuery("select `id` 'bid',`cid` from `#@__job_company_bind` where `release_type`=0 and `pubdate`<UNIX_TIMESTAMP(CURRENT_TIMESTAMP)-86400*{$custom_adminCompanyRelease} and id not in (select b.`id` from `#@__job_company_bind` b left join `#@__job_companylogs` l on b.`id`=l.`bid` where b.`release_type`=0 and l.`time`>UNIX_TIMESTAMP(CURRENT_TIMESTAMP)-86400*{$custom_adminCompanyRelease});"));
if($releaseArr){
    //被动释放
    $bid = array_column($releaseArr,"bid");
    $bid = join(",",$bid);
    $dsql->update($dsql::SetQuery("update `#@__job_company_bind` set `release_type`=2 where `id` in({$bid})"));
    //company冗余字段重置
    $cid = array_column($releaseArr,"cid");
    $cid = join(",",$cid);
    $dsql->update($dsql::SetQuery("update `#@__job_company` set `admin`=0 where `id` in({$cid})"));
}

