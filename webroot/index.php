<?php
//系统核心配置文件
require_once(dirname(__FILE__).'/include/common.inc.php');

//域名检测
$httpHost  = $_SERVER['HTTP_HOST'];  //来访域名

//获取访问详情  兼容win
$reqUri = $_SERVER["HTTP_X_REWRITE_URL"];
if($reqUri == null){
	$reqUri = $_SERVER["HTTP_X_ORIGINAL_URL"];
	if($reqUri == null){
		$reqUri = $_SERVER["REQUEST_URI"];
	}
}

parse_str(parse_url($reqUri, PHP_URL_QUERY), $params);
$reqQuery = http_build_query($params);
$reqUri = str_replace('?'.$_SERVER['QUERY_STRING'], '', $reqUri);
$reqUri .= (!empty($reqQuery) ? '?' . $reqQuery : '');
$reqUri = addslashes(strip_tags(trim(preg_replace('/(\'|\")/', '', $reqUri))));

$service = 'siteConfig';

//绑定独立域名配置
$domainPart = "";
$domainIid = 0;

//城市分站域名类型  0主域名  1子域名  2子目录  3三级域名   默认为子目录
$cityDomainType = 0;
// 绑定的域名是否属于会员中心
$domainIsMember = false;

//模块域名类型   0默认为子目录  1主域名  2子域名
$siteModuleDomainType = 0;

$dirDomain = $cfg_secureAccess . $httpHost . $reqUri;
$todayDate = GetMkTime(time());
$cfg_basehost_ = str_replace("www.", "", $cfg_basehost);
if($cfg_basehost_ != str_replace("www.", "", $httpHost) && empty($_GET['service'])){

	//全域名匹配数据库是否存在
	$httpHost_ = str_replace("www.", "", $httpHost);
	$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$httpHost' OR `domain` = '$httpHost_'");
	$results = $dsql->dsqlOper($sql, "results");
	if($results && is_array($results)){

		$domain     = $results[0]['domain'];
		$module     = $results[0]['module'];
		$domainPart = $results[0]['part'];
		$domainIid  = $results[0]['iid'];
		$expires    = $results[0]['expires'];
		$note       = $results[0]['note'];

		//判断是否过期
		if($todayDate < $expires || empty($expires)){
			 $service = $module;

		}else{
			die($note);
		}

		//分站域名验证
		if($module == 'siteConfig' && $domainPart == 'city'){
			$cityDomainType = 0;
			$city = $domain;
		}

		//模块绑定独立域名
		if($module != 'siteConfig' && $domainPart == 'config'){
			$siteModuleDomainType = 1;
		}

		if($module == "member"){
			$domainIsMember = true;
		}

	//二级、三级域名
	}else{
		$httpHostSub = str_replace(".".$cfg_basehost_, "", $httpHost);

		//三级域名
		if(strstr($httpHostSub, '.')){
			$httpHostSub_ = $httpHostSub;
			$httpHostSubArr = explode('.', $httpHostSub_);
			$httpHostSub_ = $httpHostSubArr[1];  //提取出城市域名

			//这里还需要再验证一次城市绑定主域名，模块绑定子域名的情况，例：城市绑定：suzhou.com，模块绑定：article.suzhou.com
			$hostDomain_ = str_replace($httpHostSubArr[0] . ".", "", $httpHost_);
			$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$hostDomain_'");
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$isSubMainDomain = true;
				$httpHostSub = $hostDomain_;

			}else{
				//这里还需要再次验证城市绑定主域名，模块绑定子域名的情况，例：article.beijing.ihuoniao.cn
				$hostDomain_ = str_replace("." . $cfg_basehost, "", $httpHost_);

				//这里还需要再验证一次城市绑定主域名，模块绑定子域名的情况，例：城市绑定：www.suzhou.com，模块绑定：article.suzhou.com
				//与上面不一样的地方是带www了
				if(substr_count($hostDomain_, '.') == 2){
					$hostDomain_ = 'www.' . str_replace($httpHostSubArr[0] . ".", "", $httpHost_);
					$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$hostDomain_'");
					$results = $dsql->dsqlOper($sql, "results");
					if($results){
						$isSubMainDomain = true;
						$httpHostSub = $hostDomain_;
					}

				//三级域名
				}else{
					if(strstr($hostDomain_, '.')){
						$hostDomain_1 = $hostDomain_;
						$hostDomainArr = explode('.', $hostDomain_1);
						$httpHostSub_ = $httpHostSubArr[1];  //提取出城市域名

						$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$httpHostSub_'");
						$results = $dsql->dsqlOper($sql, "results");
						if($results){
							$isSubMainDomain = true;
							$httpHostSub = $httpHostSub_;
						}
					}
				}


			}
		}

		//二级域名
		$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$httpHostSub'");
		$results = $dsql->dsqlOper($sql, "results");
		if($results && is_array($results)){

			$domain     = $results[0]['domain'];
			$module     = $results[0]['module'];
			$domainPart = $results[0]['part'];
			$domainIid  = $results[0]['iid'];
			$expires    = $results[0]['expires'];
			$note       = $results[0]['note'];

			//判断是否过期
			if($todayDate < $expires || empty($expires)){
				 $service = $module;

			}else{
				die($note);
			}

			//分站域名验证
			if($module == 'siteConfig' && $domainPart == 'city'){
				$cityDomainType = 1;
				$city = $domain;
			}

			//模块绑定独立域名
			if($module != 'siteConfig' && $domainPart == 'config'){
				$siteModuleDomainType = 2;
			}

			//是否多城市
			$sql = $dsql->SetQuery('SELECT count(*) totalCount FROM `#@__site_city`');
			$ret = (int)$dsql->getOne($sql);
			if($ret == 1){
				//修复单城市，多模块无法访问内页问题
				$cityDomainType = 3;
				$httpHostSubArr = explode('.', $httpHostSub);
			}elseif($httpHostSubArr){
				$cityDomainType = 3;
			}

			if($module == "member"){
				$domainIsMember = true;
			}

		//域名不存在
		}else{

			// print_r($httpHostSub_);die;

			// die("<center><br /><br />域名不存在，请确认后重试1！<br /><br />The domain name does not exist. Please confirm and try again 1!</center>");
		}


	}

//子目录的情况
}else{

	$reqUriArr = explode("/", $reqUri);
	$subDomain = $reqUriArr[1];
	$subDomain = explode("?", $subDomain);
	$subDomain = $subDomain[0];
	$subDomain = explode("-", $subDomain);
	$subDomain = $subDomain[0];

	if($subDomain != "user"){
		$sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$subDomain'");
		$results = $dsql->dsqlOper($sql, "results");
		if($results && is_array($results)){

			$domain     = $results[0]['domain'];
			$module     = $results[0]['module'];
			$domainPart = $results[0]['part'];
			$domainIid  = $results[0]['iid'];
			$expires    = $results[0]['expires'];
			$note       = $results[0]['note'];

			//判断是否过期
			if($todayDate < $expires || empty($expires)){
				 $service = $module;

			}else{
				die($note);
			}

			//分站域名验证
			if($module == 'siteConfig' && $domainPart == 'city'){
				$cityDomainType = 2;
				$city = $domain;
			}

			if($module == "member"){
				$domainIsMember = true;
			}

		}else{

			if($reqUri != '/' && !empty($reqUri) && !strstr($reqUri, '.html')){
				// header ("location:/404.html");
				// die;
			}
		}
	}else{
		$domainIsMember = true;
	}

}
//域名检测 e


//管理授权登录会员账号
if($action == 'authorizedLogin' && $userLogin->getUserID() != -1 && $id){

    checkPurview("authorizedLogin");

	$sql = $dsql->SetQuery("SELECT `password`, `username`, `nickname` FROM `#@__member` WHERE `id` = " . $id);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){

        adminLog("授权登录用户账号", "id=>" . $id . ",username=>" . $ret[0]['username'] . ",nickname=>" . $ret[0]['nickname']);

		$userLogin->keepUserID = $userLogin->keepMemberID;
		$userLogin->userID = $id;
		$userLogin->userPASSWORD = $ret[0]['password'];
		$userLogin->keepUser();

        if($redirect){
            header("location:" . $redirect);
        }else{
            $userDomain = getUrlPath(array("service" => "member", "type" => "user"));
            header("location:" . $userDomain);
        }
		die;
	}
}

