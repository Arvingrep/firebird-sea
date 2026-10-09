<?php
/**
 * 管理店铺
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/touch/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$dbname = "waimai_shop";
$templates = "manage-store.html";

//商家切换配送方式开关，0禁用，1启用
require(HUONIAOINC . "/config/waimai.inc.php");
$businessChangeDelivery = (int)$custom_businessChangeDelivery;

if(empty($sid)){
  header("location:/wmsj/?to=shop");
  die;
}else{
  $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid AND `id` in ($managerIds)");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    $huoniaoTag->assign('shopname', $ret[0]['shopname']);
  }else{
    header("location:/wmsj/?to=shop");
    die;
  }
}

$huoniaoTag->assign('sid', $sid);

    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop` WHERE `id` = $sid");
    $ret = $dsql->dsqlOper($sql, "results");
 

	foreach ($ret[0] as $key => $value) {
		//桌号管理
		if ($key =="zhuohao") {
		   $value = unserialize($value);
		}
		if ($key =="addservice") {
		   $value = unserialize($value);
		}
		if ($key =="promotions") {
		   $value = unserialize($value);
		}
		if ($key =="selfdefine") {
		   $value = unserialize($value);
		}
		if ($key =="preset") {
		   $value = unserialize($value);
		}
		if ($key =="range_delivery_fee_value") {
		   $value = unserialize($value);
		}
		 $huoniaoTag->assign($key, $value);
	}
	$fields = array();
	
	if($dotype == "desk"){
		array_push($fields, 'zhuohao');
		$templates = 'manage-desk.html';
	}else if($dotype == "addservice"){
		array_push($fields, 'open_addservice');
		array_push($fields, 'addservice');
		$templates = 'manage-addservice.html';
	}else if($dotype == "promotions"){
		array_push($fields, 'open_promotion');
		array_push($fields, 'promotions');
		$templates = 'manage-promotions.html';
	}else if($dotype == "paytype"){
		array_push($fields, 'paytype');
		array_push($fields, 'offline_limit');
		array_push($fields, 'pay_offline_limit');
		$templates = 'manage-paytype.html';
	}else if($dotype == "notice"){
		array_push($fields, 'appvalid');
		array_push($fields, 'smsvalid');
		array_push($fields, 'sms_phone');
		array_push($fields, 'smsvalid');
		array_push($fields, 'weixinvalid');
		array_push($fields, 'customerid');
		array_push($fields, 'emailvalid');
		array_push($fields, 'email_address');
		array_push($fields, 'auto_printer');
		$templates = 'manage-notice.html';
	}else if($dotype == "selfdefine"){
		array_push($fields, 'selfdefine');
		$templates = 'manage-selfdefine.html';
	}else if($dotype == "peisong"){
		array_push($fields, 'merchant_deliver');
		array_push($fields, 'delivery_fee_mode');
		array_push($fields, 'basicprice');
		array_push($fields, 'delivery_fee');
		array_push($fields, 'delivery_fee_value');
		array_push($fields, 'delivery_fee_type');
		array_push($fields, 'range_delivery_fee_value');
		
		$templates = 'manage-peisong.html';
	}else if($dotype == "options"){
		array_push($fields, 'preset');
		$templates = 'manage-options.html';
	}


if($_POST){

    //修改配送方式时，如果后台禁用了商家切换，并且商家当前配送方式为平台配送时，不允许修改
    if($ret[0]['merchant_deliver'] == 0){
        if($dotype == 'peisong' && !$businessChangeDelivery){
            echo '{"state": 200, "info": "请联系平台客服申请开通！"}';die;
        }
    }elseif($dotype == 'peisong' && !$businessChangeDelivery && $ret[0]['merchant_deliver'] && !$merchant_deliver){
		echo '{"state": 200, "info": "请联系平台客服申请开通！"}';die;
	}

    // 拼接SET

    $setStr = $zhuohaoarr = array();
	function sort_by($x, $y){
	  return strcasecmp($x[1],$y[1]);
	}
    foreach ($fields as $key => $value) {
		if($value == 'zhuohao' && !empty($zhuohao)){
			foreach ($$value['content'] as $k => $v) {
				array_push($zhuohaoarr, array(
					$v
				));
			}
			$zhuohaoarr = serialize($zhuohaoarr);
			array_push($setStr, "`$value` = '".$zhuohaoarr."'");
		}elseif($value == 'addservice' && !empty($addservice)){
			$addserviceArr = array();
			if($addservice){
			    foreach ($addservice as $k => $v) {
			        array_push($addserviceArr, array(
			            $v['name'], $v['start'], $v['stop'], $v['price']
			        ));
			    }
			}
			$addservice = serialize($addserviceArr);
			array_push($setStr, "`$value` = '".$addservice."'");
		}elseif($value == 'promotions' && !empty($promotions)){
			$promotionsArr = array();
			if($promotions){
			    foreach ($promotions as $k => $v) {
			        array_push($promotionsArr, array(
			            (int)$v['amount'], (int)$v['discount']
			        ));
			    }
			}
			array_multisort(array_column($promotionsArr, 0),SORT_ASC,$promotionsArr);
			$promotions = serialize($promotionsArr);
			array_push($setStr, "`$value` = '".$promotions."'");
		}elseif($value == 'selfdefine' && !empty($selfdefine)){
			$selfdefineArr = array();
			if($selfdefine){
			    foreach ($selfdefine['type'] as $k => $v) {
			        array_push($selfdefineArr, array(
			            $v, $selfdefine['name'][$k], $selfdefine['content'][$k]
			        ));
			    }
			}
			$selfdefine = serialize($selfdefineArr);
			array_push($setStr, "`$value` = '".$selfdefine."'");
		}elseif($value == 'range_delivery_fee_value' && !empty($rangedeliveryfee)){
			$range_delivery_fee_value = array();
			if($rangedeliveryfee){
			    foreach ($rangedeliveryfee['start'] as $k => $v) {
			        array_push($range_delivery_fee_value, array(
			            $v, $rangedeliveryfee['stop'][$k], $rangedeliveryfee['value'][$k], $rangedeliveryfee['minvalue'][$k]
			        ));
			    }
			}
			$range_delivery_fee_value = serialize($range_delivery_fee_value);
			array_push($setStr, "`$value` = '".$range_delivery_fee_value."'");
		}elseif($value == 'preset' && !empty($field)){
			$preset = array();
			if($field){
			    foreach ($field['name'] as $k => $v) {
			        array_push($preset, array(
			            $field['type'][$k], $field['sort'][$k], $v, $field['content'][$k]
			        ));
			    }
			}
			// echo '<pre>';
			// var_dump($preset);die;
			uasort($preset, 'sort_by');
			$preset = serialize($preset);
			array_push($setStr, "`$value` = '".$preset."'");
		}elseif($value == 'paytype' && !empty($paytype)){
		   $paytype = isset($paytype) ? join(',',$paytype) : '';
		   $pay_offline_limit = (float)$pay_offline_limit;
		   $offline_limit = (int)$offline_limit;
		   array_push($setStr, "`$value` = '".$$value."'");
		}else{
		  		
		  array_push($setStr, "`$value` = '".$$value."'");
		}

    }
	// var_dump(join(",", $setStr));die;
	$sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET ".join(",", $setStr)." WHERE `id` = $sid");

	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == 'ok'){

        //记录用户行为日志
        memberLog($userid, 'waimai', 'detail', $sid, 'update', '修改店铺信息', '', $sql);

		echo '{"state": 100, "info": '.json_encode("保存成功！").'}';die;
	}else{
		echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';die;
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);

}else{
    echo $templates."模板文件未找到！";
}
