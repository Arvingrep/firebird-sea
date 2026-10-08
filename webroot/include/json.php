<?php
//系统核心配置文件
require_once(dirname(__FILE__).'/common.inc.php');
include_once(HUONIAOINC.'/class/aliyun-php-sdk-core/Config.php');   //引入阿里云SDK

//手机号码图片化
if($action == "phoneimage"){

	if(!empty($num)){

		//转码
		$RenrenCrypt = new RenrenCrypt();
		$num = $RenrenCrypt->php_decrypt(base64_decode($num));

		//生成图像
		Header("Content-type: image/PNG");

        $fontColor = array();
        if($color){
            $rgb = hex2rgb($color);
            $fontColor = array($rgb['r'], $rgb['g'], $rgb['b']);
        }
		$str2PNG = new str2PNG($num, $size, $fontColor);
		$str2PNG->createImage();

        //输出base64编码
        // $imageString = ob_get_contents();
        // ob_end_clean();
        // $base64EncodedImage = base64_encode($imageString);
        // die('data:image/png;base64,' . $base64EncodedImage);
	}
	die;


//输出广告代码
}elseif($action == "adjs"){

	if(!empty($id) || !empty($title)){

		$handler = true;
		include_once(HUONIAOINC."/class/myad.class.php");

		if(!empty($id)){
			$param = array("id" => $id);
		}

		if(!empty($title)){
			$param = array("title" => $title);
			$param['model'] = $model;
		}

		if(!empty($type)){
			$param["type"] = $type;
		}

		$adhtml = getMyAd($param);
		$adhtml = str_replace("\n", "", $adhtml);
		$adhtml = str_replace("\r", "", $adhtml);
		$adhtml = str_replace("\r\n", "", $adhtml);
		$adhtml = addslashes($adhtml);

        //更新附件的浏览次数
        updateAttachmentClickSql();

		echo 'document.write("'.$adhtml.'");';die;
	}


//网址快捷方式
}elseif($action == "internetShortcut"){
	$url = $cfg_secureAccess.$cfg_basehost;
	$name = iconv("UTF-8", "GBK", $cfg_webname);
	Header("Content-type:application/octet-stream ");
	Header("Accept-Ranges:bytes ");
	header("Content-Disposition:attachment;filename=$name.url");
	echo "[DEFAULT]\r\n";
	echo "BASEURL=$url\r\n";
	echo "[$name]\r\n";
	echo "Prop3=19,11\r\n";
	echo "[InternetShortcut]\r\n";
	echo "URL=$url\r\n";
	echo "IconFile=$url/favicon.ico";

//语言包
}elseif($action == "lang"){

    //APP端多语言
    if($type == 'app'){
		$file_path = HUONIAOINC . '/lang/app/' . $region . '.js';
		if(file_exists($file_path)){
			//跳转
			header ("location:" . $cfg_secureAccess . $cfg_basehost . '/include/lang/app/' . $region . '.js?v=' . $cfg_staticVersion);
			die();

			//直接输出
			$str = file_get_contents($file_path);//将整个文件内容读入到一个字符串中
			echo $str;

		}else{

	        //读缓存
	        $appLangData_cache = $HN_memory->get('appLangData_' . $region);
	        if($appLangData_cache && !HUONIAOBUG){
	            $appLangData = $appLangData_cache;

	        }else {
                $file_path = HUONIAOINC . '/lang/app/' . $region . '.php';

                if(file_exists($file_path)){
                    include_once($file_path);
                    $appLangData = $lang;

                    //写入缓存
                    $HN_memory->set('appLangData_' . $region, $appLangData);
                }else{
                    $appLangData = array();
                }
	        }
	        echo json_encode($appLangData);
		}

    }else {
		$file_path = HUONIAOINC . '/lang/' . $cfg_lang_dir . '.js';

		if(file_exists($file_path)){

			//跳转
			header ("location:" . $cfg_secureAccess . $cfg_basehost . '/include/lang/' . $cfg_lang_dir . '.js?v=' . $cfg_staticVersion);
			die();

			//直接输出
			$str = file_get_contents($file_path);//将整个文件内容读入到一个字符串中
			echo $str;

		}else{
	        $content = 'var langData =  ' . json_encode($langData);
	        header('Content-type: application/x-javascript');
	        header('Accept-Ranges: bytes');
	        header('Expires: ' . gmstrftime("%a,%d %b %Y %H:%M:%S GMT", $cfg_staticVersion + 365 * 86440));
	        header('Content-Length: ' . strlen($content));
	        echo $content;
		}
    }


//根据区域ID返回相应父级
}elseif($action == "getPublicParentInfo" || $action == "getpublicparentinfo"){
	$data = getPublicParentInfo(array(
		'tab' => $tab,
		'id'  => $id,
		'type' => $type,
		'split' => $split
	));

	if($callback){
		echo $callback."(".json_encode($data).")";
	}else{
		echo json_encode($data);
	}


//输出系统logo
}elseif($action == "getSystemLogo" || $action == "getsystemlogo"){

    global $cfg_touchlogo;
    if($cfg_touchlogo){
        header('location:' . getFilePath($cfg_touchlogo));
    }
    else{
        if($appRet && $appRet[0]['logo']){
            header('location:' . getFilePath($appRet[0]['logo']));
        }else{
            header('location:' . getFilePath($cfg_weblogo));
        }
    }

//小程序直播
}elseif($action == "getMiniProgramLive" || $action == "getminiprogramlive"){

	$id = (int)$id;
	$img = createWxMiniProgramScene('miniProgramLive_' . $id, '../', true);

	if($id){

        $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
        $is_app = preg_match("/huoniao/", $useragent) ? 1 : 0;
        $huoniaoTag->assign('is_app', $is_app);
        $huoniaoTag->assign('isWeixin', isWeixin());
		$huoniaoTag->assign('isWxMiniprogram', isWxMiniprogram());
        
        //APP端和小程序端不需要通过小程序跳转
        if(!$is_app && !isWxMiniprogram()){
            global $cfg_miniProgramAppid;
            global $cfg_miniProgramAppsecret;

            $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$cfg_miniProgramAppid&secret=$cfg_miniProgramAppsecret";

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_TIMEOUT, 3);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($curl, CURLOPT_URL, $url);

            $res = json_decode(curl_exec($curl));
            curl_close($curl);

            if (isset($res->errcode)) {
                die('获取小程序AccessToken失败！错误信息：' . $res->errcode . "_" . $res->errmsg);
            }

            $access_token = $res->access_token;
            $url = 'https://api.weixin.qq.com/wxa/generate_urllink?access_token=' . $access_token;
            $data = array(
                'path'            => '/pages/live/detail',    //跳转路径
                'query'           => 'roomid=' . $id,    //携带参数
                'is_expire'       => true,  //链接是否设置过期时间
                'expire_type'     => 1,     //过期类型 0指定时间 1指定天数
                'expire_interval' => 30     //有效期30天
            );

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_TIMEOUT, 3);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_POST, true); // 是否为POST请求
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data)); // 处理请求数据
            $res = curl_exec($curl);
            $res_ = json_decode($res);
            curl_close($curl);

            if (isset($res_->errcode) && $res_->errcode != 0) {
                die('获取小程序访问链接失败！错误信息：' . $res_->errcode . "_" . $res_->errmsg);
            }

            $url_link = $res_->url_link;
            header('location:' . $url_link);
            die;
        }
        

		$tpl                      = HUONIAOINC . "/plugins/8/tpl";
		$huoniaoTag->template_dir = $tpl; //设置后台模板目录
		$templates                = "qr.html";

        $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
        $signPackage = $jssdk->getSignPackage();
        $huoniaoTag->assign('wxjssdk_appId', $signPackage['appId']);
        $huoniaoTag->assign('wxjssdk_timestamp', $signPackage['timestamp']);
        $huoniaoTag->assign('wxjssdk_nonceStr', $signPackage['nonceStr']);
        $huoniaoTag->assign('wxjssdk_signature', $signPackage['signature']);

		$huoniaoTag->assign('img', $img);
		$huoniaoTag->assign('roomid', $id);
        $huoniaoTag->assign('cfg_miniProgramId', $cfg_miniProgramId);
		$huoniaoTag->display($templates);

	}

