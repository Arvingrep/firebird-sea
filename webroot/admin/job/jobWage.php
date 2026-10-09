<?php
/**
 * 管理工资统计
 *
 * @version        $Id: jobWage.php 2015-3-11 下午22:38:11 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobWage");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobWage.html";

$tab = "job_wage";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `work` like '%".$sKeyword."%'";

		//模糊匹配公司
		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$comid = array();
			foreach($comResult as $key => $com){
				array_push($comid, $com['id']);
			}
			if(!empty($comid)){
				$where .= " OR `cid` in (".join(",", $comid).")";
			}
		}

		//模糊匹配用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where .= " OR `userid` in (".join(",", $userid).")";
			}
		}
	}

	if($sAddr != ""){
		$idsArr = array($sAddr);
		$childArr = $dsql->getTypeList($sAddr, 'site_area', 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$lower = join(',',$idsArr);
		$where .= " AND `addr` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}
	}

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cid`, `userid`, `addr`, `work`, `wage`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["cid"] = $value["cid"];
			$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $value['cid']);
			$comname = $dsql->getTypeName($comSql);
			$list[$key]["company"] = $comname[0]["title"];

			$list[$key]["userid"] = $value["userid"];
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["username"] = $username[0]["username"];

			$list[$key]["addrid"] = $value["addr"];
			$addrSql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ". $value['addr']);
			$addrname = $dsql->getTypeName($addrSql);
			$list[$key]["addr"] = $addrname[0]["typename"];

			$list[$key]["work"] = $value["work"];
			$list[$key]["wage"] = $value["wage"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $value['cid']
			);
			$list[$key]["companyurl"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "jobWage": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
	}
	die;

//获取指定ID信息详情
}else if($action == "getDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$list = array();

			$list["cid"] = $results[0]["cid"];
			$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $results[0]['cid']);
			$comname = $dsql->getTypeName($comSql);
			$list["company"] = $comname[0]["title"];

			$list["userid"] = $results[0]["userid"];
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $results[0]['userid']);
			$username = $dsql->getTypeName($userSql);
			$list["username"] = $username[0]["username"];

			$list["addr"] = $results[0]["addr"];
			$list["work"] = $results[0]["work"];
			$list["wage"] = $results[0]["wage"];
			$list["state"] = $results[0]["state"];

			$addrName = getParentArr("site_area", $results[0]['addr']);
			global $data;
			$data = "";
			$list['addrName'] = array_reverse(parent_foreach($addrName, "typename"));
			$data = "";
			$list['addrIds'] = array_reverse(parent_foreach($addrName, "id"));

			echo json_encode($list);die;
		}
	}

//获取公司信息
}else if($action == "checkCompany"){
	if(!empty($key)){
		$key = trim($key);
		$commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$key%' LIMIT 0, 10");
		$commResult = $dsql->dsqlOper($commSql, "results");
		if($commResult){
			echo json_encode($commResult);
		}
	}die;

//更新信息
}elseif($action == "updateDetail"){

	if(empty($company)){
		echo '{"state": 101, "info": "请输入公司名称！"}';
		exit();
	}

	$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` = '".$company."'");
	$comResult = $dsql->dsqlOper($comSql, "results");
	if(!$comResult){
		echo '{"state": 101, "info": "公司不存在，请重新输入"}';
		exit();
	}else{
		$cid = $comResult[0]['id'];
	}

	if(empty($user)){
		echo '{"state": 101, "info": "请输入会员名！"}';
		exit();
	}

	$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
	$userResult = $dsql->dsqlOper($userSql, "results");
	if(!$userResult){
		echo '{"state": 101, "info": "会员不存在，请重新选择"}';
		exit();
	}else{
		$userid = $userResult[0]['id'];
	}

	if(empty($addr)){
		echo '{"state": 101, "info": "请选择区域！"}';
		exit();
	}

	if(empty($work)){
		echo '{"state": 101, "info": "请输入职位！"}';
		exit();
	}

	if(empty($wage)){
		echo '{"state": 101, "info": "请输入工资！"}';
		exit();
	}

	//新增
	if(empty($id)){
		//保存到表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cid`, `userid`, `addr`, `work`, `wage`, `state`, `pubdate`) VALUES ('$cid', '$userid', '$addr', '$work', '$wage', '$state', '".GetMkTime(time())."')");
		$res = $dsql->dsqlOper($archives, "update");
		if($res == 'ok'){
			adminLog("添加工资统计信息", $company." => ".$user." => ".$work." => ".$wage);
			echo '{"state": 100, "info": '.json_encode('添加成功！').'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("保存到数据库失败！").'}';
		}

	//修改
	}else{
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cid` = '$cid', `userid` = '$userid', `addr` = '$addr', `work` = '$work', `wage` = '$wage', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			adminLog("修改工资统计信息", $id);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("保存到数据库失败！").'}';
		}
	}
	die;


//删除
}elseif($dopost == "del"){
	if(!testPurview("jobWageDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, "公司ID：" . $results[0]['cid'] . "，用户ID：" . $results[0]['userid'] . "，职位：" . $results[0]['work']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除工资统计信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobWageEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新工资统计状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        // 'publicAddr.js',
		'admin/job/jobWage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
