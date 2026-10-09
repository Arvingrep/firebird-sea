<?php

/**
 * huoniaoTag模板标签函数插件-系统模块
 *
 * @param $params array 参数集
 * @return array
 */
function siteConfig($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "siteConfig";
	if(empty($action)) return '';

	global $cfg_secureAccess;
	global $cfg_basehost;
	global $huoniaoTag;
	global $dsql;
	global $langData;
	global $userLogin;

	//关于
	if($template == "about"){

		if(empty($id)){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'singel' LIMIT 0, 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$id = $ret[0]['id'];
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}

		$detailHandels = new handlers($service, "singelDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$huoniaoTag->assign('id', $id);
				$huoniaoTag->assign('title', $detailConfig['title']);
				$huoniaoTag->assign('body', $detailConfig['body']);

			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}else{
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
		}

		return;

	//协议
	}elseif($template == "protocol"){

		if(empty($id)){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'agree' LIMIT 0, 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$id = $ret[0]['id'];
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}

        if(!empty($title)){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'agree' AND `title` = '$title'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $id = $ret[0]['id'];
            }
            //如果标题完全匹配不上，则进行模糊匹配
            else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'agree' AND `title` like '%$title%' ORDER BY `id` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $id = $ret[0]['id'];
                }
            }
        }

		$detailHandels = new handlers($service, "agree");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

                //消费金自定义名称
                $huoniao_bonus_name = '';
                $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus' ORDER BY `id` DESC LIMIT 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $huoniao_bonus_name = $ret[0]['pay_name'];
                }

				$huoniaoTag->assign('id', $id);
				$huoniaoTag->assign('title', str_replace('消费金', $huoniao_bonus_name, $detailConfig[0]['title']));
				$huoniaoTag->assign('body', $detailConfig[0]['body']);

                //分类信息自定义协议内容
                $typeid = (int)$_REQUEST['typeid'];
                if($_REQUEST['module'] == 'info' && $typeid){
                    $detailHandels = new handlers('info', "typeDetail");
		            $detailConfig  = $detailHandels->getHandle($typeid);
                    if(is_array($detailConfig) && $detailConfig['state'] == 100){
                        $detailConfig  = $detailConfig['info'];
                        if(is_array($detailConfig) && $detailConfig[0]['protocol']){
                            $huoniaoTag->assign('body', $detailConfig[0]['protocol']);
                        }
                    }
                }

			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}else{
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
		}

		return;

	//帮助
	}elseif($template == "help"){

		$title    = $langData['siteConfig'][19][273];    //帮助中心
		$typeid   = 0;
		$parentid = 0;

		if(!empty($id)){
			$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__site_helpstype` WHERE `id` = '$id' LIMIT 0, 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typeid   = $id;
				$parentid = $ret[0]['parentid'];
				$title    = $ret[0]['typename'];
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}

		$huoniaoTag->assign('parentid', $parentid);
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('title', $title);
		return;

	//帮助详细
	}elseif($template == "help-detail"){

		$parentid = 0;

		if(empty($id)){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
		}

		$detailHandels = new handlers($service, "helpsDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$huoniaoTag->assign('detail_id', $id);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__site_helpstype` WHERE `id` = ".$detailConfig['typeid']." LIMIT 0, 1");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$parentid = $ret[0]['parentid'];
				}
				$huoniaoTag->assign('parentid', $parentid);

			}
		}else{
			header("location:".$cfg_basehost."/404.html");
		}
		return;

	//公告详细
	}elseif($template == "notice-detail"){

		if(empty($id)){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
		}

		$detailHandels = new handlers($service, "noticeDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				//跳转
				if($detailConfig['redirecturl']){
					header('location:'.$detailConfig['redirecturl']);
					die;
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
		}else{
			header("location:".$cfg_basehost."/404.html");
		}
		return;

	//完善资料
	}elseif($template == "certification"){

		$userid = $userLogin->getMemberID();
		$basehost = $cfg_secureAccess.$cfg_basehost;  //网站首页域名

		//判断登录
		if($userid < 0){
			$url = $basehost."/login.html?furl=".urlencode($from);
			header("location:".$url);
            die;
		}
		$userinfo = $userLogin->getMemberInfo();

		global $cfg_memberVerified;  //会员实名认证
		global $cfg_memberBindPhone;  //绑定手机
		global $cfg_memberFollowWechat;  //关注公众号
        global $cfg_periodicCheckPhone;  //周期性检测
        global $cfg_periodicCheckPhoneCycle;  //检测周期
        $periodicCheckPhone = (int)$cfg_periodicCheckPhone;
        $periodicCheckPhoneCycle = (int)$cfg_periodicCheckPhoneCycle * 86400;  //天

		//会员绑定信息
		$verified = $userinfo['userType'] == 2 ? $userinfo['licenseState'] : $userinfo['certifyState'];
		$bindPhone = $userinfo['phoneCheck'] && $userinfo['phone'] ? 1 : 0;
		$followWechat = $userinfo['wechat_subscribe'];

		$huoniaoTag->assign('cfg_memberVerified', $cfg_memberVerified);
		$huoniaoTag->assign('cfg_memberBindPhone', $cfg_memberBindPhone);
		$huoniaoTag->assign('cfg_memberFollowWechat', $cfg_memberFollowWechat);

		//审核失败，查询失败原因
		if($verified == 2){
			$verifiedInfo = $userinfo['userType'] == 2 ? $userinfo['licenseInfo'] : $userinfo['certifyInfo'];
		}

        //验证是否达到周期性检测时间
        //需要满足以下条件
        //1.系统启用发布信息绑定手机功能
        //2.当前账号已经绑定过手机
        //3.系统启用了周期性检测功能并设置了检测周期
        //4.绑定时间超过了检测周期的时间
        $periodicCheckPhoneState = 0;  //默认没有过检测周期时间
        if($cfg_memberBindPhone && $bindPhone && $periodicCheckPhone && $userinfo['phoneBindTime'] && time() - $userinfo['phoneBindTime'] > $periodicCheckPhoneCycle){
            $bindPhone = 0;  //重置绑定状态给页面使用
            $periodicCheckPhoneState = 1;  //已经过了检测周期时间
        }

		$huoniaoTag->assign('verified', $verified);
		$huoniaoTag->assign('verifiedInfo', $verifiedInfo);
		$huoniaoTag->assign('bindPhone', $bindPhone);
		$huoniaoTag->assign('periodicCheckPhoneState', $periodicCheckPhoneState);
		$huoniaoTag->assign('followWechat', $followWechat);

		$certifyArr = array();
		if($cfg_memberBindPhone && !$bindPhone){
			array_push($certifyArr, array(
				'type' => 'phone',
				'title' => $periodicCheckPhoneState ? '验证手机号' : '绑定手机号'
			));
		}
		if($cfg_memberFollowWechat && !$followWechat){
			array_push($certifyArr, array(
				'type' => 'wechat',
				'title' => '关注公众号'
			));
		}
		if($cfg_memberVerified && $verified != 1){
			array_push($certifyArr, array(
				'type' => 'card',
				'title' => '实名认证'
			));
		}

		$huoniaoTag->assign('certifyArr', json_encode($certifyArr));


		$data = array(
			'module' => 'member',
			'type'   => 'bind',
			'aid'    => $userid,
			'from'   => 'bind'
		);
		$handlers = new handlers("siteConfig", "getWeixinQrPost");
		$post   = $handlers->getHandle($data);
		$img = '';
		if($post['state'] == 100){
			$img = $post['info'];
		}else{
			// print_r(json_decode($post['info'], true));die;
		}
		$huoniaoTag->assign('wechatImg', $img);

		//如果都已认证过
		if(empty($certifyArr)){
			header('location:' . $from);
			die;
		}

    //第三方网站跳转中转页
    }elseif($template == "middlejump"){

        $target = RemoveXSS(urldecode($target));

        if (filter_var($target, FILTER_VALIDATE_URL) == false && !strstr($target, '/include')) {
            die('跳转链接错误，请确认后重试！');
        }

        $huoniaoTag->assign('target_link', $target . (strstr($target, '?') ? '&' : '?') . 'currentpageopen=1');
        $huoniaoTag->assign('target', $target);
        return;

	}

    //APP下载页面
    elseif($template == 'mobile' && isMobile()){

        //app配置
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){

            $ret = $ret[0];
            $cfg_app_android_download = $ret['android_download'];  //安卓下载地址

            $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);

            //华为手机
            if(strpos($useragent, 'huawei') !== false && $ret['huawei_download']){
                $cfg_app_android_download = $ret['huawei_download'];
            }

            //荣耀手机
            if(strpos($useragent, 'honor') !== false && $ret['honor_download']){
                $cfg_app_android_download = $ret['honor_download'];
            }

            //小米手机
            if((strpos($useragent, 'xiaomi') !== false || strpos($useragent, 'redmi') !== false || strpos($useragent, 'mi ') !== false) && $ret['mi_download']){
                $cfg_app_android_download = $ret['mi_download'];
            }

            //OPPO手机
            if((strpos($useragent, 'oppo') !== false || strpos($useragent, 'opm') !== false) && $ret['oppo_download']){
                $cfg_app_android_download = $ret['oppo_download'];
            }

            //VIVO手机
            if(strpos($useragent, 'vivo') !== false && $ret['vivo_download']){
                $cfg_app_android_download = $ret['vivo_download'];
            }

            $huoniaoTag->assign('cfg_app_android_download', $cfg_app_android_download);

        }
    }

    $minsql = $dsql->SetQuery("SELECT `privilege`  FROM `#@__member_level` ORDER BY `id` ASC limit 0,1");
    $minret = $dsql->dsqlOper($minsql, "results");

    $minprivilege = unserialize($minret[0]['privilege']);
    $huoniaoTag->assign('waimaiprivilege', $minprivilege['waimai']);

    global $template;

