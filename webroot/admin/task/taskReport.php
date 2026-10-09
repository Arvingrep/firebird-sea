<?php
/**
 * 举报管理
 *
 * @version        $Id: taskReport.php 2022-12-2 下午19:03:16 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskReport");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "task_report";
$templates = "taskReport.html";

//获取订单列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where  = "";

    if($sKeyword != ""){
        $sKeyword = trim($sKeyword);
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND (r.`uid` = $id OR r.`mid` = $id)";
			}
		}
        if(substr($sKeyword, 0, 1) == '@'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND r.`sid` = $id";
			}
		}
        if(substr($sKeyword, 0, 1) == '$'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND r.`tid` = $id";
			}
		}
		if(!$isId){
            $where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR l.`project` like '%$sKeyword%' OR l.`title` like '%$sKeyword%' OR r.`ordernum` like '%$sKeyword%' OR r.`reason` like '%$sKeyword%' OR r.`note` like '%$sKeyword%')";
		}

	}

    //举报时间
	if($start != ""){
		$where .= " AND r.`pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND r.`pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	if($admin != ""){
		$where .= " AND r.`admin` = ". $admin;
	}

	$archives = $dsql->SetQuery("SELECT r.`id` FROM `#@__".$db."` r LEFT JOIN `#@__task_list` l ON l.`id` = r.`tid` LEFT JOIN `#@__member` m ON m.`id` = r.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = r.`uid` WHERE m.`id` IS NOT NULL");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//维权中
	$state0 = $dsql->dsqlOper($archives." AND r.`state` = 0".$where, "totalCount");
	//审核中
	$state1 = $dsql->dsqlOper($archives." AND r.`state` = 1".$where, "totalCount");
	//已通过
	$state2 = $dsql->dsqlOper($archives." AND r.`state` = 2".$where, "totalCount");
	//已结束
	$state3 = $dsql->dsqlOper($archives." AND r.`state` = 3".$where, "totalCount");

    if($state != ""){

        $where .= " AND r.`state` = $state";

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}
	}

    $order .= " ORDER BY r.`id` DESC";

	$atpage = $pagestep*($page-1);
    $time = time();
	$archives = $dsql->SetQuery("SELECT r.`id`, r.`uid`, r.`mid`, r.`oid`, r.`ordernum`, r.`tid`, r.`sid`, r.`reason`, r.`pubdate`, r.`expired`, r.`bs_pubdate`, r.`state`, r.`admin`, r.`winner`, r.`admin_time`, m.`nickname`, l.`project`, t.`typename`, l.`title`, o.`price`, o.`lq_time`, o.`tj_time`, o.`sh_time` FROM `#@__task_report` r LEFT JOIN `#@__task_list` l ON l.`id` = r.`tid` LEFT JOIN `#@__task_order` o ON o.`id` = r.`oid` LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = r.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = r.`uid` WHERE m.`id` IS NOT NULL".$where.$order." LIMIT $atpage, $pagestep");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	if($results && is_array($results)){
        foreach ($results as $key => $value) {
            $list[$key]["id"]        = (int)$value["id"];
            $list[$key]["uid"]       = (int)$value["uid"];
            $list[$key]['utype']     = $value['uid'] == $value['sid'] ? 'store' : 'user';
            $list[$key]["mid"]       = (int)$value["mid"];
            $list[$key]["oid"]       = (int)$value["oid"];
            $list[$key]["ordernum"]  = $value["ordernum"];
            $list[$key]["tid"]       = (int)$value["tid"];
            $list[$key]["sid"]       = (int)$value["sid"];
            $list[$key]["reason"]    = $value["reason"];
            $list[$key]["pubdate"]   = (int)$value["pubdate"];
            $list[$key]["expired"]   = (int)$value["expired"];
            $list[$key]["bs_pubdate"] = (int)$value["bs_pubdate"];
            $list[$key]["state"]     = (int)$value["state"];

            //管理员信息
            $list[$key]["adminid"]     = (int)$value["admin"];
            if($value['admin'] > 0){
				$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["admin"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["admin"]  = $username[0]["username"] == null ? "已删除管理员" . $value["admin"] : $username[0]["username"];
			}else{
				$list[$key]["admin"]  = '管理员';
			}

            $list[$key]["winner"]    = (int)$value["winner"];
            $list[$key]["admin_time"] = (int)$value["admin_time"];
            $list[$key]["nickname"]  = $value["nickname"];
            $list[$key]["project"]   = $value["project"];
            $list[$key]["typename"]  = $value["typename"];
            $list[$key]["title"]     = $value["title"];
            $list[$key]["price"]     = floatval($value["price"]);
            $list[$key]["lq_time"]   = (int)$value["lq_time"];
            $list[$key]["tj_time"]   = (int)$value["tj_time"];
            $list[$key]["sh_time"]   = (int)$value["sh_time"];

            //查询被举报人信息
            $minfo = $userLogin->getMemberInfo($value['mid']);
            $mname = $minfo['nickname'];
            $list[$key]['mname'] = $mname;
            
            //用户胜诉
            if($value['mid'] == $value['sid'] && $value['winner'] == 1){
                $type = 1;
            }else{
                $type = 2;
            }
            $list[$key]['type'] = $type;

        }
		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}, "taskReport": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}, "info": '.json_encode("暂无相关信息").'}';
			}
		}
	}else{
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;

//获取指定ID信息详情
}elseif($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
    if($results){

        //管理员信息
        $results[0]["adminid"] = (int)$results[0]["admin"];
        if($results[0]['admin'] > 0){
            $member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["admin"]);
            $username = $dsql->dsqlOper($member, "results");
            $results[0]["admin"]  = $username[0]["username"] == null ? "已删除管理员" . $results[0]["admin"] : $username[0]["username"];
        }else{
            $results[0]["admin"]  = '管理员';
        }

        //查询举报人信息
        $uinfo = $userLogin->getMemberInfo($results[0]['uid']);
        $uname = $uinfo['nickname'];
        $results[0]['uname'] = $uname;

        //查询被举报人信息
        $minfo = $userLogin->getMemberInfo($results[0]['mid']);
        $mname = $minfo['nickname'];
        $results[0]['mname'] = $mname;

    }
	echo json_encode($results);die;


//更新举报状态
}elseif($dopost == 'updateState'){

    $type = (int)$type;
    $id   = (int)$id;
    $note = trim($note);
    $date = GetMkTime(time());

    //查询举报状态
    $sql = $dsql->SetQuery("SELECT `state`, `uid`, `mid`, `oid`, `tid`, `sid` FROM `#@__task_report` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $state = $ret[0]['state'];
        if($state != 1){
            echo '{"state": 200, "info": '.json_encode("当前举报状态不可以操作！").'}';die;
        }

        $wid = 0;

        //判用户胜诉
        if($type == 1){

            //如果举报人是发布人，则被举报人是用户
            if($ret[0]['uid'] == $ret[0]['sid']){
                $wid = $ret[0]['mid'];
            }else{
                $wid = $ret[0]['uid'];
            }
        
        //判发布人胜诉
        }else{

            if($ret[0]['uid'] == $ret[0]['sid']){
                $wid = $ret[0]['uid'];
            }else{
                $wid = $ret[0]['mid'];
            }

        }

        //执行胜诉后的操作
        global $handler;
        $handler = true;

        $arr= array(
            'id' => $ret[0]['oid']
        );
        $task = new task($arr);
        if($type == 1){
            $res = $task->passOrder(2);
        }else{
            $res = $task->cancelOrder(2);
        }

        //更新状态
        $admin = $userLogin->getUserID();
        $sql = $dsql->SetQuery("UPDATE `#@__task_report` SET `state` = 2, `admin` = '$admin', `note` = '$note', `winner` = '$type', `admin_time` = '$date' WHERE `id` = $id");
        $dsql->dsqlOper($sql, "update");

        adminLog("判断举报结果", $id . '=>' . $type . '=>' . $note);
        echo '{"state": 100, "info": '.json_encode('操作成功！').'}';

    }else{
        echo '{"state": 200, "info": '.json_encode("举报信息不存在或已经删除！").'}';die;
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
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/task/taskReport.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    
	$huoniaoTag->assign('adminList', json_encode($adminListArr));
    $huoniaoTag->assign('notice', (int)$notice);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