//小程序授权登录
//不含手机号码
if($action == 'miniProgramLogin' && $_GET['key']){
	$RenrenCrypt = new RenrenCrypt();
	$userinfo = $RenrenCrypt->php_decrypt(base64_decode($_GET['key']));
	$userinfo = explode('@@@@', $userinfo);

	$unionid = $userinfo[0];
	$openid = $userinfo[1];
	$field_session = $userinfo[2];

	$fieldSessionArr = explode('#', $field_session);
	$expireTime = (int)$fieldSessionArr[1];

    //删除登录成功后跳转链接中的强制退出标识
    $redirect = str_replace('forcelogout', 'loginsuccess', $redirect);

	//授权登录链接地址有效期10秒钟
	if(time()-$expireTime > 10){
		if(!$redirect){
			header("location:" . $redirect);
		}else{
			header("location:" . $cfg_secureAccess.$cfg_basehost . '/login.html');
		}
		die;
	}

	$sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `wechat_conn` = '$unionid' AND `wechat_mini_openid` = '$openid' AND `wechat_mini_session` = '$field_session'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$userLogin->keepUserID = $userLogin->keepMemberID;
		$userLogin->userID = $ret[0]['id'];
		$userLogin->userPASSWORD = $ret[0]['password'];
		$userLogin->keepUser();

		if(!$redirect){
			$redirect = getUrlPath(array('service' => 'member', 'type' => 'user'));
		}

		//小程序端兼容
		if($_GET['path']){
			header("location:" . $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=wxMiniProgramLogin&uid=' . $_GET['uid'] . '&access_token=' . $_GET['access_token'] . '&refresh_token=' . $_GET['refresh_token'] . '&path=' . $_GET['path']);

		}else{
			header("location:" . $redirect);
		}
		die;
	}
}

//微信小程序手机授权登录
if($action == 'wxMiniProgramLogin' && $_GET['key']){
	$RenrenCrypt = new RenrenCrypt();
	$userinfo = $RenrenCrypt->php_decrypt(base64_decode($_GET['key']));
	$userinfo = explode('@@@@', $userinfo);

	$unionid = $userinfo[0];
	$openid = $userinfo[1];
	$field_session = $userinfo[2];
	$phone = $userinfo[3];

	$fieldSessionArr = explode('#', $field_session);
	$expireTime = (int)$fieldSessionArr[1];

    //删除登录成功后跳转链接中的强制退出标识
    $redirect = $redirect ? $redirect : $_GET['url'];
    $redirect = preg_replace("/forcelogout/", 'loginsuccess', $redirect);

	//授权登录链接地址有效期10分钟，考虑到需要维护个人资料，时间需要设置长一点
	// if(time()-$expireTime > 60 * 10){
	// 	if($redirect){
	// 		header("location:" . $redirect);
	// 	}else{
	// 		header("location:" . $cfg_secureAccess.$cfg_basehost . '/login.html');
	// 	}
	// 	die;
	// }

	// $sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `phone` = '$phone' AND `wechat_mini_openid` = '$openid' AND `wechat_mini_session` = '$field_session'");
	$sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `phone` = '$phone' AND `state` = 1");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$userLogin->keepUserID = $userLogin->keepMemberID;
		$userLogin->userID = $ret[0]['id'];
		$userLogin->userPASSWORD = $ret[0]['password'];
		$userLogin->keepUser();

		if(!$redirect){
			$redirect = getUrlPath(array('service' => 'member', 'type' => 'user'));
		}

        $_token = 'uid=' . $_GET['uid'] . '&access_token=' . $_GET['access_token'] . '&refresh_token=' . $_GET['refresh_token'];

        if($redirect && !strstr($redirect, 'access_token')){
            $redirect .= (strstr($redirect, '?') ? '&' : '?') . $_token;
        }

        $redirect = str_replace('loginwh', 'huoniaowh', $redirect);
        $redirect = str_replace('loginlg', 'huoniaolj', $redirect);
        $redirect = str_replace('logindh', 'huoniaodh', $redirect);

		//小程序端兼容
		// if($_GET['path']){
			header("location:" . $cfg_secureAccess . $cfg_basehost . '/include/json.php?action=wxMiniProgramLogin&' . $_token . '&path=' . urlencode($_GET['path']) . '&url=' . urlencode($redirect));

		// }else{
		// 	header("location:" . $redirect);
		// }
		die;
	}
}

//抖音小程序手机授权登录
if($action == 'byteMiniProgramLogin' && $_GET['key']){
	$RenrenCrypt = new RenrenCrypt();
	$userinfo = $RenrenCrypt->php_decrypt(base64_decode($_GET['key']));
	$userinfo = explode('@@@@', $userinfo);

	$unionid = $userinfo[0];
	$openid = $userinfo[1];
	$field_session = $userinfo[2];
	$phone = $userinfo[3];

	$fieldSessionArr = explode('#', $field_session);
	$expireTime = (int)$fieldSessionArr[1];

	//授权登录链接地址有效期10秒钟
	if(time()-$expireTime > 10){
		if(!$redirect){
			header("location:" . $redirect);
		}else{
			header("location:" . $cfg_secureAccess.$cfg_basehost . '/login.html');
		}
		die;
	}

	$sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `douyin_conn` = '$unionid'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$userLogin->keepUserID = $userLogin->keepMemberID;
		$userLogin->userID = $ret[0]['id'];
		$userLogin->userPASSWORD = $ret[0]['password'];
		$userLogin->keepUser();

		if(!$redirect){
			$redirect = getUrlPath(array('service' => 'member', 'type' => 'user'));
		}
		header("location:" . $redirect);
		die;
	}
}

//QQ小程序授权登录
if($action == 'qqMiniProgramLogin' && $_GET['key']){
	$RenrenCrypt = new RenrenCrypt();
	$userinfo = $RenrenCrypt->php_decrypt(base64_decode($_GET['key']));
	$userinfo = explode('@@@@', $userinfo);

	$_id = (int)$userinfo[0];
	$_unionid = $userinfo[1];
	$_time = (int)$userinfo[2];

	//授权登录链接地址有效期10秒钟
	if(time()-$_time > 10){
		header("location:" . $cfg_secureAccess.$cfg_basehost . '/login.html');
		die;
	}

	$sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `qq_conn` = '$_unionid' AND `id` = '$_id'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$userLogin->keepUserID = $userLogin->keepMemberID;
		$userLogin->userID = $ret[0]['id'];
		$userLogin->userPASSWORD = $ret[0]['password'];
		$userLogin->keepUser();

		if(!$redirect){
			$redirect = $cfg_seccodestatus . $cfg_basehost;
		}
		header("location:" . $redirect);
		die;
	}
}


//路由分配
$requestPathArr_ = explode('/', $reqUri);

$template_ = explode("?", $requestPathArr_[1]);
$template = str_replace('.html', '', $template_[0]);

//特殊文件
if($template == 'status.cgi'){
    header('HTTP/1.1 404');
    die;
}

$singlePageTemplate = array(
	//会员相关
	'member' => array(
		'complain', 'login_popup', 'login', 'loginCheck', 'loginFrame', 'sso', 'logout', 'fpwd', 'resetpwd', 'register', 'registerCheck', 'registerCheck_v1', 'registerSuccess',
		'registerVerifyEmail', 'memberVerifyEmail', 'registerVerifyPhone', 'memberVerifyPhone', 'getUserInfo', 'bindMobile', 'suggestion'
	),
);

//重置特殊情况下单页的服务名
foreach ($singlePageTemplate as $key => $value) {
	foreach ($value as $k => $v) {
		if(strstr($template, $v)){
			$service = $key;
			$domainIsMember = true;
			$isSystemPage = true;
		}
	}
}

//如果只开通了一个模块，service直接使用这个模块
$sql = $dsql->SetQuery("SELECT `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''");
$siteModule = $dsql->dsqlOper($sql, "results");
if(count($siteModule) == 1 && $module != 'business'){
	$module = $siteModule[0]['name'];
}

