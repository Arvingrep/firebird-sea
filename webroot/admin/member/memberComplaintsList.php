<?php
/**
 * 投诉管理
 *
 * @version        $Id: memberComplaintsList.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberComplaintsList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "memberComplaintsList.html";

$db = "member_complaints";


// 回复
if($dopost == 'reply'){
	$id = (int)$id;
	$sql = $dsql->SetQuery("SELECT `replydate` FROM `#@__member_complaints` WHERE `id` = $id AND `replydate` = 0 AND `reply` == ''");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		if(trim($reply) == ""){
			echo '{"state":100,"info":'.json_encode("未处理").'}';
		}else{
			$now = GetMkTime(time());
			$sql = $dsql->SetQuery("UPDATE `#@__member_complaints` SET `state` = 1, `replydate` = '$now', `dealdate` = '$now', `reply` = '$reply' WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "update");
			if($ret == "ok"){
				adminLog("回复投诉信息", $id);
				echo '{"state":100,"info":'.json_encode("提交成功").'}';
			}else{
				echo '{"state":200,"info":'.json_encode("提交失败").'}';
			}
		}
	}else{
		echo '{"state":100,"info":'.json_encode("信息不存在或已回复").'}';
	}
	die;

}elseif($dopost == "getDetail"){

	if($id){
		$sql = $dsql->SetQuery("SELECT * FROM `#@__member_complaints` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$data = array();
			$ret = $ret[0];
			foreach ($ret as $k => $v) {
				if($k == "pubdate" || $k == "replydate" || $k == "dealdate"){
					$v = $v ? date("Y-m-d H:i:s", $v) : "";
				}
				$data[$k] = $v;
			}

			$imgList = array();
			if($ret['img']){
				$img = explode(",", $ret['img']);
				foreach ($img as $k => $v) {
					$imgList[] = getFilePath($v);
				}
			}
			$data['imgList'] = $imgList;

			$uid = $ret['uid'];
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['username'];
			}else{
				$username = "未知";
			}

			$data['state'] = 100;
			$data['username'] = $username;


			echo json_encode($data);
		}else{
			echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("没有指定信息id").'}';
	}
	die;


}elseif($dopost == "updateState"){
	$sql = $dsql->SetQuery("SELECT `state` FROM `#@__member_complaints` WHERE `id` = $id");
	$ret = $dsql->dsqlOper($sql, "reslults");
	if($ret){
		if($arcrank == $ret[0]['state']){
			echo '{"state":100,"info":'.json_encode("操作成功").'}';
		}
	}
	if($arcrank){
		$dealdate = GetMkTime(time());
	}else{
		$dealdate = 0;
	}
	$sql = $dsql->SetQuery("UPDATE `#@__member_complaints` SET `state` = '$arcrank', `dealdate` = '$dealdate' WHERE `id` = $id");
	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok") {
		echo '{"state":100,"info":'.json_encode("操作成功").'}';
		adminLog("修改投诉信息处理状态", $id."->".$arcrank);
	}else{
		echo '{"state":200,"info":'.json_encode("操作失败").'}';
	}
	die;

//删除信息
}elseif($dopost == "del"){
	if($id != ""){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` IN (".$id.")");
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
			adminLog("删除投诉信息", $id);
		}else{
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("没有选择任何信息").'}';
	}
	die;

}elseif($dopost == 'getList'){

	$where = "";

	if($sKeyword != ""){
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `uid` = $id";
			}
		}else{
			$where .= " AND `content` LIKE '%$sKeyword%'";
		}
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end);
	}

	if($state){
		$where .= " AND `state` = $state";
	}

	$list = array();

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$archives = $dsql->SetQuery("SELECT * FROM `#@__member_complaints` WHERE 1 = 1");
	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未处理
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
	//已处理
	$normal = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

	$atpage = $pagestep*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagestep";

	$results  = $dsql->dsqlOper($archives.$where, "results");
	if($results){
		foreach ($results as $key => $value) {
			$uid = $value['uid'];
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['username'];
			}else{
				$username = "未知";
			}

			foreach ($value as $k => $v) {
				if($k == "pubdate" || $k == "replydate" || $k == "dealdate"){
					$v = $v ? date("Y-m-d H:i:s", $v) : "";
				}
				$list[$key][$k] = $v;
			}

			$list[$key]['username'] = $username;
		}

		echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.'}, "complatinsList": '.json_encode($list).'}';
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.'}, "info": '.json_encode("暂无相关信息").'}';
	}

	die;

}



//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/member/memberComplaintsList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
