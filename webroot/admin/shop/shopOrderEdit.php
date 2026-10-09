<?php
/**
 * 查看修改商城订单信息
 *
 * @version        $Id: shopOrderEdit.php 2016-04-25 上午09:31:15 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopOrderEdit");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopOrderEdit.html";

global $cfg_pointRatio;
global $userLogin;
$action     = "shop_order";
$pagetitle  = "修改商城订单";
$dopost     = $dopost ? $dopost : "edit";
$cfg_pointRatio = (int)$cfg_pointRatio;
$cfg_pointRatio = $cfg_pointRatio ? $cfg_pointRatio : 1;

if($dopost != ""){
	//对字符进行处理
	$address   = cn_substrR($address,50);
	$people   = cn_substrR($people,10);
}

if($dopost == "edit"){

	$pagetitle = "修改商城订单";

    //已作废
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

		$where = '';
		if($state == 1 && $paytype=='delivery'){
			$now = GetMkTime(time());
			$where = " , `exp_company` = '$expcompany', `exp_number` = '$expnumber', `orderstate` = '6', `exp_date` = '$now'";
		}

		//保存
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `address` = '".$address."', `people` = '".$people."', `contact` = '".$contact."', `note` = '".$note."' $where WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($state == 1 && $paytype=='delivery'){

			$sql = $dsql->SetQuery("SELECT `ordernum`, `userid` FROM `#@__".$action."` WHERE `id` = ".$id);
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				$userid   = $res[0]['userid'];
				$ordernum = $res[0]['ordernum'];

				$paramBusi = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "orderdetail",
					"action"   => "shop",
					"id"       => $id
				);

				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['nickname'];
				}

				$config = array(
					"username" => $username,
					"order" => $ordernum,
					"expCompany" => $expcompany,
					"exp_company" => $expcompany,
					"expnumber" => $expnumber,
					"exp_number" => $expnumber,
					"fields" => array(
						'keyword1' => '订单编号',
						'keyword2' => '快递公司',
						'keyword3' => '快递单号'
					)
				);

				updateMemberNotice($userid, "会员-订单发货通知", $paramBusi, $config);
			}
		}

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

				$ordernum 	= $results[0]["ordernum"];
				$people   	= $results[0]["people"];
				$userid   	= $results[0]["userid"];
				$storeid  	= $results[0]["store"];
				$logistic  	= $results[0]["logistic"];
				$branchid  	= $results[0]["branchid"];
				$shipping  	= $results[0]["shipping"];
                $songdatime = $results[0]["songdatime"];
                $confirmdate = $results[0]["confirmdate"];
                $canceltime = $results[0]["canceltime"];
				$qsamount  	= $results[0]["qsamount"];
				$peisongid  	= $results[0]["peisongid"];
				//配送员名称
                $courierSql = $dsql->SetQuery("select `name`,`phone` from `#@__waimai_courier` where `id`={$peisongid}");
                $qs = $dsql->getArr($courierSql);
                $peisongname = $qs['name'] ?: "";
                $peisongphone = $qs['phone'] ?: "";
				$peidate  	= $results[0]["peidate"];
				$songdate  	= $results[0]["songdate"];
				$okdate  	= $results[0]["okdate"];
                $shopFee    = $results[0]['shopFee'];
                $amount  	= $results[0]["amount"];
				$protype  	= $results[0]["protype"];
				$priceinfo 	= unserialize($results[0]['priceinfo']);
                $orderstate = $results[0]["orderstate"];
                $point      = $results[0]['point'] / $cfg_pointRatio;    //积分抵扣金钱
                $balance    = $results[0]['balance'];
                $payprice   = $results[0]['payprice'];
                $changeprice   = $results[0]['changeprice'];
                $changelogistic = $results[0]['changelogistic'];
                $changetype   = $results[0]['changetype'];
                $huodongtype   = $results[0]['huodongtype'];

                $pinid = $results[0]['pinid'];
                $pinstate = $results[0]['pinstate'];
                $pintype = $results[0]['pintype'];

                //会员折扣信息
                $userinfo        = $userLogin->getMemberInfo($results[0]['userid']);
                if(is_array($userinfo)){
                    $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
                    $shopDiscount    = $memberLevelAuth['shop'].'折' ? $memberLevelAuth['shop'].'折'  : 0;               //  会员商城优惠几折
                    $levelName       = $userinfo['levelName'];         //会员类型
                }
                $ret_negotiate = $results[0]['ret_negotiate'] ? unserialize($results[0]['ret_negotiate']) : array();
                if($ret_negotiate){
                    array_multisort(array_column($ret_negotiate['refundinfo'], 'datetime'), SORT_DESC, $ret_negotiate['refundinfo']);
                }

                $ret_negotiate_refundinfo = $ret_negotiate['refundinfo'];
                if($ret_negotiate_refundinfo){
                    foreach($ret_negotiate_refundinfo as $k => $v){
                        if($v['pics']){
                            $ret_negotiate_refundinfo[$k]['pics'] = explode(',', $v['pics']);
                        }
                    }
                }
                $ret_negotiate['refundinfo'] = $ret_negotiate_refundinfo;

//                /*用户*/
//                $userSql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE 1=1 AND `id` = '$userid'");
//                $userRes = $dsql->dsqlOper($userSql, "results");
//                $photo   = getFilePath($userRes[0]['photo']);
//
//                /*商家*/
//                $businessSql = $dsql->SetQuery("SELECT `logo` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$storeid'");
//                $businessRes = $dsql->dsqlOper($businessSql, "results");
//                $logo        = getFilePath($businessRes[0]['logo']);

                $auth_logistic = $auth_shop_price =$quan  = 0;

				 foreach ($priceinfo as $k => $v) {


				 	if($v['type'] == 'auth_peisong'){
				 		$auth_logistic = $v['amount'];
				 		$antu_peisongBody = $v['body'];
				 	}
                     if($v['type'] == 'quan'){
                         $quan      = $v['amount'];
                         $quanbody  = $v['quanname'];
                         $quanbear  = (int)$v['bear'];  //0商家承担  1平台承担
                     }
				 	if($v['type'] == 'auth_shop'){

				 		$auth_shop_price = $v['amount'];
                        $auth_shopBody = $v['body'];
				 	}
				 }


				$param = array(
					"service"  => "shop",
					"template" => "store-detail",
					"id"       => $storeid
				);
				$storeUrl = getUrlPath($param);

				//用户名
                $userlevel = array();
				$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `level` FROM `#@__member` WHERE `id` = ". $results[0]["userid"]);
				$ret = $dsql->dsqlOper($userSql, "results");
				if(count($ret) > 0){
					$username = $ret[0]['nickname'] ?: $ret[0]['username'];

                    //会员等级信息
                    $sql = $dsql->SetQuery("SELECT l.`name`, l.`icon` FROM `#@__member_level` l LEFT JOIN `#@__member` m ON m.`level` = l.`id` WHERE m.`id` = " . $results[0]['userid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $data = $ret[0];
                        $userlevel = array(
                            'name' => $data['name'],
                            'icon' => getFilePath($data['icon'])
                        );
                    }
                    
				}else{
					$username = "<font color='#ff0000'>账号异常</font>";
				}

				//商家
                $storeUserid = 0;
                $storeUsername = '';
                $storeTel = '';
				$userSql = $dsql->SetQuery("SELECT `title`, `userid`, `tel` FROM `#@__shop_store` WHERE `id` = ". $storeid);
				$ret = $dsql->dsqlOper($userSql, "results");
				if(count($ret) > 0){
					$store = $ret[0]['title'];
                    $storeUserid = $ret[0]['userid'];
                    $storeTel = $ret[0]['tel'];
                    $userSql = $dsql->SetQuery("SELECT `username` ,`nickname`FROM `#@__member` WHERE `id` = ". $storeUserid);
                    $ret = $dsql->dsqlOper($userSql, "results");
                    if(count($ret) > 0){
                        $storeUsername = $ret[0]['nickname'] ?: $ret[0]['username'];
                    }else{
                        $storeUsername = "<font color='#ff0000'>账号异常</font>";
                    }
                    
				}else{
					$store = "<font color='#ff0000'>店铺异常</font>";
				}

				//商家
				$userSql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_branch_store` WHERE `id` = ". $branchid);
				$branchstore = $dsql->dsqlOper($userSql, "results");
				if(count($branchstore) > 0){
					$branchStoreTitle = $branchstore[0]['title'];
				}else{
					$branchStoreTitle = "<font color='#ff0000'>分店信息异常</font>";
				}

				//订单商品
				$product = array();
				$orderprice = $orderpayprice = 0;
				$sql = $dsql->SetQuery("SELECT `proid`, `specation`, `price`, `count`, `logistic`, `discount`, `point`, `balance`, `payprice`, `changeprice` FROM `#@__".$action."_product` WHERE `orderid` = ".$id);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $k => $v) {

						$param = array(
							"service"  => "shop",
							"template" => "detail",
							"id"       => $v['proid']
						);
						$proUrl = getUrlPath($param);
						$proName = "产品名称";
						$proImg = "";
						$sql = $dsql->SetQuery("SELECT `title`, `litpic` FROM `#@__shop_product` WHERE `id` = ".$v['proid']);
						$res = $dsql->dsqlOper($sql, "results");
						if($res){
							$proName = $res[0]['title'];
							$proImg  = getFilePath($res[0]['litpic']);
						}
                        $pointprice = (int)$v['point'] / (int)$cfg_pointRatio;
						array_push($product, array(
							"product"   => $proName,
							"proUrl"    => $proUrl,
							"proImg"    => $proImg,
							"proid"     => $v['proid'],
							"specation" => $v['specation'],
							"price"     => $v['price'],
							"count"     => $v['count'],
							"logistic"  => $v['logistic'],
							"discount"  => $v['discount'],
							"point"     => $v['point'],
                            "pointprice"  => sprintf("%.2f", $pointprice),
							"balance"   => $v['balance'],
							"payprice"  => $v['payprice'],
							"changeprice"  => $v['changeprice']
						));

                        //会员的折扣不能实时获取，因为会员状态会改变，下单时是会员，过了一段时间，查询订单时，有可能已经不是会员了
                        //但是会员优惠的金额已经记录在priceinfo中，这里只计算商品的原价，下面再统一减去优惠的金额
						// if ($shopDiscount > 0 && $auth_shop_price){
                        //     $danjia += $v['price'] * $v['count'] * $shopDiscount / 10;
                        // }else{
                            $danjia += $v['price'] * $v['count'];
                        // }
						$orderprice += $v['price'] * $v['count'];
						$orderpayprice += $v['payprice'];
					}
				}

                //会员折扣
                // if($auth_shop_price){
                //     $danjia -= $auth_shop_price;
                // }

				if ($orderstate == 7){
                    //查询退款信息
                    $tui = $dsql->SetQuery("SELECT `tuikuanparam`  FROM `#@__member_money` WHERE `ordernum` = '".$ordernum."' AND `ctype`= 'tuikuan' ORDER BY `id` DESC");
                    $tuikuan = $dsql->dsqlOper($tui,"results");
                    $tuiInfo = unserialize($tuikuan[0]['tuikuanparam']);   //退款信息
                    $tuipaytype = $tuiInfo['paytype'];                      //退款方式
                    $tuimoney   = $tuiInfo['money_amount'];                 //退款金额
                    $tuipoint   = $tuiInfo['point'];                        //退款积分
                }

                
                //砍价订单
                if($results[0]['huodongtype'] == 3){
                    //查询砍价金额
                    $bargainsql = $dsql->SetQuery("SELECT `id`,`kj_num`,`shengyu_kj_num`,`gmoney`,`gnowmoney`,`gfinalmoney`,`state`,`enddate`,`pubdate` FROM `#@__shop_bargaining` WHERE `oid` = " . $id);
                    $bargainres = $dsql->dsqlOper($bargainsql, "results");
                    if($bargainres){
                        $bargainingID = (int)$bargainres[0]['id'];
                        $orderprice = $bargainres[0]['state'] == 2 ? (float)$bargainres[0]['gmoney'] : (float)$bargainres[0]['gnowmoney'];
                        
                        $kj_num = (int)$bargainres[0]['kj_num'];  //可砍次数
                        $shengyu_kj_num = (int)$bargainres[0]['shengyu_kj_num'];  //剩余次数
                        $bargainingInfo = array(
                            'kj_num' => $kj_num - $shengyu_kj_num,  //已砍次数
                            'shengyu_kj_num' => $shengyu_kj_num,  //剩余次数
                            'gmoney' => (float)$bargainres[0]['gmoney'],  //商品原价（没有参加活动时的价格）
                            'gnowmoney' => (float)$bargainres[0]['gnowmoney'],  //当前已砍至金额
                            'gfinalmoney' => (float)$bargainres[0]['gfinalmoney'],  //最低价
                            'state' => (int)$bargainres[0]['state'],  //状态0-砍价中,1-已成功,2-已失败,3-已购买
                            'enddate' => date('Y-m-d H:i:s', $bargainres[0]['enddate']),  //结束时间
                            'pubdate' => date('Y-m-d H:i:s', $bargainres[0]['pubdate'])  //开始时间
                        );

                        //砍价记录
                        $bargainingList = array();
                        $sql = $dsql->SetQuery("SELECT `uid`,`money`,`pubdate` FROM `#@__shop_bargaining_log` WHERE `bid` = " . $bargainingID);
                        $res = $dsql->dsqlOper($sql, "results");
                        if($res){
                            foreach($res as $v){
                                $_uinfo = getMemberDetail($v['uid'], 1);
                                $bargainingList[] = array(
                                    'uid' => (int)$v['uid'],
                                    'nickname' => $_uinfo['nickname'],
                                    'photo' => $_uinfo['photo'],
                                    'money' => (float)$v['money'],
                                    'pubdate' => date('Y-m-d H:i:s', $v['pubdate'])
                                );
                            }
                        }

                    }
                }


                //商城佣金+
                $_title = array();
                array_push($_title, '商城消费，订单号：' . $ordernum);

                $_sql = $dsql->SetQuery("SELECT o.`id` orderid, q.`cardnum`, o.`ordernum`, op.`price`, op.`count` procount, o.`amount` orderprice, o.`userid`, o.`balance`, o.`payprice`, o.`peerpay`,o.`priceinfo`,o.`shopFee` FROM `#@__shopquan` q LEFT JOIN `#@__shop_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__shop_order_product` op ON op.`orderid` = o.`id` WHERE o.`ordernum` = '$ordernum'");
                $_ret = $dsql->dsqlOper($_sql, "results");
                if($_ret){
                    foreach($_ret as $_val){
                        array_push($_title, '商城电子券，订单号：' . $_val['cardnum']);
                    }
                }

                $_where = array();
                foreach($_title as $_val){
                    array_push($_where, "f.`ordernum` = '$_val'");
                }
                $_where = join(' OR ', $_where);

                $fenxiaomoneysql = $dsql->SetQuery("SELECT f.`amount`,f.`uid` ,m.`nickname`  FROM `#@__member_fenxiao` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE f.`module`= 'shop' AND (" . $_where . ")");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                $allfenxiao     = array_sum(array_column($fenxiaomonyeres, 'amount'));

                $orderprice += $logistic;
                $orderpayprice += $logistic;
                $orderpayprice = sprintf("%.2f", $orderpayprice);

				$orderprice = sprintf("%.2f", $orderprice);
				if ($changetype == 1){
                    $orderprice  = $changeprice;
                }

				//商家收入
                //扣除佣金
                global $cfg_shopFee;
                $cfg_shopFee   = !empty((float)$shopFee) ? (float)$shopFee : (float)$cfg_shopFee;
                // $ordershop  = $orderprice - (!$quanbear ? $quan : 0);

                //计算商家所得
                // $sjprice = sprintf("%.2f",((($ordershop - $logistic) * (100-$cfg_shopFee) / 100) + ($protype == 0 && $shipping != 0 ? $logistic : 0)));

                //不可以实时计算商家收入，因为当前的参数配置不一定和之前的一样，商家的收入直接从member_money中获取即可
                $sql = $dsql->SetQuery("SELECT `amount` FROM `#@__member_money`  WHERE `userid` = '$storeUserid' AND `showtype` = '0' AND `ordernum` = '$ordernum'");
                $sjprice = (float)$dsql->getOne($sql);

                $pingsql = $dsql->SetQuery("SELECT `platform`,`commission`,`bear`,`cityid`  FROM `#@__member_money`  WHERE `showtype` = '1' AND `info` like '%$ordernum%'");
                $pingres= $dsql->dsqlOper($pingsql,"results");
                //平台收入
                $pingtai= $pingres[0]['platform'];
                //分站收
                $fenzhan= $pingres[0]['commission'];
                //分站名称
                $fenzhanName = getSiteCityName($pingres[0]['cityid']);
                $fenzhanName = $fenzhanName == '未知' ? $pingres[0]['cityid'] : $fenzhanName;