$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_city` WHERE `state` = 1");
$siteCityCount = (int)$dsql->getOne($sql);

if((strstr($reqUri, 'http') || count($requestPathArr_) < 3) && strstr($requestPathArr_[1], '.html') && ($cityDomainType == 0 || $isSystemPage)){

	// $service = $domainIsMember ? "member" : $service;
	$service = $domainIsMember ? "member" : ($isSystemPage ? $service : ($module ? $module : $service) );
	$template = checkPagePath($service, $template, $reqUri);
}else{

	$requestPath = str_replace('.html', '', $reqUri);
	$requestPath = explode("?", $requestPath);
	$requestPathArr = explode('/', $requestPath[0]);
	//子目录   结构：/城市/模块/页面   例：ihuoniao.cn/suzhou/article/list-1.html
	if($cityDomainType == 2){

		//特殊情况过滤，有时会出现/sz/video/circle/detail.html两个模块路径的情况，这里强制删除第一个模块
		//排除/sz/article/video.html
		if(getModuleTitle(array('name' => $requestPathArr[3])) && $requestPathArr[2] != 'article' && $requestPathArr[3] != 'video'  && $requestPathArr[3] != 'job'){
			array_splice($requestPathArr, 2, 1);
		}

		$requestPathArr2Module = '';
		$requestPathArr2 = $requestPathArr[2];

		//查询访问目录的所属模块
        $_moduleDomain = '';
		$sql = $dsql->SetQuery("SELECT `module` FROM `#@__domain` WHERE `domain` = '$requestPathArr2'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
            $_moduleDomain = $requestPathArr2;
			$requestPathArr2Module = $ret[0]['module'];
		}

		if(count($siteModule) == 1 && $requestPathArr2Module != 'business'){
			$service = $module;
			// $pagePath = $requestPathArr[3] ? $requestPathArr[3] : ($requestPathArr[2] == $service || $_moduleDomain == $requestPathArr2 ? 'index' : $requestPathArr[2]);

            $pagePath = 'index';

            if($requestPathArr[3]){
                $pagePath = $requestPathArr[3];
            }
            // elseif($requestPathArr[2] == $service || $_moduleDomain == $requestPathArr2){
            //     $pagePath = 'index';
            // }
            //上面的逻辑暂时注释，如果使用的话会出现一个问题：
            //比如：只有一个招聘模块时，详情页路由为xxx.com/sz/job.html?id=1 或者 xxx.com/job.html?id=1  此时，用上面的逻辑，职位详情页将会被index渲染
            elseif($requestPathArr[2]){
                $pagePath = $requestPathArr[2];
            }

		}else{

			//如果只有一个分站，并且模块绑定了独立域名
			if($siteCityCount == 1 && $siteModuleDomainType == 1){
				$pagePath = $requestPathArr[2] ? $requestPathArr[2] : $requestPathArr[1];  //页面
				$pagePath = empty($pagePath) ? 'index' : $pagePath;
			}else{
				$service = $requestPathArr[2];  //模块
				$pagePath = $requestPathArr[4] ? $requestPathArr[4] : $requestPathArr[3];  //页面
				$pagePath = empty($pagePath) ? 'index' : $pagePath;

				$service = $domainIsMember ? "member" : $service;
			}
		}

		$template = checkPagePath($service, $pagePath, $reqUri);


	//子域名  结构：域名.主域名/模块/页面   例：suzhou.ihuoniao.cn/article/list-1.html
	}elseif($cityDomainType == 1){

		$requestPathArr1Module = '';
		$requestPathArr1 = $requestPathArr[1];

		//查询访问目录的所属模块
		$sql = $dsql->SetQuery("SELECT `module` FROM `#@__domain` WHERE `domain` = '$requestPathArr1'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$requestPathArr1Module = $ret[0]['module'];
		}

		if(count($siteModule) == 1 && $requestPathArr1Module != 'business'){
			$service = $module;
			$pagePath = $requestPathArr[1];
		}else{
			$service = $requestPathArr[1];  //模块
			$pagePath = $requestPathArr[3] ? $requestPathArr[3] : ($requestPathArr[2] ? $requestPathArr[2] : ($requestPathArr[1] == $service || $requestPathArr1Module == 'member' ? 'index' : $requestPathArr[1]));  //页面
			$pagePath = empty($pagePath) ? 'index' : $pagePath;

			$service = $domainIsMember ? "member" : $service;
		}

		$template = checkPagePath($service, $pagePath, $reqUri);


	//主域名  结构：域名/模块/页面   例：www.suzhou.com/article/list-1.html
	}elseif($cityDomainType == 0){

		$requestPathArr2Domain = '';

		//查询访问目录的所属模块
        if($module){
            $sql = $dsql->SetQuery("SELECT `module`, `domain` FROM `#@__domain` WHERE `module` = '$module'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $requestPathArr2Domain = $ret[0]['domain'];
            }
        }

		//如果只有一个分站，并且模块绑定了独立域名
		if($siteCityCount == 1 && $siteModuleDomainType == 1){
			$pagePath = $requestPathArr[2] ? $requestPathArr[2] : $requestPathArr[1];  //页面
			$pagePath = empty($pagePath) ? 'index' : $pagePath;
		}else{
			if($module != "member" && $domain != $requestPathArr[1]){
				// $service = $module ? $module : $service;
				// array_unshift($requestPathArr, '');
				// $requestPathArr[1] = $module;
			}
	        if($requestPathArr[1] && count($siteModule) > 1){
	            $service = $requestPathArr[1];  //模块
	        }
			$service = $domainIsMember ? "member" : ($module ? $module : $service);

			$pagePath = $requestPathArr[3] ? $requestPathArr[3] : ($requestPathArr[2] ? $requestPathArr[2] : ($requestPathArr[1] == $service || $requestPathArr[1] == $requestPathArr2Domain || $service == 'member' ? 'index' : $requestPathArr[1]));  //页面
			$pagePath = empty($pagePath) ? 'index' : $pagePath;
		}

		$template = checkPagePath($service, $pagePath, $reqUri);

	//三级域名  结构：模块.城市.主域名/页面  例：article.suzhou.ihuoniao.cn/list-1.html
	//域名检测的地方已经将城市筛选出来，这里只需要将模块及页面取出来
	}elseif($cityDomainType == 3 && $httpHostSubArr){

		$service = $httpHostSubArr[0];  //模块

		//如果是城市主域名，模块二级域名的情况，例：article.suzhou.com
		if($isSubMainDomain){
			$pagePath = $requestPathArr[2] ? $requestPathArr[2] : $requestPathArr[1];  //页面
		}else{
			$pagePath = $requestPathArr[2] ? $requestPathArr[2] : $requestPathArr[1];  //页面
		}
		$pagePath = empty($pagePath) ? 'index' : $pagePath;

		$service = $domainIsMember ? "member" : $service;

		$template = checkPagePath($service, $pagePath, $reqUri);

	}


}

//过滤GET请求中service参数的内容，只保留字母和数字
preg_match_all("/[a-zA-Z0-9]/u", $_GET['service'], $_get_service);
$_get_service = join('', $_get_service[0]);

preg_match_all("/[a-zA-Z0-9]/u", $service, $serviceArr);
$service = join('', $serviceArr[0]);

$service = $_get_service ? $_get_service : ($domainIsMember ? "member" : $service);
$service = !empty($cfg_defaultindex) && ($service == 'siteConfig' || empty($service)) ? $cfg_defaultindex : (!empty($service) ? $service : "siteConfig");

//如果设置了默认首页为自定义模块，自定义模块的标识为数字类型，此处主要用于将商家模块设为首页
if(is_numeric($service)){

	$service = (int)$service;
	$sql = $dsql->SetQuery("SELECT `link`, `type` FROM `#@__site_module` WHERE `id` = " . $service);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$moduleLink = $ret[0]['link'];
		$moduleType = $ret[0]['type'];

		//商家域名
		$domainInfo = getDomain('business', 'config');
		$businessDomain = $domainInfo['domain'];

		//识别是否为商家模块，如果是商家
		if($moduleType == 1 && strstr($moduleLink, $businessDomain) && !strstr($moduleLink, '.html')){
			$service = 'business';

		}else{

			//直接跳转到自定义链接，但是这种情况一般不会出现，不要将网站内页设置为首页，否则会跳转死循环！！！
			header("location:" . $moduleLink);
			die;
		}

	//失败的情况，跳转至500页面
	}else{
		header('HTTP/1.0 500 Forbidden');
		echo '<title>500 Forbidden</title>';
		echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">';
		echo '<h1><center>默认首页验证失败，请管理员确认配置信息！</center></h1>';
		echo '<hr><center>By Huoniao CMS</center>';
		die;
	}

}

//指定模板
$template = !empty($_GET['template']) ? $_GET['template'] : (!empty($template) ? $template : "index");
$template = RemoveXSS($template);

//只有一个自助建站模块时
if($service == 'website' && $cfg_defaultindex == 'website' && count($siteModule) == 1 && (strstr($reqUri, 'preview') || strstr($reqUri, 'site'))){
	$template = checkPagePath($service, $requestPathArr[1], $reqUri);
}


$config_path = HUONIAOINC."/config/";
$templates   = str_replace(".php", "", $template).".html";

