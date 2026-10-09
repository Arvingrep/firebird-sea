<?php
/**
 * 在地图上画多边形
 *
 * @version        $Id: shape.php 2014-10-21 下午14:20:41 $
 * @package        HuoNiao.Map
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/../../include/common.inc.php');

if($mod == "") die('Module Err!');

$config = HUONIAOINC."/config/".$mod.".inc.php";
if(!is_file($config)) die('Config Error!');
include_once($config);

global $cfg_map;
global $cfg_basedir;
global $custom_map;
$dituType = "";

if($custom_map != 0){
	$cfg_map = $custom_map;
}

$lnglat = $_GET['lnglat'];
if(!empty($lnglat)){
	$lnglat = explode(",", $lnglat);
	$lng = $lnglat[0] == "undefined" ? 0 : $lnglat[0];
	$lat = $lnglat[1] == "undefined" ? 0 : $lnglat[1];
}else{
	$lat = 0;
	$lng = 0;
}?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>鼠标绘制工具</title>
<?php
$jsApiFile = "";
//google
if($cfg_map == 1){
	global $cfg_map_google;
	$dituType = 'google';
	$jsApiFile = '//maps.google.cn/maps/api/js?key='.$cfg_map_google.'&sensor=false&language=zh-CN';
?>
<style type="text/css">
html, body {height:100%;margin:0px;padding:0px}
#map {height:100%;}
.toolbar {position:absolute; right:-13px; top:0px; z-index:10; height:47px; border:1px solid #666; border-radius:5px; overflow:hidden; box-shadow:1px 1px 3px rgba(0,0,0,0.3); -webkit-transform:scale(0.8); transform:scale(0.8);}
.toolbar a {border-right:1px solid #d2d2d2; float:left; height:100%; width:64px; height:100%; background-image:url(//api.map.baidu.com/library/DrawingManager/1.4/src/bg_drawing_tool.png); cursor:pointer;}
.toolbar a#hand_b {background-position:0 0;}
.toolbar a#hand_b.selected {background-position:0 -52px;}
.toolbar a#shape_b {background-position:-260px 0;}
.toolbar a#shape_b.selected {background-position:-260px -52px;}
.toolbar a.del {border-right:0; background:url('/static/images/ui/map_del.png');}
</style>
<?php
//baidu
}elseif($cfg_map == 2){
	global $cfg_map_baidu;
	$dituType = 'baidu';
	$jsApiFile = '//api.map.baidu.com/api?v=2.0&ak='.$cfg_map_baidu;
?>
<style type="text/css">
html, body {height:100%;margin:0px;padding:0px}
#map {height:100%;}
.BMapLib_Drawing .BMapLib_box.BMapLib_del {background:url('/static/images/ui/map_del.png')}
</style>
<?php
//tencent
}elseif($cfg_map == 3){
	global $cfg_map_qq;
	$dituType = 'qq';
	$jsApiFile = '//map.qq.com/api/js?key='.$cfg_map_qq.'&libraries=drawing';
?>
<style type="text/css">
html, body {height:100%;margin:0px;padding:0px}
#map {height:100%;}
.toolbar {position:absolute; right:-13px; top:0px; z-index:10; height:47px; border:1px solid #666; border-radius:5px; overflow:hidden; box-shadow:1px 1px 3px rgba(0,0,0,0.3); -webkit-transform:scale(0.8); transform:scale(0.8);}
.toolbar a {border-right:1px solid #d2d2d2; float:left; height:100%; width:64px; height:100%; background-image:url(//api.map.baidu.com/library/DrawingManager/1.4/src/bg_drawing_tool.png); cursor:pointer;}
.toolbar a#hand_b {background-position:0 0;}
.toolbar a#hand_b.selected {background-position:0 -52px;}
.toolbar a#shape_b {background-position:-260px 0;}
.toolbar a#shape_b.selected {background-position:-260px -52px;}
.toolbar a.del {border-right:0; background:url('/static/images/ui/map_del.png');}
</style>
<?php
//高德
}elseif($cfg_map == 4){
	global $cfg_map_amap;
	global $cfg_map_amap_jscode;
	$dituType = 'amap';
	$jsApiFile = '//webapi.amap.com/maps?v=1.4.15&key='.$cfg_map_amap;
	echo '<script>window._AMapSecurityConfig = {securityJsCode:"'.$cfg_map_amap_jscode.'"}</script>';
?>
<style type="text/css">
html, body {height:100%;margin:0px;padding:0px}
#map {height:100%;}
.toolbar {position:absolute; right:-5px; top:0px; z-index:10; height:47px; border:1px solid #666; border-radius:5px; overflow:hidden; box-shadow:1px 1px 3px rgba(0,0,0,0.3); -webkit-transform:scale(0.8); transform:scale(0.8);}
.toolbar a {float:left; height:100%; width:64px; height:100%; cursor:pointer;}
.toolbar a.ok {background:url('/static/images/ui/map_ok.png'); border-right:1px solid #ccc;}
.toolbar a.del {background:url('/static/images/ui/map_del.png');}
</style>
<?php
}
?>
<script type="text/javascript" src="<?php echo $jsApiFile; ?>"></script>
<script src="<?php $cfg_basedir ?>/static/js/core/jquery-1.8.3.min.js"></script>
<?php
if($cfg_map == 2 && $type != 1){
?>
<!--加载鼠标绘制工具-->
<script type="text/javascript" src="//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>
<link rel="stylesheet" href="//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" />
<?php
}
?>
<script src="<?php $cfg_basedir ?>/static/js/ui/map/<?php echo $dituType; ?>/shape.js?v=<?php echo $cfg_staticVersion;?>"></script>
<!-- <script>document.domain = '<?php echo $cfg_basehost;?>';</script> -->
</head>

<body>
<?php
//google
if($cfg_map == 1 && $type != 1){
?>
<div class="toolbar">
  <a class="selected" href="javascript:void(0)" id="hand_b" title="拖动地图" onfocus="this.blur()"></a>
  <a href="javascript:void(0)" id="shape_b" title="画多边形" onfocus="this.blur()"></a>
  <a class="del" href="javascript:void(0)" title="删除重画" onfocus="this.blur()"></a>
</div>
<?php
//tencent
}elseif($cfg_map == 3 && $type != 1){
?>
<div class="toolbar">
  <a class="selected" href="javascript:void(0)" id="hand_b" title="拖动地图" onfocus="this.blur()"></a>
  <a href="javascript:void(0)" id="shape_b" title="画多边形" onfocus="this.blur()"></a>
  <a class="del" href="javascript:void(0)" title="删除重画" onfocus="this.blur()"></a>
</div>
<?php
//高德
}elseif($cfg_map == 4 && $type != 1){
?>
<div class="toolbar">
  <a class="ok" href="javascript:void(0)" title="拖动地图" onfocus="this.blur()"></a>
  <a class="del" href="javascript:void(0)" title="删除重画" onfocus="this.blur()"></a>
</div>
<?php
}
?>
<div id="map"></div>
<input type="hidden" name="type" id="type" value="<?php echo $type; ?>" />
<input type="hidden" name="lng" id="lng" value="<?php echo $lng; ?>" />
<input type="hidden" name="lat" id="lat" value="<?php echo $lat; ?>" />
<input type="hidden" name="overlays" id="overlays" value="<?php echo $range; ?>" />
</body>
</html>
