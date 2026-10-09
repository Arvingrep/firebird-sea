<?php
require_once(dirname(__FILE__)."/../../include/common.inc.php");
header("Content-type:text/xml");

//文本回复xml 结构
function _response_text($object, $content){
    $textTpl = "<xml>
                <ToUserName><![CDATA[%s]]></ToUserName>
                <FromUserName><![CDATA[%s]]></FromUserName>
                <CreateTime>%s</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[%s]]></Content>
                <FuncFlag>%d</FuncFlag>
                </xml>";
    $resultStr = sprintf($textTpl, $object->FromUserName, $object->ToUserName, time(), $content, $flag);
    return $resultStr;
}

//单图文回复xml 结构
function _response_news($object, $newsContent){
	$newsTplHead = "<xml>
				    <ToUserName><![CDATA[%s]]></ToUserName>
				    <FromUserName><![CDATA[%s]]></FromUserName>
				    <CreateTime>%s</CreateTime>
				    <MsgType><![CDATA[news]]></MsgType>
				    <ArticleCount>1</ArticleCount>
				    <Articles>";
	$newsTplBody = "<item>
				    <Title><![CDATA[%s]]></Title>
				    <Description><![CDATA[%s]]></Description>
				    <PicUrl><![CDATA[%s]]></PicUrl>
				    <Url><![CDATA[%s]]></Url>
				    </item>";
	$newsTplFoot = "</Articles>
					<FuncFlag>0</FuncFlag>
				    </xml>";

	$header = sprintf($newsTplHead, $object->FromUserName, $object->ToUserName, time());

	$title = $newsContent['title'];
	$desc = $newsContent['description'];
	$picUrl = $newsContent['picUrl'];
	$url = $newsContent['url'];
	$body = sprintf($newsTplBody, $title, $desc, $picUrl, $url);

	$FuncFlag = 0;
	$footer = sprintf($newsTplFoot, $FuncFlag);
	return $header.$body.$footer;
}

//多图文回复xml 结构
function _response_multiNews($object, $newsContent){
	$newsTplHead = "<xml>
				    <ToUserName><![CDATA[%s]]></ToUserName>
				    <FromUserName><![CDATA[%s]]></FromUserName>
				    <CreateTime>%s</CreateTime>
				    <MsgType><![CDATA[news]]></MsgType>
				    <ArticleCount>%s</ArticleCount>
				    <Articles>";
	$newsTplBody = "<item>
				    <Title><![CDATA[%s]]></Title>
				    <Description><![CDATA[%s]]></Description>
				    <PicUrl><![CDATA[%s]]></PicUrl>
				    <Url><![CDATA[%s]]></Url>
				    </item>";
	$newsTplFoot = "</Articles>
					<FuncFlag>0</FuncFlag>
				    </xml>";

	$bodyCount = count($newsContent);
	$bodyCount = $bodyCount < 10 ? $bodyCount : 10;

	$header = sprintf($newsTplHead, $object->FromUserName, $object->ToUserName, time(), $bodyCount);
	foreach($newsContent as $key => $value){
		$body .= sprintf($newsTplBody, $value['title'], $value['description'], $value['picUrl'], $value['url']);
	}

	$FuncFlag = 0;
	$footer = sprintf($newsTplFoot, $FuncFlag);
	return $header.$body.$footer;
}


// $GLOBALS["HTTP_RAW_POST_DATA"] = '<xml><ToUserName><![CDATA[gh_033fef40b31b]]></ToUserName>
// <FromUserName><![CDATA[o0oZCuFDSsC4sYtKiKxD5z1URGAc]]></FromUserName>
// <CreateTime>1676342745</CreateTime>
// <MsgType><![CDATA[text]]></MsgType>
// <Content><![CDATA[教育]]></Content>
// <MsgId>23999457028780092</MsgId>
// </xml>';


define("APPID", $cfg_wechatAppid);
define("APPSECRET", $cfg_wechatAppsecret);
define("TOKEN", $cfg_wechatToken);
$wechatObj = new wechat();

//开发者验证
if($_GET["echostr"]){
    $wechatObj->valid();
}else{
    $wechatObj->responseMsg();
}

class wechat{

    //微信开发者验证
	public function valid(){
        $echoStr = $_GET["echostr"];
        if($this->checkSignature()){
        	echo $echoStr;
        	exit;
        }
    }