//验证模块状态
$service = $service == "supplier" ? "member" : $service;
if($service != "siteConfig" && $service != "member" && $service != "business"){
	$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_module` WHERE `name` = '$service' AND `state` = 0 AND `type` = 0");
	$ret = (int)$dsql->getOne($sql);
	if($ret == 0){
	    //判断文件类型
		$ftype = end(explode('.', $reqUri));
        if(in_array($ftype, array('jpg', 'jpeg', 'gif', 'png', 'bmp'))){
            header("location:".$cfg_secureAccess.$cfg_basehost."/static/images/404.jpg?from=index_392&uri=" . $reqUri);
            die;
        }else {
            header('HTTP/1.1 404');
            if($cfg_siteDebug){
                echo "文件 " . $reqUri . ' 未找到。';
            }
            die;
			if($reqUri != '/favicon.ico' && $reqUri != '/robots.txt' && !strstr($reqUri, 'well-known') && !strstr($reqUri, '.js.map')){
	            header("location:" . $cfg_secureAccess . $cfg_basehost . "?from=index_395&uri=" . $reqUri);
			}
            die;
        }
	}
}

//关闭PC端
if(!isMobile() && $template != "mobile" && $cfg_pcState && $service != 'member' && $template != "protocol" && $template != "about" && $template != "help" && $template != "feedback" && $template != "help-detail" && $template != "notice" && $template != "notice-detail" && $template != "middlejump" && $template != "wmsj" && $template != "qishou"){
	header('location:' . $cfg_basedomain . '/mobile.html');
	die;
}

//引入独立业务
// if(is_file(HUONIAOROOT."/api/private/index.php")){
// 	include(HUONIAOROOT."/api/private/index.php");
// }

//当前登录会员ID
$userid = $userLogin->getMemberID();

if($_GET['fromShare']){
	PutCookie('fromShare', $_GET['fromShare'], $cfg_onlinetime * 60 * 60);

    //如果已经登录了，并且是通过扫码的，直接绑定分销关系
    $fromShare_ = $_GET['fromShare'];
    if($fromShare_ && $userid > 0 && $fromShare_!=$userid){
        $userLogin->registGiving($userid, false,false);
    }
}

//由于模板有缓存，导致微信端浏览时加载了非微信端的页面，出现微信配置信息没有获取到的问题，这里不再验证是否在微信端，只要配置了微信参数，就直接加载微信JSSDK
if($cfg_wechatAppid && $cfg_wechatAppsecret){
    $handler = false;
	$jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
	$signPackage = $jssdk->getSignPackage();
	$huoniaoTag->assign('wxjssdk_appId', $signPackage['appId']);
	$huoniaoTag->assign('wxjssdk_timestamp', $signPackage['timestamp']);
	$huoniaoTag->assign('wxjssdk_nonceStr', $signPackage['nonceStr']);
	$huoniaoTag->assign('wxjssdk_signature', $signPackage['signature']);
	$huoniaoTag->assign('wxjssdk_url', $signPackage['url']);
    
    //由于分站绑定了独立公众号，这里需要判断当前访问的分站是否绑定了独立公众号，如果绑定了，则使用独立公众号的JSSDK
    $cfg_wechatAppid = $signPackage['appId'];
}

//微信JSSDK
if(isWeixin() && isMobile() && $cfg_wechatAppid && $cfg_wechatAppsecret){
	
	//微信自动登录
	$connect_uid = GetCookie("connect_uid");
	$connect_code = GetCookie("connect_code");
	if($cfg_wechatAutoLogin && $userid == -1 && empty($connect_uid) && $template != "login" && $template != "logout" && $template != "register1" && $template != "fpwd" && $template != "registerCheck_v1" && $template != "security" && $template != "loginCheck" && !strstr($_SERVER['HTTP_REFERER'], 'setting.html')){
		putSession('loginRedirect', $cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER["REQUEST_URI"]);
		PutCookie('loginRedirect', $cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER["REQUEST_URI"], $cfg_onlinetime * 60);
		putSession('state', md5(uniqid(rand(), TRUE)));
		$url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=";
		$redirect_uri = urlencode($cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=wechat");
		$scope = $cfg_wechatType == "1" ? "snsapi_userinfo" : "snsapi_base";
		$login_url = $url.$cfg_wechatAppid."&redirect_uri=".$redirect_uri."&response_type=code&scope=".$scope."&state=".$_SESSION['state']."#wechat_redirect";
		header("Location:$login_url");
		die;
	}

	//已经登录但没有绑定手机的，继续跳转到绑定页面
	if(!empty($connect_uid) && !empty($connect_code) && $template != "bindMobile" && $cfg_wechatBindPhone && $template != "login" && $template != "logout" && $template != "register" && $template != "fpwd" && $template != "registerCheck_v1" && $template != "security"){
		if($userid > -1){
			PutCookie("connect_uid", "");
			if(!isset($_SESSION['loginRedirect'])){
				header("location:".$cfg_secureAccess.$cfg_basehost);
			}else{
				header("location:" . $_SESSION['loginRedirect']);
			}
			die;
		}elseif($userid == -1){
			PutCookie("connect_uid", "");
			header("location:".$cfg_secureAccess.$cfg_basehost . "/login.html");
			die;
		}else{
			putSession('loginRedirect', $cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER["REQUEST_URI"]);
			header('Location:'.$cfg_secureAccess.$cfg_basehost.'/bindMobile.html?from=4&type='.$connect_code);
			die;
		}
	}
}


//入口检测
$_getCityid = (int)$_GET['cityid'];  //URL传过来指定的城市ID
if($_getCityid){
	$siteCityInfo = cityInfoById($_getCityid);
    PutCookie('siteCityInfo', json_encode($siteCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $siteCityInfo['type'] == 0 ? $city : "");
}else{
    $siteCityInfoCookie = GetCookie('siteCityInfo');
    if($siteCityInfoCookie && empty($city)){
        $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
        if(is_array($siteCityInfoJson)){
            $siteCityInfo = $siteCityInfoJson;
        }
    }
}

if($module != "website" && $do != "courier" && $template != "protocol" && $template != "about" && $template != "help" && $template != "feedback" && $template != "mobile" && $template != "middlejump"){
	$siteCityInfo = checkSiteCity();
}

//当前城市信息
if($siteCityInfo){
	$city = $siteCityInfo['domain'];
	$siteCityName = $siteCityInfo['name'];

	$huoniaoTag->assign('siteCityInfo', $siteCityInfo);
	$huoniaoTag->assign('siteCityInfoArr', json_encode($siteCityInfo, JSON_UNESCAPED_UNICODE));

	if($siteCityInfo['cityid']){
	    $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $siteCityInfo['cityid']);
	    $ret = $dsql->dsqlOper($sql, "results");
	    if(is_array($ret)){
	        $advancedConfig = $ret[0]['config'] ? $ret[0]['config'] : '';
	        $advancedConfigArr = $advancedConfig ? unserialize($advancedConfig) : array();
	        if($advancedConfigArr){
	            $siteCityAdvancedConfig = $advancedConfigArr;
	        }
	    }

		//更新会员所在分站
		if($userid > -1 && $siteCityInfo){
			$_userinfo_ = $userLogin->getMemberInfo(0, 1);
			$_user_cityid = (int)$_userinfo_['cityid'];
			$_site_cityid = (int)$siteCityInfo['cityid'];

			//系统开启自动更新，或者会员cityid未设置
			if(($cfg_memberCityid && $_user_cityid != $_site_cityid) || !$_user_cityid){
				$sql = $dsql->SetQuery("UPDATE `#@__member` SET `cityid` = '$_site_cityid' WHERE `id` = $userid AND `lock_cityid` = 0");
				$dsql->dsqlOper($sql, "update");
			}
		}
	}
}


//访问独立域名时 获取分站信息
if($dopost == "getSiteCityInfo"){
    $siteCityInfo = checkSiteCity();
	echo $siteCityInfo['cityid'];
	die;
}


//引入当前模块配置文件
if($service != "siteConfig" && $service != "member"){
	$serviceInc = $config_path.$service.".inc.php";
	if(file_exists($serviceInc)){
		include $serviceInc;
	}else{
		die("<center><br /><br />服务名不存在！<br /><br />The service name does not exist!</center>");
	}
}


//判断模块是否开启自定义路由，用于前端使用vue等框架时，有自己的路由规则，开启后，程序将只渲染模板目录中的index.html
$customRouterRule = 0;

//声明以下均为接口类
$handler = true;

//获取当前模块配置参数
$moduleConfig = getModuleConfig($service);

if(!is_array($moduleConfig)) die('<center><br /><br />模块数据获取失败！<br /><br />Module data acquisition failed!</center>');

//如果系统配置了子频道为大首页、当访问大首页时自动跳转至子频道域名，前提是子频道设置的为二级域名，如果不做跳转，同步登录和登录浮动窗口为报错误
$moduleDomain = $moduleConfig['channelDomain'];
if($moduleConfig['subDomain'] == 1 && !empty($cfg_defaultindex) && $cfg_defaultindex != "siteConfig" && $cfg_defaultindex == $service && ($httpHost != str_replace("http://", "", $moduleDomain) || $httpHost != str_replace("https://", "", $moduleDomain))){
	header("location:".$moduleDomain."?from=index_832");  //检查模块域名类型是否与分站域名类型相符
	die;
}

//输入当前模块配置参数
$configName = array_keys($moduleConfig);
foreach ($configName as $config) {
	$huoniaoTag->assign($service.'_'.$config, $moduleConfig[$config]);
}

//注册当前模块函数，用于模板业务功能处理，用于下方1248行处调用
$contorllerFile = HUONIAOROOT.'/api/handlers/'.$service.'.controller.php';
if(file_exists($contorllerFile)){
    require_once($contorllerFile);
    $huoniaoTag->registerPlugin("block", $service, $service);
}

//地图配置
$module_map =  $moduleConfig['map'];
if(!empty($module_map)){
    $cfg_map = $module_map;
    $site_map_key = $moduleConfig['map_key'];
    $site_map_server_key = $moduleConfig['map_server_key'];
    $site_map_apiFile = $moduleConfig['map_apiFile'];
}
$huoniaoTag->assign('site_map', $cfg_map);
$huoniaoTag->assign('site_map_key', $site_map_key);
$huoniaoTag->assign('site_map_server_key', $site_map_server_key);
$huoniaoTag->assign('site_map_apiFile', $site_map_apiFile);

//高德地图新版
$amap_jscode = '<script>window._AMapSecurityConfig = {securityJsCode:"'.$cfg_map_amap_jscode.'"}; var amap_server_key = "'.$cfg_map_amap_server.'";</script>';
$huoniaoTag->assign('amap_jscode', $amap_jscode);