//                $fenxiaoparamarr = fenXiaoMoneyCalculation('shop', $ordernum);
//                $allfenxiao = $fenxiaoparamarr['totalAmount'];
                $huoniaoTag->assign("allfenxiao", $allfenxiao);
                $huoniaoTag->assign("fenxiaomonyeres", $fenxiaomonyeres);

                $expCompany = $juhe_express_company[$results[0]['exp_company']];
                $bear       = $pingres[0]['bear'];
				$expNumber  = $results[0]['exp_number'];
				$expDate    = $results[0]['exp_date'];
				$orderstate = $results[0]["orderstate"];
				$expDate    = $results[0]['exp_date'];
				$retState   = $results[0]['ret_state'];
				$retOkdate  = $results[0]['ret_ok_date'];
				$retType    = $results[0]['ret_type'];
				$retNote    = $results[0]['ret_note'];
                $refrundno  = $results[0]['refrundno'];

				$imglist = array();
				$pics = $results[0]['ret_pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}
				$retPics   = $imglist;

				$retDate   = $results[0]['ret_date'];
				$retSnote  = $results[0]['ret_s_note'];

				$imglist = array();
				$pics = $results[0]['ret_s_pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
					foreach ($pics as $key => $value) {
						$imglist[$key]['val'] = $value;
						$imglist[$key]['path'] = getFilePath($value);
					}
				}

                //单价加上配送费
                $pricepeisong =  $logistic - $auth_logistic;

                //优惠券
                if ($quan > 0){
                    $quanprice = $pricepeisong -$quan;          //优惠券后的价格
                }



				$retSpics  = $imglist;

				$retSdate  = $results[0]['ret_s_date'];
				$orderdate = date('Y-m-d H:i:s', $results[0]["orderdate"]);
				$paytype = $results[0]["paytype"];
				$peerpay = $results[0]["peerpay"];
				$paydate = $results[0]["paydate"] ? date('Y-m-d H:i:s', $results[0]["paydate"]) : "";

				$people  = $results[0]["people"];
				$address = $results[0]["address"];
				$contact = $results[0]["contact"];
				$note    = $results[0]["note"];
                $lng     = $results[0]['lng'];
                $lat     = $results[0]['lat'];


                //查询电子券
                $quanList = array();
                if($protype == 1){
                    
                    $sql = $dsql->SetQuery("SELECT `cardnum`,`carddate`,`usedate`,`expireddate`,`ret_state` FROM `#@__shopquan` WHERE `orderid` = " . $id);
                    $res = $dsql->dsqlOper($sql, "results");
                    if($res){
                        foreach($res as $v){
                            $quanList[] = array(
                                'cardnum' => $v['cardnum'],
                                'carddate' => $v['carddate'] ? date('Y-m-d H:i:s', $v["carddate"]) : "",
                                'usedate' => $v['usedate'] ? date('Y-m-d H:i:s', $v["usedate"]) : "",
                                'expireddate' => $v['expireddate'] ? date('Y-m-d H:i:s', $v["expireddate"]) : "",
                                'ret_state' => (int)$v['ret_state']
                            );
                        }
                    }
                }
                
                $fenxiao_amount = (float)$results[0]['fenxiao_amount'];  //分销总金额
                $fenxiao_precipitate = (float)$results[0]['fenxiao_precipitate'];  //分销沉淀金额（未分出去的）
                $fenxiao_source = (int)$results[0]['fenxiao_source'];  //分销承担方 0平台承担 1商家承担
                $fenxiao_out = $fenxiao_amount - $fenxiao_precipitate;  //分销出去的金额

                //兼容老数据，如果没有分销金额，则减去上面查询出来的记录
                // if($fenxiao_source || $bear == 2){
                //     if($fenxiao_amount == 0){
                //         $sjprice -= $allfenxiao;
                //     }else{
                //         $sjprice -= $fenxiao_amount;
                //     }
                // }

                $admin_log = trim($results[0]['admin_log']);


			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

//变更分店
}elseif($dopost == 'changeBranch'){

	if($id && $branchid){

		$sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `branchid` = '$branchid' WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == 'ok'){

			adminLog("变更订单分店", $id . '=>' . $branchid);

			echo '{"state": 100, "info": "变更成功！"}';
			exit();

		}else{
			echo '{"state": 200, "info": "'.$ret.'"}';
			exit();
		}

	}else{
		echo '{"state": 200, "info": "缺少必要参数！"}';
		exit();
	}

}

