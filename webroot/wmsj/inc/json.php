<?php
/**
 *  异步JSON
 */

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);

$key = trim($key);

//检测FTP是否可连接
if($action == "checkFtpConn"){

	if(empty($ftpUrl)) die('{"state":"101","info":'.json_encode("请输入远程附件地址！").'}');
	if(empty($ftpServer)) die('{"state":"101","info":'.json_encode("请输入FTP服务器地址！").'}');
	if(empty($ftpDir)) die('{"state":"101","info":'.json_encode("请输入FTP上传目录！").'}');
	if(empty($ftpUser)) die('{"state":"101","info":'.json_encode("请输入FTP帐号！").'}');
	if(empty($ftpPwd)) die('{"state":"101","info":'.json_encode("请输入FTP密码！").'}');

	$ftpConfig = array(
		"on" => 1, //是否开启
		"host" => $ftpServer, //FTP服务器地址
		"port" => $ftpPort, //FTP服务器端口
		"username" => $ftpUser, //FTP帐号
		"password" => $ftpPwd,  //FTP密码
		"attachdir" => $ftpDir,  //FTP上传目录
		"attachurl" => $ftpUrl,  //远程附件地址
		"timeout" => $ftpTimeout,  //FTP超时
		"ssl" => $ftpSSL,  //启用SSL连接
		"pasv" => $ftpPasv  //被动模式连接
	);
	$huoniao_ftp = new ftp($ftpConfig);
	$huoniao_ftp->connect();
	if($huoniao_ftp->connectid) {

		$floder = create_check_code(10);
		if($huoniao_ftp->ftp_mkdir($floder)){

			$huoniao_ftp->ftp_rmdir($floder);
			echo '{"state":"100","info":'.json_encode("可以连接！").'}';

		}else{

			echo '{"state":"200","info":'.json_encode("远程FTP无写入权限，请修改服务器权限！").'}';

		}


	}else{
		echo '{"state":"200","info":'.json_encode("连接失败，请检查配置参数！").'}';
	}
	die;

//检测阿里云OSS是否可连接
}elseif($action == "checkOssConn"){

	if(empty($OSSUrl)) die('{"state":"101","info":'.json_encode("请输入服务器地址！").'}');
	if(empty($OSSBucket)) die('{"state":"101","info":'.json_encode("请输入Bucket名称！").'}');
	if(empty($OSSKeyID)) die('{"state":"101","info":'.json_encode("请输入Access Key ID！").'}');
	if(empty($OSSKeySecret)) die('{"state":"101","info":'.json_encode("请输入Access Key Secret！").'}');

	$OSSConfig = array(
		"bucketName" => $OSSBucket,
		"accessKey" => $OSSKeyID,
		"accessSecret" => $OSSKeySecret
	);

	$aliyunOSS = new aliyunOSS($OSSConfig);
	if($aliyunOSS->checkConn() == "成功") {
		echo '{"state":"100","info":'.json_encode("可以连接！").'}';
	}else{
		echo '{"state":"200","info":'.json_encode("连接失败，请检查配置参数！").'}';
	}
	die;

//检测系统默认FTP链接是否正常
}elseif($action == "checkSystemConn"){

	$isOk = true;

	if($cfg_ftpType == 0){
		$ftpConfig = array(
			"on" => 1, //是否开启
			"host" => $cfg_ftpServer, //FTP服务器地址
			"port" => $cfg_ftpPort, //FTP服务器端口
			"username" => $cfg_ftpUser, //FTP帐号
			"password" => $cfg_ftpPwd,  //FTP密码
			"attachdir" => $cfg_ftpDir,  //FTP上传目录
			"attachurl" => $cfg_ftpUrl,  //远程附件地址
			"timeout" => $cfg_ftpTimeout,  //FTP超时
			"ssl" => $cfg_ftpSSL,  //启用SSL连接
			"pasv" => $cfg_ftpPasv  //被动模式连接
		);
		$huoniao_ftp = new ftp($ftpConfig);
		$huoniao_ftp->connect();
		if(!$huoniao_ftp->connectid){
			$isOk = false;
		}
	}else{
		$OSSConfig = array(
			"bucketName" => $cfg_OSSBucket,
			"accessKey" => $cfg_OSSKeyID,
			"accessSecret" => $cfg_OSSKeySecret
		);
		$aliyunOSS = new aliyunOSS($OSSConfig);
		if($aliyunOSS->checkConn() != "成功") {
			$isOk = false;
		}
	}

	if($isOk) {
		echo '{"state":"100","info":'.json_encode("可以连接！").'}';
	}else{
		echo '{"state":"200","info":'.json_encode("连接失败，请检查配置参数！").'}';
	}
	die;

//检测启用帐号是否可用
}elseif($action == "checkMail"){
	if(!empty($mailUser)){
		$return = sendmail($mailUser, "系统测试邮件", "<center><br /><br />这是一封测试邮件，证明发送邮件系统正常。</center>");
		if(!empty($return)){
			echo '{"state":"200","info":'.json_encode("邮件发送失败，请检查邮箱帐号！").'}';
		}else{
			echo '{"state":"100","info":'.json_encode("测试邮件已发送到指定邮箱，请注意查收！&nbsp;&nbsp;如果没有收到邮件证明此帐号配置不正确 或 不支持发送邮件！").'}';
		}
	}else{
		echo '{"state":"200","info":'.json_encode("请输入测试帐号！").'}';
	}
	die;

//检测短信帐号是否可用
}elseif($action == "checkSMS"){
	if(!empty($mobile)){

		preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $mobile, $matchPhone);
		if(!$matchPhone){
			// die('{"state":"101","info":'.json_encode("手机号码格式错误！").'}');
		}

		//发送短信
		$return = sendsms($mobile, 0, "123456");
		if($return != "ok"){
			echo '{"state":"200","info":'.json_encode("发送失败，请检查帐号配置信息！").'}';
		}else{
			echo '{"state":"100","info":'.json_encode("测试短信已发送到指定手机，请注意查收！&nbsp;&nbsp;如果没有收到短信证明此帐号配置不正确！").'}';
		}
	}else{
		echo '{"state":"101","info":'.json_encode("请输入手机号码！").'}';
	}
	die;

