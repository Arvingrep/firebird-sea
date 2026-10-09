<?php
/**
 * 评论管理
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_common";
// $dbname = "public_comment";
$templates = "waimaiCommonReply.html";

// 回复
if($action == "reply"){
    
    $pubdate = GetMkTime(time());

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
            echo '{"state":100, "info":"提交成功"}';
        }else{
            echo '{"state":200, "info":"提交失败"}';
        }
    }

    die;
}


$sql = $dsql->SetQuery("SELECT c.*, s.`shopname` FROM `#@__$dbname` c LEFT JOIN `#@__waimai_shop` s ON s.`id` = c.`sid` WHERE c.`id` = $id");
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

    //css
	$cssFile = array(
        'ui/jquery.chosen.css',
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
		'ui/jquery.form.js',
        'ui/chosen.jquery.min.js',
		// 'publicUpload.js',
		'admin/waimai/waimaiCommonReply.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