//修改价格
//优惠券保留继续使用
//如果使用了积分抵扣，重新计算需要抵扣的金额
//如果下单人是vip会员，重新计算折扣金额
elseif($dopost == 'changePayprice'){
    $orderid      = (int)$orderid;
    $totalprice   = (float)$totalprice;  //含运费总金额
    $logistic     = (float)$logistic;  //运费

    $proprice = $totalprice - $logistic;  //商品总金额

    $goodpricearr = str_replace("\\", '', $_POST['goodpricearr']);
    $goodpricearr = $goodpricearr!='' ? json_decode($goodpricearr,true) : array() ;
    if (!$goodpricearr){
        echo '{"state": 200, "info": "商品价格未修改！"}';
        exit();
    }
    $Sql = $dsql->SetQuery("SELECT `id`, `ordernum`, `point`, `userid`, `huodongtype`, `priceinfo` FROM `#@__shop_order` WHERE 1 = 1 AND `id` = '$orderid' AND `orderstate` = 0");
    $Res = $dsql->dsqlOper($Sql, "results");
    if ($Res) {
        $_ordernum = $Res[0]['ordernum'];
        $_point = (int)$Res[0]['point'];  //是否用了积分
        $_userid = (int)$Res[0]['userid'];  //下单人id
        $_huodongtype = (int)$Res[0]['huodongtype'];  //是否是活动订单
        $_priceinfo = $Res[0]['priceinfo'] ? unserialize($Res[0]['priceinfo']) : array();  //费用明细

        // 会员优惠信息
        $privilege = array();
        $userinfo = $userLogin->getMemberInfo($_userid, 1);

        $auth_priceinfo = array();

        if ($userinfo['level']) {
            $sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = " . $userinfo['level']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $privilege = unserialize($ret[0]['privilege']);

                //商品优惠
                $auth = $privilege['shop'];
                if ($auth > 0 && $auth < 10 && !$_huodongtype) {
                    $auth_shop_price = (float)sprintf("%.2f", $proprice * (1 - $auth / 10));
                    if($auth_shop_price > 0){
                        $auth_priceinfo['auth_shop'] = array(
                            "level"  => $userinfo['level'],
                            "type"   => "auth_shop",
                            "body"   => $userinfo['levelName'] . "特权-商品原价优惠",
                            "amount" => sprintf("%.2f", $auth_shop_price)
                        );
                    }
                }

                // 配送费
                $auth = $privilege['delivery'];
                if ($logistic) {
                    $ok = false;
                    // 打折
                    if ($auth[0]['type'] == 'discount') {
                        if ($auth[0]['val'] > 0 && $auth[0]['val'] < 10) {
                            $ok = true;
                        }
                        // 计次
                    } elseif ($auth[0]['type'] == 'count') {
                        $userinfo['delivery_count'] = $userinfo['delivery_count'] < 0 ? 0 : $userinfo['delivery_count'];
                        if ($auth[0]['val'] == 0 || ($auth[0]['val'] > 0 && $userinfo['delivery_count'] > 0)) {
                            $auth_delivery_isCount++;
                            $ok = true;
                        }
                    }

                    if ($ok) {
                        $auth_delivery_price = $auth[0]['type'] == 'count' ? $logistic : $logistic * (1 - $auth[0]['val'] / 10);
                        $auth_delivery_price = (float)sprintf("%.2f", $auth_delivery_price);
                        if($auth_delivery_price > 0){
                            $auth_priceinfo['auth_peisong'] = array(
                                "level"  => $userinfo['level'],
                                "type"   => "auth_peisong",
                                "body"   => $userinfo['levelName'] . "特权-配送费优惠",
                                "amount" => sprintf("%.2f", $auth_delivery_price)
                            );
                        }
                    }
                }
                
            }
        }

        $payprice = (float)$totalprice;  //最终要支付的费用

        //更新订单中的费用明细
        if ($_priceinfo) {
            foreach ($_priceinfo as $k => $v){
                if($v['type'] == 'auth_shop' && $auth_priceinfo['auth_shop']){
                    $_priceinfo[$k] = $auth_priceinfo['auth_shop'];
                    $auth_amount = (float)$auth_priceinfo['auth_shop']['amount'];
                }
                if($v['type'] == 'auth_peisong' && $auth_priceinfo['auth_peisong']){
                    $_priceinfo[$k] = $auth_priceinfo['auth_peisong'];
                    $auth_amount = (float)$auth_priceinfo['auth_peisong']['amount'];
                }
                if($v['type'] == 'quan'){
                    $auth_amount = (float)$v['amount'];
                }
                $payprice -= $auth_amount;  //最终要支付的费用减去优惠金额
            }
        }

        $priceinfo = serialize($_priceinfo);

        //计算积分和余额要使用的值
        $totalBalance = $payprice;  //默认情况，余额支付所有费用

        //如果订单使用了积分抵扣
        $totalPoint = 0;

        global $cfg_pointRatio;
        if($_point){

            $userpoint = (int)$userinfo['point'];
            $usePoint = (float)getJifen('shop', $payprice);
            $totalPoint = $usePoint * $cfg_pointRatio;  //积分
            if ($totalPoint > $userpoint) {
                $totalPoint = $userpoint;
            }

            $pointAmount = $totalPoint / $cfg_pointRatio;  //积分抵扣的金额
            $totalBalance -= $pointAmount;  //余额支付的费用
            
        }




        $ordernum = create_ordernum();  //修改价格后，需要更新订单号，否则第三方支付会出现：商户订单号重复的错误，因为一个订单如果已经发起过支付请求，再用这个订单号重新发起时，会对比之前的订单内容，由于订单金额不同了，导致第三方平台对比失败
        $archives = $dsql->SetQuery("UPDATE `#@__shop_order` SET `amount` = '$totalprice', `payprice` = '$payprice', `point` = '$totalPoint', `balance` = '$totalBalance', `ordernum` = '$ordernum', `changetype` = '1', `changeprice` = '$totalprice', `changelogistic` = '$logistic', `logistic` = '$logistic', `priceinfo` = '$priceinfo' WHERE `id` = ".$orderid);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == 'ok') {
            foreach ($goodpricearr as $key => $value) {
                if (is_numeric($value['id'])) {

                    $_price = (float)$value['price'];

                    $balance = $_price;
                    $point = 0;

                    if($_point){

                        $usePoint = (int)getJifen('shop', $_price);
                        $point = $usePoint * $cfg_pointRatio;  //积分
                        if ($point > $userpoint) {
                            $point = $userpoint;
                        }
            
                        $pointAmount = $point / $cfg_pointRatio;  //积分抵扣的金额
                        $balance -= $pointAmount;  //余额支付的费用
                        
                    }

                    $archives = $dsql->SetQuery("UPDATE `#@__shop_order_product` SET `point` = '$point', `balance` = '$balance', `payprice` = '$_price', `changeprice` = '$_price' WHERE `orderid` = ".$orderid." AND `proid` = " . $value['id']);
                    $results  = $dsql->dsqlOper($archives, "update");
                }
            }

            adminLog("修改商城订单价格", $orderid . '=>旧订单号：' . $_ordernum . '=>新订单号：' . $ordernum . '=>新的价格：' . $totalprice . '=>运费：' . $logistic);

            echo '{"state": 100, "info": "修改成功"}';
            exit();
        }
    } else {
        echo '{"state": 200, "info": "未找到该笔订单,请核对后在试！"}';
        exit();
    }



    // 确认发货
}elseif($dopost == 'delivery'){
    global $juhe_express_company;

    $id       = $id;
    $shipping = (int)$shipping;
    $company  = $company;
    $number   = $number;

     if (empty($id)){
         echo '{"state": 200, "info": "数据不完整，请检查！"}';
         exit();
     }

    //验证订单
    $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`amount`, s.`distribution`, s.`express`, s.`merchant_deliver` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON o.`store` = s.`id` LEFT JOIN `#@__shop_branch_store` b ON o.`branchid` = b.`id` LEFT JOIN `#@__member` m ON s.`userid` = m.`id` WHERE o.`id` = '$id' AND o.`protype` = 0 AND (s.`userid` = '$uid' OR b.`userid` = '$uid') AND (o.`orderstate` = 1 || o.`orderstate` = 11)");
    $results  = $dsql->dsqlOper($archives, "results");
    if ($results) {

        $userid   = $results[0]['userid'];
        $ordernum = $results[0]['ordernum'];
        $amount   = $results[0]['amount'];

        $paramBusi = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "orderdetail",
            "action"   => "shop",
            "id"       => $id
        );

        if (($shipping == 0 && !$results[0]['distribution']) || ($shipping == 1 && !$results[0]['express']) || ($shipping == 2 && !$results[0]['merchant_deliver'])) {
            echo '{"state": 200, "info": "不支持的配送方式！"}';
            exit();
        } elseif (empty($shipping) && $shipping != 0) {
            echo '{"state": 200, "info": "请选择配送方式！"}';
            exit();
        }
        if ($shipping == 1 && (empty($company) || empty($number))) {
            echo '{"state": 200, "info": "请填写快递信息！"}';
            exit();
        }
        //获取会员名
        $username = "";
        $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
        $ret      = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
        }
        //快递类型
        if ($shipping == 1) {
            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 6, `shipping` = '$shipping', `exp_company` = '$company', `exp_number` = '$number', `exp_date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");

            //自定义配置
            $config = array(
                "username"    => $username,
                "order"       => $ordernum,
                "expCompany"  => $juhe_express_company[$company],
                "exp_company" => $juhe_express_company[$company],
                "expnumber"   => $number,
                "exp_number"  => $number,
                "fields"      => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '快递公司',
                    'keyword3' => '快递单号'
                )
            );
            updateMemberNotice($userid, "会员-订单发货通知", $paramBusi, $config, '', '', 0, 1);
            echo '{"state": 100, "info": "操作成功！"}';
            exit();

            //订单确认-(骑手配送、商家自送)
        } elseif ($shipping == 0 || $shipping == 2) {

            //自定义配置
            $config = array(
                "ordernum"   => $ordernum,
                "orderdate"  => date("Y-m-d H:i:s", GetMkTime(time())),
                "orderinfo"  => '商城订单',
                "orderprice" => $amount,
                "fields"     => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '下单时间',
                    'keyword3' => '订单详情',
                    'keyword4' => '订单金额'
                )
            );

            updateMemberNotice($userid, "会员-订单确认提醒", $paramBusi, $config, '', '', 0, 1);
            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 6, `shipping` = '$shipping', `confirmdate` = '$now',`exp_date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "操作失败，请核实订单状态后再操作！"}';
        exit();
    }



}

