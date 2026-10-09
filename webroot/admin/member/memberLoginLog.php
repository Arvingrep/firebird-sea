<?php

/**
 * 用户登录日志管理
 *
 * @version        $Id: memberLoginLog.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("memberLoginLog");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member_login";

$templates = "memberLoginLog.html";

//js
$jsFile = array(
    'ui/bootstrap.min.js',
    'ui/bootstrap-datetimepicker.min.js',
    'ui/jquery-ui-selectable.js',
    'ui/clipboard.min.js',
    'admin/member/memberLoginLog.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


// 获取登录记录
if ($dopost == "getList" || $do == "export") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    //搜索关键字
    if ($sKeyword != "") {

        $sKeyword = trim($sKeyword);

        //用户ID
        if (substr($sKeyword, 0, 1) == '#') {
            $sKeyword = substr($sKeyword, 1);
            $where .= " AND l.`userid` = " . $sKeyword;
        } else {
            $where .= " AND (m.`username` LIKE '%$sKeyword%' OR m.`nickname` LIKE '%$sKeyword%' OR l.`loginip` LIKE '%$sKeyword%' OR l.`ipaddr` LIKE '%$sKeyword%' OR l.`useragent` LIKE '%$sKeyword%')";
        }
    }

    //平台
    if ($mtype != "") {
        $where .= " AND l.`platform` LIKE '%$mtype%'";
    }

    //时间
    if ($start != "") {
        $where .= " AND l.`logintime` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND l.`logintime` <= " . GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1 AND m.`id` IS NOT NULL" . $where);

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $where .= " order by l.`id` desc";

    $atpage = $pagestep * ($page - 1);
    if ($do != "export") {
        $where .= " LIMIT $atpage, $pagestep";
    }

    $archives = $dsql->SetQuery("SELECT l.`id`, l.`userid`, l.`logintime`, l.`loginip`, l.`ipaddr`, l.`platform`, l.`useragent`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1 AND m.`id` IS NOT NULL" . $where);

    $results = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]         = $value["id"];
            $list[$key]["userid"]     = $value["userid"];
            $list[$key]["logintime"]  = date("Y-m-d H:i:s", $value["logintime"]);
            $list[$key]["loginip"]    = $value["loginip"];
            $list[$key]["ipaddr"]     = $value["ipaddr"];
            $list[$key]["platform"]   = $value["platform"];
            $list[$key]["useragent"]  = $value["useragent"];
            $list[$key]["nickname"]   = $value["nickname"] ? $value['nickname'] : $value['username'];
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "memberLoginLog": ' . json_encode($list) . '}';
            }
        } else {
            if ($do != "export") {
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
            }
        }
    } else {
        if ($do != "export") {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
        }
    }

    if ($do == "export") {

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '记录ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户昵称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '登录时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '登录IP'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'IP归属地'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '登录方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '设备信息'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder . "会员登录记录.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach ($list as $data) {
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['logintime']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['loginip']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ipaddr']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['platform']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['useragent']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 会员登录记录.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);
    }
    die;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    $site_loginconnect = array();
    $sql = $dsql->SetQuery("SELECT `code`, `name` FROM `#@__site_loginconnect` ORDER BY `weight` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $site_loginconnect = $ret;
    }
    $huoniaoTag->assign('site_loginconnect', $site_loginconnect);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
