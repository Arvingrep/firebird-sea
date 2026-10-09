<?php
/**
 * 管理伯乐
 *
 * @version        $Id: jobBole.php 2014-8-1 上午09:49:21 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobBole");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "job_bole";

if($dopost != ""){
	$templates = "jobBoleAdd.html";

	//js
	$jsFile = array(
		'admin/job/jobBoleAdd.js',
		'publicAddr.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "jobBole.html";
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobBole.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate     = GetMkTime(time());       //发布时间

	//二次验证
	if($cid == 0 && trim($cid) == ''){
		echo '{"state": 200, "info": "请选择所属公司"}';
		exit();
	}
	if($cid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` = '".$company."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "公司不存在，请在联想列表中选择"}';
			exit();
		}
		$cid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `id` = ".$cid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	if(empty($user) && empty($userid)){
		echo '{"state": 101, "info": "请输入会员名！"}';
		exit();
	}

	if(empty($userid)){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 101, "info": "会员不存在，请重新选择"}';
			exit();
		}else{
			$userid = $userResult[0]['id'];
		}
	}

	//检测是否已经注册
	if($dopost == "Add"){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权为其它公司的伯乐1！"}';
			exit();
		}
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权为其它公司的伯乐2！"}';
			exit();
		}
	}

	if(empty($work)){
		echo '{"state": 101, "info": "请输入职位名称！"}';
		exit();
	}

}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    //城市管理员
    if($userType == 3){
        if($adminAreaIDs){
            $where .= " AND `addr` in ($adminAreaIDs)";
        }else{
            $where .= " AND 1 = 2";
        }
    }

    //城市
    if($cityid){
        global $data;
        $data = '';
        $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
        $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
        $cityAreaIDs = join(',', $cityAreaIDArr);
        if($cityAreaIDs){
            $where .= " AND `addr` in ($cityAreaIDs)";
        }else{
            $where .= " 3 = 4";
        }
    }

	if($sKeyword != ""){
		$where .= " AND `work` like '%".$sKeyword."%'";

		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$cid = array();
			foreach($comResult as $key => $com){
				array_push($cid, $com['id']);
			}
			if(!empty($cid)){
				$where .= " OR `cid` in (".join(",", $cid).")";
			}
		}

		//模糊匹配简历用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%' OR `phone` like '%$sKeyword%'");
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

	if($sType != ""){
		$where .= " AND `type` = ".$sType;
	}

	if($sIndustry != ""){
		if($dsql->getTypeList($sIndustry, "job_industry")){
			$lower = arr_foreach($dsql->getTypeList($sIndustry, "job_industry"));
			$lower = $sIndustry.",".join(',',$lower);
		}else{
			$lower = $sIndustry;
		}

		$arr = array();
		$lower = explode(",", $lower);
		foreach ($lower as $key => $value) {
			$arr[] = "FIND_IN_SET(".$value.", `industry`)";
		}
		$where .= " AND (".join(" OR ", $arr).")";
	}

	if($sZhineng != ""){
		if($dsql->getTypeList($sZhineng, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sZhineng, "job_type"));
			$lower = $sZhineng.",".join(',',$lower);
		}else{
			$lower = $sZhineng;
		}

		$arr = array();
		$lower = explode(",", $lower);
		foreach ($lower as $key => $value) {
			$arr[] = "FIND_IN_SET(".$value.", `zhineng`)";
		}
		$where .= " AND (".join(" OR ", $arr).")";
	}

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "jobaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "jobaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addr` in ($lower)";
	}

	if($sStatus != ""){
		$where .= " AND `status` = ".$sStatus;
	}

	$archives = $dsql->SetQuery("SELECT `id`, `cid`, `userid`, `work`, `type`, `addr`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	$wher = "";
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

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";

	$results = $dsql->dsqlOper($archives.$where, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["companyid"] = $value["cid"];
			$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $value['cid']);
			$comname = $dsql->getTypeName($comSql);
			$list[$key]["company"] = $comname[0]["title"];

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $value['cid']
			);
			$list[$key]["companyurl"] = getUrlPath($param);

			$list[$key]["userid"] = $value["userid"];
			$userSql = $dsql->SetQuery("SELECT `userid`, `name`, `photo` FROM `#@__job_resume` WHERE `id` = ". $value['userid']);
			$username = $dsql->getTypeName($userSql);

			$list[$key]["realname"] = $username[0]["name"];
			$list[$key]["photo"] = $username[0]["photo"];

			$list[$key]["work"] = $value["work"];
			$list[$key]["type"] = $value["type"];

			$list[$key]["addrid"] = $value["addr"];
			$addrSql = $dsql->SetQuery("SELECT `typename` FROM `#@__jobaddr` WHERE `id` = ". $value['addr']);
			$addrname = $dsql->getTypeName($addrSql);
			$list[$key]["addr"] = $addrname[0]["typename"];

			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "jobBole": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
	}
	die;

//模糊匹配会员
}elseif($dopost == "checkUser"){
	if(!empty($key)){
            if($userType == 0)
                $where = "";
            if($userType == 3)
                $where = " AND `addr` in ($adminAreaIDs)";

		$userSql = $dsql->SetQuery("SELECT `id`, `name`, `phone` FROM `#@__job_resume` WHERE `name` like '%$key%' OR `phone` like '%$key%'".$where." LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;

//检查会员是否已经开通伯乐功能
}elseif($dopost == "checkMember"){
	$result = "";
	if(!empty($key)){
		$userSql = $dsql->SetQuery("SELECT `id`, `name`, `phone` FROM `#@__job_resume` WHERE `name` like '%$key%' OR `phone` like '%$key%' LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$result = json_encode($userResult);
		}

		$where = "";
		if(!empty($id)){
			$where = " AND bole.id != ".$id;
		}

		$userSql = $dsql->SetQuery("SELECT user.name, bole.id FROM `#@__".$tab."` bole LEFT JOIN `#@__job_resume` user ON user.id = bole.userid WHERE user.name = '$key'".$where);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo 200;
		}else{
			echo $result;
		}
	}
	die;

//新增
}elseif($dopost == "Add"){

	if(!testPurview("jobBoleAdd")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$pagetitle = "新增伯乐";

	//表单提交
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cid`, `userid`, `work`, `type`, `addr`, `status`, `industry`, `zhineng`, `note`, `state`, `pubdate`) VALUES ('$cid', '$userid', '$work', '$type', '$addr', '$status', '$industry', '$zhineng', '$note', '$state', '".GetMkTime(time())."')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增伯乐", $user);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){

	if(!testPurview("jobBoleEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$pagetitle = "修改伯乐信息";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cid` = '$cid', `userid` = '$userid', `work` = '$work', `type` = '$type', `addr` = '$addr', `status` = '$status', `industry` = '$industry', `zhineng` = '$zhineng', `note` = '$note', `state` = '$state' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改伯乐信息", $user);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$cid     = $results[0]["cid"];
				$comSql  = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $cid);
				$comname = $dsql->getTypeName($comSql);
				$company = $comname[0]['title'];

				$userid   = $results[0]["userid"];
				$userSql  = $dsql->SetQuery("SELECT `name` FROM `#@__job_resume` WHERE `id` = ". $userid);
				$userRes  = $dsql->getTypeName($userSql);
				$username = $userRes[0]["name"];

				$work     = $results[0]['work'];
				$type     = $results[0]['type'];
				$addr     = $results[0]['addr'];
				$status   = $results[0]['status'];
				$industry = $results[0]['industry'];
				$zhineng  = $results[0]['zhineng'];
				$note     = $results[0]['note'];
				$state    = $results[0]['state'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

//删除
}elseif($dopost == "del"){

	if(!testPurview("jobBoleDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id != ""){

		//删除表
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` IN (".$id.")");
		$results = $dsql->dsqlOper($archives, "update");

		adminLog("删除伯乐信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobBoleEdit")){
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
			adminLog("更新伯乐状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('cid', $cid);

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('cid', $cid);
		$huoniaoTag->assign('company', $company);
		$huoniaoTag->assign('userid', $userid);
		$huoniaoTag->assign('username', $username);
		$huoniaoTag->assign('work', $work);

		$huoniaoTag->assign('typeopt', array('1', '2', '3'));
		$huoniaoTag->assign('typenames',array('HR','猎头','高管'));
		$huoniaoTag->assign('type', $type == "" ? 1 : $type);

		$huoniaoTag->assign('addr', (int)$addr);

		$huoniaoTag->assign('statusopt', array('1', '2', '3'));
		$huoniaoTag->assign('statusnames',array('正在招聘中','有好的人才可以考虑','暂不招聘'));
		$huoniaoTag->assign('status', $status == "" ? 3 : $status);

		$huoniaoTag->assign('industry', $industry);
		$industrySelected = "";
		if(!empty($industry)){
			$industry = explode(",", $industry);
			foreach($industry as $val){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__job_industry` WHERE `id` = $val");
				$results = $dsql->dsqlOper($archives, "results");
				$name = $results ? $results[0]['typename'] : "";
				$industrySelected .= '<span data-id="'.$val.'">'.$name.'<a href="javascript:;">×</a></span>';
			}
		}
		$huoniaoTag->assign('industrySelected', $industrySelected);
		$huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "job_industry")));

		$huoniaoTag->assign('zhineng', $zhineng);
		$zhinengSelected = "";
		if(!empty($zhineng)){
			$zhineng = explode(",", $zhineng);
			foreach($zhineng as $val){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__job_type` WHERE `id` = $val");
				$results = $dsql->dsqlOper($archives, "results");
				$name = $results ? $results[0]['typename'] : "";
				$zhinengSelected .= '<span data-id="'.$val.'">'.$name.'<a href="javascript:;">×</a></span>';
			}
		}
		$huoniaoTag->assign('zhinengSelected', $zhinengSelected);
		$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));

		$huoniaoTag->assign('note', $note);

		$huoniaoTag->assign('stateopt', array('0', '1', '2'));
		$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
		$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	}

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));
	$huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "job_industry")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
