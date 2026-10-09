<?php
/**
 * 结算设置
 *
 * @version        $Id: settlement.php 2015-8-4 下午15:09:11 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("settlement");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "settlement.html";
$dir                      = "../../templates/member"; //当前目录

$configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
$Payconfig= $dsql->dsqlOper($configPay, "results");
$payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
$huoniaoTag->assign('payname', $payname);

if (!empty($_POST)) {
    if ($token == "") die('token传递失败！');

    if(!$type){
        $cfg_rewardFee     = (float)$rewardFee;
        $cfg_businessMaidanFee = (float)$businessMaidanFee;
        $cfg_businessBonusMaidanFee = (float)$businessBonusMaidanFee;
        $cfg_tuanFee       = (float)$tuanFee;
        $cfg_travelFee     = (float)$travelFee;
        $cfg_shopFee       = (float)$shopFee;
        $cfg_huodongFee    = (float)$huodongFee;
        $cfg_liveFee       = (float)$liveFee;
        $cfg_videoFee      = (float)$videoFee;
        $cfg_awardlegouFee = (float)$awardlegouFee;
        $cfg_paimaiFee = (float)$paimaiFee;
        $cfg_homemakingFee = (float)$homemakingFee;
        $cfg_educationFee  = (float)$educationFee;

        /*充值优惠*/
        $cfg_chongzhiCheckType = (float)$chongzhiCheckType;
        $cfg_chongzhiSongJiFen = (float)$chongzhiSongJiFen;
        $cfg_chongzhiyhFee     = (float)$chongzhiyhFee;
        $cfg_chongzhijfFee     = (float)$chongzhijfFee;
        $cfg_chongzhilimit     = (float)$chongzhilimit;
        $cfg_chongzhiJfLimit   = (float)$chongzhiJfLimit;
        $cfg_withdrawJfFee     = (int)$withdrawJfFee;

        $cfg_fzrewardFee       = (float)$fzrewardFee;
        $cfg_fztuanFee         = (float)$fztuanFee;
        $cfg_fzbusinessMaidanFee = (float)$fzbusinessMaidanFee;
        $cfg_fztravelFee       = (float)$fztravelFee;
        $cfg_fzshopFee         = (float)$fzshopFee;
        $cfg_fzwaimaiFee       = (float)$fzwaimaiFee;
        $cfg_fzwaimaiPaotuiFee = (float)$fzwaimaiPaotuiFee;
        $cfg_fzhuodongFee      = (float)$fzhuodongFee;
        $cfg_fzliveFee         = (float)$fzliveFee;
        $cfg_fzvideoFee        = (float)$fzvideoFee;
        $cfg_fzawardlegouFee   = (float)$fzawardlegouFee;
        $cfg_fzpaimaiFee   = (float)$fzpaimaiFee;
        $cfg_fzjobFee   = (float)$fzjobFee;
        $cfg_fzhomemakingFee   = (float)$fzhomemakingFee;
        $cfg_fzeducationFee    = (float)$fzeducationFee;
        $cfg_roofFee           = (float)$roofFee;
        $cfg_setmealFee        = (float)$setmealFee;
        $cfg_fabulFee          = (float)$fabulFee;
        $cfg_levelFee          = (float)$levelFee;
        $cfg_storeFee          = (float)$storeFee;
        $cfg_fenxiaoFee        = (float)$fenxiaoFee;
        $cfg_jiliFee           = (float)$jiliFee;
        $cfg_payPhoneFee       = (float)$payPhoneFee;
        $cfg_withdrawWxVersion       = (int)$withdrawWxVersion;
        $cfg_withdrawPlatform  = $withdrawPlatform ? serialize($withdrawPlatform) : array();

        $cfg_businessAutoWithdrawState = (int)$businessAutoWithdrawState;
        $cfg_businessAutoWithdrawCycle = (int)$businessAutoWithdrawCycle;
        $cfg_businessAutoWithdrawCycleWeek = (int)$businessAutoWithdrawCycleWeek;
        $cfg_businessAutoWithdrawCycleDay = (int)$businessAutoWithdrawCycleDay;
        $cfg_businessAutoWithdrawAmount = (float)$businessAutoWithdrawAmount;

        $cfg_minWithdraw = (float)$minWithdraw;
        $cfg_maxWithdraw = (float)$maxWithdraw;
        $cfg_withdrawFee = (float)$withdrawFee;
        $cfg_maxCountWithdraw = (float)$maxCountWithdraw;
        $cfg_maxAmountWithdraw = (float)$maxAmountWithdraw;
        $cfg_withdrawCycle = (float)$withdrawCycle;
        $cfg_withdrawCycleWeek = (float)$withdrawCycleWeek;
        $cfg_withdrawCycleDay = (float)$withdrawCycleDay;
        $cfg_courierWithdrawCycle = (float)$courierWithdrawCycle;
        $cfg_courierWithdrawCycleWeek = (float)$courierWithdrawCycleWeek;
        $cfg_courierWithdrawCycleDay = (float)$courierWithdrawCycleDay;
        $cfg_withdrawCheckType = (float)$withdrawCheckType;
        $cfg_withdrawNote = $withdrawNote;
        $cfg_courierwithdrawNote = $courierwithdrawNote;
    }

    //商城独立快速配置
    elseif($type == 'shop'){

        $cfg_shopFee = (float)$shopFee;
        $cfg_fzshopFee = (float)$fzshopFee;
        $cfg_levelFee = (float)$levelFee;
        $cfg_storeFee = (float)$storeFee;
        $cfg_fenxiaoFee = (float)$fenxiaoFee;

    }


    adminLog("修改结算设置");

    $configFile = "<" . "?php\r\n";
    $configFile .= "\$cfg_fabuAmount = '" . $cfg_fabuAmount . "';\r\n";
    $configFile .= "\$cfg_fabuFreeCount = '" . $cfg_fabuFreeCount . "';\r\n";
    $configFile .= "\$cfg_rewardFee = " . (float)$cfg_rewardFee . ";\r\n";
    $configFile .= "\$cfg_tuanFee = " . (float)$cfg_tuanFee . ";\r\n";
    $configFile .= "\$cfg_businessMaidanFee = " . (float)$cfg_businessMaidanFee . ";\r\n";
    $configFile .= "\$cfg_businessBonusMaidanFee = " . (float)$cfg_businessBonusMaidanFee . ";\r\n";
    $configFile .= "\$cfg_travelFee = " . (float)$cfg_travelFee . ";\r\n";
    $configFile .= "\$cfg_shopFee = " . (float)$cfg_shopFee . ";\r\n";
    $configFile .= "\$cfg_huodongFee = " . (float)$cfg_huodongFee . ";\r\n";
    $configFile .= "\$cfg_liveFee = " . (float)$cfg_liveFee . ";\r\n";
    $configFile .= "\$cfg_videoFee = " . (float)$cfg_videoFee . ";\r\n";
    $configFile .= "\$cfg_awardlegouFee = " . (float)$cfg_awardlegouFee . ";\r\n";
    $configFile .= "\$cfg_paimaiFee = " . (float)$cfg_paimaiFee . ";\r\n";
    $configFile .= "\$cfg_homemakingFee = " . (float)$cfg_homemakingFee . ";\r\n";
    $configFile .= "\$cfg_educationFee = " . (float)$cfg_educationFee . ";\r\n";

    $configFile .= "\$cfg_fzrewardFee 	= " . (float)$cfg_fzrewardFee . ";\r\n";
    $configFile .= "\$cfg_fztuanFee 	= " . (float)$cfg_fztuanFee . ";\r\n";
    $configFile .= "\$cfg_fzbusinessMaidanFee 	= " . (float)$cfg_fzbusinessMaidanFee . ";\r\n";
    $configFile .= "\$cfg_fztravelFee 	= " . (float)$cfg_fztravelFee . ";\r\n";
    $configFile .= "\$cfg_fzshopFee 	= " . (float)$cfg_fzshopFee . ";\r\n";
    $configFile .= "\$cfg_fzwaimaiFee 	= " . (float)$cfg_fzwaimaiFee . ";\r\n";
    $configFile .= "\$cfg_fzwaimaiPaotuiFee 	= " . (float)$cfg_fzwaimaiPaotuiFee . ";\r\n";
    $configFile .= "\$cfg_fzhuodongFee 	= " . (float)$cfg_fzhuodongFee . ";\r\n";
    $configFile .= "\$cfg_fzliveFee 	= " . (float)$cfg_fzliveFee . ";\r\n";
    $configFile .= "\$cfg_fzvideoFee 	= " . (float)$cfg_fzvideoFee . ";\r\n";
    $configFile .= "\$cfg_fzawardlegouFee 	= " . (float)$cfg_fzawardlegouFee . ";\r\n";
    $configFile .= "\$cfg_fzpaimaiFee 	= " . (float)$cfg_fzpaimaiFee . ";\r\n";
    $configFile .= "\$cfg_fzjobFee 	= " . (float)$cfg_fzjobFee . ";\r\n";
    $configFile .= "\$cfg_fzhomemakingFee = " . (float)$cfg_fzhomemakingFee . ";\r\n";
    $configFile .= "\$cfg_fzeducationFee= " . (float)$cfg_fzeducationFee . ";\r\n";
    $configFile .= "\$cfg_roofFee 		= " . (float)$cfg_roofFee . ";\r\n";
    $configFile .= "\$cfg_setmealFee 	= " . (float)$cfg_setmealFee . ";\r\n";
    $configFile .= "\$cfg_withdrawWxVersion 	= " . (float)$cfg_withdrawWxVersion . ";\r\n";

    $configFile .= "\$cfg_fabulFee 		= " . (float)$cfg_fabulFee . ";\r\n";
    $configFile .= "\$cfg_levelFee 		= " . (float)$cfg_levelFee . ";\r\n";
    $configFile .= "\$cfg_storeFee 		= " . (float)$cfg_storeFee . ";\r\n";
    $configFile .= "\$cfg_fenxiaoFee 	= " . (float)$cfg_fenxiaoFee . ";\r\n";
    $configFile .= "\$cfg_jiliFee 	    = " . (float)$cfg_jiliFee . ";\r\n";
    $configFile .= "\$cfg_payPhoneFee 	    = " . (float)$cfg_payPhoneFee . ";\r\n";

    $configFile .= "\$cfg_minWithdraw 	= '" . (float)$cfg_minWithdraw . "';\r\n";
    $configFile .= "\$cfg_maxWithdraw 	= '" . (float)$cfg_maxWithdraw . "';\r\n";
    $configFile .= "\$cfg_withdrawFee 	= '" . (float)$cfg_withdrawFee . "';\r\n";
    $configFile .= "\$cfg_maxCountWithdraw = '" . (float)$cfg_maxCountWithdraw . "';\r\n";
    $configFile .= "\$cfg_maxAmountWithdraw = '" . (float)$cfg_maxAmountWithdraw . "';\r\n";
    $configFile .= "\$cfg_withdrawCycle = '" . (float)$cfg_withdrawCycle . "';\r\n";
    $configFile .= "\$cfg_withdrawCycleWeek = '" . (float)$cfg_withdrawCycleWeek . "';\r\n";
    $configFile .= "\$cfg_withdrawCycleDay = '" . (float)$cfg_withdrawCycleDay . "';\r\n";
    $configFile .= "\$cfg_courierWithdrawCycle = '" . (float)$cfg_courierWithdrawCycle . "';\r\n";
    $configFile .= "\$cfg_courierWithdrawCycleWeek = '" . (float)$cfg_courierWithdrawCycleWeek . "';\r\n";
    $configFile .= "\$cfg_courierWithdrawCycleDay = '" . (float)$cfg_courierWithdrawCycleDay . "';\r\n";
    $configFile .= "\$cfg_withdrawPlatform = '" . $cfg_withdrawPlatform . "';\r\n";
    $configFile .= "\$cfg_withdrawCheckType = '" . (float)$cfg_withdrawCheckType . "';\r\n";
    $configFile .= "\$cfg_fzwithdrawCheckType = 1" . ";\r\n";
    $configFile .= "\$cfg_withdrawNote = '" . $cfg_withdrawNote . "';\r\n";
    $configFile .= "\$cfg_courierwithdrawNote = '" . $cfg_courierwithdrawNote . "';\r\n";
    $configFile .= "\$cfg_chongzhiCheckType = '" . (float)$cfg_chongzhiCheckType . "';\r\n";
    $configFile .= "\$cfg_chongzhiyhFee = " . (int)$cfg_chongzhiyhFee . ";\r\n";
    $configFile .= "\$cfg_chongzhilimit = " . (int)$cfg_chongzhilimit . ";\r\n";
    $configFile .= "\$cfg_chongzhiSongJiFen = " . (int)$cfg_chongzhiSongJiFen . ";\r\n";
    $configFile .= "\$cfg_chongzhijfFee = " . (int)$cfg_chongzhijfFee . ";\r\n";
    $configFile .= "\$cfg_chongzhiJfLimit = " . (int)$cfg_chongzhiJfLimit . ";\r\n";
    $configFile .= "\$cfg_withdrawJfFee 	= " . (int)$cfg_withdrawJfFee . ";\r\n";

    $configFile .= "\$cfg_businessAutoWithdrawState 	= " . (int)$cfg_businessAutoWithdrawState . ";\r\n";
    $configFile .= "\$cfg_businessAutoWithdrawCycle 	= " . (int)$cfg_businessAutoWithdrawCycle . ";\r\n";
    $configFile .= "\$cfg_businessAutoWithdrawCycleWeek 	= " . (int)$cfg_businessAutoWithdrawCycleWeek . ";\r\n";
    $configFile .= "\$cfg_businessAutoWithdrawCycleDay 	= " . (int)$cfg_businessAutoWithdrawCycleDay . ";\r\n";
    $configFile .= "\$cfg_businessAutoWithdrawAmount 	= " . (float)$cfg_businessAutoWithdrawAmount . ";\r\n";

    $configFile .= "?" . ">";

    $configIncFile = HUONIAOINC . '/config/settlement.inc.php';
    $fp = fopen($configIncFile, "w") or die('{"state": 200, "info": ' . json_encode("写入文件 $configIncFile 失败，请检查权限！") . '}');
    fwrite($fp, $configFile);
    fclose($fp);

    die('{"state": 100, "info": ' . json_encode("配置成功！") . '}');
    exit;

}

