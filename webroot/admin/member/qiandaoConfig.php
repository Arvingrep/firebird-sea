<?php
/**
 * 签到设置
 *
 * @version        $Id: qiandaoConfig.php 2017-12-07 上午11:00:00 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("qiandaoConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "qiandaoConfig.html";
$dir       = "../../templates/member"; //当前目录

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$cfg_qiandao_state         = (int)$qiandaoState;
	$cfg_qiandao_buqianState   = (int)$buqianState;
	$cfg_qiandao_buqianPrice   = (int)$buqianPrice;
	$cfg_qiandao_firstReward   = (int)$firstReward;
	$cfg_qiandao_reward        = (int)$reward;

	//连签
	$lianqian = array();
    if($lianqian_day){
        foreach ($lianqian_day as $key => $value) {
            $day = (int)$value;
            $reward = (int)$lianqian_reward[$key];
            if($day && $reward){
                array_push($lianqian, array(
                    'day' => $day,
                    'reward' => $reward
                ));
            }
        }
    }
	$cfg_qiandao_lianqian = serialize($lianqian);

	//总签
	$zongqian = array();
    if($zongqian_day){
        foreach ($zongqian_day as $key => $value) {
            $day = (int)$value;
            $reward = (int)$zongqian_reward[$key];
            if($day && $reward){
                array_push($zongqian, array(
                    'day' => $day,
                    'reward' => $reward
                ));
            }
        }
    }
	$cfg_qiandao_zongqian = serialize($zongqian);

	//特殊
	$teshu = array();
    if($teshu_date){
        foreach ($teshu_date as $key => $value) {
            $date = $value;
            $title = $teshu_title[$key];
            $color = $teshu_color[$key];
            $reward = (int)$teshu_reward[$key];
            if($date && $title && $color && $reward){
                array_push($teshu, array(
                    'date' => GetMktime($date),
                    'title' => $teshu_title[$key],
                    'color' => $teshu_color[$key],
                    'reward' => $teshu_reward[$key]
                ));
            }
        }
    }
	$cfg_qiandao_teshu = serialize($teshu);

	adminLog("修改签到设置");


	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_qiandao_state = ".$cfg_qiandao_state.";\r\n";
	$configFile .= "\$cfg_qiandao_buqianState = ".$cfg_qiandao_buqianState.";\r\n";
	$configFile .= "\$cfg_qiandao_buqianPrice = ".$cfg_qiandao_buqianPrice.";\r\n";
	$configFile .= "\$cfg_qiandao_firstReward = ".$cfg_qiandao_firstReward.";\r\n";
	$configFile .= "\$cfg_qiandao_reward = ".$cfg_qiandao_reward.";\r\n";
	$configFile .= "\$cfg_qiandao_lianqian = '".$cfg_qiandao_lianqian."';\r\n";
	$configFile .= "\$cfg_qiandao_zongqian = '".$cfg_qiandao_zongqian."';\r\n";
	$configFile .= "\$cfg_qiandao_teshu = '".$cfg_qiandao_teshu."';\r\n";
	$configFile .= "\$cfg_qiandao_note = '"._RunMagicQuotes($body)."';\r\n";
	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/qiandaoConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//配置参数
require_once(HUONIAOINC.'/config/qiandaoConfig.inc.php');

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'admin/member/qiandaoConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//签到状态
	$huoniaoTag->assign('qiandaoState', array('0', '1'));
	$huoniaoTag->assign('qiandaoStateNames',array('关闭','开启'));
	$huoniaoTag->assign('qiandaoStateChecked', $cfg_qiandao_state);

	//补签状态
	$huoniaoTag->assign('buqianState', array('0', '1'));
	$huoniaoTag->assign('buqianStateNames',array('关闭','开启'));
	$huoniaoTag->assign('buqianStateChecked', $cfg_qiandao_buqianState);

	$huoniaoTag->assign('buqianPrice', $cfg_qiandao_buqianPrice);
	$huoniaoTag->assign('firstReward', $cfg_qiandao_firstReward);
	$huoniaoTag->assign('reward', $cfg_qiandao_reward);

	$huoniaoTag->assign('lianqian', json_encode(unserialize($cfg_qiandao_lianqian)));
	$huoniaoTag->assign('zongqian', json_encode(unserialize($cfg_qiandao_zongqian)));
	$huoniaoTag->assign('teshu', json_encode(unserialize($cfg_qiandao_teshu)));

	$huoniaoTag->assign('body', stripslashes($cfg_qiandao_note));


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/qiandaoConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
