<?php
//接口API测试

//系统核心配置文件
require_once('../include/common.inc.php');

if(empty($service)) return;

//判断网站状态
if($cfg_visitState && $action != 'getDatabaseStructure'){
    $ret = array('state' => 200, 'info' => $cfg_visitMessage);

    if($callback){
        echo $callback."(".json_encode($ret, JSON_UNESCAPED_UNICODE).")";
    }else{
        echo json_encode($ret, JSON_UNESCAPED_UNICODE);
    }
    
    die;
}

//引入配置文件
$configFile = HUONIAOINC."/config/".$service.".inc.php";
if(!file_exists($configFile) && $service != 'system') return;
if($service != "system" && $service != "member"){
	require_once($configFile);
}

include_once(HUONIAOINC.'/class/aliyun-php-sdk-core/Config.php');   //引入阿里云SDK

if(GetCookie('siteCityInfo')){
	$siteCityInfo = checkSiteCity();
}elseif($cityid){
	$cityid = (int)$cityid;
	$siteCityInfo = cityInfoById($cityid);
}

$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);

//声明以下均为接口类
$handler = true;

//拼接请求参数
$param = array();
foreach ($_GET as $key => $value) {
	$key = $key == 'description' ? $key : htmlspecialchars(RemoveXSS($key));
	if($key != "service" && $key != "action" && $key != "callback" && $key != "_"){
		if(($key == 'page' || $key == 'pageSize') && $value != 'touchHome'){
            $value = (int)$value;
            $value = $value <= 0 ? ($key == 'page' ? 1 : 10) : $value;
			$param[$key] = $value > 50000 ? 50000 : $value;
		}
        elseif(
            $_REQUEST['rsaEncrypt'] == 1 && 
            (strlen($value) == 172 || strstr($value, '||rsa||')) && 
            (
                ($_GET['action'] == 'resetpwd' && $key != 'data') || 
                $_GET['action'] != 'resetpwd'
            )
        ){
            $param[$key] = rsaDecrypt($value);  //RSA解密
        }
		elseif($key == 'amount'){ // 金额强制转数字、防止表达式注入漏洞
		    $param[$key] = (float)$value;
        }
		elseif($key == 'id' || $key == 'cityid' || $key == 'sid' || $key == 'state'){ // ID强制转数字、防止表达式注入漏洞
		    $param[$key] = convertArrToStrWithComma($value);
        }
        elseif(($key == 'lng' || $key == 'lat' || $key == 'userlng' || $key == 'userlat') && $value == 'undefined'){
            $param[$key] = '';
        }
        elseif($key == 'price' && $value == 'pricePlaceholder'){
            $param[$key] = '';
        }
        elseif($value == 'undefined'){
            $param[$key] = '';
        }
		else{
            $param[$key] = (is_string($value) && (strstr($value, '[{') || is_array(json_decode($value, true))) || is_array($value)) ? $value : RemoveXSS(addslashes(stripslashes(removeInvisibleCharacters($value))));
		}
	}
}
foreach ($_POST as $key => $value) {
	$key = $key == 'description' ? $key : htmlspecialchars(RemoveXSS($key));
	if($key != "service" && $key != "action" && $key != "callback" && $key != "_"){
		if(($key == 'page' || $key == 'pageSize') && $value != 'touchHome'){
            $value = (int)$value;
			$param[$key] = $value > 50000 ? 50000 : $value;
		}
        elseif($_REQUEST['rsaEncrypt'] == 1 && (strlen($value) == 172 || strstr($value, '||rsa||'))){
            $param[$key] = rsaDecrypt($value);  //RSA解密
        }
        elseif($key == 'amount'){  // 金额强制转数字、防止表达式注入漏洞
            $param[$key] = (float)$value;
        }
		elseif($key == 'id' || $key == 'cityid' || $key == 'sid' || $key == 'state'){ // ID强制转数字、防止表达式注入漏洞
		    $param[$key] = convertArrToStrWithComma($value);
        }
        elseif(($key == 'lng' || $key == 'lat' || $key == 'userlng' || $key == 'userlat') && $value == 'undefined'){
            $param[$key] = '';
        }
        elseif($key == 'price' && $value == 'pricePlaceholder'){
            $param[$key] = '';
        }
        elseif($value == 'undefined'){
            $param[$key] = '';
        }
		else{
			$param[$key] = (is_string($value) && (strstr($value, '[{') || is_array(json_decode($value, true))) || is_array($value)) ? $value : RemoveXSS(addslashes(stripslashes($value)));
		}
	}
}

