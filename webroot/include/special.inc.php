<?php
/**
 * 专题设计页面数据
 *
 * @version        $Id: special.inc.php 2014-4-28 上午11:20:15 $
 * @package        HuoNiao.Special
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/common.inc.php');
$dsql  = new dsql($dbo);
$userLogin = new userLogin($dbo);
global $cfg_attachment;

//if($userLogin->getUserID()==-1){
//	die('{"code": 1, "message": '.json_encode("操作失败，请先登录！").'}');
//}

// $RenrenCrypt = new RenrenCrypt();
// $id = $RenrenCrypt->php_decrypt(base64_decode($projectid));

$id = $projectid;

$id = (int)$id;
if(empty($id)) die("参数传递失败！");

$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special` WHERE `id` = ".$id);
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("专题不存在或已删除，请确认后操作！");

//页面列表
if($action == "page"){

	global $cfg_clihost;
	$pages = array();
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `projectid` = ".$id." ORDER BY `sort` ASC, `id` ASC");
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		foreach($pageResults as $key => $val){
			$pages[$key]['pageid']      = $val['id'];
			$pages[$key]['name']        = $val['name'];
			$pages[$key]['alias']       = $val['alias'];
			$pages[$key]['islink']      = $val['islink'];
			$pages[$key]['url']         = $cfg_clihost."/special/".$projectid."/".$val['alias'].".html";
			$pages[$key]['projectid']   = $projectid;
			$pages[$key]['title']       = $val['title'];
			$pages[$key]['keywords']    = $val['keywords'];
			$pages[$key]['description'] = $val['description'];
			$pages[$key]['sort']        = $val['sort'];
		}
	}

	$param = array(
		"service"  => "special",
		"template" => "detail",
		"id"       => $id
	);
	$url = getUrlPath($param);
?>
{
    "data": {
        "pages": <?php echo !empty($pages) ? json_encode($pages) : "[]";?>,
        "templates": [],
        "macros": {
            "PROJECT_ATTACHMENTS_BASE": "<?php echo $cfg_clihost."/".$cfg_attachment;?>",
            "PROJECT_PAGES_BASE": "<?php echo $cfg_clihost."/special/".$projectid."/";?>"
        },
        "url": "<?php echo $url;?>"
    },
	"message": "<?php echo !empty($pages) ? "" : "页面读取失败，请重新建立网站！";?>"
}
<?php
//页面数据
}elseif($action == "pagedata"){

	$data = array();
	if(!empty($pageid)){
		$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `id` = ".$pageid);
		$pageResults = $dsql->dsqlOper($pageArchives, "results");
		$data = $pageResults[0]['pagedata'];
	}

?>
{"data": <?php echo !empty($data) ? $data : "";?>}
<?php
//组件风格
}elseif($action == "widgetthemes"){

	$themes = array();
	$total  = 0;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__pageelement` WHERE `theme` = '".$widgetType."'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__pageelement_theme` WHERE `pid` = ".$results[0]['id']." ORDER BY `weight` ASC, `id` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){
				$themes[] = array("name" => $val['name'], "color" => !empty($val['color']) ? $val['color'] : NULL);
				$total++;
			}
		}
	}
	echo '{"total": '.$total.', "themes": '.json_encode($themes).'}';
	die;

//页面元素
}elseif($action == "widgets"){
	if($page != 1) die;
	$data = array();
	$total = 0;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__pageelement` WHERE `sort` = 'widgets' AND `state` = 1 ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$total++;
		$config = "";
		if(!empty($val['config'])){
			$config = ",".$val['config'];
		}
		$data[] = '{"name": "'.$val['title'].'", "type": "'.$val['type'].'"'.$config.'}';
	}
	echo '{"total": '.$total.', "data": ['.join(",", $data).']}';
	die;

//应用
}elseif($action == "apps"){
	if($page != 1) die;
	$data = array();
	$total = 0;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__pageelement_type` ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$widgets = array();

		$archives = $dsql->SetQuery("SELECT * FROM `#@__pageelement` WHERE `sort` = 'apps' AND `state` = 1 AND `appstype` = ".$val['id']." ORDER BY `weight` ASC, `id` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		foreach($results as $k => $v){
			$total++;
			$config = "";
			if(!empty($v['config'])){
				$config = ",".$v['config'];
			}
			$widgets[] = '{"name": "'.$v['title'].'", "type": "'.$v['type'].'"'.$config.'}';
		}

		$data[] = '{"name": "'.$val['name'].'", "widgets": ['.join(",", $widgets).']}';
	}
	echo '{"total": '.$total.', "data": ['.join(",", $data).']}';
	die;

//添加页面
}elseif($action == "createPage"){
	if(empty($name)) die('{"code": 1, "message": '.json_encode("页面名称不能为空！").'}');
	if(empty($alias)) die('{"code": 1, "message": '.json_encode("文件名不能为空！").'}');

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special_design` WHERE `alias` = '".$alias."'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		die('{"code": 1, "message": '.json_encode("文件名已存在！").'}');
	}

	$name = cn_substrR($name,20);
	$alias = cn_substrR($alias,20);
	$title = cn_substrR($title,100);
	$keywords = cn_substrR($keywords,100);
	$description = cn_substrR($description,200);

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special_design` WHERE `projectid` = ".$id);
	$total = $dsql->dsqlOper($archives, "totalCount");
	$total++;

	$archives = $dsql->SetQuery("INSERT INTO `#@__special_design` (`projectid`, `name`, `alias`, `islink`, `title`, `keywords`, `description`, `sort`, `pubdate`) VALUES ($id, '$name', '$alias', 0, '$title', '$keywords', '$description', $total, ".GetMkTime(time()).")");
	$lastid = $dsql->dsqlOper($archives, "lastid");
	if(is_numeric($lastid)){
		global $cfg_clihost;
		$page = array();
		$page['pageid'] = $lastid;
		$page['islink'] = 0;
		$page['url'] = $cfg_clihost."/special/".$projectid."/".$alias.".html";
		$page['name'] = $name;
		$page['alias'] = $alias;
		$page['projectid'] = $projectid;
		$page['title'] = $title;
		$page['keywords'] = $keywords;
		$page['description'] = $description;
		$page['sort'] = $total;
		die('{"code": 0, "message": "", "page": '.json_encode($page).'}');

	}else{
		die('{"code": 1, "message": '.json_encode("添加失败！").'}');
	}

//修改页面信息
}elseif($action == "updatePage"){
	if(empty($pageid)) die('{"code": 1, "message": '.json_encode("页面ID传错误，修改失败！").'}');
	if(empty($name)) die('{"code": 1, "message": '.json_encode("页面名称不能为空！").'}');
	if(empty($alias)) die('{"code": 1, "message": '.json_encode("文件名不能为空！").'}');

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special_design` WHERE `alias` = '".$alias."' AND `projectid` = ".$id." AND `id` != $pageid");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		die('{"code": 1, "message": '.json_encode("文件名已存在！").'}');
	}

	$name = cn_substrR($name,20);
	$alias = cn_substrR($alias,20);
	$title = cn_substrR($title,100);
	$keywords = cn_substrR($keywords,100);
	$description = cn_substrR($description,200);

	$archives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "results");
	if(!$results){
		die('{"code": 1, "message": '.json_encode("页面不存在或已经删除，修改失败！").'}');
	}else{
		$alias = $results[0]['alias'] == "index" ? "index" : $alias;
		$sort  = $results[0]['sort'];
	}
	$archives = $dsql->SetQuery("UPDATE `#@__special_design` SET `name` = '$name', `alias` = '$alias', `title` = '$title', `keywords` = '$keywords', `description` = '$description' WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == "ok"){
		global $cfg_clihost;
		$page = array();
		$page['pageid'] = $pageid;
		$page['islink'] = 0;
		$page['url'] = $cfg_clihost."/special/".$projectid."/".$alias.".html";
		$page['name'] = $name;
		$page['alias'] = $alias;
		$page['projectid'] = $projectid;
		$page['title'] = $title;
		$page['keywords'] = $keywords;
		$page['description'] = $description;
		$page['sort'] = $sort;
		die('{"code": 0, "message": "", "page": '.json_encode($page).'}');

	}else{
		die('{"code": 1, "message": '.json_encode("修改失败！").'}');
	}

//更新页面排序
}elseif($action == "updateSort"){
	$error = array();
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `projectid` = ".$id);
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		foreach($pageResults as $key => $val){
			$pageArchives = $dsql->SetQuery("UPDATE `#@__special_design` SET `sort` = ".$sort[$val['id']]." WHERE `id` = ".$val['id']);
			$pageResults = $dsql->dsqlOper($pageArchives, "update");
			if($pageResults != "ok"){
				$error[] = $val['name'];
			}
		}
	}
	if(!empty($error)){
		die('{"code": 1, "message": '.json_encode(join("、", $error)." 保存修改失败！").'}');
	}else{
		die('{"code": 0, "message": '.json_encode("排序保存成功！").'}');
	}

//删除页面
}elseif($action == "deletePage"){
	if(empty($pageid)) die('{"code": 1, "message": '.json_encode("页面ID传错误，删除失败！").'}');
	$archives = $dsql->SetQuery("DELETE FROM `#@__special_design` WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == "ok"){
		die('{"code": 0, "message": '.json_encode("删除成功！").'}');
	}else{
		die('{"code": 1, "message": '.json_encode("删除失败！").'}');
	}

//拷贝页面
}elseif($action == "clonePage"){
	if(empty($pageid)) die('{"code": 1, "message": '.json_encode("页面ID传错误，操作失败！").'}');
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `id` = ".$pageid);
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special_design` WHERE `projectid` = ".$id);
		$total = $dsql->dsqlOper($archives, "totalCount");
		$total++;

		$name = $pageResults[0]['name'];
		$alias = $pageResults[0]['alias'];
		$title = $pageResults[0]['title'];
		$keywords = $pageResults[0]['keywords'];
		$description = $pageResults[0]['description'];
		$pagedata = addslashes($pageResults[0]['pagedata']);

		$archives = $dsql->SetQuery("INSERT INTO `#@__special_design` (`projectid`, `name`, `alias`, `islink`, `title`, `keywords`, `description`, `pagedata`, `sort`, `pubdate`) VALUES ($id, '".$name."-拷贝', '".$alias."-".$total."', 0, '$title', '$keywords', '$description', '$pagedata', $total, ".GetMkTime(time()).")");
		$lastid = $dsql->dsqlOper($archives, "lastid");
		if(is_numeric($lastid)){
			global $cfg_clihost;
			$page = array();
			$page['pageid'] = $lastid;
			$page['islink'] = 0;
			$page['url'] = $cfg_clihost."/special/".$projectid."/".$alias."-".$total.".html";
			$page['name'] = $name."-拷贝";
			$page['alias'] = $alias."-".$total;
			$page['projectid'] = $projectid;
			$page['title'] = $title;
			$page['keywords'] = $keywords;
			$page['description'] = $description;
			$page['sort'] = $total;
			die('{"code": 0, "message": "", "page": '.json_encode($page).'}');

		}else{
			die('{"code": 1, "message": '.json_encode("拷贝失败！").'}');
		}

	}else{
		die('{"code": 1, "message": '.json_encode("拷贝对象不存在，操作失败！").'}');
	}

//保存页面
}elseif($action == "save"){
	$error = array();
	if(!empty($pages)){
		foreach($pages as $key => $val){
			$value = addslashes($_POST['pages'][$key]);
			$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `id` = ".$key);
			$pageResults = $dsql->dsqlOper($pageArchives, "results");
			if($pageResults){
				$title = $pageResults[0]['name'];
				$pageArchives = $dsql->SetQuery("UPDATE `#@__special_design` SET `pagedata` = '".$value."' WHERE `id` = ".$key);
				$pageResults = $dsql->dsqlOper($pageArchives, "update");
				if($pageResults != "ok"){
					$error[] = $title;
				}
			}
		}
	}
	if(!empty($error)){
		die('{"code": 1, "message": '.json_encode(join("、", $error)." 保存失败！").'}');
	}else{
		die('{"code": 0, "message": "", "page": '.json_encode("保存成功！").'}');
	}

//图片编辑
}elseif($action == "imageditor"){
	//获取配置信息
	if($do == "getConfig"){
		$return = array();
		$return["authFieldName"] = "PAGEEND_PASSPORT_ID";
		$return["readFieldName"] = "file";
		$return["uploadFieldName"] = "file";
		$return["defaultQuality"] = "90";
		$return["sizeListUrl"] = "/include/special.inc.php?action=imageditor&do=getPresetSizes";
		$return["ratioListUrl"] = "/include/special.inc.php?action=imageditor&do=getPresetRatio";
		$return["waterListUrl"] = "/include/special.inc.php?action=imageditor&do=getWatermarkSchemes";
		$return["saveUrl"] = "/include/special.inc.php?action=imageditor&do=saveImage&projectid=".$projectid;
		$return["readUrl"] = "/include/special.inc.php?action=imageditor&do=loadImage&projectid=".$projectid;
		echo json_encode($return);die;

	//加载图片
	}elseif($do == "loadImage"){
		global $cfg_clihost;

		//输出文件信息
		function GrabImage($url) {
			if ($url == "") return false;
			ob_start();
			readfile($url);
			$img = ob_get_contents();
			ob_end_clean();
			$info = getimagesize($url);
			header("content-type:".$info['mime']);
			return $img;
		}
		$file = $_GET['file'];
		echo GrabImage($cfg_clihost.$file);

	//保存图片
	}elseif($do == "saveImage"){
		//echo '{"state":false,"error":"没有文件被上传"}';
		echo '{"state":true,"file":"/include/attachment.php?f=VlRsY01WTSs="}';

	}

//附件管理
}elseif($action == "filemanage"){

	global $cfg_softType;
	global $cfg_thumbType;
	global $cfg_audioType;
	$softType = $cfg_softType;
	$thumbType = $cfg_thumbType;
	$flashType = "swf";
	$audioType = $cfg_audioType;

	require_once(HUONIAOINC."/config/special.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_softType;
		global $custom_thumbType;
		$softType = $custom_softType;
		$thumbType = $custom_thumbType;
	}

	function chkType($f = NULL){
		if(!empty($f)){
			global $softType;
			global $thumbType;
			global $flashType;
			global $audioType;

			$softType_ = explode("|", $softType);
			$thumbType_ = explode("|", $thumbType);
			$flashType_ = explode("|", $flashType);
			$audioType_ = explode("|", $audioType);

			if(in_array($f, $softType_)) return "file";
			if(in_array($f, $thumbType_)) return "image";
			if(in_array($f, $flashType_)) return "flash";
			if(in_array($f, $audioType_)) return "audio";
		}else{
			return "file";
		}
	}

	$userid = $userLogin->getUserID();
	$data = array();
	$pagesize = $pagesize == "" ? 18 : $pagesize;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `aid` = ".$id;
	if(!empty($filter)){
		$where .= " AND `filetype` = '".$filter."'";
	}
	$fileArchives = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `userid` = ".$userid."".$where." AND `path` like '%special%' ORDER BY `id` DESC");
	$total = $dsql->dsqlOper($fileArchives, "totalCount");

	$atpage = $pagesize*($page-1);
	$where = " LIMIT $atpage, $pagesize";
	$fileResults = $dsql->dsqlOper($fileArchives.$where, "results");

	if($fileResults){
		$RenrenCrypt = new RenrenCrypt();
		foreach($fileResults as $key => $val){
			$fid = base64_encode($RenrenCrypt->php_encrypt($val['id']));
			$fileType = explode(".", $val['filename']);
			$fileType = $fileType[count($fileType)-1];
			$fileType = chkType($fileType);
			$thumb = $fileType == "image" ? getFilePath($fid) : NULL;

			$url = getFilePath($fid); //."&name=".$val['filename'];

			//为兼容页面播放器，此处将文件真实地址输出
			if($fileType == "audio"){
				global $cfg_fileUrl;
				global $cfg_uploadDir;
				global $cfg_ftpState;
				global $cfg_ftpType;
				global $cfg_ftpState;
				global $cfg_ftpDir;
				global $cfg_OSSUrl;

				if($module != "siteConfig"){
					global $customUpload;
					global $custom_uploadDir;
					global $customFtp;
					global $customFtpType;
					global $custom_ftpState;
					global $custom_ftpDir;
					global $custom_ftpUrl;
					global $custom_OSSUrl;

					//自定义FTP配置
					if($customFtp == 1){
						//阿里云OSS
						if($custom_ftpType == 1){
							if(strpos($custom_OSSUrl, "http://") !== false){
								$site_fileUrl = $custom_OSSUrl;
							}else{
								$site_fileUrl = "http://".$custom_OSSUrl;
							}
						//普通FTP
						}elseif($custom_ftpState == 1){
							$site_fileUrl = $custom_ftpUrl.str_replace(".", "", $custom_ftpDir);
						//本地
						}else{
							if($customUpload == 1){
								$site_fileUrl = "..".$custom_uploadDir;
							}else{
								$site_fileUrl = "..".$cfg_uploadDir;
							}
						}
					//系统默认
					}else{
						//阿里云OSS
						if($cfg_ftpType == 1){
							if(strpos($cfg_OSSUrl, "http://") !== false){
								$site_fileUrl = $cfg_OSSUrl;
							}else{
								$site_fileUrl = "http://".$cfg_OSSUrl;
							}
						//普通FTP
						}elseif($cfg_ftpState == 1){
							$site_fileUrl = $cfg_fileUrl;
						//本地
						}else{
							$site_fileUrl = "..".$cfg_uploadDir;
						}
					}
				}else{
					//阿里云OSS
					if($cfg_ftpType == 1){
						if(strpos($cfg_OSSUrl, "http://") !== false){
							$site_fileUrl = $cfg_OSSUrl;
						}else{
							$site_fileUrl = "http://".$cfg_OSSUrl;
						}
					//普通FTP
					}elseif($cfg_ftpType == 0 && $cfg_ftpState == 1){
						$site_fileUrl = $cfg_fileUrl;
					//本地
					}else{
						$site_fileUrl = "..".$cfg_uploadDir;
					}
				}

				$url = $site_fileUrl.$val['path'];
			}

			$data[$key] = array(
				"name" => $val['filename'],
				"thumb" => $thumb,
				"type" => $fileType,
				"url" => $url
			);
		}
	}
	echo '{"code": 0, "message": "", "total": '.$total.', "data": '.json_encode($data).'}';
	die;

}

//专题模板分类
elseif($action == "specialTempType"){

	$dsql = new dsql($dbo);
	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__special_temptype` WHERE `parentid` = 0 ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		echo $jsoncallback.'({"state": 100, "info": '.json_encode("获取成功！").', "list": '.json_encode($results).'})';
	}else{
		echo $jsoncallback.'({"state": 100, "info": '.json_encode("暂无相关信息！").'})';
	}
	die;

}

//专题模板列表
elseif($action == "specialTempList"){
	$dsql = new dsql($dbo);
	$data = array();
	$pagesize = $pagesize == "" ? 20 : $pagesize;
	$page     = $page == "" ? 1 : $page;

	$where = !empty($type) ? " WHERE `type` = ".$type : "";
	$where .= " ORDER BY `weight` DESC, `id` DESC";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic` FROM `#@__special_temp`".$where);
	$total = $dsql->dsqlOper($archives, "totalCount");

	$atpage = $pagesize*($page-1);
	$where = " LIMIT $atpage, $pagesize";
	$results = $dsql->dsqlOper($archives.$where, "results");

	if($results){
		foreach($results as $key => $val){
			$data[$key] = array(
				"id" => $val['id'],
				"title" => $val['title'],
				"litpic" => $val['litpic']
			);
		}
	}
	echo '{"code": 0, "message": "", "total": '.$total.', "data": '.json_encode($data).'}';
	die;
}

//专题模板数据内容
elseif($action == "specialTempDetail"){

	if(!empty($tempid)){
		$dsql = new dsql($dbo);
		$archives = $dsql->SetQuery("SELECT `html` FROM `#@__special_temp` WHERE `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			echo $jsoncallback.'({"state": 100, "info": '.json_encode("获取成功！").', "html": '.$results[0]['html'].'})';
		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板不存在，请确认后重试！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板ID传递失败！").'})';
	}
	die;

}

//专题模板数据替换当前页面
elseif($action == "specialTempReplace"){

	if(!empty($tempid) && !empty($pageid)){
		$dsql = new dsql($dbo);
		$archives = $dsql->SetQuery("SELECT `html` FROM `#@__special_temp` WHERE `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$html = addslashes($results[0]['html']);

			$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__special_design` WHERE `id` = ".$pageid);
			$pageResults = $dsql->dsqlOper($pageArchives, "results");
			if($pageResults){

				$pageArchives = $dsql->SetQuery("UPDATE `#@__special_design` SET `pagedata` = '$html' WHERE `id` = ".$pageid);
				$pageResults = $dsql->dsqlOper($pageArchives, "update");
				if($pageResults != "ok"){
					echo $jsoncallback.'({"state": 200, "info": '.json_encode("操作失败！").'})';
				}else{
					echo $jsoncallback.'({"state": 100, "info": '.json_encode("操作成功！").'})';
				}

			}else{
				echo $jsoncallback.'({"state": 200, "info": '.json_encode("页面不存在或已删除，请确认后重试！").'})';
			}

		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板不存在，请确认后重试！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("数据传递错误，操作失败！").'})';
	}
	die;

}

//获取标签模板
elseif($action == "mytagTemp"){
	$mytag = (int)$mytag;
	if(!empty($mytag)){

		$dsql = new dsql($dbo);
		//验证模板标签
		$archives = $dsql->SetQuery("SELECT `id`, `module`, `type`, `start`, `end`, `expbody` FROM `#@__mytag` WHERE `state` = 1 AND `id` = ".$mytag);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			$module  = $results[0]['module'];
			$type    = $results[0]['type'];
			$start   = $results[0]['start'];
			$end     = $results[0]['end'];
			$expbody = $results[0]['expbody'];
			$date    = GetMkTime(time());

			if($date < $start && !empty($start)) die($jsoncallback.'({"state": 200, "info": '.json_encode("标签还未开始，不可以使用！").'})');
			if($date > $end && !empty($end)) die($jsoncallback.'({"state": 200, "info": '.json_encode(!empty($expbody) ? $expbody : "标签已结束，不可以使用！").'})');

			$where = ' AND `module` = "'.$module.'"';
			if(!empty($type)) $where .= ' AND `type` = "'.$type.'"';

			//获取标签模板
			$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `isSystem` FROM `#@__mytag_temp` WHERE `state` = 1".$where." ORDER BY `id` DESC");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){

				echo $jsoncallback.'({"state": 100, "info": '.json_encode("获取成功！").', "list": '.json_encode($results).'})';

			}else{
				echo $jsoncallback.'({"state": 200, "info": '.json_encode("暂无可用标签模板！").'})';
			}

		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("标签ID不存在或已删除！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("请正确填写标签ID").'})';
	}
	die;
}

//根据标签、模板、数量获取数据
elseif($action == "mytagDataList"){
	$mytag = (int)$mytag;
	$temp  = (int)$temp;
	$num   = (int)$num;

	if(empty($mytag)) die($jsoncallback.'({"state": 200, "info": '.json_encode("请正确填写标签ID").'})');
	if(empty($temp)) die($jsoncallback.'({"state": 200, "info": '.json_encode("请正确填写标签ID").'})');
	$num = !isset($num) ? 10 : $num;

	$dsql = new dsql($dbo);

	//验证模板标签
	$archives = $dsql->SetQuery("SELECT `id`, `module`, `config`, `type`, `start`, `end`, `expbody` FROM `#@__mytag` WHERE `state` = 1 AND `id` = ".$mytag);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){

		$module  = $results[0]['module'];
		$type    = $results[0]['type'];
		$config  = unserialize($results[0]['config']);
		$config['pageSize'] = $num;
		$start   = $results[0]['start'];
		$end     = $results[0]['end'];
		$expbody = $results[0]['expbody'];
		$date    = GetMkTime(time());

		if($date < $start && !empty($start)) die(!empty($jsoncallback) ? $jsoncallback.'({"state": 200, "info": '.json_encode("标签还未开始，不可以使用！").'})' : "标签还未开始，不可以使用！");
		if($date > $end && !empty($end)) die(!empty($jsoncallback) ? $jsoncallback.'({"state": 200, "info": '.json_encode(!empty($expbody) ? $expbody : "标签已结束，不可以使用！").'})' : "标签已结束，不可以使用！");

		$where = ' AND `module` = "'.$module.'" AND `id` = '.$temp;
		if(!empty($type)) $where .= ' AND `type` = "'.$type.'"';

		//获取标签模板
		$archives = $dsql->SetQuery("SELECT `id`, `css` FROM `#@__mytag_temp` WHERE `state` = 1".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			$do = !empty($type) ? $type : $module;
			$css = $results[0]['css'];
			$handler = true;

			$huoniaoTag->template_dir = HUONIAOROOT."/templates/mytag/";
			$huoniaoTag->caching = FALSE;
			require_once(HUONIAOROOT.'/include/class/mytag.class.php');
			$huoniaoTag->registerPlugin("block","mytag","mytagFunction");
			$html = $huoniaoTag->fetch($temp.".html");

			if(!empty($jsoncallback)){
				echo $jsoncallback.'({"state": 100, "info": '.json_encode("获取成功！").', "list": '.json_encode($html).', "css": '.json_encode($css).'})';
			}else{
				echo "<style type='text/css'>$css</style>\r\n$html";
			}

		}else{
			echo !empty($jsoncallback) ? $jsoncallback.'({"state": 200, "info": '.json_encode("标签模板不可用！").'})' : "标签模板不可用！";
		}

	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"state": 200, "info": '.json_encode("标签ID不存在或已删除！").'})' : "标签ID不存在或已删除！";
	}

	die;

//复制标签模板
}elseif($action == "mytagTempCopy"){
	if(!empty($tempid)){
		$dsql = new dsql($dbo);
		//验证模板
		$archives = $dsql->SetQuery("SELECT * FROM `#@__mytag_temp` WHERE `state` = 1 AND `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			$title  = $results[0]['title']." 拷贝";
			$module = $results[0]['module'];
			$type   = $results[0]['type'];
			$litpic = $results[0]['litpic'];
			$css    = $results[0]['css'];

			$m_file = HUONIAOROOT."/templates/mytag/".$tempid.".html";
			$fp = @fopen($m_file,'r');
			$str = @fread($fp,filesize($m_file));
			@fclose($fp);
			$html   = $str;

			//写入数据库
			$archives = $dsql->SetQuery("INSERT INTO `#@__mytag_temp` (`title`, `module`, `type`, `litpic`, `css`, `isSystem`, `state`, `pubdate`) VALUES ('$title', '$module', '$type', '$litpic', '$css', '0', '1', '".GetMkTime(time())."')");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if($aid){
				//创建模板文件
				$tempFile = HUONIAOROOT."/templates/mytag/".$aid.".html";
				createFile($tempFile);
				PutFile($tempFile, $html);

				echo $jsoncallback.'({"state": 100, "info": '.json_encode("操作成功！").'})';
			}else{
				echo $jsoncallback.'({"state": 200, "info": '.json_encode("复制失败！").'})';
			}


		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板风格不存在！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("请选择要复制的模板风格！").'})';
	}
	die;

//修改自定义标签模板
}elseif($action == "mytagTempEdit"){
	if(!empty($tempid)){
		$dsql = new dsql($dbo);
		//验证模板
		$archives = $dsql->SetQuery("SELECT `title`, `litpic`, `css` FROM `#@__mytag_temp` WHERE `state` = 1 AND `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");

		if($results){

			$isSystem  = $results[0]['isSystem'];
			if($isSystem == 1) die($jsoncallback.'({"state": 200, "info": '.json_encode("系统模板不可修改！").'})');

			//为空取数据
			if(empty($dopost)){
				$m_file = HUONIAOROOT."/templates/mytag/".$tempid.".html";
				$fp = @fopen($m_file,'r');
				$str = @fread($fp,filesize($m_file));
				@fclose($fp);

				$results[0]['html'] = $str ? $str : "";

				echo $jsoncallback.'({"state": 100, "info": '.json_encode($results).'})';

			//不为空保存数据
			}else{

				if(empty($title)) die($jsoncallback.'({"state": 200, "info": '.json_encode("请输入模板名称").'})');
				if(empty($litpic)) die($jsoncallback.'({"state": 200, "info": '.json_encode("请选择模板缩略图").'})');
				if(empty($html)) die($jsoncallback.'({"state": 200, "info": '.json_encode("请输入模板HTML内容").'})');

				$archives = $dsql->SetQuery("UPDATE `#@__mytag_temp` SET `title` = '$title', `litpic` = '$litpic', `css` = '$css' WHERE `id` = ".$tempid);
				$return = $dsql->dsqlOper($archives, "update");

				if($return == "ok"){
					//模板文件
					$tempFile = HUONIAOROOT."/templates/mytag/".$tempid.".html";
					if(!file_exists($tempFile)){
						createFile($tempFile);
					}
					PutFile($tempFile, $_REQUEST['html']);

					echo $jsoncallback.'({"state": 100, "info": '.json_encode("保存成功！").'})';
				}else{
					echo $jsoncallback.'({"state": 200, "info": '.json_encode("保存失败！").'})';
				}

			}


		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板风格不存在！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("请选择要删除的模板风格！").'})';
	}
	die;

//删除标签模板
}elseif($action == "mytagTempDel"){
	if(!empty($tempid)){
		$dsql = new dsql($dbo);
		//验证模板
		$archives = $dsql->SetQuery("SELECT * FROM `#@__mytag_temp` WHERE `state` = 1 AND `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			$isSystem  = $results[0]['isSystem'];
			if($isSystem == 1) die($jsoncallback.'({"state": 200, "info": '.json_encode("系统模板不可删除！").'})');

			//从数据库中删除
			$archives = $dsql->SetQuery("DELETE FROM `#@__mytag_temp` WHERE `id` = ".$tempid);
			$return = $dsql->dsqlOper($archives, "update");

			//删除模板文件
			unlinkFile(HUONIAOROOT."/templates/mytag/".$tempid.".html");

			if($return == "ok"){
				echo $jsoncallback.'({"state": 100, "info": '.json_encode("删除成功！").'})';
			}else{
				echo $jsoncallback.'({"state": 200, "info": '.json_encode("删除失败！").'})';
			}


		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板风格不存在！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("请选择要删除的模板风格！").'})';
	}
	die;

}
?>
