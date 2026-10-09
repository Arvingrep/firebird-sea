<?php
/**
 * 添加婚嫁主持人
 *
 * @version        $Id: marryhostAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryhostAdd.html";

$tab = "marry_host";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改婚嫁主持人";
	checkPurview("marryhostEdit");
}else{
	$pagetitle = "添加婚嫁主持人";
	checkPurview("marryhostAdd");
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(!empty($characteristicservice)) $characteristicservice = join(",", $characteristicservice);


    $filter = 7;
$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择婚嫁公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `title` = '".$zjcom."'");
        $comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`hostname`, `company`, `photo`, `tel`, `price`, `note`, `click`, `pubdate`, `weight`, `state`,`host`,`music`,`scenesupervision`,`hoststyle`,`planmealcontent`,`servicefeatures`,`buynotice`,`style`,`planmealtype`,`characteristicservice`,`tag`) VALUES ('$hostname', '$comid', '$photo', '$tel', '$price', '$note', '$click', '$pubdate', '$weight', '$state','$host','$music','$scenesupervision','$hoststyle','$planmealcontent','$servicefeatures','$buynotice','$style','$planmealtype','$characteristicservice','$tag')");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){
		adminLog("添加婚嫁主持人", $userid);
		if($state == 1){
			updateCache("marry_host_list", 300);
			clearCache("marry_host_total", 'key');
		}
		$param = array(
			"service"  => "marry",
			"template" => "host-detail",
			"id"       => $aid,
            "typeid"   =>7
		);
		$url = getUrlPath($param);
		dataAsync("marry",$aid,"host");  // 新增婚嫁主持人

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `hostname` = '$hostname', `company` = '$comid', `photo` = '$photo', `tel` = '$tel', `price` = '$price', `note` = '$note', `host` = '$host',`music` = '$music',`scenesupervision` = '$scenesupervision',`hoststyle` = '$hoststyle',`planmealcontent` = '$planmealcontent',`characteristicservice` = '$characteristicservice',`style` = '$style',`planmealtype` = '$planmealtype',`servicefeatures` = '$servicefeatures',`buynotice` = '$buynotice',`click` = '$click', `weight` = '$weight', `state` = '$state' ,`tag` = '$tag' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
            dataAsync("marry",$id,"host");  // 修改婚嫁主持人

            adminLog("修改婚嫁主持人信息", $id);

			checkCache("marry_host_list", $id);
			clearCache("marry_host_detail", $id);
			clearCache("marry_host_total", 'key');

			$param = array(
				"service"  => "marry",
				"template" => "host-detail",
				"id"	=>$id,
                "typeid"   =>7
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

			foreach ($results[0] as $key => $value) {
				${$key} = $value;
			}

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
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
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/marry/marryhostAdd.js',
        'ui/jquery.dragsort-0.5.1.min.js',
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/marry.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('atlasMax', $custom_marryhotelfield_atlasMax ? $custom_marryhotelfield_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
	}
	$huoniaoTag->assign('hostname', $hostname);
	$huoniaoTag->assign('photo', $photo);
	$huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
    $huoniaoTag->assign('host', $host);
    $huoniaoTag->assign('music', $music);
    $huoniaoTag->assign('scenesupervision', $scenesupervision);
    $huoniaoTag->assign('hoststyle', $hoststyle);
    $huoniaoTag->assign('planmealcontent', $planmealcontent);
    $huoniaoTag->assign('servicefeatures', $servicefeatures);
    $huoniaoTag->assign('buynotice', $buynotice);
    $huoniaoTag->assign('planmealtype', $planmealtype);
    $huoniaoTag->assign('style', $style);
    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('filter', $filter);
    //特色标签
    $tagArr = $custommarryTag ? explode("|", $custommarryTag) : array();
    $huoniaoTag->assign('tagArr', $tagArr);
    //套餐类型
    $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 4 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array(0 => '请选择');
    foreach($results as $value){
        $list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('protypeList', $list);
    $huoniaoTag->assign('protype', $protype == "" ? 0 : $protype);
    //选择风格
    $stylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
    $styleresults = $dsql->dsqlOper($stylearchives, "results");
    $stylelist = array(0 => '请选择');
    foreach($styleresults as $v){
        $stylelist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('styleList', $stylelist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //特色
    $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 16 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $characterslist = array();
    $charactersval = array();
    foreach($results as $value){
        array_push($characterslist, $value['typename']);
        array_push($charactersval, $value['id']);
    }

    $huoniaoTag->assign('characterslist', $characterslist);
    $huoniaoTag->assign('charactersval', $charactersval);
    $huoniaoTag->assign('characteristicservice', explode(",", $characteristicservice));
    //主持人
    $hostarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $hostresults = $dsql->dsqlOper($hostarchives, "results");
    $hostlist = array(0 => '请选择');
    foreach($hostresults as $v){
        $hostlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hostList', $hostlist);
    $huoniaoTag->assign('host', $host == "" ? 0 : $host);

    //显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
//	//特色服务
//    $huoniaoTag->assign('characteristicserviceArray', array('0', '1', '2'));
//    $huoniaoTag->assign('characteristicservicenames',array('下单有礼','支持分期','到店有礼'));
//    $huoniaoTag->assign('characteristicservice', $characteristicservice == "" ? 1 : $characteristicservice);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
