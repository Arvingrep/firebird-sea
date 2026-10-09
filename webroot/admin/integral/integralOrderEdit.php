<?php
/**
 * 查看修改商城订单信息
 *
 * @version        $Id: integralOrderEdit.php 2016-04-25 上午09:31:15 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("integralOrderEdit");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "integralOrderEdit.html";

$action     = "integral_order";
$pagetitle  = "修改积分商城订单";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != ""){
	//对字符进行处理
	$address   = cn_substrR($address,50);
	$people   = cn_substrR($people,10);
}

if($dopost == "edit"){

	$pagetitle = "修改商城订单";

	if($submit == "提交"){

		//表单二次验证
		if(trim($address) == ''){
			echo '{"state": 200, "info": "请输入街道地址"}';
			exit();
		}
		if(trim($people) == ''){
			echo '{"state": 200, "info": "请输入收货人姓名"}';
			exit();
		}
		if(trim($contact) == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		//保存
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `address` = '".$address."', `people` = '".$people."', `contact` = '".$contact."', `note` = '".$note."' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "保存失败！"}';
			exit();
		}

		adminLog("修改商城订单配送信息", $id);

		echo '{"state": 100, "info": "修改成功！"}';
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$results   = $results[0];

				$ordernum   = $results["ordernum"];
				$people     = $results["people"];
				$userid     = $results["userid"];
				$storeid    = $results["store"];
				$freight    = $results["freight"];
				$priceinfo  = $results["priceinfo"];
				$peisongid  = $results["peisongid"];

				$param = array(
					"service"  => "integral",
					"template" => "store-detail",
					"id"       => $storeid
				);
				$storeUrl = getUrlPath($param);

				//用户名
				$userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $results["userid"]);
				$username = $dsql->dsqlOper($userSql, "results");
				if(count($username) > 0){
					$username = $username[0]['nickname'] ? $username[0]['nickname'] : $username[0]['username'];
				}else{
					$username = "未知";
				}

				//订单商品
				$product = array();
				$proid = $results['proid'];
				$title = $url = $litpic = "";
				$sql = $dsql->SetQuery("SELECT `title`, `litpic` FROM `#@__integral_product` WHERE `id` = $proid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
					$litpic = empty($ret[0]['litpic']) ? "" : getFilePath($ret[0]['litpic']);
					$url = getUrlPath(array("service" => "integral", "template" => "detail", "id" => $proid));
				}
				$product['title'] = $title;
				$product['url']   = $url;
				$product['price'] = $results['price'];
				$product['point'] = $results['point'];
				$product['count'] = $results['count'];
				$product['img']   = $litpic;


				$paytype  = $results['paytype'];
				$orderprice = $results['price'] * $results['count'] + $results['freight'];
				$orderpoint = $results['point'] * $results['count'];


				if($priceinfo){
					$priceinfo = unserialize($priceinfo);
					foreach ($priceinfo as $k => $v) {
						if(strpos($v['type'], 'uth_')){
							$orderprice -= $v['val'];
						}
					}
				}

				$orderprice = sprintf("%.2f", $orderprice);

				$expCompany = $results['exp-company'];
				$expNumber  = $results['exp-number'];
				$expDate    = $results['exp-date'];
				$orderstate = $results["orderstate"];
				$expDate    = $results['exp-date'];
				$retState   = $results['ret-state'];
				$retOkdate  = $results['ret-ok-date'];
				$retType    = $results['ret-type'];
				$retNote    = $results['ret-note'];

				$imglist = array();
				$pics = $results['ret-pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}
				$retPics   = $imglist;

				$retDate   = $results['ret-date'];
				$retSnote  = $results['ret-s-note'];

				$imglist = array();
				$pics = $results['ret-s-pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}
				$retSpics  = $imglist;

				$retSdate  = $results['ret-s-date'];
				$orderdate = date('Y-m-d H:i:s', $results["orderdate"]);
				$paytype = $results["paytype"];
				$paydate = date('Y-m-d H:i:s', $results["paydate"]);

				$people  = $results["people"];
				$address = $results["address"];
				$contact = $results["contact"];
				$note    = $results["note"];


			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'admin/integral/integralOrderEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('ordernum', $ordernum);
	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('product', $product);
	$huoniaoTag->assign('orderprice', $orderprice);
	$huoniaoTag->assign('orderpoint', $orderpoint);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('freight', $freight);
	$huoniaoTag->assign('priceinfo', empty($priceinfo) ? array() : $priceinfo);

	$huoniaoTag->assign('peisongid', $peisongid);

	$huoniaoTag->assign('expCompany', $expCompany);
	$huoniaoTag->assign('expNumber', $expNumber);
	$huoniaoTag->assign('expDate', $expDate);


	//主表信息
	$sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
	$ret = $dsql->dsqlOper($sql, "results");
	if(!empty($ret)){
		$huoniaoTag->assign('paytype', $ret[0]['pay_name']);
	}else{

		global $cfg_pointName;
		$payname = "";
		if($paytype == "point,money"){
			$payname = $cfg_pointName."+余额";
		}elseif($paytype == "point"){
			$payname = $cfg_pointName;
		}elseif($paytype == "money"){
			$payname = "余额";
		}else{
			$payname = empty($paytype) ? "积分或余额" : $paytype;
		}
		$huoniaoTag->assign('paytype', $payname);
	}


	$huoniaoTag->assign('expCompany', $expCompany);
	$huoniaoTag->assign('expNumber', $expNumber);
	$huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
	$huoniaoTag->assign('orderstate', $orderstate);
	$huoniaoTag->assign('retState', $retState);
	$huoniaoTag->assign('ordermobile', $ordermobile);
	$huoniaoTag->assign('cardnum', $cardnum);
	$huoniaoTag->assign('orderdate', $orderdate);
	$huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));

	$huoniaoTag->assign('retType', $retType);
	$huoniaoTag->assign('retNote', $retNote);
	$huoniaoTag->assign('retPics', $retPics);
	$huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
	$huoniaoTag->assign('retSnote', $retSnote);
	$huoniaoTag->assign('retSpics', $retSpics);
	$huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));
	$huoniaoTag->assign('paydate', $paydate);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/integral";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