//自助建站独立域名选项
//需要将php.ini中的allow_url_include开启
if($module == "website" && !empty($domainPart) && !empty($domainIid)){

	//电脑端
	if(!isMobile()){
		//获取URL参数
		$urlParam = array();
		foreach(Array('_GET','_POST') as $_request){
			foreach($$_request as $_k => $_v){
				if($_k != 'template'){
					array_push($urlParam, $_k . "=" . RemoveXSS($_v));
				}
			}
		}

		include($cfg_secureAccess.$cfg_basehost."/website.php?id={$domainIid}&alias={$template}" . ($urlParam ? "&" . join("&", $urlParam) : ""));
		die;

	//移动端跳转
	}else{
		$param = array(
			"service"      => "website",
			"template"     => "site".$domainIid
		);
		$url = getUrlPath($param);
		header("location:".$url);
		die;
	}
}

checkModuleState(array("visitState" => $cfg_visitState, "visitMessage" => $cfg_visitMessage));

//普通频道
if($service != "member"){

	//检查模块状态
	checkModuleState($moduleConfig);

	//设置模板目录
	$tplFloder = $moduleConfig['template'];
	$touchTplFloder = $moduleConfig['touchTemplate'];

    //分站自定义配置
    if($siteCityAdvancedConfig && $siteCityAdvancedConfig[$service]){
        if($siteCityAdvancedConfig[$service]['template']){
            $tempFloder = $siteCityAdvancedConfig[$service]['template'];
            if(file_exists(HUONIAOROOT.'/templates/' . $service . '/' . $tempFloder . '/config.xml')) {
                $tplFloder = $tempFloder;
            }
        }
        if($siteCityAdvancedConfig[$service]['touchTemplate']){
            $tempFloder = $siteCityAdvancedConfig[$service]['touchTemplate'];
            if(file_exists(HUONIAOROOT.'/templates/' . $service . '/touch/' . $tempFloder . '/config.xml') || $tempFloder == 'diy') {
                $touchTplFloder = $tempFloder;
            }
        }
    }

	if(!empty($skin)) $tplFloder = $skin;

	$touchTplFloder = empty($touchTplFloder) ? "default" : $touchTplFloder;

	$ser = $service;
	$tplFloder = $tplFloder . "/";
	$touchTplFloder = $touchTplFloder . "/";

	// 自助建站（移动端）不作下面的验证：$template有冲突
	if($service != "website" || !isMobile()){
		//统计模块数量
		$moduleCount = 0;
		$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''");
		$moduleCount = (int)$dsql->getOne($sql);

		//404、mobile页面
		if($template == "404" || $template == "mobile" || $template == "changecity" || $template == "error" || $template == "appindex" || $template == "tcquan" || $template == "post" || $template == "siteSearch" || $template == '114_homepage' || $template == '114_list' || $template == '114_detail' || $template == 'captcha' || ($cfg_defaultindex != 'siteConfig' && $service != 'waimai' && (($template == 'search' && $service == 'siteConfig') || $template == 'search-list') && isMobile())){

			$tplFloder = "";

			if(($cfg_defaultindex != 'siteConfig' && $template == 'search') || $template != 'search'){
				$touchTplFloder = "";
				$ser = 'siteConfig';
			}

			if(isMobile() && $template != "appindex" && $template != "tcquan" && $template != "post" && $template != "search" && $template != "search-list" && !strstr($template, "114") && $template != 'captcha'){
				$touchTplFloder = "";
				$templates = $template . "_touch.html";
			}elseif((count($siteModule) > 1 && $template == 'search') || $template != 'search'){
				$touchTplFloder = "";
				include HUONIAOINC . "/config/siteConfig.inc.php";
				$touchTplFloder = $cfg_touchTemplate . "/";
			}elseif($template == 'search' || $template == 'search-list'){
                include HUONIAOINC . "/config/siteConfig.inc.php";
                $touchTplFloder = $cfg_touchTemplate . "/";
			    $tplFloder = 'touch/' . $touchTplFloder;
            }

			if($template == "error"){
				$huoniaoTag->assign('msg', htmlspecialchars(RemoveXSS($msg)));
			}
		}
		
		//单页、帮助、协议、公告
		if($template == "about" || $template == "help" || $template == "help-detail" || $template == "notice" || $template == "notice-detail" || $template == "protocol" || $template == "app" || $template == "feedback" || $template == "tousu" || $template == "certification" || $template == "middlejump"){
			$ser = $template == "help-detail" ? "help" : ($template == "notice-detail" ? "notice" : $template);
			$tplFloder = "";
			$touchTplFloder = "";

			$service = 'siteConfig';
			$templates = $template . '.html';  //模块开启自定义路由后会固定使用index.html，这里由于是系统固定单页页，需要重置模板文件

		}
	}

	//自助建站移动版判断用户使用模板
	if($service == "website"){
		// 移动端并且是站点
		if(isMobile() && $id){
			$tplFloder = "skin1/";

			$sql = $dsql->SetQuery("SELECT `touch_temp` FROM `#@__website` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$skin = "";
				if($ret[0]['touch_temp']){
					$skin = $ret[0]['touch_temp'];
					$skin_d = "./templates/website/touch/".$skin;
					if(!is_dir($skin_d)) $skin = "";
				}
				if($skin == ""){
					$dir = "./templates/website/touch";
					$floders = listDir($dir);
					if(!empty($floders)){
				    	$skin = $floders[0];
			    	}
			    }

				$tplFloder = $skin . "/";
			}
			$tpl = "/templates/" . $ser . "/touch/" . $tplFloder;
		}else{
			$tpl = "/templates/" . $ser . "/" . $tplFloder;
		}
	}else{
        //114页面转到siteConfig目录
        if(strstr($template, "114")){
            $tpl = "/templates/" . $ser . "/";
        }
        else{
            $tpl = "/templates/" . $ser . "/" . ((isMobile() && $template != 'captcha' && (!empty($touchTplFloder) || $template == "about" || $template == "protocol" || $template == "help" || $template == "help-detail" || $template == "notice" || $template == "notice-detail" || $template == "feedback" || $template == "tousu" || $template == "certification" || $template == "middlejump")) ? "touch/".$touchTplFloder : $tplFloder);
        }
	}
	
	//APP Page Config
	$tpl = $template == "app" ? $tpl . $type . "/" : $tpl;
	$templates = $template == "app" ? $page.".html" : $templates;

    //diy页面指定目录
    if(!strstr($template, "114") && $template != "search-list" && $template != 'captcha'){
        if((isMobile() && $touchTplFloder == 'diy/') || ($preview == 1 && $service == 'siteConfig' && $template == 'index')){
            $tpl = "/templates/diy/touch/";
            $templates = 'index.html';
        }
    }

    if(isMobile() && $touchTplFloder == 'diy/' && $template == 'search-list'){
        $tpl = $touchTplFloder = "/templates/siteConfig/touch/skin5/";
    }

    //读取模板目录配置文件，判断模板是否使用自定义路由
    $_tplFloderConfig = HUONIAOROOT . $tpl . '/config.xml';
    if(file_exists($_tplFloderConfig)  && !$customRouterRule){
        //解析xml配置文件
        $xml = new DOMDocument();
        libxml_disable_entity_loader(false);
        $xml->load($_tplFloderConfig);
        $data = $xml->getElementsByTagName('Data')->item(0);
        $customRouterRule = (int)$data->getElementsByTagName("router")->item(0)->nodeValue;
    }

//会员频道
}elseif($requestPathArr[1] != 'supplier'){

	// 会员中心绑定主域名时
	if(!isMobile() && !$isSystemPage && (($domainPart == 'user' && $cfg_userSubDomain == 0) || ($domainPart == 'busi' && $cfg_busiSubDomain == 0))){
		$r = $userLogin->checkUserIsLogin("result");
		if($r['uid'] < 0){
			$template = "ssoUserCenter";
			$templates = $template.".html";
			$huoniaoTag->assign('changeUser', $r['changeUser']);
			$huoniaoTag->assign('errorUrl', $r['url']);
			$huoniaoTag->assign('succUrl', $furl);	//登陆成功后跳转页面
		}
	}

	//判断访问类型
	$ischeck = explode($busiDomain, $dirDomain);
    include HUONIAOINC . '/config/business.inc.php';
	//如果是访问的企业会员域名，模板选择企业会员的模板
	if(count($ischeck) > 1 && (substr($ischeck[1], 0, 1) == "/" || substr($ischeck[1], 0, 1) == "" || substr($ischeck[1], 0, 1) == "?") && $template != "ssoUserRedirect" && $template != "ssoUser" && $template != "sso" && $template != "ssoUserCenter"){
		$tpl = "/templates/member/company/";
        $huoniaoTag->assign('userTemplateType', 2);

        if ($customTemplateCheck == 1 && $ischeck[0] == '' && $ischeck[1] == '' && !isMobile() ) {

            $templates = "index2.html";
        }

        //商家功能开关
        $business_state = 1;  //0禁用  1启用
        $businessInc = HUONIAOINC . "/config/business.inc.php";
        if(file_exists($businessInc)){
            require($businessInc);
            $business_state = (int)$customBusinessState;  //配置文件中 0表示启用  1表示禁用  因为默认要开启商家功能
            $business_state = intval(!$business_state);
        }
        if(!$business_state){
            ShowMsg('系统未开启商家服务！', $userDomain, 1);
            die;
        }

	}else{
		$tpl = "/templates/member/";
        $huoniaoTag->assign('userTemplateType', 1);
	}

	if($template == "enter" && isMobile()){
		// $templates = "fabuJoin_touch_popup_3.4.html";
	}

    //移动端收藏页面用新页面
    if($template == 'collect' && isMobile()){
        $templates = 'collection.html';
    }

    //登录记录页面，iOS端会拦截login关键字，这里做路由适配
    if($template == 'denglurecord' && isMobile()){
        $templates = 'loginrecord.html';
    }

	$tpl .= isMobile() && $template != "ssoUserRedirect" && $template != "ssoUser" && $template != "ssoUserCenter" ? "touch/" : "";

}

