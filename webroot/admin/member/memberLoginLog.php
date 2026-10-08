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

    $where = $mwhere = "";
    
    //时间
    if ($start != "") {
        $where .= " AND l.`logintime` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND l.`logintime` <= " . GetMkTime($end . " 23:59:59");
    }

    //搜索关键字
    if ($sKeyword != "") {
        $sKeyword = trim($sKeyword);
        $stype = trim($stype);
        $leftJoin = false;

        if ($stype == 'uid') {
            $suid = (int)$sKeyword;
            $where .= " AND l.`userid`=$suid";
        } else if ($stype == 'username') {
            $mwhere = " AND m.`username` = '$sKeyword'";
            $leftJoin = true;
        } else if ($stype == 'nickname') {
            $mwhere = " AND  m.`nickname` = '$sKeyword'";
            $leftJoin = true;
        } else if ($stype == 'loginip') {
            $where .= " AND l.`loginip` LIKE '$sKeyword%'";
        } else if ($stype == 'ipaddr') {
            $where .= " AND l.`ipaddr` LIKE '%$sKeyword%'";
        }
    }

    //平台
    if ($mtype != "") {
        $where .= " AND l.`platform` LIKE '%$mtype%'";
    }

    if ($leftJoin) {
        $archives = $dsql->SetQuery("SELECT count(1) as totalCount FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1=1 " . $where . $mwhere);
    } else {
        $archives = $dsql->SetQuery("SELECT count(1) as totalCount FROM `#@__" . $db . "` l WHERE 1=1 " . $where);
    }

    //总条数
    $totalCount = (int)$dsql->getOne($archives);
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $orderBy = " ORDER BY l.`logintime` DESC";

    $atpage = $pagestep * ($page - 1);
    if ($do == "export") {
        //循环导出【新】
        set_time_limit(0);      // 设置超时
        ini_set('memory_limit', '3072M');
        //开始导出
        $fileName = "登录日志_" . date("YmdHis") . ".csv";
        header('Content-Encoding: UTF-8');
        header("Content-type:application/vnd.ms-excel;charset=UTF-8");
        header('Content-Disposition: attachment;filename="' . $fileName . '"');
        //打开php标准输出流
        $fp = fopen('php://output', 'a');
        //添加BOM头，以UTF8编码导出CSV文件，如果文件头未添加BOM头，打开会出现乱码。
        fwrite($fp, chr(0xEF).chr(0xBB).chr(0xBF));
        //添加导出标题
        fputcsv($fp, ['记录ID','用户ID','用户昵称','登录时间','登录IP','IP归属地','登录方式','设备信息']);
        $nums = 20000; //每次导出数量【如果这个值太小反而容易网络失败，一般来说2、3万没有问题】
        $step = ceil($totalCount/$nums); //循环次数

        for($i = 0; $i < $step; $i++) {
            $start = $i * $nums;
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`userid`, l.`logintime`, l.`loginip`, l.`ipaddr`, l.`platform`, l.`useragent`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1=1 " . $where  . $mwhere . $orderBy . " LIMIT $start, $nums");
            $results = $dsql->dsqlOper($archives, "results");
            $newList = array();
            foreach ($results as $item) {
                $newList["id"]      = $item["id"];
                $newList["uid"]     = $item["userid"];
                $newList["nickname"]  = $item["nickname"] ? $item['nickname'] : $item['username'];
                $newList["logintime"] = date("Y-m-d H:i:s", $item["logintime"]);
                $newList["loginip"]    = $item["loginip"];
                $newList["ipaddr"]  = $item["ipaddr"];
                $newList["platform"]  = $item["platform"];
                $newList["useragent"] = $item["useragent"];
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
            $sql = $dsql->SetQuery("SELECT t.`id` FROM (SELECT l.`id`, l.`userid` FROM `#@__" . $db . "` l WHERE 1=1 $where $orderBy LIMIT $atpage, $pagestep) t LEFT JOIN `#@__member` m ON m.`id` = t.`userid` WHERE 1=1 $mwhere"); //延迟左联
        } else {
            $sql = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $db . "` l WHERE 1=1 $where $orderBy LIMIT $atpage, $pagestep");
        }

        $ids = $dsql->getArr($sql);
 
        if (count($ids) > 0) {
            $idWhere = " AND l.`id` IN (" . join(',', $ids) . ")";
        } else {
            $idWhere = " AND 1=2";
        }
        $limit = "";
    }

    $archives = $dsql->SetQuery("SELECT l.`id`, l.`userid`, l.`logintime`, l.`loginip`, l.`ipaddr`, l.`platform`, l.`useragent`, m.`username`, m.`nickname` FROM `#@__" . $db . "` l  LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1=1 " . $where . $mwhere . $idWhere . $orderBy . $limit);

    $results = $dsql->dsqlOper($archives, "results");

    if (is_array($results) && count($results) > 0) {
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
        //此处代码已废弃 2026-01-26
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
