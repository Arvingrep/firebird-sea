<?php

/**
 * huoniaoTag模板标签函数插件-自助建站模块
 *
 * @param $params array 参数集
 * @return array
 */
function website($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
	$service = "website";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;


	//模板
	if($template == "templates"){

		if(!empty($typeid)){
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `parentid`, `typename` FROM `#@__website_temptype` WHERE `id` = $typeid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('typename', $ret[0]['typename']);
				$huoniaoTag->assign('id', $id);
			}
		}

		$huoniaoTag->assign('typeid', (int)$typeid);
		$huoniaoTag->assign('page', (int)$page);
		$huoniaoTag->assign('keywords', $keywords);


	//站点详细
	}elseif($action == "storeDetail"){

		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		$state = 0;

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

			}
			$huoniaoTag->assign('storeState', $state);

		}
		return;



	//发布信息
	}elseif($action == "fabu"){

		//输出分类字段内容
		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid != -1){

			$storeid = 0;
			$parentTypeid = 0;
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$storeid = $ret[0]['id'];
			}


			//修改信息
			if($id){

				if($act == "news"){
					$detailHandels = new handlers($service, "newsDetail");
					$detailConfig  = $detailHandels->getHandle($id);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){

							if($storeid != $detailConfig['website']){
								header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
								die;
							}
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('detail_'.$key, $value);
							}
						}
					}else{
						header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
						die;
					}

				}elseif($act == "product"){
					$detailHandels = new handlers($service, "productDetail");
					$detailConfig  = $detailHandels->getHandle($id);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){

							if($storeid != $detailConfig['website']){
								header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
								die;
							}
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('detail_'.$key, $value);
							}
						}
					}else{
						header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
						die;
					}

				}elseif($act == "job"){
					$detailHandels = new handlers($service, "getTouchInfoDetail");
					$detailConfig  = $detailHandels->getHandle(array("id" => $id, "u" => 1));

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){

							if($storeid != $detailConfig['website']){
								header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
								die;
							}
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('detail_'.$key, $value);
							}
						}
					}else{
						header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
						die;
					}
				
				}

			}

			$huoniaoTag->assign('storeid', $storeid);

		}

	
	}

	// 移动端
	if(isMobile() && empty($smarty)){
		global $id;
		$id = (int)$id;
		$sid = (int)$sid;
		$huoniaoTag->assign('id', $id);
		if($id){

			$param = array(
				"service"      => "website",
				"template"     => "site".$id
			);
			$url = getUrlPath($param);

			$detail = array();
			$pcConfig = array();

			// 站点配置
			$sql = $dsql->SetQuery("SELECT * FROM `#@__website` WHERE `id` = $id AND `state` = 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$pcConfig['title'] = $ret[0]['title'];
				$pcConfig['description'] = $ret[0]['note'];
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?v=1');
				die;
			}

			$action_arr = explode('?', $action);
			$action = $action_arr[0];
			if($sid && substr($action, -1, 1) == "d"){
				$action_ = substr($action, 0, -1);
			}else{
				$action_ = $action;
			}
			if($action_ != "index" && $action_ != "product" && $action_ != "honor" && $action_ != "news" && $action_ != "job" && $action_ != "contact" && $action_ != "qj"){
				$sql = $dsql->SetQuery("SELECT * FROM `#@__website_touch` WHERE `website` = $id AND `alias` = '$action_'");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$detail = $ret[0];
				}else{
					header("location:".$url);
					// header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?v=2');
					die;
				}
			}
			
			$detail['url'] = $url;

			if($action == "index"){
				// 获取自定义导航
				$sql = $dsql->SetQuery("SELECT `id`, `alias`, `title`, `icon`, `jump`, `jump_url` FROM `#@__website_touch` WHERE `website` = $id AND `sys` = 0 ORDER BY `id`");
				$ret = $dsql->dsqlOper($sql, "results");
				$list = array();
				if($ret){
					foreach ($ret as $key => $value) {
						$list[$key]['id'] = $value['id'];
						$list[$key]['title'] = $value['title'];
						$list[$key]['icon'] = $value['icon'] ? getFilePath($value['icon']) : "";

						// if($value['jump']){
						// 	$url = $value['jump_url'];
						// }else{
						// 	$url = $detail['url']."/".$value['alias'].".html";
						// }
						$list[$key]['url'] = $value['jump_url'];
					}
				}
				$huoniaoTag->assign('navList', $list);

				//验证是否已经收藏
				$params = array(
					"module" => "website",
					"temp"   => "detail",
					"type"   => "add",
					"id"     => $id,
					"check"  => 1
				);
				$collect = checkIsCollect($params);
				$detail['collect'] = $collect == "has" ? 1 : 0;

			}elseif($action == "productd"){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__website_product` WHERE `id` = $sid AND `website` = $id");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach ($results[0] as $key => $value) {
						$huoniaoTag->assign("detail_".$key, $value);
					}

					$sql = $dsql->SetQuery("UPDATE `#@__website_product` SET `click` = `click` + 1 WHERE `id` = $sid");
					$dsql->dsqlOper($sql, "update");
				}else{
					header("location:".$detail['url']);
					die;
				}
			}elseif($action == "newsd"){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__website_article` WHERE `id` = $sid AND `website` = $id");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach ($results[0] as $key => $value) {
						$huoniaoTag->assign("detail_".$key, $value);
					}

					$sql = $dsql->SetQuery("UPDATE `#@__website_product` SET `click` = `click` + 1 WHERE `id` = $sid");
					$dsql->dsqlOper($sql, "update");
				}else{
					header("location:".$detail['url']);
					die;
				}
			}elseif($action_ != $action && $sid){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__website_touch_info` WHERE `id` = $sid AND `website` = $id");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){

					$type_arr = array(
						'd_type' => '职位类别',
						'd_sex' => "性别",
						'd_nature' => '职位性质',
						'd_number' => '招聘人数',
						'd_addr' => '工作地点',
						'd_experience' => '工作经验',
						'd_educational' => '学历要求',
						'd_language' => '语言能力',
						'd_salary' => '薪资范围',
						'd_claim' => '职位描述',
						'd_note' => '职位要求',
						'd_tel' => '联系电话',
						'd_email' => '联系邮箱',
					);

					foreach ($results[0] as $key => $value) {
						if($results[0]['type'] == 'job' && $key == 'body'){
							$value = empty($value) ? array() : unserialize($value);
							if(isset($value['d_sex'])){
								$value['d_sex'] = $value['d_sex'] == 0 ? "不限" : ($value['d_sex'] == 1 ? "男" : "女");
							}
							foreach ($value as $k => $v) {
								if(!isset($type_arr[$k]) || $v == ""){
									unset($value[$k]);
								}
							}
						}
						$huoniaoTag->assign("detail_".$key, $value);
					}

					

					$huoniaoTag->assign('type_arr', $type_arr);

					$sql = $dsql->SetQuery("UPDATE `#@__website_touch_info` SET `click` = `click` + 1 WHERE `id` = $sid");
					$dsql->dsqlOper($sql, "update");
				}else{
					header("location:".$detail['url']);
					die;
				}
			}

			// print_r($detail);
			$detail = array_merge($pcConfig, $detail);
			$huoniaoTag->assign('detail', $detail);

			// 关于我们
			$sql = $dsql->SetQuery("SELECT * FROM `#@__website_touch` WHERE `website` = $id AND `alias` = 'about'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('about', $ret[0]['body']);
			}


			// 商家详情
			$business = array();
			$sql = $dsql->SetQuery("SELECT b.`id` FROM `#@__business_list` b LEFT JOIN `#@__website` w ON w.`userid` = b.`uid` WHERE w.`id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$businessHandlers = new handlers("business", "storeDetail");
				$businessConfig = $businessHandlers->getHandle($ret[0]['id']);
				if(is_array($businessConfig) && $businessConfig['state'] != 200 && $businessConfig['state'] != 102){
					$business = $businessConfig['info'];
				}else{
					header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
					die;
				}
			}
			$huoniaoTag->assign('business', $business);

			// 视频、全景
			if($action == "index" || $action == "qj"){
				$website_qj = $website_video = $website_banner = array();
				$where = $action == "index" ? "`type` = 'video' || `type` = 'qj' || `type` = 'banner'" : "`type` = 'qj'";

				$sql = $dsql->SetQuery("SELECT * FROM `#@__website_touch_info` WHERE `website` = '$id' AND (".$where.")");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $k => $v) {
						if($v['type'] == "video"){
							if($v['litpic'] && $v['body']){
								$website_video = array(
									"litpic" => getFilePath($v['litpic']),
									"file" => getFilePath($v['body']),
									"source" => $v['body']
								);
							}
						}
						if($v['type'] == "qj"){
							if($v['body']){
								$website_qj = array(
									"type" => $v['date'] ? 1 : 0,
									"file" => $v['body'],
									"source" => $v['body']
								);
							}
						}
						if($v['type'] == "banner"){
							if($v['body']){
								$body = explode(',', $v['body']);
								foreach ($body as $k => $v) {
									$website_banner[$k] = array(
										"file" => getFilePath($v),
										"source" => $v
									);
								}
							}
						}
					}
				}

				$huoniaoTag->assign('website_qj',$website_qj);
				$huoniaoTag->assign('website_video',$website_video);
				$huoniaoTag->assign('website_banner',$website_banner);

			}
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