//如果是骑手端，则不需要单页面路由规则
if($service == 'waimai' && $do == 'courier'){
	$customRouterRule = 0;
}

//遍历所有模块配置文件
//此处是为了让整站在任何模板中通过{#$service_configItem#}的方式直接调取指定频道的基本信息；
//如获取团购频道的名称和域名：{#$tuan_channelName#}，{#$tuan_channelDomain#}
//当前默认只输出：模块名、模块链接，两个参数，如果要输出更多信息，请修改：$sNameParam变量的内容，清空或增加
//开启自定义路由时，不需要此功能，前端都是通过接口的方式加载数据，不需要模板标签，系统首页除外
if(!$customRouterRule || $service == 'siteConfig'){
    $moduleres = array();
    // $modulesql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` WHERE `parentid` = 1 AND `state` = 0 ");
    // $moduleres = $dsql->dsqlOper($modulesql, "results");
    // if(is_array($moduleres)&&$moduleres){

        array_push($moduleres, array('name' =>'business'),array('name' =>'member'),array('name' =>'siteConfig'));

        foreach ($moduleres as $m => $d) {
            if($d['name'] == ''){
                continue;
            }
            $sName = $d['name'];
            
            // $sNameConfig = getModuleConfig($sName);  //获取模块配置信息
            
            // //输出配置信息
            // if(is_array($sNameConfig)){
            //     $sConfigName = array_keys($sNameConfig);
            //     foreach ($sConfigName as $config) {
            //         $huoniaoTag->assign($sName.'_'.$config, $sNameConfig[$config]);
            //     }
            // }

            //注册函数，只对公共服务进行注册，模块类的使用loop标签输出
            if($d['name'] == 'business' || $d['name'] == 'member' || $d['name'] == 'siteConfig'){
                $contorllerFile = dirname(__FILE__).'/api/handlers/'.$sName.'.controller.php';
                if(file_exists($contorllerFile) && $d['name'] != $service){
                    require_once($contorllerFile);
                    $huoniaoTag->registerPlugin("block", $sName, $sName);
                }
            }

        }
    // }

    if(isset($huoniaoTag->tpl_vars['tuan_channelDomain'])){
        $huoniaoTag->assign('tuanDomain', $huoniaoTag->tpl_vars['tuan_channelDomain']);
    }
}


//验证静态页面文件是否存在
$staticHtml = HUONIAOROOT . '/templates_c/html/' . $service . '/' . (isMobile() ? 'touch' : 'pc') . '/' . $template . '/' . $siteCityInfo['cityid'] . '.html';
$csp = (int)$csp; //生成页面时传的参数，用于生成页面时强制使用动态页面
if(file_exists($staticHtml) && !$csp && $requestPathArr[1] != 'supplier'){

    //判断静态页面最后修改时间，如果超过1天，则重新生成表态页面
    $staticHtmlTime = filemtime($staticHtml);
    if($staticHtmlTime < GetMkTime(time()) - 86400){
        $_url = getUrlPath(array('service' => $service, 'param' => 'cityid=' . $siteCityInfo['cityid']));
        createStaticPage($_url, $service, 'index', $siteCityInfo['cityid']);
    }

    $pageSource = file_get_contents($staticHtml);
    if($pageSource){
        die($pageSource);
    }
}


//执行当前页面指定的函数：$template
foreach ($_REQUEST as $key => $value) {
	if(is_array($value)){
		$params[$key] = $value;
	}else{

        if($_REQUEST['rsaEncrypt'] == 1 && (strlen($value) == 172 || strstr($value, '||rsa||'))){
            $params[$key] = rsaDecrypt($value);  //RSA解密
        }else{
            //如果是搜索关键字，去除值中的html标签
            if(strstr($key, 'keyword')){
                $value = strip_tags($value);
            }

            //分页相关
            if($key == 'page' || $key == 'pageSize'){
                $value = (int)($value);
                $value = $value <= 0 ? ($key == 'page' ? 1 : 10) : $value;
                $value = $value > 50000 ? 5000 : $value;
            }

            //id、cityid、state等传一个数字或者多个数字的情况需要对内容过滤
            if($key == 'id' || $key == 'cityid' || $key == 'state' || $key == 'sid'){
                $value = convertArrToStrWithComma($value);
            }

            if(($key == 'lng' || $key == 'lat' || $key == 'userlng' || $key == 'userlat') && $value == 'undefined'){
                $value = '';
            }

            if($key == 'price' && $value == 'pricePlaceholder'){
                $value = '';
            }

		    $params[$key] = addslashes(htmlspecialchars(RemoveXSS($value)));
        }
	}
}

//会员状态
if($userid > -1 && $template != "logout"){

	if($template == "resetpwd"){
		header("location://".$cfg_basehost);
		die;
	}

	$userLogin->keepUserID = $userLogin->keepMemberID;
	$userLogin->keepUser();
	$userinfo = $userLogin->getMemberInfo();
	$huoniaoTag->assign('userinfo', $userinfo);

}

//如果是自定义路由，则固定模板文件为index
$hasFrontFile = false;  //如果已经设置自定义路由但是又想用其他模板文件
$redirectWxmini = (int)$redirectWxmini;
$customRouterRule = $redirectWxmini ? 0 : $customRouterRule;  //如果有redirectWxmini参数，说明是要跳转到微信小程序的，程序上不做拦截，需要到业务的controller中处理
if($customRouterRule){
    if($templates != 'index.html' && file_exists(HUONIAOROOT.$tpl.$templates)){
        $hasFrontFile = true;
    }else{
        $templates = 'index.html';
    }
}

$template = str_replace('<x>', '', $template);

//供应商
if($requestPathArr[1] == 'supplier'){
    $service = 'member';
	$params['action']       = 'supplier';
	$params['partner']      = $requestPathArr[2];
	$params['subordinate']  = $requestPathArr[3];
	$params['template'] = $template;

    //判断接口是否注册
    if (!function_exists($service)) {
        $contorllerFile = HUONIAOROOT.'/api/handlers/'.$service.'.controller.php';
        if(file_exists($contorllerFile)){
            require_once($contorllerFile);
            $huoniaoTag->registerPlugin("block", $service, $service);
        }
    }
    
	$service($params);

    //招聘移动端单独配置
    if(isMobile() && $requestPathArr[2] == 'job'){
        $tpl = "/templates/supplier/" . $requestPathArr[2] . "/touch/";
    }else{
        $tpl = "/templates/supplier/" . $requestPathArr[2] . "/";
    }
	$templates = $requestPathArr[3] ? $requestPathArr[3] . '.html' : "index.html";
}else{
	$params['action'] = $template;
	$params['template'] = $template;

    //模块没有开启时，禁止访问
    global $installModuleArr;
    if($service != 'member' && $service != 'siteConfig' && $service != 'business' && !in_array($service, $installModuleArr)){
        header('HTTP/1.0 404');
        die;
    }

    //自定义路由的页面，无须走controller
    if(!$customRouterRule || $hasFrontFile){

        //判断接口是否注册
        if (!function_exists($service)) {
            $contorllerFile = HUONIAOROOT.'/api/handlers/'.$service.'.controller.php';
            if(file_exists($contorllerFile)){
                require_once($contorllerFile);
                $huoniaoTag->registerPlugin("block", $service, $service);
            }
        }

	    $service($params);
    }
}


//验证码规则
global $cfg_seccodestatus;
$seccodestatus = explode(",", $cfg_seccodestatus);
$loginCode = "";
if(in_array("login", $seccodestatus)){
	$loginCode = 1;
}
$huoniaoTag->assign('loginCode', $loginCode);


//统计会员数量及在线人数
//这里取消获取数据的功能，前端如果有需求，请调用接口获取
// $memberStatistics = array();
// $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__member` WHERE `mtype` = 1 AND `state` = 1 UNION SELECT COUNT(`id`) total FROM `#@__member` WHERE `mtype` = 2 AND `state` = 1");
// $ret = getCache("member", $sql, 600, array("sign" => "total"));
// $memberStatistics['total'] = $ret[0]['total'] + $ret[1]['total'];
// $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__member` WHERE `online` > 0 AND `mtype` = 1 AND `state` = 1 UNION SELECT COUNT(`id`) total FROM `#@__member` WHERE `online` > 0 AND `mtype` = 2 AND `state` = 1");
// $ret = getCache("member", $sql, 400, array("sign" => "online"));
// $memberStatistics['online'] = $ret[0]['total'] + $ret[1]['total'];

