<?php
/**
 * 配送员管理
 *
 * @version        $Id: shopCourier.php 2017-5-26 上午10:46:21 $
 * @package        HuoNiao.Courier
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("shopQuanList");

$dbname = "shop_quanlist";
$templates = "shopQuanListAdd.html";

$type = empty($type) || $type != "all" ? "only" : "all";


if($dopost == "submit"){

    if(empty($id)){
        echo '{"state":200, "info":"请选择要发放的优惠券"}';
        die;
    }
    if($type == "only"){
        if(empty($userid)){
            echo '{"state":200, "info":"请填写用户ID"}';
            die;
        }
        if(empty($count)){
            echo '{"state":200, "info":"请选择优惠券张数"}';
            die;
        }
    }

    // 查询优惠券
    $sql = $dsql->SetQuery("SELECT * FROM `#@__shop_quan` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!$ret){
        echo '{"state":200, "info":"优惠券不存在"}';
        die;
    }
    $data = $ret[0];
    foreach ($data as $key => $value) {
        $$key = $value;
    }
    $pubdate = GetMkTime(time());
    $ktime  = GetMkTime(time());
    if($deadline_type == 0){
        $day = date('Y-m-d', $pubdate);
        $time = $day." + ".($validity+1)." day";
        $deadline = strtotime($time) + 60 * 60 * 24 - 1;
    }
    if($shoptype == 0){
        $shopids = "";
    }
    if($is_relation_food == 0){
        $fid = "";
    }

    $pubdate = GetMkTime(time());

    $pageinfo = array();
    $err = array();


    $sendCount = 0;



    // 全部会员发放
    if($type == "all"){


        // set_time_limit(0);

        $page = empty($page) ? 1 : (int)$page;
        $pageSize = empty($pageSize) ? 50 : (int)$pageSize;

        $filter = (int)$filter;

        $where = empty($ids) ? "`mgroupid` = 0 AND `state` = 1 AND (`mtype` = 1 OR `mtype` = 2)" : "`id` IN ($ids)";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE $where");
        $totalCount = $dsql->dsqlOper($sql, "totalCount");

        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalCount" => $totalCount,
            "totalPage" => $totalPage
        );


        $atpage = $pageSize * ($page - 1);
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE $where ORDER BY `id` ASC LIMIT $atpage, $pageSize");
        $ret = $dsql->dsqlOper($sql, "results");
        foreach ($ret as $key => $value) {
            $userid = $value['id'];

            if($filter){

                $start = GetMkTime(date("Y-m-d"));
                $end = $start + 86400;

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_quanlist` WHERE `userid` = $userid AND `qid` = $id AND `pubdate` >= $start AND `pubdate` < $end");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    continue;
                }
            }

            $sql = $dsql->SetQuery("INSERT INTO `#@__shop_quanlist` (`qid`, `userid`, `name`, `des`, `promotio`, `basic_price`,`ktime`,`etime`, `shopids`, `fid`, `pubdate`,`bear`) VALUES ('$id', '$userid', '$name', '$des', '$promotio', '$basic_price','$ktime','$deadline', '$shopids', '$fid', '$pubdate','$bear')");
            $aid = $dsql->dsqlOper($sql, "lastid");

            if(!is_numeric($aid)){
                array_push($err, $userid);
            }else{
                $sendCount++;

                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "quan-shop"
                );
                updateMemberNotice($userid, "会员-外卖优惠券发放通知", $param, array("count" => 1));
            }
        }

        // 指定会员
    }else{

        $pageinfo = array(
            "page" => 1,
            "pageSize" => 0,
            "totalCount" => 1,
            "totalPage" => 1
        );

        // 验证会员
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = $userid AND `state` = 1 ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state":200, "info":"会员不存在或状态异常"}';
            die;
        }

        $sendCount = 1;
        $sendQuanCount = 0;

        for ($i = 0; $i < $count; $i++) {

            $sql = $dsql->SetQuery("INSERT INTO `#@__shop_quanlist` (`qid`, `userid`, `name`, `des`, `promotio`, `basic_price`, `etime`, `shopids`, `fid`, `pubdate`,`ktime`,`bear`) VALUES ('$id', '$userid', '$name', '$des', '$promotio', '$basic_price', '$deadline', '$shopids', '$fid', '$pubdate','$ktime','$bear')");
            $aid = $dsql->dsqlOper($sql, "lastid");
            if(!is_numeric($aid)){
                array_push($err, $userid);
            }else{
                $sendQuanCount++;
            }

        }

        if($sendQuanCount){
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "quan-shop"
            );
            updateMemberNotice($userid, "会员-外卖优惠券发放通知", $param, array("count" => $sendQuanCount));
        }
    }

    if($err){
        echo '{"state":100, "code":201, "info":"'.join(",", $err).'", "count": '.$sendCount.', "pageInfo":'.json_encode($pageinfo).'}';
        die;
    }else{
        echo '{"state":100, "code":100,  "info":"发放成功", "count": '.$sendCount.', "pageInfo":'.json_encode($pageinfo).'}';


        die;
    }





}




//查询优惠券列表
$quanList = array();
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__shop_quan` ORDER BY `id` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $quanList = $ret;
}
$huoniaoTag->assign("quanList", $quanList);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/bootstrap1.css',
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/chosen.min.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui.min.js',
        'ui/jquery-ui-i18n.min.js',
        'ui/jquery-ui-timepicker-addon.js',
        'admin/shop/shopQuanListAdd.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign("type", $type);

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
