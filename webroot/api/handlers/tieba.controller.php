<?php

/**
 * huoniaoTag模板标签函数插件-贴吧模块
 *
 * @param $params array 参数集
 * @return array
 */
function tieba($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "tieba";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;

	$cityid = getCityId();
	if(empty($smarty)){

		//统计帖子数量
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `cityid` = '$cityid' AND `waitpay` = 0 ");
		$count = getCache("tieba_total", $sql, 303, array("name" => "t", "sign" => "all"));
		$huoniaoTag->assign('tiziTotal', $count);

		//今日
		$stime = GetMkTime(date('Y-m-d', time()));
		$etime = $stime + 86400;
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime AND `cityid` = $cityid");
		$count = getCache("tieba_total", $sql, 300, array("name" => "t", "sign" => "today"));
		$huoniaoTag->assign('tiziTodayTotal', $count);

		//昨日
		$stime = GetMkTime(date("Y-m-d",strtotime("-1 day")));
		$etime = $stime + 86400;
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime AND `cityid` = $cityid");
		$ret = $dsql->dsqlOper($sql, "results");
		$count = getCache("tieba_total", $sql, 86400, array("name" => "t", "sign" => date("Ymd", strtotime('-1 day'))));
		$huoniaoTag->assign('tiziYestodayTotal', $count);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		//页码
		$page = (int)$page;
		$page = $page < 1 ? 1 : $page;
		$huoniaoTag->assign('atpage', $page);


	}

	//帖子详情
	if($action == "detail"){

		$detailHandels = new handlers($service, "detail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				detailCheckCity("tieba", $detailConfig['id'], $detailConfig['cityid']);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				$typeid = $detailConfig['typeid'];


				//验证是否已经收藏
				$params = array(
					"module" => "tieba",
					"temp"   => "detail",
					"type"   => "add",
					"id"     => $id,
					"check"  => 1
				);
				$collect = checkIsCollect($params);
				$huoniaoTag->assign('collect', $collect);


				//楼主信息
				$louzu = array();
				$louzuID = $detailConfig['uid'];

				//是否相互关注
				$userid = $userLogin->getMemberID();
				$huoniaoTag->assign('userid', $userid);
				if($userid != -1){
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = $louzuID");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret && is_array($ret)){
						$huoniaoTag->assign('isfollow', 1);
					}

					//是否点赞
					// $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_up` WHERE `tid` = '$id' AND `ruid` = '$userid'");
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all` WHERE `type` = '0' AND `module` = 'tieba' AND `action` = 'detail' AND `tid` = '$id' AND `ruid` = '$userid'");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret && is_array($ret)){
						$huoniaoTag->assign('isuplike', 1);
					}

					$currentInfo = $userLogin->getMemberInfo($userid);
					if($currentInfo && is_array($currentInfo)){
						$huoniaoTag->assign('currentPhoto', $currentInfo['photo']);
					}else{
						$huoniaoTag->assign('currentPhoto', '/static/images/noPhoto_100.jpg');
					}
				}

				if($louzuID){
					//帖子总数
					$tizi_louzuTotal = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `uid` = $louzuID");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$tizi_louzuTotal = $ret[0]['t'];
					}
					//精华总数
					$tizi_louzuJinghuaTotal = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `jinghua` = 1 AND `uid` = $louzuID");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$tizi_louzuJinghuaTotal = $ret[0]['t'];
					}

					$louzuInfo = $userLogin->getMemberInfo($louzuID);
					if($louzuInfo && is_array($louzuInfo)){
						$louzu = array(
							"uid" => $louzuID,
							"photo" => $louzuInfo['photo'],
							"nickname" => $louzuInfo['nickname'],
							"regtime" => $louzuInfo['regtime'],
							"tizi_louzuTotal" => $tizi_louzuTotal,
							"tizi_louzuJinghuaTotal" => $tizi_louzuJinghuaTotal
						);
					}
				}
				$huoniaoTag->assign('louzu', $louzu);

				//更新阅读次数
				// global $dsql;
				// $sql = $dsql->SetQuery("UPDATE `#@__".$service."_list` SET `click` = `click` + 1 WHERE `id` = ".$id);
				// $dsql->dsqlOper($sql, "update");

                // $uid = $userLogin->getMemberID();
                // if($uid >0 && $uid!=$detailConfig['uid']){
                //     $uphistoryarr = array(
                //         'module'  => 'tieba',
                //         'uid'     => $uid,
                //         'aid'     => $id,
                //         'fuid'    => $detailConfig['uid'],
                //         'module2' => 'detail',
                //     );
                //     /*更新浏览足迹表   */
                //     updateHistoryClick($uphistoryarr);
                // }


				$see_lz = (int)$see_lz;
				$huoniaoTag->assign('see_lz', $see_lz);

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}

	//打赏结果页面
	}elseif($action == "payreturn"){
		global $dsql;

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`aid`, r.`date`, r.`state`, l.`amount` FROM `#@__pay_log` l LEFT JOIN `#@__member_reward` r ON r.`ordernum` = l.`body` WHERE r.`module` = 'tieba' AND l.`ordernum` = '$ordernum'");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$title = "";
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = ".$payDetail[0]['aid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}

				$param = array(
					"service"     => "tieba",
					"template"    => "detail",
					"id"          => $payDetail[0]['aid']
				);
				$url = getUrlPath($param);

				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('ordernum', $payDetail[0]['ordernum']);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('url', $url);
				$huoniaoTag->assign('date', $payDetail[0]['date']);
				$huoniaoTag->assign('amount', sprintf("%.2f", $payDetail[0]['amount']));

			//支付订单不存在
			}else{
				$huoniaoTag->assign('state', 0);
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}

	// 打赏列表页
	}elseif($action == "reward"){
		$param = array(
			"service" => "tieba"
		);
		$url = getUrlPath($param);
		if(empty($id) || !is_numeric($id)){
			header("location:$url");
			return;
		}

		// 验证信息
		$archives = $dsql->SetQuery("SELECT `id`, `uid` FROM `#@__tieba_list` WHERE `id` = $id");
		$results  = $dsql->dsqlOper($archives, "results");
		if(!$results){
			header("location:$url");
			return;
		}else{
			$admin = $results[0]['uid'];
			$nickname = 'Ta';
			$photo = "";
			$level = 0;

			$amount = 0;
			$sql = $dsql->SetQuery("SELECT SUM(`amount`) AS amount FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$amount = $ret[0]['amount'];
			}

			$sql = $dsql->SetQuery("SELECT `nickname`, `photo`, `level` FROM `#@__member` WHERE `id` = $admin");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$nickname = $ret[0]['nickname'] ? $ret[0]['nickname'] : 'Ta';
				$photo = $ret[0]['photo'] ? getFilePath($ret[0]['photo']) : "";
				$level = $ret[0]['level'];
			}

			$huoniaoTag->assign('id', $id);
			$huoniaoTag->assign('nickname', $nickname);
			$huoniaoTag->assign('photo', $photo);
			$huoniaoTag->assign('amount', $amount);

		}

	}elseif($action == "uplike"){
		$archives = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = $id");
		$results  = $dsql->dsqlOper($archives, "results");

		if(!$results){
			header("location:$url");
			return;
		}else{
			$title = $results[0]['title'];
		}
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('id', $id);
	}elseif($action == "list" || $action == "slist"){
		if($dsql->getTypeList($id, "tieba_type")){
			global $arr_data;
			$arr_data = array();
			$lower = arr_foreach($dsql->getTypeList($id, "tieba_type"));
			if($id){
				$lower = $id.",".join(',',$lower);
			}else{
				$lower = join(',',$lower);
			}
		}else{
			$lower = $id;
		}
		//统计帖子数量
		if($lower){
			$sql = $dsql->SetQuery("SELECT sum(`click`) t FROM `#@__tieba_list` WHERE `typeid` in ($lower) AND `cityid` = $cityid and `del` = 0 and `state` = 1 AND `waitpay` = 0 ");
			$ret = $dsql->dsqlOper($sql, "results");
			$huoniaoTag->assign('typeTotal', $ret[0]['t']);
		}

		//今日
		$stime = GetMkTime(date('Y-m-d', time()));
		$etime = $stime + 86400;
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `waitpay` = 0 AND `pubdate` BETWEEN $stime AND $etime AND `cityid` = $cityid AND `typeid` in ($lower)");
		$count = getCache("tieba_total", $sql, 300, array("name" => "t", "sign" => "today"));
		$huoniaoTag->assign('tiziTodayTotal', $count);

		$huoniaoTag->assign('ispic', $ispic);
		$huoniaoTag->assign('username', $username);
		$huoniaoTag->assign('orderby', $orderby);

        //自定义跳转链接
        if($id){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__tieba_type` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret && is_array($ret)){
                $redirect = $ret[0]['redirect'];
                if($redirect){
                    header('location:' . $redirect);
                    die;
                }
            }
        }


	}elseif($action == "pay"){
        $param = array("service" => "tieba");
        if(empty($ordernum)){
            header("location:".getUrlPath($param));
            die;
        }
        // 打赏
        $archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`state`, r.`amount`, r.`uid` FROM `#@__member_reward` r WHERE r.`module` = 'tieba' AND r.`ordernum` = '$ordernum'");
        $detail  = $dsql->dsqlOper($archives, "results");
        if(!$detail){
            header("location:".getUrlPath($param));
            die;
        }
        $uid = $userLogin->getMemberID();
        if($uid > 0 && $uid != $detail[0]['uid']){
            header("location:".getUrlPath($param));
            die;
        }
        if($detail[0]['state'] == 1){
            $param = array("service" => "tieba", "template" => "payreturn", "ordernum" => $ordernum);
            header("location:".getUrlPath($param));
            die;
        }
        $huoniaoTag->assign('totalAmount', $detail[0]['amount']);
        $huoniaoTag->assign('ordernum', $detail[0]['ordernum']);
    }


	//查询上级分类
	$typename = "";
	$parentid = 0;
	$parentName = "";
	if($typeid && !strstr($typeid, ',')){
		$sql = $dsql->SetQuery("SELECT t.`parentid`, t.`typename`, p.`typename` tname FROM `#@__tieba_type` t LEFT JOIN `#@__tieba_type` p ON p.`id` = t.`parentid` WHERE t.`id` = $typeid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$typename = $ret[0]['typename'];
			$parentid = $ret[0]['parentid'];
			$parentName = $ret[0]['tname'];
		}else{
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__tieba_type` WHERE `id` = $typeid");
			$typename = getCache("tieba_type", $sql, 0, $typeid);
		}
	}
	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->assign('typename', $typename);
	$huoniaoTag->assign('parentid', $parentid);
	$huoniaoTag->assign('parentName', $parentName);

	$seoTitle = $typename;
	if($parentid && $parentName){
		$seoTitle .= " - ".$parentName;
	}
	$huoniaoTag->assign('seoTitle', $seoTitle);


	//统计当前登录会员的帖子信息
	$uid = $userLogin->getMemberID();
	if($uid != -1){
		//帖子总数
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$huoniaoTag->assign('tizi_memberTotal', $ret[0]['t']);
		}
		//精华总数
		$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__tieba_list` WHERE `state` = 1 AND `jinghua` = 1 AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$huoniaoTag->assign('tizi_memberJinghuaTotal', $ret[0]['t']);
		}
	}


	//发帖页面需要登录
	if($action == "fabu"){

		if(!isMobile()){
			global $template;
			global $tpl;
			$f = HUONIAOROOT.$tpl.$template.".html";
			if(!is_file($f)){
				$param = array(
					'service' => 'tieba'
				);
				$url = getUrlPath($param).'#publish';
				header("location:".$url);
				die;
			}
		}

		//未登录
		if($uid == -1){
			$furl = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
			header("location:".$cfg_secureAccess.$cfg_basehost."/login.html?furl=".$furl);
			die;
		}

		$userinfo = $userLogin->getMemberInfo($uid);

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


		// if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => 'tieba'))) {
        //     $param = array(
        //         'service' => 'member',
        //         'template' => 'servicemeal'
        //     );
        //     header("location:" . getUrlPath($param));
        //     die;
        // }

		require(HUONIAOINC."/config/tieba.inc.php");
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', str_replace("|", ",", $custom_atlasType));

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