//编辑订单备注
elseif($dopost == 'updateAdminLog'){

    if($orderid){
        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `admin_log` = '$admin_log' WHERE `id` = " . $orderid);
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            adminLog("修改商城订单备注", $orderid . '=>订单号：' . $ordernum . '=>内容：' . $admin_log);

            echo '{"state": 100, "info": "操作成功！"}';
        }else{
            echo '{"state": 101, "info": "'.$ret.'"}';
        }
        exit();
    }else{
        echo '{"state": 200, "info": "订单ID错误！"}';
        exit();
    }

}

//修改收货信息
elseif($dopost == 'updateAddress'){

    if($orderid){

        //表单二次验证
        $address = trim($address);
        $people = trim($people);
        $contact = trim($contact);
        $note = trim($note);

		if($address == ''){
			echo '{"state": 200, "info": "请输入收货地址"}';
			exit();
		}
		if($people == ''){
			echo '{"state": 200, "info": "请输入收货人姓名"}';
			exit();
		}
		if($contact == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		//保存
		$sql = $dsql->SetQuery("UPDATE `#@__".$action."` SET `address` = '".$address."', `people` = '".$people."', `contact` = '".$contact."', `note` = '".$note."', `lng` = '', `lat` = '' WHERE `id` = ".$orderid);
		$ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            adminLog("修改商城订单收货信息", $orderid . '=>订单号：' . $ordernum . '=>新地址：' . $address . '=>' . $people . '=>' . $contact . '=>' . $note);

            echo '{"state": 100, "info": "操作成功！"}';
        }else{
            echo '{"state": 101, "info": "'.$ret.'"}';
        }
        exit();
    }else{
        echo '{"state": 200, "info": "订单ID错误！"}';
        exit();
    }

}

