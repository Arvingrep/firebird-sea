<?php
/**
 * 普通上传处理插件
 *
 * @version        $Id: upfile.class.php 2013-11-17 上午16:14:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once('./common.inc.php');

header("Content-Type: text/html; charset=utf-8");

$mod      = htmlspecialchars(RemoveXSS($_REQUEST['mod']));
$type     = htmlspecialchars(RemoveXSS($_REQUEST['type']));
$obj      = htmlspecialchars(RemoveXSS($_REQUEST['obj']));
$filetype = htmlspecialchars(RemoveXSS($_REQUEST['filetype']));
?>

<script language="javascript">
<!--
function mysub(){
	document.getElementById("ztupform").style.display="none";
	document.getElementById("esave").style.display="block";
	document.getElementById('form').submit();
}

function uploaddo() {
	var f = document.getElementById('form');
	if (f.Filedata.value == '') return;
	mysub();
}

-->

</script>
<script type="text/javascript" src="/static/js/core/jquery-1.8.3.min.js" ></script>

<style type="text/css">

body {margin:0px; padding:0px;}
#esave {display:none; line-height:25px; font-size:12px;}
#esave img {display:inline-block; vertical-align:middle;}
.uploadbg {width:100px; height:25px; display:inline-block; cursor:pointer; overflow:hidden; background:url(../static/images/ui/swfupload/uploadbutton.png) no-repeat left top; overflow: hidden;}
#Filedata {filter:alpha(opacity=00); -moz-opacity:.0; opacity:0.0; cursor:pointer; width: 100px; overflow: hidden;}
.uploadbg  input{width: 100px; height: 25px; opacity: 0;}
</style>
<div id="esave"><img src="../static/images/ui/loading.gif" />&nbsp;正在上传...</div>
<div id="ztupform">
  <form method="post" id="form" action="upload.inc.php" enctype="multipart/form-data">
    <input type="hidden" name="mod" id="mod" value="<?php echo $mod;?>" />
    <input type="hidden" name="type" id="type" value="<?php echo $type;?>" />
    <input type="hidden" name="obj"  id="obj" value="<?php echo $obj;?>" />
    <input type="hidden" name="filetype" value="<?php echo $filetype;?>" />
    <span class="uploadbg" >
		<div class="uploadinp filePicker"  id="filePicker3" data-extensions="mp4,mov" data-mimeTypes="video/*" data-type="filenail" data-type-real="<?php echo $filetype;?>" data-count="1" data-size="{#$videoSize#}" data-imglist=""></div>
		<input type="hidden" name="Filedata" id="Filedata" onChange="uploaddo();">
	</span>
  </form>
</div>

<script type="text/javascript" src="/static/js/webuploader/webuploader.js" ></script>
<script type="text/javascript" >
	var picker = $('#filePicker3'), type = picker.data('type'), type_real = picker.data('type-real'), atlasMax = count = picker.data('count'), size = picker.data('size') * 1024, upType1, accept_title, accept_extensions = picker.data('extensions'), accept_mimeTypes = picker.data('mime');
	var pubStaticPath = (typeof staticPath != "undefined" && staticPath != "") ? staticPath : "/static/";
    var pubModelType = $("#mod").val();
	var type = $("#type").val();
	var filetype = $("input[name='filetype']").val();
	var obj = $("#obj").val();
	var serverUrl = '/include/upload.inc.php?mod='+pubModelType+'&type='+type+'&filetype='+filetype+(obj == 'front' || obj == 'back' ? '&obj='+obj : '');
	if(type=="video"){
		accept_title: 'mp4,mov';
		accept_extensions: 'mp4,mov';
		accept_mimeTypes: 'video/*';
	}else if(type == 'thumb' || type == 'card' || (type == 'adv' && filetype != 'flash')){
		accept_title = 'Images';
		accept_extensions = 'jpg,jpeg,gif,png';
		accept_mimeTypes = 'image/*';
	}else{
		accept_title = 'file';
		accept_extensions = '*';
		accept_mimeTypes = '*';
	}

	// 初始化Web Uploader
		uploader = WebUploader.create({
			auto: true,
			swf: pubStaticPath + 'js/webuploader/Uploader.swf',
			server: serverUrl,
			pick: '#filePicker3',
			fileVal: 'Filedata',
			accept: {
				title: accept_title,
				extensions: accept_extensions,
				mimeTypes: accept_mimeTypes
			},
			chunked: true,//开启分片上传
			// threads: 1,//上传并发数
			fileNumLimit: count,
			fileSingleSizeLimit: size,

		});
		uploader.on('fileQueued', function(file) {
			$("#ztupform").hide();
			$('#esave').show();

		})
		uploader.on('uploadProgress', function(file, percentage){
			$("#esave").html('<img src="../static/images/ui/loading.gif" />&nbsp;正在上传'+((percentage*100).toFixed(0))+'%')
		})
		uploader.on('uploadSuccess', function(file, response){
			if(response.state == "SUCCESS"){
				$("#Filedata").val(response.url);
				window.parent.uploadSuccess(obj,response.url, filetype,response.turl,response);
			}else{
				alert(response.state);
				location.reload();
			}
		})
</script>
