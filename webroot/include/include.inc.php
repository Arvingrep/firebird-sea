<?php
/**
 * 载入脚本、样式
 *
 * @version        $Id: include.inc.php 2014-2-9 上午10:26:15 $
 * @package        HuoNiao.Libraries
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
 
$t = $_GET['t'];
$f = $_GET['f'];

if($t == "css"){
	header('Content-type: text/css; charset=utf-8');
}else{
	header('Content-type: text/javascript; charset=utf-8');
}

$path = "../";
$file = explode(",", $f);

$echo = array();

if($t == "css"){
	array_unshift($file, 'admin/datetimepicker.css');
	array_unshift($file, 'admin/common.css');
	array_unshift($file, 'admin/bootstrap.css');
}elseif($t == "js"){
	array_unshift($file, 'admin/common.js');
	array_unshift($file, 'ui/jquery.dialog-4.2.0.js');
	array_unshift($file, 'core/jquery-1.8.3.min.js');
}

foreach($file as $v => $k){
	$m_file = $path.($t == 'include' ? $t : 'static/'.$t).'/'.$k;
	$fp = @fopen($m_file,'r');
	$str = @fread($fp,filesize($m_file));
	@fclose($fp);
	if(!empty($str)){
		array_push($echo, "/* file:".$k." start */\r\n");
		array_push($echo, $str);
		array_push($echo, "\r\n/* file:".$k." end */\r\n");
		array_push($echo, "\r\n\r\n\r\n");
	}
}

if(empty($echo)){
	echo "Include File Error!";
}else{
	echo join("", $echo);
}