<?php
/**
 * 分类信息高级设置
 *
 * @version        $Id: infoTypeAdvanced.php 2025-2-16 上午10:04:46 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2050, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoTypeAdvanced.html";

$action     = "infotype";
$pagetitle  = "分类高级设置";

//清空所有高级设置
if($dopost == 'resetAllAdvanced'){
    $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `advanced` = ''");
    $results = $dsql->dsqlOper($archives, "update");

    if($results != "ok"){
        die('{"state": 200, "info": "主表保存失败！"}');
    }

    adminLog("修改分类信息高级设置", "清空所有分类的高级设置");

    die('{"state": 100, "info": "保存成功！"}');
}

$tid = (int)$tid;
if(!$tid){
    die('分类ID获取失败');
}

//查询分类数据
$sql = $dsql->SetQuery("SELECT `parentid`, `advanced`, `typename` FROM `#@__".$action."` WHERE `id` = ".$tid);
$ret = $dsql->dsqlOper($sql, "results");
if(!$ret){
    die('{"state": 200, "info": "分类不存在或已经删除！"}');
}

$_title = $ret[0]['typename'];  //分类名称
$_advanced = $ret[0]['advanced'];  //高级设置数据
$_advancedArr = $_advanced ? json_decode($_advanced, true) : array();
$_parentid = (int)$ret[0]['parentid'];  //父级ID

$useParentConfig = 0;

//如果不是一级分类，并且该分类没有设置自定义，则查询上级分类
if(!$_advancedArr && $_parentid){
    $sql = $dsql->SetQuery("SELECT `advanced` FROM `#@__".$action."` WHERE `id` = ".$_parentid);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $_advanced = $ret[0]['advanced'];
        if($_advanced){
            $useParentConfig = 1;
            $_advancedArr = $_advanced ? json_decode($_advanced, true) : array();
        }
    }
}


if($dopost == "edit"){

    if($token == "") die('token传递失败！');

    $advancedArr = array();

    //视频上传
    $advancedArr['videoSwitch'] = (int)$videoSwitch;  //0开启 1关闭

    //图集上传数量
    $advancedArr['picSwitch'] = (int)$picSwitch;  //0默认 1自定义
    $advancedArr['atlasMax'] = (int)$atlasMax;

    //用户激励
    $advancedArr['excitationSwitch'] = (int)$excitationSwitch;  //0开启 1关闭

    //有效期开关
    $advancedArr['validSwitch'] = (int)$validSwitch;  //0开启 1关闭

    //有效期配置
    $advancedArr['validConfig'] = (int)$validConfig;  //0默认 1自定义

    //有效期规则
    $validRuleArr = array();
    if($validRule && $validRule['day']){
        for ($i = 0; $i < count($validRule['day']); $i++) {
            if($validRule['daytext'][$i] == 1){
                $daytime =  (int)$validRule['day'][$i] * (365 * 86400);
                $dayText = '年';
                }elseif ($validRule['daytext'][$i] == 2){
                $daytime= (int)$validRule['day'][$i] * (30 * 86400);
                $dayText = '月';
            }else{
                $daytime = (int)$validRule['day'][$i] * 86400;
                $dayText = '天';
            }
            array_push($validRuleArr, array(
                'times' => (int)$validRule['times'],
                'day' => (int)$validRule['day'][$i],
                'daytext' => (int)$validRule['daytext'][$i],
                'daytime' =>$daytime,
                'dayText' =>$dayText,
                'price' => (float)$validRule['price'][$i]
            ));
        }
    }
    $advancedArr['validRule'] = $validConfig == 1 ? $validRuleArr : array();

    //刷新开关
    $advancedArr['refreshSwitch'] = (int)$refreshSwitch;  //0开启 1关闭

    //刷新配置
    $advancedArr['refreshConfig'] = (int)$refreshConfig;  //0默认 1自定义

    //普通刷新价格
    $advancedArr['refreshNormalPrice'] = $refreshConfig == 1 ? (float)$refreshNormalPrice : 0;

    //智能刷新配置
    $refreshSmartArr = array();
    if($refreshSmart){
        for ($i = 0; $i < count($refreshSmart['times']); $i++) {
            array_push($refreshSmartArr, array(
                'times' => (int)$refreshSmart['times'][$i],
                'day' => (int)$refreshSmart['day'][$i],
                'price' => (float)$refreshSmart['price'][$i]
            ));
        }
    }
    $advancedArr['refreshSmart'] = $refreshConfig == 1 ? $refreshSmartArr : array();

    //置顶开关
    $advancedArr['topSwitch'] = (int)$topSwitch;  //0开启 1关闭

    //置顶配置
    $advancedArr['topConfig'] = (int)$topConfig;  //0默认 1自定义

    //普通置顶
    $topNormalArr = array();
    if($topNormal && $topNormal['day']){
        for ($i = 0; $i < count($topNormal['day']); $i++) {
            array_push($topNormalArr, array(
                'day' => (int)$topNormal['day'][$i],
                'price' => (float)$topNormal['price'][$i]
            ));
        }
    }
    $advancedArr['topNormal'] = $topConfig == 1 ? $topNormalArr : array();

    //计划置顶
    $topPlanArr = array();
    if($topPlan){
        for ($i = 0; $i < count($topPlan['all']); $i++) {
            array_push($topPlanArr, array(
                'all' => (float)$topPlan['all'][$i],
                'day' => (float)$topPlan['day'][$i]
            ));
        }
    }
    $advancedArr['topPlan'] = $topConfig == 1 ? $topPlanArr : array();

    //发布声明
    $advancedArr['fabuTips'] = trim(preg_replace("/\r|\n/", "", $fabuTips));

    //系统备注
    $advancedArr['sysTips'] = trim(preg_replace("/\r|\n/", "", $sysTips));

    //发布协议
    $protocol = trim($protocol);
    $protocolText = strip_tags($protocol);
    $advancedArr['protocol'] = $protocolText ? $protocol : '';

    //转换格式
    $advanced = json_encode($advancedArr, JSON_UNESCAPED_UNICODE);

    //保存到主表
    $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `advanced` = '".$advanced."'  WHERE `id` = ".$tid);
    $results = $dsql->dsqlOper($archives, "update");

    if($results != "ok"){
        die('{"state": 200, "info": "主表保存失败！"}');
    }

    adminLog("修改分类信息高级设置", $_title);

    die('{"state": 100, "info": "保存成功！"}');

}

//恢复默认配置
elseif($dopost == 'reset'){

    //保存到主表
    $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `advanced` = ''  WHERE `id` = ".$tid);
    $results = $dsql->dsqlOper($archives, "update");

    if($results != "ok"){
        die('{"state": 200, "info": "主表保存失败！"}');
    }

    adminLog("修改分类信息高级设置", "恢复默认配置：" . $_title);

    die('{"state": 100, "info": "保存成功！"}');

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
        'ui/bootstrap.min.js',
		'admin/info/infoTypeAdvanced.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('tid', $tid);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('title', $_title);
    $huoniaoTag->assign('useParentConfig', $useParentConfig);

    //上传视频开关-单选
    $huoniaoTag->assign('videoSwitchOpt', array(0, 1));
    $huoniaoTag->assign('videoSwitchNames',array('开启','关闭'));
    $huoniaoTag->assign('videoSwitch', (int)$_advancedArr['videoSwitch']);

    //上传图集开关-单选
    $huoniaoTag->assign('picSwitchOpt', array(0, 1));
    $huoniaoTag->assign('picSwitchNames',array('默认','自定义'));
    $huoniaoTag->assign('picSwitch', (int)$_advancedArr['picSwitch']);

    //图集数量
    $huoniaoTag->assign('atlasMax', (int)$_advancedArr['atlasMax']);

    //默认数量
    include(HUONIAOINC . "/config/info.inc.php");
    $huoniaoTag->assign('default_atlasMax', (int)$customAtlasMax);



    //用户激励开关-单选
    $huoniaoTag->assign('excitationSwitchOpt', array(0, 1));
    $huoniaoTag->assign('excitationSwitchNames',array('开启','关闭'));
    $huoniaoTag->assign('excitationSwitch', (int)$_advancedArr['excitationSwitch']);

    //延长有效期配置

    //有效期开关-单选
    $huoniaoTag->assign('validSwitchOpt', array(0, 1));
    $huoniaoTag->assign('validSwitchNames',array('开启','关闭'));
    $huoniaoTag->assign('validSwitch', (int)$_advancedArr['validSwitch']);

    //刷新配置-单选
    $huoniaoTag->assign('validConfigOpt', array(0, 1));
    $huoniaoTag->assign('validConfigNames',array('默认','自定义'));
    $huoniaoTag->assign('validConfig', (int)$_advancedArr['validConfig']);

    //有效期规则
    $huoniaoTag->assign('validRule', $_advancedArr['validRule']);

    //刷新配置

    //刷新开关-单选
    $huoniaoTag->assign('refreshSwitchOpt', array(0, 1));
    $huoniaoTag->assign('refreshSwitchNames',array('开启','关闭'));
    $huoniaoTag->assign('refreshSwitch', (int)$_advancedArr['refreshSwitch']);

    //刷新配置-单选
    $huoniaoTag->assign('refreshConfigOpt', array(0, 1));
    $huoniaoTag->assign('refreshConfigNames',array('默认','自定义'));
    $huoniaoTag->assign('refreshConfig', (int)$_advancedArr['refreshConfig']);

    //普通刷新
    $huoniaoTag->assign('refreshNormalPrice', (float)$_advancedArr['refreshNormalPrice']);

    //智能刷新
    $huoniaoTag->assign('refreshSmart', $_advancedArr['refreshSmart']);

    //置顶配置

    //置顶开关-单选
    $huoniaoTag->assign('topSwitchOpt', array(0, 1));
    $huoniaoTag->assign('topSwitchNames',array('开启','关闭'));
    $huoniaoTag->assign('topSwitch', (int)$_advancedArr['topSwitch']);

    //配置配置-单选
    $huoniaoTag->assign('topConfigOpt', array(0, 1));
    $huoniaoTag->assign('topConfigNames',array('默认','自定义'));
    $huoniaoTag->assign('topConfig', (int)$_advancedArr['topConfig']);

    //普通置顶
    $huoniaoTag->assign('topNormal', $_advancedArr['topNormal']);

    //计划置顶
    $huoniaoTag->assign('topPlan', $_advancedArr['topPlan']);


    //说明规则

    //发布声明
    $huoniaoTag->assign('fabuTips', $_advancedArr['fabuTips']);

    //系统备注
    $huoniaoTag->assign('sysTips', $_advancedArr['sysTips']);

    //发布规则
    $huoniaoTag->assign('protocol', $_advancedArr['protocol']);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
