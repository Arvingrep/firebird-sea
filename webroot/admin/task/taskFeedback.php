<?php
/**
 * 问题反馈管理
 *
 * @version        $Id: taskFeedback.php 2022-11-29 下午14:00:16 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskFeedback");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskFeedback.html";

$db = "task_feedback";

//获取指定ID信息详情
if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//删除记录
}elseif($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
        $uids = array();
		foreach($each as $val){

            $sql = $dsql->SetQuery("SELECT `id`, `uid`, `tid`, `sid` FROM `#@__".$db."` WHERE `id` = $val");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                array_push($uids, "问题ID：" . $ret[0]['id'] . "，用户ID：" . $ret[0]['uid'] . "，任务ID：" . $ret[0]['tid'] . "，商家ID：" . $ret[0]['sid']);
            }

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除任务悬赏问题反馈记录", join(',', $uids));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//更新记录
}elseif($dopost == "update"){

    $id = (int)$id;
    $state = (int)$state;
    $note = trim($note);

    $admin = $userLogin->getUserID();
    $pubdate = GetMkTime(time());
    
    $sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = '$state', `note` = '$note', `admin` = '$admin', `admin_time` = '$pubdate' WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){
        adminLog("更新任务悬赏问题反馈处理结果", $id . '=>' . $state . '=>' . $note);
        echo '{"state": 100, "info": '.json_encode('更新成功！').'}';
    }else{
        echo '{"state": 200, "info": '.json_encode('更新失败！').'}';
    }
    die;

//获取日志列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` < ". GetMkTime(date("Y-m-d",strtotime("$end +1 day")));
	}

	if($admin != ""){
		$where .= " AND `admin` = ". $admin;
	}

    $keywords = trim($keywords);
	if($keywords != ""){
        $isId = false;
        if(substr($keywords, 0, 1) == '#'){
			$id = substr($keywords, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `uid` = $id";
			}
		}
        if(substr($keywords, 0, 1) == '@'){
			$id = substr($keywords, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `sid` = $id";
			}
		}
        if(substr($keywords, 0, 1) == '$'){
			$id = substr($keywords, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `tid` = $id";
			}
		}
        if(!$isId){
		    $where .= " AND (`type` like '%$keywords%' OR `content` like '%$keywords%' OR `note` like '%$keywords%')";
        }
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
    //未处理
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//未审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");

    if($state != ""){

        $where .= " AND `state` = $state";

        if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}
	}

	$where .= " order by `id` desc";
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `tid`, `sid`, `uid`, `type`, `content`, `pubdate`, `state`, `admin`, `note`, `admin_time` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["tid"] = $value["tid"];

			if($value['tid'] > 0){
				$member = $dsql->SetQuery("SELECT `title` FROM `#@__task_list` WHERE `id` = ".$value["tid"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["title"]  = $username[0]["title"];
			}else{
				$list[$key]["title"]  = '未知';
			}

			$list[$key]["uid"] = $value["uid"];

			if($value['uid'] > 0){
				$member = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$value["uid"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["user"]  = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
			}else{
				$list[$key]["user"]  = '未知';
			}

			$list[$key]["sid"] = $value["sid"];

			if($value['sid'] > 0){
				$member = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$value["sid"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["store"]  = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
			}else{
				$list[$key]["store"]  = '未知';
			}

			$list[$key]["adminid"] = $value["admin"];
			if($value['admin'] > 0){
				$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["admin"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["admin"]  = $username[0]["username"] == null ? "已删除管理员" . $value["admin"] : $username[0]["username"];
			}else{
				$list[$key]["admin"]  = '管理员';
			}

			$list[$key]["type"] = $value["type"];
			$list[$key]["content"] = $value["content"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["state"] = $value["state"];
			$list[$key]["note"] = $value["note"];
			$list[$key]["admin_time"] = date('Y-m-d H:i:s', $value["admin_time"]);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'admin/task/taskFeedback.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('notice', (int)$notice);
	$huoniaoTag->assign('adminList', json_encode($adminListArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}