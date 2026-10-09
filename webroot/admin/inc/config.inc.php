<?php
/**
 * 后台管理配置文件
 *
 * @version        $Id: config.inc.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(HUONIAOADMIN.'/../include/common.inc.php');
require_once(HUONIAOINC.'/class/userLogin.class.php');
$huoniaoTag->caching         = FALSE;                             //是否使用缓存，后台不需要开启
$huoniaoTag->compile_dir     = HUONIAOROOT."/templates_c/admin";  //设置编译目录
$huoniaoTag->template_dir = dirname(__FILE__)."/templates";       //设置后台模板目录
$userLogin = new userLogin($dbo);

//获取当前地址
$Nowurl = $s_scriptName = '';
$path = array();

$Nowurl = GetCurUrl();
$Nowurls = explode('/', $Nowurl);
for($i = 2; $i < count($Nowurls); $i++){
	array_push($path, $Nowurls[$i]);
}

$s_scriptName = join("/", $path);

//数据库还原操作不进行登录验证
if($action != 'dorevert'){

	//检验用户登录状态
    $adminid = $userLogin->getUserID();
	if($adminid == -1 && $action != 'filecheck' && $action != 'sync' && $action != 'syncDatabase'){
	    header("location:".HUONIAOADMIN."/login.php?gotopage=".urlencode($s_scriptName));
	    exit();
	}

	$userLogin->keepUser();

	$huoniaoTag->assign("adminPath", HUONIAOADMIN."/");
	//css
	$huoniaoOfficial = '';
	if(!testPurview("huoniaoOfficial")){
		$huoniaoOfficial = "\r\n<style>.alert.alert-success {display: none!important;} a[href^='https://help.kumanyun.com'] {display: none!important;}</style>";
	}
	$huoniaoTag->assign('cssFile', includeFile('css') . $huoniaoOfficial);

	//管理员类型
	$userType = $userLogin->getUserType();
	$huoniaoTag->assign('userType', $userType);

	//可操作的管理员、城市，多个以,分隔
	$adminIds = $userLogin->getAdminIds();
	$adminIds = empty($adminIds) ? 0 : $adminIds;
	$adminCityIds = $userLogin->getAdminCityIds();
	$adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

    PutCookie("admin_userType", (int)$userType, 86400 * 30);

	if($userType != 3){
		$adminCityIds .= ',0';
	}

	//只有分站管理员才进行cityid的条件查询，此功能暂时停用，排查出来后台慢的原因了（分站城市太多后，$adminIds的逻辑优化好了，这里就不需要了）
	// $adminCityIdsIn = 1;
	// if($userType == 3){
// 		$adminCityIdsIn = 1;
	// }

	//当前登录管理员可以操作的管理员，array
	$adminListArr = $userLogin->getAdminList();
	$adminListArr = empty($adminListArr) ? array() : $adminListArr;

    //查询城市招聘模块关联的管理员，array
    $adminListArrZhaopin = $userLogin->getAdminList('zhaopin');
	$adminListArrZhaopin = empty($adminListArrZhaopin) ? array() : $adminListArrZhaopin;

	//当前登录管理员可以操作的城市，array
	$adminCityArr = $userLogin->getAdminCity();
	$adminCityArr = empty($adminCityArr) ? array() : $adminCityArr;


    //指定分站ID，一般用于列表筛选
    $adminCity = (int)$adminCity;

}

//分页默认值
$pagestep = $pagestep == "" ? ($pageSize ? $pageSize : 10) : $pagestep;
$page = $page == "" ? 1 : $page;

$cfg_basehost_ = $cfg_basehost;
if(substr($cfg_basehost, 0, 4) == 'www.') {
    $cfg_basehost_ = substr($cfg_basehost, 4);
}

$huoniaoTag->assign('cfg_basehost_', $cfg_basehost_);
$huoniaoTag->assign('cfg_cookiePre', $cfg_cookiePre);
$huoniaoTag->assign('notice', (int)$notice);
$huoniaoTag->assign('cityList', json_encode($adminCityArr));
$huoniaoTag->assign('adminid', $adminid);

//国际区号
$internationalPhoneCode = array();
$internationalPhoneCodeHandels = new handlers('siteConfig', 'internationalPhoneSection');
$internationalPhoneCodeRreturn = $internationalPhoneCodeHandels->getHandle();
if($internationalPhoneCodeRreturn['state'] == 100){
	$internationalPhoneCode = $internationalPhoneCodeRreturn['info'];
}
$huoniaoTag->assign('internationalPhoneCode', $internationalPhoneCode);

//此处覆盖common.inc中的值，因为common中判断了设备类型的显示，如果直接使用会出现：模块管理中禁用了电脑端，后台的模块验证中会隐藏掉此模块的配置项，比如：刷新置顶功能
$installModuleArr = array();
$sql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` WHERE `state` = 0 AND `parentid` != 0 AND `type` = 0 ORDER BY `weight` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {
	$installModuleArr[] = $value['name'];
  }
}
$huoniaoTag->assign('installModuleArr', $installModuleArr);


//消费金名称
$configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
$Payconfig= $dsql->dsqlOper($configPay, "results");
$bonusName = $payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
$huoniaoTag->assign('bonusName', $bonusName);


//获取分站筛选条件，只有在分站管理员登录状态时才需要返回值
//$key为查询字段，如：`cityid`、s.`cityid`
function getCityFilter($key){
    global $userType;  //管理员类型  等于3说明是分站管理员
    global $adminCityIds;  //当前登录管理员可以管理的分站ID集合，如：1,2,3,4

    if($key && $userType == 3){
        return " AND {$key} in ($adminCityIds)";
    }
    return '';
}



//获取指定分站或者异常分站筛选条件，没有指定分站时，只有非分站管理员时才需要返回正常值，否则返回错误值
//$key为查询字段，如：`cityid`、s.`cityid`
function getWrongCityFilter($key, $cityid = 0){
    global $userType;  //管理员类型  等于3说明是分站管理员
    global $adminCityIds;  //当前登录管理员可以管理的分站ID集合，如：1,2,3,4
    $_adminCityIds = $adminCityIds;

    $cityid = (int)$cityid;
    if($cityid > 0){
        return " AND {$key} = $cityid";
    }

    if($key && $userType != 3){
        $_adminCityIds = substr($_adminCityIds, 0, -2);  //删除最后的,0
        return " AND {$key} not in ($_adminCityIds)";
    }
    return " AND 100 = 200";
}

//将时区信息存入cookie
PutCookie("cfg_timezone", date_default_timezone_get(), 60 * 60, "/");

//向输出浏览器输出接口返回的数据
function output($info, $err = 1, $arr = array()){
    global $callback;

    //基础内容
    $ret = array(
        'state' => $err ? 200 : 100, 
        'info' => $info
    );

    //附加参数合并
    if($arr){
        $ret = array_merge($ret, $arr);
    }

    header("Content-type: application/json");

    //输出到浏览器
    if($callback){
        echo $callback."(".json_encode($ret, JSON_UNESCAPED_UNICODE).")";
    }else{
        echo json_encode($ret, JSON_UNESCAPED_UNICODE);
    }
    die;
}