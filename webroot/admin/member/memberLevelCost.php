<?php
/**
 * 会员等级费用设置
 *
 * @version        $Id: memberLevelCost.php 2017-07-24 上午11:05:13 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberLevelCost");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//表名
$tab = "member_level";

//模板名
$templates = "memberLevelCost.html";

//js
$jsFile = array(
	'admin/member/memberLevelCost.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


//保存
if(!empty($_POST)){

	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);
		if(!$json){
			echo '{"state": 200, "info": "表单为空，保存失败！"}';
			die;
		}
	}else{
		echo '{"state": 200, "info": "表单为空，保存失败！"}';
		die;
	}

	// 费用
	if($dopost == "update"){

		$info = array();
		for($i = 0; $i < count($json); $i++){
			$id = (int)$json[$i]["id"];
			$price = sprintf("%.2f", $json[$i]["price"]);
			$mintime = (int)$json[$i]["mintime"];

			$sql = $dsql->SetQuery("UPDATE `#@__member_level` SET `price` = '$price', `mintime` = '$mintime' WHERE `id` = $id");
			$dsql->dsqlOper($sql, "update");

			array_push($info, 'ID：'.$id.'，费用：'.$price.'，最低充值月数：'.$mintime);
		}
	
		echo '{"state": 100, "info": "保存成功！"}';

		adminLog("修改会员等级费用", join("\n", $info));

	// 充值优惠
	}elseif($dopost == "updateDiscount"){
		$data = array();
		$info = array();
		for($i = 0; $i < count($json); $i++){
			$month = (int)$json[$i]["month"];
			$discount = (float)$json[$i]["discount"];
			
			array_push($data, array(
				"month" => $month,
				"discount" => $discount
			));

			array_push($info, '充值月数：'.$month.'，折扣：'.$discount);
		}

		$data = serialize($data);
		$sql = $dsql->SetQuery("UPDATE `#@__member_level` SET `discount` = '$data' WHERE `id` = $id");
		$dsql->dsqlOper($sql, "update");

		echo '{"state": 100, "info": "保存成功！"}';

		adminLog("修改会员充值优惠：$id", join("\n", $info));
	}

	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

		$sql = $dsql->SetQuery("SELECT `id`, `name`, `price`, `mintime`, `discount` FROM `#@__".$tab."` ORDER BY `id` ASC");
		$results = $dsql->dsqlOper($sql, "results");
		$levelList = array();
		if($results){
			foreach ($results as $key => $value) {
				$levelList[$key]['id']   = $value['id'];
				$levelList[$key]['name'] = $value['name'];
				$levelList[$key]['price'] = $value['price'];
				$levelList[$key]['mintime'] = $value['mintime'];
				$levelList[$key]['discount'] = $value['discount'] ?  unserialize($value['discount']) : array();
			}
		}
		$huoniaoTag->assign('levelList', $levelList);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