$callback = RemoveXSS($callback);
$callback = $callback ? htmlspecialchars($callback) : $callback;
$callback = str_replace(')', '', str_replace('(', '', $callback));

// foreach ($_REQUEST as $key => $value) {
// 	if($key != "service" && $key != "action" && $key != "callback" && $key != "_"){
// 		$param[$key] = $value;
// 	}
// }

//获取服务器时间
if($action == "getSysTime"){

	$now      = GetMkTime(time());
	$today    = GetMkTime(date("Y-m-d"));
	$nextHour = GetMkTime(date("Y-m-d H", $now + 3600).":00:00");
	$nextDay  = GetMkTime(date("Y-m-d", strtotime("+1 day")));
	$return = array(
		"now"      => $now,
		"today"    => $today,
		"nextHour" => $nextHour,
		"nextDay"  => $nextDay
	);


//获取登录用户信息
}elseif($action == "getMemberID"){

	die($userLogin->getMemberID());


//微信登录
}elseif($action == "checkWxlogin"){
    $state = RemoveXSS($_REQUEST['state']);
	if($state){

		//后台关联管理员微信时使用
		if($getopenid){

            //后台管理员扫码登录
            if($getopenid == 'admin_login'){

                //查询临时表
                $sql = $dsql->SetQuery("SELECT `uid`, `sameConn` FROM `#@__site_wxlogin` WHERE `state` = '$state'");
                $ret = $dsql->dsqlOper($sql, "results");

                //查询登录用户信息
                if($ret){
                    $sameConn = $ret[0]['sameConn'];
                    if($sameConn){

                        //成功返回
                        $return = 'success';

                        $res = $userLogin->checkAdminUserByOpenid($sameConn);

                        if($res == 1){

                            $userid = $userLogin->getUserID();
                            $archives = $dsql->SetQuery("INSERT INTO `#@__adminlogin` (`userid`, `logintime`, `loginip`, `ipaddr`, `type`) VALUES ($userid, ".GetMkTime(time()).", '".GetIP().':'.$_SERVER['REMOTE_PORT']."', '".getIpAddr(GetIP())."', 2)");
                            $dsql->dsqlOper($archives, "update");

                        //error
                        }else if($res == -1){
                            $return = "该微信未绑定管理员！";

                        }else if($res == -2){
                            $return = "帐号处于锁定状态，暂时无法登录，请联系管理员!";
                        }else{
                            $return = $res;
                        }

                        //这里输出是为了配合前端iframe向上级页面传递消息
                        if($callback){
                            echo $callback."(".json_encode(array("state" => 102, "info" => "登录成功", "sameConn" => $return)).")";
                        }else{
                            echo json_encode(array("state" => 102, "info" => "登录成功", "sameConn" => $return));
                        }
                        die;
                    }
                }

            }
            //后台管理员扫码绑定账号
            else{
                //获取微信openid
                $opensql = $dsql->SetQuery("SELECT `wechat_openid` FROM `#@__member` WHERE `id` = '$getopenid'");
                $res = $dsql->dsqlOper($opensql, "results");
                if($res[0]['wechat_openid'] != ''){

                    //写入cookie，以供前端使用
                    PutCookie('bindManagerWechat', $res[0]['wechat_openid'], 60 * 60);

                    if($callback){
                        echo $callback."(".json_encode(array("state" => 100, "info" => $langData['siteConfig'][9][5])).")";  //成功
                    }else{
                        echo json_encode(array("state" => 100, "info" => $langData['siteConfig'][9][5]));  //成功
                    }
                    die;
                }
            }
		}

		//查询临时表
		$sql = $dsql->SetQuery("SELECT `uid`, `sameConn` FROM `#@__site_wxlogin` WHERE `state` = '$state'");
		$ret = $dsql->dsqlOper($sql, "results");

		//查询登录用户信息
		if($ret){
			$uid = $ret[0]['uid'];
			$sameConn = $ret[0]['sameConn'];
			// 此微信号已被绑定到其他用户
			if($sameConn){
				$RenrenCrypt = new RenrenCrypt();
				$sameConn = base64_encode($RenrenCrypt->php_encrypt($sameConn));

				if($callback){
					echo $callback."(".json_encode(array("state" => 102, "info" => "此微信号已被绑定到其他用户", "sameConn" => $sameConn)).")";
				}else{
					echo json_encode(array("state" => 102, "info" => "此微信号已被绑定到其他用户", "sameConn" => $sameConnUid));
				}
				die;
			}

			if($uid){
				$sql = $dsql->SetQuery("SELECT `id`, `username`, `password` FROM `#@__member` WHERE `state` = 1 AND `id` = $uid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$data = $uid . "&" . $ret[0]['password'];

					//登录
					global $cfg_cookiePath;
					global $cfg_onlinetime;
					$RenrenCrypt = new RenrenCrypt();
					$userid = base64_encode($RenrenCrypt->php_encrypt($data));
					PutCookie("login_user", $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);

					//论坛同步
					global $cfg_bbsState;
					global $cfg_bbsType;
					if($cfg_bbsState == 1 && $cfg_bbsType != ""){

						$username = $ret[0]['username'];
						$password = substr($state, 0, 20);

						$data = array();
						$data['username'] = $username;
						$data['uPwd']     = $password;
						$userLogin->bbsSync($data, "synlogin");
					}

					$sql = $dsql->SetQuery("DELETE FROM `#@__site_wxlogin` WHERE `state` = '$state'");
					$dsql->dsqlOper($sql, "update");

					//登录成功
					if($callback){
						echo $callback."(".json_encode(array("state" => 100, "info" => $langData['siteConfig'][21][0])).")";
					}else{
						echo json_encode(array("state" => 100, "info" => $langData['siteConfig'][21][0]));
					}

				}else{
					//会员状态验证错误，登录失败！
					if($callback){
						echo $callback."(".json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][1])).")";
					}else{
						echo json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][1]));
					}
				}
			}else{
				//等待扫描
				if($callback){
					echo $callback."(".json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][2])).")";
				}else{
					echo json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][2]));
				}
			}
		}else{
			//登录失败，请重试！
			if($callback){
				echo $callback."(".json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][3])).")";
			}else{
				echo json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][3]));
			}
		}

	}else{
		//请求错误，请重试！
		if($callback){
			echo $callback."(".json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][4])).")";
		}else{
			echo json_encode(array("state" => 101, "info" => $langData['siteConfig'][21][4]));
		}
	}
	die;


