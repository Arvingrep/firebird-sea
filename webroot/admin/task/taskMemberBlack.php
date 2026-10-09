<?php
/**
 * 黑名单管理
 *
 * @version        $Id: taskMemberBlack.php 2022-11-29 上午09:44:26 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskMemberBlack");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskMemberBlack.html";

$db = "task_member_black";

//删除记录
if($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
        $uids = array();
		foreach($each as $val){

            $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__".$db."` WHERE `id` = $val");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                array_push($uids, $ret[0]['uid']);
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
			adminLog("删除任务悬赏黑名单记录", "会员ID：".join(',', $uids));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//新增黑名单
}elseif($dopost == "add"){

    $uid = (int)$uid;
    $type = trim($type);
    $auth = isset($auth) ?  join(",", $auth) : '';
    $expired = $expired ? GetMkTime(str_replace('T', ' ', $expired)) : 0;
    $note = trim($note);

    //查询会员是否已经开通过
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE `uid` = " . $uid);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        echo '{"state": 101, "info": '.json_encode('该会员ID已在黑名单中，如需更新请先删除后再操作！').'}';	
    }else{

        $admin = $userLogin->getUserID();
        $pubdate = GetMkTime(time());

        $sql = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`uid`, `type`, `auth`, `expired`, `admin`, `note`, `pubdate`) VALUES ('$uid', '$type', '$auth', '$expired', '$admin', '$note', '$pubdate')");
        $ret = $dsql->dsqlOper($sql, "update");
        adminLog("添加任务悬赏会员黑名单", "会员ID：".$uid);
        echo '{"state": 100, "info": '.json_encode('添加成功！').'}';
    }    
    exit();

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
        if(!$isId){
		    $where .= " AND (`type` like '%$keywords%' OR `note` like '%$keywords%')";
        }
	}

	$where .= " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `uid`, `type`, `auth`, `expired`, `note`, `pubdate`, `admin` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["uid"] = $value["uid"];

			if($value['uid'] > 0){
				$member = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = ".$value["uid"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["user"]  = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
			}else{
				$list[$key]["user"]  = '未知';
			}

			if($value['admin'] > 0){
				$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["admin"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["admin"]  = $username[0]["username"] == null ? "已删除管理员" . $value["admin"] : $username[0]["username"];
			}else{
				$list[$key]["admin"]  = '管理员';
			}

			$list[$key]["type"] = $value["type"];
			$list[$key]["auth"] = authContent($value["auth"]);
			$list[$key]["expired"] = $value["expired"] ? date('Y-m-d H:i:s', $value["expired"]) : '永不恢复';
			$list[$key]["note"] = $value["note"] ? $value["note"] : '无';
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
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
		'admin/task/taskMemberBlack.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('adminList', json_encode($adminListArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


function authContent($auth = ''){

    $ret = array();

    if($auth){
        $authArr = explode(',', $auth);
        foreach($authArr as $key => $val){
            if($val == 'receive'){
                array_push($ret, '禁止领取任务');
            }elseif($val == 'fabu'){
                array_push($ret, '禁止发布任务');
            }elseif($val == 'task'){
                array_push($ret, '禁止使用任务模块');
            }elseif($val == 'login'){
                array_push($ret, '禁止登录');
            }
        }
    }
    return join('、', $ret);

}