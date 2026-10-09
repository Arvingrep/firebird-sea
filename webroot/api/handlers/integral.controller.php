<?php

/**
 * huoniaoTag模板标签函数插件-商城模块
 *
 * @param $params array 参数集
 * @return array
 */
function integral($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "integral";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;

	$userid = $userLogin->getMemberID();
	$furl = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);


	//商品列表
	if($action == "list"){

		$seo_title = array();

		$typename = "";


		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		//面包屑
		$toptypename = $typename = "全部分类";
		$typeArr = array();
		if($typeid){
			global $data;
			$data = "";
			$typeArr = getParentArr("integral_type", $typeid);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));

			$toptypename = $typeArr[0];
			$typename = $typeArr[count($typeArr)-1];

			global $data;
			$data = "";
			$typeIds = getParentArr("integral_type", $typeid);
			$typeIds = array_reverse(parent_foreach($typeIds, "id"));

			$toptypeid = $typeIds[0];
		}
		$crumbs = array();
		foreach ($typeArr as $key => $value) {
			$param = array(
				"service"     => $service,
				"template"    => "list",
				"param"       => "typeid=".$typeIds[$key]
			);
			$url = getUrlPath($param);
			$crumbs[] = array("typename" => $value, "url" => $url);
		}
		$huoniaoTag->assign('list_crumbs', $crumbs);

		$huoniaoTag->assign("typeid", (int)$typeid);
		$huoniaoTag->assign("toptypeid", (int)$toptypeid);
		$huoniaoTag->assign("toptypename", $toptypename);
		$huoniaoTag->assign("typename", $typename);
		$huoniaoTag->assign("keywords", $keywords);
		$huoniaoTag->assign("paytype", $paytype);
		if(!empty($point)){
			$huoniaoTag->assign("point", $point);
		}




	// 商品详情
	}elseif($action == "detail"){
		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				detailCheckCity("integral", $detailConfig['id'], $detailConfig['cityid']);

				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}else{
				$param = array(
					"service" => "integral",
					"template" => "index"
				);
				$url = getUrlPath($param);
				header("location:$url");
				die;
			}
		}else{
			$param = array(
				"service" => "integral",
				"template" => "index"
			);
			$url = getUrlPath($param);
			header("location:$url");
			die;
		}

		//面包屑
		$typeArr = array();
		$typeid = $detailConfig['typeid'];
		if($typeid){
			global $data;
			$data = "";
			$typeArr = getParentArr("integral_type", $typeid);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));

			$toptypename = $typeArr[0];

			global $data;
			$data = "";
			$typeIds = getParentArr("integral_type", $typeid);
			$typeIds = array_reverse(parent_foreach($typeIds, "id"));

			$toptypeid = $typeIds[0];
		}
		$crumbs = array();
		foreach ($typeArr as $key => $value) {
			$param = array(
				"service"     => $service,
				"template"    => "list",
				"param"       => "typeid=".$typeIds[$key]
			);
			$url = getUrlPath($param);
			$crumbs[] = array("typename" => $value, "url" => $url);
		}
		$huoniaoTag->assign('list_crumbs', $crumbs);

	// 确认订单
	}elseif($action == "confirm-order"){
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			header("location:/login.html?furl=".$furl);
			die;
		}

		$id = (int)$id;
		$count = (int)$count;

		if(empty($id) || empty($count)){
			$param = array(
				"service" => "integral",
				"template" => "index"
			);
			$url = getUrlPath($param);
			header("location:$url");
			die;
		}

		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}else{
				$param = array(
					"service" => "integral",
					"template" => "index"
				);
				$url = getUrlPath($param);
				header("location:$url");
				die;
			}
		}else{
			$param = array(
				"service" => "integral",
				"template" => "index"
			);
			$url = getUrlPath($param);
			header("location:$url");
			die;
		}

		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('count', $count > $detailConfig['inventory'] ? $detailConfig['inventory'] : $count);
		$huoniaoTag->assign('paytype', $paytype);

	// 支付
	}elseif($action == "pay"){
		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		if($ordernum){
			$sql = $dsql->SetQuery("SELECT * FROM `#@__integral_order` WHERE `ordernum` = '$ordernum'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$huoniaoTag->assign('ordernum', $ordernum);
				$order = $ret[0];

				foreach ($order as $key => $value) {
					$huoniaoTag->assign($key, $value);
				}

				$totalAmount = $order['price'] * $order['count'] + $order['freight'];
				$huoniaoTag->assign('totalAmount', $totalAmount);
				$huoniaoTag->assign('totalBalance', $order['point'] * $order['count']);

			}else{
				header('location:/404.html');
				die;
			}
		}else{
			header('location:/404.html');
			die;
		}

	// 支付完成
	}elseif($action == "payreturn"){
		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'integral' AND `ordernum` = '$ordernum' AND `uid` = $userid");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$state = $payDetail[0]['state'];

				// 待支付或待发货
				if($state == 0 || $state == 1){
					$sql = $dsql->SetQuery("SELECT * FROM `#@__integral_order` WHERE `ordernum` = '".$ordernum."'");
					$ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $ret = $ret[0];
                        foreach ($ret as $key => $value) {
                            $huoniaoTag->assign('order_'.$key, $value);
                        }
                    }
					$id = $ret['id'];
					$proid = $ret['proid'];
					$param = array(
						"service" => "member",
						"type" => "user",
						"template" => "orderdetail",
						"module" => "integral",
						"id" => $id
					);
					$url = getUrlPath($param);
					$huoniaoTag->assign("state", $state);
					$huoniaoTag->assign("orderurl", $url);

					$huoniaoTag->assign("ordernum", $ordernum);

					$detailHandels = new handlers($service, "detail");
					$detailConfig  = $detailHandels->getHandle($proid);
					$detailConfig  = $detailConfig['info'];
					if(is_array($detailConfig)){
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('detail_'.$key, $value);
						}
					}
				}else{
					$param = array(
						"service" => "member",
						"type" => "user",
						"template" => "order",
						"module" => "integral"
					);
					$url = getUrlPath($param);
					header("location:$url");
				}
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