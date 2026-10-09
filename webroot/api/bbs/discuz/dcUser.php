<?php
/*
 * 插件名：会员批量导出
 * another: huoniao 
 */

require './source/class/class_core.php';
$discuz = & discuz_core::instance();
$discuz->init();
include(DISCUZ_ROOT.'./config/config_ucenter.php');
if($_G['groupid'] != 1) showmessage("对不起，您不是管理员！请用管理账户登录论坛，再进行该页面操作。");

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

@mysql_connect(UC_DBHOST,UC_DBUSER,UC_DBPW) or die('dbhost error!');
@mysql_select_db(UC_DBNAME) or die('db error!');
mysql_query("set names ".UC_DBCHARSET);
$tablepre = UC_DBTABLEPRE;

$page = intval($page);
$page = max(1, $page);
$begin = ($page-1) * $pagenum;

$filename = $excelfilename."_".$page.$excelfiletype;

$allnum = intval($allnum);
if(!$allnum){
	$rs = mysql_fetch_assoc(mysql_query("SELECT count(*) as num FROM ".DB::table('common_member')." a INNER JOIN ".DB::table('common_member_profile')." b on a.uid=b.uid WHERE a.groupid <> 1 AND a.groupid <> 5 AND a.groupid <> 8"));
	$allnum = $rs['num'];
}

$pageall = ceil($allnum/$pagenum);

if(!$_GET['page']){
	echo "<blockquote style='margin-top:40px;'><p>欢迎使用Discuz会员导出插件。本插件将会员数据导出成csv格式，然后再通过主站后台的会员同步功能将数据导入到主站。</p>";
	echo "<p>共 <strong>{$pageall}</strong> 页(<strong>{$allnum}</strong>个会员）需要生成，每页最多导出 <strong>{$pagenum}</strong> 个会员。{$isMakeData}</p></blockquote>";
	echo "<ul>";
	for ($i = 0; $i < $pageall; $i++) {
		echo "<li style='line-height:30px;'><a href='$thisphpname?page=".($i+1)."'>生成第".($i+1)."页数据</a></li>";
	}
	echo "</ul>";
	echo "<blockquote style='margin-top:40px;'><p><small>备注：本功能自动将会员组别为：【管理员】、【禁止访问】、【等待验证会员】的会员过滤不导出！</small></p></blockquote>";
	die;
}

if(file_exists($filename)){
	unlinkFile($filename);
}

$content = "用户名,性别,出生日期,电子邮件,邮件激活,联系QQ,手机号码,真实姓名";
$rs = mysql_query("SELECT a.uid,a.username,b.gender,b.birthyear,b.birthmonth,b.birthday,a.email,a.emailstatus,b.realname ,b.mobile ,b.qq FROM ".DB::table('common_member')." a INNER JOIN ".DB::table('common_member_profile')." b on a.uid = b.uid WHERE a.groupid <> 1 AND a.groupid <> 5 AND a.groupid <> 8 LIMIT $begin , $pagenum");
while ($rw = mysql_fetch_assoc($rs)) {
	$content.="\n".$rw['username'].",".$rw['gender'].",".$rw['birthyear']."|".$rw['birthmonth']."|".$rw['birthday'].",".$rw['email'].",".$rw['emailstatus'].",".$rw['qq'].",".$rw['mobile'].",".$rw['realname'];
}
$fp = fopen($filename, "a+");
@fwrite($fp, $content);
fclose($fp);

header("Content-Type: application/force-download");
header("Content-Disposition: attachment; filename=".basename($filename));
readfile("./".$filename);