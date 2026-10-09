<?php
/**
 * 会员管理
 *
 * @version        $Id: taskMemberList.php 2022-08-20 下午13:11:25 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskMemberList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "task_member";
$templates = "taskMemberList.html";

//获取指定ID信息详情
if($dopost == "getMemberDetail"){
	if($uid == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `uid` = ".$uid);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//添加||修改会员
}elseif($dopost == "operMember"){

    $uid = (int)$uid;
    $level = (int)$level;
    $open_time = str_replace('T', ' ', $open_time);
    $end_time = str_replace('T', ' ', $end_time);
    $refresh_coupon = (int)$refresh_coupon;
    $bid_coupon = (int)$bid_coupon;

    $open_time = GetMkTime($open_time);
    $end_time = GetMkTime($end_time);

    //查询会员是否已经开通过
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE `uid` = " . $uid);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `level` = '$level', `open_time` = '$open_time', `end_time` = '$end_time', `refresh_coupon` = '$refresh_coupon', `bid_coupon` = '$bid_coupon' WHERE `uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "update");
        adminLog("修改任务悬赏会员", $uid ."=>". $sql);
        echo '{"state": 100, "info": '.json_encode('修改成功！').'}';	
    }else{
        $sql = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`uid`, `level`, `open_time`, `end_time`, `refresh_coupon`, `bid_coupon`) VALUES ('$uid', '$level', '$open_time', '$end_time', '$refresh_coupon', '$bid_coupon')");
        $ret = $dsql->dsqlOper($sql, "update");
        adminLog("添加任务悬赏会员", $uid ."=>". $sql);
        echo '{"state": 100, "info": '.json_encode('添加成功！').'}';
    }    
    exit();

//获取会员列表
}elseif($dopost == "getList"){
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
				$where .= " AND tm.`uid` = $id";
			}
		}
		if(!$isId){
			$where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`idcard` like '%$sKeyword%' OR m.`email` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%')";
		}

	}

	if($level){
		$where .= " AND tm.`level` = ".$level;
	}

	if($start != ""){
		$where .= " AND tm.`open_time` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND tm.`open_time` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT tm.`id` FROM `#@__".$db."` tm LEFT JOIN `#@__member` m ON m.`id` = tm.`uid` WHERE m.`id` IS NOT NULL");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

    $order .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$archives = $dsql->SetQuery("SELECT tm.`id`, tm.`uid`, tm.`level`, tm.`open_time`, tm.`end_time`, tm.`refresh_coupon`, tm.`bid_coupon`, m.`username`, m.`nickname`, m.`photo`, m.`promotion` FROM `#@__".$db."` tm LEFT JOIN `#@__member` m ON m.`id` = tm.`uid` WHERE m.`id` IS NOT NULL".$where.$order." LIMIT $atpage, $pagestep");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	if($results && is_array($results)){
        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["uid"] = $value["uid"];

            $level = "未开通";
            $sql   = $dsql->SetQuery("SELECT `typename` FROM `#@__task_member_level` WHERE `id` = " . $value['level']);
            $ret   = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $level = $ret[0]['typename'];
            }
            $list[$key]["level"]    = $level;

            $list[$key]["open_time"] = date("Y-m-d H:i:s", $value["open_time"]);
            $list[$key]["end_time"] = date("Y-m-d H:i:s", $value["end_time"]);
            $list[$key]["refresh_coupon"] = $value["refresh_coupon"];
            $list[$key]["bid_coupon"] = $value["bid_coupon"];

            $list[$key]["nickname"] = $value["nickname"] ? $value["nickname"] : $value["username"];
            $list[$key]["photo"]    = $value["photo"];
            $list[$key]["promotion"] = $value["promotion"];

            //发布的所有任务数量、审核通过的订单量、发放的赏金总额
            $task = array(
                'taskCount' => 0,
                'orderCount' => 0,
                'orderAmount' => 0
            );
            $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_list` WHERE `uid` = ".$value['uid'].") as `taskCount`, (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = ".$value['uid']." AND `state` = 2) as `orderCount`, (SELECT sum(`price` - `task_fee_amount`) FROM `#@__task_order` WHERE `sid` = ".$value['uid']." AND `state` = 2) as `orderAmount`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $task = array(
                    'taskCount' => (int)$ret[0]['taskCount'],
                    'orderCount' => (int)$ret[0]['orderCount'],
                    'orderAmount' => floatval(sprintf("%.2f", $ret[0]['orderAmount']))
                );
            }
            $list[$key]["task"] = $task;

            //领取的任务数量、审核通过的订单量、收到的赏金
            $order = array(
                'orderCount' => 0,
                'validCount' => 0,
                'orderAmount' => 0
            );
            $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = ".$value['uid'].") as `orderCount`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = ".$value['uid']." AND `state` = 2) as `validCount`, (SELECT sum(`price`) FROM `#@__task_order` WHERE `uid` = ".$value['uid']." AND `state` = 2) as `orderAmount`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $order = array(
                    'orderCount' => (int)$ret[0]['orderCount'],
                    'validCount' => (int)$ret[0]['validCount'],
                    'orderAmount' => (float)$ret[0]['orderAmount']
                );
            }
            $list[$key]["order"] = $order;

            //查询被举报次数
            $reportCount = 0;
            $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__task_report` WHERE `mid` = " . $value['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $reportCount = $ret[0]['totalCount'];
            }
            $list[$key]['reportCount'] = $reportCount;
        }
		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "memberList": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
			}
		}
	}else{
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;

//新增
}elseif($dopost == "add"){

	//表单提交
	if($submit == "提交"){

		if(!testPurview("memberAdd")){
			die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
		};

		$passwd = $userLogin->_getSaltedHash($password);
		$regtime  = GetMkTime(time());
		$regip    = GetIP();

		$cityid = 0;
		if($addr){
			$cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr));
			$cityInfoArr = explode(',', $cityInfoArr);
			$cityid      = (int)$cityInfoArr[0];
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `company`, `cityid`, `addr`, `regtime`, `regip`, `state`, `purviews`) VALUES ('$mtype', '$username', '$passwd', '$nickname', '$email', '1', '$phone', '1', '$company', '$cityid', '$addr', '$regtime', '$regip', '1', '')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if($aid){

			//论坛同步
			$data = array();
			$data['username'] = $username;
			$data['password'] = $password;
			$data['email']    = $email;
			$userLogin->bbsSync($data, "register");

			adminLog("新增会员", $username);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

	//会员类型
	$huoniaoTag->assign('mtype', array('1', '2'));
	$huoniaoTag->assign('mtypeNames',array('个人','企业'));
	$huoniaoTag->assign('mtypeChecked', 1);

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
        'admin/task/taskMemberList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__task_member_level` ORDER BY `id` ASC");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		$levelList = $results;
	}
	$huoniaoTag->assign('levelList', $levelList);
	$huoniaoTag->assign('levelListArr', json_encode($levelList));
    
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