//配置参数
require_once(HUONIAOINC . '/config/settlement.inc.php');

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'admin/member/settlement.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('rewardFee', (float)$cfg_rewardFee);
    $huoniaoTag->assign('tuanFee', (float)$cfg_tuanFee);
    $huoniaoTag->assign('businessMaidanFee', (float)$cfg_businessMaidanFee);
    $huoniaoTag->assign('businessBonusMaidanFee', (float)$cfg_businessBonusMaidanFee);
    $huoniaoTag->assign('travelFee', (float)$cfg_travelFee);
    $huoniaoTag->assign('shopFee', (float)$cfg_shopFee);
    $huoniaoTag->assign('huodongFee', (float)$cfg_huodongFee);
    $huoniaoTag->assign('liveFee', (float)$cfg_liveFee);
    $huoniaoTag->assign('videoFee', (float)$cfg_videoFee);
    $huoniaoTag->assign('homemakingFee', (float)$cfg_homemakingFee);
    $huoniaoTag->assign('educationFee', (float)$cfg_educationFee);

    //分站
    $huoniaoTag->assign('fzrewardFee', (float)$cfg_fzrewardFee);
    $huoniaoTag->assign('fztuanFee', (float)$cfg_fztuanFee);
    $huoniaoTag->assign('fzbusinessMaidanFee', (float)$cfg_fzbusinessMaidanFee);
    $huoniaoTag->assign('fztravelFee', (float)$cfg_fztravelFee);
    $huoniaoTag->assign('fzshopFee', (float)$cfg_fzshopFee);
    $huoniaoTag->assign('fzwaimaiFee', (float)$cfg_fzwaimaiFee);
    $huoniaoTag->assign('fzwaimaiPaotuiFee', (float)$cfg_fzwaimaiPaotuiFee);
    $huoniaoTag->assign('fzhuodongFee', (float)$cfg_fzhuodongFee);
    $huoniaoTag->assign('fzliveFee', (float)$cfg_fzliveFee);
    $huoniaoTag->assign('fzvideoFee', (float)$cfg_fzvideoFee);
    $huoniaoTag->assign('fzhomemakingFee', (float)$cfg_fzhomemakingFee);
    $huoniaoTag->assign('fzeducationFee', (float)$cfg_fzeducationFee);
    $huoniaoTag->assign('roofFee', (float)$cfg_roofFee);
    $huoniaoTag->assign('setmealFee', (float)$cfg_setmealFee);

    $huoniaoTag->assign('fabulFee', (float)$cfg_fabulFee);
    $huoniaoTag->assign('levelFee', (float)$cfg_levelFee);
    $huoniaoTag->assign('storeFee', (float)$cfg_storeFee);
    $huoniaoTag->assign('fenxiaoFee', (float)$cfg_fenxiaoFee);
    $huoniaoTag->assign('jiliFee', (float)$cfg_jiliFee);
    $huoniaoTag->assign('payPhoneFee', (float)$cfg_payPhoneFee);
    $huoniaoTag->assign('awardlegouFee', (float)$cfg_awardlegouFee);
    $huoniaoTag->assign('paimaiFee', (float)$cfg_paimaiFee);
    $huoniaoTag->assign('fzawardlegouFee', (float)$cfg_fzawardlegouFee);
    $huoniaoTag->assign('fzpaimaiFee', (float)$cfg_fzpaimaiFee);
    $huoniaoTag->assign('fzjobFee', (float)$cfg_fzjobFee);

    $huoniaoTag->assign('chongzhiCheckType', (float)$cfg_chongzhiCheckType);
    $huoniaoTag->assign('chongzhiSongJiFen', (float)$cfg_chongzhiSongJiFen);
    $huoniaoTag->assign('chongzhiyhFee', (float)$cfg_chongzhiyhFee);
    $huoniaoTag->assign('chongzhijfFee', (float)$cfg_chongzhijfFee);
    $huoniaoTag->assign('chongzhilimit', (float)$cfg_chongzhilimit);
    $huoniaoTag->assign('chongzhiJfLimit', (float)$cfg_chongzhiJfLimit);
    $huoniaoTag->assign('withdrawWxVersion', $cfg_withdrawWxVersion ? (int)$cfg_withdrawWxVersion: 2); //默认为v2


    $huoniaoTag->assign('minWithdraw', $cfg_minWithdraw ? $cfg_minWithdraw : 1);
    $huoniaoTag->assign('maxWithdraw', (float)$cfg_maxWithdraw);
    $huoniaoTag->assign('withdrawFee', (float)$cfg_withdrawFee);
    $huoniaoTag->assign('withdrawJfFee', (float)$cfg_withdrawJfFee);
    $huoniaoTag->assign('maxCountWithdraw', (float)$cfg_maxCountWithdraw);
    $huoniaoTag->assign('maxAmountWithdraw', (float)$cfg_maxAmountWithdraw);
    $huoniaoTag->assign('withdrawCycle', (float)$cfg_withdrawCycle);
    $huoniaoTag->assign('withdrawCycleWeek', (float)$cfg_withdrawCycleWeek);
    $huoniaoTag->assign('withdrawCycleDay', $cfg_withdrawCycleDay ? $cfg_withdrawCycleDay : 28);