// $huoniaoTag->assign('memberStatistics', $memberStatistics);


//统计已入驻商家数量
// $businessSettledCount = 0;
// $sql = $dsql->SetQuery("SELECT count(*) total FROM `#@__business_list` WHERE `state` = 1");
// $businessSettledCount = (int)$dsql->getOne($sql);
// $huoniaoTag->assign('businessSettledCount', $businessSettledCount);


//外卖配送
if($service == "waimai" && $do == "courier"){
	$tpl = "/templates/courier/";
}

//IM聊天
if($service == 'member' && strstr($reqUri, 'im/')){
	$tpl .= 'im/';
}

//验证模板文件
$furlarr = explode('/',str_replace($cfg_secureAccess.$cfg_basehost, '', $furl));
if(is_array($furlarr) && !empty($furlarr)){
    if(isMobile() && $templates =='login.html' && strstr($furlarr[1], 'wmsj')){
        $tpl = '/wmsj/templates/touch/';
    }
}

//规则
$awardlegouConfigFile = HUONIAOINC . '/config/awardlegou.inc.php';
if(file_exists($awardlegouConfigFile)){
	include($awardlegouConfigFile);
    $huoniaoTag->assign("awardlegouGuize", stripslashes($custom_awardlegouGuize));
}

//新版本没有order.html了，改成了orderlist.html，但是有的地方路由规则还是order.html，所以这里做一下兼容
$_ischeck = explode($busiDomain, $dirDomain);
if(isMobile() && count($_ischeck) <= 1 && $templates == 'order.html'){
    $templates = 'orderlist.html';
}

