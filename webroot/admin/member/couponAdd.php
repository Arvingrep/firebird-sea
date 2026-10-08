<?php
/**
 * 充值卡记录
 *
 * @version        $Id: coupon.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("coupon");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "couponAdd.html";

$action = "moneycoupon";

if($dopost == "add"){
	if(!testPurview('coupon')){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	}
	$amount = (int)$amount;
	$count = (int)$count;
	if($amount <= 0){
		echo '{"state":200, "info":'.json_encode("请输入金额").'}';
	}
	if($count <= 0){
		echo '{"state":200, "info":'.json_encode("请输入生成数量").'}';
	}
	if(empty($expire)){
		echo '{"state":200, "info":'.json_encode("请输入过期时间").'}';
	}

	$sqlQuan = array();
	$time = GetMkTime(time());
	$expire = GetMkTime($expire);
	for ($i = 0; $i < $count; $i++) {
		$cardnum = genSecret(8, 3);
		$sqlQuan[$i] = "('$cardnum', '$amount', '$expire', 0, '$time')";
	}

	$sql = $dsql->SetQuery("INSERT INTO `#@__moneycoupon` (`code`, `amount`, `expire`, `state`, `time`) VALUES ".join(",", $sqlQuan));
	$dsql->dsqlOper($sql, "update");

  	die(json_encode(array("state" => 100, "info" => "生成成功！")));
}

//验证模板文件
if(file_exists($tpl."/".$templates)){


	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/member/couponAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
