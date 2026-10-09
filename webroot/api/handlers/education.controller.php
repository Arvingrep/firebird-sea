<?php

/**
 * huoniaoTag模板标签函数插件-旅游模块
 *
 * @param $params array 参数集
 * @return array
 */
function education($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "education";
	if(empty($action)) return '';

	global $template;
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;
	global $langData;
    global $cfg_returnPoint_education;
    include HUONIAOINC . "/config/education.inc.php";
    $fenXiao = (int)$customfenXiao;
    global $cfg_fenxiaoState;
	$userid = $userLogin->getMemberID();
    if($action == "class"){
        $huoniaoTag->assign('id', $id);
    }
	if($action == "storeDetail" || $action == "store-detail"){
		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				global $template;
				if($template != 'config'){
					detailCheckCity("education", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				if($action == "store-detail"){
					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__education_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "results");
					$uid = $userLogin->getMemberID();
                    if($uid >0 && $uid!=$detailConfig['member']['userid']) {
                        $uphistoryarr = array(
                            'module'    => $service,
                            'uid'       => $uid,
                            'aid'       => $id,
                            'fuid'      => $detailConfig['member']['userid'],
                            'module2'   => 'storeDetail',
                        );
                        /*更新浏览足迹表   */
                        updateHistoryClick($uphistoryarr);
                    }
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;


			}

			$huoniaoTag->assign('storeState', $state);
			$huoniaoTag->assign('storeId', $id);
		}else{
			if($action == "store-detail"){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

            }
		}
	}elseif($action == "fabu"){//会员中心发布

		if($type == "teacher"){//教育教师
			$act = "teacherDetail";
		}elseif($type == "tutor"){//教育家教
			$act = "tutorDetail";
		}elseif($type == "courses"){//教育课程
			$act = "detail";
		}
		if($id){
			$detailHandels = new handlers($service, $act);
			if($type == "tutor"){
				$detailConfig  = $detailHandels->getHandle();
			}else{
				$detailConfig  = $detailHandels->getHandle($id);
			}
			$state = 0;
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$state = 1;
				$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
				if(is_array($detailConfig)){
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}
				}
				$huoniaoTag->assign('educationState', $state);
			}else{
				if($type != "tutor"){
					header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
					die;
				}
			}
		}

	}elseif($action == "teacher-detail" || $action == "class-detail" || $action == "detail" || $action == "word-detail" || $action == "tutor-detail"){

		if($action == "detail"){
			$act = $action;
			$tab = 'education_courses';
		}else{
			$actionArr = explode('-', $action);
			$act = $actionArr[0] . 'Detail';
			$tab = 'education_' . $actionArr[0];
		}
        global $cfg_returnPointState;
        if ($cfg_returnPointState == 1) {
            //消费返积分比例
            $huoniaoTag->assign('cfg_returnPoint_education', $cfg_returnPoint_education / 100);
        }else{
            $huoniaoTag->assign('cfg_returnPoint_education', 0);
        }
		$huoniaoTag->assign('orderby', $orderby);
		$detailHandels = new handlers($service, $act);
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));
        //分销佣金比例
        global $cfg_educationFee;
        global $cfg_fenxiaoAmount;
        global $cfg_fenxiaoLevel;
        global $cfg_fenxiaoType;
        //查询当前用户是否为分销商
        $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, m.`realname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate` FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1 AND m.`id` = $userid AND f.`state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        include HUONIAOINC . "/config/settlement.inc.php";
        //分销佣金比列
        $cfg_fenxiaoFee_education = 0;
        if($cfg_fenxiaoLevel && $fenXiao && $cfg_fenxiaoState && $results) {
            $level = unserialize($cfg_fenxiaoLevel);
            $levelProportion = $level[0]['fee'];   //一级合伙人比例
            $uid = $userLogin->getMemberID();
            if($cfg_fenxiaoType) {                      //固定等级 分销商比例
                $sql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $sql = $dsql->SetQuery("SELECT m.`id`, m.`from_uid`, m.`username`, f.`id` fid, f.`state` fstate, f.`level` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id` WHERE m.`id` = " . $ret[0]['from_uid']);
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        $levelProportion = $level[$res[0]['level']]['fee'];
                    }
                }
            }

            $cfg_fenxiaoFee_education =  $cfg_educationFee /100 * $cfg_fenxiaoAmount / 100 * $levelProportion / 100;
        }
        $huoniaoTag->assign('cfg_fenxiaoFee_education', $cfg_fenxiaoFee_education);
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				// echo "<pre>";
				// print_R($detailConfig);exit;
				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}

            $uid = $userLogin->getMemberID();
            if($uid >0 && $uid!=$detailConfig['userid']) {
                $uphistoryarr = array(
                    'module'    => $service,
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => $detailConfig['userid'],
                    'module2'   => $act,
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == 'list'){

		$community_seotitle = "";

		require(HUONIAOINC."/config/education.inc.php");
		$list_typename = $customSeoTitle;
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('orderby', $orderby);
		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$community_seotitle = join("", $addrArr);

		}
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('ctypeid', $ctypeid);
		if(!empty($typeid)){
			$typeid = (int)$typeid;
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = ".$typeid);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['typename'];
			}
		}
		$huoniaoTag->assign('time', $time);
		$price = htmlspecialchars(RemoveXSS($_REQUEST['price']));
		if(!empty($price)){
			$priceArr = explode(",", $price);
			if(empty($priceArr[0])){
				$loupan_seotitle .= ($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千") . "以下";
			}elseif(empty($priceArr[1])){
				$loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千") . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千")."-".($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千");
			}
		}
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);

	}elseif($action == 'store'){
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('orderby', $orderby);

	}elseif($action == 'tutor'){
		// $price = htmlspecialchars(RemoveXSS($_REQUEST['price']));

        $price = convertArrToStrWithComma($price);

		if(!empty($price)){
			$priceArr = explode(",", $price);
			if(empty($priceArr[0])){
				$loupan_seotitle .= ($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千") . "以下";
			}elseif(empty($priceArr[1])){
				$loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千") . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千")."-".($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千");
			}
		}
		$huoniaoTag->assign('addrid', (int)$addrid);
		$huoniaoTag->assign('business', (int)$business);
		$huoniaoTag->assign('typeid', (int)$typeid);
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('orderby', (int)$orderby);
	}elseif($action == 'search'){
		$huoniaoTag->assign('keywords', $keywords);
	}elseif($action == "comfirm"){//确认订单
		$detailHandels = new handlers($service, 'classDetail');
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == "pay2" || $action == "pay"){
		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		$RenrenCrypt = new RenrenCrypt();
		$ordernums = $RenrenCrypt->php_decrypt(base64_decode($ordernum));

		if(!empty($ordernums)){
			$huoniaoTag->assign('ordernum', $ordernums);

			$ordernumArr = explode(",", $ordernums);
			$orderArr    = array();
			$totalAmount = 0;

			foreach ($ordernumArr as $key => $value) {

				//获取订单内容
				$archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate`,`orderdate` FROM `#@__education_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
				$orderDetail  = $dsql->dsqlOper($archives, "results");
				if($orderDetail){

					$proid      = $orderDetail[0]['proid'];
					$procount   = $orderDetail[0]['procount'];
					$orderprice = $orderDetail[0]['orderprice'];
					$orderstate = $orderDetail[0]['orderstate'];
					$orderdate  = $orderDetail[0]['orderdate'];
					//总价
					$totalAmount += $orderprice * $procount;
					$totalCount  += $procount;
					//验证订单状态，如果不是待付款状态则跳转至订单列表
					if($orderstate != 0){
						$param = array(
							"service"     => "member",
							"type"        => "user",
							"template"    => "order",
							"module"      => "education"
						);
						$url = getUrlPath($param);
						header("location:".$url);
						die;
					}

					$newid   = $proid;
					$act     = 'classDetail';

					$detailHandels = new handlers($service, $act);
					$detailConfig  = $detailHandels->getHandle($newid);
										// echo"<pre>";
										// var_dump($detailConfig);die;
					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
						// if(is_array($detailConfig)){
						// 	foreach ($detailConfig as $key => $value) {
						// 		$huoniaoTag->assign('detail_'.$key, $value);
						// 	}
						// }

						$coursesArr = $detailConfig['coursesArr'];

						$orderArr[$key]['title'] 	 = $detailConfig['classname'];
						$orderArr[$key]['count'] 	 = $procount;
						$orderArr[$key]['price'] 	 = $orderprice;
						$orderArr[$key]['store'] 	 = $coursesArr['store']['title'];
						$orderArr[$key]['storeid'] 	 = $coursesArr['store']['id'];
						$orderArr[$key]['productname'] 	 = $coursesArr['title'];
						$orderArr[$key]['productid'] 	 = $coursesArr['id'];
						$orderArr[$key]['orderdate'] 	 = ($orderdate+1800)-time();
						$orderArr[$key]['ordernums'] = $value;
						$orderArr[$key]['pics'] = $coursesArr['pics']['0']['path'];
					}else{
						header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
						die;
					}

					// $proDetail  = $detailHandels->getHandle($newid);
					// echo"<pre>";
					// var_dump($proDetail);die;
					// if($proDetail && $proDetail['state'] == 100){
					// 		$orderArr[$key]['title'] = $proDetail['info']['classname'];

					// 		$param = array(
					// 			"service"  => "education",
					// 			"template" => "detail",
					// 			"id"       => $proDetail['info']['id']
					// 		);
					// 		$orderArr[$key]['url']   = getUrlPath($param);
					// 		$orderArr[$key]['count'] = $procount;
					// 		$orderArr[$key]['price'] = $orderprice;
					// 		$orderArr[$key]['store'] = $proDetail['store']['title'];


					// 	//商品不存在
					// }else{
					// 		header("location:".$cfg_secureAccess.$cfg_basehost);
					// 		die;
					// }

				//订单不存在
				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost);
					die;
				}

			}

			$huoniaoTag->assign('orderArr', $orderArr);
			$huoniaoTag->assign('ordertype', $langData['siteConfig'][21][254]);
			// var_dump($orderArr);die;
			$huoniaoTag->assign('totalAmount', sprintf("%.2f", $totalAmount));
			$huoniaoTag->assign('totalCount', $totalCount);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}

	//留言列表
	}elseif($action == "word" || $action == "word_list"){

		$addrid    = (int)$addrid;
		$business  = (int)$business;

		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('orderby', $orderby);
		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


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
			$archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'education' AND `ordernum` = '$ordernum' AND `uid` = $userid");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$proArr = array();
				$isaddr = 0;
				$address = "";
				$i = 0;
				$ids = explode(",", $payDetail[0]['body']);

				foreach ($ids as $key => $value) {

					//查询订单详细信息
					$archives = $dsql->SetQuery("SELECT `id`, `proid`, `procount`, `orderstate`, `people`,`contact`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
					$orderDetail  = $dsql->dsqlOper($archives, "results");
					if($orderDetail){
						$orderDetail = $orderDetail[0];

						$orderid    = $orderDetail['id'];
						$orderstate = $orderDetail['orderstate'];
						$proid      = $orderDetail['proid'];
						$people     = $orderDetail['people'];
						$contact    = $orderDetail['contact'];
						$id         = $orderDetail['id'];

                        $proArr[$i]['id']    = $orderDetail['id'];
                        $proArr[$i]['count'] = $orderDetail['procount'];
                        $proArr[$i]['price'] = $orderDetail['orderprice'];
                        $i++;
						$detailHandels = new handlers($service, "orderDetail");
						$detailConfig  = $detailHandels->getHandle($id);

						if(is_array($detailConfig) && $detailConfig['state'] == 100){
							$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
							if(is_array($detailConfig)){
								foreach ($detailConfig as $key => $value) {
									$huoniaoTag->assign('detail_'.$key, $value);
								}
							}
						}else{
							header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						}

					}
				}

                $huoniaoTag->assign('proArr', $proArr);

//				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('state', $orderstate);
				$huoniaoTag->assign('orderid', $orderid);
				$huoniaoTag->assign('people', $people);
				$huoniaoTag->assign('contact', $contact);
				$huoniaoTag->assign('orderstate', $orderstate);
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
	}




	if(empty($smarty)) return;

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

		$param = $params;
		$moduleReturn  = $moduleHandels->getHandle($param);

		//只返回数据统计信息
		if($pageData == 1){
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
				$pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
			}else{
				$moduleReturn  = $moduleReturn['info'];  //返回数据
				$pageInfo_ = $moduleReturn['pageInfo'];
			}
			$smarty->block_data[$dataindex] = array($pageInfo_);

		//指定数据
		}elseif(!empty($get)){
			$retArr = $moduleReturn['state'] == 100 ? $moduleReturn['info'][$get] : "";
			$retArr = is_array($retArr) ? $retArr : array();
			$smarty->block_data[$dataindex] = $retArr;

		//正常返回
		}else{

			global $pageInfo;
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
				$pageInfo = array();
				$smarty->assign('pageInfo', $pageInfo);
				return '';
			}
			$moduleReturn  = $moduleReturn['info'];  //返回数据
			$pageInfo_ = $moduleReturn['pageInfo'];
			if($pageInfo_){
				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];
				$pageInfo = $pageInfo_;
			}else{
				$pageInfo = array();
			}
			$smarty->assign('pageInfo', $pageInfo);
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
