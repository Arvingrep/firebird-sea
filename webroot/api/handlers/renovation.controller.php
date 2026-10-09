<?php

/**
 * huoniaoTag模板标签函数插件-装修模块
 *
 * @param $params array 参数集
 * @return array
 */
function renovation($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "renovation";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;

	$userid = $userLogin->getMemberID();


	//效果图列表
	if($action == "albums"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		$huoniaoTag->assign("typeid", (int)$type);
		$huoniaoTag->assign("style", (int)$style);
		$huoniaoTag->assign("kongjian", (int)$kongjian);
		$huoniaoTag->assign("jubu", (int)$jubu);
		$huoniaoTag->assign("units", (int)$units);
		$huoniaoTag->assign("apartment", (int)$apartment);
		$huoniaoTag->assign("comstyle", (int)$comstyle);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);


	//效果图详情
	}elseif ($action == "albums-detail") {

		$detailHandels = new handlers($service, "caseDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$sql = $dsql->SetQuery("UPDATE `#@__renovation_case` SET `click` = `click` + 1 WHERE `id` = ".$id);
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


	//效果图列表
	}elseif($action == "case"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		$huoniaoTag->assign("typeid", (int)$type);
		$huoniaoTag->assign("btype", (int)$btype);
		$huoniaoTag->assign("style", (int)$style);
		$huoniaoTag->assign("units", (int)$units);
		$huoniaoTag->assign("comstyle", (int)$comstyle);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);


	//案例详情
	}elseif ($action == "case-detail") {

		$detailHandels = new handlers($service, "diaryDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$sql = $dsql->SetQuery("UPDATE `#@__renovation_diary` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['author']['userid']) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['author']['userid'],
                        'module2'   => 'diaryDetail',
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


	//公司列表
	}elseif($action == "company"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		$huoniaoTag->assign("jiastyle", (int)$jiastyle);
		$huoniaoTag->assign("comstyle", (int)$comstyle);
		$huoniaoTag->assign("range", (int)$range);
		$huoniaoTag->assign("style", (int)$style);
		$huoniaoTag->assign("orderby", (int)$orderby);

		//日期
		$beginToday=mktime(0,0,0,date('m'),date('d'),date('Y'));
		$endToday=mktime(0,0,0,date('m'),date('d')+1,date('Y'))-1;

		$resesql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_rese` WHERE `pubdate`>$beginToday AND `pubdate`<= $endToday AND `resetype` =1");

		$totalCount = $dsql->dsqlOper($resesql,"totalCount");
		$huoniaoTag->assign("totalCount", (int)$totalCount);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);


	//公司详情
	}elseif ($action == "company-detail" || $action == "company-case" || $action == "company-albums" || $action == "company-team" || $action == "storeDetail" || $action =="company-profile" || $action =="company-dynamic" || $action =="company-site" || $action == "company-foreman" || $action =="company-order" || $action =="company-contact") {

        $id = (int)$id;

		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		$state = 0;

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];

			// var_dump($detailConfig);die;
			if(is_array($detailConfig)){

                if($id){
                    $sql = $dsql->SetQuery("UPDATE `#@__renovation_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "update");
                }
                
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

				$uid = $userLogin->getMemberID();
                if($uid >0 ) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => '',
                        'module2'   => 'storeDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
				//输出所有GET参数
				$pageParam = array();
                foreach($_GET as $key => $val){
                    $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
                    $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
                    $huoniaoTag->assign($key, $val);
                    if($key != "service" && $key != "template" && $key != "page"){
                        array_push($pageParam, $key."=".$val);
                    }
                }
				$huoniaoTag->assign("pageParam", join("&", $pageParam));

				$huoniaoTag->assign("typeid", (int)$type);
				$huoniaoTag->assign("style", (int)$style);
				$huoniaoTag->assign("kongjian", (int)$kongjian);
				$huoniaoTag->assign("jubu", (int)$jubu);
				$huoniaoTag->assign("units", (int)$units);
				$huoniaoTag->assign("apartment", (int)$apartment);
				$huoniaoTag->assign("comstyle", (int)$comstyle);
				$huoniaoTag->assign("btype", (int)$btype);
				$huoniaoTag->assign("comstyle", (int)$comstyle);

				//分页
				$page = (int)$page;
				$atpage = $page == 0 ? 1 : $page;
				global $page;
				$page = $atpage;
				$huoniaoTag->assign('page', $page);

			}
		}
		$huoniaoTag->assign('storeState', $state);


		require(HUONIAOINC."/config/renovation.inc.php");

		if($customUpload == 1){
			$huoniaoTag->assign('thumbSize', $custom_thumbSize);
			$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
			$huoniaoTag->assign('atlasSize', $custom_atlasSize);
			$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
		}

		$huoniaoTag->assign('atlasMax', (int)$custom_gs_atlasMax);

		return;


	//找我家
	}elseif($action == "zwj"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		$huoniaoTag->assign("addrid", (int)$addrid);
		$huoniaoTag->assign("business", (int)$business);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);
		return;


	//小区详情
	}elseif($action == "community") {

		if($id){
			$detailHandels = new handlers($service, "communityDetail");
			$detailConfig  = $detailHandels->getHandle($id);

			// echo '<pre>';
			// var_dump($detailConfig);die;
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					$sql = $dsql->SetQuery("UPDATE `#@__renovation_community` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "update");

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}


					//输出所有GET参数
					$pageParam = array();
                    foreach($_GET as $key => $val){
                        $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
                        $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
                        $huoniaoTag->assign($key, $val);
                        if($key != "service" && $key != "template" && $key != "page"){
                            array_push($pageParam, $key."=".$val);
                        }
                    }

					//日期
					$beginToday=mktime(0,0,0,date('m'),date('d'),date('Y'));
					$endToday=mktime(0,0,0,date('m'),date('d')+1,date('Y'))-1;

					$resesql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_rese` WHERE `pubdate`>$beginToday AND `pubdate`<= $endToday AND `resetype` =1");

					$totalCount = $dsql->dsqlOper($resesql,"totalCount");
					$huoniaoTag->assign("totalCount", (int)$totalCount);
					$huoniaoTag->assign("pageParam", join("&", $pageParam));

					$huoniaoTag->assign("typeid", (int)$type);
					$huoniaoTag->assign("btype", (int)$btype);
					$huoniaoTag->assign("id", (int)$id);
					$huoniaoTag->assign("style", (int)$style);
					$huoniaoTag->assign("units", (int)$units);
					$huoniaoTag->assign("comstyle", (int)$comstyle);

					//分页
					$page = (int)$page;
					$atpage = $page == 0 ? 1 : $page;
					global $page;
					$page = $atpage;
					$huoniaoTag->assign('page', $page);



				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
			return;
		}


	//设计师
	}elseif($action == "designer"){

        //对数据安全过滤
        if($works){
            $workArr = explode(",", $works);
            if($workArr){
                $work0 = (int)$workArr[0];
                $work1 = (int)$workArr[1];
                $works = $work0.",".$work1;
            }
        }

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));
		$huoniaoTag->assign("special", (int)$special);
		$huoniaoTag->assign("style", (int)$style);
		$huoniaoTag->assign("works", $works);
		$huoniaoTag->assign("orderby", (int)$orderby);
		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);


	//根据当前登录的企业会员ID，获取设计师
	}elseif($action == "getDesignerByEnter"){

		$designerArr = array();
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sid = $ret[0]['id'];

			$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `company` = ".$sid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
					$designerArr = $ret;
			}
		}
		$huoniaoTag->assign('designer', $designerArr);

	//设计师详情
	}elseif($action == "designer-detail" || $action =="designer-profile" || $action == "designer-case" || $action =="designer-article" || $action =="designer-order") {

		if($id){
			$detailHandels = new handlers($service, "teamDetail");
			$detailConfig  = $detailHandels->getHandle($id);

			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					$sql = $dsql->SetQuery("UPDATE `#@__renovation_team` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "update");
                    $uid = $userLogin->getMemberID();
                    if($uid >0 && $uid!=$detailConfig['userid']) {
                        $uphistoryarr = array(
                            'module'    => $service,
                            'uid'       => $uid,
                            'aid'       => $id,
                            'fuid'      => $detailConfig['userid'],
                            'module2'   => 'teamDetail',
                        );
                        /*更新浏览足迹表   */
                        updateHistoryClick($uphistoryarr);
                    }

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}

					//分页
					$page = (int)$page;
					$atpage = $page == 0 ? 1 : $page;
					global $page;
					$page = $atpage;
					$huoniaoTag->assign('page', $page);

				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
			return;
		}


	//装修攻略
	}elseif($action == "raiders-list"){

		if(!empty($id)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_newstype` WHERE `id` = ". $id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$huoniaoTag->assign('id', $id);
				$huoniaoTag->assign('typename', $ret[0]['typename']);

				//分页
				$page = (int)$page;
				$atpage = $page == 0 ? 1 : $page;
				global $page;
				$page = $atpage;
				$huoniaoTag->assign('page', $page);


			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//攻略详情
	}elseif($action == "raiders-detail"){

		if($id){
			$detailHandels = new handlers($service, "newsDetail");
			$detailConfig  = $detailHandels->getHandle($id);

			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);

					$sql = $dsql->SetQuery("UPDATE `#@__renovation_news` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "update");

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}

				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//招标
	}elseif($action == "zb"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		$huoniaoTag->assign("btype", (int)$btype);
		$huoniaoTag->assign("nature", (int)$nature);
		$huoniaoTag->assign("addrid", (int)$addrid);
		$huoniaoTag->assign("business", (int)$business);
		$huoniaoTag->assign("budget", (int)$budget);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		return;


	//招标详情
	}elseif($action == "zb-detail"){

		if($id){
			$detailHandels = new handlers($service, "zhaobiaoDetail");
			$detailConfig  = $detailHandels->getHandle($id);

			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					$sql = $dsql->SetQuery("UPDATE `#@__renovation_zhaobiao` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "update");

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}

				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	}elseif ($action == "foreman") {
		$huoniaoTag->assign("type1",   (int)$type);
		$huoniaoTag->assign("works",   $works);
		$huoniaoTag->assign("orderby", (int)$orderby);
		$huoniaoTag->assign("keywords",$keywords);
		$huoniaoTag->assign("addrid",  $addrid);
	}elseif ($action == "foreman-detail" || $action == "foreman-profile" || $action == "foreman-order" || $action == "foreman-case" || $action =="foreman-article") {

		$detailHandels = new handlers($service, "foremanDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$sql = $dsql->SetQuery("UPDATE `#@__renovation_foreman` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['userid']) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['userid'],
                        'module2'   => 'foremanDetail',
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


	//效果图列表
	}elseif($action == "foreman-article-detail"){
		if(is_numeric($id)){

			$articlesql = $dsql->SetQuery("SELECT * FROM `#@__renovation_article` WHERE `id` = ".$id);

			$articleres = $dsql->dsqlOper($articlesql,"results");

			if($articleres){
				$fid  = $articleres[0]['fid'];

				$detailHandels = new handlers($service, "foremanDetail");
				$detailConfig  = $detailHandels->getHandle($fid);
				if(is_array($detailConfig) && $detailConfig['state'] == 100){
					$detailConfig  = $detailConfig['info'];
					if(is_array($detailConfig)){

						$sql = $dsql->SetQuery("UPDATE `#@__renovation_foreman` SET `click` = `click` + 1 WHERE `id` = ".$id);
						$dsql->dsqlOper($sql, "update");

						//输出详细信息
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('detail_'.$key, $value);
						}

					}
				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
				}

				foreach ($articleres[0] as $k => $v) {
					if($k =="litpic"){
						$v = getFilePath($v);
					}
				$huoniaoTag->assign($k, $v);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	}elseif($action == "company-dynamic-detail") {
        if (is_numeric($id)) {

            $articlesql = $dsql->SetQuery("SELECT * FROM `#@__renovation_article` WHERE `id` = " . $id);

            $articleres = $dsql->dsqlOper($articlesql, "results");
            if ($articleres) {
                $type = $articleres[0]['type'];
                if ($type == 0) {

                    $sid = $articleres[0]['fid'];
                } elseif ($tyoe == 1) {
                    $foremansql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_foreman` WHERE `state` = 1");

                    $foremanres = $dsql->dsqlOper($foremansql, "results");

                    $sid = $foremanres[0]['company'];

                } else {

                    $teamsql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_team` WHERE `state` = 1");

                    $teamres = $dsql->dsqlOper($teamsql, "results");

                    $sid = $foremanres[0]['company'];

                }
                $detailHandels = new handlers($service, "storeDetail");
                $detailConfig = $detailHandels->getHandle($sid);
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    if (is_array($detailConfig)) {

                        $sql = $dsql->SetQuery("UPDATE `#@__renovation_article` SET `click` = `click` + 1 WHERE `id` = " . $id);
                        $dsql->dsqlOper($sql, "update");

                        //输出详细信息
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_' . $key, $value);
                        }

                    }


                }
                foreach ($articleres[0] as $k => $v) {
                    if ($k == "litpic") {
                        $v = getFilePath($v);
                    }
                    $huoniaoTag->assign($k, $v);
                }
            }
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        return;
    } elseif($action == "company-case-detail"){
		if(is_numeric($id)){

            $diarysql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_diary` WHERE `id` = ".$id);

            $diaryres = $dsql->dsqlOper($diarysql,"results");
            if($diaryres){
                $company    = $diaryres[0]['company'];

                $detailHandels = new handlers($service, "storeDetail");
                $detailConfig  = $detailHandels->getHandle($company);
                if(is_array($detailConfig) && $detailConfig['state'] == 100){
                    $detailConfig  = $detailConfig['info'];
                    if(is_array($detailConfig)){

                        $sql = $dsql->SetQuery("UPDATE `#@__renovation_diary` SET `click` = `click` + 1 WHERE `id` = ".$id);
                        $dsql->dsqlOper($sql, "update");

                        //输出详细信息
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_'.$key, $value);
                        }

                    }


                }
                $detailHandelsdiary = new handlers($service, "diaryDetail");
                $detaildiaryConfig  = $detailHandelsdiary->getHandle($id);
                if(is_array($detaildiaryConfig) && $detaildiaryConfig['state'] == 100){
                    $detaildiaryConfig  = $detaildiaryConfig['info'];
//                    echo '<pre>';
//                    var_dump($detaildiaryConfig);die;
                    if(is_array($detaildiaryConfig)){

                        //输出详细信息
                        foreach ($detaildiaryConfig as $key => $value) {
                            $huoniaoTag->assign('diary_'.$key, $value);
                        }

                    }


                }
//                echo "<pre>";
//                var_dump($diaryres);die;
//                foreach ($diaryres[0] as $k => $v) {
//                    if($k =="litpic"){
//                        $v = getFilePath($v);
//                    }
//                    $huoniaoTag->assign($k, $v);
//                }
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
		return;
	}elseif($action =="company-site-detail"){
		if(is_numeric($id)){
			$detailHandels = new handlers($service, "constructionDetail");
			$detailConfig  = $detailHandels->getHandle($id);
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				if(is_array($detailConfig)){
					$detailConfig  = $detailConfig['info'];
					$sid = $detailConfig['sid'];
					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign($key, $value);
					}

					$detailHandels = new handlers($service, "storeDetail");
					$detailConfig  = $detailHandels->getHandle($sid);
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

					}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}

			$zxsql = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__renovation_type` WHERE `parentid` = 9");
			$zxre  = $dsql->dsqlOper($zxsql,"results");
			if($zxre){
				$typename =  array_combine(array_column($zxre, "id"), array_column($zxre, "typename"));
			}

			$huoniaoTag->assign('typename', $typename);
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
	}elseif($action =="designer-article-detail"){
		if(is_numeric($id)){
			$articlesql = $dsql->SetQuery("SELECT * FROM `#@__renovation_article`  WHERE `id` = ".$id);
			$articleres = $dsql->dsqlOper($articlesql,"results");

			$tid = $articleres[0]['fid'];
			foreach ($articleres[0] as $key => &$value) {
				if($key == "litpic"){
					$value  = getFilePath($value);
				}
				$huoniaoTag->assign($key, $value);
			}

			$detailHandels = new handlers($service, "teamDetail");
			$detailConfig  = $detailHandels->getHandle($tid);
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



		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
	}elseif($action == "smart_result") {
        // $pageParam = array();

        // foreach($_GET as $key => $val){
        // 	$huoniaoTag->assign($key, htmlspecialchars(RemoveXSS($val)));
        // 	if($key != "service" && $key != "template" && $key != "page"){
        // 		array_push($pageParam, $key."=".htmlspecialchars(RemoveXSS($val)));
        // 	}
        // }
        // if ($people == "" || $contact == '' || $style == "" || $addrid == "" || $community == "") {
        if ($contact == '' || $addrid == "") {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }

        $huoniaoTag->assign("contact", $contact);
        $huoniaoTag->assign("people", $people);
        $huoniaoTag->assign("type", $type);
        $huoniaoTag->assign("style", $style);
        $huoniaoTag->assign("stype", $stype);
        $huoniaoTag->assign("jiastyle", $jiastyle);
        $huoniaoTag->assign("comstyle", $comstyle);
        $huoniaoTag->assign("addrid", $addrid);
        $huoniaoTag->assign("units", $units);
        $huoniaoTag->assign("community", $community);
        $huoniaoTag->assign("address", $address);
        $huoniaoTag->assign("areaCode", $areaCode);

    }elseif($action == "detail"){
        $detail = $type;
        $table = '';
//        var_dump($type);die;
        if($type =="case"){
            $detail = 'diary';
        }elseif($type =="dynamic"){
            $detail = 'article';
        }elseif($type =="site"){
            $detail = 'construction';
        }elseif($type =="honor"){
            $detail = 'storeptitudes';
        }
        $detailHandels = new handlers($service, $detail . "Detail");

        $detailConfig = $detailHandels->getHandle($id);
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {
                // 如果是会员中心修改页面，验证是否是发布人
                $check = true;
                if ($realServer == "member") {
                    $uid = $userLogin->getMemberID();
                    if ($uid > 0) {

                        if($type !="honor"){
                            if($type =="site" || $type == "article" || $type == "dynamic"){
                                $userid = $detailConfig['userid'];
                            }else{
                                $userid = $detailConfig['author']['userid'];
                            }
                            if ($userid!= $uid ) {
                                $check = false;
                            }

                        }
                    }
                }
                if (!$check) {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
                    die;
                }

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

            }
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
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