//一键导入系统地址库
}elseif($action == "importAddr"){
	if(!empty($type) && !empty($id)){

		$intable = "INSERT INTO `".$DB_PREFIX.$type."addr` VALUES(";

		//获取所选城市的所有信息
		$addrListArr = $dsql->getTypeList($id, "site_area");

		//根据城市数据生成SQL语句
		$i = 0;
		function getSqlStr($data, $id){
			global $intable;
			global $i;
			$str = array();
			if(!empty($data)){
				foreach ($data as $key => $value) {
					$i++;

					global $type;
					if($type == "house"){
						$str[] = $intable . "'".$i."','".$id."','".$value['typename']."','".$key."','".GetMkTime(time())."','0','0');\r\n";
					}else{
						$str[] = $intable . "'".$i."','".$id."','".$value['typename']."','".$key."','".GetMkTime(time())."');\r\n";
					}
					//$str[] = $intable . "'".$i."','".$id."','".$value['typename']."','".$key."','".GetMkTime(time())."'".$el.");\r\n";
					if($value['lower']){
						$str[] = getSqlStr($value['lower'], $i);
					}
				}
			}
			return join("", $str);
		}

		$insertSql = getSqlStr($addrListArr, 0);
		$insertArr = explode("\r\n", $insertSql);

		if(!empty($insertArr)){

			//先清空表
			$userSql = $dsql->SetQuery("DELETE FROM `#@__".$type."addr`");
			$dsql->dsqlOper($userSql, "update");

			//执行导入数据
			foreach($insertArr as $q){
				if(!empty($q)){
					$dsql->dsqlOper(trim($q), "update");
				}
			}

			adminLog("导入系统地址库", $type);
			echo '{"state":"100","info":'.json_encode("导入成功！").'}';

		}else{
			echo '{"state":"200","info":'.json_encode("系统地址库为空，导入失败！").'}';
		}

	}
	die;

//获取会员信息
}elseif($action == "getMemberInfo"){
	if(!empty($id)){
		$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `qq`, `photo`, `sex`, `birthday`, `regtime`, `regip` FROM `#@__member` WHERE `id` = ".$id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;

//模糊匹配会员
}elseif($action == "checkUser"){
  $key = $_POST['key'];
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone`, `email` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;

//模糊匹配顾问
}elseif($action == "checkGw"){
  $key = $_POST['key'];
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT user.username, gw.id FROM `#@__house_gw` gw LEFT JOIN `#@__member` user ON user.id = gw.userid WHERE user.username like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;

//检查顾问是否已经存在
}elseif($action == "checkGw_"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND gw.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, gw.id FROM `#@__house_gw` gw LEFT JOIN `#@__member` user ON user.id = gw.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//模糊匹配小区
}elseif($action == "checkCommunity"){
  $key = $_POST['key'];
	if(!empty($key)){
		$commSql = $dsql->SetQuery("SELECT comm.id, comm.title, addr.typename, comm.addr FROM `#@__house_community` comm LEFT JOIN `#@__houseaddr` addr ON comm.addrid = addr.id WHERE comm.title like '%$key%' LIMIT 0, 10");
		$commResult = $dsql->dsqlOper($commSql, "results");
		if($commResult){
			echo json_encode($commResult);
		}
	}
	die;

//模糊匹配经纪人
}elseif($action == "checkZjUser"){
  $key = $_POST['key'];
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__house_zjuser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE user.username like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;

//检查经纪人是否已经存在（添加经纪人）
}elseif($action == "checkZjUser_"){
	$result = "";
  $key = $_POST['key'];
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND zj.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__house_zjuser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查经纪人是否已经存在（添加中介公司）
}elseif($action == "checkZjUser_1"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND zj.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.userid FROM `#@__house_zjcom` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//模糊匹配中介
}elseif($action == "checkZjCom"){
  $key = $_POST['key'];
	if(!empty($key)){
		$commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_zjcom` WHERE `title` like '%$key%' LIMIT 0, 10");
		$commResult = $dsql->dsqlOper($commSql, "results");
		if($commResult){
			echo json_encode($commResult);
		}
	}
	die;

//检查会员是否已经存在（添加商城店铺）
}elseif($action == "checkStoreUser_1"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND store.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__shop_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加建材公司）
}elseif($action == "checkStoreUser_2"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND store.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__".$type."_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加装修公司）
}elseif($action == "checkStoreUser_3"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND store.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__".$type."_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加装修团队）
}elseif($action == "checkTeamUser"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND team.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, team.id FROM `#@__".$type."_team` team LEFT JOIN `#@__member` user ON user.id = team.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加装修团队）
}elseif($action == "checkRenovationCompany"){
  $key = $_POST['key'];
	if(!empty($key)){
		$commSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$key%' LIMIT 0, 10");
		$commResult = $dsql->dsqlOper($commSql, "results");
		if($commResult){
			echo json_encode($commResult);
		}
	}
	die;

//检查会员是否已经存在（添加装修团队）
}elseif($action == "checkTeamCompany"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND store.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__".$type."_store` store LEFT JOIN `#@__member` user ON user.id = store.company WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//输入设计师（添加装修作品）
}elseif($action == "checkDesigner"){
  $key = $_POST['key'];
	if(!empty($key)){
		$teamSql = $dsql->SetQuery("SELECT `id`, `name`, `company` FROM `#@__renovation_team` WHERE `name` like '%$key%'");
		$teamResult = $dsql->dsqlOper($teamSql, "results");
		$return = array();
		if($teamResult){
			foreach($teamResult as $key => $val){
				$storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `id` = ".$val['company']);
				$storeResult = $dsql->dsqlOper($storeSql, "results");
				if($storeResult){
					$return[$key]['id'] = $val['id'];
					$return[$key]['name'] = $val['name'];
					$return[$key]['company'] = $storeResult[0]['company'];
				}
			}
		}
		echo json_encode($return);
	}
	die;

//检查设计师是否存在（添加装修作品）
}elseif($action == "checkDesignerName"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `name` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";

		$userSql = $dsql->SetQuery("SELECT team.id, team.name, store.id FROM `#@__".$type."_team` team LEFT JOIN `#@__".$type."_store` store ON team.company = store.id WHERE team.name = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo $result;
		}else{
			echo 200;
		}
	}
	die;

//检查会员是否已经存在（添加招聘企业）
}elseif($action == "checkCompanyUser_job"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND company.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__".$type."_company` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//模糊匹配招聘企业
}elseif($action == "checkJobCompany"){
  $key = $_POST['key'];
	if(!empty($key)){
		$commSql = $dsql->SetQuery("SELECT `id`, `title`, `contact`, `email` FROM `#@__job_company` WHERE `title` like '%$key%' LIMIT 0, 10");
		$commResult = $dsql->dsqlOper($commSql, "results");
		if($commResult){
			echo json_encode($commResult);
		}
	}
	die;

//检查会员是否已经存在（添加招聘简历）
}elseif($action == "checkResumeUser_job"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone`, `email` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND resume.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, user.email, resume.id FROM `#@__".$type."_resume` resume LEFT JOIN `#@__member` user ON user.id = resume.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经添加过网站（自助建站）
}elseif($action == "checkWebsiteUser"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND ws.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.nickname, ws.id FROM `#@__website` ws LEFT JOIN `#@__member` user ON user.id = ws.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经开通交友功能
}elseif($action == "checkDating"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND dating.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, dating.id FROM `#@__dating_member` dating LEFT JOIN `#@__member` user ON user.id = dating.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经开通交友成功故事
}elseif($action == "checkDatingStory"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND story.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, story.id FROM `#@__dating_story` story LEFT JOIN `#@__member` user ON (user.id = story.fid OR user.id = story.tid) WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加婚嫁酒店）
}elseif($action == "checkUser_marry"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND company.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__marry_".$type."` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加汽车经销商）
}elseif($action == "checkUser_car"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND company.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__car_".$type."` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//检查会员是否已经存在（添加外卖餐厅）
}elseif($action == "checkUser_waimai"){
  $key = $_POST['key'];
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND company.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__waimai_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

}