$tplDir = HUONIAOROOT.$tpl;
if(file_exists($tplDir.$templates)){

	$huoniaoTag->assign('city', $city);

	$page = $page ? $page : (isset($_REQUEST['page']) ? $_REQUEST['page'] : 1);
    $page = (int)$page;
    $page = $page > 50000 ? 50000 : (int)$page;
	$huoniaoTag->assign('page', $page);   //当前页码

    $pageSize = $pageSize ? $pageSize : (isset($_REQUEST['pageSize']) ? $_REQUEST['pageSize'] : 1);
    $pageSize = (int)$pageSize;
    $pageSize = $pageSize > 50000 ? 50000 : (int)$pageSize;
	$huoniaoTag->assign('pageSize', $pageSize);   //当前页码

	$huoniaoTag->template_dir = $tplDir;

	if($cfg_remoteStatic){
		$huoniaoTag->assign('templets_skin', $cfg_remoteStatic.$tpl);  //模块路径
		$huoniaoTag->assign('cfg_staticPath', $cfg_remoteStatic . '/static/');  //静态资源路径
	}else{
		$huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost.$tpl);  //模块路径
		$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
	}
	$huoniaoTag->assign('cfg_staticVersion', $cfg_staticVersion);  //静态资源版本号
	$huoniaoTag->assign('cfg_hideUrl', $cfg_hideUrl);        //是否隐藏静态资源路径
	$huoniaoTag->assign('template', $template);    //当前模板
	$huoniaoTag->assign('service', $service);      //当前模块
	$huoniaoTag->assign('search_keyword', htmlspecialchars(RemoveXSS(strip_tags($search_keyword))));  //搜索关键字
	$huoniaoTag->assign('backModule', $backModule);  //来源模块
	$huoniaoTag->assign('payPhone', (int)$payPhone);  //付费电话回调，如果有传这个参数，页面需要自动点击获取电话按钮

	//如果是选择城市页面，不需要进行城市关键字替换
	if($templates == 'changecity.html' || $templates == 'changecity_touch.html'){

		//演示站搜索引擎强制跳转
		if(($httpHost == 'ihuoniao.cn' || $httpHost == 'www.ihuoniao.cn') && ($spider == 'Baidu' || $spider == 'baidu')){
			header ("location:/sz");
			die;
		}

		$siteCityName = '';

		//定位当前城市
		$cityData = getIpAddr(getIP(), 'json');
		if(is_array($cityData)){
			$siteConfigService = new siteConfig(array(
				'province' => $cityData['region'],
				'city' => $cityData['city']
			));
			$cityInfo = $siteConfigService->verifyCity();
			if(is_array($cityInfo) && $cityInfo['name']){
				$huoniaoTag->assign('cityInfo', $cityInfo);
			}
		}
	}

	//分站自定义配置
    if($siteCityAdvancedConfig && $siteCityAdvancedConfig['siteConfig']){
        if($siteCityAdvancedConfig['siteConfig']['webname']) {
            $cfg_webname = $siteCityAdvancedConfig['siteConfig']['webname'];
        }
        if($siteCityAdvancedConfig['siteConfig']['weblogo']) {
            $cfg_weblogo = $siteCityAdvancedConfig['siteConfig']['weblogo'];
        }
        if($siteCityAdvancedConfig['siteConfig']['keywords']) {
            $cfg_keywords = $siteCityAdvancedConfig['siteConfig']['keywords'];
        }
        if($siteCityAdvancedConfig['siteConfig']['description']) {
            $cfg_description = $siteCityAdvancedConfig['siteConfig']['description'];
        }
        if($siteCityAdvancedConfig['siteConfig']['hotline']) {
            $cfg_hotline = $siteCityAdvancedConfig['siteConfig']['hotline'];
        }
        if($siteCityAdvancedConfig['siteConfig']['statisticscode']) {
            $cfg_statisticscode = $siteCityAdvancedConfig['siteConfig']['statisticscode'];
        }
        if($siteCityAdvancedConfig['siteConfig']['powerby']) {
            $cfg_powerby = $siteCityAdvancedConfig['siteConfig']['powerby'];
        }
    }

	//系统配置参数
	$huoniaoTag->assign("cfg_webname",        str_replace('$city', $siteCityName, stripslashes($cfg_webname)));
	$huoniaoTag->assign("cfg_shortname",      str_replace('$city', $siteCityName, stripslashes($cfg_shortname)));

	$huoniaoTag->assign("cfg_weblogo",        getFilePath($cfg_weblogo));
	$huoniaoTag->assign("cfg_touchlogo",      getFilePath($cfg_touchlogo));
	$huoniaoTag->assign("cfg_share",          getFilePath($cfg_sharePic));
	$huoniaoTag->assign("cfg_keywords",       str_replace('$city', $siteCityName, stripslashes($cfg_keywords)));
	$huoniaoTag->assign("cfg_description",    str_replace('$city', $siteCityName, stripslashes($cfg_description)));
	$huoniaoTag->assign("cfg_beian",          stripslashes($cfg_beian));
	$huoniaoTag->assign("cfg_hotline",        stripslashes($cfg_hotline));
	$huoniaoTag->assign("cfg_powerby",        str_replace('$city', $siteCityName, stripslashes($cfg_powerby)));
	$huoniaoTag->assign("cfg_statisticscode", str_replace("></script>'", "><\/script>'", stripslashes($cfg_statisticscode)));
	$huoniaoTag->assign("cfg_mapCity",        $siteCityName ? $siteCityName : $cfg_mapCity);

    //未设置分享标题和描述时，使用网站名称和seo描述
    $cfg_shareTitle = $cfg_shareTitle ? $cfg_shareTitle : $cfg_webname;
    $cfg_shareDesc = $cfg_shareDesc ? $cfg_shareDesc : $cfg_description;

	$huoniaoTag->assign("cfg_shareTitle",     str_replace('$city', $siteCityName, stripslashes($cfg_shareTitle)));
	$huoniaoTag->assign("cfg_shareDesc",      str_replace('$city', $siteCityName, stripslashes($cfg_shareDesc)));
	$huoniaoTag->assign("cfg_weatherCity",    $cfg_weatherCity);
	$huoniaoTag->assign("cfg_template",       $cfg_template);
	$huoniaoTag->assign("cfg_cookieDomain",   $cfg_cookieDomain);
	$huoniaoTag->assign("cfg_cookiePre",      $cfg_cookiePre);
	$huoniaoTag->assign("cfg_bbsUrl",         $cfg_bbsUrl);
	$huoniaoTag->assign("cfg_server_tel",     empty($cfg_server_tel) ? array() : explode(",", $cfg_server_tel));
	$huoniaoTag->assign("cfg_server_qq",      empty($cfg_server_qq) ? array() : explode(",", $cfg_server_qq));
	$huoniaoTag->assign("cfg_server_wx",      $cfg_server_wx);
	$huoniaoTag->assign("cfg_server_wxQr",    empty($cfg_server_wxQr) ? "" : getFilePath($cfg_server_wxQr));
	$huoniaoTag->assign("from",               $from);
	$huoniaoTag->assign("appIndex",           (int)$appIndex);
	$huoniaoTag->assign("defaultindex",       $cfg_defaultindex);
	$huoniaoTag->assign("vipAdvertising",       (int)$cfg_vipAdvertising);
    
    //视频上传开关
    $videoUploadState = isset($cfg_videoUploadState) ? (int)$cfg_videoUploadState : 1;  //默认开启
	$huoniaoTag->assign("cfg_videoUploadState", $videoUploadState);

    //评论框提示文案
    $commentPlaceholder = isset($cfg_commentPlaceholder) && $cfg_commentPlaceholder != '' ? $cfg_commentPlaceholder : '发条友善的评论~';
	$huoniaoTag->assign("cfg_commentPlaceholder", $commentPlaceholder);
    
    $huoniaoTag->assign('member_userDomain', $userDomain);
    $huoniaoTag->assign('member_busiDomain', $busiDomain);

    //RSA密钥
    $encryptPubkey = str_replace(array("\r\n", "\r", "\n"), '\n', $cfg_encryptPubkey);
	$huoniaoTag->assign("rsaScript", "<script src=\"".$cfg_staticPath."js/ui/jsencrypt.min.js?v=".$cfg_staticVersion."\"></script>\r\n<script>var encryptPubkey = \"".$encryptPubkey."\";</script>");
	$huoniaoTag->assign("cfg_encryptPubkey", $encryptPubkey);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/compiled/".$service."/".(isMobile() ? "touch/" : "").$template;  //设置编译目录
	$huoniaoTag->cache_dir = HUONIAOROOT."/templates_c/caches/".$service."/".(isMobile() ? "touch/" : "").$template;  //设置编译目录


	//页面变灰，涉及到的页面：public_share.html、touch_top.html、top1.html
	$pageGrayCss = '';
	if($cfg_sitePageGray){
		//首页变灰、全站变灰
		if(($cfg_sitePageGray == 1 && $service != 'member' && $templates == 'index.html') || $cfg_sitePageGray == 2){
			$pageGrayCss = '<style media="screen">html{filter: grayscale(100%); -moz-filter: grayscale(100%); -ms-filter: grayscale(100%); -o-filter: grayscale(100%); filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1); -webkit-filter: grayscale(1);}</style>';
		}
		$huoniaoTag->assign("pageGrayCss", $pageGrayCss);
	}

    if(isMobile()) {
        $sharePic = $cfg_sharePic;

        if($service != 'siteConfig'){
			include HUONIAOINC . "/config/".$service.".inc.php";
			if($customSharePic){
	            $sharePic = $customSharePic;
			}
        }

        $huoniaoTag->assign("shareAdvancedUrl", getFilePath($sharePic));
    }

	//渲染页面
	$huoniaoTag->display($templates);

	//上面的变灰输出会有漏掉的页面，这里再做一次，这个做法会让页面先由彩色过渡成灰色
    if($pageGrayCss){
	    echo "\r\n<!-- 页面灰度处理 -->\r\n" . $pageGrayCss;
    }

	//移动端统计
	if(isMobile()){
		echo "\r\n<!-- 统计代码 -->\r\n" . '<div style="display: none;">'.str_replace("></script>'", "><\/script>'", stripslashes($cfg_statisticscode)).'</div>';
	}


	//移动端自定义分享LOGO
    if(isMobile()) {

        //iOS端虚拟支付功能
        $iosVirtualPaymentState = (int)$cfg_iosVirtualPaymentState;  //0启用  1禁用
        $iosVirtualPaymentTip = $cfg_iosVirtualPaymentTip ?: 'iOS端小程序不支持该功能';

        echo "\r\n<!-- 自定义分享logo -->\r\n" . '<script>var shareAdvancedUrl = "'.getFilePath($sharePic).'"; var miniProgramAppid = "'.$cfg_miniProgramAppid.'"; var cfg_iosVirtualPaymentState = '.$iosVirtualPaymentState.'; var cfg_iosVirtualPaymentTip = "'.$iosVirtualPaymentTip.'";</script>';
    }

	//向页面输出货币符号
	echo "\r\n<!-- 货币符号 && 时区 -->\r\n" . '<script>var cfg_currency = '.json_encode($currencyArr, JSON_UNESCAPED_UNICODE).'; var cfg_timezone = "'.date_default_timezone_get().'";</script>';

	//向页面输出APP信息
	if(isMobile()){
		$appinfo = array();
		if($appRet && is_array($appRet)){
			$data = $appRet[0];
			if(($data['downloadtips'] || strstr($templates, 'inviteRegister.html') || strstr($templates, 'mobile_touch.html')) && ($data['android_download'] || $data['ios_download'])){
				$appinfo = array(
					'name' => $data['appname'],
					'logo' => getFilePath($data['logo']),
					'subtitle' => $data['subtitle'] ? $data['subtitle'] : '使用APP操作更方便',
					'wx_appid' => $data['wx_appid'],
					'URLScheme_Android' => $data['URLScheme_Android'],
					'URLScheme_iOS' => $data['URLScheme_iOS'],
				);

                $huoniaoTag->assign("cfg_appinfo", json_encode($appinfo, JSON_UNESCAPED_UNICODE));

                //是否APP端
                $appIndex = (int)$appIndex;
                $appBoolean = isApp() || $appIndex ? 1 : 0;

				echo "\r\n<!-- APP相关信息 -->\r\n" . '<script>var cfg_appinfo = '.json_encode($appinfo, JSON_UNESCAPED_UNICODE).';</script>';
			}
		}
	}

    //微信端隐藏域名
	if(isWeixin()) {
        echo "\r\n<!-- 隐藏微信端域名 -->\r\n" . '<div style="position: fixed; left: 0; top: 0; right: 0; z-index: -1; height: 2rem; background-image: -webkit-linear-gradient( -90deg, rgb(255,255,255) 25%, rgba(255,255,255,0) 100%);"></div>';
    }
    if($userinfo){
    	PutCookie('userid', $userinfo['userid'], $cfg_onlinetime * 60 * 60);
    }else{
    	DropCookie('userid');
    }

    //更新附件的浏览次数
    updateAttachmentClickSql();

    //向页面输出安全域名
    echo "\r\n<!-- 安全域名 -->\r\n" . '<script>var cfg_secure_domain = '.json_encode(getSecureDomain()).';</script>';

    //小程序端向页面输出原生模块信息
    if(isWxMiniprogram() || isByteMiniprogram()){

        $miniprogram_native_module = array();
        $appConfigJsonFile = HUONIAOROOT . '/api/appConfig.json';
        if(file_exists($appConfigJsonFile)){
            $appConfigJson = file_get_contents($appConfigJsonFile);
            $appConfig = json_decode($appConfigJson, true);
            if(is_array($appConfig)){
                if(isWxMiniprogram()){
                    $miniprogram_native_module = $appConfig['wxmini_native_module'];
                }else{
                    $miniprogram_native_module = $appConfig['dymini_native_module'];
                }
            }
        }

        echo "\r\n<!-- 小程序端原生模块配置 -->\r\n" . '<script>var miniprogram_native_module = '.json_encode($miniprogram_native_module).';</script>';
    }

    //判断是否非法referer，并在页面中给出标识
    $_http_referer = $_SERVER['HTTP_REFERER'];
    if($_http_referer){
        $_parsedUrl = parse_url($_http_referer);
        $_referer_host = $_parsedUrl['host'];
        $_referer_host_1 = $_referer_host;
        if(strstr('www.', $_referer_host)){
            $_referer_host_1 = str_replace('www.', '', $_referer_host);
        }
        if($cfg_basehost != $_referer_host && $cfg_basehost != $_referer_host_1){
            echo "\r\n<!-- 页面来源非法 -->\r\n" . '<script>var illegal_referer = "'.urlencode(strip_tags($_http_referer)).'";</script>';
        }
    }


	echo "\r\n" . "<!-- Processed in page load ".number_format((microtime(true) - sysBtime), 6)." second(s), ".$dsql->querynum." queries ,".$dsql->querytime." second(s) -->";
	// echo "<!-- Processed in ".$dsql->querytime." second(s), ".$dsql->querynum." queries -->";

//	 echo $dsql->querzsysql;  //输出页面中用到的SQL

    //按使用数量排序
	// $sqls = explode("<br />", $dsql->querysql);
	// $arrs = array();
	// $list = array();
	// foreach ($sqls as $q){
	//    if(!in_array($q, $arrs)){
	//        array_push($arrs, $q);
	//        array_push($list, array(
	//            1, $q
	//        ));
	//    }else{
	//        foreach ($list as $k => $v){
	//            if($v[1] == $q){
	//                $list[$k][0] += 1;
	//            }
	//        }
	//    }
	// }
	// $c = array_column($list, 0);
	// array_multisort($c, SORT_DESC, $list);
	// foreach ($list as $item) {
	//    echo $item[0] . "_____" . $item[1] . "<br />";
	// }

}else{
	if($cfg_siteDebug){
		die("The requested URL '".$tplDir.$templates."' was not found on this server.");
	}else{
		header ("location:/404.html");
		die;
	}
}

// xhprof
// $xhprof_data = xhprof_disable();
// $run_id = $xhprof_runs->save_run($xhprof_data, "xhprof_foo");
// $url =  $cfg_secureAccess . $cfg_basehost . "/xhprof/xhprof_html/index.php?run=$run_id&source=xhprof_foo";
// echo '<a href="'.$url.'" target="_blank">'.$url.'</a><br /><br /><br /><br /><br />';
