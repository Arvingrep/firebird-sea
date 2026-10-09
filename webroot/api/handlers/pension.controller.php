<?php

/**
 * huoniaoTag模板标签函数插件-养老模块
 *
 * @param $params array 参数集
 * @return array
 */
function pension($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "pension";
	if(empty($action)) return '';

	global $template;
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;
	global $langData;
	global $cfg_pointPension;
	$huoniaoTag->assign('cfg_pointPension', $cfg_pointPension);

	$userid = $userLogin->getMemberID();

	if($action == 'allComment' || $action == 'comment' || $action == "storeDetail" || $action == "store-detail" || $action == "store-profile" || $action == "store-price" || $action == "store-album"){
		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				global $template;
				if($template != 'config'){
					detailCheckCity("pension", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				if($action == "store-detail"){
					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__pension_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "results");
					$uid = $userLogin->getMemberID();
					if($uid >0 && $uid!=$detailConfig['userid']){
					    $uphistoryarr = array(
					        'module'  => 'pension',
					        'uid'     => $uid,
					        'aid'     => $id,
					        'fuid'    => $detailConfig['userid'],
					        'module2' => 'storeDetail',
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
			$huoniaoTag->assign('catid', (int)$catid);
			$huoniaoTag->assign('storeId', $id);
			$huoniaoTag->assign('type', $type);
		}else{
			if($action == "store-detail"){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

            }
		}
	}elseif($action == "fabu"){//会员中心发布

		if($type == "albums"){//相册
			$act = "albumsDetail";
		}elseif($type == "elderly"){//老人
			$id = 1;
			$act = "elderlyDetail";
		}
		if($id){
			$detailHandels = new handlers($service, $act);
			if($type == "elderly"){
				$detailConfig  = $detailHandels->getHandle();
			}else{
				$detailConfig  = $detailHandels->getHandle($id);
			}
			$state = 0;
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$state = 1;
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}
				}
				$huoniaoTag->assign('pensionState', $state);
			}else{
				if($type != "elderly"){
					header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
					die;
				}
			}
		}

	}elseif($action == "elderly-detail"){
		
		$actionArr = explode('-', $action);
		$act = $actionArr[0] . 'Detail';
		$tab = 'pension_' . $actionArr[0];

		$detailHandels = new handlers($service, $act);
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;
				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['userid']){
                    $uphistoryarr = array(
                        'module'  => 'pension',
                        'uid'     => $uid,
                        'aid'     => $id,
                        'fuid'    => $detailConfig['userid'],
                        'module2' => $act,
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
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == 'list'){
		//addrid-business-targetcare-rzmaxprice-monthmaxprice-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$targetcare= (int)$data[2];
			$rzmaxprice= $data[3];
			$monthmaxprice= $data[4];
			$keywords  = $data[5];
			$page      = (int)$data[6];
		}
		// print_R($catid);exit;
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('targetcare', $targetcare);
		$huoniaoTag->assign('rzmaxprice', $rzmaxprice);
		$huoniaoTag->assign('monthmaxprice', $monthmaxprice);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('keywords', $keywords);

		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);
		return;
		
	}elseif($action == 'award'){

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		$sql = $dsql->SetQuery("SELECT `title`, `id`, `awarddesc` FROM `#@__pension_store` WHERE `id` = '$id'");
		$res = $dsql->dsqlOper($sql, "results");
		if(!empty($res[0]['id'])){

			$detailHandels = new handlers($service, 'elderlyDetail');
			$detailConfig  = $detailHandels->getHandle();
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){//print_R($detailConfig);exit;
					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}
				}
			}else{
				$param = array(
					"service" => "member",
					"type"    => "user",
					"template" => "fabu-pension-elderly",
				);
				$url = getUrlPath($param);

				header("location:".$url);
			}

			$huoniaoTag->assign('awarddesc', $res[0]['awarddesc']);
			$huoniaoTag->assign('storeId', $id);
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == 'search'){
		$huoniaoTag->assign('keywords', $keywords);
	}elseif($action == "store"){
		//catid-addrid-business-typeid-targetcare-roomtype-bednums-servicecontent-tag-visitday-award-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);
			$catid     = (int)$data[0];
			$addrid    = (int)$data[1];
			$business  = (int)$data[2];
			$typeid    = (int)$data[3];
			$targetcare= (int)$data[4];
			$roomtype  = (int)$data[5];
			$bednums   = $data[6];
			$price     = $data[7];
			$servicecontent  = (int)$data[8];
			$tag       = (int)$data[9];
			$visitday  = (int)$data[10];
			$award     = (int)$data[11];
			$keywords  = $keywords ? $keywords : $data[12];
			$page      = (int)$data[13];
		}
		// print_R($catid);exit;
		$huoniaoTag->assign('catid', $catid);
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('targetcare', $targetcare);
		$huoniaoTag->assign('roomtype', $roomtype);
		$huoniaoTag->assign('bednums', $bednums);
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('servicecontent', $servicecontent);
		$huoniaoTag->assign('tag', $tag);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('visitday', $visitday);
		$huoniaoTag->assign('award', $award);
		$huoniaoTag->assign('keywords', $keywords);

		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);
		return;
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
