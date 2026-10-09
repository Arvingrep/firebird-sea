<?php

/**
 * 用户行为日志
 *
 * @version        $Id: memberBehaviorLog.php 2022-08-15 下午16:44:27 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("memberBehaviorLog");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member_log";

$templates = "memberBehaviorLog.html";

//js
$jsFile = array(
    'ui/bootstrap.min.js',
    'ui/bootstrap-datetimepicker.min.js',
    'ui/jquery-ui-selectable.js',
    'ui/clipboard.min.js',
    'admin/member/memberBehaviorLog.js'
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
            $where .= " AND l.`uid` = " . $sKeyword;
        //信息ID
        }elseif (substr($sKeyword, 0, 1) == '@') {
            $sKeyword = substr($sKeyword, 1);
            $where .= " AND l.`aid` = " . $sKeyword;
        } else {
            $where .= " AND (m.`username` LIKE '%$sKeyword%' OR m.`nickname` LIKE '%$sKeyword%' OR l.`note` LIKE '%$sKeyword%' OR l.`ip` LIKE '%$sKeyword%' OR l.`ipaddr` LIKE '%$sKeyword%' OR l.`useragent` LIKE '%$sKeyword%')";
        }
    }

    //模块
    if ($module != "") {
        $where .= " AND l.`module` = '$module'";
    }

    //类型
    if ($mtype != "") {
        $type = '';
        switch($mtype){
            case 'sel':
                $type = 'select';
                break;
            case 'ins':
                $type = 'insert';
                break;
            case 'upd':
                $type = 'update';
                break;
            case 'del':
                $type = 'delete';
                break;
        }
        $where .= " AND l.`type` = '$type'";
    }

    //时间
    if ($start != "") {
        $where .= " AND l.`pubdate` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND l.`pubdate` <= " . GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1 = 1 AND m.`id` IS NOT NULL" . $where);

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $where .= " order by l.`id` desc";

    $atpage = $pagestep * ($page - 1);
    if ($do != "export") {
        $where .= " LIMIT $atpage, $pagestep";
    }

    $archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, l.`pubdate`, l.`ip`, l.`ipaddr`, l.`module`, l.`temp`, l.`aid`, l.`type`, l.`note`, l.`link`, l.`useragent`, l.`sql`, l.`url`, l.`param`, l.`referer`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1 = 1 AND m.`id` IS NOT NULL" . $where);

    $results = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]      = $value["id"];
            $list[$key]["uid"]     = $value["uid"];
            $list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);
            $list[$key]["ip"]      = $value["ip"];
            $list[$key]["ipaddr"]  = $value["ipaddr"];
            $list[$key]["module"]  = $value["module"] == 'siteConfig' ? '系统相关' : ($value["module"] == 'member' ? '会员相关' : ($value["module"] == 'business' ? '商家相关' : getModuleTitle(array('name' => $value["module"]))));
            $list[$key]["temp"]    = $value["temp"];
            $list[$key]["aid"]     = $value["aid"] ?: '';
            $list[$key]["type"]    = $value["type"] == 'select' ? '查找' : ($value["type"] == 'insert' ? '新增' : ($value["type"] == 'update' ? '更新' : '删除'));
            $list[$key]["note"]    = $value["note"];
            $list[$key]["link"]    = $value["link"];
            $list[$key]["useragent"] = htmlspecialchars(RemoveXSS($value["useragent"]));
            $list[$key]["sql"]       = htmlspecialchars($value["sql"]);
            $list[$key]["nickname"]  = $value["nickname"] ? $value['nickname'] : $value['username'];
            $list[$key]["url"]       = $value["url"];
            $list[$key]["param"]     = $value["param"];
            $list[$key]["referer"]   = htmlspecialchars(RemoveXSS($value["referer"]));
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "memberBehaviorLog": ' . json_encode($list) . '}';
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
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '所属模块'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块业务'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '模块信息ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '操作类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '操作描述'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '信息链接'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '操作时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'IP地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'IP归属地'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '设备信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'SQL语句'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '请求地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '请求参数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '来源页面'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filename = "会员行为日志_".date("YmdHis").".csv";
        $filePath = $folder . $filename;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach ($list as $data) {
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['uid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['module']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['temp']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['aid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['link']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pubdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ip']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ipaddr']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['useragent']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['sql']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['url']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['param']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['referer']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = " . $filename);
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);
    }
    die;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

	$huoniaoTag->assign('moduleList', getModuleList(false));

    $max_memberBehaviorLog_save_day = (int)$max_memberBehaviorLog_save_day;
    $huoniaoTag->assign('max_memberBehaviorLog_save_day', $max_memberBehaviorLog_save_day == 0 ? '' : $max_memberBehaviorLog_save_day);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
