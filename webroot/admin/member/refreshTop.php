<?php
/**
 * 刷新置顶配置
 *
 * @version        $Id: refreshTop.php 2015-8-4 下午15:09:11 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("refreshTop");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "refreshTop.html";
$dir       = "../../templates/member"; //当前目录

if(!empty($_POST)){
	if($token == "") die('token传递失败！');
    $customfenXiao          = $fenXiao;
	//二手
	if(in_array('info', $installModuleArr)){
		$cfg_info_refreshFreeTimes = (int)$info_refreshFreeTimes;
		$cfg_info_refreshNormalPrice = (float)$info_refreshNormalPrice;

		$cfg_info_titleBlodlDay   = (int)$info_titleBlodlDay;
		$cfg_info_titleBlodlPrice = (float)$info_titleBlodlPrice;

		$cfg_info_titleRedDay   = (int)$info_titleRedDay;
		$cfg_info_titleRedPrice = (float)$info_titleRedPrice;

		$info_refreshArr = array();
		if($info_refresh){
			for ($i = 0; $i < count($info_refresh['times']); $i++) {
				array_push($info_refreshArr, array(
					'times' => (int)$info_refresh['times'][$i],
					'day' => (int)$info_refresh['day'][$i],
					'price' => (float)$info_refresh['price'][$i]
				));
			}
		}
		$cfg_info_refreshSmart = serialize($info_refreshArr);

		$info_topNormalArr = array();
		if($info_topNormal && $info_topNormal['day']){
			for ($i = 0; $i < count($info_topNormal['day']); $i++) {
				array_push($info_topNormalArr, array(
					'day' => (int)$info_topNormal['day'][$i],
					'price' => (float)$info_topNormal['price'][$i]
				));
			}
		}
		$cfg_info_topNormal = serialize($info_topNormalArr);

		$info_topPlanArr = array();
		if($info_topPlan){
			for ($i = 0; $i < count($info_topPlan['all']); $i++) {
				array_push($info_topPlanArr, array(
					'all' => (float)$info_topPlan['all'][$i],
					'day' => (float)$info_topPlan['day'][$i]
				));
			}
		}
		$cfg_info_topPlan = serialize($info_topPlanArr);
	}

	//房产
	if(in_array('house', $installModuleArr)){
		$cfg_house_refreshFreeTimes = (int)$house_refreshFreeTimes;
		$cfg_house_refreshNormalPrice = (float)$house_refreshNormalPrice;

		$house_refreshArr = array();
		if($house_refresh){
			for ($i = 0; $i < count($house_refresh['times']); $i++) {
				array_push($house_refreshArr, array(
					'times' => (int)$house_refresh['times'][$i],
					'day' => (int)$house_refresh['day'][$i],
					'price' => (float)$house_refresh['price'][$i]
				));
			}
		}
		$cfg_house_refreshSmart = serialize($house_refreshArr);

		$house_topNormalArr = array();
		if($house_topNormal && $house_topNormal['day']){
			for ($i = 0; $i < count($house_topNormal['day']); $i++) {
				array_push($house_topNormalArr, array(
					'day' => (int)$house_topNormal['day'][$i],
					'price' => (float)$house_topNormal['price'][$i]
				));
			}
		}
		$cfg_house_topNormal = serialize($house_topNormalArr);

		$house_topPlanArr = array();
		if($house_topPlan){
			for ($i = 0; $i < count($house_topPlan['all']); $i++) {
				array_push($house_topPlanArr, array(
					'all' => (float)$house_topPlan['all'][$i],
					'day' => (float)$house_topPlan['day'][$i]
				));
			}
		}
		$cfg_house_topPlan = serialize($house_topPlanArr);
	}

	//招聘
	if(in_array('job', $installModuleArr)){
		$cfg_job_refreshFreeTimes = (int)$job_refreshFreeTimes;
		$cfg_job_refreshNormalPrice = (float)$job_refreshNormalPrice;

		$job_refreshArr = array();
		if($job_refresh){
			for ($i = 0; $i < count($job_refresh['times']); $i++) {
				array_push($job_refreshArr, array(
					'times' => (int)$job_refresh['times'][$i],
					'day' => (int)$job_refresh['day'][$i],
					'price' => (float)$job_refresh['price'][$i],
                    'rec' => (int)$_POST["job_refresh_rec_$i"]
				));
			}
		}
		$cfg_job_refreshSmart = serialize($job_refreshArr);

		$job_topNormalArr = array();
		if($job_topNormal && $job_topNormal['day']){
			for ($i = 0; $i < count($job_topNormal['day']); $i++) {
				array_push($job_topNormalArr, array(
					'day' => (int)$job_topNormal['day'][$i],
					'price' => (float)$job_topNormal['price'][$i],
                    'rec'=>(int)$_POST["job_topNormal_rec_$i"]
				));
			}
		}
		$cfg_job_topNormal = serialize($job_topNormalArr);

		$job_topPlanArr = array();
		if($job_topPlan){
			for ($i = 0; $i < count($job_topPlan['all']); $i++) {
				array_push($job_topPlanArr, array(
					'all' => (float)$job_topPlan['all'][$i],
					'day' => (float)$job_topPlan['day'][$i]
				));
			}
		}
		$cfg_job_topPlan = serialize($job_topPlanArr);

		//投递置顶
        $job_deliveryArr = array();
        if($job_delivery){
            for ($i = 0; $i < count($job_delivery['title']); $i++) {
                array_push($job_deliveryArr, array(
                    'title' => $job_delivery['title'][$i],
                    'count' => (float)$job_delivery['count'][$i],
                    'price' => (float)$job_delivery['price'][$i],
                    'offer' => (float)$job_delivery['offer'][$i],
                    'rec'=> (int)$_POST["job_delivery_rec_$i"]
                ));
            }
        }
        $cfg_job_deliveryTop = serialize($job_deliveryArr);
	}

	//汽车
	if(in_array('car', $installModuleArr)){
		$cfg_car_refreshFreeTimes = (int)$car_refreshFreeTimes;
		$cfg_car_refreshNormalPrice = (float)$car_refreshNormalPrice;

		$car_refreshArr = array();
		if($car_refresh){
			for ($i = 0; $i < count($car_refresh['times']); $i++) {
				array_push($car_refreshArr, array(
					'times' => (int)$car_refresh['times'][$i],
					'day' => (int)$car_refresh['day'][$i],
					'price' => (float)$car_refresh['price'][$i]
				));
			}
		}
		$cfg_car_refreshSmart = serialize($car_refreshArr);

		$car_topNormalArr = array();
		if($car_topNormal && $car_topNormal['day']){
			for ($i = 0; $i < count($car_topNormal['day']); $i++) {
				array_push($car_topNormalArr, array(
					'day' => (int)$car_topNormal['day'][$i],
					'price' => (float)$car_topNormal['price'][$i]
				));
			}
		}
		$cfg_car_topNormal = serialize($car_topNormalArr);

		$car_topPlanArr = array();
		if($car_topPlan){
			for ($i = 0; $i < count($car_topPlan['all']); $i++) {
				array_push($car_topPlanArr, array(
					'all' => (float)$car_topPlan['all'][$i],
					'day' => (float)$car_topPlan['day'][$i]
				));
			}
		}
		$cfg_car_topPlan = serialize($car_topPlanArr);
	}

	//教育
	if(in_array('education', $installModuleArr)){
		$cfg_education_refreshFreeTimes = (int)$education_refreshFreeTimes;
		$cfg_education_refreshNormalPrice = (float)$education_refreshNormalPrice;

		$education_refreshArr = array();
		if($education_refresh){
			for ($i = 0; $i < count($education_refresh['times']); $i++) {
				array_push($education_refreshArr, array(
					'times' => (int)$education_refresh['times'][$i],
					'day' => (int)$education_refresh['day'][$i],
					'price' => (float)$education_refresh['price'][$i]
				));
			}
		}
		$cfg_education_refreshSmart = serialize($education_refreshArr);

		$education_topNormalArr = array();
		if($education_topNormal && $education_topNormal['day']){
			for ($i = 0; $i < count($education_topNormal['day']); $i++) {
				array_push($education_topNormalArr, array(
					'day' => (int)$education_topNormal['day'][$i],
					'price' => (float)$education_topNormal['price'][$i]
				));
			}
		}
		$cfg_education_topNormal = serialize($education_topNormalArr);

		$education_topPlanArr = array();
		if($education_topPlan){
			for ($i = 0; $i < count($education_topPlan['all']); $i++) {
				array_push($education_topPlanArr, array(
					'all' => (float)$education_topPlan['all'][$i],
					'day' => (float)$education_topPlan['day'][$i]
				));
			}
		}
		$cfg_education_topPlan = serialize($education_topPlanArr);
	}

	//顺风车
	if(in_array('sfcar', $installModuleArr)){
		$cfg_sfcar_refreshFreeTimes = (int)$sfcar_refreshFreeTimes;
		$cfg_sfcar_refreshNormalPrice = (float)$sfcar_refreshNormalPrice;

		$cfg_sfcar_titleBlodlDay   = (int)$sfcar_titleBlodlDay;
		$cfg_sfcar_titleBlodlPrice = (float)$sfcar_titleBlodlPrice;

		$cfg_sfcar_titleRedDay   = (int)$sfcar_titleRedDay;
		$cfg_sfcar_titleRedPrice = (float)$sfcar_titleRedPrice;


		$sfcar_refreshArr = array();
		if($sfcar_refresh){
			for ($i = 0; $i < count($sfcar_refresh['times']); $i++) {
				array_push($sfcar_refreshArr, array(
					'times' => (int)$sfcar_refresh['times'][$i],
					'day' => (int)$sfcar_refresh['day'][$i],
					'price' => (float)$sfcar_refresh['price'][$i]
				));
			}
		}
		$cfg_sfcar_refreshSmart = serialize($sfcar_refreshArr);

		$sfcar_topNormalArr = array();
		if($sfcar_topNormal && $sfcar_topNormal['day']){
			for ($i = 0; $i < count($sfcar_topNormal['day']); $i++) {
				array_push($sfcar_topNormalArr, array(
					'day' => (int)$sfcar_topNormal['day'][$i],
					'price' => (float)$sfcar_topNormal['price'][$i]
				));
			}
		}
		$cfg_sfcar_topNormal = serialize($sfcar_topNormalArr);

		$sfcar_topPlanArr = array();
		if($sfcar_topPlan){
			for ($i = 0; $i < count($sfcar_topPlan['all']); $i++) {
				array_push($sfcar_topPlanArr, array(
					'all' => (float)$sfcar_topPlan['all'][$i],
					'day' => (float)$sfcar_topPlan['day'][$i]
				));
			}
		}
		$cfg_sfcar_topPlan = serialize($sfcar_topPlanArr);
	}


	adminLog("修改刷新置顶配置");


	$configFile = "<"."?php\r\n";
    $configFile .= "\$customfenXiao = ".(int)$customfenXiao.";\r\n";
	//二手
	if(in_array('info', $installModuleArr)){
		$configFile .= "\$cfg_info_refreshFreeTimes = ".(int)$cfg_info_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_info_refreshNormalPrice = ".(float)$cfg_info_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_info_titleBlodlDay = ".(int)$cfg_info_titleBlodlDay.";\r\n";
		$configFile .= "\$cfg_info_titleBlodlPrice = ".(float)$cfg_info_titleBlodlPrice.";\r\n";
		$configFile .= "\$cfg_info_titleRedDay = ".(int)$cfg_info_titleRedDay.";\r\n";
		$configFile .= "\$cfg_info_titleRedPrice = ".(float)$cfg_info_titleRedPrice.";\r\n";
		$configFile .= "\$cfg_info_refreshSmart = '".$cfg_info_refreshSmart."';\r\n";
		$configFile .= "\$cfg_info_topNormal = '".$cfg_info_topNormal."';\r\n";
		$configFile .= "\$cfg_info_topPlan = '".$cfg_info_topPlan."';\r\n";
	}

	//房产
	if(in_array('house', $installModuleArr)){
		$configFile .= "\$cfg_house_refreshFreeTimes = ".(int)$cfg_house_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_house_refreshNormalPrice = ".(float)$cfg_house_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_house_refreshSmart = '".$cfg_house_refreshSmart."';\r\n";
		$configFile .= "\$cfg_house_topNormal = '".$cfg_house_topNormal."';\r\n";
		$configFile .= "\$cfg_house_topPlan = '".$cfg_house_topPlan."';\r\n";
	}

	//招聘
	if(in_array('job', $installModuleArr)){
		$configFile .= "\$cfg_job_refreshFreeTimes = ".(int)$cfg_job_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_job_refreshNormalPrice = ".(float)$cfg_job_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_job_refreshSmart = '".$cfg_job_refreshSmart."';\r\n";
		$configFile .= "\$cfg_job_topNormal = '".$cfg_job_topNormal."';\r\n";
		$configFile .= "\$cfg_job_topPlan = '".$cfg_job_topPlan."';\r\n";
		$configFile .= "\$cfg_job_deliveryTop = '".$cfg_job_deliveryTop."';\r\n";
	}

	//汽车
	if(in_array('car', $installModuleArr)){
		$configFile .= "\$cfg_car_refreshFreeTimes = ".(int)$cfg_car_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_car_refreshNormalPrice = ".(float)$cfg_car_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_car_refreshSmart = '".$cfg_car_refreshSmart."';\r\n";
		$configFile .= "\$cfg_car_topNormal = '".$cfg_car_topNormal."';\r\n";
		$configFile .= "\$cfg_car_topPlan = '".$cfg_car_topPlan."';\r\n";
	}

	//教育
	if(in_array('education', $installModuleArr)){
		$configFile .= "\$cfg_education_refreshFreeTimes = ".(int)$cfg_education_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_education_refreshNormalPrice = ".(float)$cfg_education_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_education_refreshSmart = '".$cfg_education_refreshSmart."';\r\n";
		$configFile .= "\$cfg_education_topNormal = '".$cfg_education_topNormal."';\r\n";
		$configFile .= "\$cfg_education_topPlan = '".$cfg_education_topPlan."';\r\n";
	}

	//顺风车
	if(in_array('sfcar', $installModuleArr)){
		$configFile .= "\$cfg_sfcar_refreshFreeTimes = ".(int)$cfg_sfcar_refreshFreeTimes.";\r\n";
		$configFile .= "\$cfg_sfcar_refreshNormalPrice = ".(float)$cfg_sfcar_refreshNormalPrice.";\r\n";
		$configFile .= "\$cfg_sfcar_refreshSmart = '".$cfg_sfcar_refreshSmart."';\r\n";
		$configFile .= "\$cfg_sfcar_topNormal = '".$cfg_sfcar_topNormal."';\r\n";
		$configFile .= "\$cfg_sfcar_topPlan = '".$cfg_sfcar_topPlan."';\r\n";
		$configFile .= "\$cfg_sfcar_titleBlodlDay = ".(int)$cfg_sfcar_titleBlodlDay.";\r\n";
		$configFile .= "\$cfg_sfcar_titleBlodlPrice = ".(float)$cfg_sfcar_titleBlodlPrice.";\r\n";
		$configFile .= "\$cfg_sfcar_titleRedDay = ".(int)$cfg_sfcar_titleRedDay.";\r\n";
		$configFile .= "\$cfg_sfcar_titleRedPrice = ".(float)$cfg_sfcar_titleRedPrice.";\r\n";
	}

	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/refreshTop.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//配置参数
$configFile = HUONIAOINC.'/config/refreshTop.inc.php';
if(file_exists($configFile)){
	require_once($configFile);
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/member/refreshTop.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//二手
	if(in_array('info', $installModuleArr)){
		$huoniaoTag->assign('info_refreshFreeTimes', (int)$cfg_info_refreshFreeTimes);
		$huoniaoTag->assign('info_refreshNormalPrice', (float)$cfg_info_refreshNormalPrice);
		$huoniaoTag->assign('info_titleBlodlDay', (int)$cfg_info_titleBlodlDay);
		$huoniaoTag->assign('info_titleBlodlPrice', (float)$cfg_info_titleBlodlPrice);
		$huoniaoTag->assign('info_titleRedDay', (int)$cfg_info_titleRedDay);
		$huoniaoTag->assign('info_titleRedPrice', (float)$cfg_info_titleRedPrice);
		$huoniaoTag->assign('info_refreshSmart', $cfg_info_refreshSmart ? unserialize($cfg_info_refreshSmart) : array());
		$huoniaoTag->assign('info_topNormal', $cfg_info_topNormal ? unserialize($cfg_info_topNormal) : array());
		$huoniaoTag->assign('info_topPlan', $cfg_info_topPlan ? unserialize($cfg_info_topPlan) : array());
	}

	//房产
	if(in_array('house', $installModuleArr)){
		$huoniaoTag->assign('house_refreshFreeTimes', (int)$cfg_house_refreshFreeTimes);
		$huoniaoTag->assign('house_refreshNormalPrice', (float)$cfg_house_refreshNormalPrice);
		$huoniaoTag->assign('house_refreshSmart', $cfg_house_refreshSmart ? unserialize($cfg_house_refreshSmart) : array());
		$huoniaoTag->assign('house_topNormal', $cfg_house_topNormal ? unserialize($cfg_house_topNormal) : array());
		$huoniaoTag->assign('house_topPlan', $cfg_house_topPlan ? unserialize($cfg_house_topPlan) : array());
	}

	//招聘
	if(in_array('job', $installModuleArr)){
		$huoniaoTag->assign('job_refreshFreeTimes', (int)$cfg_job_refreshFreeTimes);
		$huoniaoTag->assign('job_refreshNormalPrice', (float)$cfg_job_refreshNormalPrice);
		$huoniaoTag->assign('job_refreshSmart', $cfg_job_refreshSmart ? unserialize($cfg_job_refreshSmart) : array());
		$huoniaoTag->assign('job_topNormal', $cfg_job_topNormal ? unserialize($cfg_job_topNormal) : array());
		$huoniaoTag->assign('job_topPlan', $cfg_job_topPlan ? unserialize($cfg_job_topPlan) : array());
		$huoniaoTag->assign('job_delivery', $cfg_job_deliveryTop ? unserialize($cfg_job_deliveryTop) : array());
	}

	//汽车
	if(in_array('car', $installModuleArr)){
		$huoniaoTag->assign('car_refreshFreeTimes', (int)$cfg_car_refreshFreeTimes);
		$huoniaoTag->assign('car_refreshNormalPrice', (float)$cfg_car_refreshNormalPrice);
		$huoniaoTag->assign('car_refreshSmart', $cfg_car_refreshSmart ? unserialize($cfg_car_refreshSmart) : array());
		$huoniaoTag->assign('car_topNormal', $cfg_car_topNormal ? unserialize($cfg_car_topNormal) : array());
		$huoniaoTag->assign('car_topPlan', $cfg_car_topPlan ? unserialize($cfg_car_topPlan) : array());
	}

	//教育
	if(in_array('education', $installModuleArr)){
		$huoniaoTag->assign('education_refreshFreeTimes', (int)$cfg_education_refreshFreeTimes);
		$huoniaoTag->assign('education_refreshNormalPrice', (float)$cfg_education_refreshNormalPrice);
		$huoniaoTag->assign('education_refreshSmart', $cfg_education_refreshSmart ? unserialize($cfg_education_refreshSmart) : array());
		$huoniaoTag->assign('education_topNormal', $cfg_education_topNormal ? unserialize($cfg_education_topNormal) : array());
		$huoniaoTag->assign('education_topPlan', $cfg_education_topPlan ? unserialize($cfg_education_topPlan) : array());
	}

	//顺风车
	if(in_array('sfcar', $installModuleArr)){
		$huoniaoTag->assign('sfcar_refreshFreeTimes', (int)$cfg_sfcar_refreshFreeTimes);
		$huoniaoTag->assign('sfcar_refreshNormalPrice', (float)$cfg_sfcar_refreshNormalPrice);
		$huoniaoTag->assign('sfcar_refreshSmart', $cfg_sfcar_refreshSmart ? unserialize($cfg_sfcar_refreshSmart) : array());
		$huoniaoTag->assign('sfcar_topNormal', $cfg_sfcar_topNormal ? unserialize($cfg_sfcar_topNormal) : array());
		$huoniaoTag->assign('sfcar_topPlan', $cfg_sfcar_topPlan ? unserialize($cfg_sfcar_topPlan) : array());

		$huoniaoTag->assign('sfcar_titleBlodlDay', (int)$cfg_sfcar_titleBlodlDay);
		$huoniaoTag->assign('sfcar_titleBlodlPrice', (float)$cfg_sfcar_titleBlodlPrice);
		$huoniaoTag->assign('sfcar_titleRedDay', (int)$cfg_sfcar_titleRedDay);
		$huoniaoTag->assign('sfcar_titleRedPrice', (float)$cfg_sfcar_titleRedPrice);
	}

    $huoniaoTag->assign('fenXiaoSwitch', array('1', '0'));
    $huoniaoTag->assign('fenXiaoSwitchNames',array('启用','禁用'));
    $huoniaoTag->assign('fenXiaoSwitchChecked', (int)$customfenXiao);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/refreshTop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
