<?php
/**
 * 国际区号管理
 *
 * @version        $Id: sitePhoneAreaCode.php 2019-11-20 下午17:22:58 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("sitePhoneAreaCode");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sitePhoneAreaCode.html";


//已开通的国家/地区
$codes = array();
$codesArr = array();
$namesArr = array();
$alreadyCode = array();
$m_file = HUONIAODATA."/admin/internationalPhoneAreaCode.txt";
if(@filesize($m_file) > 0){
  $fp = @fopen($m_file,'r');
  $codes = @fread($fp,filesize($m_file));
  fclose($fp);

  $codes = explode(',', trim($codes));
  foreach ($codes as $key => $value) {
    $val = $internationalPhoneAreaCode[$value];
    $val['px'] = $value;
    array_push($alreadyCode, $val);
    array_push($codesArr, $internationalPhoneAreaCode[$value]['code']);
    array_push($namesArr, $internationalPhoneAreaCode[$value]['name']);
  }

}

//删除区号
if($dopost == "del"){
	if($id != "" && $codes){

        $key = array_search($id, $codes);
        if ($key !== false){
            array_splice($codes, $key, 1);
        }

        $m_file = HUONIAODATA . "/admin/internationalPhoneAreaCode.txt";
        $fp = fopen($m_file, "w");
        fwrite($fp, join(',', $codes));
        fclose($fp);

		adminLog("删除国际区号", $id);
		die('{"state": 100, "info": '.json_encode('删除成功！').'}');

	}
	die;

//新增
}elseif($dopost == 'add'){

	if($_POST['data'] !== ''){

        $data_ = explode(',', $_POST['data']);
        $val = array_merge($codes, $data_);

        $m_file = HUONIAODATA . "/admin/internationalPhoneAreaCode.txt";
        $fp = fopen($m_file, "w");
        fwrite($fp, join(',', $val));
        fclose($fp);

		adminLog("开通国际区号", $data);
		die('{"state": 100, "info": '.json_encode('开通成功！').'}');

	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	if($_POST['data'] != ""){
        $m_file = HUONIAODATA . "/admin/internationalPhoneAreaCode.txt";
        $fp = fopen($m_file, "w");
        fwrite($fp, $_POST['data']);
        fclose($fp);

        adminLog("修改国际区号", $data);
        die('{"state": 100, "info": '.json_encode('更新成功！').'}');
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/siteConfig/sitePhoneAreaCode.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);


	//所有国家/地区
	$huoniaoTag->assign('internationalPhoneAreaCode', $internationalPhoneAreaCode);

	//已开通的国家/地区
	$huoniaoTag->assign('codesArr', $codesArr);
	$huoniaoTag->assign('namesArr', $namesArr);
	$huoniaoTag->assign('alreadyCode', $alreadyCode);



	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