//    if($template == 'pay'){
//
//        $userinfo = $userLogin->getMemberInfo();
//        $userid   = $userLogin->getMemberID();
//        $wechat_openid = '';
//
//        if($userid >0){
//
//            $wechat_openid = $userinfo['wechat_openid'];
//        }
////        $baseUrl = urlencode($cfg_secureAccess.'/'.$_SERVER['PATH']['REDIRECT_URL']);
//        if(isWeixin() && $userid >0){
//
//            if($wechat_openid == ''){
//
//                    $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'wxpay' AND `state` = 1");
//                    $payment = $dsql->dsqlOper($archives, "results");
//
//                    $isWxMiniprogram = isWxMiniprogram();
//                    if($payment){
//                        //①、获取用户openid
//                        $paymentFile = HUONIAOROOT . "/api/payment/wxpay/wxpay.php";
//                        require_once($paymentFile);
//                        $pay = new wxpay();
//                        $order['order_amount'] = 0;
//
//                        $pay_config = unserialize($payment[0]['pay_config']);
//                        $paymentArr = array();
//
//                        //验证配置
//                        foreach ($pay_config as $key => $value) {
//                            if (!empty($value['value'])) {
//                                $paymentArr[$value['name']] = $value['value'];
//                            }
//                        }
//                        $wechat_openid = $pay->get_code($order,$paymentArr,2,1);
//                        if($wechat_openid !=''){
//
//                            $upopenidsql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_openid` = '$wechat_openid' WHERE `id` = '$userid'");
//
//                            $dsql->dsqlOper($upopenidsql,'update');
//                        }
//
//                    }
//            }
//        }
//
//    }
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
			reset($smarty->block_data[$dataindex]);

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
