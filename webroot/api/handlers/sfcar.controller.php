<?php

/**
 * huoniaoTag模板标签函数插件-圈子模块
 *
 * @param $params array 参数集
 * @return array
 */
function sfcar($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
	$service = "sfcar";
	if(empty($action)) return '';
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $customhot;

	if($action == "list"){
		$huoniaoTag->assign("endaddr", $endaddr);
		$huoniaoTag->assign("startaddr", $startaddr);
		if ($type == 1) {

			$ttype = 0;
		}else{
			$ttype = 1;
		}
		$huoniaoTag->assign("ttype", $ttype);
		$huoniaoTag->assign("type", (int)$type);
		$huoniaoTag->assign("cartype", (int)$cartype);
		$huoniaoTag->assign("orderby", (int)$orderby);
	}elseif($action == "detail"){
        global $isUserEdit;
        $isUserEdit = $realServer;
		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);//echo"<pre>";print_R($detailConfig);die;
		if (is_array($detailConfig) && $detailConfig['state'] == 100) {
			$detailConfig = $detailConfig['info'];
			if (is_array($detailConfig)) {

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0 && $detailConfig['userid'] != $uid){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}
				}

				//输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

                //更新阅读次数，已转移到sfcar.class的detail接口中，考虑到APP端原生后，不再经过controller
                // $sql = $dsql->SetQuery("UPDATE `#@__sfcar_list` SET `onclick` = `onclick` + 1 WHERE `state` = 1 AND `id` = " . $id);
                // $dsql->dsqlOper($sql, "update");

                // $uid = $userLogin->getMemberID();
                // if($uid >0 && $uid!=$detailConfig['userid']) {
                //     $uphistoryarr = array(
                //         'module'    => $service,
                //         'uid'       => $uid,
                //         'aid'       => $id,
                //         'fuid'      => $detailConfig['userid'],
                //         'module2'   => 'detail',
                //     );
                //     /*更新浏览足迹表   */
                //     updateHistoryClick($uphistoryarr);
                // }

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	}elseif($action == "fabu"){//会员中心发布
		if($id){
			$detailHandels = new handlers($service, 'detail');

			$detailConfig  = $detailHandels->getHandle($id);
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

	}elseif($action == "fabusuccess"){

		$huoniaoTag->assign('module', $service);
		$huoniaoTag->assign('id', $id);

	}elseif($action == "pay"){
		// echo "<pre>";
		// var_dump($_REQUEST);die;
		$param = array("service" => "sfcar");
        if(empty($ordernum)){
            header("location:".getUrlPath($param));
            die;
        }
        $huoniaoTag->assign('totalAmount', $amount);
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('aid', $aid);
        $huoniaoTag->assign('act', $act);
        // var_dump($ordertype);die;
        $huoniaoTag->assign('ordertype', $ordertype);
        $huoniaoTag->assign('module', $module);
        $huoniaoTag->assign('ordernum', $ordernum);
	}




	$huoniaoTag->assign('customhot', $customhot);
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

		//获取分类
		if($action == "type" || $action == "addr"){
			$param['son'] = $son ? $son : 0;

		//信息列表
		}elseif($action == "alist"){
			//如果是列表页面，则获取地址栏传过来的typeid
			if($template == "list" && !$typeid){
				global $typeid;
			}
			!empty($typeid) ? $param['typeid'] = $typeid : "";

		}

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

		//正常返回
		}else{

			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';
			$moduleReturn  	= $moduleReturn['info'];  //返回数据
			$pageInfo_ 		= $moduleReturn['pageInfo'];
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

	if($action=="type"){
		//print_r($smarty->block_data[$dataindex]);die;
	}

	//一条数据出栈，并把它指派给$return，重复执行开关置位1
	if(list($key, $item) = each($smarty->block_data[$dataindex])){
		if($action == "type"){
			//print_r($item);die;
		}
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