//小程序
}elseif($action == "getWxMiniProgram" || $action == "getwxminiprogram"){

	$img = createWxMiniProgramScene($_SERVER['HTTP_REFERER'], '../', true);
	$tpl = HUONIAOROOT . "/templates/siteConfig";
	$huoniaoTag->template_dir = $tpl; //设置后台模板目录
	$templates = "wxMiniProgramQr.html";
	$huoniaoTag->assign('img', $img);
	$huoniaoTag->display($templates);

//打开指定小程序
}elseif($action == "openWxMiniProgram" || $action == "openwxminiprogram"){
	$tpl = HUONIAOROOT . "/templates/siteConfig";
	$huoniaoTag->template_dir = $tpl; //设置后台模板目录
	$templates = "openWxMiniProgram.html";
    $param = $_GET['param'] ? htmlspecialchars(RemoveXSS($_GET['param'])) : '';
    $param = str_replace('"', "", str_replace("'", "", $param));
    $scene = (int)$_GET['scene'];

    //判断是否为生成的自定义小程序码，如果是的话，从数据库中读取真实路径
    if($scene){

        $sql = $dsql->SetQuery("SELECT `url` FROM `#@__site_wxmini_scene` WHERE `id` = " . $scene);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $param = $ret[0]['url'];
        }

    }

	$huoniaoTag->assign('param', $param);
	$huoniaoTag->display($templates);