//修改物流信息
elseif($dopost == 'updateExpress'){

    if($orderid){

        //表单二次验证
        $exp_company = trim($exp_company);
        $exp_number = trim($exp_number);

		if($exp_company == ''){
			echo '{"state": 200, "info": "请选择快递公司"}';
			exit();
		}
		if($exp_number == ''){
			echo '{"state": 200, "info": "请输入快递单号"}';
			exit();
		}

		//保存
		$sql = $dsql->SetQuery("UPDATE `#@__".$action."` SET `exp_company` = '".$exp_company."', `exp_number` = '".$exp_number."', `exp_track` = '' WHERE `id` = ".$orderid);
		$ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            $expCompany = $juhe_express_company[$exp_company];

            adminLog("修改商城订单物流信息", $orderid . '=>订单号：' . $ordernum . '=>新物流信息：' . $expCompany . '=>' . $exp_number);

            echo '{"state": 100, "info": "操作成功！"}';
        }else{
            echo '{"state": 101, "info": "'.$ret.'"}';
        }
        exit();
    }else{
        echo '{"state": 200, "info": "订单ID错误！"}';
        exit();
    }

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'admin/shop/shopOrderEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('bear', $bear);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('ordernum', $ordernum);
	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('userlevel', $userlevel);
	$huoniaoTag->assign('storeid', $storeid);
	$huoniaoTag->assign('store', $store);
	$huoniaoTag->assign('storeUrl', $storeUrl);
	$huoniaoTag->assign('storeUserid', $storeUserid);
	$huoniaoTag->assign('storeUsername', $storeUsername);
    $huoniaoTag->assign('storeTel', $storeTel);
	$huoniaoTag->assign('product', $product);
	$huoniaoTag->assign('point', $point);
	$huoniaoTag->assign('orderprice', $orderprice);
	$huoniaoTag->assign('orderpayprice', $orderpayprice);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('lng', $lng);
	$huoniaoTag->assign('lat', $lat);
	$huoniaoTag->assign('protype', $protype);
	$huoniaoTag->assign('logistic', $logistic);
	$huoniaoTag->assign('branchid', $branchid);
	$huoniaoTag->assign('branchStoreTitle', $branchStoreTitle);
	$huoniaoTag->assign('shipping', $shipping);
    $huoniaoTag->assign('songdatime', $songdatime == 0 ? 0 : date("Y-m-d H:i:s", $songdatime));
    $huoniaoTag->assign('confirmdate', $confirmdate == 0 ? 0 : date("Y-m-d H:i:s", $confirmdate));
    $huoniaoTag->assign('canceltime', $canceltime == 0 ? 0 : date("Y-m-d H:i:s", $canceltime));
    $huoniaoTag->assign('sjprice', sprintf("%.2f",$sjprice));
    $huoniaoTag->assign('pingtai', $pingtai);    
    $huoniaoTag->assign('fenzhan', $fenzhan);
    $huoniaoTag->assign('fenzhanName', $fenzhanName);
    $huoniaoTag->assign('orderstate', $orderstate);
    $huoniaoTag->assign('cfg_shopFee', $cfg_shopFee);
    $huoniaoTag->assign('shopDiscount', $shopDiscount);
    $huoniaoTag->assign('levelName', $levelName);
    $huoniaoTag->assign('danjia', $danjia);
    $huoniaoTag->assign('auth_shop_price', (float)$auth_shop_price);
    $huoniaoTag->assign('auth_shopBody', $auth_shopBody);
    $huoniaoTag->assign('memberLevelAuth', $memberLevelAuth);
    $huoniaoTag->assign('auth_logistic', $auth_logistic);
    $huoniaoTag->assign('antu_peisongBody', $antu_peisongBody);
    $huoniaoTag->assign('pricepeisong', $pricepeisong);
    $huoniaoTag->assign('quanprice', $quanprice);
    $huoniaoTag->assign('quanbody', $quanbody);
    $huoniaoTag->assign('quanbear', $quanbear);
    $huoniaoTag->assign('quan', $quan);
    $huoniaoTag->assign('ret_negotiate', $ret_negotiate);
    $huoniaoTag->assign('changetype', $changetype);
    $huoniaoTag->assign('changeprice', $changeprice);
    $huoniaoTag->assign('changelogistic', $changelogistic);

    $huodongtype = (int)$huodongtype;
    $huoniaoTag->assign('huodongtype', $huodongtype);

    $huodongName = '';
    if($huodongtype == 1){
        $huodongName = '准点抢';
    }else if($huodongtype == 2){
        $huodongName = '秒杀';
    }else if($huodongtype == 3){
        $huodongName = '砍价';
    }else if($huodongtype == 4){
        $huodongName = '拼团';
    }
    $huoniaoTag->assign('huodongName', $huodongName);

    $huoniaoTag->assign('pinid', (int)$pinid);  //拼团id
    $huoniaoTag->assign('pinstate', (int)$pinstate);  //拼状态 0:待成团 1:成团
    $huoniaoTag->assign('pintype', (int)$pintype);  //成员类别 0:成员 1:团长

    $huoniaoTag->assign('bargainingInfo', $bargainingInfo);
    $huoniaoTag->assign('bargainingList', $bargainingList);
    
    $huoniaoTag->assign('quanList', $quanList);


    //商家分店
	if($branchid){

		$cla = new shop(array('branchid'=>$storeid));
		$hal = $cla->storeBranch();
		if(is_array($hal['list']) && count($hal['list']) > 0){
			$huoniaoTag->assign('branchList', $hal['list']);
		}

	}

	//主表信息
	$payname = '';
	$huoniaoTag->assign('paytypeold', $paytype);
	$sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
	$ret = $dsql->dsqlOper($sql, "results");

    $paytypearr = $paytype!='' ? explode(',',$paytype) : array();
    $_paytypearr = array();
    $_paytype = '';
    if($paytypearr){

		// $balance -= $point;
		
        foreach ($paytypearr as $k => $v){
            if($v !=''){
                array_push($_paytypearr,getshopDetailPaymentName($v,$balance,$point,$payprice));
            }

        }
        $sql = $dsql->SetQuery("SELECT `balance`, `point` FROM  `#@__shop_order`  WHERE `id` =".$id);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret[0]['balance'] > 0){			
            array_push ($_paytypearr,getDetailPaymentName('money',$balance,0,0));
        }
        if ($ret[0]['point'] > 0){
            array_push($_paytypearr,getDetailPaymentName('integral',0,$point,0));
        }
        if($_paytypearr){
            $_paytype = join('<br />',array_unique($_paytypearr));

        }
    }


