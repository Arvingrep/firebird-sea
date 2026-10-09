<?php

/**
 * huoniaoTag模板标签函数插件-活动模块
 *
 * @param $params array 参数集
 * @return array
 */
function huodong($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "huodong";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;

	$uid = $userLogin->getMemberID();


	//列表页

	if($action == "list"){

		$typename = "";

		$typeid = (int)$typeid;
		$page   = (int)$page;
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__huodong_type` WHERE `id` = $typeid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['typename'];
			}
		}
		$huoniaoTag->assign("page", $page);
		$huoniaoTag->assign("orderby", $orderby);
		$huoniaoTag->assign("typeid", $typeid);
		$huoniaoTag->assign("times", $times);
		$huoniaoTag->assign("feetype", $feetype);
		$huoniaoTag->assign("typename", $typename);
		$huoniaoTag->assign("keywords", $keywords);
		return;

	//获取指定ID的详细信息
	}elseif($action == "detail" || $action == "order"){
		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);
		//当前登录会员ID
        $loginid = $userLogin->getMemberID();
		//输出当前时间戳
		$huoniaoTag->assign("now", GetMkTime(time()));

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				detailCheckCity("huodong", $detailConfig['id'], $detailConfig['cityid']);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新阅读次数
				if($action == "detail"){
					$sql = $dsql->SetQuery("UPDATE `#@__".$service."_list` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "update");

                    $uid = $userLogin->getMemberID();
                    if($uid >0 && $uid!=$detailConfig['uid']) {
                        $uphistoryarr = array(
                            'module'    => $service,
                            'uid'       => $uid,
                            'aid'       => $id,
                            'fuid'      => $detailConfig['userid'],
                            'module2'   => 'detail',
                        );
                        /*更新浏览足迹表   */
                        updateHistoryClick($uphistoryarr);
                    }
				}


				//下单页面
				if($action == "order"){
					//费用ID
					$ordernum = $ordernum;
					//查询费用信息
					$sql = $dsql->SetQuery("SELECT `title`, `price`, `max` FROM `#@__".$service."_fee` WHERE `hid` = $id AND `id` = $fid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$ret = $ret[0];
						$huoniaoTag->assign("fid", $fid);
						$huoniaoTag->assign("id", $id);
						$huoniaoTag->assign("ordernum", $ordernum);
						$huoniaoTag->assign("ordertypename", "活动");
						$huoniaoTag->assign("fee_title", $ret['title']);
						$huoniaoTag->assign("fee_price", $ret['price']);
						$huoniaoTag->assign("fee_max", $ret['max']);
						$huoniaoTag->assign("data", urldecode($data));
						$huoniaoTag->assign("allowUsePoint", false);

					//费用项目不存在
					}else{
						$param = array(
							"service"  => "huodong",
							"template" => "detail",
							"id"       => $id
						);
						$url = getUrlPath($param);
						header("location:".$url);
						die;
					}
				}

				//判断是否互相关注
	            if($loginid != -1){
	                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $loginid AND `fid` = ".$detailConfig['uid']);
	                $ret = $dsql->dsqlOper($sql, "results");
	                $isfollow = 0;
	                if($ret && is_array($ret)){
	                    $isfollow = 1;
	                }
	            }
	            $huoniaoTag->assign('isfollow', $isfollow);

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	//主办方详细
	}elseif($action == "business"){

		if(!empty($id)){

			$sql = $dsql->SetQuery("SELECT `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['mtype'] && !empty($ret[0]['company']) ? $ret[0]['company'] : $ret[0]['nickname'];
				$photo    = $ret[0]['photo'];
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}


			//举办过的活动&参与人数统计
			$huodongCount = 0;
			$regCount = 0;
			$sql = $dsql->SetQuery("SELECT count(l.`id`) lcount FROM `#@__huodong_list` l WHERE l.`uid` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huodongCount = $ret[0]['lcount'];
			}
			$sql = $dsql->SetQuery("SELECT count(r.`id`) rcount FROM `#@__huodong_reg` r LEFT JOIN `#@__huodong_list` l ON l.`id` = r.`hid` WHERE l.`uid` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$regCount = $ret[0]['rcount'];
			}

			$huoniaoTag->assign("id", $id);
			$huoniaoTag->assign("username", $username);
			$huoniaoTag->assign("photo", getFilePath($photo));
			$huoniaoTag->assign("huodongCount", (int)$huodongCount);
			$huoniaoTag->assign("regCount", (int)$regCount);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	//支付结果页面
	}elseif($action == "payreturn"){

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`hid`, r.`date`, r.`state`, r.`price` FROM `#@__huodong_order` r WHERE r.`ordernum` = '$ordernum'");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$title = "";
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__huodong_list` WHERE `id` = ".$payDetail[0]['hid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}

				$param = array(
					"service"     => "huodong",
					"template"    => "detail",
					"id"          => $payDetail[0]['hid']
				);
				$url = getUrlPath($param);

				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('ordernum', $payDetail[0]['ordernum']);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('url', $url);
				$huoniaoTag->assign('date', $payDetail[0]['date']);
				$huoniaoTag->assign('amount', sprintf("%.2f", $payDetail[0]['price']));

			//支付订单不存在
			}else{
				$huoniaoTag->assign('state', 0);
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}


	//发帖页面需要登录
	}elseif($action == "fabu"){

		if($uid == -1){
			$furl = urlencode(''.$cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
			header("location:".$cfg_secureAccess.$cfg_basehost."/login.html?furl=".$furl);
			die;
		}

		global $userLogin;
		global $cfg_mapCity;
		$huoniaoTag->assign('mapCity', $cfg_mapCity);
		$userinfo = $userLogin->getMemberInfo($uid);
		if($userinfo['userType'] == 2){
			if(!verifyModuleAuth(array("module" => "huodong"))){
				$param = array(
					"service"  => "member",
					"template" => "servicemeal"
				);
				$url = getUrlPath($param);
				header("location:" . $url);
				die;
			}
		}

		//实名认证
		$f_url = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);

		global $cfg_memberVerified;
		global $cfg_memberVerifiedInfo;
		if($cfg_memberVerified && (($userinfo['userType'] == 1 && $userinfo['certifyState'] != 1) || ($userinfo['userType'] == 2 && $userinfo['licenseState'] != 1))){
			$param = array(
				'service' => 'siteConfig',
				'template' => 'certification'
			);
			header("location:" . getUrlPath($param) . '?from='.$f_url.'&type=verified');
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
				'service' => 'siteConfig',
				'template' => 'certification'
			);
			header("location:" . getUrlPath($param) . '?from='.$f_url.'&type=phone');
			die;
		}

		// 关注公众号
		global $cfg_memberFollowWechat;
		global $cfg_memberFollowWechatInfo;
		if($cfg_memberFollowWechat && !$userinfo['wechat_subscribe']){
			$param = array(
				'service' => 'siteConfig',
				'template' => 'certification'
			);
			header("location:" . getUrlPath($param) . '?from='.$f_url.'&type=wechat');
			die;
		}


		$id = (int)$id;
		$huoniaoTag->assign("id", $id);

		//修改活动
		if(!empty($id)){
			$detailHandels = new handlers($service, "detail");
			$detailConfig  = $detailHandels->getHandle($id);

			//输出当前时间戳
			$huoniaoTag->assign("now", GetMkTime(time()));

			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}

					//验证权限
                    $userinfo = $userLogin->getMemberInfo();

					if($detailConfig['uid'] != $uid && $userinfo['is_staff']!=1){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

				}
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
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
