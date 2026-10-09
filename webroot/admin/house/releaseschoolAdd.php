<?php
/**
 * 添加学校
 *
 * @version        $Id: releaseschoolAdd.php 2014-1-8 下午16:34:13 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "releaseschoolAdd.html";

$tab = "house_releaseschool";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改学校信息";
	checkPurview("releaseschoolEdit");
}else{
	$pagetitle = "添加新学校";
	checkPurview("releaseschoolAdd");
}
if(!isset($state)) $state = 0;
if($_POST['submit'] == "提交"){
	if($token == "") die('token传递失败！');
	//二次验证
	if(trim($title) == ""){
		echo '{"state": 200, "info": "学校名称不能为空"}';
		exit();
	}

	if(trim($address) == ""){
		echo '{"state": 200, "info": "学校地址不能为空"}';
		exit();
	}
	if(empty($type)){
		echo '{"state": 200, "info": "请选择学校类型"}';
		exit();
	}
	//坐标
	if(!empty($lnglat)){
		$lnglat = explode(",", $lnglat);
        $lng  = $lnglat[0];
		$lat  = $lnglat[1];
	}

	if(!empty($type)){
	    $type = implode(',',$type);
    }


}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `addrid`, `address`, `lng`, `lat`, `logo`,`banner`, `note`, `admissioninfo`, `type`, `state`,`teachaddr`,`pubdate`,`schoolnature`) VALUES
	                ('$cityid', '$title', '$addrid', '$address', '$lng', '$lat', '$logo', '$banner', '$note', '$admissioninfo', '$type', '$state', '$service_area_data','".GetMkTime(time())."','$schoolnature')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){

		adminLog("添加房产学校", $title);
        $url = '';
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

		$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($sql, "results");
		$state_ = $res[0]['state'];

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid',`teachaddr` = '$service_area_data',`title` = '$title', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `logo` = '$logo', `banner` = '$banner', `note` = '$note', `admissioninfo` = '$admissioninfo', `type` = '$type', `state` = '$state', `schoolnature` = '$schoolnature'  WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			adminLog("修改房产学校", $title);

			$param = array(
				"service"  => "house",
				"template" => "school_detail",
				"id"       => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

            $cityid     = $results[0]['cityid'];
            $title      = $results[0]['title'];
			$addrid     = $results[0]['addrid'];
			$address    = $results[0]['address'];
			$lng        = $results[0]['lng'];
			$lat        = $results[0]['lat'];
			$logo       = $results[0]['logo'];
			$banner     = $results[0]['banner'];
			$note       = $results[0]['note'];
            $schoolnature       = $results[0]['schoolnature'];
			$teachaddr  = $results[0]['teachaddr'];
			$admissioninfo       = $results[0]['admissioninfo'];
			$type       = $results[0]['type'];
			$state      = $results[0]['state'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

// 验证重复标题
}else if($action == "checkTitle"){
    $title = $_POST['title'];
    $id = (int)$_POST['id'];
    if($title){
        $where = $id ? " AND `id` <> $id" : "";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_releaseschool` WHERE `title` = '$title'".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            echo $ret[0]['id'];
        }else{
            echo 0;
        }
    }
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $cssFile = array(
        'admin/releaseschoolAdd.css'

    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/releaseschoolAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);

	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('lnglat', $lng.','.$lat);

	$huoniaoTag->assign('logo', $logo);
	$huoniaoTag->assign('banner', $banner);

	//学校类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 107 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$tagslist = array();
	$tagsval  = array();
	foreach($results as $value){
		array_push($tagslist, $value['typename']);
		array_push($tagsval, $value['id']);
	}

	$huoniaoTag->assign('tagslist', $tagslist);
	$huoniaoTag->assign('tagsval', $tagsval);
	$huoniaoTag->assign('type', explode(",", $type));




	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//学校性质
    $huoniaoTag->assign('schoolnatureopt', array('0', '1', '2'));
    $huoniaoTag->assign('schoolnaturenames',array('公办','私办','合办'));
    $huoniaoTag->assign('schoolnature', $schoolnature == "" ? 1 : $schoolnature);

	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('admissioninfo', $admissioninfo);
	$huoniaoTag->assign('admissioninfo', $admissioninfo);
    $teachaddr = json_decode($teachaddr,true);
    if($teachaddr){
        foreach ($teachaddr as $k => &$v)
        {
            $sctypesql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = ".$v['leix']);

            $sctyperes = $dsql->dsqlOper($sctypesql,"results");

            $v['type'] = $sctyperes[0] ? $sctyperes[0]['typename'] : '';
        }
        $huoniaoTag->assign('teachaddr', $teachaddr);
    }


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
