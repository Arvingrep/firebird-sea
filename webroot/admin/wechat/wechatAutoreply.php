<?php
/**
 * 微信自动回复
 *
 * @version        $Id: wechatAutoreply.php 2017-2-24 上午10:42:10 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wechatAutoreply");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "wechatAutoreply.html";

$db = "site_wechat_autoreply";

$where = "";
$cityid = (int)$cityid;

//分站管理员强制使用权限分站
if($userType == 3){
    $cityid = $adminCityIds;
}

if($cityid){
    $where = " AND `cityid` = $cityid";
}


//删除关键字
if($dopost == "del"){
	if($id == "") die('{"state": 200, "info": '.json_encode('请选择要删除的关键字！').'}');
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` in (".$id.")" . $where);
	$dsql->dsqlOper($archives, "update");

	adminLog("删除微信自动回复", "分站：" . $cityid . '=>' . $id);
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');

//获取微信素材
}elseif($dopost == "resource"){

	//引入配置文件
	$wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
	if(!file_exists($wechatConfig)) die('{"state": 200, "info": "请先设置微信开发者信息！"}');
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
	// 	die('{"state": 200, "info": "Token获取失败，请检查微信开发者帐号配置信息！"}');
	// }
    // $result = json_decode($output, true);
	// if(isset($result['errcode'])) {
	// 	die('{"state": 200, "info": "'.$result['errcode']."：".$result['errmsg'].'"}');
	// }
	//
    // $token = $result['access_token'];
    
    $page = (int)$_POST['page'];

    //获取素材列表
	$pageSize = 20;
    $url = "https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=$token";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{"type": "news", "offset": "'.(int)$page.'", "count": "'.$pageSize.'"}');
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    $output = curl_exec($ch);
    curl_close($ch);
	if(empty($output)){
		die('{"state": 200, "info": "素材获取失败，请检查微信开发者帐号配置信息！"}');
	}
	$result = json_decode($output, true);
	if(isset($result['errcode'])) {
		die('{"state": 200, "info": "'.$result['errcode']."：".$result['errmsg'].'"}');
	}

	echo '{"state": 100, "info": '.json_encode("获取成功").', "pageSize": "'.$pageSize.'", "data": '.$output.'}';
	die;

//获取临时素材
}elseif($dopost == "getLitpic"){

    $id = $_GET['id'];
	if(empty($id)) die;

	echo GrabImage($id);die;


//更新
}elseif($dopost == "save"){

    //分站自定义配置
    if($cityid){

        //载入微信配置文件
        require(HUONIAOINC.'/config/wechatConfig.inc.php');

        $cfg_wechat_cityAdvanced = isset($cfg_wechat_cityAdvanced) ? $cfg_wechat_cityAdvanced : array();

        //复制总站配置
        if($action == 'copyDefaultConfig'){
            $cfg_wechat_cityAdvanced[$cityid] = array(
                "subscribeType" => $cfg_wechatSubscribeType,
                "subscribe" => $cfg_wechatSubscribe,
                "subscribeMedia" => $cfg_wechatSubscribeMedia,
                "autoReplyWithSiteSearchState" => $cfg_autoReplyWithSiteSearchState,
                "autoReplyWithSiteSearchModule" => $cfg_autoReplyWithSiteSearchModule,
                "autoReplyWithSiteSearchTitle" => $cfg_autoReplyWithSiteSearchTitle,
                "autoReplyWithSiteSearchDescption" => $cfg_autoReplyWithSiteSearchDescption,
            );
        }
        else{
            $cfg_wechat_cityAdvanced[$cityid] = array(
                "subscribeType" => $subscribeType,
                "subscribe" => _RunMagicQuotes($subscribe),
                "subscribeMedia" => $subscribeMedia,
                "autoReplyWithSiteSearchState" => $autoReplyWithSiteSearchState,
                "autoReplyWithSiteSearchModule" => $autoReplyWithSiteSearchModule,
                "autoReplyWithSiteSearchTitle" => $autoReplyWithSiteSearchTitle,
                "autoReplyWithSiteSearchDescption" => $autoReplyWithSiteSearchDescption,
            );
        }

        //系统默认配置
        $_subscribeType = (int)$cfg_wechatSubscribeType;
        $_subscribe = $cfg_wechatSubscribe;

        $_autoReplyWithSiteSearchState = (int)$cfg_autoReplyWithSiteSearchState;
        $_autoReplyWithSiteSearchModule = trim($cfg_autoReplyWithSiteSearchModule);
        $_autoReplyWithSiteSearchTitle = trim($cfg_autoReplyWithSiteSearchTitle);
        $_autoReplyWithSiteSearchTitle = $_autoReplyWithSiteSearchTitle ? $_autoReplyWithSiteSearchTitle : '查看与[$keyword]相关的内容';
        $_autoReplyWithSiteSearchDescption = trim($cfg_autoReplyWithSiteSearchDescption);
    }
    else{
        $_subscribeType = (int)$subscribeType;
        $_subscribe = _RunMagicQuotes($subscribe);

        $_autoReplyWithSiteSearchState = (int)$autoReplyWithSiteSearchState;
        $_autoReplyWithSiteSearchModule = trim($autoReplyWithSiteSearchModule);
        $_autoReplyWithSiteSearchTitle = trim($autoReplyWithSiteSearchTitle);
        $_autoReplyWithSiteSearchTitle = $_autoReplyWithSiteSearchTitle ? $_autoReplyWithSiteSearchTitle : '查看与[$keyword]相关的内容';
        $_autoReplyWithSiteSearchDescption = trim($autoReplyWithSiteSearchDescption);
    }

	//站点信息文件内容
	$configFile = "<"."?php\r\n";
    $configFile .= "\$cfg_wechatType = '".$cfg_wechatType."';\r\n";
    $configFile .= "\$cfg_wechatToken = '".$cfg_wechatToken."';\r\n";
    $configFile .= "\$cfg_wechatAppid = '".$cfg_wechatAppid."';\r\n";
    $configFile .= "\$cfg_wechatAppsecret = '".$cfg_wechatAppsecret."';\r\n";
    $configFile .= "\$cfg_wechatName = '"._RunMagicQuotes($cfg_wechatName)."';\r\n";
    $configFile .= "\$cfg_wechatCode = '"._RunMagicQuotes($cfg_wechatCode)."';\r\n";
    $configFile .= "\$cfg_wechatQr = '"._RunMagicQuotes($cfg_wechatQr)."';\r\n";
    $configFile .= "\$cfg_wechatSubscribeType = '".$_subscribeType."';\r\n";
    $configFile .= "\$cfg_wechatSubscribe = '".$_subscribe."';\r\n";
    $configFile .= "\$cfg_wechatSubscribeMedia = '".$_subscribeMedia."';\r\n";
    $configFile .= "\$cfg_wechatAutoLogin = '".$cfg_wechatAutoLogin."';\r\n";
    $configFile .= "\$cfg_wechatBindPhone = '".$cfg_wechatBindPhone."';\r\n";
    $configFile .= "\$cfg_wechatRedirect = '".$cfg_wechatRedirect."';\r\n";
	$configFile .= "\$cfg_wechatPoster = '".$cfg_wechatPoster."';\r\n";
	$configFile .= "\$cfg_wechatTips = '".$cfg_wechatTips."';\r\n";
    $configFile .= "\$cfg_miniProgramName = '".$cfg_miniProgramName."';\r\n";
    $configFile .= "\$cfg_miniProgramAppid = '".$cfg_miniProgramAppid."';\r\n";
    $configFile .= "\$cfg_miniProgramAppsecret = '".$cfg_miniProgramAppsecret."';\r\n";
	$configFile .= "\$cfg_miniProgramId = '".$cfg_miniProgramId."';\r\n";
	$configFile .= "\$cfg_useWxMiniProgramLogin = ".$cfg_useWxMiniProgramLogin.";\r\n";
	$configFile .= "\$cfg_miniProgramLocationAuth = '".$cfg_miniProgramLocationAuth."';\r\n";
	$configFile .= "\$cfg_miniProgramLoginProfile = ".(int)$cfg_miniProgramLoginProfile.";\r\n";
	$configFile .= "\$cfg_miniProgramBindPhone = ".(int)$cfg_miniProgramBindPhone.";\r\n";
	$configFile .= "\$cfg_iosVirtualPaymentState = ".$cfg_iosVirtualPaymentState.";\r\n";
	$configFile .= "\$cfg_iosVirtualPaymentTip = '".$cfg_iosVirtualPaymentTip."';\r\n";
    $configFile .= "\$cfg_miniProgramQr = '".$cfg_miniProgramQr."';\r\n";
	$configFile .= "\$cfg_miniProgramTemplate = '".$cfg_miniProgramTemplate."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchState = ".(int)$_autoReplyWithSiteSearchState.";\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchModule = '".$_autoReplyWithSiteSearchModule."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchTitle = '".$_autoReplyWithSiteSearchTitle."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchDescption = '".$_autoReplyWithSiteSearchDescption."';\r\n";
    $configFile .= "\$cfg_wechat_cityAdvanced = ".generateArrayString($cfg_wechat_cityAdvanced).";\r\n";
	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/wechatConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

    //关键字回复
	if($ids && $action != 'copyDefaultConfig'){
		foreach ($ids as $k => $val) {
			$id = $val;
			$key = _RunMagicQuotes($keyword[$k]);
			$typ = (int)$type[$k];
			$res = _RunMagicQuotes($body[$k]);
			$med = $media[$k];

			//已经存在的更新
			if($id){
				$sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `title` = '$key', `type` = '$typ', `body` = '$res', `media` = '$med' WHERE `id` = $id AND `cityid` = $cityid");
				$dsql->dsqlOper($sql, "update");

			//新增
			}else{
				$sql = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`cityid`, `title`, `type`, `body`, `media`) VALUES ('$cityid', '$key', '$typ', '$res', '$med')");
				$dsql->dsqlOper($sql, "update");

			}
		}
	}

    if($action == 'copyDefaultConfig'){
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `type`, `body`, `media` FROM `#@__".$db."` WHERE `cityid` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {
                $sql = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`cityid`, `title`, `type`, `body`, `media`) VALUES ('$cityid', '".$value['title']."', '".$value['type']."', '".$value['body']."', '".$value['media']."')");
                $dsql->dsqlOper($sql, "update");
            }
        }
    }

	adminLog("修改微信自动回复", "分站：" . $cityid);
	die('{"state": 100, "info": '.json_encode('保存成功！').'}');
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
        'ui/chosen.jquery.min.js',
		'admin/wechat/wechatAutoreply.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC.'/config/wechatConfig.inc.php');

    //全站搜索状态
    $esState = (int)$esConfig['open'];
    $huoniaoTag->assign('esState', $esState);

    if($cityid){
        $huoniaoTag->assign('wechatSubscribeType', $cfg_wechat_cityAdvanced[$cityid]['subscribeType']);
        $huoniaoTag->assign('wechatSubscribe', stripslashes($cfg_wechat_cityAdvanced[$cityid]['subscribe']));
        $huoniaoTag->assign('wechatSubscribeMedia', $cfg_wechat_cityAdvanced[$cityid]['subscribeMedia']);

        //关联网站搜索服务
        $huoniaoTag->assign('autoReplyWithSiteSearchValues', array('0', '1'));
        $huoniaoTag->assign('autoReplyWithSiteSearchStateNames',array('开启','关闭'));
        $huoniaoTag->assign('autoReplyWithSiteSearchStateChecked', $cfg_wechat_cityAdvanced[$cityid] ? (int)$cfg_wechat_cityAdvanced[$cityid]['autoReplyWithSiteSearchState'] : 1);

        $huoniaoTag->assign('autoReplyWithSiteSearchModule', $cfg_wechat_cityAdvanced[$cityid]['autoReplyWithSiteSearchModule']);
        $huoniaoTag->assign('autoReplyWithSiteSearchTitle', $cfg_wechat_cityAdvanced[$cityid]['autoReplyWithSiteSearchTitle'] ? $cfg_wechat_cityAdvanced[$cityid]['autoReplyWithSiteSearchTitle'] : '查看与[$keyword]相关的内容');
        $huoniaoTag->assign('autoReplyWithSiteSearchDescption', $cfg_wechat_cityAdvanced[$cityid]['autoReplyWithSiteSearchDescption']);
    }
    else{
        $huoniaoTag->assign('wechatSubscribeType', $cfg_wechatSubscribeType);
        $huoniaoTag->assign('wechatSubscribe', stripslashes($cfg_wechatSubscribe));
        $huoniaoTag->assign('wechatSubscribeMedia', $cfg_wechatSubscribeMedia);

        //关联网站搜索服务
        $huoniaoTag->assign('autoReplyWithSiteSearchValues', array('0', '1'));
        $huoniaoTag->assign('autoReplyWithSiteSearchStateNames',array('开启','关闭'));
        $huoniaoTag->assign('autoReplyWithSiteSearchStateChecked', (int)$cfg_autoReplyWithSiteSearchState);

        $huoniaoTag->assign('autoReplyWithSiteSearchModule', $cfg_autoReplyWithSiteSearchModule);
        $huoniaoTag->assign('autoReplyWithSiteSearchTitle', $cfg_autoReplyWithSiteSearchTitle ? $cfg_autoReplyWithSiteSearchTitle : '查看与[$keyword]相关的内容');
        $huoniaoTag->assign('autoReplyWithSiteSearchDescption', $cfg_autoReplyWithSiteSearchDescption);
    }	

    //内容列表
    $moduleList = array(
        array('title' => '全站搜索', 'value' => ''),
        array('title' => '系统商家', 'value' => 'business-blist'),
    );

    $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND (`name` =  'info' OR `name` = 'article' OR `name` = 'house' OR `name` = 'job' OR `name` = 'shop' OR `name` = 'renovation' OR `name` = 'tuan' OR `name` = 'homemaking' OR `name` = 'huodong') ORDER BY `weight`, `id`");
	$result = $dsql->dsqlOper($sql, "results");
	if($result){
		foreach ($result as $key => $value) {
            
            $name = $value['name'];
            $title = $value['subject'] ? $value['subject'] : $value['title'];

            if($name == 'info'){
                array_push($moduleList, array(
                    'title' => $title,
                    'value' => $name . '-ilist_v2'
                ));
            }
            elseif($name == 'article'){
                array_push($moduleList, array(
                    'title' => $title,
                    'value' => $name . '-alist'
                ));
            }
            elseif($name == 'house'){
                array_push($moduleList, array(
                    'title' => $title . ' - 楼盘',
                    'value' => $name . '-loupanList'
                ), array(
                    'title' => $title . ' - 小区',
                    'value' => $name . '-communityList'
                ), array(
                    'title' => $title . ' - 二手房',
                    'value' => $name . '-saleList'
                ), array(
                    'title' => $title . ' - 租房',
                    'value' => $name . '-zuList'
                ), array(
                    'title' => $title . ' - 写字楼',
                    'value' => $name . '-xzlList'
                ), array(
                    'title' => $title . ' - 商铺',
                    'value' => $name . '-spList'
                ), array(
                    'title' => $title . ' - 厂房/仓库',
                    'value' => $name . '-cfList'
                ), array(
                    'title' => $title . ' - 车位',
                    'value' => $name . '-cwList'
                ));
            }
            elseif($name == 'job'){
                array_push($moduleList, array(
                    'title' => $title . ' - 公司',
                    'value' => $name . '-companyList'
                ), array(
                    'title' => $title . ' - 职位',
                    'value' => $name . '-postList'
                ), array(
                    'title' => $title . ' - 普工招聘',
                    'value' => $name . '-pgList'
                ));
            }
            elseif($name == 'shop'){
                array_push($moduleList, array(
                    'title' => $title . ' - 商品',
                    'value' => $name . '-slist'
                ));
            }
            elseif($name == 'renovation'){
                array_push($moduleList, array(
                    'title' => $title . ' - 公司',
                    'value' => $name . '-store'
                ));
            }
            elseif($name == 'tuan'){
                array_push($moduleList, array(
                    'title' => $title . ' - 商品',
                    'value' => $name . '-tlist'
                ));
            }
            elseif($name == 'homemaking'){
                array_push($moduleList, array(
                    'title' => $title . ' - 服务',
                    'value' => $name . '-hlist'
                ));
            }
            elseif($name == 'huodong'){
                array_push($moduleList, array(
                    'title' => $title,
                    'value' => $name . '-hlist'
                ));
            }
		}
	}

	$huoniaoTag->assign('moduleList', $moduleList);



	//查询已经设置的关键字
	$list = array();
	$sql = $dsql->SetQuery("SELECT `id`, `title`, `type`, `body`, `media` FROM `#@__".$db."` WHERE `cityid` = '$cityid' ".$where." ORDER BY `id` ASC");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $key => $value) {
			array_push($list, array(
				"id" => $value['id'],
				"key" => $value['title'],
				"type" => $value['type'],
				"body" => $value['body'],
				"media" => $value['media']
			));
		}
	}
	$huoniaoTag->assign('list', $list);// 获取所有分站绑定的公众号


    global $cfg_siteCityAdvanced_wechat;
    $wechatArr = array();

    if($cfg_siteCityAdvanced_wechat){

        $defautWechatConfig = array(
            'cityname' => '总站配置',
            'token' => $cfg_wechatToken,
            'appid' => $cfg_wechatAppid,
            'appsecret' => $cfg_wechatAppsecret,
            'name' => $cfg_wechatName,
            'code' => $cfg_wechatCode,
            'qr' => $cfg_wechatQr
        );

        // 向cfg_siteCityAdvanced_wechat前面添加系统默认的公众号配置，不要改变原key
        $wechatArr = array();
        
        // 先添加默认配置，key为0
        if($cfg_wechatToken && $cfg_wechatAppid && $cfg_wechatAppsecret && $userType != 3){
            $wechatArr[0] = $defautWechatConfig;
        }
        
        // 再添加分站配置，保持原key不变
        if($cfg_siteCityAdvanced_wechat && is_array($cfg_siteCityAdvanced_wechat)){
            foreach($cfg_siteCityAdvanced_wechat as $key => $value){
                if(($userType == 3 && $key == $adminCityIds) || $userType != 3){
                    $wechatArr[$key] = $value;
                }
            }
        }
    }
    
    $huoniaoTag->assign('wechatArr', $wechatArr);
    $huoniaoTag->assign('cityid', (int)$cityid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/wechat";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}








//本地图片
class imgdata{
	public $imgsrc;
	public $imgdata;
	public $imgform;
	public function getdir($source){
			$this->imgsrc  = $source;
	}
	public function img2data(){
		$this->_imgfrom($this->imgsrc);
		return $this->imgdata=fread(fopen($this->imgsrc,'rb'),filesize($this->imgsrc));
	}
	public function data2img(){
		header("content-type:$this->imgform");
		echo $this->imgdata;
	}
	public function _imgfrom($imgsrc){
		$info = getimagesize($imgsrc);
		return $this->imgform = $info['mime'];
	}
}

//远程图片
function GrabImage($url) {
	if ($url == "") return false;

	//通过CURL方式读取远程图片内容
	$curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, $url);
  curl_setopt($curl, CURLOPT_HEADER, 0);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
  curl_setopt($curl, CURLOPT_TIMEOUT, 5);
  $img = curl_exec($curl);
  curl_close($curl);

	header("content-type:image/jpeg");

	//如果下载失败则显示一张本地error图片
	if(empty($img)){
		$n = new imgdata;
		$n -> getdir(HUONIAOROOT."/static/images/404.jpg");
		$n -> img2data();
		$n -> data2img();
	}else{
		return $img;
	}
}


// 生成PHP数组字符串
function generateArrayString($array) {
    if (empty($array)) return 'array()';
    
    $parts = [];
    foreach ($array as $key => $value) {
        $innerParts = [];
        foreach ($value as $k => $v) {
            $innerParts[] = "        '$k' => '$v'";
        }
        $parts[] = "    $key => array(\n" . implode(",\n", $innerParts) . "\n    )";
    }
    
    return "array(\n" . implode(",\n", $parts) . "\n)";
}