<?php
/**
 * 评论管理
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/message";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_common";
// $dbname = "public_comment";
$templates = "waimaiCommonReply.html";

$id = (int)$id;

if(!empty($action) && !empty($id)){
  if(!checkWaimaiShopManager($id, "waimaicommon")){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}
// 回复
if($action == "reply"){
    
    $pubdate = GetMkTime(time());
    $content = trim($content);

    if(empty($id)){
        echo '{"state":200, "info":"参数错误"}';
        die;
    }
    if(empty($content)){
        echo '{"state":200, "info":"请填写回复内容"}';
        die;
    }

    $sql = $dsql->SetQuery("SELECT `replydate` FROM `#@__waimai_common` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!$ret){
        echo '{"state":200, "info":"评论不存在"}';
        die;
    }

    if($ret[0]['replydate'] != 0){
        echo '{"state":200, "info":"您已经回复过"}';
    }else{
        $sql = $dsql->SetQuery("UPDATE `#@__waimai_common` SET `reply` = '$content', `replydate` = '$pubdate' WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret = "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'common', $id, 'update', '回复评论('.$content.')', '', $sql);

            echo '{"state":100, "info":"提交成功"}';
        }else{
            echo '{"state":200, "info":"提交失败"}';
        }
    }

    die;
}

$where = " AND c.`type` = 'waimai-order' AND c.`sid` in ($managerIds)";
$sql = $dsql->SetQuery("SELECT c.*, s.`shopname` FROM `#@__$dbname` c LEFT JOIN `#@__waimai_shop` s ON s.`id` = c.`sid` WHERE c.`id` = $id".$where);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $pics = $ret[0]['pics'];
    if($pics != ""){
        $ret[0]['pics'] = explode(",", $pics);
    }
    $detail = $ret[0];
}else{
    header("location:/404/html");
    die;
}

$huoniaoTag->assign('detail', $detail);

//验证模板文件
if(file_exists($tpl."/".$templates)){
    $jsFile = array(
        'shop/waimaiCommonReply.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
