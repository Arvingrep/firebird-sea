<?php
/**
 * 楼盘视频
 *
 * @version        $Id: loupanVideo.php 2014-01-14 下午20:11:10 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("loupannews");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "楼盘视频";

if(empty($loupan)) die('网站信息传递失败！');

$tab = "house_loupanvideo";

if($dopost != ""){
	$templates = "loupanVideoAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/house/loupanVideoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "loupanVideo.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/house/loupanVideo.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());       //发布时间

	$loupanid = (int)$loupan;
	$click = (int)$click;

	//表单二次验证
	if(trim($title) == ''){
		echo '{"state": 200, "info": "请填写标题"}';
		exit();
	}
	if(trim($litpic) == ''){
		echo '{"state": 200, "info": "请上传缩略图"}';
		exit();
	}

	if(!$videotype){

		if(empty($video)){
			echo '{"state": 200, "info": "请上传视频"}';
			exit();
		}

		$videourl = $video;
	}

	if(empty($videourl)){
		echo '{"state": 200, "info": "请填写视频地址"}';
		exit();
	}
	if(stripos($videourl,'<iframe') !== false){
		$videourl = str_replace("<iframe", "", $videourl);
		$videourl = str_replace("iframe>", "", $videourl);
		$videourl = str_replace("</", "", $videourl);
		$videourl = str_replace(">", "", $videourl);
		$iframe = explode(" ", $videourl);
		foreach ($iframe as $k => $v) {
			if(stripos($v,'src') !== false){
				$videourl = str_replace("'", "", $v);
				$videourl = str_replace('"', "", $videourl);
				$videourl = str_replace("src=", "", $videourl);
				break;
			}
		}
	}
	$videourl = stripslashes($videourl);

}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `loupan` = ".$loupan;

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$where .= " order by `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["vodeotype"] = $value["vodeotype"];
			$list[$key]["videourl"] = $value["videourl"];
			$list[$key]["click"] = $value["click"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "house",
				"template" => "loupan-videos-detail",
				"id"       => $value["loupan"],
				"aid"      => $value["id"]
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "loupanVideoList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle     = "新增楼盘视频";

	//表单提交
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`loupan`, `title`, `litpic`, `videotype`, `videourl`, `click`, `pubdate`) VALUES ('$loupanid', '$title', '$litpic', '$videotype', '$videourl', '$click', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if($aid){
			adminLog("新增楼盘视频", $title);

			$param = array(
				"service"  => "house",
				"template" => "loupan-video-detail",
				"id"       => $loupanid,
				"aid"      => $aid
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "url": "'.$url.'"}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改楼盘视频";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `litpic` = '$litpic', `videotype` = '$videotype', `videourl` = '$videourl', `click` = '$click', `pubdate` = '$pubdate' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改楼盘视频", $title);

			$param = array(
				"service"  => "house",
				"template" => "loupan-video-detail",
				"id"       => $loupanid,
				"aid"      => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$id        = $results[0]['id'];
				$title     = $results[0]['title'];
				$litpic    = $results[0]['litpic'];
				$videotype = $results[0]['videotype'];
				$videourl  = $results[0]['videourl'];
				$click     = $results[0]['click'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			array_push($title, $results[0]['title']);
			//删除缩略图片
			$litpic = $results[0]['litpic'];
			if(!empty($litpic)){
				delPicFile($litpic, "delThumb", "house");
			}
			// 删除视频
			if($results[0]['vidoetype'] == 0 && $results[0]['videourl']){
				delPicFile($results[0]['videourl'], "delVideo", "house");
			}

			//删除主表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除楼盘视频", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	global $cfg_flashSize;
	$huoniaoTag->assign('flashSize', $cfg_flashSize);

	$huoniaoTag->assign('action', 'house');

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', (int)$id);
	$huoniaoTag->assign('loupan', (int)$loupan);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('click', (int)$click);

	//视频类型
	$huoniaoTag->assign('videotypeArr', array('0', '1'));
	$huoniaoTag->assign('videotypeNames',array('本地','外站调用'));
	$huoniaoTag->assign('videotype', (int)$videotype);
	$huoniaoTag->assign('videourl', $videourl);

	//楼盘信息
	$loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `id` = ". $loupan);
	$loupanResult = $dsql->getTypeName($loupanSql);
	if(!$loupanResult)die('楼盘不存在！');
	$huoniaoTag->assign('loupanid', $loupanResult[0]['id']);
	$huoniaoTag->assign('loupaname', $loupanResult[0]['title']);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
