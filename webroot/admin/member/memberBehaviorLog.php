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

    $where = $mwhere = "";
    //时间
    // if ($start == "" || $end == "") {
    //     echo '{"state":101, "info":' . json_encode("开始时间或结束时间不能为空") . '}';
    //     die;
    // }
    
    if ($start != "") {
        $where .= " AND l.`pubdate` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND l.`pubdate` <= " . GetMkTime($end . " 23:59:59");
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

    //搜索关键字
    if ($sKeyword != "") {
        $sKeyword = trim($sKeyword);
        $stype = trim($stype);
        $leftJoin = false;

        if ($stype == 'uid') {
            $suid = (int)$sKeyword;
            $where .= " AND l.`uid`=$suid";
        } else if ($stype == 'aid') {
            $said = (int)$sKeyword;
            $where .= " AND l.`aid`=$said";
        } else if ($stype == 'username') {
            $mwhere = " AND m.`username` = '$sKeyword'";
            $leftJoin = true;
        } else if ($stype == 'nickname') {
            $mwhere = " AND  m.`nickname` = '$sKeyword'";
            $leftJoin = true;
        } else if ($stype == 'phone') {
            $mwhere = " AND m.`phone` = '$sKeyword'";
            $leftJoin = true;
        }else if ($stype == 'ip') {
            $where .= " AND l.`$stype` LIKE '$sKeyword%'";
        }else if (in_array($stype, array('note', 'ipaddr'))) {
            $where .= " AND l.`$stype` LIKE '%$sKeyword%'";
        }
    }

    if ($leftJoin) {
        $archives = $dsql->SetQuery("SELECT count(1) as totalCount FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1=1 " . $where . $mwhere);
    } else {
        $archives = $dsql->SetQuery("SELECT count(1) as totalCount FROM `#@__" . $db . "` l WHERE 1=1 " . $where);
    }

    //总条数
    $totalCount = (int)$dsql->getOne($archives);
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $orderBy = " ORDER BY l.`pubdate` desc";

    $atpage = $pagestep * ($page - 1);
    if ($do == "export") {
        //循环导出【新】
        set_time_limit(0);      // 设置超时
        ini_set('memory_limit', '3072M');
        //开始导出
        $fileName = "行为日志_" . date("YmdHis") . ".csv";
        header('Content-Encoding: UTF-8');
        header("Content-type:application/vnd.ms-excel;charset=UTF-8");
        header('Content-Disposition: attachment;filename="' . $fileName . '"');
        //打开php标准输出流
        $fp = fopen('php://output', 'a');
        //添加BOM头，以UTF8编码导出CSV文件，如果文件头未添加BOM头，打开会出现乱码。
        fwrite($fp, chr(0xEF).chr(0xBB).chr(0xBF));
        //添加导出标题
        fputcsv($fp, ['记录ID','用户ID','用户昵称','所属模块','模块业务','模块信息ID','操作类型','操作描述','信息链接','操作时间','IP地址','IP归属地','设备信息','SQL语句','请求地址','请求参数','来源页面']);
        $nums = 20000; //每次导出数量【如果这个值太小反而容易网络失败，一般来说2、3万没有问题】
        $step = ceil($totalCount/$nums); //循环次数

        $allModuleTitle = getAllModuleTitle();
        for($i = 0; $i < $step; $i++) {
            $start = $i * $nums;
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, l.`pubdate`, l.`ip`, l.`ipaddr`, l.`module`, l.`temp`, l.`aid`, l.`type`, l.`note`, l.`link`, l.`useragent`, l.`sql`, l.`url`, l.`param`, l.`referer`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1=1 " . $where  . $mwhere . $orderBy . " LIMIT $start, $nums");
            $results = $dsql->dsqlOper($archives, "results");
            $newList = array();
            foreach ($results as $item) {
                $newList["id"]      = $item["id"];
                $newList["uid"]     = $item["uid"];
                $newList["nickname"]  = $item["nickname"] ? $item['nickname'] : $item['username'];
                $newList["module"]  = $item["module"] == 'siteConfig' ? '系统相关' : ($item["module"] == 'member' ? '会员相关' : ($item["module"] == 'business' ? '商家相关' : $allModuleTitle[$item["module"]]));
                $newList["temp"]    = $item["temp"];
                $newList["aid"]     = $item["aid"] ?: '';
                $newList["type"]    = $item["type"] == 'select' ? '查找' : ($item["type"] == 'insert' ? '新增' : ($item["type"] == 'update' ? '更新' : '删除'));
                $newList["note"]    = $item["note"];
                $newList["link"]    = $item["link"];
                $newList["pubdate"] = date("Y-m-d H:i:s", $item["pubdate"]);
                $newList["ip"]      = $item["ip"];
                $newList["ipaddr"]  = $item["ipaddr"];
                $newList["useragent"] = $item["useragent"];
                $newList["sql"]       = htmlspecialchars($item["sql"]);
                $newList["url"]       = $item["url"];
                $newList["param"]     = $item["param"];
                $newList["referer"]   = $item["referer"];
                fputcsv($fp, $newList);
            }
            //每1万条数据就刷新缓冲区
            ob_flush();
            flush();
        }
        die;
    }

    $idWhere = "";
    $maxLimit = 10000;
    $limit = " LIMIT $atpage, $pagestep";

    if ($atpage > $maxLimit) {
        if ($leftJoin) {
            $sql = $dsql->SetQuery("SELECT t.`id` FROM (SELECT l.`id`, l.`uid` FROM `#@__" . $db . "` l WHERE 1=1 $where $orderBy LIMIT $atpage, $pagestep) t LEFT JOIN `#@__member` m ON m.`id` = t.`uid` WHERE 1=1 $mwhere"); //延迟左联
        } else {
            $sql = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $db . "` l WHERE 1=1 $where $orderBy LIMIT $atpage, $pagestep");
        }

        $ids = $dsql->getArr($sql);
 
        if (count($ids) > 0) {
            $idWhere = " AND l.`id` IN(" . join(',', $ids) . ")";
        } else {
            $idWhere = " AND 1=2";
        }
        $limit = "";
    }

    $archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, l.`pubdate`, l.`ip`, l.`ipaddr`, l.`module`, l.`temp`, l.`aid`, l.`type`, l.`note`, l.`link`, l.`useragent`, l.`sql`, l.`url`, l.`param`, l.`referer`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1=1 " . $where . $mwhere . $idWhere . $orderBy . $limit);

    $results = $dsql->dsqlOper($archives, "results");

    if (is_array($results) && count($results) > 0) {
        $list = array();
        $allModuleTitle = getAllModuleTitle();
        foreach ($results as $key => $value) {
            $list[$key]["id"]      = $value["id"];
            $list[$key]["uid"]     = $value["uid"];
            $list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);
            $list[$key]["ip"]      = $value["ip"];
            $list[$key]["ipaddr"]  = $value["ipaddr"];
            $list[$key]["module"]  = $value["module"] == 'siteConfig' ? '系统相关' : ($value["module"] == 'member' ? '会员相关' : ($value["module"] == 'business' ? '商家相关' : $allModuleTitle[$value["module"]]));
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
        //已废弃 采用上面流式导出方法 2026-1-24
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

function getAllModuleTitle()
{
    global $dsql;
    $list = array();
    $sql = $dsql->SetQuery("SELECT `name`, `title`, `subject` FROM `#@__site_module`");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret && is_array($ret)) {
        foreach ($ret as $val) {
            $list[$val['name']] = $val['subject'] ? $val['subject'] : $val['title'];
        }
    }
    return $list;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

	$huoniaoTag->assign('moduleList', getModuleList(false));
    
    // $huoniaoTag->assign('startDate', ($start != "") ? $start : date('Y-m-d', strtotime('-7 days')));
    // $huoniaoTag->assign('endDate', ($end != "") ? $end : date('Y-m-d', time()));
    
    $max_memberBehaviorLog_save_day = (int)$max_memberBehaviorLog_save_day;
    $huoniaoTag->assign('max_memberBehaviorLog_save_day', $max_memberBehaviorLog_save_day == 0 ? '' : $max_memberBehaviorLog_save_day);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
