<?php
/**
 * 添加信息
 *
 * @version        $Id: quanjingAdd.php 2018-6-6 下午16:43:15 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/quanjing";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "quanjingAdd.html";

if($action == ""){
	$action = "quanjing";
}

$dotitle = "全景";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("editquanjing");
}else{
	checkPurview("quanjingAdd");
}

// 删除全景文件
if($action == "delQuanjing"){
	$file = $_POST['file'];
	if($file){
		$file = HUONIAOROOT.$file;
		if(!file_exists($file)) {
			echo '{"state": 200, "info": "文件不存在或已被删除，请重新上传！"}';
			exit();
		}else{
			// 遍历解压包
			$filePath = dirname($file);
       		removeDir($filePath);
		}
	}
	echo '{"state": 100, "info": "文件已删除"}';
	exit();
}


$pagetitle     = "发布信息";

if($submit == "提交"){
	@set_time_limit(0);  // 修改为不限制超时时间(默认为30秒)

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

	$file = $_POST['file'];


	//获取当前管理员
	$adminid = $userLogin->getUserID();
}
if(empty($click)) $click = mt_rand(50, 200);

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

//自定义属性-多选
$huoniaoTag->assign('flag',array('h','r','b'));
$huoniaoTag->assign('flagList',array('头条[h]','推荐[r]','加粗[b]'));

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

		$quanjingtype = (int)$typeidArr;

		$file = $litpic;
		if($typeidArr == 0){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景图片"}';
				exit();
			}
		}elseif($typeidArr == 1){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景文件"}';
				exit();
			}
		}elseif($typeidArr == 2){
			if(trim($url) == ''){
				echo '{"state": 200, "info": "请输入URL地址"}';
				exit();
			}
			$file = $url;
		}elseif($typeidArr == 3){

			$is_new_zip = true;

			if(trim($zipname) == ''){
				echo '{"state": 200, "info": "请上传zip压缩包！"}';
				exit();
			}
			$RenrenCrypt = new RenrenCrypt();
			$zipid = $RenrenCrypt->php_decrypt(base64_decode($zipname));
			if(!is_numeric($zipid)){
				$file = HUONIAOROOT.$zipname;
				if(!file_exists($file)) {
					echo '{"state": 200, "info": "文件不存在或已被删除，请重新上传！"}';
	    			exit();
				}else{
					$file = $zipname;
					$is_new_zip = false;
				}
			}

			if($is_new_zip){

				$sql = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `id` = '$zipid'");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$zipfile_ = $ret[0]['path'];
				}else{
					echo '{"state": 200, "info": "zip压缩包不存在，请重新上传！"}';
	    			exit();
				}

				$zipfile = HUONIAOROOT.$cfg_uploadDir.$zipfile_;
				$zipname = basename($zipfile);
				$filetype = pathinfo($zipfile,PATHINFO_EXTENSION);
				if($filetype != 'zip'){
					echo '{"state": 200, "info": "请上传zip格式压缩包！"}';
	    			exit();
				}

				$file = $cfg_uploadDir.str_replace(".".$filetype, "", $zipfile_);
				$savepath  = HUONIAOROOT.$file;

				// echo $savepath;die;

		        if(!file_exists($zipfile)) {
		        	echo '{"state": 200, "info": "zip压缩包不存在，请重新上传！"}';
	    			exit();
		        }

		        $zip = new ZipArchive;
		        if($zip->open($zipfile) === TRUE){
		        	$zip->extractTo($savepath);
		       		$zip->close();
		       		// 遍历解压包
		       		$fileList = traverseFloder($savepath);
		       		$files = "";
		    		foreach($fileList as $k => $listf){
		    			$listf = iconv("UTF-8", "gb2312", $listf);
		    			$name = basename($listf);
		    			if(strpos($name, "index") !== false){
		    				$files = $name;
		    				break;
		    			}
		    			$k == 0 && $files = $name;
		    		}
		    		$file .= '/'.$files;

		        }else{
		        	echo '{"state": 200, "info": "解压失败，请检查服务器配置！"}';
					exit();
		        }

				unlinkFile($zipfile); //删除压缩包

			}

        }elseif($typeidArr == 4) {
            if (trim($quanjingPic) == '') {
                echo '{"state": 200, "info": "请上传全景图片"}';
                exit();
            }
            $file = $quanjingPic;
		}

		$litpic = $litpic_;

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `cityid` = '$cityid', `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `redirecturl` = '$redirecturl', `weight` = '$weight', `litpic` = '$litpic', `source` = '$source', `sourceurl` = '$sourceurl', `quanjingtype` = '$quanjingtype', `file` = '$file', `writer` = '$writer', `typeid` = '$typeid', `keywords` = '$keywords', `description` = '$description', `click` = '$click', `color` = '$color', `arcrank` = '$arcrank', `pubdate` = '$pubdate' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		adminLog("修改".$dotitle."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("quanjing",$id);  // 更新全景
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title        = $results[0]['title'];
				$subtitle     = $results[0]['subtitle'];
				$typeid       = $results[0]['typeid'];
				$flagitem     = explode(",", $results[0]['flag']);
				$flags        = $results[0]['flag'];
				$redirecturl  = $results[0]['redirecturl'];
				$weight       = $results[0]['weight'];
				$litpic       = $results[0]['litpic'];
				$source       = $results[0]['source'];
				$sourceurl    = $results[0]['sourceurl'];
				$quanjingtype = $results[0]['quanjingtype'];
				$file         = $results[0]['file'];
				$writer       = $results[0]['writer'];
				$keywords     = $results[0]['keywords'];
				$description  = $results[0]['description'];
				$notpost      = $results[0]['notpost'];
				$click        = $results[0]['click'];
				$color        = $results[0]['color'];
				$arcrank      = $results[0]['arcrank'];
				$pubdate      = date('Y-m-d H:i:s', $results[0]['pubdate']);
				$cityid       = $results[0]['cityid'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
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

		$quanjingtype = (int)$typeidArr;

		$file = $litpic;
		if($typeidArr == 0){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景图片"}';
				exit();
			}
		}elseif($typeidArr == 1){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景文件"}';
				exit();
			}
		}elseif($typeidArr == 2){
			if(trim($url) == ''){
				echo '{"state": 200, "info": "请输入URL地址"}';
				exit();
			}
			$file = $url;
		}elseif($typeidArr == 3){

			if(trim($zipname) == ''){
				echo '{"state": 200, "info": "请上传zip压缩包！"}';
				exit();
			}
			$RenrenCrypt = new RenrenCrypt();
			$zipid = $RenrenCrypt->php_decrypt(base64_decode($zipname));

			$sql = $dsql->SetQuery("SELECT `path` FROM `#@__attachment` WHERE `id` = '$zipid'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$zipfile_ = $ret[0]['path'];
			}else{
				echo '{"state": 200, "info": "zip压缩包不存在，请重新上传！"}';
    			exit();
			}

			$zipfile = HUONIAOROOT.$cfg_uploadDir.$zipfile_;
			$zipname = basename($zipfile);
			$filetype = pathinfo($zipfile,PATHINFO_EXTENSION);
			if($filetype != 'zip'){
				echo '{"state": 200, "info": "请上传zip格式压缩包！"}';
    			exit();
			}

			$file = $cfg_uploadDir.str_replace(".".$filetype, "", $zipfile_);
			$savepath  = HUONIAOROOT.$file;

			// echo $savepath;die;

	        if(!file_exists($zipfile)) {
	        	echo '{"state": 200, "info": "zip压缩包不存在，请重新上传！"}';
    			exit();
	        }

	        $zip = new ZipArchive;
	        if($zip->open($zipfile) === TRUE){
	        	$zip->extractTo($savepath);
	       		$zip->close();
	       		// 遍历解压包
	       		$fileList = traverseFloder($savepath);
	       		$files = "";
	    		foreach($fileList as $listf){
	    			$listf = iconv("UTF-8", "gb2312", $listf);
	    			$name = basename($listf);
	    			if(strpos($name, "index") !== false){
	    				$files = $name;
	    				break;
	    			}
	    			$files = $files ? $files : $name;
	    		}
	    		$file .= '/'.$files;

	        }else{
	        	echo '{"state": 200, "info": "解压失败，请检查服务器配置！"}';
				exit();
	        }

			unlinkFile($zipfile); //删除压缩包

		}elseif($typeidArr == 4) {
            if (trim($quanjingPic) == '') {
                echo '{"state": 200, "info": "请上传全景图片"}';
                exit();
            }
            $file = $quanjingPic;
        }

		$litpic = $litpic_;

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."list` (`cityid`, `title`, `subtitle`, `flag`, `redirecturl`, `weight`, `litpic`, `source`, `sourceurl`, `quanjingtype`, `file`, `writer`, `typeid`, `keywords`, `description`, `click`, `color`, `arcrank`, `pubdate`, `admin`) VALUES ('$cityid', '$title', '$subtitle', '$flags', '$redirecturl', '$weight', '$litpic', '$source', '$sourceurl', '$quanjingtype', '$file', '$writer', '$typeid', '$keywords', '$description', '$click', '$color', '$arcrank', '$pubdate', '$adminid')");

		$aid = $dsql->dsqlOper($archives, "lastid");

		adminLog("添加".$dotitle."信息", $title);

		$param = array(
			"service"     => "quanjing",
			"template"    => "detail",
			"id"          => $aid,
			"flag"        => $flags
		);
		$url = getUrlPath($param);
        dataAsync("quanjing",$aid); // 新增全景
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
		'admin/quanjing/quanjingAdd.js'
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
	$huoniaoTag->assign('file', $file);
	$huoniaoTag->assign('fileUrl', getFilePath($file));
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


	//全景类型
	$huoniaoTag->assign('quanjingtypeArr', array('0', '1', '2', '3', '4'));
	$huoniaoTag->assign('quanjingtypeNames',array('六图片','swf','url', 'zip压缩包', '一张图'));
	$huoniaoTag->assign('quanjingtype', (int)$quanjingtype);



	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/quanjing";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//遍历文件夹
function traverseFloder($path = '.', $searchChild = false) {
	$fileList = array();
	$current_dir = opendir($path);    //opendir()返回一个目录句柄,失败返回false
	while(($file = readdir($current_dir)) !== false) {    //readdir()返回打开目录句柄中的一个条目
		$sub_dir = $path . "/" . $file;    //构建子目录路径
		if($file == '.' || $file == '..') {
			continue;
		} else if(is_dir($sub_dir)) {
			if($searchChild){
				$fileList[] = $sub_dir."/";
				$fileList[] = traverseFloder($sub_dir);
			}else{
				continue;
			}
		} else {
			$fileList[] = $sub_dir;
		}
	}
	return $fileList;
}
//遍历多维数组为一维数组
function singelArray($arr) {
	static $data;
	if (!is_array ($arr) && $arr != NULL) {
		return $data;
	}
	foreach ($arr as $key => $val ) {
		if (is_array ($val)) {
			singelArray ($val);
		} else {
			if($val != NULL){
				$data[]=$val;
			}
		}
	}
	return $data;
}

// 删除非空目录的解决方案
function removeDir($dirName)
{
    if(! is_dir($dirName))
    {
        return false;
    }
    $handle = @opendir($dirName);
    while(($file = @readdir($handle)) !== false)
    {
        if($file != '.' && $file != '..')
        {
            $dir = $dirName . '/' . $file;
            is_dir($dir) ? removeDir($dir) : unlinkFile($dir);
        }
    }
    closedir($handle);

    return rmdir($dirName) ;
}
