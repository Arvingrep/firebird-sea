<?php

/**
 * huoniaoTag模板标签函数插件-专题模块
 *
 * @param $params array 参数集
 * @return array
 */
function special($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "special";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;

	//列表
	if($template == "list"){

		if(!empty($id)){

			$typename = "";
			$sql = $dsql->SetQuery("SELECT `parentid`, `typename` FROM `#@__special_type` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$parentid = $ret[0]['parentid'];
				$huoniaoTag->assign('parentid', $parentid);
				$huoniaoTag->assign('typename', $ret[0]['typename']);
				$huoniaoTag->assign('page', (int)$page);
				$huoniaoTag->assign('id', $id);

				$hasParent = 0;
				if($parentid == 0){
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__special_type` WHERE `parentid` = $id");
					$hasParent = $dsql->dsqlOper($sql, "totalCount");
				}else{
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__special_type` WHERE `parentid` = $parentid");
					$hasParent = $dsql->dsqlOper($sql, "totalCount");
				}
				$huoniaoTag->assign('hasParent', $hasParent);


			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}


		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}


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
