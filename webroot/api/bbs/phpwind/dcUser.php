<?php
/*
 * 插件名：会员批量导出
 * another: huoniao 
 */

require './src/wekit.php';
Wekit::init('windidclient');
Wind::application('windidclient', Wekit::S());
$database = include 'conf/database.php';
if(empty($database)) die('数据库配置文件载入失败！');

$page = $_GET['page'];
$pagenum = 100;
$excelfilename = 'memberData';
$excelfiletype = '.csv';
$thisphpname = $_SERVER['PHP_SELF'];

$floder = ".";
$isMakeData = "";
if(is_dir($floder)){
	if ($file = opendir($floder)){
		$fileArray = array();
		while ($f = readdir($file)){
			if(!is_dir($floder ."/". $f) AND $f != "." AND $f != "..") {
				if(strstr($f, $excelfilename)){
					if($_GET['action'] == "del"){
						unlinkFile($f);
					}else{
						$isMakeData = "&nbsp;&nbsp;<a href='".$thisphpname."?action=del'>删除已经生成的文件</a>";
					}
				}
			}
		}
		if($_GET['action'] == "del"){
			header("refresh:1;url=$thisphpname");
			echo "删除成功！";
			die;
		}
	}
}

$dbInfo = $database['dsn'];
$dbInfo = explode(";", $dbInfo);
$dbHost = explode("=", $dbInfo[0]);
$dbName = explode("=", $dbInfo[1]);
@mysql_connect($dbHost[1],$database['user'],$database['pwd']) or die('dbhost error!');
@mysql_select_db($dbName[1]) or die('db error!');
mysql_query("set names ".$database['charset']);
$tablepre = $database['tableprefix'];

$page = intval($page);
$page = max(1, $page);
$begin = ($page-1) * $pagenum;

$filename = $excelfilename."_".$page.$excelfiletype;

$allnum = intval($allnum);
if(!$allnum){
	$rs = mysql_fetch_assoc(mysql_query("SELECT count(*) as num FROM ".$tablepre."user WHERE `groupid` <> 7"));
	$allnum = $rs['num'];
}

$pageall = ceil($allnum/$pagenum);

if(!$_GET['page']){
	echo "<blockquote style='margin-top:40px;'><p>欢迎使用PHPWind会员导出插件。本插件将会员数据导出成csv格式，然后再通过主站后台的会员同步功能将数据导入到主站。</p>";
	echo "<p>共 <strong>{$pageall}</strong> 页(<strong>{$allnum}</strong>个会员）需要生成，每页最多导出 <strong>{$pagenum}</strong> 个会员。{$isMakeData}</p></blockquote>";
	echo "<ul>";
	for ($i = 0; $i < $pageall; $i++) {
		echo "<li style='line-height:30px;'><a href='$thisphpname?page=".($i+1)."'>生成第".($i+1)."页数据</a></li>";
	}
	echo "</ul>";
	echo "<blockquote style='margin-top:40px;'><p><small>备注：本功能自动将会员组别为【未验证会员】的会员过滤不导出！</small></p></blockquote>";
	die;
}

if(file_exists($filename)){
	unlinkFile($filename);
}

$content = "用户名,性别,出生日期,电子邮件,邮件激活,联系QQ,手机号码,真实姓名";
$rs = mysql_query("SELECT a.uid,a.username,b.gender,b.byear,b.bmonth,b.bday,a.email,a.realname,b.mobile,b.qq FROM ".$tablepre."user a INNER JOIN ".$tablepre."user_info b on a.uid = b.uid WHERE a.groupid <> 7 LIMIT $begin , $pagenum");
while ($rw = mysql_fetch_assoc($rs)) {
	$gender = $rw['gender'] == 1 ? 0 : 1;
	$content.="\n".$rw['username'].",".$gender.",".$rw['byear']."|".$rw['bmonth']."|".$rw['bday'].",".$rw['email'].",0,".$rw['qq'].",".$rw['mobile'].",".$rw['realname'];
}
$fp = fopen($filename, "a+");
@fwrite($fp, $content);
fclose($fp);

header("Content-Type: application/force-download");
header("Content-Disposition: attachment; filename=".basename($filename));
readfile("./".$filename);