<?php
/**
 * 商城活动配置
 *
 * @version        $Id: shopHuodongConfig.php 2024-3-27 上午11:59:18 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("shopHuodongConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopHuodongConfig.html";

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    
    //js
    $jsFile = array(
        'vue/vue.min.js',
        'ui/element_ui_index.js',
        'admin/shop/shopHuodongConfig.js',
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    include(HUONIAOINC . "/config/shop.inc.php");
    global $cfg_basehost;
    global $customUpload;
    if ($customUpload == 1) {
        global $custom_thumbSize;
        global $custom_thumbType;
        $huoniaoTag->assign('thumbSize', $custom_thumbSize);
        $huoniaoTag->assign('thumbType', "*." . str_replace("|", ";*.", $custom_thumbType));
    }

    /*活动开启管理 活动类型1-准点抢,2-准点秒,3-砍价,4-拼团*/
    $huoniaoTag->assign('huodongopt', array( '1', '2', '3', '4'));
    $huoniaoTag->assign('huodongnames',array('准点抢购','特价秒杀','砍价','拼团特惠'));
    $huodongopen = $custom_huodongopen === '' ? array() : explode(",", $custom_huodongopen);
    $huoniaoTag->assign('huodongopen', $huodongopen);
    /*活动开启商品管理 活动类型1-准点抢,2-准点秒,3-砍价,4-拼团*/
    $huoniaoTag->assign('huodongshopopt', array( '1', '2', '3','4'));
    $huoniaoTag->assign('huodongshopnames',array('准点抢购','特价秒杀','砍价','拼团特惠'));

    $huodongshopopen = $custom_huodongshopopen === '' ? array() : explode(",", $custom_huodongshopopen);
    $huoniaoTag->assign('huodongshopopen', $huodongshopopen);
    $huoniaoTag->assign('huodongygtime', $customhuodongygtime);

    $huoniaoTag->assign('shopbargainingnomoneyCheckNum', array('0', '1'));
    $huoniaoTag->assign('shopbargainingnomoneyNames',array('可以下单','不可以下单'));
    $huoniaoTag->assign('shopbargainingnomoneyChecked', (int)$customshopbargainingnomoney);
    
    $huoniaoTag->assign('selfbargainCheckNum', array('0', '1'));
    $huoniaoTag->assign('selfbargainNames',array('禁止','允许'));
    $huoniaoTag->assign('selfbargainChecked', (int)$customselfbargain);

    $huoniaoTag->assign('bargaintime', $custombargaintime);
    $huoniaoTag->assign('helpbargain', $customhelpbargain);
    $huoniaoTag->assign('shopKanjiaGuize', stripslashes($custom_shopKanjiaGuize));

    //活动场次
    $sql = $dsql->SetQuery("SELECT `id`,`title`, `ktime`, `etime`,`number` FROM `#@__shopsessionsite`");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		foreach ($results as $key => $value) {
			$levelList[$key] = $value;
		}

	}
	$huoniaoTag->assign('levelList', $levelList);


    //css
    $cssFile = array(
        'admin/base.css',
        'ui/element_ui_index.css',
        'admin/shopHuodongConfig.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    $huoniaoTag->assign('action', 'shop');
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/shop";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
