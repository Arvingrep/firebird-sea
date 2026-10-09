<?php

/**
 * 隐私保护通话号码管理
 *
 * @version        $Id: privatenumberList.php 2022-05-17 上午9:18:21 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("privatenumberList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "privatenumberList.html";


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
        $where .= " AND `number` = '$sKeyword'";
    }

    if ($cityCode != "") {
        $where .= " AND `cityCode` = " . $cityCode;
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__site_privatenumber_list` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //正常
    $normal = $dsql->dsqlOper($archives . " AND `state` = 1" . $where, "totalCount");
    //锁定
    $lock = $dsql->dsqlOper($archives . " AND `state` = 2" . $where, "totalCount");

    if ($state != "") {
        $where .= " AND `state` = $state";

        if($state == 1){
			$totalPage = ceil($normal/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($lock/$pagestep);
		}
    }

    $where .= " order by `id` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `number`, `cityCode`, `cityName`, `carrier`, `state` FROM `#@__site_privatenumber_list` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]         = $value["id"];
            $list[$key]["number"]      = $value["number"];
            $list[$key]["cityCode"]   = $value["cityCode"];
            $list[$key]["cityName"]   = $value["cityName"];
            $list[$key]["carrier"]   = $value["carrier"];
            $list[$key]["state"]      = $value["state"];

            //查询号码使用次数
            $bindCount = 0;
            $sql = $dsql->SetQuery("SELECT count(*) as totalCount FROM `#@__site_privatenumber_bind` WHERE `number` = '" . $value["number"] . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $bindCount = $ret[0]['totalCount'];
            }
            $list[$key]['bindCount'] = $bindCount;

            //查询号码正在使用的数量
            $useCount = 0;
            $sql = $dsql->SetQuery("SELECT count(*) as totalCount FROM `#@__site_privatenumber_bind` WHERE `number` = '" . $value["number"] . "' AND `time2` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $useCount = $ret[0]['totalCount'];
            }
            $list[$key]['useCount'] = $useCount;
        }
        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "normal": ' . $normal . ', "lock": ' . $lock . '}, "list": ' . json_encode($list) . '}';
        } else {
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "normal": ' . $normal . ', "lock": ' . $lock . '}, "info": ' . json_encode("暂无相关信息") . '}';
        }
    } else {
        echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "normal": ' . $normal . ', "lock": ' . $lock . '}, "info": ' . json_encode("暂无相关信息") . '}';
    }
    die;


    //删除
} elseif ($dopost == "del") {
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    $number = array();
    foreach ($each as $val) {

        $sql = $dsql->SetQuery("SELECT `number` FROM `#@__site_privatenumber_list` WHERE `id` = " . $val);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            array_push($number, $ret[0]['number']);

            $archives = $dsql->SetQuery("DELETE FROM `#@__site_privatenumber_list` WHERE `id` = " . $val);
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
        adminLog("删除隐私保护通话号码", join(',', $number));
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

        $sql = $dsql->SetQuery("SELECT `number` FROM `#@__site_privatenumber_list` WHERE `id` = " . $val);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            array_push($number, $ret[0]['number']);

            $archives = $dsql->SetQuery("UPDATE `#@__site_privatenumber_list` SET `state` = $state WHERE `id` = " . $val);
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
        adminLog("更新隐私保护通话号码状态为" . $state, join(',', $number));
        echo '{"state": 100, "info": ' . json_encode("操作成功！") . '}';
    }
    die;
}





//导入商品
if ($action == "import") {

    $file = $_POST['file'];

    global $cfg_ftpUrl;
    global $cfg_fileUrl;
    global $cfg_uploadDir;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpDir;
    global $cfg_quality;
    global $cfg_softSize;
    global $cfg_softType;
    global $cfg_editorSize;
    global $cfg_editorType;
    global $cfg_videoSize;
    global $cfg_videoType;
    global $cfg_meditorPicWidth;
    global $editorMarkState;

    $cfg_softType = explode("|", $cfg_softType);
    $cfg_editorType = explode("|", $cfg_editorType);
    $cfg_videoType = explode("|", $cfg_videoType);

    $editor_fileUrl = $cfg_ftpUrl;
    $editor_uploadDir = $cfg_uploadDir;
    $cfg_uploadDir = "/../.." . $cfg_uploadDir;
    $editor_ftpState = $cfg_ftpState;
    $editor_ftpDir = $cfg_ftpDir;
    $cfg_photoCutType = "scale_width";
    $editor_ftpType = $cfg_ftpType;

    //默认FTP帐号
    $custom_ftpState = $cfg_ftpState;
    $custom_ftpType = $cfg_ftpType;
    $custom_ftpSSL = $cfg_ftpSSL;
    $custom_ftpPasv = $cfg_ftpPasv;
    $custom_ftpUrl = $cfg_ftpUrl;
    $custom_ftpServer = $cfg_ftpServer;
    $custom_ftpPort = $cfg_ftpPort;
    $custom_ftpDir = $cfg_ftpDir;
    $custom_ftpUser = $cfg_ftpUser;
    $custom_ftpPwd = $cfg_ftpPwd;
    $custom_ftpTimeout = $cfg_ftpTimeout;
    $custom_OSSUrl = $cfg_OSSUrl;
    $custom_OSSBucket = $cfg_OSSBucket;
    $custom_EndPoint = $cfg_EndPoint;
    $custom_OSSKeyID = $cfg_OSSKeyID;
    $custom_OSSKeySecret = $cfg_OSSKeySecret;
    $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
    $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
    $custom_QINIUbucket = $cfg_QINIUbucket;
    $custom_QINIUdomain = $cfg_QINIUdomain;

    if ($customUpload == 1 && $custom_ftpState == 1) {
        $editor_fileUrl = $custom_ftpUrl;
        $editor_uploadDir = $custom_uploadDir;
        $editor_ftpDir = $custom_ftpDir;
    }
    //普通FTP模式
    if ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 1) {
        $editor_ftpType = 0;
        $editor_ftpState = 1;

        //阿里云OSS
    } elseif ($customFtp == 1 && $custom_ftpType == 1) {
        $editor_ftpType = 1;
        $editor_ftpState = 0;

        //七牛云
    } elseif ($customFtp == 1 && $custom_ftpType == 2) {
        $editor_ftpType = 2;
        $editor_ftpState = 0;

        //本地
    } elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
        $editor_ftpType = 3;
        $editor_ftpState = 0;
    }


    if (empty($file)) {
        echo '{"state": 200, "info": "参数传递失败，请刷新页面重试！"}';
        exit();
    }

    $RenrenCrypt = new RenrenCrypt();
    $fid = $RenrenCrypt->php_decrypt(base64_decode($file));

    if (is_numeric($fid)) {
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `id` = " . $fid);
    } else {
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `path` = '$file'");
    }
    $results = $dsql->dsqlOper($archives, "results");

    //附件路径存储方式为性能优先模式时，传过来的$file是带http的
    if (!$results && !is_numeric($fid) && strstr($file, 'http')) {
        $fileArr = parse_url($file);
        $file = $fileArr['path'];
        $archives = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `path` = '$file'");
        $results = $dsql->dsqlOper($archives, "results");
    }

    if ($results) {

        set_time_limit(600);

        $path = $results[0]['path'];

        //验证文件
        if (!file_exists(HUONIAOROOT . '/uploads' . $path)) {
            /* 下载文件 */
            $httpdown = new httpdown();
            $httpdown->OpenUrl(getFilePath($file)); # 远程文件地址
            $httpdown->SaveToBin(HUONIAOROOT . '/uploads' . $path); # 保存路径及文件名
            $httpdown->Close(); # 释放资源
        }

        //验证文件
        if (!file_exists(HUONIAOROOT . '/uploads' . $path)) {
            echo '{"state": 200, "info": "文件下载失败！"}';
            exit();
        }

        setlocale(LC_ALL, 'zh_CN.UTF-8');
        $file = fopen(HUONIAOROOT . '/uploads' . $path, "r");
        $insertQuery = array();
        $i = 0;
        $numberData = array();
        if ($file !== FALSE) {
            while (($data = fgetcsv($file, 0, '","')) !== FALSE) {
                if ($i > 0) {
                    array_push($numberData, $data);
                }
                $i++;
            }
            fclose($file);
        }
        delPicFile($_POST['file'], "delFile", "siteConfig");
        unlinkFile(HUONIAOROOT . '/uploads' . $path);

        $newNumberData = array();
        foreach($numberData as $key => $val){
            $data = array();
            foreach($val as $k => $v){
                $v = str_replace(',', '', $v);
                $v = str_replace('"', '', $v);
                if($v){
                    array_push($data, $v);
                }
            }
            array_push($newNumberData, $data);
        }

        if($newNumberData){
            foreach($newNumberData as $key => $data){
                $number = (int)$data[2];
                $cityCode = trim($data[5]);
                $cityName = trim($data[4]);
                $carrier = trim($data[9]);

                array_push($insertQuery, "('$number', '$cityCode', '$cityName', '$carrier', 1)");
            }

            $sql = $dsql->SetQuery("INSERT INTO `#@__site_privatenumber_list` (`number`, `cityCode`, `cityName`, `carrier`, `state`) VALUES " . join(", ", $insertQuery));
            $ret = $dsql->dsqlOper($sql, "update");
            if ($ret == 'ok') {
                echo '{"state": 100, "info": "导入成功！"}';
            } else {
                echo '{"state": 200, "info": "数据插入失败，请重试！"}';
            }
        }else{
            echo '{"state": 200, "info": "号码库获取失败，请确认后重试！"}';
        }
    } else {
        echo '{"state": 200, "info": "文件读取失败，请重试上传！"}';
        exit();
    }
    die;
}



//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
		'ui/jquery.ajaxFileUpload.js',
        'admin/siteConfig/privatenumberList.js'
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

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
