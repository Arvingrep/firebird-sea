<?php
/**
 * 后台管理配置文件
 *
 * @version        $Id: config.inc.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(HUONIAOADMIN.'../include/common.inc.php');
require_once(HUONIAOADMIN.'function/waimai.fun.php');
$huoniaoTag->caching         = FALSE;                             //是否使用缓存，后台不需要开启
$huoniaoTag->compile_dir     = HUONIAOROOT."/templates_c/admin";  //设置编译目录
$huoniaoTag->template_dir = dirname(__FILE__)."/templates";       //设置后台模板目录
$userLogin = new userLogin($dbo);

//header('Cache-Control:private');

//获取当前地址
$Nowurl = $s_scriptName = '';
$path = array();

$Nowurl = GetCurUrl();
$Nowurls = explode('/', $Nowurl);
for($i = 1; $i < count($Nowurls); $i++){
	array_push($path, $Nowurls[$i]);
}

$s_scriptName = join("/", $path);

if($action == "logout"){
    $userLogin->exitMember();
    // DropCookie("login_user");
    header("location:/wmsj/");
    // echo '{"state": 200, "info": "退出成功！"}';
    exit();
}

//检验用户登录状态
$userid = $userLogin->getMemberID();

$app = (int)$app;
$appuid = (int)$appuid;


if($app && $appuid){
	$userid = $appuid;
}

if($userid==-1){
	if($action != "checkLastOrder" && $action != "shopList" && $action != "updateStatus"){
	    header("location:/login.html?furl=".$cfg_secureAccess.$cfg_basehost.'/wmsj/');
	    exit();
	}else{
		echo '{"state": 200, "info": "登录超时！"}';
		exit();
	}

// 判断用户权限
}else{
    if(!verifyModuleAuth(array('module'=>'waimai','type'=>'')) && !$app)
    {
			$html = <<<eot
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0">
<title></title>
<script src="/static/js/core/touchScale.js"></script>
<script src="/static/js/core/zepto.min.js"></script>
</head>
<body>
<iframe src="/logout.html?from=app" style="display: none;"></iframe>
<script>
$(function(){
//客户端登录验证
alert('抱歉，您没有外卖店铺权限，请联系管理员！')
if (device.indexOf('huoniao') > -1) {
    setupWebViewJavascriptBridge(function(bridge) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler('appLogout', {}, function(){});
            bridge.callHandler('pageReload',    {}, function(responseData){});
        });
    })
    setTimeout(function(){
        location.href = '/wmsj';
    }, 1500);
}else{
    location.href = '/wmsj';
}
});
</script>
</body>
</html>
eot;
			echo $html;
			die;


        // $info = "抱歉，您没有外卖店铺权限，请联系管理员！";
        // $back = 'window.location.href = "/wmsj/exit.php"';
        // echo '<script>setTimeout(function(){alert("'.$info.'");'.$back.'}, 500)</script>';
        // die;
    }
    //外卖分成配置
    include(HUONIAOINC . "/config/waimai.inc.php");
    //基本设置
    $fencheng_foodprice  = (int)$custom_fencheng_foodprice;
    $fencheng_delivery  = (int)$custom_fencheng_delivery;
    $fencheng_addservice = (int)$custom_fencheng_addservice;
    $fencheng_zsb        = (int)$custom_fencheng_zsb;
    $fencheng_dabao      = (int)$custom_fencheng_dabao;
    $fencheng_discount   = (int)$custom_fencheng_discount;
    $fencheng_promotion  = (int)$custom_fencheng_promotion;
    $fencheng_firstdiscount = (int)$custom_fencheng_firstdiscount;
    $fencheng_quan       = (int)$custom_fencheng_quan;
	//判断是否入驻商家 start
	$time = time();
	$sql = $dsql->SetQuery("SELECT `id`,`shopid` FROM `#@__waimai_shop_manager` WHERE `userid` = $userid");
	$ret = $dsql->dsqlOper($sql, "results");
	if(!$ret){
		$sql = $dsql->SetQuery("SELECT `id`, `title`, `company`, `cityid` FROM `#@__business_list` WHERE `uid`='$userid' and `state` = 1");
		$res = $dsql->dsqlOper($sql, "results");
		if(!empty($res[0]['id']) && verifyModuleAuth(array('module'=>'waimai','type'=>''))){
			$company = !empty($res[0]['company']) ? $res[0]['company'] : $res[0]['title'];
			$cityid  = $res[0]['cityid'];
            $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_shop` (`cityid`, `shopname`, `jointime`, `status`, `ordervalid`,`fencheng_foodprice`,`fencheng_delivery`,`fencheng_addservice`,`fencheng_zsb`,`fencheng_dabao`,`fencheng_discount`,`fencheng_promotion`,`fencheng_firstdiscount`,`fencheng_quan`)	VALUES ('$cityid', '$company', '$time', 1, 1,'$fencheng_foodprice','$fencheng_delivery','$fencheng_addservice','$fencheng_zsb','$fencheng_dabao','$fencheng_discount','$fencheng_promotion','$fencheng_firstdiscount','$fencheng_quan')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				$sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$userid', '$aid', '$time')");
				$dsql->dsqlOper($sql, "lastid");
			}
		}

	}else{

////	    查询外卖商家列表有无 如果无要删除waimai_shop_manager 管理信息
///
        $checkShop = 0;
        foreach($ret as $key => $_val){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE `id` = ".$_val['shopid']);
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $checkShop = 1;
            }
        }
        
        if (!$checkShop){

            $delsql = $dsql->SetQuery("DELETE FROM `#@__waimai_shop_manager` WHERE `id` = ".$ret[0]['id']);
            $dsql->dsqlOper($delsql, "update");
            $sql = $dsql->SetQuery("SELECT `id`, `title`, `company`, `cityid` FROM `#@__business_list` WHERE `uid`='$userid' and `state` = 1");
            $res = $dsql->dsqlOper($sql, "results");
            if(!empty($res[0]['id']) && verifyModuleAuth(array('module'=>'waimai','type'=>''))){
                $company = !empty($res[0]['company']) ? $res[0]['company'] : $res[0]['title'];
                $cityid  = $res[0]['cityid'];
                $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_shop` (`cityid`, `shopname`, `jointime`, `status`, `ordervalid`,`fencheng_foodprice`,`fencheng_addservice`,`fencheng_zsb`,`fencheng_dabao`,`fencheng_discount`,`fencheng_promotion`,`fencheng_firstdiscount`,`fencheng_quan`)	VALUES ('$cityid', '$company', '$time', 1, 1,'$fencheng_foodprice','$fencheng_addservice','$fencheng_zsb','$fencheng_dabao','$fencheng_discount','$fencheng_promotion','$fencheng_firstdiscount','$fencheng_quan')");
                $aid = $dsql->dsqlOper($archives, "lastid");
                if(is_numeric($aid)){
                    $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$userid', '$aid', '$time')");
                    $dsql->dsqlOper($sql, "lastid");
                }
            }
        }

    }
	//判断是否入驻商家 end

	//这里判断用户是否有分店 start
	global $installModuleArr;
	if(in_array('shop', $installModuleArr)){
		$sql = $dsql->SetQuery("SELECT `id`  FROM `#@__shop_branch_store` WHERE `userid` = '$userid'");
		$res = $dsql->dsqlOper($sql, "results");
	}else{
		$res = 1;
	}
	//这里判断用户是否有分店 end

    $sql = $dsql->SetQuery("SELECT `shopid` FROM `#@__waimai_shop_manager` WHERE `userid` = $userid");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!$ret){
        $info = "抱歉，你没有任何外卖店铺或商城分店可以管理，请联系管理员！";
        $back = 'window.location.href = "/?service=member&template=logout"';
        if($from){
            $info .= "\\n即将返回来源页";
            $back = 'setTimeout(function(){window.location.href = "'.$from.'"}, 1000)';
        }
        echo '<script>setTimeout(function(){alert("'.$info.'");'.$back.'}, 500)</script>';
        die;
    }

    $manager = array();
    foreach ($ret as $key => $value) {
        $shopsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE `del` = 0 AND `id` = '".$value['shopid']."'");
    	$shopres = $dsql->dsqlOper($shopsql,"results");

    	if($shopres){
        	array_push($manager, $value['shopid']);
    	}
    }
    
    if(!$manager){
        $info = "抱歉，你没有任何外卖店铺或商城分店可以管理，请联系管理员！";
        $back = 'window.location.href = "/?service=member&template=logout"';
        if($from){
            $info .= "\\n即将返回来源页";
            $back = 'setTimeout(function(){window.location.href = "'.$from.'"}, 1000)';
        }
        echo '<script>setTimeout(function(){alert("'.$info.'");'.$back.'}, 500)</script>';
        die;
    }
    
    $managerIds = join(",", $manager);

}

$userLogin->keepUser();

$huoniaoTag->assign("adminPath", HUONIAOADMIN."../");
$huoniaoTag->assign("cfg_staticPath", $cfg_staticPath);

// 可管理店铺id数组
/*$huoniaoTag->assign("manager", $manager);*/
$huoniaoTag->assign("managerIds", $managerIds);
