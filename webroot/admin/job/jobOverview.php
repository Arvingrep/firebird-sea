<?php
/**
 * 招聘管理平台
 *
 * @version        $Id: jobOverview.php 2024-3-20 下午15:09:23 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobOverview");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobOverview.html";


//当前时间
$now_time = GetMkTime(time());

//今日开始时间
$today_start = GetMkTime(date('Y-m-d')." 00:00:00");

//今日结束时间
$today_end = GetMkTime(date('Y-m-d')." 23:59:59");

//昨天开始时间
$yesterday_start = GetMkTime(date('Y-m-d', strtotime("-1 day"))." 00:00:00");

//昨天结束时间
$yesterday_end = GetMkTime(date('Y-m-d', strtotime("-1 day"))." 23:59:59");

//六天前-用于近七日数据
$week_start = GetMkTime(date('Y-m-d', strtotime("-6 day")));

//前七日开始时间
$lastweek_start = GetMkTime(date('Y-m-d', strtotime("-13 day")));

//前七日结束时间
$lastweek_end = GetMkTime(date('Y-m-d', strtotime("-7 day"))." 23:59:59");

//本月开始时间
$month_start = GetMkTime(date('Y-m-01'));

//本月结束时间
$month_end = GetMkTime(date('Y-m-d', strtotime(date('Y-m-t')))." 23:59:59");

//上个月开始时间
$lastmonth_start = GetMkTime(date('Y-m-01', strtotime("-1 month")));

//上个月结束时间
$lastmonth_end = GetMkTime(date('Y-m-t', strtotime('-1 month', time()))." 23:59:59");

//一个月后
$nextmonth_start = GetMkTime(date('Y-m-d', strtotime("+1 month"))." 23:59:59");

//本年开始时间
$year_start = GetMkTime(date('Y-01-01'));

//本年结束时间
$year_end = GetMkTime(date('Y-12-31')." 23:59:59");

//去年开始时间
$lastyear_start = GetMkTime(date('Y-01-01', strtotime("-1 year")));

//去年结束时间
$lastyear_end = GetMkTime(date('Y-12-31', strtotime("-1 year"))." 23:59:59");




//基本统计数据
//招聘企业[总数、今日入驻、昨日入驻]、在招职位[总数、今日新增、昨日新增]、人才库[总数、今日新增、昨日新增]、累计收益[总数、今日、昨日]
if($dopost == 'basic'){

    $data = array(
        'company' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        ),
        'post' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        ),
        'resume' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        ),
        'income' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        )
    );

    //招聘企业[总数、今日入驻、昨日入驻]
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(*) FROM `#@__job_company` WHERE 1 = 1 ".getCityFilter('`cityid`').") AS totalCount, (SELECT COUNT(*) FROM `#@__job_company` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $today_start AND `pubdate` <= $today_end) AS today, (SELECT COUNT(*) FROM `#@__job_company` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $yesterday_start AND `pubdate` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['company'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }

    //职位[总数、今日发布、昨日发布]
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(*) FROM `#@__job_post` WHERE 1 = 1 ".getCityFilter('`cityid`').") AS totalCount, (SELECT COUNT(*) FROM `#@__job_post` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $today_start AND `pubdate` <= $today_end) AS today, (SELECT COUNT(*) FROM `#@__job_post` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $yesterday_start AND `pubdate` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['post'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }

    //人才库[总数、今日发布、昨日发布]
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(*) FROM `#@__job_resume` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `need_complete` = 1) AS totalCount, (SELECT COUNT(*) FROM `#@__job_resume` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $today_start AND `pubdate` <= $today_end AND `need_complete` = 1) AS today, (SELECT COUNT(*) FROM `#@__job_resume` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $yesterday_start AND `pubdate` <= $yesterday_end AND `need_complete` = 1) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['resume'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }

    //累计收益[总数、今日收益、昨日收益]
    $sql = $dsql->SetQuery("SELECT (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'job' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`').") AS totalCount, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'job' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`')." AND `date` >= $today_start AND `date` <= $today_end) AS today, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'job' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`')." AND `date` >= $yesterday_start AND `date` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['income'] = array(
            'totalCount' => (float)sprintf("%.2f", $ret['totalCount']),
            'today' => (float)sprintf("%.2f", $ret['today']),
            'yesterday' => (float)sprintf("%.2f", $ret['yesterday'])
        );
    }

    echo json_encode($data);die;

}

//占比分析
//职位[按分类统计数量]、求职方向[按职位类别统计数量]、普工职位[按普工职位分类统计数量]、收益[招聘套餐、增值包、下载简历、刷新职位、置顶职位、上架职位、普工付费联系、刷新简历、置顶简历]
elseif($dopost == 'ratio'){

    $data = array();

    //职位
    if($type == 'post'){

        //统计所有类别
        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__job_type` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($value['id'], "job_type"));
                if($lower){
                    $typeArr = array_merge($typeArr, $lower);
                }

                $typeIds = join(',', $typeArr);

                $sql = $dsql->SetQuery("SELECT COUNT(*) AS num FROM `#@__job_post` WHERE `type` in ($typeIds)" . getCityFilter('`cityid`'));
                $ret1 = $dsql->dsqlOper($sql, "results");
                if($ret1){
                    $totalCount += (int)$ret1[0]['num'];
                    array_push($data, array(
                        'typename' => $value['typename'],
                        'count' => (int)$ret1[0]['num']
                    ));
                }
                
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);
    }

    //人才简历，由于简历的意向职位是多个，所以不能用一条SQL查询出来，需要对分类进行循环查询
    elseif($type == 'resume'){
        
        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__job_type` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($value['id'], "job_type"));
                if($lower){
                    $typeArr = array_merge($typeArr, $lower);
                }

                $_count = 0;
                foreach ($typeArr as $k => $v) {
                    $sql = $dsql->SetQuery("SELECT COUNT(*) AS num FROM `#@__job_resume` WHERE FIND_IN_SET(".$v.", `job`) > 0" . getCityFilter('`cityid`'));
                    $ret1 = $dsql->dsqlOper($sql, "results");
                    if($ret1){
                        $totalCount += (int)$ret1[0]['num'];
                        $_count += (int)$ret1[0]['num'];
                    }
                }
                
                array_push($data, array(
                    'typename' => $value['typename'],
                    'count' => $_count
                ));
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);

    }

    //普工
    elseif($type == 'pg'){
        
        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__job_type_pg` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($value['id'], "job_type_pg"));
                if($lower){
                    $typeArr = array_merge($typeArr, $lower);
                }

                $_count = 0;
                foreach ($typeArr as $k => $v) {
                    $sql = $dsql->SetQuery("SELECT COUNT(*) AS num FROM `#@__job_pg` WHERE FIND_IN_SET(".$v.", `job`) > 0" . getCityFilter('`cityid`'));
                    $ret1 = $dsql->dsqlOper($sql, "results");
                    if($ret1){
                        $totalCount += (int)$ret1[0]['num'];
                        $_count += (int)$ret1[0]['num'];
                    }
                }

                array_push($data, array(
                    'typename' => $value['typename'],
                    'count' => $_count
                ));
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);

    }
    
    //收益[招聘套餐、增值包、下载简历、刷新职位、置顶职位、上架职位、普工付费联系、刷新简历、置顶简历]
    elseif($type == 'income'){
        $data = array(
            'package' => 0,
            'addvalue' => 0,
            'download' => 0,
            'refresh_post' => 0,
            'top_post' => 0,
            'up' => 0,
            'contact' => 0,
            'refresh_resume' => 0,
            'top_resume' => 0,
        );

        //套餐
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘套餐%'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['package'] = $ret;
        }

        //增值包
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘增值包%'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['addvalue'] = $ret;
        }

        //下载简历
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '下载简历%'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['download'] = $ret;
        }

        //刷新职位
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位刷新%' OR `info` like '招聘简历智能刷新%')");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['refresh_post'] = $ret;
        }

        //置顶职位
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位置顶%' OR `info` like '招聘职位计划置顶%')");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['top_post'] = $ret;
        }

        //上架职位
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '职位上架%'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['up'] = $ret;
        }

        //普工付费联系
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `ctype` = 'payPhone'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['contact'] = $ret;
        }

        //刷新简历
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '招聘简历刷新%' OR `info` like '招聘简历智能刷新%')");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['refresh_resume'] = $ret;
        }

        //置顶简历
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘简历置顶%'");
        $ret = (float)$dsql->getOne($sql);
        if($ret){
            $data['top_resume'] = $ret;
        }

    }

    echo json_encode($data);die;

}

//待处理
//企业入驻审核、企业信息修改、职位审核、简历审核、普工专区招工和求职信息、招聘会报名
elseif($dopost == 'todo'){

    $data = array(
        'company' => 0,
        'sensitive' => 0,
        'post' => 0,
        'resume' => 0,
        'pg' => 0,
        'qz' => 0,
        'fairs' => 0
    );

    //企业入驻审核
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_company` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `state` = 0");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['company'] = $ret;
    }

    //企业信息修改
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_company` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `changeState` = 1");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['sensitive'] = $ret;
    }

    //职位审核
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_post` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `state` = 0 AND (`valid` = 0 OR `valid` > $now_time)");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['post'] = $ret;
    }

    //简历审核
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_resume` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `state` = 0 AND `need_complete` = 1");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['resume'] = $ret;
    }

    //普工专区招工信息
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_pg` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `state` = 0");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['pg'] = $ret;
    }

    //普工专区求职信息
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_qz` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `state` = 0");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['qz'] = $ret;
    }

    //网络招聘会报名
    $sql = $dsql->SetQuery("SELECT COUNT(j.`id`) FROM `#@__job_fairs_join` j LEFT JOIN `#@__job_fairs` f ON f.`id` = j.`fid` LEFT JOIN `#@__job_fairs_center` c ON c.`id` = f.`fid` WHERE f.`type` = 2 AND j.`state` = 0" . getCityFilter('c.`cityid`'));
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['fairs'] = $ret;
    }

    echo json_encode($data);die;

}

//近期招聘会- 查询前一周和后一个月以内的数据
elseif($dopost == 'fair'){
    
    $data = array();

    $sql = $dsql->SetQuery("SELECT f.`id`, f.`type`, f.`oid`, f.`title`, f.`startdate`, f.`enddate`, f.`picture`, f.`obj`, f.`join_type`, c.`title` venue, c.`cityid` FROM `#@__job_fairs` f LEFT JOIN `#@__job_fairs_center` c ON c.`id` = f.`fid` WHERE f.`startdate` >= $week_start AND f.`enddate` >= $now_time ".getCityFilter('c.`cityid`')." ORDER BY f.`startdate` ASC LIMIT 10");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $value){

            $id = (int)$value['id'];  //招聘会ID
            $venue = $value['venue'];  //招聘会场标题
            $cityname = getSiteCityName($value['cityid']);  //分站

            //主办单位信息
            $oid = (int)$value['oid'];
            $sql = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs_organizer` WHERE `id` = $oid");
            $organizer = $dsql->getOne($sql);

            //招聘会图片
            $litpic = '';
            $picture = $value['picture'];
            if($picture){
                $_picture = explode('###', $picture);
                $_picture = explode('||', $_picture[0]);
                $litpic = $_picture[0];
            }

            $companyCount = $companyPending = $post = 0;
            $type = (int)$value['type'];  //招聘会类型  1.现场招聘会，2.网络招聘会
            $join_type = (int)$value['join_type'];  //现场招聘会参会信息数据类型， 1自由编辑【不统计参会企业和岗位数量】  2数据录入
            if(($type == 1 && $join_type == 2) || $type == 2){

                //参会企业数量，现场招聘会不存在待审的情况
                if($type == 1){
                    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__job_fairs_join` WHERE `fid` = $id");
                    $companyCount = (int)$dsql->getOne($sql);

                    //参会职位数量
                    $sql = $dsql->SetQuery("SELECT `jobs` FROM `#@__job_fairs_join` WHERE `fid` = $id");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        foreach($ret as $_key => $_value){
                            $_value = json_decode($_value['jobs'], true);
                            if(is_array($_value)){
                                $post += count($_value);
                            }
                        }
                    }

                }else{
                    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(*) FROM `#@__job_fairs_join` WHERE `fid` = $id) as count, (SELECT COUNT(*) FROM `#@__job_fairs_join` WHERE `fid` = $id AND `state` = 0) as pending");
                    $ret = $dsql->getArr($sql);
                    $companyCount = (int)$ret['count'];
                    $companyPending = (int)$ret['pending'];

                    //参会职位数量
                    $sql = $dsql->SetQuery("SELECT COUNT(p.`id`) FROM `#@__job_post` p LEFT JOIN `#@__job_fairs_join` j ON j.`cid` = p.`company` WHERE j.`fid` = $id AND p.`state` = 1 AND p.`del` = 0 AND p.`off` = 0 AND (p.`valid` = 0 OR p.`valid` > $now_time OR p.`long_valid` = 1)");
                    $post = (int)$dsql->getOne($sql);
                }
            }

            $state = 0;  //招聘会状态  0.未开始，1.进行中，2.已结束
            $startdate = (int)$value['startdate'];
            $enddate = (int)$value['enddate'];
            if($now_time < $startdate){
                $state = 0;
            }else if($now_time >= $startdate && $now_time <= $enddate){
                $state = 1;
            }else{
                $state = 2;
            }

            array_push($data, array(
                'type' => (int)$value['type'],  //招聘会类型  1.现场招聘会，2.网络招聘会
                'organizer' => $organizer,  //主办单位
                'venue' => $venue,  //招聘会场标题
                'cityname' => $cityname,  //所属分站
                'title' => $value['title'],  //招聘会标题
                'start' => date('m月d日', $value['startdate']) . weekday($value['startdate']),
                'end' => date('m月d日', $value['enddate']) . weekday($value['enddate']),
                'litpic' => getFilePath($litpic),
                'obj' => $value['obj'],
                'companyCount' => $companyCount,
                'companyPending' => $companyPending,
                'post' => $post,
                'url' => getUrlPath(array('service' => 'job', 'template' => 'zhaopinhui', 'id' => $id)),
                'state' => $state
            ));
        }
    }

    echo json_encode($data);die;

}

//统计指定时间段内的数据[今日|近一周|本月|本年、昨日|上周|上月|去年]
//企业订单[总金额、总订单笔数、之前的数据]、招聘套餐、增值包、下载简历、刷新职位、置顶职位、上架职位
//其他/个人订单[总金额、总订单笔数、之前的数据]、刷新简历、置顶简历、普工付费联系
elseif($dopost == 'count'){
    
    $data = array();

    //时间筛选类型
    $start_time = $end_time = 0;
    $last_start_time = $last_end_time = 0;
    
    //今日
    if($type == 1){
        $start_time = $today_start;
        $end_time = $today_end;

        $last_start_time = $yesterday_start;
        $last_end_time = $yesterday_end;
    }
    //最近一周
    elseif($type == 2){
        $start_time = $week_start;
        $end_time = $now_time;

        $last_start_time = $lastweek_start;
        $last_end_time = $week_start - 1;
    }
    //本月
    elseif($type == 3){
        $start_time = $month_start;
        $end_time = $now_time;

        $last_start_time = $lastmonth_start;
        $last_end_time = $month_start - 1;
    }
    //本年
    elseif($type == 4){
        $start_time = $year_start;
        $end_time = $year_end;

        $last_start_time = $lastyear_start;
        $last_end_time = $year_start - 1;
    }
    //自定义时间
    else{

        if(!$start || !$end){
            die('时间未传');
        }

        $start_time = GetMkTime($start);
        $end_time = GetMkTime($end);
    }

    //套餐-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘套餐%' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['package']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //套餐-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘套餐%' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['package']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //增值包-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘增值包%' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['addvalue']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //增值包-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘增值包%' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['addvalue']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //下载简历-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '下载简历%' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['download']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //下载简历-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '下载简历%' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['download']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //刷新职位-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位刷新%' OR `info` like '招聘简历智能刷新%') AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['refresh_post']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //刷新职位-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位刷新%' OR `info` like '招聘简历智能刷新%') AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['refresh_post']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //置顶职位-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位置顶%' OR `info` like '招聘职位计划置顶%') AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['top_post']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //置顶职位-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '职位置顶%' OR `info` like '招聘职位计划置顶%') AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['top_post']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //上架职位-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '职位上架%' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['up']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //上架职位-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '职位上架%' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['up']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //普工付费联系-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `ctype` = 'payPhone' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['contact']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //普工付费联系-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `ctype` = 'payPhone' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['contact']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //刷新简历-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '招聘简历刷新%' OR `info` like '招聘简历智能刷新%') AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['refresh_resume']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //刷新简历-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND (`info` like '招聘简历刷新%' OR `info` like '招聘简历智能刷新%') AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['refresh_resume']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    //置顶简历-新数据
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘简历置顶%' AND `date` >= $start_time AND `date` <= $end_time");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['top_resume']['new'] = array((float)$ret['amount'], (int)$ret['count']);
    }

    //置顶简历-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT SUM(`platform`) amount, COUNT(*) count FROM `#@__member_money` WHERE `showtype` = 1 AND `ordertype` = 'job' ".getCityFilter('`cityid`')." AND `info` like '招聘简历置顶%' AND `date` >= $last_start_time AND `date` <= $last_end_time");
        $ret = $dsql->getArr($sql);
        if($ret){
            $data['top_resume']['old'] = array((float)$ret['amount'], (int)$ret['count']);
        }
    }

    echo json_encode($data);die;

}

//资讯
elseif($dopost == 'news'){

    $data = array();

    $sql = $dsql->SetQuery("SELECT n.`id`, n.`title`, n.`litpic`, n.`pubdate`, t.`typename` FROM `#@__job_news` n LEFT JOIN `#@__job_newstype` t ON t.`id` = n.`typeid` WHERE n.`arcrank` = 0 ".getCityFilter('n.`cityid`')." ORDER BY n.`id` DESC LIMIT 10");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            $data[$key]['title'] = $value['title'];
            $data[$key]['litpic'] = getFilePath($value['litpic']);
            $data[$key]['pubdate'] = date('Y-m-d', $value['pubdate']);
            $data[$key]['typename'] = $value['typename'];
            $data[$key]['url'] = getUrlPath(array('service' => 'job', 'template' => 'news-detail', 'id' => $value['id']));
        }
    }

    echo json_encode($data);die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$cssFile = array(
        'admin/base.css',
        'ui/element_ui_index.css',
        'admin/jobOverview.css'
    );
    //js
    $jsFile = array(
        'ui/jquery.mousewheel.min.js',
        'vue/vue.min.js',
        'ui/echarts/echart.5.5.0.js',
        'ui/element_ui_index.js',
        'admin/job/jobOverview.js',
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


    //发布更新信息相关配置
    require(HUONIAOINC . "/config/job.inc.php");

    $newCheck = $customNewCheck;  //商家新入驻是否需要审核  0需要审核  1不需要审核
    $changeCheck = $customChangeCheck;  //商家修改敏感信息  1需要审核  0不需要审核
    $changeCheck = $changeCheck ? 0 : 1;  //为了统一管理，这里把0改为1,1改为0,即：0需要审核  1不需要审核
    $agentCheck = $customagentCheck;  //发布更新职位  0需要审核  1不需要审核
    $fabuCheck = $custom_fabuCheck;  //普工专区发布信息是否需要审核  0需要审核  1不需要审核
    $fabuResumeCheck = $custom_fabuResumeCheck;  //发布更新简历是否需要审核  0需要审核  1不需要审核
    $jobFairJoinState = $custom_jobFairJoinState;  //网络招聘会企业报名是否需要审核  0需要审核  1不需要审核

    $huoniaoTag->assign('newCheck', (int)$newCheck);
    $huoniaoTag->assign('changeCheck', (int)$changeCheck);
    $huoniaoTag->assign('agentCheck', (int)$agentCheck);
    $huoniaoTag->assign('fabuCheck', (int)$fabuCheck);
    $huoniaoTag->assign('fabuResumeCheck', (int)$fabuResumeCheck);
    $huoniaoTag->assign('jobFairJoinState', (int)$jobFairJoinState);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
