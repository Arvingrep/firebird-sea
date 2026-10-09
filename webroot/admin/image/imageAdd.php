<?php
/**
 * 添加信息
 *
 * @version        $Id: imageAdd.php 2016-1-18 下午16:43:15 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/image";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "imageAdd.html";

if($action == ""){
	$action = "image";
}

$dotitle = "图片";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("edit".$action);
}else{
	checkPurview($action."Add");
}
$pagetitle     = "发布信息";

if($submit == "提交"){
	$flags = isset($flags) ? join(',',$flags) : '';         //自定义属性
	$pubdate = GetMkTime($pubdate);       //发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$subtitle    = cn_substrR($subtitle,36);
	$source      = cn_substrR($source,30);
	$sourceurl   = cn_substrR($sourceurl,150);
	$writer      = cn_substrR($writer,20);
	$keywords    = cn_substrR($keywords,50);
	$description = cn_substrR($description,150);
	$color       = cn_substrR($color,6);

	if(!empty($litpic)){
		if(!empty($flags)){
			$flags .= ",p";
		}else{
			$flags .= "p";
		}
	}

	//获取当前管理员
	$adminid = $userLogin->getUserID();
}
if(empty($click)) $click = mt_rand(50, 200);

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

//自定义属性-多选
$huoniaoTag->assign('flag',array('h','r','b','t'));
$huoniaoTag->assign('flagList',array('头条[h]','推荐[r]','加粗[b]','跳转[t]'));

$huoniaoTag->assign('pubdate', GetDateTimeMk(time()));

//评论开关-单选
$huoniaoTag->assign('postopt', array('0', '1'));
$huoniaoTag->assign('postnames',array('开启','关闭'));
$huoniaoTag->assign('notpost', 0);  //评论开关默认开启

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		if($id == "") die('要修改的信息ID传递失败！');

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `cityid` = '$cityid', `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `redirecturl` = '$redirecturl', `weight` = '$weight', `litpic` = '$litpic', `source` = '$source', `sourceurl` = '$sourceurl', `writer` = '$writer', `typeid` = '$typeid', `keywords` = '$keywords', `description` = '$description', `click` = '$click', `color` = '$color', `arcrank` = '$arcrank', `pubdate` = '$pubdate' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		//先删除文档所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES ('$id', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		adminLog("修改".$dotitle."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("image",$id);  // 图说资讯、编辑
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title       = $results[0]['title'];
				$subtitle    = $results[0]['subtitle'];
				$typeid      = $results[0]['typeid'];
				$flagitem    = explode(",", $results[0]['flag']);
				$flags       = $results[0]['flag'];
				$redirecturl = $results[0]['redirecturl'];
				$weight      = $results[0]['weight'];
				$litpic      = $results[0]['litpic'];
				$source      = $results[0]['source'];
				$sourceurl   = $results[0]['sourceurl'];
				$writer      = $results[0]['writer'];
				$keywords    = $results[0]['keywords'];
				$description = $results[0]['description'];
				$notpost     = $results[0]['notpost'];
				$click       = $results[0]['click'];
				$color       = $results[0]['color'];
				$arcrank     = $results[0]['arcrank'];
				$pubdate     = date('Y-m-d H:i:s', $results[0]['pubdate']);
        $cityid      = $results[0]['cityid'];

				global $data;
				$data = "";
				$typename = getParentArr($action."type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."pic` WHERE `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = $value["picPath"];
					$imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."list` (`cityid`, `title`, `subtitle`, `flag`, `redirecturl`, `weight`, `litpic`, `source`, `sourceurl`, `writer`, `typeid`, `keywords`, `description`, `click`, `color`, `arcrank`, `pubdate`, `admin`) VALUES ('$cityid', '$title', '$subtitle', '$flags', '$redirecturl', '$weight', '$litpic', '$source', '$sourceurl', '$writer', '$typeid', '$keywords', '$description', '$click', '$color', '$arcrank', '$pubdate', '$adminid')");

		$aid = $dsql->dsqlOper($archives, "lastid");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES ('$aid', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		adminLog("添加".$dotitle."信息", $title);

		$param = array(
			"service"     => "image",
			"template"    => "detail",
			"id"          => $aid,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("image",$aid);  // 图书资讯、新增
		echo '{"state": 100, "url": "'.$url.'"}';die;

	}

}elseif($dopost == "getTree"){
	$options = $dsql->getOptionList($pid, $action);
	echo json_encode($options);die;
}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/image/imageAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");

	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('customDelLink', $customDelLink);
	$huoniaoTag->assign('customAutoLitpic', $customAutoLitpic);

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', htmlentities($title, ENT_NOQUOTES, "utf-8"));
	$huoniaoTag->assign('subtitle', $subtitle);
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('flagitem', $flagitem);
	$huoniaoTag->assign('flags', empty($flags) ? "" : $flags);
	$huoniaoTag->assign('redirecturl', $redirecturl);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('source', $source);
	$huoniaoTag->assign('sourceurl', $sourceurl);
	$huoniaoTag->assign('writer', $writer);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/image";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
