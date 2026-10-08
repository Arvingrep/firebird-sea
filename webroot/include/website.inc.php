<?php
/**
 * 自助建站设计页面数据
 *
 * @version        $Id: website.inc.php 2014-6-21 下午14:06:28 $
 * @package        HuoNiao.website
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

if(is_numeric($projectid)){
	$id = $projectid;
}else{
	$RenrenCrypt = new RenrenCrypt();
	$id = $RenrenCrypt->php_decrypt(base64_decode($projectid));
    $projectid = $id;
}

$id = (int)$id;
if(empty($id)) die("参数传递失败！");

//模板预览
$domaintype = "";
if($type == "template"){
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_temp` WHERE `id` = $id");
}else{
	$archives = $dsql->SetQuery("SELECT `id`, `domaintype` FROM `#@__website` WHERE `id` = ".$id);
}
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("网站不存在或已删除，请确认后操作！");

if($type != "template"){
	$domaintype = $results[0]['domaintype'];
}

//页面列表
if($action == "page"){

	global $cfg_clihost;
	$pages = $tpages = array();
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `projectid` = ".$id." AND `appname` = '' ORDER BY `sort` ASC, `id` ASC");
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		foreach($pageResults as $key => $val){
			$pages[$key]['pageid']      = $val['id'];
			$pages[$key]['name']        = $val['name'];
			$pages[$key]['alias']       = $val['alias'];
			$pages[$key]['islink']      = $val['islink'];
			$pages[$key]['url']         = "{PROJECT_PAGES_BASE}".$val['alias'].".html";
			$pages[$key]['projectid']   = $projectid;
			$pages[$key]['title']       = $val['title'];
			$pages[$key]['keywords']    = $val['keywords'];
			$pages[$key]['description'] = $val['description'];
			$pages[$key]['sort']        = $val['sort'];
		}
	}

	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `projectid` = ".$id." AND `appname` != '' ORDER BY `sort` ASC, `id` ASC");
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		foreach($pageResults as $key => $val){
			$tpages[$key]['pageid']      = $val['id'];
			$tpages[$key]['name']        = $val['name'];
			$tpages[$key]['alias']       = $val['alias'];
			$tpages[$key]['islink']      = $val['islink'];
			$tpages[$key]['url']         = "{PROJECT_PAGES_BASE}".$val['alias'].".html";
			$tpages[$key]['projectid']   = $projectid;
			$tpages[$key]['title']       = $val['title'];
			$tpages[$key]['keywords']    = $val['keywords'];
			$tpages[$key]['description'] = $val['description'];
			$tpages[$key]['sort']        = $val['sort'];
			$tpages[$key]['appname']     = $val['appname'];
		}
	}

	$customDomain = "";
	$getDomain = getDomain("website", "website", $id);
	if($getDomain && $getDomain['state'] == 1){
		$customDomain = $cfg_secureAccess . $getDomain['domain'];
	}
	if($customDomain && $domaintype){
		$url = $customDomain;
	}else{
		$param = array(
			"service"  => "website",
			"template" => "site".$id
		);
		$url = getUrlPath($param);
	}
?>
{
    "data": {
        "pages": <?php echo !empty($pages) ? json_encode($pages) : "[]";?>,
        "templates": <?php echo !empty($tpages) ? json_encode($tpages) : "[]";?>,
        "macros": {
            "PROJECT_ATTACHMENTS_BASE": "<?php echo $cfg_clihost."/".$cfg_attachment;?>",
            "PROJECT_PAGES_BASE": "{PROJECT_PAGES_BASE}"
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
		$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `id` = ".$pageid);
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
	$archives = $dsql->SetQuery("SELECT * FROM `#@__websiteelement` WHERE `theme` = '".$widgetType."'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__websiteelement_theme` WHERE `pid` = ".$results[0]['id']." ORDER BY `weight` ASC, `id` ASC");
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
	$archives = $dsql->SetQuery("SELECT * FROM `#@__websiteelement` WHERE `sort` = 'widgets' AND `state` = 1 ORDER BY `weight` ASC, `id` ASC");
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
	$archives = $dsql->SetQuery("SELECT * FROM `#@__websiteelement_type` ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$widgets = array();

		$archives = $dsql->SetQuery("SELECT * FROM `#@__websiteelement` WHERE `sort` = 'apps' AND `state` = 1 AND `appstype` = ".$val['id']." ORDER BY `weight` ASC, `id` ASC");
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

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_design` WHERE `projectid` = $id AND `alias` = '".$alias."'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		die('{"code": 1, "message": '.json_encode("文件名已存在！").'}');
	}

	$name = cn_substrR($name,20);
	$alias = cn_substrR($alias,20);
	$title = cn_substrR($title,100);
	$keywords = cn_substrR($keywords,100);
	$description = cn_substrR($description,200);

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_design` WHERE `projectid` = ".$id);
	$total = $dsql->dsqlOper($archives, "totalCount");
	$total++;

	$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `islink`, `title`, `keywords`, `description`, `sort`, `pubdate`) VALUES ($id, '$name', '$alias', 0, '$title', '$keywords', '$description', $total, ".GetMkTime(time()).")");
	$lastid = $dsql->dsqlOper($archives, "lastid");
	if(is_numeric($lastid)){
		global $cfg_clihost;
		$page = array();
		$page['pageid'] = $lastid;
		$page['islink'] = 0;
		$page['url'] = "{PROJECT_PAGES_BASE}".$alias.".html";
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

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_design` WHERE `alias` = '".$alias."' AND `projectid` = ".$id." AND `id` != $pageid");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		die('{"code": 1, "message": '.json_encode("文件名已存在！").'}');
	}

	$name = cn_substrR($name,20);
	$alias = cn_substrR($alias,20);
	$title = cn_substrR($title,100);
	$keywords = cn_substrR($keywords,100);
	$description = cn_substrR($description,200);

	$archives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "results");
	if(!$results){
		die('{"code": 1, "message": '.json_encode("页面不存在或已经删除，修改失败！").'}');
	}else{
		$alias = $results[0]['alias'] == "index" ? "index" : $alias;
		$sort  = $results[0]['sort'];
	}
	$archives = $dsql->SetQuery("UPDATE `#@__website_design` SET `name` = '$name', `alias` = '$alias', `title` = '$title', `keywords` = '$keywords', `description` = '$description' WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == "ok"){
		global $cfg_clihost;
		$page = array();
		$page['pageid'] = $pageid;
		$page['islink'] = 0;
		$page['url'] = $cfg_clihost."/website/".$projectid."/".$alias.".html";
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
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `appname` = '' AND `projectid` = ".$id);
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		foreach($pageResults as $key => $val){
			$pageArchives = $dsql->SetQuery("UPDATE `#@__website_design` SET `sort` = ".$sort[$val['id']]." WHERE `id` = ".$val['id']);
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
	$archives = $dsql->SetQuery("DELETE FROM `#@__website_design` WHERE `id` = ".$pageid);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == "ok"){
		die('{"code": 0, "message": '.json_encode("删除成功！").'}');
	}else{
		die('{"code": 1, "message": '.json_encode("删除失败！").'}');
	}

//拷贝页面
}elseif($action == "clonePage"){
	if(empty($pageid)) die('{"code": 1, "message": '.json_encode("页面ID传错误，操作失败！").'}');
	$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `id` = ".$pageid);
	$pageResults = $dsql->dsqlOper($pageArchives, "results");
	if($pageResults){
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_design` WHERE `projectid` = ".$id);
		$total = $dsql->dsqlOper($archives, "totalCount");
		$total++;

		$name = $pageResults[0]['name'];
		$alias = $pageResults[0]['alias'];
		$title = $pageResults[0]['title'];
		$keywords = $pageResults[0]['keywords'];
		$description = $pageResults[0]['description'];
		$pagedata = addslashes($pageResults[0]['pagedata']);

		$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `islink`, `title`, `keywords`, `description`, `pagedata`, `sort`, `pubdate`) VALUES ($id, '".$name."-拷贝', '".$alias."-".$total."', 0, '$title', '$keywords', '$description', '$pagedata', $total, ".GetMkTime(time()).")");
		$lastid = $dsql->dsqlOper($archives, "lastid");
		if(is_numeric($lastid)){
			global $cfg_clihost;
			$page = array();
			$page['pageid'] = $lastid;
			$page['islink'] = 0;
			$page['url'] = $cfg_clihost."/website/".$projectid."/".$alias."-".$total.".html";
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
			$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website_design` WHERE `id` = ".$key);
			$pageResults = $dsql->dsqlOper($pageArchives, "results");
			if($pageResults){
				$title = $pageResults[0]['name'];
				$pageArchives = $dsql->SetQuery("UPDATE `#@__website_design` SET `pagedata` = '".$value."' WHERE `id` = ".$key);
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
		$return["sizeListUrl"] = "/include/website.inc.php?action=imageditor&do=getPresetSizes";
		$return["ratioListUrl"] = "/include/website.inc.php?action=imageditor&do=getPresetRatio";
		$return["waterListUrl"] = "/include/website.inc.php?action=imageditor&do=getWatermarkSchemes";
		$return["saveUrl"] = "/include/website.inc.php?action=imageditor&do=saveImage&projectid=".$projectid;
		$return["readUrl"] = "/include/website.inc.php?action=imageditor&do=loadImage&projectid=".$projectid;
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

	require_once(HUONIAOINC."/config/website.inc.php");
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
	$fileArchives = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE 1 = 1".$where." AND `path` like '%website%' ORDER BY `id` DESC");
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

//自助建站模板分类
elseif($action == "websiteTempType"){

	$dsql = new dsql($dbo);
	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__website_temptype` WHERE `parentid` = 0 ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		echo $jsoncallback.'({"state": 100, "info": '.json_encode("获取成功！").', "list": '.json_encode($results).'})';
	}else{
		echo $jsoncallback.'({"state": 100, "info": '.json_encode("暂无相关信息！").'})';
	}
	die;

}

//自助建站模板列表
elseif($action == "websiteTempList"){
	$dsql = new dsql($dbo);
	$data = array();
	$pagesize = $pagesize == "" ? 20 : $pagesize;
	$page     = $page == "" ? 1 : $page;

	$where = !empty($type) ? " WHERE `type` = ".$type : "";
	$where .= " ORDER BY `weight` DESC, `id` DESC";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic` FROM `#@__website_temp`".$where);
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

//自助建站模板数据内容
elseif($action == "websiteTempDetail"){

	if(!empty($tempid)){
		$dsql = new dsql($dbo);
		$archives = $dsql->SetQuery("SELECT `html` FROM `#@__website_temp` WHERE `id` = ".$tempid);
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

//自助建站模板数据替换当前页面
elseif($action == "websiteTempReplace"){

	if(!empty($tempid)){
		$dsql = new dsql($dbo);

		//检查模板是否存在
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_temp` WHERE `id` = ".$tempid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			//检查模板是否有子页面
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_temp_pages` WHERE `tempid` = ".$tempid);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){

				//检查网站是否存在
				$pageArchives = $dsql->SetQuery("SELECT * FROM `#@__website` WHERE `id` = ".$projectid);
				$pageResults = $dsql->dsqlOper($pageArchives, "results");

				if($pageResults){

					//循环读取模板页面数据
					foreach($results as $key => $val){

						//先删除网站下面的页面
						$pageArchives = $dsql->SetQuery("DELETE FROM `#@__website_design` WHERE `alias` = '".$val["alias"]."' AND `projectid` = ".$id);
						$dsql->dsqlOper($pageArchives, "update");

						$name        = $val['name'];
						$alias       = $val['alias'];
						$islink      = $val['islink'];
						$title       = $val['title'];
						$keywords    = $val['keywords'];
						$description = $val['description'];
						$sort        = $val['sort'];
						$pagedata    = addslashes($val['pagedata']);
						$appname     = $val['appname'];
						$pubdate     = GetMkTime(time());

						$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `islink`, `title`, `keywords`, `description`, `sort`, `pagedata`, `appname`, `pubdate`) VALUES ('$id', '$name', '$alias', '$islink', '$title', '$keywords', '$description', '$sort', '$pagedata', '$appname', '$pubdate')");
						$dsql->dsqlOper($archives, "update");

					}

					echo $jsoncallback.'({"state": 100, "info": '.json_encode("操作成功！").'})';

				}else{
					echo $jsoncallback.'({"state": 200, "info": '.json_encode("网站不存在或已删除，请确认后重试！").'})';
				}

			}else{
				echo $jsoncallback.'({"state": 200, "info": '.json_encode("页面页面为空，操作失败！").'})';
			}

		}else{
			echo $jsoncallback.'({"state": 200, "info": '.json_encode("模板不存在，请确认后重试！").'})';
		}

	}else{
		echo $jsoncallback.'({"state": 200, "info": '.json_encode("数据传递错误，操作失败！").'})';
	}
	die;

}

//新闻分类
elseif($action == "articleType"){

	$pagesize = $num == "" ? 1000 : $num;
	$page     = $page == "" ? 1 : $page;

	$atpage = $pagesize*($page-1);
	$where = " LIMIT $atpage, $pagesize";

	$typeListArr = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__website_articletype` WHERE `website` = $id ORDER BY `weight` ASC, `id` ASC".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$typeListArr[$key]['catid'] = $val['id'];
			$typeListArr[$key]['sortid'] = $val['weight'];
			$typeListArr[$key]['catname'] = $val['name'];

			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_article` WHERE `website` = $id AND `typeid` = ".$val['id']);
			$results = $dsql->dsqlOper($archives, "totalCount");
			$typeListArr[$key]['count'] = $results;
		}
	}

	if(!empty($jsoncallback)){
		echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($typeListArr).'})';
	}else{
		echo json_encode($typeListArr);
	}

}

//新闻列表
elseif($action == "articleList"){

	//模板演示数据
	if($type == "template"){

		$list = array(
			array(
				"id"      => 1,
				"title"   => "央行“加息”的心思要弄懂",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_1.jpg",
				"summary" => "间接利率调整工具比直接调整手段，对市场要平稳平缓很多，对市场带来的冲击与波动较小。",
				"addtime" => "2017-02-09 16:39:15"
			),
			array(
				"id"      => 2,
				"title"   => "王俊凯不是走红后参加艺考第一人，明星艺考趣事盘点",
				"catid"   => 2,
				"catname" => "明星八卦",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_2.jpg",
				"summary" => "王俊凯艺考备受关注，但他其实并不是成名后艺考的第一人，很多前辈身上都发生过不少趣事。",
				"addtime" => "2017-02-08 08:41:21"
			),
			array(
				"id"      => 3,
				"title"   => "雷军：我说小米销售额目标破1千亿 有人说是放卫星",
				"catid"   => 3,
				"catname" => "科技人物",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_3.jpg",
				"summary" => "雷军指出，包括今年提了个小目标，销售额突破1千亿，也有人小米放卫星，但从小米的基本功来讲，这个小目标达成不算难。",
				"addtime" => "2017-02-09 16:39:15"
			),
			array(
				"id"      => 4,
				"title"   => "滴滴再遇麻烦 广东出台办法将网约车纳入出租车管理",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_4.jpg",
				"summary" => "网约车已经被广东省明确认定为出租车，需按照《广东省出租汽车管理办法》进行管理。",
				"addtime" => "2017-02-09 09:51:15"
			),
			array(
				"id"      => 5,
				"title"   => "李泽楷30亿卖掉亏损公司 李嘉诚为子接盘",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_5.jpg",
				"summary" => "有钱就是会玩",
				"addtime" => "2017-02-09 08:33:45"
			),
			array(
				"id"      => 6,
				"title"   => "京津冀小县城里的人们内心呼声：房子到底是什么？",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_6.jpg",
				"summary" => "消费升级恐怕将成为2017年最火的关键词之一，所有的企业家几乎都在寻找、观察老百姓的消费心理和消费行为究竟发生了怎样的变化？新商机究竟在一线城市还是在二三四线城市？",
				"addtime" => "2017-02-09 06:54:36"
			),
			array(
				"id"      => 7,
				"title"   => "美国一用户戴尔笔记本连炸四次，或又因锂电池",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_7.jpg",
				"summary" => "三星炸，三星炸完苹果炸，苹果炸完戴尔连环炸！还都跟锂电池脱不了干系！",
				"addtime" => "2017-02-09 05:42:18"
			),
			array(
				"id"      => 8,
				"title"   => "民宿泡沫近破灭 资本蜂拥将催生海量“美丽鬼屋”？",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_8.jpg",
				"summary" => "“95% 的民宿都在亏损！”——这是某民宿业者在接受TBO采访时出具的说法，相较于业内流传的80%不盈利的说法更为极端。而“围城”，已经成了当前行业内外在认知对立上最真实的写照。",
				"addtime" => "2017-02-09 00:13:44"
			),
			array(
				"id"      => 9,
				"title"   => "直男癌争议与韩寒式情怀为票房带来了什么？",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_9.jpg",
				"summary" => "尽管《乘风破浪》争议重重，营销老司机韩寒也不小心轮胎打滑，但这部电影的表现总体上来说是成功的，它依然有足够的魅力将观众吸引到自己面前。",
				"addtime" => "2017-02-08 20:10:22"
			),
			array(
				"id"      => 10,
				"title"   => "为什么赵雷火了你却觉得空落落了？",
				"catid"   => 2,
				"catname" => "明星八卦",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_10.jpg",
				"summary" => "优越与失落",
				"addtime" => "2017-02-08 19:20:37"
			),
			array(
				"id"      => 11,
				"title"   => "Apple TV引入亚马逊高管 苹果或将重启电视业务",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_11.jpg",
				"summary" => "近年苹果的Apple TV业务尽显颓势，而亚马逊的Fire TV则被称为美国最畅销的机顶盒。结合苹果公司近期的举动，这次聘请前亚马逊Fire TV部门主管、流媒体视频“老司机”Twerdahl是否有所暗示呢？",
				"addtime" => "2017-02-08 18:54:28"
			),
			array(
				"id"      => 12,
				"title"   => "郭敬明与韩寒：一个用文艺装逼 另一个用情怀在打架",
				"catid"   => 2,
				"catname" => "明星八卦",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_12.jpg",
				"summary" => "如果说郭敬明是亲身在践行小时代里的奢华生活，那韩寒骨子里就流淌着小镇青年的热血。当然，他们都懂得用艺术性的表达方式，一个用文艺在装逼，另一个用情怀在打架。",
				"addtime" => "2017-02-08 14:15:28"
			),
			array(
				"id"      => 13,
				"title"   => "我无比捍卫你好好看电影的权利，除了打人",
				"catid"   => 2,
				"catname" => "明星八卦",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_13.jpg",
				"summary" => "人呐，戾气还是别太重",
				"addtime" => "2017-02-08 11:55:56"
			),
			array(
				"id"      => 14,
				"title"   => "肖锋：马云扬名达沃斯论坛，为何却遭国人痛骂？",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_14.jpg",
				"summary" => "中国过去十年能跑赢全球化和印钞机的，只有一线城市核心地段的房价和上海车牌、虫草价格，还有少数资本玩家、BAT巨头。",
				"addtime" => "2017-02-08 11:08:34"
			),
			array(
				"id"      => 15,
				"title"   => "百亿财政补贴打水漂 新能源发电已成为集体骗局？",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_15.jpg",
				"summary" => "政策催生的大跃进",
				"addtime" => "2017-02-08 07:54:29"
			),
			array(
				"id"      => 16,
				"title"   => "算笔账 外汇储备的底线在哪里？",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_16.jpg",
				"summary" => "昨天，外汇储备3万亿关口失守！中国1月份外汇储备2.998万亿美元，连续七连跌，并创2011年2月以来新低。于是有人惊呼了，外汇储备危险了？那么真的如此吗？",
				"addtime" => "2017-02-08 08:53:29"
			),
			array(
				"id"      => 17,
				"title"   => "《锦绣未央》被指抄袭，《三生三世》还安全吗？",
				"catid"   => 2,
				"catname" => "明星八卦",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_17.jpg",
				"summary" => "人才是小偷，那这个行业就完蛋了。",
				"addtime" => "2017-02-08 01:20:24"
			),
			array(
				"id"      => 18,
				"title"   => "特朗普好不容易“招安”的硅谷大佬们 又跟他翻脸了",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_18.jpg",
				"summary" => "从竞选时全硅谷不到3%的支持率，到后来出乎意料的成功当选。硅谷这些个坐拥数千亿美元的大佬们似乎一直都站在特朗普的对立面。",
				"addtime" => "2017-02-07 22:45:45"
			),
			array(
				"id"      => 19,
				"title"   => "超级碗背后的科技商业鏖战 春晚相比就小儿科了",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_19.jpg",
				"summary" => "一场体育盛宴、一场广告盛宴、一场娱乐盛宴，科技与商业在此交融。狂欢的背后，是科技和商业巨头们的角逐。",
				"addtime" => "2017-02-07 20:13:38"
			),
			array(
				"id"      => 20,
				"title"   => "外汇储备6年来首次跌破3万亿，外汇局说这是第一原因",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_20.jpg",
				"summary" => "截至2017年1月31日，我国外汇储备跌破3万亿美元，为29982亿美元。这是中国外汇储备连续第七个月下滑，创2011年2月以来新低。",
				"addtime" => "2017-02-07 19:43:24"
			),
			array(
				"id"      => 21,
				"title"   => "腾讯的「黄金红包」何以一战成名？",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_21.jpg",
				"summary" => "黑天鹅乱飞的这一年，腾讯在微信里强推「黄金红包」，应景得实在是太明显。",
				"addtime" => "2017-02-07 18:01:33"
			),
			array(
				"id"      => 22,
				"title"   => "力压华为支付宝女掌门 董明珠最杰出商界女性有争议",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_22.jpg",
				"summary" => "董明珠这次却力压华为董事长孙亚芳和蚂蚁金服董事长彭蕾，确实还是多少有些意外。",
				"addtime" => "2017-02-07 17:34:42"
			),
			array(
				"id"      => 23,
				"title"   => "中国楼市在可见未来不可能崩盘",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_23.jpg",
				"summary" => "商品房是政府回笼货币的大杀器。政府有意愿、有能力阻止楼市崩盘。",
				"addtime" => "2017-02-07 10:19:16"
			),
			array(
				"id"      => 24,
				"title"   => "够了！锻炼人工智能不能再靠暴力填鸭",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_24.jpg",
				"summary" => "这类模式识别系统是不是一条正确的路径，能否带领我们我们走向更先进、更可靠的人工智能？",
				"addtime" => "2017-02-07 10:03:38"
			),
			array(
				"id"      => 25,
				"title"   => "小米手机跌出前五 吃下过度多元化苦果",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_25.jpg",
				"summary" => "世界上，有没有万能的企业？答案肯定是否定的。但是世界上却有许多认为自己万能的企业家与企业家。",
				"addtime" => "2017-02-07 09:56:26"
			),
			array(
				"id"      => 26,
				"title"   => "联想移动：与其高层频调无果不如断腕拆分？",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_26.jpg",
				"summary" => "近日，联想集团高级副总裁、MBG联席总裁乔健发布内部公开信称，联想集团将任命来自三星的姜震(Jaden)为副总裁，全面负责MBG(移动业务集团)中国业务的产品策略及产品管理，包括产品组合、产品规划和运营。",
				"addtime" => "2017-02-07 08:00:24"
			),
			array(
				"id"      => 27,
				"title"   => "马化腾、任正非用“灰度”捕捉新商业机会",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_27.jpg",
				"summary" => "我们处在瞬息万变的变革时代",
				"addtime" => "2017-02-07 00:18:28"
			),
			array(
				"id"      => 28,
				"title"   => "低价旅行团真相：亏钱买团与赌团原来是这么回事！",
				"catid"   => 1,
				"catname" => "金融经济",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_28.jpg",
				"summary" => "由于旅行社开办门槛低，加上线上平台的冲击，目前整个行业的呈现越来越激烈的竞争态势，也因此，许多不合规现象，包括组团社低价招揽客人、地接社倒贴“买团”。",
				"addtime" => "2017-02-06 15:51:18"
			),
			array(
				"id"      => 29,
				"title"   => "用数据说话：自动驾驶技术哪家强？",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_29.jpg",
				"summary" => "截止到今年 1 月，美国加州已经给 21 家公司颁发了自动驾驶路测牌照。这些公司需提交一份当年的测试报告。最近，加州 DMV 公布了 11 家公司提交的 2016 年度自动驾驶路测报告。",
				"addtime" => "2017-02-06 11:52:57"
			),
			array(
				"id"      => 30,
				"title"   => "境外堂而皇之“打劫”国人的本事 中免集团算条汉子",
				"catid"   => 4,
				"catname" => "互联网",
				"image"   => "http://ihuoniao.cn/uploads/website/temp/litpic_30.jpg",
				"summary" => "事实上，从去年开始中免集团就提速境外布局步伐，在国人境外大把撒钱购物的大趋势下，仔细想来，能够堂而皇之在境外“打劫”国人，肥水不流外人田的，也就中免集团这条汉子了。",
				"addtime" => "2017-02-06 11:34:59"
			)
		);

		//分类筛选
		if($catid){
			$nlist = array();
			foreach ($list as $key => $value) {
				if($value['catid'] == $catid){
					array_push($nlist, $value);
				}
			}
			$list = $nlist;
		}

		$total    = count($list);
		$pagesize = $num == "" ? 10 : $num;
		$page     = empty($page) ? 1 : $page;
		$page     = ($page - 1) * $pagesize;
		$totalPage = ceil($total/$pagesize);

		$list = array_slice($list, $page, $pagesize);
		echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		die;
	}

	$dsql = new dsql($dbo);
	$where = "";
	if(!empty($catid)){
		$where .= " AND `typeid` = $catid";
	}

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `pubdate` FROM `#@__website_article` WHERE `website` = $id".$where);
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `pubdate` FROM `#@__website_article` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['catid'] = $val['typeid'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];

				$archives = $dsql->SetQuery("SELECT `name` FROM `#@__website_articletype` WHERE `id` = ".$val['typeid']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$list[$key]['catname'] = $results[0]['name'];
				}else{
					$list[$key]['catname'] = "";
				}

				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

}

//产品分类
elseif($action == "productType"){

	$pagesize = $num == "" ? 1000 : $num;
	$page     = $page == "" ? 1 : $page;

	$atpage = $pagesize*($page-1);
	$where = " LIMIT $atpage, $pagesize";

	$typeListArr = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__website_producttype` WHERE `website` = $id ORDER BY `weight` ASC, `id` ASC".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$typeListArr[$key]['catid'] = $val['id'];
			$typeListArr[$key]['sortid'] = $val['weight'];
			$typeListArr[$key]['catname'] = $val['name'];

			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_product` WHERE `website` = $id AND `typeid` = ".$val['id']);
			$results = $dsql->dsqlOper($archives, "totalCount");
			$typeListArr[$key]['count'] = $results;
		}
	}

	if(!empty($jsoncallback)){
		echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($typeListArr).'})';
	}else{
		echo json_encode($typeListArr);
	}

}

//产品列表
elseif($action == "productList"){
	$dsql = new dsql($dbo);
	$where = "";
	if(!empty($catid)){
		$where .= " AND `typeid` = $catid";
	}

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `pubdate` FROM `#@__website_product` WHERE `website` = $id".$where);
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `pubdate` FROM `#@__website_product` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['catid'] = $val['typeid'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];

				$archives = $dsql->SetQuery("SELECT `name` FROM `#@__website_producttype` WHERE `id` = ".$val['typeid']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$list[$key]['catname'] = $results[0]['name'];
				}else{
					$list[$key]['catname'] = "";
				}

				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

}

//活动列表
elseif($action == "eventList"){
	$dsql = new dsql($dbo);
	$where = "";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_events` WHERE `website` = $id");
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_events` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];
				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

}

//案例列表
elseif($action == "caseList"){
	$dsql = new dsql($dbo);
	$where = "";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_events` WHERE `website` = $id");
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_case` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];
				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

}

//视频列表
elseif($action == "videoList"){
	$dsql = new dsql($dbo);
	$where = "";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_events` WHERE `website` = $id");
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_video` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];
				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

}

//全景列表
elseif($action == "360qjList"){
	$dsql = new dsql($dbo);
	$where = "";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_events` WHERE `website` = $id");
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `description`, `pubdate` FROM `#@__website_360qj` WHERE `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];
				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;

//留言列表
}elseif($action == "guestList"){
	$dsql = new dsql($dbo);
	$where = "";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_guest` WHERE `state` = 1 AND `website` = $id");
	$total = $dsql->dsqlOper($archives, "totalCount");

	$pagesize = $num == "" ? 10 : $num;
	$page     = $page == "" ? 1 : $page;
	$totalPage = ceil($total/$pagesize);

	$atpage = $pagesize*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagesize";

	$archives = $dsql->SetQuery("SELECT * FROM `#@__website_guest` WHERE `state` = 1 AND `website` = $id".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		if(!empty($jsoncallback)){
			$list = array();
			foreach($results as $key => $val){
				$list[$key]['people'] = $val['people'];
				$list[$key]['note'] = $val['note'];
				$list[$key]['reply'] = $val['reply'];
				$list[$key]['date'] = date("Y-m-d H:i:s", $val['pubdate']);
			}
			echo $jsoncallback.'({"code": 0, "message": "", "data": '.json_encode($list).', "total": '.$total.', "totalPage": '.$totalPage.'})';
		}else{
			echo $results;
		}
	}else{
		echo !empty($jsoncallback) ? $jsoncallback.'({"code": 1, "message": '.json_encode("暂无数据！").'})' : "暂无数据！";
	}

	die;


//提交留言
}elseif($action == "guestAdd"){
	$dsql = new dsql($dbo);

	if(empty($user)){
		die('{"state": 200, "info": '.json_encode("请输入您的姓名！").'}');
	}
	if(empty($contact) && empty($email)){
		die('{"state": 200, "info": '.json_encode("请输入您的联系方式！").'}');
	}
	if($email){
		preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $email, $matchEmail);
		if(!$matchEmail){
			die('{"state": 200, "info": '.json_encode("请输入正确的邮箱地址！").'}');
		}
	}
	if(empty($content)){
		die('{"state": 200, "info": '.json_encode("请输入留言内容！").'}');
	}

	$user    = filterSensitiveWords(addslashes($user));
	$contact = filterSensitiveWords(addslashes($contact));
	$content = filterSensitiveWords(addslashes($content));

	$archives = $dsql->SetQuery("INSERT INTO `#@__website_guest` (`website`, `people`, `contact`, `email`, `ip`, `ipaddr`, `note`, `state`, `pubdate`) VALUES ('$id', '$user', '$contact', '$email', '".GetIP()."', '".getIpAddr(GetIP())."', '$content', '0', '".GetMkTime(time())."')");
	$results = $dsql->dsqlOper($archives, "update");
	if($results == "ok"){
		die('{"state": 100, "info": '.json_encode("留言成功！").'}');
	}else{
		die('{"state": 200, "info": '.json_encode("留言失败！").'}');
	}

}
?>
