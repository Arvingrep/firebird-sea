<?php
/**
 * 积分设置
 *
 * @version        $Id: pointsConfig.php 2015-8-4 下午15:09:11 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("pointsConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pointsConfig.html";
$dir       = "../../templates/member"; //当前目录

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$cfg_pointState = (int)$pointState;
	$cfg_pointName  = $pointName;
	$cfg_pointRatio = (float)$pointRatio;
	$cfg_pointFee   = (float)$pointFee;
	$cfg_pointRegGiving   = (float)$pointRegGiving;
	$cfg_pointRegGivingRec   = (int)$pointRegGivingRec;
	$cfg_moneyRegGivingRec   = (float)$moneyRegGivingRec;
	$cfg_moneyRegGivingWithdraw   = (float)$moneyRegGivingWithdraw;
	$cfg_moneyRegGivingState   = (int)$moneyRegGivingState;
	$cfg_pointPension   = (int)$pointPension;
	$cfg_recRegisterGuide   = (int)$recRegisterGuide;

	$cfg_regGivingQuan = isset($regGivingQuan) ? join(',', $regGivingQuan) : '';

	$cfg_returnPointState = (int)$returnPointState;
	$cfg_returnPoint_tuan = (int)$returnPoint_tuan;
	$cfg_returnPoint_shop = (int)$returnPoint_shop;
	$cfg_returnPoint_info = (int)$returnPoint_info;
	$cfg_returnPoint_waimai = (int)$returnPoint_waimai;
	$cfg_returnPoint_homemaking = (int)$returnPoint_homemaking;
	$cfg_returnPoint_education = (int)$returnPoint_education;
	$cfg_returnPoint_travel = (int)$returnPoint_travel;
	$cfg_returnPoint_maidan = (int)$returnPoint_maidan;

	//抵扣积分
    $cfg_offset_tuan = (int)$offset_tuan;
    $cfg_offset_shop = (int)$offset_shop;
    $cfg_offset_waimai =(int)$offset_waimai;
    $cfg_offset_homemaking = (int)$offset_homemaking;
    $cfg_offset_education =(int)$offset_education;
    $cfg_offset_travel = (int)$offset_travel;

    //入账返积分
    $cfg_ruzhangPointFee_tuan = (int)$ruzhangPointFee_tuan;
    $cfg_ruzhangPointFee_shop = (int)$ruzhangPointFee_shop;
    $cfg_ruzhangPointFee_info = (int)$ruzhangPointFee_info;
    $cfg_ruzhangPointFee_waimai = (int)$ruzhangPointFee_waimai;
    $cfg_ruzhangPointFee_homemaking = (int)$ruzhangPointFee_homemaking;
    $cfg_ruzhangPointFee_travel = (int)$ruzhangPointFee_travel;
    $cfg_ruzhangPointFee_education = (int)$ruzhangPointFee_education;

    //互动送积分(发布/评论)
    $cfg_returnInteraction_sfcar = (int)$returnInteraction_sfcar;
    $cfg_returnInteraction_info = (int)$returnInteraction_info;
    $cfg_returnInteraction_house = (int)$returnInteraction_house;
    $cfg_returnInteraction_live = (int)$returnInteraction_live;
    $cfg_returnInteraction_tieba = (int)$returnInteraction_tieba;
    $cfg_returnInteraction_car = (int)$returnInteraction_car;
    $cfg_returnInteraction_huodong = (int)$returnInteraction_huodong;
    $cfg_returnInteraction_vote = (int)$returnInteraction_vote;
    $cfg_returnInteraction_comment = (int)$returnInteraction_comment;
    $cfg_returnInteraction_commentDay = (int)$returnInteraction_commentDay;
    $cfg_returnInteraction_article= (int)$returnInteraction_article;
    $cfg_returnInteraction_circle= (int)$returnInteraction_circle;


    adminLog("修改积分设置");


	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_pointState = '".$cfg_pointState."';\r\n";
	$configFile .= "\$cfg_pointName = '".$cfg_pointName."';\r\n";
	$configFile .= "\$cfg_pointRatio = ".$cfg_pointRatio.";\r\n";
	$configFile .= "\$cfg_pointFee = ".$cfg_pointFee.";\r\n";
	$configFile .= "\$cfg_pointRegGiving = ".$cfg_pointRegGiving.";\r\n";
	$configFile .= "\$cfg_pointRegGivingRec = ".$cfg_pointRegGivingRec.";\r\n";
	$configFile .= "\$cfg_moneyRegGivingRec = ".$cfg_moneyRegGivingRec.";\r\n";
	$configFile .= "\$cfg_moneyRegGivingWithdraw = ".$cfg_moneyRegGivingWithdraw.";\r\n";
	$configFile .= "\$cfg_moneyRegGivingState = ".$cfg_moneyRegGivingState.";\r\n";
	$configFile .= "\$cfg_pointPension = ".$cfg_pointPension.";\r\n";
	$configFile .= "\$cfg_regGivingQuan = '".$cfg_regGivingQuan."';\r\n";
	$configFile .= "\$cfg_recRegisterGuide = ".$cfg_recRegisterGuide.";\r\n";
	$configFile .= "\$cfg_returnPointState = ".$cfg_returnPointState.";\r\n";
	$configFile .= "\$cfg_returnPoint_tuan = ".$cfg_returnPoint_tuan.";\r\n";
	$configFile .= "\$cfg_returnPoint_shop = ".$cfg_returnPoint_shop.";\r\n";
	$configFile .= "\$cfg_returnPoint_info = ".$cfg_returnPoint_info.";\r\n";
	$configFile .= "\$cfg_returnPoint_waimai = ".$cfg_returnPoint_waimai.";\r\n";
	$configFile .= "\$cfg_returnPoint_homemaking = ".$cfg_returnPoint_homemaking.";\r\n";
	$configFile .= "\$cfg_returnPoint_travel = ".$cfg_returnPoint_travel.";\r\n";
	$configFile .= "\$cfg_returnPoint_maidan = ".$cfg_returnPoint_maidan.";\r\n";
	$configFile .= "\$cfg_returnPoint_education = ".$cfg_returnPoint_education.";\r\n";
    $configFile .= "\$cfg_offset_tuan = ".$cfg_offset_tuan.";\r\n";
    $configFile .= "\$cfg_offset_shop = ".$cfg_offset_shop.";\r\n";
    $configFile .= "\$cfg_offset_waimai = ".$cfg_offset_waimai.";\r\n";
    $configFile .= "\$cfg_offset_homemaking = ".$cfg_offset_homemaking.";\r\n";
    $configFile .= "\$cfg_offset_education = ".$cfg_offset_education.";\r\n";
    $configFile .= "\$cfg_offset_travel = ".$cfg_offset_travel.";\r\n";
    $configFile .= "\$cfg_returnInteraction_sfcar = ".$cfg_returnInteraction_sfcar.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_tuan = ".$cfg_ruzhangPointFee_tuan.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_shop = ".$cfg_ruzhangPointFee_shop.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_waimai = ".$cfg_ruzhangPointFee_waimai.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_homemaking = ".$cfg_ruzhangPointFee_homemaking.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_travel = ".$cfg_ruzhangPointFee_travel.";\r\n";
    $configFile .= "\$cfg_ruzhangPointFee_education = ".$cfg_ruzhangPointFee_education.";\r\n";
    $configFile .= "\$cfg_returnInteraction_info = ".$cfg_returnInteraction_info.";\r\n";
    $configFile .= "\$cfg_returnInteraction_house = ".$cfg_returnInteraction_house.";\r\n";
    $configFile .= "\$cfg_returnInteraction_live = ".$cfg_returnInteraction_live.";\r\n";
    $configFile .= "\$cfg_returnInteraction_tieba = ".$cfg_returnInteraction_tieba.";\r\n";
    $configFile .= "\$cfg_returnInteraction_car = ".$cfg_returnInteraction_car.";\r\n";
    $configFile .= "\$cfg_returnInteraction_huodong = ".$cfg_returnInteraction_huodong.";\r\n";
    $configFile .= "\$cfg_returnInteraction_vote = ".$cfg_returnInteraction_vote.";\r\n";
    $configFile .= "\$cfg_returnInteraction_comment = ".$cfg_returnInteraction_comment.";\r\n";
    $configFile .= "\$cfg_returnInteraction_commentDay = ".$cfg_returnInteraction_commentDay.";\r\n";
    $configFile .= "\$cfg_returnInteraction_article = ".$cfg_returnInteraction_article.";\r\n";
    $configFile .= "\$cfg_returnInteraction_circle = ".$cfg_returnInteraction_circle.";\r\n";

    $configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/pointsConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//配置参数
require_once(HUONIAOINC.'/config/pointsConfig.inc.php');

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
	    'ui/jquery.chosen.css',
	    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/chosen.jquery.min.js',
		'admin/member/pointsConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//签到状态
	$huoniaoTag->assign('pointState', array('0', '1'));
	$huoniaoTag->assign('pointStateNames',array('关闭','开启'));
	$huoniaoTag->assign('pointStateChecked', $cfg_pointState);

	$huoniaoTag->assign('pointName', $cfg_pointName);
	$huoniaoTag->assign('pointRatio', $cfg_pointRatio);
	$huoniaoTag->assign('pointFee', $cfg_pointFee);
	$huoniaoTag->assign('pointRegGiving', $cfg_pointRegGiving);
	$huoniaoTag->assign('pointRegGivingRec', (int)$cfg_pointRegGivingRec);
	$huoniaoTag->assign('moneyRegGivingRec', (float)$cfg_moneyRegGivingRec);
	$huoniaoTag->assign('moneyRegGivingWithdraw', (float)$cfg_moneyRegGivingWithdraw);

	//推荐注册送现金权限
	$huoniaoTag->assign('moneyRegGivingStateState', array('0', '1'));
	$huoniaoTag->assign('moneyRegGivingStateNames',array('所有人','分销商'));
	$huoniaoTag->assign('moneyRegGivingState', (int)$cfg_moneyRegGivingState);

	//引导领取方式
	$huoniaoTag->assign('recRegisterGuideState', array('0', '1', '2'));
	$huoniaoTag->assign('recRegisterGuideNames',array('H5','关注公众号','下载APP'));
	$huoniaoTag->assign('recRegisterGuide', (int)$cfg_recRegisterGuide);

	$huoniaoTag->assign('pointPension', (int)$cfg_pointPension);


	//积分返现
	$huoniaoTag->assign('returnPointState', array('0', '1'));
	$huoniaoTag->assign('returnPointStateNames',array('关闭','开启'));
	$huoniaoTag->assign('returnPointStateChecked', (int)$cfg_returnPointState);

	$huoniaoTag->assign('returnPoint_tuan', $cfg_returnPoint_tuan);
	$huoniaoTag->assign('returnPoint_shop', $cfg_returnPoint_shop);
	$huoniaoTag->assign('returnPoint_info', $cfg_returnPoint_info);
	$huoniaoTag->assign('returnPoint_waimai', $cfg_returnPoint_waimai);
	$huoniaoTag->assign('returnPoint_homemaking', $cfg_returnPoint_homemaking);
	$huoniaoTag->assign('returnPoint_travel', $cfg_returnPoint_travel);
	$huoniaoTag->assign('returnPoint_maidan', $cfg_returnPoint_maidan);
	$huoniaoTag->assign('returnPoint_education', $cfg_returnPoint_education);
    //购买抵扣积分
    $huoniaoTag->assign('offset_tuan', $cfg_offset_tuan);
    $huoniaoTag->assign('offset_shop', $cfg_offset_shop);
    $huoniaoTag->assign('offset_waimai', $cfg_offset_waimai);
    $huoniaoTag->assign('offset_homemaking', $cfg_offset_homemaking);
    $huoniaoTag->assign('offset_travel', $cfg_offset_travel);
    $huoniaoTag->assign('offset_education', $cfg_offset_education);

    //入账返积分
    $huoniaoTag->assign('ruzhangPointFee_tuan', $cfg_ruzhangPointFee_tuan);
    $huoniaoTag->assign('ruzhangPointFee_shop', $cfg_ruzhangPointFee_shop);
    $huoniaoTag->assign('ruzhangPointFee_waimai', $cfg_ruzhangPointFee_waimai);
    $huoniaoTag->assign('ruzhangPointFee_homemaking', $cfg_ruzhangPointFee_homemaking);
    $huoniaoTag->assign('ruzhangPointFee_travel', $cfg_ruzhangPointFee_travel);
    $huoniaoTag->assign('ruzhangPointFee_education', $cfg_ruzhangPointFee_education);

    //互动送积分(发布/评论)
    $huoniaoTag->assign('returnInteraction_sfcar', $cfg_returnInteraction_sfcar);
    $huoniaoTag->assign('returnInteraction_info', $cfg_returnInteraction_info);
    $huoniaoTag->assign('returnInteraction_house', $cfg_returnInteraction_house);
    $huoniaoTag->assign('returnInteraction_live', $cfg_returnInteraction_live);
    $huoniaoTag->assign('returnInteraction_tieba', $cfg_returnInteraction_tieba);
    $huoniaoTag->assign('returnInteraction_car', $cfg_returnInteraction_car);
    $huoniaoTag->assign('returnInteraction_huodong', $cfg_returnInteraction_huodong);
    $huoniaoTag->assign('returnInteraction_vote', $cfg_returnInteraction_vote);
    $huoniaoTag->assign('returnInteraction_comment', $cfg_returnInteraction_comment);
    $huoniaoTag->assign('returnInteraction_commentDay', $cfg_returnInteraction_commentDay);
    $huoniaoTag->assign('returnInteraction_article', $cfg_returnInteraction_article);
    $huoniaoTag->assign('returnInteraction_circle', $cfg_returnInteraction_circle);


    $quanList = array();
    $shopquanList = array();

    // 外卖券
    if(in_array('waimai', $installModuleArr)){
        $quanSql  = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
        $quanList = $dsql->dsqlOper($quanSql, "results");
        foreach ($quanList as $key=>$vv){
            $quanList[$key]['quanname']  = 'waimai';
            $quanList[$key]['quannameStr']  = '外卖';
        }
    }
	//商城
    if(in_array('shop', $installModuleArr)){
        $shopquanSql  = $dsql->SetQuery("SELECT * FROM `#@__shop_quan` ORDER BY `id` ASC");
        $shopquanList = $dsql->dsqlOper($shopquanSql, "results");
        foreach ($shopquanList as $key=>$vv){
            $shopquanList[$key]['quanname']  = 'shop';
            $shopquanList[$key]['quannameStr']  = '商城';
        }
    }
    $quanList = array_merge($quanList,$shopquanList);
	$huoniaoTag->assign("quanList", $quanList);

    $cfg_regGivingQuan = explode(',', $cfg_regGivingQuan);
    $reg = array();
	foreach ($cfg_regGivingQuan as $ke=>$v){
        array_push($reg,substr($v,strripos($v,"_")+1));
    }
	$huoniaoTag->assign("regGivingQuan", $reg);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pointsConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
