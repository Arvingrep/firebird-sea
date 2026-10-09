<?php
//将买单、外卖打印机导入新的表
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");

checkPurview("businessPrinterList");

//分站管理员无此权限
if($userType == 3){
    die('无权操作！');
}

//查询买单表
//查询商家配置使用的什么打印机平台
include HUONIAOINC . '/config/business.inc.php';
$printPlat = $customPrintPlat == 0 ? 'yilianyun' : 'feie';
$sql = $dsql->SetQuery("SELECT `id`, `sid`, `mcode`, `msign`, `remarks` FROM `#@__business_shopprint` ORDER BY `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach($ret as $key => $val){
        $sid = $val['sid'];
        $mcode = $val['mcode'];
        $msign = $val['msign'];
        $remarks = $val['remarks'] ? $val['remarks'] : '打印机' . $val['id'];

        //查询店铺是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` = " . $sid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            //将打印机插入数据表-打印机列表
            $time = time();
            $sql = $dsql->SetQuery("INSERT INTO `#@__business_print` (`title`, `sid`, `mcode`, `msign`, `type`, `pubdate`, `printmodule`) VALUES ('$remarks', '$sid', '$mcode', '$msign', '$printPlat', '$time', 0)");
            $printid = $dsql->dsqlOper($sql, "lastid");
            if(is_numeric($printid)){

                //插入买单打印机数据表
                $sql = $dsql->SetQuery("INSERT INTO `#@__business_shop_print` (`service`, `sid`, `printid`) VALUES ('maidan', '$sid', '$printid')");
                $dsql->dsqlOper($sql, "update");

            }
        }

    }
}

//查询外卖表
//查询外卖配置使用的什么打印机平台
include HUONIAOINC . '/config/waimai.inc.php';
$printPlat = $customPrintPlat == 0 ? 'yilianyun' : 'feie';
$printModule = (int)$customPrintType;
$sql = $dsql->SetQuery("SELECT `id`, `sid`, `mcode`, `msign`, `remarks`, `template` FROM `#@__waimai_shopprint` ORDER BY `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach($ret as $key => $val){
        $sid = $val['sid'];  //外卖店铺ID
        $mcode = $val['mcode'];
        $msign = $val['msign'];
        $remarks = $val['remarks'] ? $val['remarks'] : '打印机' . $val['id'];
        $template = $val['template'];  //打印模板自定义

        $printtemplate = '';

        //验证模板是否合法
        $templateArr = $template ? unserialize($template) : array();
        if(is_array($templateArr)){
            $printtemplate = $template;
        }

        //查询店铺是否存在
        $sql = $dsql->SetQuery("SELECT b.`id` FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_shop_manager` m ON m.`shopid` = s.`id` LEFT JOIN `#@__business_list` b ON b.`uid` = m.`userid` WHERE s.`id` = " . $sid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['id'];  //大商家ID

            //将打印机插入数据表-打印机列表
            $time = time();
            $sql = $dsql->SetQuery("INSERT INTO `#@__business_print` (`title`, `sid`, `mcode`, `msign`, `type`, `pubdate`, `printmodule`) VALUES ('$remarks', '$bid', '$mcode', '$msign', '$printPlat', '$time', 0)");
            $printid = $dsql->dsqlOper($sql, "lastid");
            if(is_numeric($printid)){

                //插入买单打印机数据表
                $sql = $dsql->SetQuery("INSERT INTO `#@__business_shop_print` (`service`, `sid`, `printid`, `printtemplate`) VALUES ('waimai', '$sid', '$printid', '$printtemplate')");
                $dsql->dsqlOper($sql, "update");

            }
        }
        
    }
}

echo '<h1>同步完成！</h1>';
echo '<script>setTimeout(function(){window.close();}, 3000);</script>';