    //Token验证
    private function checkSignature(){
        $signature = $_GET["signature"];
        $timestamp = $_GET["timestamp"];
        $nonce     = $_GET["nonce"];

		$token = TOKEN;
		$tmpArr = array($token, $timestamp, $nonce);
		sort($tmpArr);
		$tmpStr = implode($tmpArr);
		$tmpStr = sha1($tmpStr);

		if($tmpStr == $signature){
			return true;
		}else{
			return false;
		}
	}

    //消息回复
    public function responseMsg(){
        global $dsql;
		$postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
		$uid = '';
	    if(!$postStr){
	      $postStr = file_get_contents("php://input");
	    }
		if (!empty($postStr)){

	      	$postObj = simplexml_load_string($postStr, 'SimpleXMLElement', LIBXML_NOCDATA);

	        require_once dirname(__FILE__)."/../payment/log.php";
	        $_weixin= new CLogFileHandler(HUONIAOROOT . '/log/weixin/'.date('Y-m-d').'.log');
	        $_weixin->DEBUG("消息：" . json_encode($postObj));

			$RX_TYPE = trim($postObj->MsgType);
	        $FromUserName = $postObj->FromUserName;

			switch($RX_TYPE){
				case "text":
					$resultStr = $this->handleText($postObj);
					break;
				case "event":
					$resultStr = $this->handleEvent($postObj);
					break;
				default:
					$resultStr = "Unknow msg type: ".$RX_TYPE;
					break;
			}

	        //微信传图首次记录
	        if($RX_TYPE == "event" && (strstr($postObj->EventKey, '微信传图_') || strstr($postObj->EventKey, '海报_') || strstr($postObj->EventKey, 'bind_') || strstr($postObj->EventKey, 'idclub') ) ){

			  if(strstr($postObj->EventKey, '微信传图_')){
		          $ticket = str_replace('微信传图_', '', str_replace('qrscene_微信传图_', '', $postObj->EventKey));
		          $time = $postObj->CreateTime;

		          //查询记录是否已经存在
		          $expTime = time() - 1800;  //半个小时以内有效
		          $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_wxupimg` WHERE `FromUserName` = '$FromUserName' AND `ticket` = '$ticket' AND `time` > $expTime");
		          $ret = $dsql->dsqlOper($sql, "results");
		          if(!$ret){
		            //插入新记录
		            $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxupimg` (`FromUserName`, `ticket`, `time`, `PicUrl`, `MediaId`) VALUES ('$FromUserName', '$ticket', '$time', '', '')");
		            $ret = $dsql->dsqlOper($sql, 'update');
		          }

		          $resultStr = $this->_response($postObj, array('type' => 'text', 'body' => 'HI，您已开启微信传图模式，点击左下的小键盘图标，发送你需要上传的图片吧。'));
		          echo $resultStr;
		          die;
			  }

			  if(strstr($postObj->EventKey, '海报_')){

				  //引入配置文件
			      $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
			      if(!file_exists($wechatConfig)) return;
			      require($wechatConfig);

			      include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
			      $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
			      $weixinAccessToken = $jssdk->getAccessToken();


				  $ticket = str_replace('海报_', '', str_replace('qrscene_海报_', '', $postObj->EventKey));
		          $time = $postObj->CreateTime;

		          //查询记录是否已经存在
		          $sql = $dsql->SetQuery("SELECT `title`, `description`, `imgUrl`, `link` FROM `#@__site_wxposter` WHERE `rand` = '$ticket'");
		          $ret = $dsql->dsqlOper($sql, "results");
		          if($ret){
						$title = $ret[0]['title'];
						$description = $ret[0]['description'];
						$imgUrl = $ret[0]['imgUrl'];
						$link = $ret[0]['link'];

						$data = '{
							"touser":"'.$FromUserName.'",
							"msgtype":"news",
							"news":{
								"articles": [{
									"title": "'.$title.'",
									"description": "'.$description.'",
									"url": "'.$link.'",
									"picurl": "'.$imgUrl.'"
								}]
							}
						}';

	                  $curl = curl_init();
	                  curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
	                  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	                  curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
	                  curl_setopt($curl, CURLOPT_POST, 1);
	                  curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	                  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	                  $result = json_decode(curl_exec($curl), true);
	                  curl_close($curl);
					  if($result['errcode'] == 0){
	                  	  echo '';die;
					  }

		          }
		          die;
			  }

			  //绑定账号
			  if(strstr($postObj->EventKey, 'bind_')){
                
				  $uid = str_replace('qrscene_bind_', '', $postObj->EventKey);
				  $uid = (int)$uid;
				  $this->bindSiteMember($postObj->FromUserName, $uid);

                  //关注回复
                  if($postObj->MsgType == 'event' && $postObj->Event == 'subscribe'){
                    $contentStr = $this->getAutoreply("subscribe", $postObj);
                    $resultStr = $this->_response($postObj, $contentStr);
                    echo $resultStr;
                    die;
                  }

			  }

			  //idclub
			  if(strstr($postObj->EventKey, 'idclub')){
				  $RenrenCrypt = new RenrenCrypt();
				  $openid = (string)$postObj->FromUserName;
	              $openid = base64_encode($RenrenCrypt->php_encrypt($openid));
				  $url = 'https://www.kumanyun.com/?action=idclub&key=' . $openid;
		          $resultStr = $this->_response($postObj, array('type' => 'text', 'body' => '<a href="'.$url.'">点击登记信息→</a>'));
		          echo $resultStr;
		          die;
			  }


	        }

