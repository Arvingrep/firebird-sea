<?php
/**
 * 查看修改家政订单信息
 *
 * @version        $Id: homemakingOrderEdit.php 2019-4-16 上午10:53:46 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingOrderList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingOrderEdit.html";

$action     = "homemaking_order";
$pagetitle  = "查看修改家政订单";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != ""){
	//对字符进行处理
	$useraddr   = cn_substrR($useraddr,50);
	$username   = cn_substrR($username,10);
}

if($dopost == "edit"){

	$pagetitle = "修改家政订单信息";

	if($submit == "提交"){

		//表单二次验证
		if(trim($useraddr) == ''){
			echo '{"state": 200, "info": "请输入地址"}';
			exit();
		}
		if(trim($username) == ''){
			echo '{"state": 200, "info": "请输入收货人姓名"}';
			exit();
		}
		if(trim($usercontact) == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		//保存
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `useraddr` = '".$useraddr."', `username` = '".$username."', `usercontact` = '".$usercontact."', `usernote` = '".$usernote."', `deliveryType` = ".$deliveryType." WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "保存失败！"}';
			exit();
		}

		adminLog("修改家政订单配送信息", $id);

		echo '{"state": 100, "info": "修改成功！"}';
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$ordernum = $results[0]["ordernum"];
				$people   = $results[0]["username"];
				$userid   = $results[0]["userid"];
				$doortime   = $results[0]["doortime"];
				$failnote   = $results[0]["failnote"];
				$onlinepay   = $results[0]["onlinepay"];

				//用户名
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $results[0]["userid"]);
				$username = $dsql->dsqlOper($userSql, "results");
				if(count($username) > 0){
					$username = $username[0]['username'];
				}else{
					$username = "未知";
				}

				$proid = $results[0]["proid"];

				//家政商品
				$proSql = $dsql->SetQuery("SELECT `title`, `homemakingtype` FROM `#@__homemaking_list` WHERE `id` = ". $results[0]["proid"]);
				$proResult = $dsql->dsqlOper($proSql, "results");
				if(count($proResult) > 0){
					$proname = $proResult[0]['title'];
				}else{
					$proname = "未知";
				}

				$param = array(
					"service"     => "homemaking",
					"template"    => "detail",
					"id"          => $proid
				);
				$prourl = getUrlPath($param);

				$homemakingtype = $proResult[0]['homemakingtype'];
				$procount = $results[0]["procount"];

				$orderprice = $results[0]['orderprice'];
				$point      = $results[0]['point'];
				$balance    = $results[0]['balance'];
				$payprice   = $results[0]['payprice'];

				//总价
				$totalAmount += $orderprice;
				$freeshiMoney = 0;

				$expCompany = $results[0]['exp-company'];
				$expNumber  = $results[0]['exp-number'];
				$expDate    = $results[0]['exp-date'];

				$orderstate = $results[0]["orderstate"];

				$expDate    = $results[0]['exp-date'];
				$retState   = $results[0]['ret-state'];

				$retOkdate  = $results[0]['ret-ok-date'];


				$retType   = $results[0]['ret-type'];
				$retNote   = $results[0]['ret-note'];

				$imglist = array();
				$pics = $results[0]['ret-pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}
				$retPics   = $imglist;

				$retDate   = $results[0]['ret-date'];
				$retSnote  = $results[0]['ret-s-note'];

				$imglist = array();
				$pics = $results[0]['ret-s-pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}
				$retSpics  = $imglist;
				$retSdate  = $results[0]['ret-s-date'];
				$ordermobile = $results[0]["ordermobile"];
				//家政券
				if($homemakingtype == 1){
					$cardSql = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__homemakingquan` WHERE `orderid` = ". $results[0]["id"]);
					$cardResult = $dsql->dsqlOper($cardSql, "results", "NUM");
					foreach($cardResult as $key => $val){
						$cardnum[$key][0] = $cardResult[$key][0];

						if($cardResult[$key][1] != 0){
							$cardnum[$key][1] = "<span class='text-info'>已使用</span>";
						}else{
							if(date('Y-m-d', time()) > date('Y-m-d', $cardResult[$key][2]) && $cardResult[$key][2] != 0){
								if($cardResult[$key]['usedate'] == 0){
									$cardnum[$key][1] = "<span class='text-error'>未使用 已过期</span>";
								}else{
									$cardnum[$key][1] = "<span class='text-error'>已过期</span>";
								}
							}else{
								$cardnum[$key][1] = "未使用";
							}
						}

						if($cardResult[$key][2] == 0){
							$cardnum[$key][2] = "无期限";
						}else{
							//$cardnum[$key][2] = date('Y-m-d', $cardResult[$key][2]);
							$cardnum[$key][2] = $cardResult[$key][2];
						}
					}

				//充值卡
				}
				$orderdate = date('Y-m-d H:i:s', $results[0]["orderdate"]);
				$paytype = $results[0]["paytype"];
				$paydate = date('Y-m-d H:i:s', $results[0]["paydate"]);
				$deliveryType = $results[0]["deliveryType"];
				$useraddr = $results[0]["useraddr"];
				$usercontact = $results[0]["usercontact"];
				$usernote = $results[0]["usernote"];


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
		'admin/homemaking/homemakingOrderEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('ordernum', $ordernum);
	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('proid', $proid);
	$huoniaoTag->assign('proname', $proname);
	$huoniaoTag->assign('prourl', $prourl);
	$huoniaoTag->assign('tuantype', $tuantype);
	$huoniaoTag->assign('procount', $procount);
	$huoniaoTag->assign('point', $point);
	$huoniaoTag->assign('balance', $balance);
	$huoniaoTag->assign('payprice', $payprice);
	$huoniaoTag->assign('orderprice', $orderprice);
	$huoniaoTag->assign('totalAmount', $totalAmount);
	$huoniaoTag->assign('freeshiMoney', $freeshiMoney);
	$huoniaoTag->assign('expCompany', $expCompany);
	$huoniaoTag->assign('expNumber', $expNumber);
	$huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
	$huoniaoTag->assign('orderstate', $orderstate);
	$huoniaoTag->assign('retState', $retState);
	$huoniaoTag->assign('ordermobile', $ordermobile);
	$huoniaoTag->assign('cardnum', $cardnum);
	$huoniaoTag->assign('orderdate', $orderdate);
	$huoniaoTag->assign('homemakingtype', $homemakingtype);
	$huoniaoTag->assign('doortime', $doortime);
	$huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));

	$huoniaoTag->assign('retType', $retType);
	$huoniaoTag->assign('failnote', $failnote);
	$huoniaoTag->assign('retNote', $retNote);
	$huoniaoTag->assign('retPics', $retPics);
	$huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
	$huoniaoTag->assign('retSnote', $retSnote);
	$huoniaoTag->assign('retSpics', $retSpics);
	$huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));
	$huoniaoTag->assign('onlinepay', $onlinepay);


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
			$payname = $paytype;
		}
		$huoniaoTag->assign('paytype', $payname);
	}

	$huoniaoTag->assign('paydate', $paydate);
	$huoniaoTag->assign('useraddr', $useraddr);
	$huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('usercontact', $usercontact);

	$huoniaoTag->assign('deliveryTypeList', array(1 => '只工作日送货', 2 => '只双休日、假日送货', 3 => '学校地址/地址白天没人', 4 => '工作日、双休日与假日均可送货'));
	$huoniaoTag->assign('deliveryType', $deliveryType);

	$huoniaoTag->assign('usernote', $usernote);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