//提现周期
    $huoniaoTag->assign('courierWithdrawCycle', (float)$cfg_courierWithdrawCycle);
    $huoniaoTag->assign('courierWithdrawCycleWeek', (float)$cfg_courierWithdrawCycleWeek);
    $huoniaoTag->assign('courierWithdrawCycleDay', $cfg_courierWithdrawCycleDay ? $cfg_courierWithdrawCycleDay : 28);

    $huoniaoTag->assign('withdrawPlatform', $cfg_withdrawPlatform ? unserialize($cfg_withdrawPlatform) : array('weixin', 'alipay', 'bank'));
    $huoniaoTag->assign('withdrawCheckType', (float)$cfg_withdrawCheckType);
    $huoniaoTag->assign('withdrawNote', $cfg_withdrawNote);
    $huoniaoTag->assign('courierwithdrawNote', $cfg_courierwithdrawNote);
    $huoniaoTag->assign('pointName', $cfg_pointName);

    $huoniaoTag->assign('businessAutoWithdrawState', (int)$cfg_businessAutoWithdrawState);
    $huoniaoTag->assign('businessAutoWithdrawCycle', (int)$cfg_businessAutoWithdrawCycle);
    $huoniaoTag->assign('businessAutoWithdrawCycleWeek', (int)$cfg_businessAutoWithdrawCycleWeek);
    $huoniaoTag->assign('businessAutoWithdrawCycleDay', (int)$cfg_businessAutoWithdrawCycleDay);
    $huoniaoTag->assign('businessAutoWithdrawAmount', (float)$cfg_businessAutoWithdrawAmount);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/settlement";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
