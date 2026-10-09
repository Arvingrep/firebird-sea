<?php

/**
 * 隐私保护通话绑定记录
 *
 * @version        $Id: privatenumberBind.php 2022-05-17 上午11:20:15 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("privatenumberBind");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "privatenumberBind.html";

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

    $where = "";

    if ($sKeyword != "") {
        if(is_numeric($sKeyword)){
            $where .= " AND (b.`number` = '$sKeyword' OR b.`uidA` = '$sKeyword' OR b.`numberA` = '$sKeyword' OR b.`uidB` = '$sKeyword' OR b.`numberB` = '$sKeyword')";
        }else{
            $where .= " AND (b.`subscriptionId` = '$sKeyword' OR b.`title` LIKE '%$sKeyword%')";
        }
    }

    // 模块
    if($source!=""){
        $where .= " AND b.`service`= '$source'";
    }

    if ($cityCode != "") {
        $where .= " AND l.`cityCode` = " . $cityCode;
    }

	if($start != ""){
		$where .= " AND b.`time1` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND b.`time1` <= ". GetMkTime($end." 23:59:59");
	}

    $archives = $dsql->SetQuery("SELECT b.`id` FROM `#@__site_privatenumber_bind` b LEFT JOIN `#@__site_privatenumber_list` l ON l.`number` = b.`number` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //使用中
    $used = $dsql->dsqlOper($archives . " AND b.`time2` = 0" . $where, "totalCount");
    //已解绑
    $unbind = $dsql->dsqlOper($archives . " AND b.`time2` != 0" . $where, "totalCount");

    //使用中
    if ($state == "1") {
        $where .= " AND b.`time2` = 0";

        $totalPage = ceil($used/$pagestep);

    //已解绑
    }else if ($state == "2") {
        $where .= " AND b.`time2` != 0";

        $totalPage = ceil($unbind/$pagestep);
    }

    $where .= " order by b.`id` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT b.`id`, b.`number`, b.`subscriptionId`, b.`service`, b.`title`, b.`url`, b.`uidA`, b.`numberA`, b.`uidB`, b.`numberB`, b.`expire`, b.`time1`, b.`time2`, l.`cityCode`, l.`cityName`, l.`carrier` FROM `#@__site_privatenumber_bind` b LEFT JOIN `#@__site_privatenumber_list` l ON l.`number` = b.`number` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]         = $value["id"];
            $list[$key]["number"]      = $value["number"];
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

            $list[$key]["expire"]     = $value["expire"] ? date("y-m-d H:i:s", $value["expire"]) : "<span class='gray'>不过期</span>";
            $list[$key]["time1"]      = $value["time1"] ? date("y-m-d H:i:s", $value["time1"]) : "未知";
            $list[$key]["time2"]      = $value["time2"] ? date("y-m-d H:i:s", $value["time2"]) : "<span class='audit'>使用中</span>";

            $list[$key]["cityCode"]   = $value["cityCode"];
            $list[$key]["cityName"]   = $value["cityName"];
            $list[$key]["carrier"]   = $value["carrier"];

            //查询是否拨通
            $iscall = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_privatenumber_call` WHERE `bid` = " . $value["id"]);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $iscall = 1;
            }
            $list[$key]['iscall'] = $iscall;

        }
        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "used": ' . $used . ', "unbind": ' . $unbind . '}, "list": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "used": ' . $used . ', "unbind": ' . $unbind . '}, "info": ' . json_encode("暂无相关信息") . '}';
        }
    } else {
        echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "used": ' . $used . ', "unbind": ' . $unbind . '}, "info": ' . json_encode("暂无相关信息") . '}';
    }
    die;


    //删除
} elseif ($dopost == "del") {
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    $number = array();
    foreach ($each as $val) {

        $sql = $dsql->SetQuery("SELECT `number`, `numberA`, `numberB`, `time2`, `subscriptionId` FROM `#@__site_privatenumber_bind` WHERE `id` = " . $val);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            array_push($number, $ret[0]['number'] . '=>' . $ret[0]['numberA'] . ',' . $ret[0]['numberB'] . '=>' . $ret[0]['subscriptionId']);

            //使用中的直接解绑
            if($ret[0]['time2'] == 0){
                $unbind = unbindPrivateNumber($ret[0]['subscriptionId'], $val);
                if($unbind['state'] == 200){
                    $error[] = $val;
                }
            }
            
            if(!$error){
                //删除呼叫记录
                $archives = $dsql->SetQuery("DELETE FROM `#@__site_privatenumber_call` WHERE `bid` = " . $val);
                $dsql->dsqlOper($archives, "update");

                $archives = $dsql->SetQuery("DELETE FROM `#@__site_privatenumber_bind` WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "update");
                if ($results != "ok") {
                    $error[] = $val;
                }
            }
            
        } else {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除隐私保护通话绑定记录", join('<br/>', $number));
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;


    //更新状态
} elseif ($dopost == "updateState") {
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    $number = array();
    foreach ($each as $val) {

        $sql = $dsql->SetQuery("SELECT `number`, `numberA`, `numberB`, `time2`, `subscriptionId` FROM `#@__site_privatenumber_bind` WHERE `id` = " . $val);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            array_push($number, $ret[0]['number'] . '=>' . $ret[0]['numberA'] . ',' . $ret[0]['numberB'] . '=>' . $ret[0]['subscriptionId']);

            //使用中的直接解绑
            if($ret[0]['time2'] == 0){
                $unbind = unbindPrivateNumber($ret[0]['subscriptionId'], $val);
                if($unbind['state'] == 200){
                    $error[] = $val;
                }
            }

        } else {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("解绑隐私保护通话绑定状态", join(',', $number));
        echo '{"state": 100, "info": ' . json_encode("操作成功！") . '}';
    }
    die;
}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'admin/siteConfig/privatenumberBind.js'
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