//    if(!empty($ret)){
//		$payname = $ret[0]['pay_name'];
//	}else{
//
//		global $cfg_pointName;
//		$payname = "";
//		if($paytype == "point,money"){
//			$payname = $cfg_pointName."+余额";
//		}elseif($paytype == "point"){
//			$payname = $cfg_pointName;
//		}elseif($paytype == "money"){
//			$payname = "余额";
//		}elseif($paytype == "delivery"){
//			$payname = "货到付款";
//		}else{
//			$payname = empty($paytype) ? "积分或余额" : $paytype;
//		}
//	}

	if($peerpay > 0){
		$userinfo = $userLogin->getMemberInfo($peerpay);
		if(is_array($userinfo)){
            $_paytype = $_paytype.'<br />[<a href="javascript:;" class="userinfo" style="margin-right:0;" data-id="'.$peerpay.'">'.$userinfo['nickname'].'</a>] 代付';
		}else{
            $_paytype = $_paytype.'[<a href="javascript:;" class="userinfo" style="margin-right:0;" data-id="'.$peerpay.'">'.$peerpay.'</a>] 代付';
		}
	}

	$huoniaoTag->assign('paytype', $_paytype);


	$huoniaoTag->assign('expCompany', $expCompany);
	$huoniaoTag->assign('expNumber', $expNumber);
	$huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
	$huoniaoTag->assign('orderstate', $orderstate);
	$huoniaoTag->assign('retState', $retState);
	$huoniaoTag->assign('ordermobile', $ordermobile);
	$huoniaoTag->assign('cardnum', $cardnum);
	$huoniaoTag->assign('orderdate', $orderdate);
	$huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));

	$huoniaoTag->assign('shipping', $shipping);
	$huoniaoTag->assign('qsamount', sprintf("%.2f",$qsamount));
    $huoniaoTag->assign('peisongid', (int)$peisongid);
	$huoniaoTag->assign('peisongname', $peisongname ?: "");
	$huoniaoTag->assign('peisongphone', $peisongphone ?: "");
	$huoniaoTag->assign('peidate', $peidate == 0 ? "" : date("Y-m-d H:i:s", $peidate));
	$huoniaoTag->assign('songdate', $songdate == 0 ? "" : date("Y-m-d H:i:s", $songdate));
	$huoniaoTag->assign('okdate', $okdate == 0 ? "" : date("Y-m-d H:i:s", $okdate));
	$huoniaoTag->assign('retType', $retType);
	$huoniaoTag->assign('retNote', $retNote);
    $huoniaoTag->assign('refrundno', $refrundno);
    $huoniaoTag->assign('tuipaytype', $tuipaytype);
    $huoniaoTag->assign('tuimoney', $tuimoney);
    $huoniaoTag->assign('tuipoint', $tuipoint);

    $huoniaoTag->assign('retPics', $retPics);
	$huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
	$huoniaoTag->assign('retSnote', $retSnote);
	$huoniaoTag->assign('retSpics', $retSpics);
	$huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));
	$huoniaoTag->assign('paydate', $paydate);

	$huoniaoTag->assign('priceinfo', $priceinfo);
	$huoniaoTag->assign('amount', $amount);

	$huoniaoTag->assign('fenxiao_amount', sprintf("%.2f",$fenxiao_amount));
	$huoniaoTag->assign('fenxiao_precipitate', sprintf("%.2f",$fenxiao_precipitate));
	$huoniaoTag->assign('fenxiao_source', $fenxiao_source);
	$huoniaoTag->assign('fenxiao_out', sprintf("%.2f",$fenxiao_out));

    $huoniaoTag->assign('admin_log', $admin_log);
    $huoniaoTag->assign('juhe_express_company', $juhe_express_company);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