//小程序端登录
}elseif($action == "wxMiniProgramLogin" || $action == 'wxminiprogramlogin'){

	$tpl = HUONIAOROOT . "/templates/siteConfig";
	$huoniaoTag->template_dir = $tpl; //设置后台模板目录
	$templates = "wxMiniProgramLogin.html";
	$huoniaoTag->assign('uid', $uid);
	$huoniaoTag->assign('url', $url);
	$huoniaoTag->assign('path', $path);

    $access_token = str_replace("=", "huoniaodh", $access_token);
    $refresh_token = str_replace("=", "huoniaodh", $refresh_token);

	$huoniaoTag->assign('access_token', $access_token);
	$huoniaoTag->assign('refresh_token', $refresh_token);
	$huoniaoTag->display($templates);

}

//查询管理员微信消息通知详情，主要用于从2023年5月4日起，模板消息不再支持头尾、颜色、表情符号、换行等，公告：https://mp.weixin.qq.com/s/xFhCqMnlQhwWJ64ueWN8hQ
//管理员消息内容较多时，单行超过25个字就会自动省略，导致无法看到详细内容
//这里单独做个页面，用于显示完整的内容
elseif($action == 'wechatTemplateNotifyDetail'){

    $adminid = $userLogin->getUserID();
    if($adminid == -1){
        die('<meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover, viewport-fit=cover"><h1>请使用微信登录后台后查看管理员通知！</h1><h2>登录方式：将后台管理地址发送到微信文件传输助手，点击地址进行登录，登录成功后关掉页面，回到公众号内就可以点击查看模板消息了！</h2>');
    }

    $id = (int)$id;
    $sql  = $dsql->SetQuery("SELECT * FROM `#@__updatemessage` WHERE `id` = $id");
    $ret  = $dsql->dsqlOper($sql,"results");
    if($ret){

        $param = $ret[0]['param'];
        $paramArr = unserialize($param);

        if(!is_array($paramArr)){
            die('<meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover, viewport-fit=cover"><h1>格式错误，数据读取失败！</h1>');
        }

        $fields = $paramArr['fields'];
        $contentrn = nl2br($fields['contentrn']);
        $date = $fields['date'];
        $status = $fields['status'];

        $tpl = HUONIAOROOT . "/templates/siteConfig";
        $huoniaoTag->template_dir = $tpl; //设置后台模板目录
        $templates = "wechatTemplateNotifyDetail.html";

        $huoniaoTag->assign('contentrn', $contentrn);
        $huoniaoTag->assign('date', $date);
        $huoniaoTag->assign('status', $status);
        $huoniaoTag->display($templates);

    }else{
        die('<meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover, viewport-fit=cover"><h1>未查询到记录！</h1>');
    }


//普通会员发布信息收费配置
}elseif($action == "fabuConfig"){
	$data = array('fabuAmount' => $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array());

	if($callback){
		echo $callback."(".json_encode($data).")";
	}else{
		echo json_encode($data);
	}

}

//更新附件的浏览次数
updateAttachmentClickSql();