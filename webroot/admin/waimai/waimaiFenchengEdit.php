<?php
/**
 * 店铺管理 店铺列表
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
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

checkPurview("waimaiFencheng");

$dbname = "waimai_shop";
$templates = "waimaiFenchengEdit.html";


if($action == "save"){
  if(!empty($id)){
    $fencheng_foodprice   = empty($fencheng_foodprice) ? 0 :(int)$fencheng_foodprice;
    $fencheng_delivery    = empty($fencheng_delivery) ? 0 :(int)$fencheng_delivery;
    $fencheng_addservice  = empty($fencheng_addservice) ? 0 :(int)$fencheng_addservice;
    $fencheng_zsb         = empty($fencheng_zsb) ? 0 :(int)$fencheng_zsb;
    $fencheng_dabao       = empty($fencheng_dabao) ? 0 :(int)$fencheng_dabao;
    $fencheng_discount    = empty($fencheng_discount) ? 0 :(int)$fencheng_discount;
    $fencheng_promotion   = empty($fencheng_promotion) ? 0 :(int)$fencheng_promotion;
    $fencheng_firstdiscount = empty($fencheng_firstdiscount) ? 0 :(int)$fencheng_firstdiscount;
    $fencheng_quan = empty($fencheng_quan) ? 0 :(int)$fencheng_quan;

    $sql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET
        `fencheng_foodprice`      = '$fencheng_foodprice',
        `fencheng_delivery`       = '$fencheng_delivery',
        `fencheng_dabao`          = '$fencheng_dabao',
        `fencheng_addservice`     = '$fencheng_addservice',
        `fencheng_zsb`            = '$fencheng_zsb',
        `fencheng_discount`       = '$fencheng_discount',
        `fencheng_promotion`      = '$fencheng_promotion',
        `fencheng_firstdiscount`  = '$fencheng_firstdiscount',
        `fencheng_quan`           = '$fencheng_quan'

        WHERE `id` = $id");
    // echo $sql;die;

    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == "ok"){
      adminLog("修改外卖店铺分成比例 - $id", $sql, 1);
      echo '{"state": 100, "info": "修改成功！"}';
    }else{
      echo '{"state": 200, "info": "修改失败！"}';
    }
  }else{
    echo '{"state": 200, "info": "信息ID传输失败！"}';
  }

  exit();
}

if(empty($id)){
  header("location:waimaiFenchengEdit.php");
  die;
}



$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname`, s.`fencheng_foodprice`, s.`fencheng_delivery`, s.`fencheng_dabao`, s.`fencheng_addservice`,s.`fencheng_zsb`, s.`fencheng_discount`, s.`fencheng_promotion`, s.`fencheng_firstdiscount`, s.`fencheng_offline`, s.`fencheng_quan` FROM `#@__$dbname` s LEFT JOIN `#@__waimai_shop_type` t ON t.`id` in (s.`typeid`) WHERE s.`id` = $id");
$results = $dsql->dsqlOper($sql, "results");
if($results){
  $data = $results[0];
  foreach ($data as $key => $value) {
    $huoniaoTag->assign($key, $value);
  }

  $huoniaoTag->assign("shopname", $data['shopname']);

}else{
  header("location:waimaiFenchengEdit.php");
  die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
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
    'ui/jquery-ui.custom.min.js',
		'admin/waimai/waimaiFenchengEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
