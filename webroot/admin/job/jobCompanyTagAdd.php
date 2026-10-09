<?php
/**
 * 新增企业标签
 *
 * @version        $Id: jobCompany.php 2014-3-17 上午00:21:17 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobCompany");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobCompanyTagAdd.html";

$huoniaoTag->assign("comboList",$comboList);

$tab = "job_companytag";

if($submit=="提交"){

    $weight = (int)$weight;
    if(empty($typename)){
        echo json_encode(array("state"=>200,"info"=>"请填写名称"));die;
    }
    //修改
    if($id){
        $sql = $dsql::SetQuery("update `#@__$tab` set `typename`='$typename',`color`='$color',`weight`=$weight where `id`=$id");
    }else{
        //新增
        $sql = $dsql::SetQuery("insert into `#@__$tab`(`typename`,`color`,`weight`) values('$typename','$color',$weight)");
    }
    $res = $dsql->update($sql);
    if($res=="ok"){
        echo json_encode(array("state"=>100,"info"=>"成功"));
    }else{
        echo json_encode(array("state"=>200,"info"=>"失败"));
    }
    die;

}else{

    //读取
    if($dopost == "edit"){
        $sql = $dsql::SetQuery("select * from `#@__$tab` where `id`=$id");
        $result = $dsql->getArr($sql);
        $huoniaoTag->assign("color",$result['color']);
        $huoniaoTag->assign("typename",$result['typename']);
        $huoniaoTag->assign("weight",$result['weight']);
    }
}


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
//        'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'ui/jquery.colorPicker.js',
		'admin/job/jobCompanyTagAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('id', $id);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
