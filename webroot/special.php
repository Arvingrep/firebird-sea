<?php
/**
 * 专题展示页面
 *
 * @version        $Id: special.php 2014-5-30 下午14:49:21 $
 * @package        HuoNiao.Special
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
require_once('./include/common.inc.php');
global $cfg_softname;
$dsql  = new dsql($dbo);
$cycle = "aaab";
$tab = "special_design";
$alias = !empty($alias) ? $alias : "index";

//专题ID解密
// $RenrenCrypt = new RenrenCrypt();
// $projectid = (int)$RenrenCrypt->php_decrypt(base64_decode($id));
// if(empty($projectid)) die("参数传递错误，访问失败！");

$projectid = $id;

if(!$projectid){
    header("location:".$cfg_basedomain."/404.html");
    die;
}

//验证专题
$archives = $dsql->SetQuery("SELECT `id`, `title`, `note`, `head`, `footer`, `litpic` FROM `#@__special` WHERE `id` = $projectid AND `state` = 1");
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("<center><br /><br />专题不存在或已删除，请确认后再访问！<br /><br />專題不存在或已刪除，請確認後再訪問！<br /><br />Topic not exist or deleted, please confirm and visit again!</center>");
$head = $results[0]['head'];
$footer = $results[0]['footer'];
$speTitle = $results[0]['title'];
$speNote = $results[0]['note'];
$litpic = $results[0]['litpic'];

//验证页面
$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `alias` = '".$alias."' AND `projectid` = $projectid");
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("<center><br /><br />专题页面不存在，请确认后再访问！<br /><br />專題頁面不存在，請確認後再訪問！<br /><br />The topic page does not exist. Please confirm and visit it again!</center>");

$name        = $results[0]['name'];
$pageTitle   = $results[0]['title'];
$keywords    = $results[0]['keywords'];
$description = $results[0]['description'];
$pagedata    = $results[0]['pagedata'];
$pagedata    = !empty($pagedata) ? objtoarr(json_decode($pagedata)) : array();

$css = $javascript = $html = "";

/*
 * 对value格式化
 * 1.为空取0
 * 2.不等于"auto"并且不包含"px"的追加"px"
 * 3.其余为默认
 * @param $val string 要格式化的字符串
 * @return $string
 */
function value_change($val){
	$r = 0;
	if(!empty($val)){
		if($val != "auto" && !strstr($val, "px")){
			$r = $val."px";
		}else{
			$r = $val;
		}
	}
	return $r;
}

/*
 * 尺寸计算
 * 1.提取计量单位
 * 2.数学计算
 * @param $str  string 要计算的字符串或数字
 * @param $oper string 要进行的操作（+、-、*、/）
 * @param $num  num    参数
 * @return string
 */
function compute_dim($str, $oper, $num){
	$digital = (int)preg_replace('/[^0-9]/', '', $str);   //数值
	$unit    = str_replace($digital, "", $str); //单位
	if($oper == "+") $ret = $digital+$num;
	if($oper == "-") $ret = $digital-$num;
	if($oper == "*") $ret = $digital*$num;
	if($oper == "/") $ret = $digital/$num;
	return $ret.$unit;
}

//输出脚本
function defineJS($file){
	$m_file = HUONIAOROOT."/".$file;
	$view = readFileContent($m_file);
	$view = preg_replace("/ui\/(.*?)\.js/", "design/ui/$1.js", $view);
	$view = str_replace("define(", "define('".$file."',", $view);
	return $view."\r\n";
}

//读取文件内容
function readFileContent($file){
	if(file_exists($file)){
		$fp = @fopen($file,'r');
		$content = @fread($fp,filesize($file));
		@fclose($fp);
		return $content;
	}
}

