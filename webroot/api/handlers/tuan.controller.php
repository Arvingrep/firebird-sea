<?php
/**
 * huoniaoTag模板标签函数插件-团购模块
 *
 * @param $params array 参数集
 * @return array
 */
function tuan($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
	$service = "tuan";

	if(empty($action)) return '';
	global $huoniaoTag;
	global $dsql;
	global $cfg_secureAccess;
	global $cfg_basehost;
	global $userLogin;
    global $cfg_returnPoint_tuan;
    global $cfg_tuanFee;
    global $cfg_fenxiaoAmount;
    global $cfg_fenxiaoLevel;
    include HUONIAOINC . "/config/tuan.inc.php";
    $fenXiao = (int)$customfenXiao;
    global $cfg_fenxiaoState;
    $userid   = $userLogin->getMemberID();

    $furl = urlencode(''.$cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
	//选择城市，打开首页默认跳转到指定城市【手机版除外】
	if($template == "changecity" && !isMobile()){

		global $tuanDefaultCity;
		$cityHandels = new handlers($service, "city");
		$cityConfig  = $cityHandels->getHandle();

		if(is_array($cityConfig) && $cityConfig['state'] == 100){
			$cityConfig  = $cityConfig['info'];

			$url = "";
			if(!empty($cityConfig)){
				foreach ($cityConfig as $key => $value) {
					if($value['id'] == $tuanDefaultCity){
						$url = $value['url'];
					}
				}

				//如果没有设置默认城市，则选中第一个城市
				if(empty($url)){
					$url = $cityConfig[0]['url'];
				}

				header("location:".$url);
				die;

			}

		}

	//获取指定分类详细信息
	}elseif($action == "list" || $action == "new" || $action == "voucher" || $action == "pintuan" || $action == "haodian" || $action == "shangquan"){

		$list_id = 0;
		$list_seotitle = "团购大全";
		if($action == "voucher"){
			$list_seotitle = "代金券";
		}

		//城市商圈
		$circle = $circle ? (int)$circle : 0;
		$huoniaoTag->assign('list_circle', $circle);

		//区域
		$addrid = (int)$addrid;
		$addrname = "";
		if(!empty($addrid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ".$addrid);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['typename'];
				$list_seotitle = $list_typename . "团购";

				$addrname = $list_typename;
			}
		}

		//商圈
		$business = $businesspar = (int)$business;
		$businessname = $businessparname = "";
		if(!empty($business)){
			$sql = $dsql->SetQuery("SELECT `qid`, `name` FROM `#@__tuan_circle` WHERE `id` = ".$business);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['name'];
				$list_seotitle = $list_typename . "团购";

				$businessname = $list_typename;

				$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__site_area` WHERE `id` = ".$results[0]['qid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$addrid = $ret[0]['id'];
				}
			}
		}
		$huoniaoTag->assign('list_business', $business);
		$huoniaoTag->assign('list_businessname', $businessname);


		$huoniaoTag->assign('list_addrid', $addrid);
		$huoniaoTag->assign('list_addrname', $list_typename);

		//地铁
		$subway = (int)$subway;
		$station = (int)$station;
		$subwayname = $stationame = "";
		if(!empty($subway)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$list_seotitle = $list_typename . "团购";

				$subwayname = $list_typename;
			}
		}
		if(!empty($station)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$list_seotitle = $list_typename . "团购";

				$stationame = $list_typename;
				$subwayname = $list_typename;
			}
		}
		$huoniaoTag->assign('list_subway', $subway);
		$huoniaoTag->assign('list_subwayname', $subwayname);
		$huoniaoTag->assign('list_station', $station);
		$huoniaoTag->assign('list_stationame', $stationame);
		$huoniaoTag->assign('search_keyword', $search_keyword);

		//分类
		$huoniaoTag->assign('list_id', 0);
		$huoniaoTag->assign('list_seotitle', $list_seotitle);
		$huoniaoTag->assign('list_parid', 0);
		$huoniaoTag->assign('list_partitle', "");
		if(!empty($typeid)){
			$listHandels = new handlers($service, "typeDetail");
			$listConfig  = $listHandels->getHandle($typeid);

			if(is_array($listConfig) && $listConfig['state'] == 100){
				$listConfig  = $listConfig['info'];
				if(is_array($listConfig)){
					foreach ($listConfig[0] as $key => $value) {
						$huoniaoTag->assign('list_'.$key, $value);
					}
				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}

			//父级
			$sql = $dsql->SetQuery("SELECT `parentid`, `typename` FROM `#@__tuantype` WHERE `id` = ".$typeid);
			$results = $dsql->dsqlOper($sql, "results");
			if($results && $results[0]['parentid'] != 0){
				$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__tuantype` WHERE `id` = ".$results[0]['parentid']);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$huoniaoTag->assign('list_parid', $results[0]['id']);
					$huoniaoTag->assign('list_parname', $results[0]['typename']);
				}
			}else{
				$huoniaoTag->assign('list_parid', $typeid);
				$huoniaoTag->assign('list_parname', $results[0]['typename']);
			}
		}
		return;

	//购物车
	}elseif($action == "cart"){

		global $cfg_cookiePre;
		$data = $cfg_cookiePre . "tuan_cart";
		$huoniaoTag->assign('data', $data);
		return;


	//获取指定ID的详细信息
	}elseif($action == "tdetail" || $action == "ptdetail" || $action == "detail" || $action == "buy" || $action == "review" || $action == "pic"){



		$tpl = $action;

		$type = $type == "pin" ? "pin" : "";
		$pinid = (int)$pinid;
		$voucher = (int)$voucher;
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('pinid', $pinid);
		$huoniaoTag->assign('voucher', $voucher);

		$time = time();
		$sql = $dsql->SetQuery("SELECT p.`id`,p.`people`,p.`userid`,l.`pinpeople`,p.`enddate` FROM `#@__tuan_pin` p LEFT JOIN `#@__tuanlist` l ON l.`id` = p.`tid`  WHERE l.`enddate`>'$time' and p.`state`=1 and p.`enddate`>'$time' and p.`tid`='$id'");
		$totalCount = $dsql->dsqlOper($sql, "totalCount");
		$huoniaoTag->assign('totalCount', $totalCount);
		//购买页面
		if($action == "buy"){

            include HUONIAOINC . '/config/tuan.inc.php';
            $huoniaoTag->assign('peerpayState', $custompeerpay);
            $huoniaoTag->assign('peerpay', (int)$peerpay);
			$action = "detail";
			$count = $count <= 0 ? 1 : $count;

			global $userLogin;
			$userinfo = $userLogin->getMemberInfo();
			$userid = $userLogin->getMemberID();

			if($userid == -1){
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
				die;
			}

			// 手机认证
            global $cfg_memberBindPhone;
            global $cfg_memberBindPhoneInfo;
            global $cfg_periodicCheckPhone;
            global $cfg_periodicCheckPhoneCycle;
            $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
            $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天
            if($cfg_memberBindPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || ($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle))){
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "security",
                    "doget"    => "chphone"
                );
                $certifyUrl = getUrlPath($param);
                putSession('loginRedirectInfo', $cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REDIRECT_URL'].'?'.$_SERVER['QUERY_STRING']);
                $cfg_memberBindPhoneInfo = $cfg_memberBindPhoneInfo ? $cfg_memberBindPhoneInfo : $langData['siteConfig'][33][53];//请先进行手机认证！

                if($periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle){
                    $cfg_memberBindPhoneInfo = '请先验证手机号码';
                }

                die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$cfg_memberBindPhoneInfo.'");location.href="'.$certifyUrl.'";</script>');
            }
		}

		$action = $action == "tdetail" || $action == "detail" || $action == "pic" || $action == "review" ? "detail" : $action;
		$detailHandels = new handlers($service, $action);
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid        = $userLogin->getMemberID();
					$userinfo   = $userLogin->getMemberInfo();
					if($uid > 0 && $detailConfig['store']['member']['userid'] != $uid){
					    if($userinfo['is_staff'] !=1){
                            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                            die;

                        }
					}
				}

				detailCheckCity($service, $detailConfig['id'], $detailConfig['store']['cityid'], $tpl);
				//获取分类信息
				$listHandels = new handlers($service, "typeDetail");
				$listConfig  = $listHandels->getHandle($detailConfig['typeid']);
				if(is_array($listConfig) && $listConfig['state'] == 100){
					$listConfig  = $listConfig['info'];
					if(is_array($listConfig)){
						foreach ($listConfig[0] as $key => $value) {
							$huoniaoTag->assign('list_'.$key, $value);
						}
					}
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$fx_reward = $detailConfig['fx_reward'];
				global $cfg_returnPointState;
				if ($cfg_returnPointState == 1){
                    //消费返积分比例
                    $huoniaoTag->assign('cfg_returnPoint_tuan', $cfg_returnPoint_tuan/100);
                }else{
                    $huoniaoTag->assign('cfg_returnPoint_tuan', 0);
                }

                //查询当前用户是否为分销商
                $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate` FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1 AND m.`id` = $userid AND f.`state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                global $cfg_fenxiaoType;
                include HUONIAOINC . "/config/settlement.inc.php";
                //分销佣金比例
                $cfg_fenxiaoFee_tuan = 0;
                if ($cfg_fenxiaoLevel && $fenXiao && $cfg_fenxiaoState && $results) {
                    $yiji = unserialize($cfg_fenxiaoLevel);
                    $yijibili = $yiji[0]['fee'];
                    $uid = $userLogin->getMemberID();
                    if($cfg_fenxiaoType) {                      //固定等级 分销商比例
                        $sql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = $uid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $sql = $dsql->SetQuery("SELECT m.`id`, m.`from_uid`, m.`username`, f.`id` fid, f.`state` fstate, f.`level` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id` WHERE m.`id` = " . $ret[0]['from_uid']);
                            $res = $dsql->dsqlOper($sql, "results");
                            if ($res) {
                                $yijibili = $yiji[$res[0]['level']]['fee'];
                            }
                        }
                    }

                    global $cfg_fenxiaoSource;
                    $fenxiaoSource = (int)$cfg_fenxiaoSource;
                    global $cfg_tuanFee;  //平台抽成

                    if($detailConfig['store']['shopFee'] > 0){
                        $cfg_tuanFee = $detailConfig['store']['shopFee'];
                    }

                    //如果是平台承担，则计算佣金的底价以平台应得为准
                    $pingtai = 1;
                    if(!$fenxiaoSource){
                        $pingtai = $cfg_tuanFee / 100;
                    }

                    if ($fx_reward) {
                        if (strstr($fx_reward, '%')) {
                            $cfg_fenxiaoFee_tuan = (float)$fx_reward / 100 * $yijibili / 100 * $pingtai;
                        } else {
                            $cfg_fenxiaoFee_inttuan = $fx_reward * $yijibili / 100;
                        	$huoniaoTag->assign('cfg_fenxiaoFee_inttuan', $cfg_fenxiaoFee_inttuan);
                        }
                    } else {

                        $cfg_fenxiaoFee_tuan = $cfg_fenxiaoAmount / 100 * $yijibili / 100 * $pingtai;
                    }
                }
                $huoniaoTag->assign('cfg_fenxiaoFee_tuan', $cfg_fenxiaoFee_tuan);

				//如果是购买页面，根据浏览器传回的数量计算出总价
				if(!empty($count)){
					$count = $count > $detailConfig['limit'] && $detailConfig['limit'] != 0 ? $detailConfig['limit'] : $count;
					$huoniaoTag->assign('count', $count);

					//运费
					$freight = 0;
					if($detailConfig['tuantype'] == 2 && $count <= $detailConfig['freeshi']){
						$freight = $detailConfig['freight'];
					}
					if(!empty($type)){
						$huoniaoTag->assign('totalAmount', sprintf("%.2f",  $detailConfig['pinprice']));
					}else{
						$huoniaoTag->assign('totalAmount', sprintf("%.2f",  $detailConfig['price']));
					}

				}

                $archives = $dsql->SetQuery("SELECT t.`id` FROM `#@__tuanlist` t LEFT JOIN `#@__tuan_store` s ON s.`id` = t.`sid` WHERE s.`state` = 1 AND t.`id` = ".$id);
                $results  = $dsql->dsqlOper($archives, "results");
                if(!$results){
                    header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                }

                $uid = $userLogin->getMemberID();
                if($uid >0 ) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => '',
                        'module2'   => $action,
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
		return;

	//获取指定ID的商铺详细
	}elseif($action == "storeDetail" || $action == "store"){

		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($uid);
		$state = 0;

		global $template;

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
			if(is_array($detailConfig)){

				if($template != 'config'){
					detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

			}
			//团购个数
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuanlist` WHERE `arcrank` = 1 and `sid` = '$uid' and `enddate` > ".GetMkTime(time())."");
			$totalCount = $dsql->dsqlOper($archives, "totalCount");
			$huoniaoTag->assign('tuannum', $totalCount);

			$uidd = $userLogin->getMemberID();
            if($uid >0 ) {
                $uphistoryarr = array(
                    'module'    => $service,
                    'uid'       => $uidd,
                    'aid'       => $uid,
                    'fuid'      => '',
                    'module2'   => 'storeDetail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }
		}else{

			if($template != 'config'){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

                die;
			}
		}
		$huoniaoTag->assign('storeState', $state);
		return;


	//支付页面
	}elseif($action == "pay"){

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1 && !$peerpay){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		$param = array(
			"service"  => "tuan",
			"template" => "editorder",
			"param"    => "ordernum=".$ordernum
		);
		$huoniaoTag->assign('editDetailUrl', getUrlPath($param));


		//代付开关
		include HUONIAOINC . '/config/tuan.inc.php';
		$huoniaoTag->assign('peerpayState', $custompeerpay);
		$huoniaoTag->assign('peerpay', (int)$peerpay);


		$RenrenCrypt = new RenrenCrypt();
		$ordernums = $RenrenCrypt->php_decrypt(base64_decode($ordernum));

		if(!empty($ordernums)){
			$huoniaoTag->assign('ordernum', $ordernums);

			$ordernumArr = explode(",", $ordernums);
			$orderArr    = array();
			$totalAmount = 0;

			$detailHandels = new handlers("tuan", "detail");

			foreach ($ordernumArr as $key => $value) {

				//获取订单内容
				if($peerpay){
					//代付不需要核实下单人
					$archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `propolic`, `orderstate` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
				}else{
					$archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `propolic`, `orderstate` FROM `#@__tuan_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
				}
				$orderDetail  = $dsql->dsqlOper($archives, "results");
				if($orderDetail){

					$proid      = $orderDetail[0]['proid'];
					$procount   = $orderDetail[0]['procount'];
					$orderprice = $orderDetail[0]['orderprice'];
					$propolic   = $orderDetail[0]['propolic'];
					$policy     = unserialize($propolic);
					$orderstate = $orderDetail[0]['orderstate'];

					//总价
					$totalAmount  += $orderprice;

					if(!empty($propolic) && !empty($policy)){
						$freight  = $policy['freight'];
						$freeshi  = $policy['freeshi'];

						//如果达不到免物流费的数量，则总价再加上运费
						if($procount <= $freeshi){
							$totalAmount += $freight;
						}
					}


					//验证订单状态，如果不是待付款状态则跳转至订单列表
					if($orderstate != 0){
						$param = array(
							"service"     => "member",
							"type"        => "user",
							"template"    => "order",
							"module"      => "tuan"
						);
						$url = getUrlPath($param);
						header("location:".$url);
						die;
					}

					$proDetail  = $detailHandels->getHandle($proid);

					//获取商品详细信息
					if($proDetail && $proDetail['state'] == 100 && $proDetail['info']['enddate'] > time()){
						$orderArr[$key]['title'] = $proDetail['info']['title'];

						$param = array(
							"service"  => "tuan",
							"template" => "detail",
							"id"       => $proDetail['info']['id']
						);
						$orderArr[$key]['url']   = getUrlPath($param);
						$orderArr[$key]['count'] = $procount;
						$orderArr[$key]['price'] = $orderprice;
						$orderArr[$key]['store'] = $proDetail['info']['store'];


					//商品不存在
					}else{
						header("location:".$cfg_secureAccess.$cfg_basehost);
						die;
					}

				//订单不存在
				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost);
					die;
				}

			}
			$huoniaoTag->assign('orderArr', $orderArr);
			$huoniaoTag->assign('totalAmount', sprintf("%.2f", $totalAmount));



		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}


	//修改订单
	}elseif($action == "editorder"){

		$huoniaoTag->assign('ordernum', $ordernum);


	//支付结果页面
	}elseif($action == "payreturn"){

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'tuan' AND `ordernum` = '$ordernum' AND `uid` = $userid");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$proArr = array();
				$isaddr = 0;
				$address = "";
				$i = 0;
				$ids = explode(",", $payDetail[0]['body']);

				foreach ($ids as $key => $value) {

					//查询订单详细信息
					$archives = $dsql->SetQuery("SELECT `id`, `proid`, `procount`, `orderprice`, `useraddr`, `username`, `usercontact`, `pinid` FROM `#@__tuan_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
					$orderDetail  = $dsql->dsqlOper($archives, "results");
					if($orderDetail){
						$orderDetail = $orderDetail[0];
						$pinid = $orderDetail['pinid'];
						$huoniaoTag->assign('pinid', $pinid);

						//查询商品信息
						$archives = $dsql->SetQuery("SELECT `id`, `title`, `tuantype` FROM `#@__tuanlist` WHERE `id` = ".$orderDetail['proid']);
						$detail  = $dsql->dsqlOper($archives, "results");
						if($detail){
							$detail = $detail[0];

							$proArr[$i]['title'] = $detail['title'];
							$proArr[$i]['id']    = $orderDetail['id'];
							$proArr[$i]['count'] = $orderDetail['procount'];
							$proArr[$i]['price'] = $orderDetail['orderprice'];

							$param = array(
								"service"  => "tuan",
								"template" => "detail",
								"id"       => $detail['id']
							);
							$proArr[$i]['url'] = getUrlPath($param);

							$i++;

							if($detail['tuantype'] == 2){
								$isaddr = 1;
								$address = $orderDetail['username']."，".$orderDetail['useraddr']."，".$orderDetail['usercontact'];
							}

						}
					}
				}


				$huoniaoTag->assign('proArr', $proArr);
				$huoniaoTag->assign('isaddr', $isaddr);
				$huoniaoTag->assign('address', $address);
				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('totalAmount', sprintf("%.2f", $payDetail[0]['amount']));



			//支付订单不存在
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost);
				die;
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}

	//发布团购
	}elseif($action == "fabu"){

		//输出分类字段内容
		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid != -1){

			$itemResults = array();

			$sql = $dsql->SetQuery("SELECT `stype` FROM `#@__tuan_store` WHERE `uid` = ".$userid);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$typeid = $results[0]['stype'];

				$checktype = $dsql->SetQuery("SELECT `parentid` FROM `#@__tuantype` WHERE `id` = ".$typeid);
				$typeResults = $dsql->dsqlOper($checktype, "results");
				$tt = $typeResults[0]['parentid'] != 0 ? $typeResults[0]['parentid'] : $typeid;

				$infoitem = $dsql->SetQuery("SELECT `id`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default` FROM `#@__tuantypeitem` WHERE `tid` = ".$tt." ORDER BY `orderby` DESC");
				$itemResults = $dsql->dsqlOper($infoitem, "results");
			}

			if(count($itemResults) > 0){
				$list = array();
				foreach ($itemResults as $key=>$value) {
					$options = "";
					if($value["options"] != ""){
						$options = preg_split("[\r\n]", $value["options"]);
					}
					$default = "";
					if($value["default"] != ""){
						$default = preg_split("[\|]", $value["default"]);
					}

					$itemVal = "";
					//获取分类下相应字段
					if($id != ""){
						$infoitem = $dsql->SetQuery("SELECT `value` FROM `#@__tuanitem` WHERE `aid` = ".$id." AND `iid` = ".$value["id"]);
						$itemResults = $dsql->dsqlOper($infoitem, "results");
						$itemVal = explode(",", $itemResults[0]['value']);
					}

					$list[$key]['id'] = $value['id'];
					$list[$key]['field'] = $value['field'];
					$list[$key]['title'] = $value['title'];
					$list[$key]['type'] = $value['formtype'];
					$list[$key]['required'] = $value['required'];
					$list[$key]['options'] = $options;
					$list[$key]['default'] = $default;
					$list[$key]['value'] = $itemVal;
				}

				$huoniaoTag->assign('infoItemArr', $list);
			}

		}

	}elseif($action == "mapshop"){//地图找店
		$currentCityId = getCityId();
		$cityid = $cityid ? $cityid : $currentCityId;
		//获取当前的经纬度
		$archives = $dsql->SetQuery("SELECT `id`, `longitude`, `latitude` FROM `#@__site_area` WHERE `id` = '$cityid'");
		$detail  = $dsql->dsqlOper($archives, "results");
		if(is_array($detail)){
			foreach ($detail[0] as $key => $value) {
				$huoniaoTag->assign($key, $value);
			}
		}
	}elseif($action == "sqdetail"){//商圈详情
		$detailHandels = new handlers($service, "circleDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;
	}elseif($action == "dindan"){//拼团详情
		$detailHandels = new handlers($service, "pinGroup");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;
	}elseif($action == "storereview" || $action == "storecommon"){//商家评论列表
		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;
	}


	if(empty($smarty)) return;
	global $template;

	if(!isset($return))
		$return = 'row'; //返回的变量数组名

	//注册一个block的索引，照顾smarty的版本
    if(method_exists($smarty, 'get_template_vars')){
        $_bindex = $smarty->get_template_vars('_bindex');
    }else{
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if(!$_bindex){
        $_bindex = array();
    }

    if($return){
        if(!isset($_bindex[$return])){
            $_bindex[$return] = 1;
        }else{
            $_bindex[$return] ++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

	//对象$smarty上注册一个数组以供block使用
	if(!isset($smarty->block_data)){
		$smarty->block_data = array();
	}

	//得一个本区块的专属数据存储空间
	$dataindex = md5(__FUNCTION__.md5(serialize($params)));
	$dataindex = substr($dataindex, 0, 16);

	//使用$smarty->block_data[$dataindex]来存储
	if(!$smarty->block_data[$dataindex]){
		//取得指定动作名
		$moduleHandels = new handlers($service, $action);

		//获取分类
		if($action == "type" || $action == "addr" || $action == "hotype" || $action == "hotCircle" || $action == "circle"){
			$params['type']     = $type;
			$params['page']     = $page;
			$params['pageSize'] = $pageSize;
			$params['son']      = '0';

		//信息列表
		}elseif($action == "tlist"){
			//如果是列表页面，则获取地址栏传过来的typeid
			if($template == "list" && !$typeid){
				global $typeid;
				$params['typeid']   = $typeid;
			}

		}

		$moduleReturn  = $moduleHandels->getHandle($params);

		//只返回数据统计信息
		if($pageData == 1){
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
				$pageInfo_ = array("totalCount" => 0);
			}else{
				$moduleReturn  = $moduleReturn['info'];  //返回数据
				$pageInfo_ = $moduleReturn['pageInfo'];
			}
			$smarty->block_data[$dataindex] = array($pageInfo_);

		//正常返回
		}else{
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';

			$moduleReturn  = $moduleReturn['info'];  //返回数据

			$pageInfo_ = $moduleReturn['pageInfo'];
			if($pageInfo_){

				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];

				//把pageInfo定义为global变量
				global $pageInfo;
				$pageInfo = $pageInfo_;
				$smarty->assign('pageInfo', $pageInfo);
			}

			$smarty->block_data[$dataindex] = $moduleReturn;  //存储数据
		}
	}

	//果没有数据，直接返回null,不必再执行了
	if(!$smarty->block_data[$dataindex]) {
		$repeat = false;
		return '';
	}

	//一条数据出栈，并把它指派给$return，重复执行开关置位1
	if(list($key, $item) = each($smarty->block_data[$dataindex])){
		$smarty->assign($return, $item);
		$repeat = true;
	}

	//如果已经到达最后，重置数组指针，重复执行开关置位0
	if(!$item) {
		reset($smarty->block_data[$dataindex]);
		$repeat = false;
	}

	//打印内容
	print $content;
}