//首次加载Geetest极验验证
}elseif($action == "geetest"){

	global $handler;
	$handler = false;
	$GtSdk = new geetestlib($cfg_geetest_id, $cfg_geetest_key);
	$userid = $userLogin->getMemberID();
	$status = $GtSdk->pre_process($userid);
	putSession('gtserver', $status);
	putSession('user_id', $userid);
	echo $GtSdk->get_response_str();die;

//获取多语言列表
}elseif($action == "langList"){

    //请求错误，请重试！
    if($callback){
        echo $callback."(".json_encode(array("state" => 100, "info" => $langList)).")";
    }else{
        echo json_encode(array("state" => 100, "info" => $langList));
    }
    die;

}

//微信小程序激励广告结束后验证
//用于付费查询电话的看广告解锁电话功能
//广告id在后台-系统-付费查看电话的基本设置中配置
//微信登录的code，通过wx.login获取，ordernum值为调用payPhoneDeal接口后返回的ordernum订单号，state为状态 1成功 2失败
//例：/include/ajax.php?action=wxminiAdRewardVideoNotify&code=微信登录的code&ordernum=订单号&state=1
elseif($action == 'wxminiAdRewardVideoNotify'){

    $state = (int)$state;

    //获取微信小程序openid
    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    if (empty($code) || empty($ordernum) || !$state) {
        if($callback){
            echo $callback."(".json_encode(array("state" => 200, "info" => "缺少参数")).")";
        }else{
            echo json_encode(array("state" => 200, "info" => "缺少参数"));
        }
        die;
    }

    //广告拉取失败的情况
    if($state == 2){
        if($callback){
            echo $callback."(".json_encode(array("state" => 200, "info" => "广告获取失败")).")";
        }else{
            echo json_encode(array("state" => 200, "info" => "广告获取失败"));
        }
        die;
    }

    $url = "https://api.weixin.qq.com/sns/jscode2session?appid=" . $cfg_miniProgramAppid . "&secret=" . $cfg_miniProgramAppsecret . "&js_code=" . $code . "&grant_type=authorization_code";

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0); //证书检查
    $result = curl_exec($curl);
    curl_close($curl);

    $data = json_decode($result);
    $data = objtoarr($data);

    $errcode = (int)$data['errcode'];
    $errmsg = $data['errmsg'];

    //验证code
    if($errcode != 0){
        if($callback){
            echo $callback."(".json_encode(array("state" => 200, "info" => $errmsg)).")";
        }else{
            echo json_encode(array("state" => 200, "info" => $errmsg));
        }
        die;
    }

    //验证订单
    $sql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $_id = (int)$ret[0]['id'];
        
        //更新订单状态
        $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `state` = '$state' WHERE `id` = '$_id'");
        $dsql->dsqlOper($sql, "update");

        $uid = $ret[0]['uid'];
        $body = $ret[0]['body'];
        $amount = $ret[0]['amount'];
        $paytype = $ret[0]['paytype'];
        $pubdate = $ret[0]['pubdate'];

        $bodyArr = unserialize($body);

        $cityid = $bodyArr['cityid'];
        $module = $bodyArr['module'];
        $temp   = $bodyArr['temp'];
        $aid    = $bodyArr['aid'];
        $title  = $bodyArr['title'];
        $url    = serialize($bodyArr['url']);

        //增加订单记录
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_pay_phone` (`ordernum`, `cityid`, `uid`, `module`, `temp`, `aid`, `title`, `url`, `paytype`, `amount`, `pubdate`) VALUES ('$ordernum', '$cityid', '$uid', '$module', '$temp', '$aid', '$title', '$url', '', '$amount', '$pubdate')");
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'siteConfig', 'payPhone', 0, 'insert', '看广告查看电话_微信小程序('.$module.'=>'.$temp.'=>'.$aid.')', '', $sql);            

        //删除5分钟之前的看广告解锁电话订单记录
        $_time = GetMkTime(time()) - 300;
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `paytype` = '' AND `pubdate` < " . $_time);
        $dsql->dsqlOper($sql, "update");

        //请求错误，请重试！
        if($callback){
            echo $callback."(".json_encode(array("state" => 100, "info" => "success")).")";
        }else{
            echo json_encode(array("state" => 100, "info" => "success"));
        }
        die;

    }
    else{
        if($callback){
            echo $callback."(".json_encode(array("state" => 200, "info" => "订单不存在或已经过期，请重新下单！")).")";
        }else{
            echo json_encode(array("state" => 200, "info" => "订单不存在或已经过期，请重新下单！"));
        }
        die;
    }



}else{
	// 前台异步请求时方便获取分站子区域
	if(empty($template) && strstr($_SERVER['HTTP_REFERER'], ".php") === false){
		$template = "page";
	}

	if($template == 'complain'){
		$action = 'complain';
	}

	//获取接口数据
	$handels = new handlers($service, $action);

    if($action == 'paySuccess'){
        $param = array();
    }

    if($action == 'pay' && isApp() && !$final){
        $param['final'] = 1;
    }

	$return = $handels->getHandle($param);

	if($pageInfo == 1 && $return['state'] == 100){
		$return = $return['info']['pageInfo'];
	}

}

//更新附件的浏览次数
updateAttachmentClickSql();

//输出到浏览器
if($callback){
	if(isset($param['dataType'])){
		if($param['dataType'] == 'html'){
			echo $return['info'];
			return;
		}
	}
    header("Content-type: application/json");
	echo $callback."(".json_encode($return, JSON_UNESCAPED_UNICODE).")";
}else{
	if(isset($param['dataType'])){
		if($param['dataType'] == 'html'){
			echo $return['info'];
			return;
		}
	}
    header("Content-type: application/json");
	echo json_encode($return, JSON_UNESCAPED_UNICODE);
}
