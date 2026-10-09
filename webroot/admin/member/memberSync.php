<?php
/**
 * 会员同步
 *
 * @version        $Id: memberSync.php 2015-1-2 下午16:44:21 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member";
$templates = "memberSync.html";

//跳转到一下页的JS
$gotojs = "\r\nfunction GotoNextPage(){
    document.gonext."."submit();
}"."\r\nset"."Timeout('GotoNextPage()',1500);";
$dojs = "<script language='javascript'>$gotojs\r\n</script>";
$action = $_GET['action'];

//同步所有会员
if($action == "syncAll"){

	$pagestep = 20;
	$page     = $page == "" ? 1 : $page;
	$err      = $err  == "" ? array() : explode(",", $err);
	$errArr   = $errArr  == "" ? array() : explode(",", $errArr);
	$dirArr   = array();

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE `mgroupid` = 0");

	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= "WHERE `mgroupid` = 0 LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `email`, `phone`, `qq`, `sex`, `birthday` FROM `#@__".$db."`".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0 && $page <= $totalPage){

		foreach ($results as $key => $value) {
			$id       = $results[$key]['id'];
			$username = $results[$key]['username'];
			$nickname = $results[$key]['nickname'];
			$email    = $results[$key]['email'];
			$phone    = $results[$key]['phone'];
			$qq       = $results[$key]['qq'];
			$sex      = $results[$key]['sex'];
			$birthday = $results[$key]['birthday'];

			$data['username'] = $username;
			$data['nickname'] = $nickname;
			$data['email']    = $email;
			$data['phone']    = $phone;
			$data['qq']       = $qq;
			$data['sex']      = $sex;
			$data['birthday'] = $birthday;
			$state = $userLogin->bbsSync($data, "register");

			if($state == "同步成功"){
				$cla = 'text-success';
			}else{
				$cla = 'text-error';
				$err[] = $id;
				$errArr[] = $state;
			}

			$dirArr[] = '<p>会员：'.$username.'&nbsp;&nbsp;<span class='.$cla.'>'.$state.'</span></p>';

		}

		$errInfo = !empty($err) ? "失败".count($err)."个，" : "";
		$atCount = $totalCount > $pagestep * $page ? $pagestep * $page : $totalCount;
		$isSync = $totalCount > $pagestep ? $atCount : $totalCount;
		$notSync = $totalCount-$pagestep*$page;
		$tmsg  = "<div class='progress progress-striped active' style='width:90%; margin:10px auto;'><div class='bar' style='width: ".round(($page/$totalPage)*100)."%;'>".$isSync."/".$totalCount."</div></div>\r\n";
	  $tmsg .= "<p class='text-success' style='text-align:center;'>已同步".$isSync."个会员，{$errInfo}还剩：".($notSync < 0 ? 0 : $notSync)."个未同步</p>\r\n\r\n";
	  $tmsg .= join("", $dirArr);
	  $doneForm  = "<form name='gonext' method='post' action='memberSync.php?action=syncAll'>\r\n";
	  $doneForm .= "  <input type='hidden' name='page' value='".($page+1)."' />\r\n";
		$doneForm .= "  <input type='hidden' name='err' value='".join(",", $err)."' />\r\n";
		$doneForm .= "  <input type='hidden' name='errArr' value='".join(",", $errArr)."' />\r\n</form>\r\n{$dojs}";
	  PutInfo($tmsg,$doneForm);
	  exit();

	//同步完成
	}else{
		$errInfo = !empty($err) ? "，失败".count($err)."个！</h4><br />" : "</h4>";
		$errList = array();
		foreach ($err as $key => $value) {
			$archives = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__".$db."` WHERE `id` = ".$value);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$errList[] = '<p align=left>'.$results[0]['username']."=>".$results[0]['nickname'].'&nbsp;&nbsp;&nbsp;<span class=text-error>'.$errArr[$key].'</span></p>';
			}
		}
		adminLog("同步所有会员");
		ShowMsg('<h4>操作完成！成功同步'.$totalCount.'个会员'.$errInfo.join("", $errList), 'memberSync.php', 0, 20000);
		exit();
	}

//同步选择的会员
}elseif($action == "syncSelect"){
	if(!empty($id)){
		$ids = explode(",", $id);

		$err      = $err  == "" ? array() : explode(",", $err);
		$errArr   = $errArr  == "" ? array() : explode(",", $errArr);
		$dirArr   = array();

		foreach ($ids as $key => $value) {
			$archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `email`, `phone`, `qq`, `sex`, `birthday` FROM `#@__".$db."` WHERE `id` = ".$value);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$id       = $results[0]['id'];
				$username = $results[0]['username'];
				$nickname = $results[0]['nickname'];
				$email    = $results[0]['email'];
				$phone    = $results[0]['phone'];
				$qq       = $results[0]['qq'];
				$sex      = $results[0]['sex'];
				$birthday = $results[0]['birthday'];

				$data['username'] = $username;
				$data['nickname'] = $nickname;
				$data['email']    = $email;
				$data['phone']    = $phone;
				$data['qq']       = $qq;
				$data['sex']      = $sex;
				$data['birthday'] = $birthday;
				$state = $userLogin->bbsSync($data, "register");

				if($state == "同步成功"){
					$cla = 'text-success';
				}else{
					$cla = 'text-error';
					$err[] = $id;
					$errArr[] = $state;
				}

				$dirArr[] = '<p align=left>会员：'.$username.'&nbsp;&nbsp;<span class='.$cla.'>'.$state.'</span></p>';
			}
		}

		$errInfo = !empty($err) ? "，失败".count($err)."个！</h4><br />" : "</h4>";
		$errList = array();
		foreach ($err as $key => $value) {
			$archives = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__".$db."` WHERE `id` = ".$value);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$errList[] = '<p align=left>'.$results[0]['username']."=>".$results[0]['nickname'].'&nbsp;&nbsp;&nbsp;<span class=text-error>'.$errArr[$key].'</span></p>';
			}
		}
		adminLog("同步所选会员", $id);
		ShowMsg('<h4>操作完成！成功同步'.(count($ids)-count($err)).'个会员'.$errInfo.join("", $dirArr), 'memberSync.php', 0, 20000);
		exit();

	}else{
		ShowMsg('请选择要同步的会员！', 'memberSync.php', 0, 2000);
		exit();
	}

//同步所有符合条件的会员
}elseif($action == "syncFilter"){

	$pagestep = 20;
	$page     = $page == "" ? 1 : $page;
	$err      = $err  == "" ? array() : explode(",", $err);
	$errArr   = $errArr  == "" ? array() : explode(",", $errArr);
	$dirArr   = array();

	$where = " AND `mgroupid` = 0";

	if($sKeyword != ""){
		$where .= " AND (`username` like '%$sKeyword%' OR `discount` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `email` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `regip` like '%$sKeyword%' OR `company` like '%$sKeyword%')";
	}

	if($mtype != ""){
		$where .= " AND `mtype` = ".$mtype;
	}

	if($start != ""){
		$where .= " AND `regtime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `regtime` <= ". GetMkTime($end);
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	$totalPage = ceil($totalCount/$pagestep);

	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `email`, `phone`, `qq`, `sex`, `birthday` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0 && $page <= $totalPage){

		foreach ($results as $key => $value) {
			$id       = $results[$key]['id'];
			$username = $results[$key]['username'];
			$nickname = $results[$key]['nickname'];
			$email    = $results[$key]['email'];
			$phone    = $results[$key]['phone'];
			$qq       = $results[$key]['qq'];
			$sex      = $results[$key]['sex'];
			$birthday = $results[$key]['birthday'];

			$data['username'] = $username;
			$data['nickname'] = $nickname;
			$data['email']    = $email;
			$data['phone']    = $phone;
			$data['qq']       = $qq;
			$data['sex']      = $sex;
			$data['birthday'] = $birthday;
			$state = $userLogin->bbsSync($data, "register");

			if($state == "同步成功"){
				$cla = 'text-success';
			}else{
				$cla = 'text-error';
				$err[] = $id;
				$errArr[] = $state;
			}

			$dirArr[] = '<p>会员：'.$username.'&nbsp;&nbsp;<span class='.$cla.'>'.$state.'</span></p>';

		}

		$errInfo = !empty($err) ? "失败".count($err)."个，" : "";
		$atCount = $totalCount > $pagestep * $page ? $pagestep * $page : $totalCount;
		$isSync = $totalCount > $pagestep ? $atCount : $totalCount;
		$notSync = $totalCount-$pagestep*$page;
		$tmsg  = "<div class='progress progress-striped active' style='width:90%; margin:10px auto;'><div class='bar' style='width: ".round(($page/$totalPage)*100)."%;'>".$isSync."/".$totalCount."</div></div>\r\n";
	  $tmsg .= "<p class='text-success' style='text-align:center;'>已同步".$isSync."个会员，{$errInfo}还剩：".($notSync < 0 ? 0 : $notSync)."个未同步</p>\r\n\r\n";
	  $tmsg .= join("", $dirArr);
	  $doneForm  = "<form name='gonext' method='post' action='memberSync.php?action=syncFilter'>\r\n";
	  $doneForm .= "  <input type='hidden' name='page' value='".($page+1)."' />\r\n";
		$doneForm .= "  <input type='hidden' name='sKeyword' value='".$sKeyword."' />\r\n";
		$doneForm .= "  <input type='hidden' name='mtype' value='".$mtype."' />\r\n";
		$doneForm .= "  <input type='hidden' name='start' value='".$start."' />\r\n";
		$doneForm .= "  <input type='hidden' name='end' value='".$end."' />\r\n";
		$doneForm .= "  <input type='hidden' name='state' value='".$state."' />\r\n";
		$doneForm .= "  <input type='hidden' name='err' value='".join(",", $err)."' />\r\n";
		$doneForm .= "  <input type='hidden' name='errArr' value='".join(",", $errArr)."' />\r\n</form>\r\n{$dojs}";
	  PutInfo($tmsg,$doneForm);
	  exit();

	//同步完成
	}else{
		$errInfo = !empty($err) ? "，失败".count($err)."个！</h4><br />" : "</h4>";
		$errList = array();
		foreach ($err as $key => $value) {
			$archives = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__".$db."` WHERE `id` = ".$value);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$errList[] = '<p align=left>'.$results[0]['username']."=>".$results[0]['nickname'].'&nbsp;&nbsp;&nbsp;<span class=text-error>'.$errArr[$key].'</span></p>';
			}
		}
		adminLog("同步所有符合条件的会员");
		ShowMsg('<h4>操作完成！成功同步'.($totalCount-count($err)).'个会员'.$errInfo.join("", $errList), 'memberSync.php', 0, 20000);
		exit();
	}

//从论坛导入
}elseif($action == "syncBBS"){
	$templates = "memberSyncBBS.html";

	//导入操作
	if($_FILES){
		$file = $_FILES['userData'];
		$type = array("csv");
		$errList = array();
		$sucess = 0;
		$fileType = strtolower(fileext($file['name']));

		//判断文件类型
		if(!in_array($fileType, $type)){
			ShowMsg("导入的文件类型不正确，请选择使用插件下载的用户数据！", 'memberSync.php?action=syncBBS', 0, 1500);
			die;
		}

		$temp_name = $file['tmp_name'];
		$fileNewPath = HUONIAOROOT."/uploads/".$file['name'];

		if(file_exists($temp_name) && move_uploaded_file($temp_name, $fileNewPath)){

			setlocale(LC_ALL, 'zh_CN.UTF-8');
			$file = fopen($fileNewPath, "r");
			$userArr = array();
			$i = 0;
			if($file !== FALSE){
				while (($data = fgetcsv($file, 1000, ",")) !== FALSE) {
					$num = count($data);
					if($i > 0){
						$userArr[$i] = array();
						$userArr[$i]["username"] = $data[0];
						$userArr[$i]["sex"] = ($data[1] == 0) ? 1 : (($data[1] == 2) ? 0 : $data[1]);
						$userArr[$i]["birthday"] = $data[2] == "0|0|0" ? "" : GetMkTime(str_replace("|", "-", $data[2]));
						$userArr[$i]["email"] = $data[3];
						$userArr[$i]["emailCheck"] = $data[4];
						$userArr[$i]["qq"] = $data[5];
						$userArr[$i]["phone"] = $data[6];
						$userArr[$i]["realname"] = $data[7];
					}
					$i++;
				}
				fclose($file);
			}
			unlinkFile($fileNewPath);

			//注册会员
			foreach ($userArr as $key => $value) {
				//判断是否已经存在，如果存在则自动登录
				$sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `username` = '".$value['username']."' LIMIT 1");
				$results = $dsql->dsqlOper($sql, "results");

				if(!$results){
					$regtime  = GetMkTime(time());
					$regip    = GetIP();
					$sql = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `qq`, `sex`, `birthday`, `regtime`, `regip`, `state`, `regfrom`) VALUES (1, '".$value['username']."', '".$value['realname']."', '".$value['email']."', '".$value['emailCheck']."', '".$value['phone']."', '0', '".$value['qq']."', '".$value['sex']."', '".$value['birthday']."', '$regtime', '$regip', '1', 'bbs')");
					$rid = $dsql->dsqlOper($sql, "lastid");

					//注册成功，登录
					if($rid){
						$sucess++;
					}else{
						$errList[] = '<p align=left>'.$value['username']."=>".$value['realname'].'&nbsp;&nbsp;&nbsp;<span class=text-error>导入失败</span></p>';
					}
				}else{
					$errList[] = '<p align=left>'.$value['username']."=>".$value['realname'].'&nbsp;&nbsp;&nbsp;<span class=text-error>会员已存在</span></p>';
				}
			}

			$errInfo = !empty($errList) ? "，失败".count($errList)."个！</h4><br />" : "</h4>";

			adminLog("导入论坛会员");
			ShowMsg('<h4>操作完成！成功导入'.$sucess.'个会员'.$errInfo.join("", $errList), 'memberSync.php', 0, 20000);
			exit();

		}else{
			ShowMsg("导入的文件不存在或已删除，请重新导入！", 'memberSync.php?action=syncBBS', 0, 1500);
		}

		die;
	}

//下载插件
}elseif($action == "download"){
	header("Content-Type: application/force-download");
	header("Content-Disposition: attachment; filename=dcUser.php");
	readfile(HUONIAOROOT."/api/bbs/".$cfg_bbsType."/dcUser.php");
	die;
}

function fileext($filename){
	return substr(strrchr($filename, '.'), 1);
}


function PutInfo($msg1,$msg2){
	$htmlhead  = "<html>\r\n<head>\r\n<title>温馨提示</title>\r\n";
	$htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=".$GLOBALS['cfg_soft_lang']."\" />\r\n";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/bootstrap.css?v=4' />";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/common.css?v=1111' />";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n";
    $htmlfoot  = "</body>\r\n</html>";
	$rmsg  = "<div class='s-tip'><div class='s-tip-head'><h1>".$GLOBALS['cfg_soft_enname']." 提示：</h1></div>\r\n";
    $rmsg .= "<div class='s-tip-body' style='text-align:left;'>".str_replace("\"","“",$msg1)."\r\n".$msg2."\r\n";
    $msginfo = $htmlhead.$rmsg.$htmlfoot;
    echo $msginfo;
}


//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/member/memberSync.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

//获取会员列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `mgroupid` = 0";

	if($sKeyword != ""){
		$where .= " AND (`username` like '%$sKeyword%' OR `discount` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `email` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `regip` like '%$sKeyword%' OR `company` like '%$sKeyword%')";
	}

	if($mtype != ""){
		$where .= " AND `mtype` = ".$mtype;
	}

	if($start != ""){
		$where .= " AND `regtime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `regtime` <= ". GetMkTime($end);
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//正常
	$normal = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//锁定
	$lock = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `mtype`, `username`, `discount`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `company`, `photo`, `sex`, `money`, `point`, `regtime`, `regip`, `lastlogintime`, `lastloginip`, `state` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]         = $value["id"];
			$list[$key]["mtype"]      = $value["mtype"];
			$list[$key]["username"]   = $value["username"];
			$list[$key]["discount"]   = $value["discount"];
			$list[$key]["nickname"]   = $value["nickname"];
			$list[$key]["email"]      = $value["email"];
			$list[$key]["emailCheck"] = $value["emailCheck"];
			$list[$key]["phone"]      = $value["phone"];
			$list[$key]["phoneCheck"] = $value["phoneCheck"];
			$list[$key]["company"]    = $value["company"];
			$list[$key]["photo"]      = $value["photo"];
			$list[$key]["sex"]        = $value["sex"] ? "男" : "女";
			$list[$key]["money"]      = $value["money"];
			$list[$key]["point"]      = $value["point"];
			$list[$key]["regtime"]    = date("Y-m-d H:i:s", $value["regtime"]);
			$list[$key]["regip"]      = $value["regip"];
			$list[$key]["lastlogintime"]= empty($value["lastlogintime"]) ? "还未登录" : date("Y-m-d H:i:s", $value["lastlogintime"]);
			$list[$key]["lastloginip"]= $value["lastloginip"];
			$list[$key]["state"]      = $value["state"];
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.', "lock": '.$lock.'}, "memberList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.', "lock": '.$lock.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.', "lock": '.$lock.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
