<?php
/**
 * 微信自定义菜单
 *
 * @version        $Id: wechatMenu.php 2017-2-23 下午14:35:21 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wechatMenu");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "wechatMenu.html";

$db = "site_wechat_menu";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}elseif($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		//单独修改
		if($action == "single"){

			//菜单名称
			if($type == "typename"){
				if($val == "") die('{"state": 101, "info": '.json_encode('请输入菜单名称').'}');
				if($results[0]['typename'] != $val){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$val' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");
				}else{
					echo '{"state": 101, "info": '.json_encode('无变化！').'}';
					die;
				}
			}

			//KEY
			if($type == "key"){
				if($results[0]['title'] != $val){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `title` = '$val' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");
				}else{
					echo '{"state": 101, "info": '.json_encode('无变化！').'}';
					die;
				}
			}

		}else{
			//对字符进行处理
			$typename = cn_substrR($typename, 30);
			$key      = cn_substrR($key, 255);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$typename', `title` = '$key' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改微信自定义菜单", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}elseif($dopost == "del"){
	if($id == "") die;

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {
		$childArr = $dsql->getTypeList($id, $db, 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$idsArr[] = $id;
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除微信自定义菜单", join(",", $idsArr));
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');


//更新
}elseif($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeOpera($json, 0, $db);
	echo $json;
	die;

//发布
}elseif($dopost == "release"){
	echo releaseMenu();
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/wechat/wechatMenu.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode(getMenu()));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/wechat";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



//更新菜单
function typeOpera($arr, $pid = 0, $db){
	$dsql = new dsql($dbo);

	if (!is_array($arr) && $arr != NULL) {
		return '{"state": 200, "info": "保存失败！"}';
	}
	for($i = 0; $i < count($arr); $i++){
		$id       = $arr[$i]["id"];
		$typename = $arr[$i]["typename"];
		$key      = $arr[$i]["key"];
		$lower    = $arr[$i]["lower"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`parentid`, `typename`, `title`, `weight`) VALUES ('$pid', '$typename', '$key', '$i')");
			$id = $dsql->dsqlOper($archives, "lastid");

			if($lower){
				typeOpera($lower, $id, $db);
			}

			adminLog("添加微信自定义菜单", $typename);
		}
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `title`, `weight` FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				if($results[0]["typename"] != $typename){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$typename' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					adminLog("修改微信自定义菜单名称", $typename);
				}
				if($results[0]["title"] != $key){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `title` = '$key' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					adminLog("修改微信自定义菜单key", $typename."=>".$key);
				}

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					adminLog("修改微信自定义菜单排序", $typename."=>".$i);
				}
			}

			if($lower){
				typeOpera($lower, $id, $db);
			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}


//获取菜单
function getMenu(){
	global $dsql;
	global $db;

	$list = array();
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename`, `title` FROM `#@__".$db."` WHERE `parentid` = 0 ORDER BY `weight` ASC");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $k => $value) {
			$id       = $value['id'];
			$parentid = $value['parentid'];
			$typename = $value['typename'];
			$key      = $value['title'];
			$lower    = array();

			$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename`, `title` FROM `#@__".$db."` WHERE `parentid` = $id ORDER BY `weight` ASC");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $k => $value) {
					array_push($lower, array(
						"id"       => $value['id'],
						"parentid" => $value['parentid'],
						"typename" => $value['typename'],
						"key"      => $value['title'],
						"lower"    => ""
					));
				}
			}

			array_push($list, array(
				"id" => $id,
				"typename" => $typename,
				"parentid" => $parentid,
				"key" => $key,
				"lower" => $lower
			));
		}
	}
	return $list;
}

//发布菜单
function releaseMenu(){

	$menus = getMenu();
	$menuData = array();

	//引入配置文件
	$wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
	global $cfg_miniProgramAppid;
	global $cfg_basehost;

	if($menus){
		foreach ($menus as $key => $value) {

			//如果存在二级
			if($value['lower']){
				$lower = array();
				foreach ($value['lower'] as $k => $v) {
					//链接
					if(strstr($v['key'], 'http')){
						array_push($lower, '{"type": "view", "name": "'.$v['typename'].'", "url": "'.$v['key'].'"}');
					}elseif(strstr($v['key'], 'miniprogram://')){//小程序
						$miniProgramArr = explode('miniprogram://',$v['key']);
						$minipagepath   = $miniProgramArr[1];

                        $miniappid = $cfg_miniProgramAppid;  //系统默认小程序appid

                        //判断是否打开第三方小程序
                        if(strstr($v['key'], 'openxcx_')){
                            $miniProgramArr = explode('openxcx_', $v['key']);
                            $miniProgramArr1 = explode('||', $miniProgramArr[1]);

                            $miniappid = $miniProgramArr1[0];
                            $minipagepath = $miniProgramArr1[1];
                        }

						array_push($lower, '{"type": "miniprogram", "name": "'.$v['typename'].'", "url":"'.$cfg_basehost.'","appid":"'.$miniappid.'","pagepath": "'.$minipagepath.'"}');
					}elseif($v['key'] == 'scancode_push'){
                        array_push($lower, '{"type": "scancode_push", "name": "'.$v['typename'].'", "key": "rselfmenu_0_1"}');
                    }
                    else{//关键字
						array_push($lower, '{"type": "click", "name": "'.$v['typename'].'", "key": "'.$v['key'].'"}');
					}
				}
				array_push($menuData, '{"type": "click", "name": "'.$value['typename'].'", "sub_button": ['.implode(",", $lower).']}');

			//没有二级
			}else{
				//链接
				if(strstr($value['key'], 'http')){
					array_push($menuData, '{"type": "view", "name": "'.$value['typename'].'", "url": "'.$value['key'].'"}');
				}elseif(strstr($value['key'], 'miniprogram://')){//小程序
					$miniProgramArr = explode('miniprogram://',$value['key']);
					$minipagepath   = $miniProgramArr[1];

                    $miniappid = $cfg_miniProgramAppid;  //系统默认小程序appid

                    //判断是否打开第三方小程序
                    if(strstr($value['key'], 'openxcx_')){
                        $miniProgramArr = explode('openxcx_', $value['key']);
                        $miniProgramArr1 = explode('||', $miniProgramArr[1]);

                        $miniappid = $miniProgramArr1[0];
                        $minipagepath = $miniProgramArr1[1];
                    }

					array_push($menuData, '{"type": "miniprogram", "name": "'.$value['typename'].'", "url":"'.$cfg_basehost.'","appid":"'.$miniappid.'","pagepath": "'.$minipagepath.'"}');
				}elseif($value['key'] == 'scancode_push'){
                    array_push($lower, '{"type": "scancode_push", "name": "'.$value['typename'].'", "key": "rselfmenu_0_1"}');
                }else{//关键字
					array_push($menuData, '{"type": "click", "name": "'.$value['typename'].'", "key": "'.$value['key'].'"}');
				}
			}

		}
	}

	$menuData = '{"button":['.implode(",", $menuData).']}';

	if(!file_exists($wechatConfig)) return '{"state": 200, "info": "请先设置微信开发者信息！"}';
	require($wechatConfig);

	include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $token = $jssdk->getAccessToken();

	// $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$cfg_wechatAppid&secret=$cfg_wechatAppsecret";
    // $ch = curl_init($url);
    // curl_setopt($ch, CURLOPT_HEADER, 0);
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    // curl_setopt($ch, CURLOPT_POST, 0);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    // $output = curl_exec($ch);
    // curl_close($ch);
    // if(empty($output)){
	// 	return '{"state": 200, "info": "Token获取失败，请检查微信开发者帐号配置信息！"}';
	// }
    // $result = json_decode($output, true);
	// if(isset($result['errcode'])) {
	// 	return '{"state": 200, "info": "'.$result['errcode']."：".$result['errmsg'].'"}';
	// }
	//
    // $token = $result['access_token'];

    //创建菜单
    $url = "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=$token";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $menuData);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    $output = curl_exec($ch);
    curl_close($ch);
	if(empty($output)){
		return '{"state": 200, "info": "请求失败，请稍候重试！"}';
	}
	$result = json_decode($output, true);

	if($result['errcode'] == 0){
		return '{"state": 100, "info": "发布成功！"}';
	}else{
		return '{"state": 200, "info": "'.getErrCode($result['errcode'], $result['errmsg']).'"}';
	}
}


//根据返回码取中文说明
function getErrCode($code, $msg){
	$info = "未知错误！" . $code . "，" . $msg;
	switch ($code) {
		case -1:	$info = '系统繁忙，此时请开发者稍候再试'; break;
		case 0:	$info = '请求成功'; break;
		case 40001:	$info = '获取access_token时AppSecret错误，或者access_token无效。请开发者认真比对AppSecret的正确性，或查看是否正在为恰当的公众号调用接口'; break;
		case 40002:	$info = '不合法的凭证类型'; break;
		case 40003:	$info = '不合法的OpenID，请开发者确认OpenID（该用户）是否已关注公众号，或是否是其他公众号的OpenID'; break;
		case 40004:	$info = '不合法的媒体文件类型'; break;
		case 40005:	$info = '不合法的文件类型'; break;
		case 40006:	$info = '不合法的文件大小'; break;
		case 40007:	$info = '不合法的媒体文件id'; break;
		case 40008:	$info = '不合法的消息类型'; break;
		case 40009:	$info = '不合法的图片文件大小'; break;
		case 40010:	$info = '不合法的语音文件大小'; break;
		case 40011:	$info = '不合法的视频文件大小'; break;
		case 40012:	$info = '不合法的缩略图文件大小'; break;
		case 40013:	$info = '不合法的AppID，请开发者检查AppID的正确性，避免异常字符，注意大小写'; break;
		case 40014:	$info = '不合法的access_token，请开发者认真比对access_token的有效性（如是否过期），或查看是否正在为恰当的公众号调用接口'; break;
		case 40015:	$info = '不合法的菜单类型'; break;
		case 40016:	$info = '不合法的按钮个数'; break;
		case 40017:	$info = '不合法的按钮个数'; break;
		case 40018:	$info = '不合法的按钮名字长度'; break;
		case 40019:	$info = '不合法的按钮KEY长度'; break;
		case 40020:	$info = '不合法的按钮URL长度'; break;
		case 40021:	$info = '不合法的菜单版本号'; break;
		case 40022:	$info = '不合法的子菜单级数'; break;
		case 40023:	$info = '不合法的子菜单按钮个数'; break;
		case 40024:	$info = '不合法的子菜单按钮类型'; break;
		case 40025:	$info = '不合法的子菜单按钮名字长度'; break;
		case 40026:	$info = '不合法的子菜单按钮KEY长度'; break;
		case 40027:	$info = '不合法的子菜单按钮URL长度'; break;
		case 40028:	$info = '不合法的自定义菜单使用用户'; break;
		case 40029:	$info = '不合法的oauth_code'; break;
		case 40030:	$info = '不合法的refresh_token'; break;
		case 40031:	$info = '不合法的openid列表'; break;
		case 40032:	$info = '不合法的openid列表长度'; break;
		case 40033:	$info = '不合法的请求字符，不能包含\uxxxx格式的字符'; break;
		case 40035:	$info = '不合法的参数'; break;
		case 40038:	$info = '不合法的请求格式'; break;
		case 40039:	$info = '不合法的URL长度'; break;
		case 40050:	$info = '不合法的分组id'; break;
		case 40051:	$info = '分组名字不合法'; break;
		case 40117:	$info = '分组名字不合法'; break;
		case 40118:	$info = 'media_id大小不合法'; break;
		case 40119:	$info = 'button类型错误'; break;
		case 40120:	$info = 'button类型错误'; break;
		case 40121:	$info = '不合法的media_id类型'; break;
		case 40132:	$info = '微信号不合法'; break;
		case 40137:	$info = '不支持的图片格式'; break;
		case 40155:	$info = '请勿添加其他公众号的主页链接'; break;
		case 41001:	$info = '缺少access_token参数'; break;
		case 41002:	$info = '缺少appid参数'; break;
		case 41003:	$info = '缺少refresh_token参数'; break;
		case 41004:	$info = '缺少secret参数'; break;
		case 41005:	$info = '缺少多媒体文件数据'; break;
		case 41006:	$info = '缺少media_id参数'; break;
		case 41007:	$info = '缺少子菜单数据'; break;
		case 41008:	$info = '缺少oauth code'; break;
		case 41009:	$info = '缺少openid'; break;
		case 42001:	$info = 'access_token超时，请检查access_token的有效期，请参考基础支持-获取access_token中，对access_token的详细机制说明'; break;
		case 42002:	$info = 'refresh_token超时'; break;
		case 42003:	$info = 'oauth_code超时'; break;
		case 42007:	$info = '用户修改微信密码，accesstoken和refreshtoken失效，需要重新授权'; break;
		case 43001:	$info = '需要GET请求'; break;
		case 43002:	$info = '需要POST请求'; break;
		case 43003:	$info = '需要HTTPS请求'; break;
		case 43004:	$info = '需要接收者关注'; break;
		case 43005:	$info = '需要好友关系'; break;
		case 44001:	$info = '多媒体文件为空'; break;
		case 44002:	$info = 'POST的数据包为空'; break;
		case 44003:	$info = '图文消息内容为空'; break;
		case 44004:	$info = '文本消息内容为空'; break;
		case 45001:	$info = '多媒体文件大小超过限制'; break;
		case 45002:	$info = '消息内容超过限制'; break;
		case 45003:	$info = '标题字段超过限制'; break;
		case 45004:	$info = '描述字段超过限制'; break;
		case 45005:	$info = '链接字段超过限制'; break;
		case 45006:	$info = '图片链接字段超过限制'; break;
		case 45007:	$info = '语音播放时间超过限制'; break;
		case 45008:	$info = '图文消息超过限制'; break;
		case 45009:	$info = '接口调用超过限制'; break;
		case 45010:	$info = '创建菜单个数超过限制'; break;
		case 45015:	$info = '回复时间超过限制'; break;
		case 45016:	$info = '系统分组，不允许修改'; break;
		case 45017:	$info = '分组名字过长'; break;
		case 45018:	$info = '分组数量超过上限'; break;
		case 45047:	$info = '客服接口下行条数超过上限'; break;
		case 46001:	$info = '不存在媒体数据'; break;
		case 46002:	$info = '不存在的菜单版本'; break;
		case 46003:	$info = '不存在的菜单数据'; break;
		case 46004:	$info = '不存在的用户'; break;
		case 47001:	$info = '解析JSON/XML内容错误'; break;
		case 48001:	$info = 'api功能未授权，请确认公众号已获得该接口，可以在公众平台官网-开发者中心页中查看接口权限'; break;
		case 48004:	$info = 'api接口被封禁，请登录mp.weixin.qq.com查看详情'; break;
		case 50001:	$info = '用户未授权该api'; break;
		case 50002:	$info = '用户受限，可能是违规后接口被封禁'; break;
		case 61451:	$info = '参数错误(invalid parameter)'; break;
		case 61452:	$info = '无效客服账号(invalid kf_account)'; break;
		case 61453:	$info = '客服帐号已存在(kf_account exsited)'; break;
		case 61454:	$info = '客服帐号名长度超过限制(仅允许10个英文字符，不包括@及@后的公众号的微信号)(invalid kf_acount length)'; break;
		case 61455:	$info = '客服帐号名包含非法字符(仅允许英文+数字)(illegal character in kf_account)'; break;
		case 61456:	$info = '客服帐号个数超过限制(10个客服账号)(kf_account count exceeded)'; break;
		case 61457:	$info = '无效头像文件类型(invalid file type)'; break;
		case 61450:	$info = '系统错误(system error)'; break;
		case 61500:	$info = '日期格式错误'; break;
		case 65301:	$info = '不存在此menuid对应的个性化菜单'; break;
		case 65302:	$info = '没有相应的用户'; break;
		case 65303:	$info = '没有默认菜单，不能创建个性化菜单'; break;
		case 65304:	$info = 'MatchRule信息为空'; break;
		case 65305:	$info = '个性化菜单数量受限'; break;
		case 65306:	$info = '不支持个性化菜单的帐号'; break;
		case 65307:	$info = '个性化菜单信息为空'; break;
		case 65308:	$info = '包含没有响应类型的button'; break;
		case 65309:	$info = '个性化菜单开关处于关闭状态'; break;
		case 65310:	$info = '填写了省份或城市信息，国家信息不能为空'; break;
		case 65311:	$info = '填写了城市信息，省份信息不能为空'; break;
		case 65312:	$info = '不合法的国家信息'; break;
		case 65313:	$info = '不合法的省份信息'; break;
		case 65314:	$info = '不合法的城市信息'; break;
		case 65316:	$info = '该公众号的菜单设置了过多的域名外跳（最多跳转到3个域名的链接）'; break;
		case 65317:	$info = '不合法的URL'; break;
		case 9001001:	$info = 'POST数据参数不合法'; break;
		case 9001002:	$info = '远端服务不可用'; break;
		case 9001003:	$info = 'Ticket不合法'; break;
		case 9001004:	$info = '获取摇周边用户信息失败'; break;
		case 9001005:	$info = '获取商户信息失败'; break;
		case 9001006:	$info = '获取OpenID失败'; break;
		case 9001007:	$info = '上传文件缺失'; break;
		case 9001008:	$info = '上传素材的文件类型不合法'; break;
		case 9001009:	$info = '上传素材的文件尺寸不合法'; break;
		case 9001010:	$info = '上传失败'; break;
		case 9001020:	$info = '帐号不合法'; break;
		case 9001021:	$info = '已有设备激活率低于50%，不能新增设备'; break;
		case 9001022:	$info = '设备申请数不合法，必须为大于0的数字'; break;
		case 9001023:	$info = '已存在审核中的设备ID申请'; break;
		case 9001024:	$info = '一次查询设备ID数量不能超过50'; break;
		case 9001025:	$info = '设备ID不合法'; break;
		case 9001026:	$info = '页面ID不合法'; break;
		case 9001027:	$info = '页面参数不合法'; break;
		case 9001028:	$info = '一次删除页面ID数量不能超过10'; break;
		case 9001029:	$info = '页面已应用在设备中，请先解除应用关系再删除'; break;
		case 9001030:	$info = '一次查询页面ID数量不能超过50'; break;
		case 9001031:	$info = '时间区间不合法'; break;
		case 9001032:	$info = '保存设备与页面的绑定关系参数错误'; break;
		case 9001033:	$info = '门店ID不合法'; break;
		case 9001034:	$info = '设备备注信息过长'; break;
		case 9001035:	$info = '设备申请参数不合法'; break;
		case 9001036:	$info = '查询起始值begin不合法'; break;
	}
	return $info;
}
