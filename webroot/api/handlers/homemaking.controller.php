<?php

/**
 * huoniaoTag模板标签函数插件-家政模块
 *
 * @param $params array 参数集
 * @return array
 */
function homemaking($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "homemaking";
	if(empty($action)) return '';
	global $template;
	global $dsql;
	global $huoniaoTag;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;
    global $cfg_returnPoint_homemaking;
    include HUONIAOINC . "/config/homemaking.inc.php";
    $fenXiao = (int)$customfenXiao;
    global $cfg_fenxiaoState;
    $userid   = $userLogin->getMemberID();

	if($action == "storeDetail" || $action == "store-detail"){

        $id = (int)$id;

		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
			if(is_array($detailConfig)){

				global $template;
				if($template != 'config'){
					detailCheckCity("homemaking", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				//更新浏览次数
                if($id){
                    $sql = $dsql->SetQuery("UPDATE `#@__homemaking_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "results");//print_R($detailConfig);exit;
                }

				$uid = $userLogin->getMemberID();
                if($uid >0 &&$detailConfig['member']['userid'] != $uid) {
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
	}elseif($action == "broker-detail"){
		$huoniaoTag->assign('tpl', $tpl);

		$detailHandels = new handlers($service, "adviserList");
		$detailConfig  = $detailHandels->getHandle(array("userid" => $id, "u" => $u));

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				global $template;
				if(stripos($action, 'config-car') !== false ){
					detailCheckCity($service, $detailConfig['list'][0]['id'], $detailConfig['list'][0]['cityid'], $action);
				}

				//输出详细信息
				foreach ($detailConfig['list'][0] as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `click` = `click` + 1 WHERE `id` = $id");
				$dsql->dsqlOper($sql, "update");

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;
	}elseif ($action == "fabu") {
		$huoniaoTag->assign('dopost', $dopost);
		//发布成功
        if (!empty($id)) {
            $huoniaoTag->assign("id", $id);
        }
	}elseif($action == "detail" || $action == "configure" || $action == "buy" || $action == "buy"){
        global $cfg_returnPointState;
        if ($cfg_returnPointState == 1) {
            //消费返积分比例
            $huoniaoTag->assign('cfg_returnPoint_homemaking', $cfg_returnPoint_homemaking / 100);
        }else{
            $huoniaoTag->assign('cfg_returnPoint_homemaking', 0);
        }
        //查询当前用户是否为分销商
        $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate` FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1 AND m.`id` = $userid AND f.`state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        //分销佣金比列
        global $cfg_homemakingFee;
        global $cfg_fenxiaoAmount;
        global $cfg_fenxiaoLevel;
        global $cfg_fenxiaoType;
        global $cfg_shopFee;

        include HUONIAOINC . "/config/settlement.inc.php";
        $cfg_fenxiaoFee_homemaking = 0;
        if ($cfg_fenxiaoLevel && $fenXiao && $cfg_fenxiaoState && $results )
        {
            $level = unserialize($cfg_fenxiaoLevel);
            $levelProportion = $level[0]['fee'];
            $uid = $userLogin->getMemberID();
            if($cfg_fenxiaoType) {                      //固定等级 分销商比例
                $sql = $dsql->SetQuery("SELECT `level` FROM `#@__member_fenxiao_user` WHERE `uid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $levelProportion = $level[$ret[0]['level']]['fee'];
                }
            }
            $cfg_fenxiaoFee_homemaking = $cfg_homemakingFee/100 * $cfg_fenxiaoAmount / 100 * $levelProportion / 100;
        }
        $huoniaoTag->assign('cfg_fenxiaoFee_homemaking', $cfg_fenxiaoFee_homemaking);

		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);//print_R($detailConfig);die;



		if (is_array($detailConfig) && $detailConfig['state'] == 100) {
			$detailConfig = $detailConfig['info'];
			if (is_array($detailConfig)) {

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0 && $detailConfig['store']['userid'] != $uid){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}
				}


				//购买页面
				if($action == "buy"){

                    $userid = $userLogin->getMemberID();
                    if($userid == -1){
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
                        die;
                    }

					$action = "detail";
					$count = $count <= 0 ? 1 : $count;

					if(!empty($count)){
						$huoniaoTag->assign('count', $count);
						$huoniaoTag->assign('totalAmount', sprintf("%.2f", $count * $detailConfig['price']));
					}

				}

				//输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `click` = `click` + 1 WHERE `state` = 1 AND `id` = " . $id);
                $dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0) {
                    $uphistoryarr = array(
                        'module'    => 'homemaking',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['store']['id'],
                        'module2'   => 'detail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	//资讯详情页面
	}elseif($action == "news-detail"){

		$detailHandels = new handlers($service, "newsDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				detailCheckCity("homemaking", $detailConfig['id'], $detailConfig['cityid'], "news-detail");

                //更新阅读次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__car_news` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	//列表
	}elseif($action == 'list'){
		$huoniaoTag->assign('store', $store);
		$huoniaoTag->assign('usertype', $usertype);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('brand', $id);
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('homemakingtype', $homemakingtype);

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

		require(HUONIAOINC."/config/homemaking.inc.php");

		global $siteCityInfo;
		if(is_array($siteCityInfo)){
			$cityName = $siteCityInfo['name'];
		}

		$list_typename = str_replace('$city', $cityName, $customSeoTitle);
		if(!empty($id)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemaking_type` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['typename'];
			}
		}
		$huoniaoTag->assign('list_typename', $list_typename);
		$huoniaoTag->assign('list_id', $id);

	}elseif($action == 'wtsell'){
    	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_enturst` ");
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
        $huoniaoTag->assign('totalCount', $totalCount);
    }elseif($action == 'nanny'){
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('naturedesc', $naturedesc);
		$age = htmlspecialchars(RemoveXSS($_REQUEST['age']));
		$huoniaoTag->assign('age', $age);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('experience', $experience);
		$huoniaoTag->assign('orderby', $orderby);

		$salary = htmlspecialchars(RemoveXSS($_REQUEST['salary']));
		if(!empty($salary)){
			$salaryArr = explode(",", $salary);
			if(empty($salaryArr[0])){
				$loupan_seotitle .= ($salaryArr[1] >= 10 ? $salaryArr[1]/10 . "万" : $salaryArr[1] . "千") . "以下";
			}elseif(empty($priceArr[1])){
				$loupan_seotitle .= ($salaryArr[0] >= 10 ? $salaryArr[0]/10 . "万" : $salaryArr[0] . "千") . "以上";
			}elseif(!empty($priceArr[0]) && !empty($salaryArr[1])){
				$loupan_seotitle .= ($salaryArr[0] >= 10 ? $salaryArr[0]/10 . "万" : $salaryArr[0] . "千")."-".($salaryArr[1] >= 10 ? $salaryArr[1]/10 . "万" : $salaryArr[1] . "千");
			}
		}
		$huoniaoTag->assign('salary', $salary);
		$huoniaoTag->assign('salaryArr', $salaryArr);
	}elseif($action =="store"){
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('keywords', $keywords);
	}elseif ($action == "nanny-detail") {
		$huoniaoTag->assign('dopost', $dopost);
		//发布成功
        if (!empty($id)) {
            $huoniaoTag->assign("id", $id);
		}

		$detailHandels = new handlers($service, "nannyDetail");
		$detailConfig  = $detailHandels->getHandle($id);//print_R($detailConfig);die;
		if (is_array($detailConfig) && $detailConfig['state'] == 100) {
			$detailConfig = $detailConfig['info'];
			if (is_array($detailConfig)) {
				//输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_nanny` SET `click` = `click` + 1 WHERE `state` = 1 AND `id` = " . $id);
                $dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['userid']) {
                    $uphistoryarr = array(
                        'module'    => 'homemaking',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['userid'],
                        'module2'   => 'nannyDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;
	}elseif ($action == "nannydetail") {
		$huoniaoTag->assign('dopost', $dopost);
		//发布成功
        if (!empty($id)) {
            $huoniaoTag->assign("id", $id);
		}

		$detailHandels = new handlers($service, "nannyDetail");
		$detailConfig  = $detailHandels->getHandle($id);//print_R($detailConfig);die;
		if (is_array($detailConfig) && $detailConfig['state'] == 100) {
			$detailConfig = $detailConfig['info'];
			if (is_array($detailConfig)) {
				//输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_nanny` SET `click` = `click` + 1 WHERE `state` = 1 AND `id` = " . $id);
                $dsql->dsqlOper($sql, "update");

			}
		}
		return;
	}elseif($action == "search"){
		$huoniaoTag->assign("keywords", $keywords);

	//支付页面
	}elseif($action == "pay"){
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

			$detailHandels = new handlers("homemaking", "detail");

			foreach ($ordernumArr as $key => $value) {

				//获取订单内容
				$archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate`,`point` FROM `#@__homemaking_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
				$orderDetail  = $dsql->dsqlOper($archives, "results");
				if($orderDetail){

					$proid      = $orderDetail[0]['proid'];
					$procount   = $orderDetail[0]['procount'];
					$orderprice = $orderDetail[0]['orderprice'];
					$orderstate = $orderDetail[0]['orderstate'];


					//总价
					$totalAmount  = $orderDetail[0]['orderprice'];

					//验证订单状态，如果不是待付款状态则跳转至订单列表
					if($orderstate != 0){
						$param = array(
							"service"     => "member",
							"type"        => "user",
							"template"    => "order",
							"module"      => "homemaking"
						);
						$url = getUrlPath($param);
						header("location:".$url);
						die;
					}

					$proDetail  = $detailHandels->getHandle($proid);
					//获取商品详细信息
					if($proDetail && $proDetail['state'] == 100){
						$orderArr[$key]['title'] = $proDetail['info']['title'];
						$param = array(
							"service"  => "homemaking",
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
			$huoniaoTag->assign('ordertypename', "家政订单");
			$huoniaoTag->assign('orderArr', $orderArr);
			$huoniaoTag->assign('totalAmount', sprintf("%.2f", $totalAmount));



		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
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
			$archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'homemaking' AND `ordernum` = '$ordernum' AND `uid` = $userid");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$proArr = array();
				$isaddr = 0;
				$address = "";
				$i = 0;
				$ids = explode(",", $payDetail[0]['body']);

				foreach ($ids as $key => $value) {

					//查询订单详细信息
					$archives = $dsql->SetQuery("SELECT `id`, `proid`, `procount`, `orderprice`, `useraddr`, `username`, `usercontact` FROM `#@__homemaking_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
					$orderDetail  = $dsql->dsqlOper($archives, "results");
					if($orderDetail){
						$orderDetail = $orderDetail[0];

						//查询商品信息
						$archives = $dsql->SetQuery("SELECT `id`, `title`, `homemakingtype` FROM `#@__homemaking_list` WHERE `id` = ".$orderDetail['proid']);
						$detail  = $dsql->dsqlOper($archives, "results");
						if($detail){
							$detail = $detail[0];

							$proArr[$i]['title'] = $detail['title'];
							$proArr[$i]['id']    = $orderDetail['id'];
							$proArr[$i]['count'] = $orderDetail['procount'];
							$proArr[$i]['price'] = $orderDetail['orderprice'];

							$param = array(
								"service"  => "homemaking",
								"template" => "detail",
								"id"       => $detail['id']
							);
							$proArr[$i]['url'] = getUrlPath($param);

							$i++;

							/* if($detail['tuantype'] == 2){
								$isaddr = 1;
								$address = $orderDetail['username']."，".$orderDetail['useraddr']."，".$orderDetail['usercontact'];
							} */

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

		//获取分类
		if($action == "type"){
			$param['type']     = $type;
			$param['page']     = $page;
			$param['pageSize'] = $pageSize;
			$param['son']      = '0';

		//数据列表
		}else{
			//如果是列表页面，则获取地址栏传过来的typeid
			if($template == "list" && !$typeid){
				global $typeid;
			}
			$param = array();
			$param['typeid']      = $typeid;

			$param['page']        = $page;
			$param['pageSize']    = $pageSize;

		}

		$moduleReturn  = $moduleHandels->getHandle($params);
		if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';

		//只返回数据统计信息
		if($pageData == 1){
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
				$pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
			}else{
				$moduleReturn  = $moduleReturn['info'];  //返回数据
				$pageInfo_ = $moduleReturn['pageInfo'];
			}
			$smarty->block_data[$dataindex] = array($pageInfo_);
		}else{
			$moduleReturn  = $moduleReturn['info'];  //返回数据
			$pageInfo_ = $moduleReturn['pageInfo'];
			if($pageInfo_){
				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];
				//把pageInfo定义为global变量
				global $pageInfo;
				$pageInfo = $pageInfo_;
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
