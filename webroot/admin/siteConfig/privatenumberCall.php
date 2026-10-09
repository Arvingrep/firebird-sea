<?php

/**
 * 隐私保护通话呼叫记录
 *
 * @version        $Id: privatenumberCall.php 2022-05-17 下午14:23:10 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("privatenumberCall");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "privatenumberCall.html";

$leimuallarr = array(
    'business' => '商家',
    'info' => getModuleTitle(array('name' => 'info')),
    'sfcar' => getModuleTitle(array('name' => 'sfcar')),
);

//先更新所有已经过期的绑定记录的解绑时间
$time = time();
$sql = $dsql->SetQuery("UPDATE `#@__site_privatenumber_bind` SET `time2` = `expire` WHERE `expire` < $time AND `expire` != 0 AND `time2` = 0");
$dsql->dsqlOper($sql, "update");


//获取列表
if ($dopost == "getList") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = " AND b.`id` IS NOT NULL";

    if ($sKeyword != "") {
        if(is_numeric($sKeyword)){
            $where .= " AND (c.`number` = '$sKeyword' OR b.`uidA` = '$sKeyword' OR b.`numberA` = '$sKeyword' OR b.`uidB` = '$sKeyword' OR b.`numberB` = '$sKeyword')";
        }else{
            $where .= " AND (b.`subscriptionId` = '$sKeyword' OR b.`title` LIKE '%$sKeyword%')";
        }
    }

    if ($cityCode != "") {
        $where .= " AND l.`cityCode` = " . $cityCode;
    }

    // 模块
    if($source!=""){
        $where .= " AND b.`service`= '$source'";
    }

	if($start != ""){
		$where .= " AND c.`time1` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND c.`time1` <= ". GetMkTime($end." 23:59:59");
	}

    $archives = $dsql->SetQuery("SELECT b.`id` FROM `#@__site_privatenumber_call` c LEFT JOIN `#@__site_privatenumber_bind` b ON b.`id` = c.`bid` LEFT JOIN `#@__site_privatenumber_list` l ON l.`number` = b.`number` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $where .= " order by c.`id` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT c.`id`, c.`number`, c.`time1`, c.`time2`, c.`time3`, c.`time4`, c.`record`, b.`subscriptionId`, b.`service`, b.`title`, b.`url`, b.`uidA`, b.`numberA`, b.`uidB`, b.`numberB`, l.`cityCode`, l.`cityName`, l.`carrier` FROM `#@__site_privatenumber_call` c LEFT JOIN `#@__site_privatenumber_bind` b ON b.`id` = c.`bid` LEFT JOIN `#@__site_privatenumber_list` l ON l.`number` = b.`number` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]         = $value["id"];
            $list[$key]["number"]      = $value["number"];
            $list[$key]["time1"]      = $value["time1"] ? date("y-m-d H:i:s", $value["time1"]) : "-";
            $list[$key]["time2"]      = $value["time2"] ? date("y-m-d H:i:s", $value["time2"]) : "-";
            $list[$key]["time3"]      = $value["time3"] ? date("y-m-d H:i:s", $value["time3"]) : "-";
            $list[$key]["time4"]      = $value["time4"] ? date("y-m-d H:i:s", $value["time4"]) : "-";
            $list[$key]['record']     = $value['record'] ? getFilePath($value['record']) : '';

            $list[$key]["subscriptionId"]      = $value["subscriptionId"];
            $list[$key]["service"]      = $value["service"] == 'business' ? '商家' : getModuleTitle(array('name' => $value["service"]));
            
            $list[$key]["title"]      = strip_tags($value["title"]);

            $url = '';
            $urlStr = $value["url"];
            if($urlStr){
                $urlArr = unserialize($urlStr);
                $url = getUrlPath($urlArr);
            }
            $list[$key]["url"]         = $url;

            $list[$key]["uidA"]        = $value["uidA"];
            $userA = '';
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = " . $value["uidA"]);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $userA = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }
            $list[$key]["userA"]       = $userA;
            $list[$key]["numberA"]     = $value['numberA'];

            $list[$key]["uidB"]        = $value["uidB"];
            $userB = '';
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = " . $value["uidB"]);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $userB = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }
            $list[$key]["userB"]       = $userB;
            $list[$key]["numberB"]     = $value['numberB'];


            $list[$key]["cityCode"]   = $value["cityCode"];
            $list[$key]["cityName"]   = $value["cityName"];
            $list[$key]["carrier"]   = $value["carrier"];

        }
        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "list": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
        }
    } else {
        echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
    }
    die;


    //删除
} elseif ($dopost == "del") {
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    $number = array();
    foreach ($each as $val) {

        $sql = $dsql->SetQuery("SELECT c.`number`, b.`numberA`, b.`numberB`, b.`subscriptionId` FROM `#@__site_privatenumber_call` c LEFT JOIN `#@__site_privatenumber_bind` b ON b.`id` = c.`bid` WHERE c.`id` = " . $val);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            array_push($number, $ret[0]['number'] . '=>' . $ret[0]['numberA'] . ',' . $ret[0]['numberB'] . '=>' . $ret[0]['subscriptionId']);

            $archives = $dsql->SetQuery("DELETE FROM `#@__site_privatenumber_call` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
            
        } else {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除隐私保护通话呼叫记录", join('<br/>', $number));
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;
}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'admin/siteConfig/privatenumberCall.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //汇总所有归属地
    $cityNameArr = array();
    $sql = $dsql->SetQuery("SELECT `cityName`, `cityCode` FROM `#@__site_privatenumber_list` GROUP BY `cityName`");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $cityNameArr = $ret;
    }
    $huoniaoTag->assign('cityNameArr', $cityNameArr);
    $huoniaoTag->assign('leimuallarr',$leimuallarr);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