	        //微信传图日志
	        if($RX_TYPE == "image"){
	          global $dsql;

	          $expTime = time() - 1800;  //半个小时以内有效

	          //查询微信传图表是否有记录
	          $sql = $dsql->SetQuery("SELECT `ticket` FROM `#@__site_wxupimg` WHERE `FromUserName` = '$FromUserName' AND `time` > $expTime ORDER BY `id` DESC");
	          $ret = $dsql->dsqlOper($sql, "results");
	          if($ret){
	            $ticket = $ret[0]['ticket'];

	            $time = $postObj->CreateTime;
	            $PicUrl = $postObj->PicUrl;
	            $MediaId = $postObj->MediaId;

	            $fileID = '';
	            global $cfg_atlasSize;
	            global $cfg_atlasType;
	            global $cfg_ftpState;
	            global $cfg_ftpType;
	            global $cfg_ftpDir;
	            global $editor_ftpState;
	            global $editor_ftpType;
	            global $editor_uploadDir;
                global $editor_ftpDir;
	            $editor_uploadDir = '/uploads';
	            $editor_ftpState = $cfg_ftpState;
	            $editor_ftpType = $cfg_ftpType;
	            $editor_ftpDir = $cfg_ftpDir;

	            $fileInfo = getRemoteImage(array($PicUrl), array(
	                'savePath' => '../../uploads/siteConfig/wxupimg/large/'.date( 'Y' ).'/'.date( 'm' ).'/'.date( 'd' ).'/',
	                'maxSize' => $cfg_atlasSize,
	                'allowFiles' => explode("|", $cfg_atlasType)
	            ), 'siteConfig', '../..', false);

	            $_weixin->DEBUG("上传：" . json_encode($fileInfo));

	            if($fileInfo){
					$fileInfo = json_decode($fileInfo, true);
					if(is_array($fileInfo) && $fileInfo['state'] == "SUCCESS"){
						$fileID = $fileInfo['list'][0]['fid'];
					}
				}

	            $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxupimg` (`FromUserName`, `ticket`, `time`, `PicUrl`, `MediaId`, `fid`) VALUES ('$FromUserName', '$ticket', '$time', '$PicUrl', '$MediaId', '$fileID')");
	            $dsql->dsqlOper($sql, 'update');

	          }else{
	            //已经过期的
	            $resultStr = $this->_response($postObj, array('type' => 'text', 'body' => '微信传图已超时，请重新扫码上传！'));
	            echo $resultStr;
	            die;
	          }

	          die;  //目前暂无图片类型的交互
	        }

			echo $resultStr;

	        //注册
	        if($RX_TYPE == "event" && $postObj->Event == "subscribe"){
	            $this->bindSiteMember($postObj->FromUserName, $uid);
	        }

	        //取消关注
	        if($RX_TYPE == "event" && $postObj->Event == "unsubscribe"){
	            $openid = $postObj->FromUserName;
	            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = 0 WHERE `wechat_openid` = '$openid'");
	            $dsql->dsqlOper($sql, "update");
                //如果取消关注则删除微信关注临时表的数据
                $openidsql = $dsql->SetQuery("SELECT `wechat_conn` FROM `#@__member` WHERE `wechat_openid` = '$openid' AND (`mtype` = 1 OR `mtype` = 2) ");
                $openidres = $dsql->dsqlOper($openidsql, "results");
                $openKey = $openidres[0]['wechat_conn'];
                if (!empty($openKey)){
                    $archives = $dsql->SetQuery("DELETE FROM `#@__site_wxid` WHERE `wxkey` = '$openKey'");
                     $dsql->dsqlOper($archives, "update");
                }



            }

	        exit;

		}else{
			echo "";
			exit;
		}
	}


    //普通文本回复
	public function handleText($postObj){
        $keyword = trim($postObj->Content);
        if(!empty($keyword)){
            $contentStr = $this->getAutoreply($keyword, $postObj);
            $resultStr = $this->_response($postObj, $contentStr);
			// $resultStr = _response_text($postObj, $contentStr);
            echo $resultStr;
        }else{
            echo "Input something...";
        }
    }

    //关注回复
    public function handleEvent($object){
        $contentStr = "";
        switch ($object->Event){
            case "subscribe":
                $contentStr = $this->getAutoreply("subscribe", $object);
                break;
            default:
                $contentStr = $this->getAutoreply($object->EventKey);
                break;
        }
        $resultStr = $this->_response($object, $contentStr);
        // $resultStr = _response_text($object, $contentStr);

        return $resultStr;
    }


    //根据类型组合相应的XML
    public function _response($obj, $con){
      //引入配置文件
      $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
      if(!file_exists($wechatConfig)) return;
      require($wechatConfig);

      include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
      $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
      $weixinAccessToken = $jssdk->getAccessToken();

        if($con){
            $type = $con['type'];
            $body = $con['body'];

            //普通文本
            if($type == "text"){
                return _response_text($obj, $body);
            }

            //单图文
            if($type == "news"){

              //先发客服接口而且原文链接不为空，并且后台开发了强制跳转
              if($body[0]['content_source_url'] && $cfg_wechatRedirect){
                $data = '{
                  "touser":"'.$obj->FromUserName.'",
                  "msgtype":"news",
                  "news":{
                    "articles": [{
                         "title":"'.$body[0]['title'].'",
                         "description":"'.$body[0]['digest'].'",
                         "url":"'.$body[0]['content_source_url'].'",
                         "picurl":"'.$body[0]['thumb_url'].'"
                    }]
                  }
                }';

                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                $result = json_decode(curl_exec($curl), true);
                curl_close($curl);
                if($result['errcode'] == 0){
                  echo '';die;

                //如果客服接口发送失败，走普通消息接口
                }else{
                  $data = array(
                    'title' => $body[0]['title'],
                    'description' => $body[0]['digest'],
                    'picUrl' => $body[0]['thumb_url'],
                    'url' => $body[0]['url']
                  );
                  return _response_news($obj, $data);
                }

              //原文链接为空的走普通消息接口
              }else{
                $data = array(
                  'title' => $body[0]['title'],
                  'description' => $body[0]['digest'],
                  'picUrl' => $body[0]['thumb_url'],
                  'url' => $body[0]['url']
                );
                return _response_news($obj, $data);
              }

            }

            //多图文
            if($type == "multiNews"){

              //如果开启了强制跳转
              if($cfg_wechatRedirect){

                $articles = array();
                foreach ($body as $key => $value) {
                  $url = $value['content_source_url'] ? $value['content_source_url'] : $value['url'];
                  array_push($articles, '{
                       "title":"'.$value['title'].'",
                       "description":"'.$value['digest'].'",
                       "url":"'.$url.'",
                       "picurl":"'.$value['thumb_url'].'"
                  }');
                }

                $articles = join(',', $articles);

                $data = '{
                  "touser":"'.$obj->FromUserName.'",
                  "msgtype":"news",
                  "news":{
                    "articles": ['.$articles.']
                  }
                }';

                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                $result = json_decode(curl_exec($curl), true);
                curl_close($curl);
                if($result['errcode'] == 0){
                  echo '';die;

                //如果客服接口发送失败，走普通消息接口
                }else{
                  $data = array();
                  foreach ($body as $key => $value) {
                      array_push($data, array(
                          'title' => $value['title'],
                          'description' => $value['digest'],
                          'picUrl' => $value['thumb_url'],
                          'url' => $value['url']
                      ));
                  }
                  return _response_multiNews($obj, $data);
                }

              }else{
                $data = array();
                foreach ($body as $key => $value) {
                    array_push($data, array(
                        'title' => $value['title'],
                        'description' => $value['digest'],
                        'picUrl' => $value['thumb_url'],
                        'url' => $value['url']
                    ));
                }
                return _response_multiNews($obj, $data);
              }

            }
        }
        return "";
    }


    //根据关键字获取系统响应内容
    public function getAutoreply($key, $postObj = array()){

        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_wechatSubscribeType;
        global $cfg_wechatSubscribe;
        global $cfg_wechatSubscribeMedia;
        global $cfg_autoReplyWithSiteSearchState;

        $cfg_autoReplyWithSiteSearchState = (int)$cfg_autoReplyWithSiteSearchState;  //关联网站搜索服务  0开启 1关闭

        //关注回复
        if($key == "subscribe"){

            //自定义
            if($cfg_wechatSubscribeType == 1){

                $cfg_wechatSubscribeArr = json_decode(stripslashes($cfg_wechatSubscribe), true);

                //判断内容中是否需要获取当前关注人数
                if(strstr($cfg_wechatSubscribe, '$subscribeCount')){

                    $subscribeCount = 1;
                    include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
                    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
                    $token = $jssdk->getAccessToken();

                    //获取用户列表
                    $url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token=$token&next_openid=";
                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_HEADER, 0);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
                    $output = curl_exec($ch);
                    curl_close($ch);
                    $result = json_decode($output, true);
                    if(!isset($result['errcode'])) {
                        $subscribeCount = $result['total'];
                    }

                    $cfg_wechatSubscribe = str_replace('$subscribeCount', $subscribeCount, $cfg_wechatSubscribe);

                }

                //判断是否为数组
                elseif(is_array($cfg_wechatSubscribeArr)){
                    
                    include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
                    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
                    $weixinAccessToken = $jssdk->getAccessToken();

                    $title = $cfg_wechatSubscribeArr['title'];
                    $description = $cfg_wechatSubscribeArr['description'];
                    $link = $cfg_wechatSubscribeArr['link'];
                    $image = $cfg_wechatSubscribeArr['image'];
                    
                    $data = '{
                        "touser":"'.$postObj->FromUserName.'",
                        "msgtype":"news",
                        "news":{
                            "articles": [{
                                "title": "'.$title.'",
                                "description": "'.$description.'",
                                "url": "'.$link.'",
                                "picurl": "'.$image.'"
                            }]
                        }
                    }';

                    $curl = curl_init();
                    curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                    curl_setopt($curl, CURLOPT_POST, 1);
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                    $result = json_decode(curl_exec($curl), true);
                    curl_close($curl);
                    if($result['errcode'] == 0){
                        echo '';die;
                    }
                    die;

                }

                return array("type" => "text", "body" => stripslashes($cfg_wechatSubscribe));
            }

            //微信素材
            if($cfg_wechatSubscribeType == 2){
                $news_item = $this->getWechatResource($cfg_wechatSubscribeMedia);
                if(count($news_item) > 1){
                    return array("type" => "multiNews", "body" => $news_item);
                }else{
                    return array("type" => "news", "body" => $news_item);
                }
            }

        //其他回复
        }else{

			if(strtolower($key) == 'idclub'){
				$RenrenCrypt = new RenrenCrypt();
				$openid = (string)$postObj->FromUserName;
	            $openid = base64_encode($RenrenCrypt->php_encrypt($openid));
				$url = 'https://www.kumanyun.com/?action=idclub&key=' . $openid;
				return array("type" => "text", "body" => '<a href="'.$url.'">点击登记信息→</a>');
			}

            //匹配关键字
            global $dsql;
            $sql = $dsql->SetQuery("SELECT `type`, `body`, `media` FROM `#@__site_wechat_autoreply` WHERE `title` like '%$key%' LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $type  = $ret[0]['type'];
                $body  = $ret[0]['body'];
                $media = $ret[0]['media'];

                //普通文本
                if($type == 1){

                    $bodyArr = json_decode(stripslashes($body), true);

                    //判断是否为数组
                    if(is_array($bodyArr)){
                        
                        include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
                        $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
                        $weixinAccessToken = $jssdk->getAccessToken();
    
                        $title = $bodyArr['title'];
                        $description = $bodyArr['description'];
                        $link = $bodyArr['link'];
                        $image = $bodyArr['image'];
                        
                        $data = '{
                            "touser":"'.$postObj->FromUserName.'",
                            "msgtype":"news",
                            "news":{
                                "articles": [{
                                    "title": "'.$title.'",
                                    "description": "'.$description.'",
                                    "url": "'.$link.'",
                                    "picurl": "'.$image.'"
                                }]
                            }
                        }';
    
                        $curl = curl_init();
                        curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
                        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                        curl_setopt($curl, CURLOPT_POST, 1);
                        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                        $result = json_decode(curl_exec($curl), true);
                        curl_close($curl);
                        if($result['errcode'] == 0){
                            echo '';die;
                        }
                        die;
                    }

                    return array("type" => "text", "body" => "$body");
                }

                //微信素材
                if($type == 2){

                    $news_item = $this->getWechatResource($media);
                    if(count($news_item) > 1){
                        return array("type" => "multiNews", "body" => $news_item);
                    }else{
                        return array("type" => "news", "body" => $news_item);
                    }

                }
            }
            //站内搜索
            elseif(!$cfg_autoReplyWithSiteSearchState){

                global $cfg_autoReplyWithSiteSearchModule;
                global $cfg_autoReplyWithSiteSearchTitle;
                global $cfg_autoReplyWithSiteSearchDescption;
                global $esConfig;

                $cfg_autoReplyWithSiteSearchTitle = $cfg_autoReplyWithSiteSearchTitle ? $cfg_autoReplyWithSiteSearchTitle : '查看与[$keyword]相关的内容';
                $esState = (int)$esConfig['open'];  //ES状态

                //验证是否注册过会员
                $openid = $postObj->FromUserName;
                $userid = 0;
                $cityid = 0;
                $sql = $dsql->SetQuery("SELECT `id`, `cityid` FROM `#@__member` WHERE `wechat_openid` = '$openid' AND (`mtype` = 1 OR `mtype` = 2) ");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $userid = (int)$ret[0]['id'];
                    $cityid = (int)$ret[0]['cityid'];
                }else{
                    return array("type" => "text", "body" => '<a href="'.$cfg_secureAccess.$cfg_basehost.'/api/login.php?type=wechat">请先注册/登录→</a>');
                }

                $cfg_autoReplyWithSiteSearchModule = !$cfg_autoReplyWithSiteSearchModule ? 'siteConfig' : $cfg_autoReplyWithSiteSearchModule;
                $moduleArr = explode('-', $cfg_autoReplyWithSiteSearchModule);

                $service = $moduleArr[0];
                $action  = $moduleArr[1];
                $template = 'siteSearch';
                $keywords = 'keywords';
                if($service == 'info'){
                    $template = 'list';
                }elseif($service == 'article'){
                    $template = 'searchlist';
                }elseif($service == 'house'){
                    $template = str_replace('List', '', $action);
                }elseif($service == 'job'){
                    
                    if($action == 'companyList'){
                        $template = 'searchlist';
                        $key .= '&type=2';  //因为搜索公司和搜索职位是一个页面，需要通过自定义参数控制
                    }
                    elseif($action = 'postList'){
                        $template = 'searchlist';
                    }
                    elseif($action = 'pgList'){
                        $template = 'general-search';
                    }
                    
                }elseif($service == 'shop'){
                    $template = 'search_list';
                }elseif($service == 'renovation'){
                    $template = 'company';
                }elseif($service == 'tuan'){
                    $template = 'list';
                    $keywords = 'search_keyword';
                }elseif($service == 'homemaking'){
                    $template = 'list';
                }elseif($service == 'huodong'){
                    $template = 'list';
                }elseif($service == 'business'){
                    $template = 'search-list2';
                }

                //如果会员没有绑定分站城市ID，进行系统自动判断
                if(!$cityid){

                    //如果只开通了一个分站，直接使用这个分站数据
                    $siteConfigService = new siteConfig();
                    $cityDomain = $siteConfigService->siteCity();
                    if(count($cityDomain) == 1){
                        $singelCityInfo = $cityDomain[0];
                        $cityid = (int)$singelCityInfo['cityid'];
                    }

                    //通过IP定位
                    if(!$cityid){
                        $cityData = getIpAddr(getIP(), 'json');
                        if(is_array($cityData)){
                            $siteConfigService = new siteConfig(array(
                                'province' => $cityData['region'],
                                'city' => $cityData['city']
                            ));
                            $cityInfo = $siteConfigService->verifyCity();
                            if(is_array($cityInfo)){
                                if($cityInfo['state'] == 100){
                                    $cityid = (int)$cityInfo['cityid'];
                                }
                            }
                        }
                    }

                    //获取系统设置的默认城市
                    if(!$cityid){
                        $singelCityInfo = checkDefaultCity();
                        if($singelCityInfo){
                            $cityid = (int)$singelCityInfo['cityid'];
                        }
                    }
                    
                    //获取到cityid后，更新该用户的cityid为些值
                    if($cityid){
                        $sql = $dsql->SetQuery("UPDATE `#@__member` SET `cityid` = '$cityid' WHERE `id` = $userid AND `lock_cityid` = 0");
                        $dsql->dsqlOper($sql, "update");
                    }

                }

                //经过以上步骤依然没有城市ID，则直接返回搜索链接地址让用户点击
                if(!$cityid){

                    $param = array(
                        'service' => $service,
                        'template' => $template,
                        'param' => $keywords . '=' . $key
                    );
                    $url = getUrlPath($param);

                    return array("type" => "text", "body" => '<a href="'.$url.'">点击进行查询→</a>');

                }

                //如果关联内容是全站搜索，但是系统并没有开启ES功能，重置关联内容为：商家列表
                if($cfg_autoReplyWithSiteSearchModule == 'siteConfig' && !$esState){
                    $cfg_autoReplyWithSiteSearchModule = 'business-blist';
                    $template = 'search-list2';
                }

                $moduleArr = explode('-', $cfg_autoReplyWithSiteSearchModule);
                $service = $moduleArr[0];
                $action  = $moduleArr[1];
                
                //查询到的数量
                $totalCount = 0;

                //分享图标
                global $cfg_sharePic;
                $sharePic = $cfg_sharePic;
                if($service != 'siteConfig'){
                    include HUONIAOINC . "/config/".$service.".inc.php";
                    if($customSharePic){
                        $sharePic = $customSharePic;
                    }
                }

                //全站搜索
                if($service == 'siteConfig'){
                    require_once(HUONIAOROOT . "/include/class/es.class.php");
                    $es = new es();
                    $ret = $es->search_index(
                        array(
                            'keyword' => $key,
                            'cityid' => $cityid
                        )
                    );

                    if(!isset($ret['state']) && $ret['pageInfo'] && $ret['pageInfo']['totalCount'] > 0){
                        $totalCount = (int)$ret['pageInfo']['totalCount'];
                    }
                }
                //单独查询接口
                else{
                    
                    $serviceClass = new $service(array(
                        'cityid' => $cityid,
                        'title' => $key,
                        'keywords' => $key
                    ));
                    $serviceAction = $serviceClass->$action();
                    if(isset($serviceAction['pageInfo'])){
                        $totalCount = $serviceAction['pageInfo']['totalCount'];
                    }
                    
                }

                include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
                $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
                $weixinAccessToken = $jssdk->getAccessToken();

                //查询数据
                if($totalCount){
                    $title = str_replace('$keyword', $key, str_replace('$count', $totalCount, $cfg_autoReplyWithSiteSearchTitle));
                    $description = str_replace('$keyword', $key, str_replace('$count', $totalCount, $cfg_autoReplyWithSiteSearchDescption));
                    $imgUrl = getFilePath($sharePic);

                    $param = array(
                        'service' => $service,
                        'template' => $template,
                        'param' => $keywords . '=' . $key
                    );
                    $link = getUrlPath($param);

                    $data = '{
                        "touser":"'.$openid.'",
                        "msgtype":"news",
                        "news":{
                            "articles": [{
                                "title": "'.$title.'",
                                "description": "'.$description.'",
                                "url": "'.$link.'",
                                "picurl": "'.$imgUrl.'"
                            }]
                        }
                    }';

                    $curl = curl_init();
                    curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$weixinAccessToken);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                    curl_setopt($curl, CURLOPT_POST, 1);
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                    $result = json_decode(curl_exec($curl), true);
                    curl_close($curl);
                    if($result['errcode'] == 0){
                        echo '';die;
                    }

                }else{
                    return array("type" => "text", "body" => '没有查询到与['.$key.']相关的信息，<a href="'.$cfg_secureAccess.$cfg_basehost.'/siteSearch.html">点击查询更多→</a>');
                }

            }
            else{
                // return array("type" => "text", "body" => "没有查询到相关信息");
                return "";
            }

        }
        return "";
    }


    //获取微信永久素材
    public function getWechatResource($media){

      //引入配置文件
      $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
      if(!file_exists($wechatConfig)) return;
      require($wechatConfig);

      include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
      $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
      $weixinAccessToken = $jssdk->getAccessToken();

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
    	// 	return;
    	// }
        // $result = json_decode($output, true);
    	// if(isset($result['errcode'])) {
    	// 	return;
    	// }
        //
        // $token = $result['access_token'];

        //获取素材列表
    	$pageSize = 20;
      $url = "https://api.weixin.qq.com/cgi-bin/freepublish/getarticle?access_token=$weixinAccessToken";
      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_HEADER, 0);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS, '{"article_id": "'.$media.'"}');
      curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
      curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
      $output = curl_exec($ch);
      curl_close($ch);
    	if(empty($output)){
    		return;
    	}
    	$result = json_decode($output, true);
    	if(isset($result['errcode'])) {
    		return;
    	}

    	return $result['news_item'];

    }


    //关注后绑定网站帐号
    public function bindSiteMember($openid, $uid = 0){

        global $dsql;
        require_once dirname(__FILE__)."/../payment/log.php";
        $_weixin= new CLogFileHandler(HUONIAOROOT . '/log/weixin/'.date('Y-m-d').'.log');
        $_weixin->DEBUG($openid);


      //引入配置文件
      $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
      if(!file_exists($wechatConfig)) return;
      require($wechatConfig);

      include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
      $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
      $weixinAccessToken = $jssdk->getAccessToken();


        // $curl = curl_init();
        // curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".APPID."&secret=".APPSECRET);
        // curl_setopt($curl, CURLOPT_HEADER, 0);
        // curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        // curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        // $token = json_decode(curl_exec($curl), true);
        // curl_close($curl);

        // $access_token = $token['access_token'];
        // if($access_token){

            //获取用户信息
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/user/info?access_token=".$weixinAccessToken."&openid=".$openid);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
            $user_info = json_decode(curl_exec($curl), true);
            curl_close($curl);

            $_weixin->DEBUG(json_encode($user_info));

            if(is_array($user_info)){

                $key      = $user_info['unionid'];
                $key      = $key ? $key : $user_info['openid'];

                //查询现有用户是否存在，如果已经存在，更新关注状态
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `wechat_conn` = '$key' OR `wechat_openid` = '$key'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    //更新用户信息
                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_subscribe` = 1 WHERE `wechat_conn` = '$key' OR `wechat_openid` = '$key'");
                    $dsql->dsqlOper($sql, "update");
                    
                }else{

                    $openidsql = $dsql->SetQuery("SELECT `wxkey` FROM `#@__site_wxid` WHERE `wxkey` = '$key' ");
                    $openidres = $dsql->dsqlOper($openidsql, 'results');
                    if (!empty($openidres)){
                        // $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wxkey` = '$key' WHERE `wxkey` = '$key'");
                        // $dsql->dsqlOper($sql, 'update');
                    }else{
                        $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxid` (`wxkey`) VALUES ('$key')");            //存取key方便用于更新关注公众号字段
                        $dsql->dsqlOper($sql, 'update');
                    }

                }
                // $key      = $openid;
                $nickname = trim($user_info['nickname']);
                $photo    = trim($user_info['headimgurl']);
                $gender   = $user_info['sex'] == 1 ? '男' : '女';

                //登录验证
                $userLogin = new userLogin($dbo);

                $data = array(
                    "code"     => "wechat",
                    "key"      => $key,
                    "openid"   => $user_info['openid'],
                    "nickname" => $nickname,
                    "photo"    => $photo,
                    "gender"   => $gender,
                    "noRedir"  => "1",
                    "wechat_subscribe" => 1,
					"state"    => $uid
                );
                $_weixin->DEBUG(json_encode($data));

                $userLogin->loginConnect($data);

            }

        // }

    }


}
