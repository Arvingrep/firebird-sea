<?php
/**
 * 订单地图
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/";
$tpl = isMobile() ? $tpl."touch/order" : $tpl."order";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

// $sub = new SubTable('waimai_order', '#@__waimai_order');
// $dbname = $sub->getLastTable();
// $dbname = "waimai_order";
$templates = "waimaiOrderMap.html";

//验证模板文件

if(file_exists($tpl."/".$templates)){

    // $jsFile = array(

    //     'shop/waimaiOrder.js'

    // );

    // $huoniaoTag->assign('jsFile', $jsFile);



    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);

    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径

    $huoniaoTag->display($templates);

}else{

    echo $templates."模板文件未找到！";

}