//编译页面JSON数据
function data_foreach($arr, $type = NULL){
	static $data;
	global $cfg_clihost;
	global $id;
	global $alias;
	global $cycle;
	$less = new lessc;

	if (!is_array($arr) && $arr != NULL) {
		return $data;
	}

	if($arr['type'] == "body"){
		$theme = $arr['theme'];

		//页面链接样式配置
		$value = $theme['value'];
		if(!empty($value)){
			//默认
			$data['css'][] = ".t-body-default-aaaa a{";
			$linkColor = $value['link-color'];
			if(!empty($linkColor)) {
				$data['css'][] = "color:".$linkColor.";";
			}
			$linkTextDecoration = $value['link-text-decoration'];
			if(!empty($linkColor)) {
				$data['css'][] = "text-decoration:".$linkTextDecoration.";";
			}
			$data['css'][] = "}";
			//hover
			$data['css'][] = ".t-body-default-aaaa a:hover{";
			$linkHoverColor = $value['link-hover-color'];
			if(!empty($linkColor)) {
				$data['css'][] = "color:".$linkHoverColor.";";
			}
			$linkHoverTextDecoration = $value['link-hover-text-decoration'];
			if(!empty($linkColor)) {
				$data['css'][] = "text-decoration:".$linkHoverTextDecoration.";";
			}
			$data['css'][] = "}";
		}

		//页面基本配置
		$style = $theme['style'];
		if(!empty($style)){
			$data['css'][] = "#w-body-aaaa{";
			foreach($style as $key => $val){
				//间距
				if($key == "margin"){
					$data['css'][] = "margin:".value_change($val['top'])." ".value_change($val['right'])." ".value_change($val['bottom'])." ".value_change($val['left']).";";

				//填充
				}elseif($key == "padding"){
					$data['css'][] = "padding:".value_change($val['top'])." ".value_change($val['right'])." ".value_change($val['bottom'])." ".value_change($val['left']).";";

				//背景
				}elseif($key == "background"){
					if(!empty($val['attachment'])){
						$data['css'][] = "background-attachment:".$val['attachment'].";";
					}
					if(!empty($val['color'])){
						$data['css'][] = "background-color:".$val['color'].";";
					}
					if(!empty($val['image'])){
						$data['css'][] = "background-image:".$val['image'].";";
					}
					if(!empty($val['position'])){
						$data['css'][] = "background-position:".$val['position'].";";
					}
					if(!empty($val['repeat'])){
						$data['css'][] = "background-repeat:".$val['repeat'].";";
					}

				//边框
				}elseif($key == "border"){

					$style = $val['style'];
					$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
					$width = $val['width'];
					if(!empty($width['top'])){
						$data['css'][] = "border-top-width:".$width['top'].";";
					}
					if(!empty($width['right'])){
						$data['css'][] = "border-right-width:".$width['right'].";";
					}
					if(!empty($width['bottom'])){
						$data['css'][] = "border-bottom-width:".$width['bottom'].";";
					}
					if(!empty($width['left'])){
						$data['css'][] = "border-left-width:".$width['left'].";";
					}
					$color = $val['color'];
					if(!empty($color['top'])){
						$data['css'][] = "border-top-color:".$color['top'].";";
					}
					if(!empty($color['right'])){
						$data['css'][] = "border-right-color:".$color['right'].";";
					}
					if(!empty($color['bottom'])){
						$data['css'][] = "border-bottom-color:".$color['bottom'].";";
					}
					if(!empty($color['left'])){
						$data['css'][] = "border-left-color:".$color['left'].";";
					}

				}else{
					$data['css'][] = "".$key.":".$val.";";
				}
			}
			$data['css'][] = "}";
		}

	}

	foreach($arr['items'] as $key => $val) {

		if(!empty($val['type'])){
			//组件样式
			$m_file = HUONIAOROOT."/design/widgets/".$val['type']."/view.css";
			$view = readFileContent($m_file);
			$view = preg_replace("/[\r\n	]/",'',$view);
			$view = preg_replace("/\s?\{\s?/",'{',$view);
			$view = preg_replace("/:\s+/",':',$view);
			$view = preg_replace("/;\s+/",'',$view);
			$view = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/$1.jpg)',$view);
			$view = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/$1.png)',$view);
			$view = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/$1.gif)',$view);
			if(!in_array($view, $data['css'])){
				$data['css'][] = $view;
			}

			//组件风格
			$themeBase = $val['theme']['base'];
			if(!empty($themeBase)){
				$m_file = HUONIAOROOT."/design/widgets/".$val['type']."/info.json";
				$json = json_decode(readFileContent($m_file));
				if(!empty($json)){
					$json = objtoarr($json);
					$theme = $json['theme'];

					$source = "";
					foreach($theme as $k => $v){
						if($v['name'] == $themeBase){
							$source = $v['source'];
						}
					}

					//less代码解析
					$source = $less->compile($source);
					$source = preg_replace("/\s?\{\s?/",'{',$source);
					$source = preg_replace("/:\s+/",':',$source);
					$source = preg_replace("/;\s+/",';',$source);
					$source = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.jpg)',$source);
					$source = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.png)',$source);
					$source = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.gif)',$source);
					$source = preg_replace("/\(\"?(.*?)images\/loading.gif\"?\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/images/loading.gif)',$source);
					$source = preg_replace("/[\r\n	]/",'',$source);

					if(!in_array($source, $data['css'])){
						$data['css'][] = $source;
					}
				}
			}

			//自定义样式
			$style = $val['theme']['style'];
			if(!empty($style)){
				$data['css'][] = "#w-".$val['type']."-$cycle{";
				foreach($style as $k => $v){
					//间距
					if($k == "margin"){
						$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

					//填充
					}elseif($k == "padding"){
						$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

					//背景
					}elseif($k == "background"){
						if(!empty($v['attachment'])){
							$data['css'][] = "background-attachment:".$v['attachment'].";";
						}
						if(!empty($v['color'])){
							$data['css'][] = "background-color:".$v['color'].";";
						}
						if(!empty($v['image'])){
							$data['css'][] = "background-image:".$v['image'].";";
						}
						if(!empty($v['position'])){
							$data['css'][] = "background-position:".$v['position'].";";
						}
						if(!empty($v['repeat'])){
							$data['css'][] = "background-repeat:".$v['repeat'].";";
						}

					//边框
					}elseif($k == "border"){

						$style = $v['style'];
						$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
						$width = $v['width'];
						if(!empty($width['top'])){
							$data['css'][] = "border-top-width:".$width['top'].";";
						}
						if(!empty($width['right'])){
							$data['css'][] = "border-right-width:".$width['right'].";";
						}
						if(!empty($width['bottom'])){
							$data['css'][] = "border-bottom-width:".$width['bottom'].";";
						}
						if(!empty($width['left'])){
							$data['css'][] = "border-left-width:".$width['left'].";";
						}
						$color = $v['color'];
						if(!empty($color['top'])){
							$data['css'][] = "border-top-color:".$color['top'].";";
						}
						if(!empty($color['right'])){
							$data['css'][] = "border-right-color:".$color['right'].";";
						}
						if(!empty($color['bottom'])){
							$data['css'][] = "border-bottom-color:".$color['bottom'].";";
						}
						if(!empty($color['left'])){
							$data['css'][] = "border-left-color:".$color['left'].";";
						}

					}else{
						$data['css'][] = $k.":".$v.";";
					}
				}
				$data['css'][] = "}";
			}

			//拼接组件内容
			//分栏较特殊，页面结构需要单独设置，此处需要计算出每栏的宽度和间距（$type值由上次循环所传）
			if($type == "columnbox"){
				$w = (100*$val['aliquot'])/12;
				$columnSpacing = compute_dim($arr['params']['columnSpacing'], "/", 2);
				if($key == 0){
					$data['css'][] = "#w-area-$cycle{margin-right:".$columnSpacing."}";
				}elseif($key == count($arr['items'])-1){
					$data['css'][] = "#w-area-$cycle{margin-left:".$columnSpacing."}";
				}else{
					$data['css'][] = "#w-area-$cycle{margin:0 ".$columnSpacing."}";
				}

				$data['html'][] = "<div class=\"w-col\" style=\"width:$w%\">";
				$data['html'][] = "<div id=\"w-area-$cycle\" data-type=\"area\" class=\"n-widget w-area\">";

			//其它正常情况
			}else{
				$themeClass = $dataParam = "";
				if(!empty($themeBase) && $val['type'] != "body"){
					$themeClass = " t-".$val['type']."-".$themeBase;
				}

				$data['css'][] = "#w-".$val['type']."-$cycle{text-align:".$val['params']['align'].";}";

				//如果是音频需要要外层增加地址参数
				if($val['type'] == "audio"){
					if(!empty($val['params']['audio'])){
						$dataParam = " data-audio=\"".$val['params']['audio']."\"";
					}
					if(!empty($val['params']['autoplay'])){
						$dataParam .= " data-autoplay=\"1\"";
					}
				}

				//如果是图片需要判断是否增加点击放大参数
				if($val['type'] == "image"){
					if(!empty($val['params']['lightbox']) && empty($val['params']['link'])){
						$dataParam = " data-lightbox=\"1\"";
					}
				}

				//如果标签需要配置切换方式
				if($val['type'] == "tabbox"){
					$dataParam = " data-method=\"".$val['params']['method']."\"";
				}

				//如果是幻灯片需要配置宽高
				if($val['type'] == "slider"){
					$dataParam = ' data-width="'.$val['params']['width'].'" data-height="'.$val['params']['height'].'"';
				}

				$data['html'][] = "<div id=\"w-".$val['type']."-$cycle\" data-type=\"".$val['type']."\" class=\"n-widget w-".$val['type'].$themeClass."\"$dataParam>";

				//导航条
				if($val['type'] == "menu"){
					$data['html'][] = "<div class=\"w-menu-container\"><ul class=\"w-menu-list\">";
					$menus = $val['params']['menus'];
					$m_count = 1;
					foreach($menus as $m_key => $m_val){
						$m_class = $active = $target = "";
						if($m_count == 1){
							$m_class = " w-menu-item-first";
						}elseif($m_count == count($menus)){
							$m_class = " w-menu-item-last";
						}

						//链接地址
						$href = $m_val['href'];
						$pagename = str_replace(".html", "", str_replace("{PROJECT_PAGES_BASE}", "", $href));
						if($alias == $pagename && !empty($m_val['pageid'])){
							$active = " active";
						}

						//站内链接
						if(!empty($m_val['pageid'])){
							$href = str_replace("{PROJECT_PAGES_BASE}", "./", $href);
						}

						//打开方式
						if(!empty($m_val['target'])){
							$target = " target=\"_blank\"";
						}

						$data['html'][] = "<li class=\"w-menu-item".$m_class.$active."\"><a href=\"$href\"$target>".$m_val['title']."</a>";

						//二级菜单
						if($m_val['subnav']){
							$data['html'][] = "<ul class=\"w-submenu-list\">";
							foreach($m_val['subnav'] as $m_key_ => $m_val_){
								//链接地址
								$href = $m_val_['href'];
								$pagename = str_replace(".html", "", str_replace("{PROJECT_PAGES_BASE}", "", $href));
								if($alias == $pagename && !empty($m_val_['pageid'])){
									$active = " active";
								}

								//站内链接
								if(!empty($m_val_['pageid'])){
									$href = str_replace("{PROJECT_PAGES_BASE}", "./", $href);
								}

								//打开方式
								if(!empty($m_val_['target'])){
									$target = " target=\"_blank\"";
								}
								$data['html'][] = "<li><a href=\"$href\"$target>".$m_val_['title']."</a></li>";
							}
							$data['html'][] = "</ul>";
						}

						$data['html'][] = "</li>";

						if($m_count != count($menus)){
							$data['html'][] = "<li class=\"w-menu-divider\"><span class=\"w-menu-divider-item\"></span></li>";
						}

						$m_count++;
					}
					$data['html'][] = "</ul></div>";

				//文字
				}elseif($val['type'] == "text"){
					$data['html'][] = $val['params']['text'];

				//分割线
				}elseif($val['type'] == "divider"){

					$data['css'][] = "#w-divider-$cycle hr{border-width:".$val['params']['height']." 0 0 0; border-style:".$val['params']['style']."; border-color:".$val['params']['color']."}";
					$data['html'][] = "<hr />";

				//音频
				}elseif($val['type'] == "audio"){

					//脚本
					$data['javascript'][] = defineJS('design/widgets/audio/jplayer/jplayer.js');
					$data['javascript'][] = defineJS('design/widgets/audio/view.js');
					$data['javascript'][] = "define(function(require){var $=require('jquery'), V = {\"w-audio-$cycle\":require(\"design/widgets/audio/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();\r\n";

					$cycle++;
					$align = $val['params']['align'];
					$margin = "margin-left:auto;margin-right:auto;";
					if($align == "left"){
						$margin = "margin-left:0;margin-right:auto;";
					}elseif($align == "right"){
						$margin = "margin-left:auto;margin-right:0;";
					}
					$data['css'][] = "#w-audio-$cycle-c{".$margin."}";

					$data['html'][] = '<div id="w-audio-'.$cycle.'-c"class="w-audio-container"><div class="w-audio-shadow-left"></div><div class="w-audio-player"></div><div class="w-audio-control-container"><div class="w-audio-control"><a class="w-audio-icon w-audio-play jp-play"title="播放"></a><a class="w-audio-icon w-audio-pause jp-pause"title="暂停"></a></div><div class="w-audio-track jp-progress"><div class="w-audio-bar w-audio-track-bar jp-seek-bar"><div class="w-audio-percent w-audio-track-percent jp-play-bar"></div></div><span class="w-audio-track-playtime jp-current-time">00:00</span><span class="w-audio-track-totaltime jp-duration">--:--</span></div><div class="w-audio-volume"><a class="w-audio-icon w-audio-volume-normal jp-unmute"title="恢复音量"></a><a class="w-audio-icon w-audio-volume-mute jp-mute"title="静音"></a><div class="w-audio-bar w-audio-volume-bar jp-volume-bar"><div class="w-audio-percent w-audio-volume-percent jp-volume-bar-value"></div></div></div></div><div class="w-audio-shadow-right"></div></div>';

				//图片
				}elseif($val['type'] == "image"){

					//脚本
					$data['javascript'][] = defineJS('design/ui/imgmax.js');
					$data['javascript'][] = defineJS('design/ui/fancybox.js');
					$data['javascript'][] = defineJS('design/widgets/image/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-image-$cycle\":require(\"design/widgets/image/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$fancyboxCss = readFileContent(HUONIAOROOT."/design/ui/fancybox/style.css");
					$fancyboxCss = preg_replace("/\(\'(.*?).jpg\'\)/",'(/design/ui/fancybox/$1.jpg)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).png\'\)/",'(/design/ui/fancybox/$1.png)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).gif\'\)/",'(/design/ui/fancybox/$1.gif)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\s?\{\s?/",'{',$fancyboxCss);
					$fancyboxCss = preg_replace("/:\s+/",':',$fancyboxCss);
					$fancyboxCss = preg_replace("/;\s+/",';',$fancyboxCss);
					$fancyboxCss = preg_replace("/[\r\n	]/",'',$fancyboxCss);
					$data['css'][] = $fancyboxCss;

					$data['css'][] = "#w-image-$cycle{text-align:".$val['params']['align']."}";
					$data['css'][] = "#w-image-$cycle img{";
					if(!empty($val['params']['width'])){
						$data['css'][] = "width:".$val['params']['width'].";";
					}
					if(!empty($val['params']['height'])){
						$data['css'][] = "height:".$val['params']['height'].";";
					}
					if(!empty($val['params']['padding'])){
						$data['css'][] = "padding:".$val['params']['padding'].";";
					}
					if(!empty($val['params']['borderColor'])){
						$data['css'][] = "border:1px solid ".$val['params']['borderColor'].";";
					}
					$data['css'][] = "}";

					$sty = "";
					if(!empty($val['params']['lightbox']) && empty($val['params']['link'])){
						$sty = " style=\"cursor:pointer;\"";
					}

					if(!empty($val['params']['link'])){
						$href = $target = "";
						$href = str_replace("{PROJECT_PAGES_BASE}", "./", $val['params']['link']['href']);
						if(!empty($val['params']['link']['target'])){
							$target = " target=\"".$val['params']['link']['target']."\"";
						}
						$data['html'][] = "<a href=\"$href\"$target>";
					}

					$data['html'][] = "<img src=\"".$val['params']['image']."\"$sty>";

					if(!empty($val['params']['link'])){
						$data['html'][] = "</a>";
					}

					if(!empty($val['params']['title'])){
						$data['html'][] = "<p class=\"caption\">".$val['params']['title']."</p>";
					}

				//视频
				}elseif($val['type'] == "video"){

					$video = $val['params']['video'];

					//手机端
					if(isMobile()){

						//优酷
						if(preg_match("/player.youku.com/", $video)){
							$exp = explode("/", $video);
							$vid = $exp[count($exp)-2];

							$video = 'http://player.youku.com/embed/'.$vid;

						//腾讯
						}elseif(preg_match("/video.qq.com/", $video)){
							$vid = getUrlQuery($video, "vid");
							$auto = getUrlQuery($video, "auto");

							$video = 'http://v.qq.com/iframe/player.html?vid='.$vid.'&tiny=0&auto='.$auto;
						}

						$data['html'][] = '<div style="text-align:center; margin-bottom:10px;"><iframe frameborder="0" width="'.$val['params']['width'].'" height="'.$val['params']['height'].'" allowtransparency="true" src="'.$video.'"></iframe></div>';


					//PC端
					}else{

						$data['html'][] = '<video class="video-js" controls autoplay preload="auto" data-setup="{}" style="width: '.$val['params']['width'].'; height: '.$val['params']['height'].';"><source src="'.$video.'"></video>';

					}

				//图组
				}elseif($val['type'] == "gallery"){

					//脚本
					$data['javascript'][] = defineJS('design/ui/imgmax.js');
					$data['javascript'][] = defineJS('design/ui/fancybox.js');
					$data['javascript'][] = defineJS('design/widgets/gallery/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-gallery-$cycle\":require(\"design/widgets/gallery/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$fancyboxCss = readFileContent(HUONIAOROOT."/design/ui/fancybox/style.css");
					$fancyboxCss = preg_replace("/\(\'(.*?).jpg\'\)/",'(/design/ui/fancybox/$1.jpg)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).png\'\)/",'(/design/ui/fancybox/$1.png)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\(\'(.*?).gif\'\)/",'(/design/ui/fancybox/$1.gif)',$fancyboxCss);
					$fancyboxCss = preg_replace("/\s?\{\s?/",'{',$fancyboxCss);
					$fancyboxCss = preg_replace("/:\s+/",':',$fancyboxCss);
					$fancyboxCss = preg_replace("/;\s+/",';',$fancyboxCss);
					$fancyboxCss = preg_replace("/[\r\n	]/",'',$fancyboxCss);
					$data['css'][] = $fancyboxCss;

					$lightbox = " data-lightbox=\"0\"";
					if($val['params']['lightbox'] == 1){
						$lightbox = " data-lightbox=\"1\"";
					}

					$data['html'][] = '<div class="imageGalleryContainer imageGalleryexport"'.$lightbox.'>';
					$data['html'][] = '<ul class="imageGallery" data-istitle="false" style="overflow:hidden;zoom:1;">';

					$column = 100/$val['params']['column'];
					$gallery = $val['params']['gallery'];
					$fancyboxGroup = "fancyboxGroup".GetMkTime(time());
					if(!empty($gallery)){
						foreach($gallery as $g_key => $g_val){
							$href = str_replace("{PROJECT_PAGES_BASE}", "./", $g_val['url']);
							$dataParam = "";
							$thumb_css = str_replace("move", "pointer", $g_val['thumb_css']);
							$paddbottom = "75%";
							if($val['params']['clip'] == "square"){
								$paddbottom = "100%";
							}
							if($val['params']['lightbox'] == 1){
								$href = $g_val['image'];
								$dataParam = "rel='".$fancyboxGroup."'";
							}


							$data['html'][] = '<li class="item" style="vertical-align:top; cursor:pointer; width:'.$column.'%">';
							$data['html'][] = '<div class="marginItem" style="padding:'.$val['params']['margin'].'px;">';
							$data['html'][] = '<div class="borderItem" style="border:'.($val['params']['border'] == 0 ? "none" : "1px solid rgb(204, 204, 204)").';min-height:0;padding:'.$val['params']['border'].'px">';
							$data['html'][] = '<a target="'.$g_val['target'].'" class="gallerylink fancybox" href="'.$href.'" style="position:relative;display:block;overflow:hidden;zoom:1;padding-bottom:'.$paddbottom.';"'.$dataParam.'>';

							if($val['params']['titlepos'] == "over"){
								$data['html'][] = '<p style="display:block" class="over-title">'.$g_val['title'].'</p>';
							}

							$data['html'][] = '<img src="'.$g_val['image'].'" style="'.$thumb_css.'">';
							$data['html'][] = '</a>';
							$data['html'][] = '</div>';
							$data['html'][] = '</div>';

							if($val['params']['titlepos'] == "bottom"){
								$data['html'][] = '<p class="bottom-title"><a target="'.$g_val['target'].'" href="'.$href.'">'.$g_val['title'].'</a></p>';
							}

							$data['html'][] = '</li>';
						}
					}

					$data['html'][] = '</ul>';
					$data['html'][] = '</div>';

				//关注
				}elseif($val['type'] == "follow"){

					//脚本
					$data['javascript'][] = defineJS('design/widgets/follow/tiptip.js');
					$data['javascript'][] = defineJS('design/widgets/follow/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-follow-$cycle\":require(\"design/widgets/follow/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$tiptipCss = readFileContent(HUONIAOROOT."/design/widgets/follow/tiptip.css");
					$tiptipCss = preg_replace("/\s?\{\s?/",'{',$tiptipCss);
					$tiptipCss = preg_replace("/:\s+/",':',$tiptipCss);
					$tiptipCss = preg_replace("/;\s+/",';',$tiptipCss);
					$tiptipCss = preg_replace("/[\r\n	]/",'',$tiptipCss);
					$data['css'][] = $tiptipCss;

					$data['html'][] = '<div class="w-follow-container w-follow-align-'.$val['params']['align'].' w-follow-size-'.$val['params']['size'].'">';
					$data['html'][] = '<span class="w-follow-text">'.$val['params']['text'].'</span>';
					$data['html'][] = '<span class="w-follow-items">';
					$items = $val['params']['items'];
					if(!empty($items)){
						foreach($items as $i_key => $i_val){
							$title = $href = "";
							if($i_val['type'] == "tencent-weibo"){
								$title = "腾迅微博";
								$href = ' href="'.$i_val['href'].'" target="_blank"';
							}elseif($i_val['type'] == "sina-weibo"){
								$title = "新浪微博";
								$href = ' href="'.$i_val['href'].'" target="_blank"';
							}elseif($i_val['type'] == "weixin"){
								$title = "微信";
								$href = ' data-weixin="'.$i_val['src'].'"';
							}
							$data['html'][] = '<a class="w-follow-item '.$i_val['type'].'"'.$href.' title="关注我们的'.$title.'">关注我们的'.$title.'</a>';
						}
					}
					$data['html'][] = '</span>';
					$data['html'][] = '</div>';

				//QQ客服
				}elseif($val['type'] == "wpqq"){

					$wright = "";
					if($val['params']['align'] == "center"){
						$data['css'][] = '#w-wpqq-'.$cycle.' .wpqq-wrap{width:'.$val['params']['width'].'px;margin:0 auto;}';
					}
					if($val['params']['align'] == "right"){
						$wright = " wpqq-wrap-right";
					}
					if($val['params']['layout'] == "fixed"){
						$wright = " wpqq-wrap-fixed";
					}

					$data['html'][] = '<div class="wpqq-wrap'.$wright.'">';

					if($val['params']['layout'] == "fixed"){
						$data['html'][] = '<div class="wpqq-wrap-head"></div>';
						$data['html'][] = '<div class="wpqq-wrap-fixed-content">';
					}

					$qqs = $val['params']['qq'];
					if(!empty($qqs)){
						foreach($qqs as $q_key => $q_val){
							$itemClass = "";
							if($val['params']['layout'] == "horizontal"){
								$itemClass = " wpqq-item-float";
							}
							$data['html'][] = '<div class="wpqq-item'.$itemClass.'"><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin='.$q_val['qq'].'&site=qq&menu=yes"><div class="img"><img border="0" src="http://wpa.qq.com/pa?p=2:'.$q_val['qq'].':52" alt="点击这里给我发消息" title="点击这里给我发消息"></div><span class="alias">'.$q_val['alias'].'</span></a></div>';
						}
					}

					if($val['params']['layout'] == "fixed"){
						$data['html'][] = '</div>';
					}
					$data['html'][] = '</div>';

				//分享
				}elseif($val['type'] == "share"){

					$data['css'][] = '.w-share #bdshare, .w-share #bdshare *{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;}';
					$data['css'][] = '#w-share-'.$cycle.'{text-align:'.$val['params']['align'].'}';

					$share = $val['params']['share'];
					$number = $val['params']['number'] == 1 ? '<a class="shareCount" href="#" title="累计分享0次">0</a>' : "";
					//图标
					if($share['type'] == "icon"){
						if($share['name'] == 1){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><span class="bds_more">分享到：</span><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a>'.$number.'</div>';
						}elseif($share['name'] == 2){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a><span class="bds_more">更多</span>'.$number.'</div>';
						}elseif($share['name'] == 3){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools_32 get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#"></a><a class="bds_tsina" title="分享到新浪微博" href="#"></a><a class="bds_tqq" title="分享到腾讯微博" href="#"></a><a class="bds_renren" title="分享到人人网" href="#"></a><a class="bds_t163" title="分享到网易微博" href="#"></a><span class="bds_more"></span>'.$number.'</div>';
						}
					//按钮
					}elseif($share['type'] == "button"){
						$data['html'][] = '<div id="bdshare" class="bdshare_b" style="line-height: 12px;"><img src="http://bdimg.share.baidu.com/static/images/type-button-'.$share['name'].'.jpg?cdnversion=20120831">'.$number.'</div>';
					//文字
					}elseif($share['type'] == "text"){
						if($share['name'] == 1){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><span class="bds_more">分享到：</span><a class="bds_qzone" title="分享到QQ空间" href="#">QQ空间</a><a class="bds_tsina" title="分享到新浪微博" href="#">新浪微博</a><a class="bds_tqq" title="分享到腾讯微博" href="#">腾讯微博</a><a class="bds_renren" title="分享到人人网" href="#">人人网</a><a class="bds_t163" title="分享到网易微博" href="#">网易微博</a>'.$number.'</div>';
						}elseif($share['name'] == 2){
							$data['html'][] = '<div id="bdshare" class="bdshare_t bds_tools get-codes-bdshare"><a class="bds_qzone" title="分享到QQ空间" href="#">QQ空间</a><a class="bds_tsina" title="分享到新浪微博" href="#">新浪微博</a><a class="bds_tqq" title="分享到腾讯微博" href="#">腾讯微博</a><a class="bds_renren" title="分享到人人网" href="#">人人网</a><a class="bds_t163" title="分享到网易微博" href="#">网易微博</a><span class="bds_more">更多</span>'.$number.'</div>';
						}
					}

					$mini = $share['type'] == "slide" ? ($val['params']['slideMini'] == 1 ? '&mini=1' : "") : ($val['params']['mini'] == 1 ? '&mini=1' : "");
					$shareType = "type=tools";
					if($share['type'] == "slide"){
						$shareType = "type=slide&img=".$share['name']."&pos=".$val['params']['slidePosition']."";
					}
					$data['html'][] = '<script type="text/javascript" id="bdshare_js" data="'.$shareType.$mini.'" src="http://bdimg.share.baidu.com/static/js/bds_s_v2.js?cdnversion=389414"></script>';

				//按钮
				}elseif($val['type'] == "button"){

					$data['css'][] = '#w-button-'.$cycle.'{text-align:'.$val['params']['align'].'}';
					$data['css'][] = '#w-button-'.$cycle.' .w-button-container{width:'.$val['params']['width'].'}';

					$href = "javascript:;";
					$target = "";
					$link = $val['params']['link'];
					if(!empty($link)){
						if(!empty($link['href'])){
							$href = str_replace("{PROJECT_PAGES_BASE}", "./", $link['href']);
						}
						if(!empty($link['target'])){
							$target = " target=\"".$link['target']."\"";
						}
					}
					$data['html'][] = '<a href="'.$href.'"'.$target.' class="w-button-container"><span class="w-button-text"><i class="middle"></i><b class="text">'.$val['params']['text'].'</b></span><i class="w-button-right"></i></a>';

				//标题
				}elseif($val['type'] == "titlebox"){

					$cycle++;
					$heading = $val['heading'];
					//自定义样式
					$style = $heading['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-".$heading['type']."-$cycle{";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					//组件风格
					$themeBase = $heading['theme']['base'];
					if(!empty($themeBase)){
						$m_file = HUONIAOROOT."/design/widgets/".$heading['type']."/info.json";
						$json = json_decode(readFileContent($m_file));
						if(!empty($json)){
							$json = objtoarr($json);
							$theme = $json['theme'];

							$source = "";
							foreach($theme as $k => $v){
								if($v['name'] == $themeBase){
									$source = $v['source'];
								}
							}

							//less代码解析
							$source = $less->compile($source);
							$source = preg_replace("/\s?\{\s?/",'{',$source);
							$source = preg_replace("/:\s+/",':',$source);
							$source = preg_replace("/;\s+/",';',$source);
							$source = preg_replace("/\((.*?).jpg\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.jpg)',$source);
							$source = preg_replace("/\((.*?).png\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.png)',$source);
							$source = preg_replace("/\((.*?).gif\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/$1.gif)',$source);
							$source = preg_replace("/\(\"?(.*?)images\/loading.gif\"?\)/",'(/design/widgets/'.$val['type'].'/theme/'.$themeBase.'/images/loading.gif)',$source);
							$source = preg_replace("/[\r\n	]/",'',$source);

							if(!in_array($source, $data['css'])){
								$data['css'][] = $source;
							}
						}
					}

					$fontSize   = $heading['params']['font-size'];
					$color      = $heading['params']['color'];
					$hoverColor = $heading['params']['hover-color'];

					$style = "";
					if(!empty($fontSize)){
						$style .= "font-size:".$fontSize.";";
					}
					if(!empty($color)){
						$style .= "color:".$color.";";
					}

					if(!empty($style)){
						$data['css'][] = "#w-heading-$cycle h2, #w-heading-$cycle h2 a{".$style."}";
					}
					if(!empty($hoverColor)){
						$data['css'][] = "#w-heading-$cycle h2 a:hover{color:$hoverColor;}";
					}

					$title = $heading['params']['title'];
					$link  = $heading['params']['link'];
					$href = str_replace("{PROJECT_PAGES_BASE}", "./", $link['href']);
					if(!empty($link)){
						$title = '<a href="'.$href.'" target="'.$link['target'].'">'.$title.'</a>';
					}


					$data['html'][] = "<div id=\"w-".$heading['type']."-$cycle\" data-type=\"heading\" class=\"n-widget w-heading t-heading-".$heading['theme']['base']."\"><i class=\"middle\"></i><h2><i></i>".$title."</h2></div>";


				//标签
				}elseif($val['type'] == "tabbox"){

					//脚本
					$data['javascript'][] = defineJS('design/widgets/tabbox/view.js');
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-tabbox-$cycle\":require(\"design/widgets/tabbox/view.js\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";

					$item = $val['items'];
					if(!empty($item)){
						//Tab标签
						$data['html'][] = '<div class="w-tabbox-tabs t-tabbox-'.$val['theme']['base'].'-tabs"><ul class="w-tabbox-list">';
						foreach($item as $i_key => $i_val){
							$class = "";
							if($i_key == 0){
								$class = " first active";
							}elseif($i_key == count($item)-1){
								$class = " last";
							}
							//$tags
							$data['html'][] = '<li class="w-tabbox-tab'.$class.'"><a>'.$i_val['title'].'</a></li>';
						}
						$data['html'][] = '</ul></div>';

						//Tab内容
						$data['html'][] = '<div class="w-tabbox-contents t-tabbox-'.$val['theme']['base'].'-contents">';
						foreach($item as $i_key => $i_val){
							$class = "";
							if($i_key == 0){
								$class = " first active";
							}elseif($i_key == count($item)-1){
								$class = " last";
							}
							//$cons
							$cycle++;

							//自定义样式
							$style = $i_val['content']['theme']['style'];
							if(!empty($style)){
								$data['css'][] = "#w-area-$cycle{";
								foreach($style as $k => $v){
									//间距
									if($k == "margin"){
										$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

									//填充
									}elseif($k == "padding"){
										$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

									//背景
									}elseif($k == "background"){
										if(!empty($v['attachment'])){
											$data['css'][] = "background-attachment:".$v['attachment'].";";
										}
										if(!empty($v['color'])){
											$data['css'][] = "background-color:".$v['color'].";";
										}
										if(!empty($v['image'])){
											$data['css'][] = "background-image:".$v['image'].";";
										}
										if(!empty($v['position'])){
											$data['css'][] = "background-position:".$v['position'].";";
										}
										if(!empty($v['repeat'])){
											$data['css'][] = "background-repeat:".$v['repeat'].";";
										}

									//边框
									}elseif($k == "border"){

										$style = $v['style'];
										$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
										$width = $v['width'];
										if(!empty($width['top'])){
											$data['css'][] = "border-top-width:".$width['top'].";";
										}
										if(!empty($width['right'])){
											$data['css'][] = "border-right-width:".$width['right'].";";
										}
										if(!empty($width['bottom'])){
											$data['css'][] = "border-bottom-width:".$width['bottom'].";";
										}
										if(!empty($width['left'])){
											$data['css'][] = "border-left-width:".$width['left'].";";
										}
										$color = $v['color'];
										if(!empty($color['top'])){
											$data['css'][] = "border-top-color:".$color['top'].";";
										}
										if(!empty($color['right'])){
											$data['css'][] = "border-right-color:".$color['right'].";";
										}
										if(!empty($color['bottom'])){
											$data['css'][] = "border-bottom-color:".$color['bottom'].";";
										}
										if(!empty($color['left'])){
											$data['css'][] = "border-left-color:".$color['left'].";";
										}

									}else{
										$data['css'][] = $k.":".$v.";";
									}
								}
								$data['css'][] = "}";
							}

							$data['html'][] = '<div id="w-area-'.$cycle.'" data-type="area" class="n-widget w-area w-tabbox-content'.$class.'">';
							$cycle++;
							data_foreach($i_val['content']);
							$data['html'][] = '</div>';
						}
						$data['html'][] = '</div>';
					}

				//Flash
				}elseif($val['type'] == "Flash"){

					$params = $val['params'];
					$flashvars = $params['flashvars'] ? " flashvars=\"".$params['flashvars']."\"" : "";
					$data['html'][] = '<embed align="'.$params['align'].'" quality="high" allowscriptaccess="never" allownetworking="internal" allowfullscreen="true" wmode="transparent" type="application/x-shockwave-flash" src="'.$params['flash'].'" style="margin:0px auto;width:'.$params['width'].';height:'.$params['height'].';"'.$flashvars.'>';

				//slider
				}elseif($val['type'] == "slider"){

					//脚本
					$jsFile = 'design/widgets/slider/view.js';
					if($themeBase != "default"){
						$jsFile = 'design/widgets/slider/theme/'.$themeBase.'/view.js';
					}
					$data['javascript'][] = defineJS($jsFile);
					$data['javascript'][] = "define(function(require){var $ = require('jquery'), V = {\"w-slider-$cycle\":require(\"$jsFile\")};$(function(){\$('.n-widget').each(function(){var t=$(this),v=V[t.attr('id')];v&&v(t)})})}).exec();";


					if($themeBase == "05" || $themeBase == "06"){
						$data['html'][] = '<div class="slidesjs"><div class="ad-image-wrapper"></div><div class="ad-controls" style="display:none;"></div><div class="ad-nav"><div class="ad-thumbs"><ul class="ad-thumb-list">';
					}elseif($themeBase == "07" || $themeBase == "08"){
						$data['html'][] = '<div class="expose"><div class="exposeBar"><ul class="exposeThumbs">';
					}elseif($themeBase == "09"){
						$data['html'][] = '<ul class="roundabout">';
					}else{
						$data['html'][] = '<div class="slidesjs">';
					}

					$slider = $val['params']['slider'];
					if(!empty($slider)){
						foreach($slider as $s_key => $s_val){

							$url = str_replace("{PROJECT_PAGES_BASE}", "./", $s_val['url']);
							$href = !empty($url) ? " href='".$url."'" : "";
							$target = !empty($s_val['target']) ? " target='".$s_val['target']."'" : "";
							$alt = !empty($s_val['alt']) ? "alt='".$s_val['alt']."'" : "";

							if($themeBase == "05" || $themeBase == "06"){
								$data['html'][] = '<li><a class="thumblink"'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></li>';
							}elseif($themeBase == "07" || $themeBase == "08"){
								$data['html'][] = '<li> /<img src="'.$s_val['src'].'" _src="'.$s_val['src'].'"'.$alt.($href ? '_'.$href : "").($target ? '_'.$target : "").'></li>';
							}elseif($themeBase == "09"){
								$data['html'][] = '<li><a'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></li>';
							}else{
								$data['html'][] = '<div class="slidesjs-slide"><a class="thumblink"'.$href.$target.'> /<img src="'.$s_val['src'].'"'.$alt.'></a></div>';
							}
						}
					}

					if($themeBase == "05" || $themeBase == "06"){
						$data['html'][] = '</ul></div></div></div>';
					}elseif($themeBase == "07" || $themeBase == "08"){
						$data['html'][] = '</ul></div><div class="exposeTarget"><div class="prevnext"><a class="prev">左</a><a class="next">右</a></div></div></div>';
					}else{
						$data['html'][] = '</div>';
					}

				//图文
				}elseif($val['type'] == "image-text"){

					$imageHtml = $textHtml = "";

					//图片
					$cycle++;
					$image = $val['image']['params'];

					//自定义样式
					$style = $val['image']['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-image-$cycle{";

						if($val['params']['imagePosition'] == "left"){
							$data['css'][] = 'float:left;';
						}elseif($val['params']['imagePosition'] == "right"){
							$data['css'][] = 'float:right;';
						}

						$data['css'][] = "text-align:".$image['align'].";";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					$data['css'][] = "#w-image-$cycle img{";
					if(!empty($image['width'])){
						$data['css'][] = "width:".$image['width'].";";
					}
					if(!empty($image['height'])){
						$data['css'][] = "height:".$image['height'].";";
					}
					if(!empty($image['padding'])){
						$data['css'][] = "padding:".$image['padding'].";";
					}
					if(!empty($image['borderColor'])){
						$data['css'][] = "border:1px solid ".$image['borderColor'].";";
					}
					$data['css'][] = "}";

					$sty = "";
					if(!empty($image['lightbox']) && empty($image['link'])){
						$sty = " style=\"cursor:pointer;\"";
					}
					$img = '<img src="'.$image['image'].'"'.$sty.' />';
					if(!empty($image['link'])){
						$href = str_replace("{PROJECT_PAGES_BASE}", "./", $image['link']['href']);
						$img = '<a href="'.$href.'" target="'.$image['link']['target'].'"><img src="'.$image['image'].'" /></a>';
					}
					$dataParam = "";
					if(!empty($image['lightbox']) && empty($image['link'])){
						$dataParam = " data-lightbox=\"1\"";
					}
					$caption = "";
					if(!empty($image['title'])){
						$caption = "<p class=\"caption\">".$image['title']."</p>";
					}
					$imageHtml = '<div id="w-image-'.$cycle.'" data-type="image" class="n-widget w-image"'.$dataParam.'>'.$img.$caption.'</div>';

					//文字
					$cycle++;
					$text = $val['text']['params'];

					//自定义样式
					$style = $val['text']['theme']['style'];
					if(!empty($style)){
						$data['css'][] = "#w-text-$cycle{";
						foreach($style as $k => $v){
							//间距
							if($k == "margin"){
								$data['css'][] = "margin:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//填充
							}elseif($k == "padding"){
								$data['css'][] = "padding:".value_change($v['top'])." ".value_change($v['right'])." ".value_change($v['bottom'])." ".value_change($v['left']).";";

							//背景
							}elseif($k == "background"){
								if(!empty($v['attachment'])){
									$data['css'][] = "background-attachment:".$v['attachment'].";";
								}
								if(!empty($v['color'])){
									$data['css'][] = "background-color:".$v['color'].";";
								}
								if(!empty($v['image'])){
									$data['css'][] = "background-image:".$v['image'].";";
								}
								if(!empty($v['position'])){
									$data['css'][] = "background-position:".$v['position'].";";
								}
								if(!empty($v['repeat'])){
									$data['css'][] = "background-repeat:".$v['repeat'].";";
								}

							//边框
							}elseif($k == "border"){

								$style = $v['style'];
								$data['css'][] = "border-style:".($style['top'] ? $style['top'] : "none")." ".($style['right'] ? $style['right'] : "none")." ".($style['bottom'] ? $style['bottom'] : "none")." ".($style['left'] ? $style['left'] : "none").";";
								$width = $v['width'];
								if(!empty($width['top'])){
									$data['css'][] = "border-top-width:".$width['top'].";";
								}
								if(!empty($width['right'])){
									$data['css'][] = "border-right-width:".$width['right'].";";
								}
								if(!empty($width['bottom'])){
									$data['css'][] = "border-bottom-width:".$width['bottom'].";";
								}
								if(!empty($width['left'])){
									$data['css'][] = "border-left-width:".$width['left'].";";
								}
								$color = $v['color'];
								if(!empty($color['top'])){
									$data['css'][] = "border-top-color:".$color['top'].";";
								}
								if(!empty($color['right'])){
									$data['css'][] = "border-right-color:".$color['right'].";";
								}
								if(!empty($color['bottom'])){
									$data['css'][] = "border-bottom-color:".$color['bottom'].";";
								}
								if(!empty($color['left'])){
									$data['css'][] = "border-left-color:".$color['left'].";";
								}

							}else{
								$data['css'][] = $k.":".$v.";";
							}
						}
						$data['css'][] = "}";
					}

					$textContent = $source = preg_replace("/\{PROJECT_PAGES_BASE\}/",'./',$text['text']);
					$textHtml = '<div id="w-text-'.$cycle.'" data-type="text" class="n-widget w-text">'.$textContent.'</div>';

					//设置图片输出的位置
					if($val['params']['imagePosition'] == "bottom"){
						$data['html'][] = $textHtml.$imageHtml;
					}else{
						$data['html'][] = $imageHtml.$textHtml;
					}

				//地图
				}elseif($val['type'] == "map"){

					$data['css'][] = "#w-map-$cycle{text-align:".$val['params']['align'].";}";
					$data['html'][] = '<a href="'.$val['params']['point']['link'].'" target="_blank"><img src="'.$val['params']['point']['image'].'&width='.$val['params']['width'].'&height='.$val['params']['height'].'"></a>';

				//Iframe
				}elseif($val['type'] == "iframe"){

					$params = $val['params'];
					$cycle++;

					$scroll = $params['overflow'] != "auto" ? ' scrolling="no"' : "";

					$data['css'][] = '#w-iframe-'.$cycle.'-iframe{width:'.$params['width'].';height:'.$params['height'].';overflow:'.$params['overflow'].';}';

					$data['html'][] = '<div class="w-iframe-container"><iframe frameborder="0" allowtransparency="true" src="'.$params['src'].'"'.$scroll.' id="w-iframe-'.$cycle.'-iframe"></iframe></div>';

				//Html
				}elseif($val['type'] == "html"){

					$data['html'][] = $val['params']['html'];

				//数据列表
				}elseif($val['type'] == "autolist"){

					global $cfg_secureAccess;
					global $cfg_basehost;
					$conUrl = $cfg_secureAccess.$cfg_basehost."/include/special.inc.php?action=mytagDataList&projectid=".$id."&mytag=".$val['params']['mytag']."&temp=".$val['params']['temp']."&num=".$val['params']['num'];
					$curl = curl_init();
                    curl_setopt($curl, CURLOPT_URL, $conUrl);
                    curl_setopt($curl, CURLOPT_HEADER, 0);
                    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                    curl_setopt($curl, CURLOPT_TIMEOUT, 5);
                    $content = curl_exec($curl);
                    curl_close($curl);

					$data['html'][] = $content;

				}


			}
			$cycle++;


			if(is_array($val['items']) && !empty($val['items'])){
				data_foreach($val, $val['type']);
			}

			if($type == "columnbox"){
				$data['html'][] = "</div>";
			}
			$data['html'][] = "</div>";

		}
	}
	return $data;
}

if(!empty($pagedata)){
	$comData = data_foreach($pagedata);
	$html = !empty($pagedata) ? (!empty($comData['html']) ? join("", $comData['html']) : "") : "";
	$css = !empty($pagedata) ? (!empty($comData['css']) ? join("", $comData['css']) : "") : "";
	$javascript = !empty($pagedata) ? (!empty($comData['javascript']) ? join("", $comData['javascript']) : "") : "";
}
?><!doctype html>
<html>
<head>
<meta charset="utf-8" />
<?php echo $head; ?>

<meta name="keywords" content="<?php echo $keywords;?>" />
<meta name="description" content="<?php echo $description;?>" />
<meta name="generator" content="<?php echo $cfg_softname;?>" />
<title><?php echo $pageTitle;?></title>
<link rel="stylesheet" type="text/css" href="<?php echo $cfg_secureAccess.$cfg_basehost;?>/static/css/core/special.base.css" media="all" />
<script type="text/javascript" src="<?php echo $cfg_secureAccess.$cfg_basehost;?>/static/js/core/special.core.js?v=9"></script>
<style type="text/css"><?php echo $css;?></style>
<script type="text/javascript"><?php echo $javascript;?></script>
<!--[if IE 6]>
<script> try{document.execCommand('BackgroundImageCache', false, true);} catch(e){}</script>
<![endif]-->
</head>

<body id="w-body-aaaa" data-type="body" class="n-widget w-body t-body-default-aaaa">
<?php echo $html;?>

<?php echo $footer; ?>

<?php
if(isMobile()){
    
global $cfg_wechatAppid;
global $cfg_wechatAppsecret;
global $cfg_staticVersion;
global $cfg_lang_dir;
    
if($cfg_wechatAppid && $cfg_wechatAppsecret){
	$handler = false;
	$jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
	$signPackage = $jssdk->getSignPackage();
	$wxjssdk_appId = $signPackage['appId'];
	$wxjssdk_timestamp = $signPackage['timestamp'];
	$wxjssdk_nonceStr = $signPackage['nonceStr'];
	$wxjssdk_signature = $signPackage['signature'];
}


?>
<script type="text/javascript">
    define = null;
    require = null;
</script>
<div class="dropnav" style="display: none;"></div>
<div id="navlist_4" style="display: none;">
	<div class="HN_PublicShare"></div>
</div>
<!-- <link rel="stylesheet" type="text/css" href="/static/css/core/touchBase.css" media="all" /> -->
<script type="text/javascript" src="/static/js/core/jquery-1.8.3.min.js?v=<?php echo $cfg_staticVersion;?>"></script>
<script type='text/javascript' src='/include/lang/<?php echo $cfg_lang_dir;?>.js?v=<?php echo $cfg_staticVersion;?>'></script>
<script type="text/javascript" src="https://res.wx.qq.com/open/js/jweixin-1.3.2.js?v=<?php echo $cfg_staticVersion;?>"></script>
<style>
    .HN_PublicShare_shearBox,.HN_PublicShare_zhiyin,.popupNavWechat,.popupRightBottom{display: none !important;}
</style>
<script type="text/javascript">
    var staticPath = '/static/';
    
    var wxconfig = {
        "appId": '<?php echo $wxjssdk_appId;?>',
        "timestamp": '<?php echo $wxjssdk_timestamp;?>',
        "nonceStr": '<?php echo $wxjssdk_nonceStr;?>',
        "signature": '<?php echo $wxjssdk_signature;?>',
        "description": '<?php echo $speNote;?>',
        "title": '<?php echo $speTitle;?>',
        "imgUrl": '<?php echo getFilePath($litpic);?>',
        "link": '<?php echo getUrlPath(array('service'=>'special','template'=>'detail','id'=> $projectid));?>',
    };
    //注册客户端webview
	function setupWebViewJavascriptBridge(callback){
		if(window.WebViewJavascriptBridge){
			return callback(WebViewJavascriptBridge);
		}else{
			document.addEventListener("WebViewJavascriptBridgeReady", function() {
				return callback(WebViewJavascriptBridge);
			}, false);
		}

		var _device = navigator.userAgent.toLowerCase();
		// if (device.indexOf('huoniao_iOS') > -1 && device.indexOf('huoniao_Android') <= -1) {
		// if(_device.indexOf('toutiaomicroapp') <= -1 && !wx_miniprogram && !baidu_miniprogram && !qq_miniprogram){
		if(_device.indexOf('huoniao') > -1){
	        if(window.WVJBCallbacks){return window.WVJBCallbacks.push(callback);}
	        window.WVJBCallbacks = [callback];
	        var WVJBIframe = document.createElement("iframe");
	        WVJBIframe.style.display = "none";
	        WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";

			document.documentElement.appendChild(WVJBIframe);
			setTimeout(function(){document.documentElement.removeChild(WVJBIframe) }, 0);
		}
		// }
	}

	
	
		setupWebViewJavascriptBridge(function(bridge) {
			var initAppConfigData = {
				"apptitle": wxconfig.title,   //为空时不改变现有标题
				"share": 1,           //为1时显示分享按钮
				"report": 0,           //为1时显示举报按钮
				"shareContent": {
					"platform": "all",
					"title": wxconfig.title,
					"url": wxconfig.link,
					"imageUrl": wxconfig.imgUrl,
					"summary": wxconfig.description
				}
			}
			bridge.callHandler("initAppConfig", {'value':initAppConfigData}, function(responseData){});
		})
	


    document.write(unescape("%3Cscript src='/static/js/publicShare.js?v="+~(-new Date())+"'type='text/javascript'%3E%3C/script%3E"));
</script>
<?php
}
?>
</body>
</html>
