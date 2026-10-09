<?php
/**
 * 自助建站全景和视频（移动端）
 *
 * @version        $Id: websiteVideo.php 2014-06-23 上午10:32:21 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteVideo");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "自助建站全景-视频（移动端）";

if(empty($website)) die('网站信息传递失败！');

$tab = "website_touch_info";

$templates = "websiteVideoQjAdd.html";

//js
$jsFile = array(
	'ui/jquery.dragsort-0.5.1.min.js',
	'ui/bootstrap.min.js',
	'ui/jquery.dragsort-0.5.1.min.js',
	'publicUpload.js',
	'swfupload/handlers.js',
	'admin/website/websiteVideoQjAdd.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate = GetMkTime(time());       //发布时间
	$click   = (int)$click;
	$typeid = (int)$typeidArr;
}

//保存
if($dopost == "Save"){
	
	$pagetitle = "自助建站全景和视频";
	
	//表单提交
	if($submit == "提交"){
		
		$videoAid = $qjAid = 0;
		$sql = $dsql->SetQuery("SELECT `id`, `type` FROM `#@__website_touch_info` WHERE `website` = '$website' AND (`type` = 'video' || `type` = 'qj' || `type` = 'banner') ");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {
				if($value['type'] == "video"){
					$videoAid = $value['id'];
				}elseif($value['type'] == "qj"){
					$qjAid = $value['id'];
				}elseif($value['type'] == "banner"){
					$bannerAid = $value['id'];
				}
			}
		}
		
		if(trim($litpic_) == '' && trim($video) != ''){
			echo '{"state": 200, "info": "请上传缩略图"}';
			exit();
		}
		if(trim($video) == '' && trim($litpic_) != ''){
			echo '{"state": 200, "info": "请上传视频"}';
			exit();
		}

		// 全景
		if($typeid == 0){
			$file = $litpic;
		}else{
			$file = $url;
		}

		//保存到主表
		$litpic = $litpic_;
		$title = $body = "";
		$date = $weight = $click = 0;

		$type = "video";
		if($videoAid){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `litpic` = '$litpic', `body` = '$video' WHERE `id` = $videoAid");
		}else{
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$video', '$weight', '$click', '$pubdate')");
		}
		$return = $dsql->dsqlOper($archives, "update");

		$type = "qj";
		$date = $typeid;
		if($qjAid){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `date` = '$date', `body` = '$file' WHERE `id` = $qjAid");
		}else{
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$file', '$weight', '$click', '$pubdate')");
		}
		$return = $dsql->dsqlOper($archives, "update");

		$type = "banner";
		$date = 0;
		$litpic = "";
		$banner = $imglist;
		if($bannerAid){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `body` = '$banner' WHERE `id` = $bannerAid");
		}else{
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$typeid', '$banner', '$weight', '$click', '$pubdate')");
		}
		$return = $dsql->dsqlOper($archives, "update");
		
		if($return == "ok"){
			adminLog("配置自助建站全景和视频", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//显示
}else{

	$qj_imglist = $banner_imglist = array();

	//主表信息
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `website` = ".$website." AND (`type` = 'video' || `type` = 'qj' || `type` = 'banner')");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {
			if($value['type'] == "video"){
				foreach ($value as $k => $v) {
					$huoniaoTag->assign('video_'.$k, $v);
				}
			}elseif($value['type'] == "qj"){
				foreach ($value as $k => $v) {
					$huoniaoTag->assign('qj_'.$k, $v);
				}
			}elseif($value['type'] == "banner"){
				
				$img = $value['body'];
				$banner_imglist = $img ? explode(",", $img) : array();
				foreach ($value as $k => $v) {
					$huoniaoTag->assign('banner_'.$k, $v);
				}

			}
		}
	}

	$huoniaoTag->assign('banner_imglist', json_encode($banner_imglist));


}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	global $cfg_flashSize;
	$huoniaoTag->assign('flashSize', $cfg_flashSize);

	$huoniaoTag->assign('action', 'website');
	$huoniaoTag->assign('website', $website);

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', (int)$id);

	// 视频 -------------
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('click', (int)$click);
	//视频类型
	$huoniaoTag->assign('videotypeArr', array('0', '1'));
	$huoniaoTag->assign('videotypeNames',array('本地','外站调用'));
	$huoniaoTag->assign('videotype', (int)$videotype);
	$huoniaoTag->assign('videourl', $videourl);

	// 全景 -------------
	//全景类型
	$huoniaoTag->assign('typeidArr', array('0', '1'));
	$huoniaoTag->assign('typeidNames',array('图片','url'));
	$huoniaoTag->assign('typeid', (int)$typeid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}