<?php

/**
 * huoniaoTag模板标签函数插件-汽车模块
 *
 * @param $params array 参数集
 * @return array
 */
function car($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "car";
	if(empty($action)) return '';

	global $template;
	global $dsql;
	global $huoniaoTag;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;
	if($action == "storeDetail" || $action == "store-detail"||$action == "store-list"){
		if ($csid) {
			$id=$csid;
		}
		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
			if(is_array($detailConfig)){

				global $template;
				if($template != 'config'){
					detailCheckCity("car", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				//更新浏览次数
                if($id){
                    $sql = $dsql->SetQuery("UPDATE `#@__car_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "results");//print_R($detailConfig);exit;
                }
                
                $uid = $userLogin->getMemberID();
				// echo "<pre>";
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

			}
			$huoniaoTag->assign('store', (int)$store);
			$huoniaoTag->assign('usertype', (int)$usertype);
            $huoniaoTag->assign('firstword', substr(trim($firstword), 0, 1));
			$huoniaoTag->assign('keywords', htmlspecialchars(strip_tags(trim($keywords))));
			$huoniaoTag->assign('level', (int)$level);
			$huoniaoTag->assign('year', (int)$year);
			$huoniaoTag->assign('gearbox', (int)$gearbox);
			$huoniaoTag->assign('mileage', $mileage);
			$huoniaoTag->assign('standard', (int)$standard);
			$huoniaoTag->assign('internalsetting', (int)$internalsetting);
			$huoniaoTag->assign('color', htmlspecialchars(strip_tags(trim($color))));
			$huoniaoTag->assign('orderby', (int)$orderby);
			$huoniaoTag->assign('fueltype', (int)$fueltype);

			$price = RemoveXSS($_GET['price']);
            $emissions = RemoveXSS($_GET['emissions']);

            if(!empty($price)){
                $priceArr = explode(",", $price);
                $price0 = (float)$priceArr[0];
                $price1 = (float)$priceArr[1];
                if(empty($price0)){
                    $loupan_seotitle .= ($price1 >= 10 ? $price1/10 . "万" : $price1 . "千") . "以下";
                }elseif(empty($price1)){
                    $loupan_seotitle .= ($price0 >= 10 ? $price0/10 . "万" : $price0 . "千") . "以上";
                }elseif(!empty($price0) && !empty($price1)){
                    $loupan_seotitle .= ($price0 >= 10 ? $price0/10 . "万" : $price0 . "千")."-".($price1 >= 10 ? $price1/10 . "万" : $price1 . "千");
                }
                $price = $price0.','.$price1;
                $priceArr = array($price0, $price1);
            }

            if(!empty($emissions)){
                $emissionsArr = explode(",", $emissions);
                $emissions0 = (float)$emissionsArr[0];
                $emissions1 = (float)$emissionsArr[1];
                $emissions = $emissions0.','.$emissions1;
            }

            $huoniaoTag->assign('emissions', $emissions);

			$huoniaoTag->assign('price', $price);
			$huoniaoTag->assign('priceArr', $priceArr);
			$huoniaoTag->assign('typeid', $type);
			$huoniaoTag->assign('brand', (int)$brand);
			require(HUONIAOINC."/config/car.inc.php");
			$list_typename = $customSeoTitle;
			if(!empty($id)){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_brandtype` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$list_typename = $results[0]['typename'];
				}
			}
			$huoniaoTag->assign('list_typename', $list_typename);

			$flags = htmlspecialchars(RemoveXSS($_REQUEST['flags']));
			// var_dump($flags);die;
			$flagArr = explode(",", $flags);
			$newFlag = array();
			foreach ($flagArr as $key => $value) {
				if($value !== ""){
					array_push($newFlag, $value);
				}
			}
			$flag = join(",", $newFlag);
			$huoniaoTag->assign('flags', $flags);
			$huoniaoTag->assign('flagArr', $newFlag);






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
	}elseif($action == "detail" || $action == "configure"){
		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);//echo"<pre>";print_R($detailConfig);die;
		if (is_array($detailConfig) && $detailConfig['state'] == 100) {
			$detailConfig = $detailConfig['info'];
			if (is_array($detailConfig)) {

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0 && $detailConfig['user']['userid'] != $uid){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}
				}

				//输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                //更新阅读次数
                $sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `click` = `click` + 1 WHERE `state` = 1 AND `id` = " . $id);
                $dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['userid']) {
                    $uphistoryarr = array(
                        'module'    => 'car',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['userid'],
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

				detailCheckCity("car", $detailConfig['id'], $detailConfig['cityid'], "news-detail");

                //更新阅读次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__car_news` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 ) {
                    $uphistoryarr = array(
                        'module'    => 'car',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => '',
                        'module2'   => 'newsDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

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
		// if ($usertype=="0") {
		// 	$huoniaoTag->assign('usertype', $usertype);
		// }
		$huoniaoTag->assign('store', (int)$store);
		$huoniaoTag->assign('usertype', (int)$usertype);
		$huoniaoTag->assign('firstword', substr(trim($firstword), 0, 1));
		$huoniaoTag->assign('keywords', htmlspecialchars(strip_tags(trim($keywords))));
		$huoniaoTag->assign('level', (int)$level);
		$huoniaoTag->assign('year', (int)$year);
		$huoniaoTag->assign('gearbox', (int)$gearbox);
		$huoniaoTag->assign('mileage', $mileage);
		$huoniaoTag->assign('standard', (int)$standard);
		$huoniaoTag->assign('internalsetting', (int)$internalsetting);
        $huoniaoTag->assign('color', htmlspecialchars(strip_tags(trim($color))));
		$huoniaoTag->assign('orderby', (int)$orderby);
		$huoniaoTag->assign('fueltype', (int)$fueltype);
		$price = RemoveXSS($_GET['price']);
		$emissions = RemoveXSS($_GET['emissions']);

		if(!empty($price)){
			$priceArr = explode(",", $price);
            $price0 = (float)$priceArr[0];
            $price1 = (float)$priceArr[1];
			if(empty($price0)){
				$loupan_seotitle .= ($price1 >= 10 ? $price1/10 . "万" : $price1 . "千") . "以下";
			}elseif(empty($price1)){
				$loupan_seotitle .= ($price0 >= 10 ? $price0/10 . "万" : $price0 . "千") . "以上";
			}elseif(!empty($price0) && !empty($price1)){
				$loupan_seotitle .= ($price0 >= 10 ? $price0/10 . "万" : $price0 . "千")."-".($price1 >= 10 ? $price1/10 . "万" : $price1 . "千");
			}
            $price = $price0.','.$price1;
            $priceArr = array($price0, $price1);
		}

        if(!empty($emissions)){
			$emissionsArr = explode(",", $emissions);
            $emissions0 = (float)$emissionsArr[0];
            $emissions1 = (float)$emissionsArr[1];
            $emissions = $emissions0.','.$emissions1;
		}

		$huoniaoTag->assign('emissions', $emissions);

		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);
		$huoniaoTag->assign('typeid', (int)$type);
		$huoniaoTag->assign('typeeeid',(int)$typeeeid);
        if($id){
            $huoniaoTag->assign('brand', (int)$id);
        }else{

            $huoniaoTag->assign('brand', (int)$brand);
        }
		require(HUONIAOINC."/config/car.inc.php");
		$list_typename = $customSeoTitle;
		if(!empty($id)){
			$sql = $dsql->SetQuery("SELECT `typename`,`py` FROM `#@__car_brandtype` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['typename'];
				$firstword     = $results[0]['py'] ? strtoupper(substr($results[0]['py'], 0, 1)) : '';
                $huoniaoTag->assign('firstword', $firstword);
			}
            $huoniaoTag->assign('typeid', $id);
		}
		$huoniaoTag->assign('list_typename', $list_typename);

		$flags = htmlspecialchars(RemoveXSS($_REQUEST['flags']));
		// var_dump($flags);die;
		$flagArr = explode(",", $flags);
		$newFlag = array();
		foreach ($flagArr as $key => $value) {
			if($value !== ""){
				array_push($newFlag, $value);
			}
		}
		$flag = join(",", $newFlag);
		$huoniaoTag->assign('flags', $flags);
		$huoniaoTag->assign('flagArr', $newFlag);

	}elseif($action == 'wtsell'){
    	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_enturst` ");
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
        $huoniaoTag->assign('totalCount', $totalCount);
    }elseif($action == 'store'){
  //   	$sql = $dsql->SetQuery("SELECT `jc` FROM `#@__car_authattr` WHERE `id` IN (1,2)");
  //   	var_dump($sql);die;
		// $res = $dsql->dsqlOper($sql, "results");

    	$huoniaoTag->assign('addrid', (int)$addrid);
    	$huoniaoTag->assign('business', (int)$business);
		$huoniaoTag->assign('firstword', substr(trim($firstword), 0, 1));
		$huoniaoTag->assign('typeid', (int)$type);
		$huoniaoTag->assign('brand', (int)$brand);
		$huoniaoTag->assign('orderby', (int)$orderby);
		$huoniaoTag->assign('orderbymax', (int)$orderbymax);
		$huoniaoTag->assign('carstore', (int)$carstore);
		$huoniaoTag->assign('typeid', (int)$type);
		$flags = htmlspecialchars(RemoveXSS($_REQUEST['flags']));
		// var_dump($flags);die;
		$flagArr = explode(",", $flags);
		$newFlag = array();
		foreach ($flagArr as $key => $value) {
			if($value !== ""){
				array_push($newFlag, $value);
			}
		}
		$flag = join(",", $newFlag);
		$huoniaoTag->assign('flags', $flags);
		$huoniaoTag->assign('flagArr', $newFlag);


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
