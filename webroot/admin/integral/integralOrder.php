<?php
/**
 * 管理商城商品订单
 *
 * @version        $Id: integralOrder.php 2014-2-20 下午14:00:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("integralOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "integralOrder.html";

$action = "integral_order";

$tab = "integral_product";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){

		$where .= " AND `ordernum` like '%$sKeyword%' OR `people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `address` like '%$sKeyword%'";

		//个人会员
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where .= " OR `userid` in (".join(",", $userid).")";
			}
		}

	}

	if($start != ""){
		$where .= " AND `orderdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND `orderdate` <= ". GetMkTime($end." 23:59:59");
	}

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `proid` in ($idList)";
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未付款
	$state0 = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount");
	//未使用
	$state1 = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount");
	//成功
	$state3 = $dsql->dsqlOper($archives." AND `orderstate` = 3", "totalCount");
	//已退款
	$state4 = $dsql->dsqlOper($archives." AND `ret-state` = 1", "totalCount");
	//已发货
	$state6 = $dsql->dsqlOper($archives." AND `orderstate` = 6 AND `exp-date` != 0", "totalCount");
	//退款成功
	$state7 = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount");
	//交易关闭
	$state10 = $dsql->dsqlOper($archives." AND `orderstate` = 10", "totalCount");


	if($state != ""){
		if($state != "" && $state != 4 && $state != 5 && $state != 6){
			$where .= " AND `orderstate` = " . $state;
		}

		//退款
		if($state == 4){
			$where .= " AND `ret-state` = 1";
		}

		//已发货
		if($state == 6){
			$where .= " AND `orderstate` = 6 AND `exp-date` != 0";
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($state == 4){
			$totalPage = ceil($state4/$pagestep);
		}elseif($state == 6){
			$totalPage = ceil($state6/$pagestep);
		}elseif($state == 7){
			$totalPage = ceil($state7/$pagestep);
		}elseif($state == 10){
			$totalPage = ceil($state10/$pagestep);
		}
	}


	$peisongTotalPrice = $productTotalPrice = $pointTotal = 0;
	$oidList = array();
	$sql = $dsql->SetQuery("SELECT `id`, `price`, `point`, `count`, `freight` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $k => $v) {
			$peisongTotalPrice += $v['freight'];
			$pointTotal = $v['point'] * $v['count'];
			$productTotalPrice += $v['price'] * $v['count'];
		}
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`orderstate`, o.`orderdate`, o.`paytype`, o.`price`, o.`point`, o.`count`, o.`freight`, o.`orderstate`, o.`priceinfo`, o.`courier`, o.`peisongid`, o.`peidate`, o.`songdate`, o.`okdate` FROM `#@__".$action."` o WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {

			$orderprice = 0;
			$orderpoint = 0;
			$outordernum = '';
			$arc = $dsql->SetQuery("SELECT l.`ordernum` FROM `#@__pay_log` l WHERE l.`body` = '".$value['ordernum']."' AND `paytype` != 'point' AND `paytype` != 'money' ORDER BY `id` DESC LIMIT 0,1");
			$ret = $dsql->dsqlOper($arc, "results");
			if($ret){
				$outordernum = $ret[0]['ordernum'];
			}

			$list[$key]["id"] = $value["id"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["point"] = $value["point"];
			$list[$key]["count"] = $value["count"];
			$list[$key]["ordernum"] = $value["ordernum"];
			$list[$key]["outordernum"] = $outordernum;
			$list[$key]["userid"] = $value["userid"];
			$list[$key]["peidate"] = !empty($value["peidate"]) ? date('Y-m-d H:i:s', $value["peidate"]) : "";
			$list[$key]["songdate"] = !empty($value["songdate"]) ? date('Y-m-d H:i:s', $value["songdate"]) : "";
			$list[$key]["okdate"] = !empty($value["okdate"]) ? date('Y-m-d H:i:s', $value["okdate"]) : "";


			$peisongid = $value["peisongid"];
			if($peisongid){
			    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
			    $ret = $dsql->dsqlOper($sql, "results");
			    if($ret){
			    	$peisongid = $ret[0]['name'];
			    }
			}else{
				$peisongid = '';
			}
			$list[$key]["peisongid"] = $peisongid;



			$courier = $value["courier"];

			//用户名
			$level = 0;
			$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `level` FROM `#@__member` WHERE `id` = ". $value["userid"]);
			$username = $dsql->dsqlOper($userSql, "results");
			if(count($username) > 0){
				$level = $username[0]['level'];
				$list[$key]["username"] = $username[0]['nickname'] ? $username[0]['nickname'] : $username[0]['username'];
			}else{
				$list[$key]["username"] = "未知";
			}
			//订单金额
			$orderprice += $value['price'] * $value['count'] + $value['freight'];
			$orderpoint += $value['point'] * $value['count'];

			// 减去会员优惠
			if($value['priceinfo']){
				$priceinfo = unserialize($value['priceinfo']);
				foreach ($priceinfo as $k => $v) {
					$orderprice -= $v['amount'];
				}
			}

			$list[$key]["orderprice"] = sprintf("%.2f", $orderprice);
			$list[$key]["orderpoint"] = $orderpoint;

			$list[$key]["peisong"] = sprintf("%.2f", $value['freight']);


			$list[$key]["orderstate"] = $value["orderstate"];
			$list[$key]["orderdate"] = date('Y-m-d H:i:s', $value["orderdate"]);

			//主表信息
			$sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$value["paytype"]."'");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!empty($ret)){
				$list[$key]["paytype"] = $ret[0]['pay_name'];
			}else{
				$list[$key]["paytype"] = empty($value["paytype"]) ? "积分" : ($value["paytype"] == "point" ? "积分" : $value["paytype"]);
			}

			$list[$key]['retState'] = $value['ret-state'];
		}


		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.', "state10": '.$state10.'}, "integralOrder": '.json_encode($list).', "productTotalPrice" : '.$productTotalPrice.', "peisongTotalPrice" : '.$peisongTotalPrice.'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.', "state10": '.$state10.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.', "state10": '.$state10.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("integralOrderDel")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_product` WHERE `orderid` = ".$val);
		$dsql->dsqlOper($archives, "update");
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除商城订单", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;


// 发货
}elseif($dopost == "delivery"){

	if(empty($extCompany) || empty($extNumber)){
		die('{"state": 200, "info": '.json_encode('请填写完整快递信息').'}');
	}

	if(empty($id)){
		die('{"state": 200, "info": '.json_encode('为选择任何信息').'}');
	}

	$now = GetMkTime(time());

	$sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `orderstate` = 6, `exp-company` = '$extCompany', `exp-number` = '$extNumber', `exp-date` = '$now' WHERE `id` = $id AND `exp-date` = 0");
	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok"){
		die('{"state": 100, "info": '.json_encode('操作成功').'}');
	}else{
		die('{"state": 200, "info": '.json_encode('操作失败').'}');
	}

//退款
/**
	* 退款业务逻辑
	* 1. 验证订单状态，只有状态为已付款、申请退款、已发货时才可以往下进行
	* 2. 计算需要退回的余额及积分
	* 3. 更新会员余额及积分并做相关记录
	* 4. 更新订单中商品的已售数量、库存（包括不同规格的库存）
	* 5. 更新订单状态为已退款
	* 6. 后续操作（如：发送短信通知等）
	*/
}elseif($dopost == "refund"){
	if(!testPurview("integralOrderEdit")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if(!empty($id)){
		$archives = $dsql->SetQuery("SELECT `ordernum`, `userid`, `orderstate` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if($results){

			$ordernum   = $results[0]['ordernum'];
			$userid     = $results[0]["userid"];
			$orderstate = $results[0]["orderstate"];

			if($orderstate == 1 || $orderstate == 4 || $orderstate == 6){

				//计算需要退回的积分及余额
				$totalPoint = 0;
				$totalMoney = 0;

				$opArr = array();

				$sql = $dsql->SetQuery("SELECT `proid`, `speid`, `count`, `point`, `balance`, `payprice` FROM `#@__integral_order_product` WHERE `orderid` = ".$id);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $key => $value) {
						$totalPoint += $value['point'];
						$totalMoney += $value['balance'] + $value['payprice'];

						array_push($opArr, array(
							"proid" => $value['proid'],
							"speid" => $value['speid'],
							"count" => $value['count']
						));
					}
				}


				//会员信息
				$userSql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ". $userid);
				$userResult = $dsql->dsqlOper($userSql, "results");

				if($userResult){

					//退回积分
					// if(!empty($totalPoint)){
					// 	$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$totalPoint' WHERE `id` = '$userid'");
					// 	$dsql->dsqlOper($archives, "update");

					// 	//保存操作日志
					// 	$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '1', '$totalPoint', '商城订单退回：$ordernum', ".GetMkTime(time()).")");
					// 	$dsql->dsqlOper($archives, "update");
					// }

					//会员帐户充值
					// if($totalMoney > 0){
					// 	$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$totalMoney." WHERE `id` = ". $userid);
					// 	$dsql->dsqlOper($userOpera, "update");

					// 	//记录退款日志
					// 	$logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`) VALUES (".$userid.", ".$totalMoney.", 1, '商城订单退款：".$ordernum."', ".GetMkTime(time()).")");
					// 	$dsql->dsqlOper($logs, "update");
					// }

					//更新订单状态
					$orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `orderstate` = 7, `ret-state` = 0, `ret-ok-date` = ".GetMkTime(time())." WHERE `id` = ". $id);
					$dsql->dsqlOper($orderOpera, "update");


					//更新商品已售数量及库存
					foreach ($opArr as $key => $value) {

						$_proid = $value['proid'];
						$_count = $value['count'];
						$_speid = $value['speid'];

						//更新已购买数量
						$sql = $dsql->SetQuery("UPDATE `#@__integral_product` SET `sales` = `sales` + $_count, `inventory` = `inventory` - $_count WHERE `id` = ".$_proid);
						$dsql->dsqlOper($sql, "update");

						//更新库存
						$sql = $dsql->SetQuery("SELECT `specification` FROM `#@__integral_product` WHERE `id` = $_proid");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$specification = $ret[0]['specification'];
							if(!empty($specification)){
								$nSpec = array();
								$specification = explode("|", $specification);
								foreach ($specification as $k => $v) {
									$specArr = explode(",", $v);
										if($specArr[0] == $_speid){
										$spec = explode("#", $v);
										$nCount = $spec[2] + $_count;
										array_push($nSpec, $spec[0]."#".$spec[1].$nCount);
									}else{
										array_push($nSpec, $v);
									}
								}

								$sql = $dsql->SetQuery("UPDATE `#@__integral_product` SET `specification` = '".join("|", $nSpec)."' WHERE `id` = '$_proid'");
								$dsql->dsqlOper($sql, "update");
							}
						}

					}



					echo '{"state": 100, "info": '.json_encode("操作成功，订单状态已更新！").'}';
					die;

				}else{
					echo '{"state": 200, "info": '.json_encode("会员不存在，无法继续退款！").'}';
					die;
				}

			}else{
				echo '{"state": 200, "info": '.json_encode("订单当前状态不支持手动退款！").'}';
				die;
			}
		}else{
			echo '{"state": 200, "info": '.json_encode("订单不存在，请刷新页面！").'}';
			die;
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("订单ID为空，操作失败！").'}';
		die;
	}


}elseif($dopost == "setCourier"){


	if(!empty($id) && $courier){

        $ids = explode(",", $id);

        $now = GetMkTime(time());
        $date = date("Y-m-d H:i:s", $now);

        $err = array();
        $state_err = 0;
        foreach ($ids as $key => $value) {

            $sql = $dsql->SetQuery("SELECT o.`orderdate`, o.`userid`, o.`ordernum`, o.`peisongid`, o.`peisongidlog`, o.`freight`, o.`priceinfo`, o.`exp-company`, o.`exp-number` FROM `#@__integral_order` o WHERE o.`id` = $value AND (o.`orderstate` = 1 || o.`orderstate` = 6)");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
            	$state_err++;
            	continue;
            }
            // 已发快递
            if(!empty($ret[0]['exp-number'])){
            	$state_err++;
            	continue;
            }

            $userid        = $ret[0]['userid'];
            $pubdate       = $ret[0]['orderdate'];
            $ordernum      = $ret[0]['ordernum'];
            $peisongid     = $ret[0]['peisongid'];
            $freight       = $ret[0]['freight'];
            $priceinfo     = $ret[0]['priceinfo'];
            $peisongidlog  = $ret[0]['peisongidlog'];

            // 没有变更
            if($courier == $peisongid) continue;

            $sql = $dsql->SetQuery("SELECT `id`, `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = $peisongid || `id` = $courier");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $k => $v) {
                    if($v['id'] == $peisongid){
                        $peisongname_ = $v['name'];
                        $peisongtel_ = $v['phone'];
                    }else{
                        $peisongname = $v['name'];
                        $peisongtel = $v['phone'];
                    }
                }
            }

            if($peisongid){
                // 骑手变更记录
                $pslog = "此订单在 ".$date." 重新分配了配送员，原配送员是：".$peisongname_."（".$peisongtel_."），新配送员是:".$peisongname."（".$peisongtel."）<hr>" . $peisongidlog;
            }else{
                $pslog = "";
            }

            if($peisongid){
              $sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now', `courier_pushed` = 0, `orderstate` = 6 WHERE (`orderstate` = 1) AND `id` = $value");
            }else{
              $sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now' WHERE (`orderstate` = 1 || `orderstate` = 1) AND `id` = $value");
            }

            $ret = $dsql->dsqlOper($sql, "update");

            if($ret == "ok"){

                //推送消息给骑手
                global $cfg_basehost;
                aliyunPush($courier, "您有新的配送订单", "订单号：".$ordernum, "newfenpeiorder", "http://".$cfg_basehost.'/index.php?service=waimai&do=courier&ordertype=integral&template=detail&id='.$value);

                if($peisongid){
                    aliyunPush($peisongid, "您有订单被其他骑手派送", "订单号：".$ordernum, "peisongordercancel");
                }



                //消息通知用户
                // $amount = $freight;
                // $sql = $dsql->SetQuery("SELECT `price`, `count` FROM `#@__integral_order_product` WHERE `orderid` = $value");
                // $ret = $dsql->dsqlOper($sql, "results");
                // if($ret){
                // 	foreach ($ret as $k => $v) {
                // 		$amount += $v['price'] * $v['count'];
                // 	}
                // }

                // if($priceinfo){
                // 	$priceinfo = unserialize($priceinfo);
                // 	foreach ($priceinfo as $k => $v) {
                // 		$amount -= $v['amount'];
                // 	}
                // }

                // $amount = sprintf('%.2f', $amount);

                // $param = array(
                //     "service"  => "member",
                //     "type"     => "user",
                //     "template" => "orderdetail",
                //     "module"   => "integral",
                //     "id"       => $value
                // );

                // updateMemberNotice($userid, "会员-订单配送提醒", $param, array("ordernum" => $ordernum, "orderdate" => date("Y-m-d H:i:s", $pubdate), "orderinfo" => "生鲜商城-".$integralname, "orderprice" => $amount, "peisong" => $peisongname . "，" . $peisongtel));

            }else{
                array_push($err, $value);
            }

        }

        if($state_err == count($ids)){
        	echo '{"state": 300, "info": "请检查订单状态"}';
            exit();
        }

        if($err){
            echo '{"state": 200, "info": '.$err.'}';
            exit();
        }else{
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
		exit();
    }
}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/integral/integralOrder.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/integral";  //设置编译目录
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
