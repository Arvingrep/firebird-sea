<?php
/**
 * 会员消息
 *
 * @version        $Id: memberLetter.php 2015-11-16 下午15:09:22 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberLetter");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "memberLetter.html";

$action = "member_letter";


//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'admin/member/memberLetter.js'
);

//列出所有管理员
$archives = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `mgroupid` != ''");
$results = $dsql->dsqlOper($archives, "results");
$huoniaoTag->assign('adminList', json_encode($results));

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//关键词
	if(!empty($sKeyword)){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	if($admin != ""){
		$where .= " AND `admin` = ". $admin;
	}

	if($start != ""){
		$where .= " AND `date` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND `date` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	//系统消息
	$state0 = $dsql->dsqlOper($archives.$where." AND `type` = 0", "totalCount");
	//邮件
	$state1 = $dsql->dsqlOper($archives.$where." AND `type` = 1", "totalCount");
	//短信
	$state2 = $dsql->dsqlOper($archives.$where." AND `type` = 2", "totalCount");
	//APP
	$state3 = $dsql->dsqlOper($archives.$where." AND `type` = 3", "totalCount");
	//微信
	$state4 = $dsql->dsqlOper($archives.$where." AND `type` = 4", "totalCount");

	//类型
	if($type != ""){

		$where .= " AND `type` = $type";

		if($type == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($type == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($type == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($type == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($type == 4){
			$totalPage = ceil($state4/$pagestep);
		}

	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["admin"] = $value["admin"];

			//用户名
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["admin"]);
			$username = $dsql->dsqlOper($userSql, "results");
			if(count($username) > 0){
				$list[$key]["username"] = $username[0]['username'];
			}else{
				$list[$key]["username"] = "平台";
			}

			$list[$key]["type"] = $value["type"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["success"] = $value["success"];
			$list[$key]["error"] = $value["error"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);

			//如果是系统消息，则显示已读和未读数量
			if($value['type'] == 0){

				//未读
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_log` WHERE `state` = 0 AND `lid` = ".$value['id']);
				$nread = $dsql->dsqlOper($sql, "totalCount");
				$list[$key]["nread"] = (int)$nread;

				//已读
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_log` WHERE `state` = 1 AND `lid` = ".$value['id']);
				$iread = $dsql->dsqlOper($sql, "totalCount");
				$list[$key]["iread"] = (int)$iread;

			}

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}}';
	}
	die;


//新增
}elseif($dopost == "add"){

	//发送
	if($submit == "提交"){

		if(empty($title)) die('{"state": 200, "info": "请输入标题"}');
		if(empty($body)) die('{"state": 200, "info": "请输入内容"}');

		$userArr = array();

		$select = "`id`";
		$where = " AND `state` = 1";
		if($type == 1){
			$select .= ", `email`";
			$where .= " AND `emailCheck` = 1";
		}elseif($type == 2){
			$select .= ", `phone`";
			$where .= " AND `phoneCheck` = 1";
		}elseif($type == 4){
			$select .= ", `wechat_openid`";
			$where .= " AND `wechat_openid` != ''";
		}

		$userType = (int)$_POST['userType'];

		//所有会员
		if($userType == 0){

			$sql = $dsql->SetQuery("SELECT $select FROM `#@__member` WHERE `mtype` != 0".$where);

		//个人会员
		}elseif($userType == 1){

			$sql = $dsql->SetQuery("SELECT $select FROM `#@__member` WHERE `mtype` = 1".$where);

		//企业会员
		}elseif($userType == 2){

			$sql = $dsql->SetQuery("SELECT $select FROM `#@__member` WHERE `mtype` = 2".$where);


		//在线会员
		}elseif($userType == 3){

			$sql = $dsql->SetQuery("SELECT $select FROM `#@__member` WHERE `mtype` != 0 AND `online` != 0".$where);


		//指定会员
		}elseif($userType == 4){

			if(empty($users)) die('{"state": 200, "info": "请输入会员名"}');
			$usersArr = explode(",", $users);
			$idsArr = array();

			foreach ($usersArr as $key => $value) {
				$s = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$value'".$where);
				$ret = $dsql->dsqlOper($s, "results");

				if($ret){
					foreach ($ret as $k => $v) {
						$idsArr[] = $v['id'];
					}
				}
			}

			if(!empty($idsArr)){
				$sql = $dsql->SetQuery("SELECT $select FROM `#@__member` WHERE `id` in (".join(",", $idsArr).")");
			}else{
				die('{"state": 200, "info": "没有符合条件的会员"}');
			}

		}


		//推送给所有设备（APP）
		if($userType == 5){
			sendapppush(0, $title, $_POST['body'], $_POST['url'], 'default', true);
			die('{"state": 100, "info": "发送完成，请到推送平台查看统计信息！"}');
			die;
		}


		//微信用户（微信菜单中已同步的所有用户）
		if($userType == 6){
            $type = 4;  //必须使用模板消息
			$sql = $dsql->SetQuery("SELECT `openid` wechat_openid FROM `#@__site_wechat_member`");
		}


		if(empty($sql)) die('{"state": 200, "info": "没有符合条件的会员"}');
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret) die('{"state": 200, "info": "没有符合条件的会员"}');

		//创建消息记录
		$lid = 0;
		$time = GetMkTime(time());
		$adminid = $userLogin->getUserID();

		$log = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`admin`, `type`, `title`, `body`, `date`) VALUE ('$adminid', '$type', '$title', '$body', '$time')");
		$lid = $dsql->dsqlOper($log, "lastid");

		if(!is_numeric($lid)) die('{"state": 200, "info": "消息记录创建错误，发送失败！"}');

		$success = 0;
		$error = 0;

		foreach ($ret as $key => $value) {

			//系统消息
			if($type == 0){

				$int = $dsql->SetQuery("INSERT INTO `#@__".$action."_log` (`lid`, `uid`, `state`, `date`) VALUE ('$lid', ".$value['id'].", 0, 0)");
				$r = $dsql->dsqlOper($int, "update");
				if($r == "ok"){
					$success++;
				}else{
					$error++;
				}

			//邮件
			}elseif($type == 1){

				$s = sendmail($value['email'], $title, $_POST['body']);
				if(empty($s)){
					messageLog("email", "管理员手动", $value['email'], $title, $body, $adminid, 0);
					$success++;
				}else{
					messageLog("email", "管理员手动", $value['email'], $title, $body, $adminid, 1);
					$error++;
				}

			//短信
			}elseif($type == 2){

				$return = sendsms($value['phone'], $_POST['body'], "", "会员消息", false, true);
				if($return == "ok"){
					// messageLog("phone", "管理员手动", $value['phone'], $title, $body, $adminid, 0);
					$success++;
				}else{
					// messageLog("phone", "管理员手动", $value['phone'], $title, $body, $adminid, 1);
					$error++;
				}

			//APP推送
			}elseif($type == 3){

				sendapppush($value['id'], $title, $_POST['body'], $_POST['url']);
				$return = "ok";
				if($return == "ok"){
					$success++;
				}else{
					$error++;
				}

			//微信模板消息
			}elseif($type == 4){

				$ret = sendwechat($value['wechat_openid'], $title, $_POST['body'], $_POST['url']);
				$ret = json_decode($ret, true);
				if($ret['state'] == "100"){
					$success++;
				}else{
					$error++;
				}

			}

		}


		$log = $dsql->SetQuery("UPDATE `#@__".$action."` SET `success` = '$success', `error` = '$error' WHERE `id` = ".$lid);
		$dsql->dsqlOper($log, "update");


		die('{"state": 100, "info": "发送完成，成功：'.$success.'，失败：'.$error.'！"}');
	}

	//js
	$jsFile = array(
		'admin/member/memberLetterAdd.js'
	);

	$templates = "memberLetterAdd.html";


//获取消息详细信息
}elseif($dopost == "getDetail"){

	$archives = $dsql->SetQuery("SELECT `body` FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		echo json_encode($results[0]['body']);

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;


//删除
}elseif($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_log` WHERE `lid` = ".$val);
		$dsql->dsqlOper($archives, "update");

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除会员消息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
