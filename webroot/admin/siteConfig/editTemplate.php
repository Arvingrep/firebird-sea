<?php
/**
 * 编辑模板
 *
 * @version        $Id: editTemplate.php 2016-9-23 上午10:51:10 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "editTemplate.html";
$dir = HUONIAOROOT."/templates/".$action;


//获取文件内容
if($do == "getFileContent"){

	if(empty($action) || empty($template) || empty($filetype) || empty($editfile)){
		die('{"state":"200","info":'.json_encode("信息传递失败，请重试！").'}');
	}

	//文件路径
	$filePath = dirname(__FILE__) . "/../../templates/" . $action . ($touch ? "/touch" : "") . "/" . ($template == "public" || $template == "member" ? "" : $template) . ($filetype == "html" ? "" : "/".$filetype) . "/" . $editfile;

	//如果是编辑公共资源，需要单独配置
	if($template == "public" && $action == "siteConfig" && ($filetype == "css" || $filetype == "js")){
		$filePath = HUONIAOROOT."/static/".$filetype."/".$editfile;
	}

	if($action == "member" && $touch && $template == "company"){
		$filePath = dirname(__FILE__) . "/../../templates/member/company/touch/" . ($filetype == "html" ? "" : "/".$filetype) . "/" . $editfile;
	}

	if(file_exists($filePath)){

		$fp = @fopen($filePath,'r');
		$str = @fread($fp,filesize($filePath));
		@fclose($fp);

		if(!empty($str)){

			die('{"state":"100","info":'.json_encode($str).'}');

		}else{
			die('{"state":"200","info":'.json_encode("文件读取失败！").'}');
		}


	}else{
		die('{"state":"200","info":'.json_encode("文件不存在，获取失败！").'}');
	}

	die;


//修改文件内容
}elseif($do == "save"){

	$action   = $edit_action;
	$template = $edit_template;
	$filetype = $edit_filetype;
	$editfile = $edit_editfile;
	$touch    = $edit_touch;
	// $content  = stripslashes($_POST['edit_content']);
	$content  = $_POST['edit_content'];

	if(empty($action) || empty($template) || empty($filetype) || empty($editfile)){
		die('{"state":"200","info":'.json_encode("信息传递失败，请重试！").'}');
	}

	//文件路径
	$filePath = dirname(__FILE__) . "/../../templates/" . $action . ($touch ? "/touch" : "") . "/" . ($template == "public" || $template == "member" ? "" : $template) . ($filetype == "html" ? "" : "/".$filetype) . "/" . $editfile;

	if($action == "member" && $touch && $template == "company"){
		$filePath = dirname(__FILE__) . "/../../templates/member/company/touch/" . ($filetype == "html" ? "" : "/".$filetype) . "/" . $editfile;
	}

	//如果是编辑公共资源，需要单独配置
	if($template == "public" && ($filetype == "css" || $filetype == "js")){
		$filePath = HUONIAOROOT."/static/".$filetype."/".$editfile;
	}

	if(file_exists($filePath)){

		$fp = @fopen($filePath, "w") or die('{"state":"200","info":'.json_encode("文件写入失败，请检查是否有写入权限！").'}');
		@fwrite($fp, $content);
		@fclose($fp);

		adminLog("修改模板", $action."=>".($touch ? '移动端' : '电脑端')."[" . $template."]=>".$editfile);

		die('{"state":"100","info":'.json_encode("修改成功！").'}');

	}else{
		die('{"state":"200","info":'.json_encode("文件不存在，获取失败！").'}');
	}
	die;
}


if(empty($action) || empty($template)) die('信息传递失败！');

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/codemirror/codemirror.js',
		'ui/codemirror/active-line.js',
		'ui/codemirror/xml-fold.js',
		'ui/codemirror/matchtags.js',
		'ui/codemirror/xml.js',
		'ui/codemirror/closebrackets.js',
		'ui/codemirror/javascript.js',
		'ui/codemirror/fullscreen.js',
		'ui/codemirror/closetag.js',
		'ui/codemirror/css.js',
		'ui/codemirror/htmlmixed.js',
		'ui/codemirror/foldcode.js',
		'ui/codemirror/foldgutter.js',
		'ui/codemirror/brace-fold.js',
		'ui/codemirror/markdown-fold.js',
		'ui/codemirror/comment-fold.js',
		'ui/codemirror/dialog.js',
		'ui/codemirror/search.js',
		'ui/codemirror/jump-to-line.js',
		'ui/codemirror/markdown.js',
		'ui/codemirror/annotatescrollbar.js',
		'ui/codemirror/matchesonscrollbar.js',
		'ui/codemirror/searchcursor.js',
		'ui/codemirror/match-highlighter.js',
		'admin/siteConfig/editTemplate.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('template', $template);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('touch', $touch);




	//读取文件内容
	$filePath = dirname(__FILE__) . "/../../templates/" . $action . ($touch ? "/touch" : "") . "/" . ($template == "public" || $template == "member" ? "" : $template);
	if($action == "member" && $touch && $template == "company"){
		$filePath = dirname(__FILE__) . "/../../templates/member/company/touch";
	}
	if(is_dir($filePath)){

		//模板文件
		if($file = @opendir($filePath)){
			$htmlArray = array();
			while ($f = readdir($file)){
				if($f != '.' && $f != '..' && $f != 'config.xml' && $f != 'preview.jpg' && $f != 'preview_large.jpg'){
					if(!is_dir($filePath."/".$f)){
						array_push($htmlArray, $f);
					}
				}
			}
			sort($htmlArray);
			$huoniaoTag->assign('htmlArray', $htmlArray);
		}

		//样式
		$cssPath = $filePath."/css";
		if($template == "public" && $action == "siteConfig"){
			$cssPath = HUONIAOROOT."/static/css";
		}
		if($file = @opendir($cssPath)){
			$cssArray = array();
			while ($f = readdir($file)){
				if($f != '.' && $f != '..'){
					if(!is_dir($cssPath."/".$f)){
						array_push($cssArray, $f);
					}
				}
			}
			sort($cssArray);
			$huoniaoTag->assign('cssArray', $cssArray);
		}

		//脚本
		$jsPath = $filePath."/js";
		if($template == "public" && $action == "siteConfig"){
			$jsPath = HUONIAOROOT."/static/js";
		}
		if($file = @opendir($jsPath)){
			$jsArray = array();
			while ($f = readdir($file)){
				if($f != '.' && $f != '..'){
					if(!is_dir($jsPath."/".$f)){
						array_push($jsArray, $f);
					}
				}
			}
			sort($jsArray);
			$huoniaoTag->assign('jsArray', $jsArray);
		}


	}else{
		die('模板不存在，请确认后重试！');
	}


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
