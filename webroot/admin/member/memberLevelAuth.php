<?php
/**
 * 会员等级特权设置
 *
 * @version        $Id: memberLevelAuth.php 2017-07-24 下午15:56:28 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberLevelAuth");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//表名
$tab = "member_level";

//模板名
$templates = "memberLevelAuth.html";

//js
$jsFile = array(
	'admin/member/memberLevelAuth.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


//保存
if(!empty($_POST)){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);

		$dataArr = $dataArr_ = array();
		for($i = 0; $i < count($json); $i++){

				foreach ($json[$i] as $key => $value) {
					if(!$dataArr[$value['id']]){
						$dataArr[$value['id']] = array();
					}
					if(!$dataArr_[$value['id']]){
						$dataArr_[$value['id']] = array();
					}
					$dataArr[$value['id']][$value['module']] = $value['id'] && $value['module'] != 'livetime' ? $value['amount'] : sprintf("%.2f", $value['amount']);
					$dataArr_[$value['id']][$value['module']] = (int)$value['count'];

				}

		}
		if($dataArr){

			$configFile = "<"."?php\r\n";
			$configFile .= "\$cfg_fabuAmount = '".serialize($dataArr[0])."';\r\n";
			$configFile .= "\$cfg_fabuFreeCount = '".serialize($dataArr_[0])."';\r\n";
			$configFile .= "\$cfg_rewardFee = ".(float)$cfg_rewardFee.";\r\n";
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

			$configFile .= "\$cfg_minWithdraw = '".$cfg_minWithdraw."';\r\n";
			$configFile .= "\$cfg_maxWithdraw = '".$cfg_maxWithdraw."';\r\n";
			$configFile .= "\$cfg_withdrawFee = '".$cfg_withdrawFee."';\r\n";
			$configFile .= "\$cfg_maxCountWithdraw = '".$cfg_maxCountWithdraw."';\r\n";
			$configFile .= "\$cfg_maxAmountWithdraw = '".$cfg_maxAmountWithdraw."';\r\n";
			$configFile .= "\$cfg_withdrawCycle = '".$cfg_withdrawCycle."';\r\n";
			$configFile .= "\$cfg_withdrawCycleWeek = '".$cfg_withdrawCycleWeek."';\r\n";
			$configFile .= "\$cfg_withdrawCycleDay = '".$cfg_withdrawCycleDay."';\r\n";
            $configFile .= "\$cfg_courierWithdrawCycle = '" . $cfg_courierWithdrawCycle . "';\r\n";
            $configFile .= "\$cfg_courierWithdrawCycleWeek = '" . $cfg_courierWithdrawCycleWeek . "';\r\n";
            $configFile .= "\$cfg_courierWithdrawCycleDay = '" . $cfg_courierWithdrawCycleDay . "';\r\n";
			$configFile .= "\$cfg_withdrawPlatform = '".$cfg_withdrawPlatform."';\r\n";
			$configFile .= "\$cfg_withdrawCheckType = '".$cfg_withdrawCheckType."';\r\n";
			$configFile .= "\$cfg_fzwithdrawCheckType = 1".";\r\n";
			$configFile .= "\$cfg_withdrawNote = '".$cfg_withdrawNote."';\r\n";
			$configFile .= "\$cfg_courierwithdrawNote = '".$cfg_courierwithdrawNote."';\r\n";
            $configFile .= "\$cfg_chongzhiCheckType = '" . $cfg_chongzhiCheckType . "';\r\n";
            $configFile .= "\$cfg_chongzhiyhFee = '" . $cfg_chongzhiyhFee . "';\r\n";
            $configFile .= "\$cfg_chongzhilimit = '" . $cfg_chongzhilimit . "';\r\n";
            $configFile .= "\$cfg_chongzhiSongJiFen = " . (int)$cfg_chongzhiSongJiFen . ";\r\n";
            $configFile .= "\$cfg_chongzhijfFee = " . (int)$cfg_chongzhijfFee . ";\r\n";
            $configFile .= "\$cfg_chongzhiJfLimit = " . (int)$cfg_chongzhiJfLimit . ";\r\n";
            $configFile .= "\$cfg_withdrawJfFee 	= " . (int)$cfg_withdrawJfFee . ";\r\n";

            $configFile .= "\$cfg_businessAutoWithdrawState 	= " . (int)$cfg_businessAutoWithdrawState . ";\r\n";
            $configFile .= "\$cfg_businessAutoWithdrawCycle 	= " . (int)$cfg_businessAutoWithdrawCycle . ";\r\n";
            $configFile .= "\$cfg_businessAutoWithdrawCycleWeek 	= " . (int)$cfg_businessAutoWithdrawCycleWeek . ";\r\n";
            $configFile .= "\$cfg_businessAutoWithdrawCycleDay 	= " . (int)$cfg_businessAutoWithdrawCycleDay . ";\r\n";
            $configFile .= "\$cfg_businessAutoWithdrawAmount 	= " . (float)$cfg_businessAutoWithdrawAmount . ";\r\n";
			$configFile .= "?".">";

			$configIncFile = HUONIAOINC.'/config/settlement.inc.php';
			$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
			fwrite($fp, $configFile);
			fclose($fp);


			foreach ($dataArr as $key => $value) {
				$privilege = serialize($value);
				$sql = $dsql->SetQuery("UPDATE `#@__member_level` SET `privilege` = '$privilege' WHERE `id` = $key");
				$dsql->dsqlOper($sql, "update");
			}
			echo '{"state": 100, "info": "保存成功！"}';
		}else{
			echo '{"state": 200, "info": "表单为空，保存失败！"}';
		}
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

		$sql = $dsql->SetQuery("SELECT `id`, `name`, `privilege` FROM `#@__".$tab."` ORDER BY `id` ASC");
		$results = $dsql->dsqlOper($sql, "results");
		$levelList = array();
		if($results){
			foreach ($results as $key => $value) {
				$privilegeArr = empty($value['privilege']) ? array() : unserialize($value['privilege']);
				$levelList[$key]['id']   = $value['id'];
				$levelList[$key]['name'] = $value['name'];
				$levelList[$key]['privilege'] = $privilegeArr;
			}
		}
		$huoniaoTag->assign('levelList', $levelList);

		//配置参数
		require_once(HUONIAOINC.'/config/settlement.inc.php');
		$fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
		$huoniaoTag->assign('fabuAmount', $fabuAmount);
		$fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();
		$huoniaoTag->assign('fabuFreeCount', $fabuFreeCount);

		$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			foreach ($result as $key => $value) {
				if(!empty($value['name'])){
					$moduleArr[] = array(
						"name" => $value['name'],
						"title" => $value['subject'] ? $value['subject'] : $value['subject']
					);
				}
			}
		}
		$huoniaoTag->assign('moduleArr', $moduleArr);

		// 平台券
		$quanSql  = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
		$quanList = $dsql->dsqlOper($quanSql, "results");
		$huoniaoTag->assign("quanList", $quanList);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
