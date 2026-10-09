<?php
/**
 * 添加婚车
 *
 * @version        $Id: weddingcarAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "weddingcarAdd.html";

$tab = "marry_weddingcar";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改婚车";
	checkPurview("weddingcarEdit");
}else{
	$pagetitle = "添加婚车";
	checkPurview("weddingcarAdd");
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(!empty($characteristicservice)) $characteristicservice = join(",", $characteristicservice);

$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());

$filter = 10;
if(!empty($tag)) $tag = join('|', $tag);

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
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `company`, `pics`, `price`, `duration`, `kilometre`, `click`, `pubdate`, `weight`, `state`,`planmealtype`,`style`,`characteristicservice`,`carintroduction`,`costcontain`,`costbarring`,`buynotice`,`tel`,`tag`,`note`) VALUES ('$title', '$comid', '$pics', '$price', '$duration', '$kilometre', '$click', '$pubdate', '$weight', '$state','$planmealtype','$style','$characteristicservice','$carintroduction','$costcontain','$costbarring','$buynotice','$tel','$tag','$note')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加婚车", $userid);
		if($state == 1){
			updateCache("marry_weddingcar_list", 300);
			clearCache("marry_weddingcar_total", 'key');
		}
		$param = array(
			"service"  => "marry",
			"template" => "weddingcar-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("marry",$aid,"weddingcar"); // 新增婚车
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `price` = '$price', `duration` = '$duration', `kilometre` = '$kilometre', `planmealtype` = '$planmealtype',`style` = '$style',`characteristicservice` = '$characteristicservice',`carintroduction` = '$carintroduction',`costcontain` = '$costcontain',`costbarring` = '$costbarring',`buynotice` = '$buynotice',`click` = '$click',`tel` = '$tel',`weight` = '$weight',`tag` = '$tag', `state` = '$state',`note` = '$note' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
		    dataAsync("marry",$id,"weddingcar"); // 修改婚车成功
			adminLog("修改婚车信息", $id);

			checkCache("marry_weddingcar_list", $id);
			clearCache("marry_weddingcar_detail", $id);
			clearCache("marry_weddingcar_total", 'key');

			$param = array(
				"service"  => "marry",
				"template" => "weddingcar-detail",
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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/marry/weddingcarAdd.js',
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
	$huoniaoTag->assign('atlasMax', $custom_marryweddingcar_atlasMax ? $custom_marryweddingcar_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
	}
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('price', $price);
    $huoniaoTag->assign('duration', $duration);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('kilometre', $kilometre);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
    $huoniaoTag->assign('planmealtype', $planmealtype);
    $huoniaoTag->assign('style', $style);
    $huoniaoTag->assign('characteristicservice', $characteristicservice);
    $huoniaoTag->assign('carintroduction', $carintroduction);
    $huoniaoTag->assign('costcontain', $costcontain);
    $huoniaoTag->assign('costbarring', $costbarring);
    $huoniaoTag->assign('buynotice', $buynotice);
    $huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('filter', $filter);
    $huoniaoTag->assign('tag', $tag);
    $huoniaoTag->assign('tagSel', $tag ? explode("|", $tag) : array());


    //特色标签
    $tagArr = $custommarryTag ? explode("|", $custommarryTag) : array();
    $huoniaoTag->assign('tagArr', $tagArr);


    //套餐类型
    $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 10 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array(0 => '请选择');
    foreach($results as $value){
        $list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('protypeList', $list);
    $huoniaoTag->assign('protype', $protype == "" ? 0 : $protype);
    //选择类型
    $stylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
    $styleresults = $dsql->dsqlOper($stylearchives, "results");
    $stylelist = array(0 => '请选择');
    foreach($styleresults as $v){
        $stylelist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('styleList', $stylelist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
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
	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
