<?php
/**
 * 管理投票选手
 *
 * @version        $Id: voteUser.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$action = "vote";
$actioncap = "Vote";

// 当前操作
$about = "User";
$actiontxt = "选手";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview($action."User");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action.$about.".html";

// 查询所有活动
$archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__".$action."_list` WHERE `arcrank` = 1" . getCityFilter('`cityid`'));
$results = $dsql->dsqlOper($archives, "results");
if($results){
    $votelist = json_encode($results);
}
$huoniaoTag->assign('votelist', $votelist);
$huoniaoTag->assign('tid', empty($tid) ? 0 : $tid);

if($dopost == "getList"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

	if($sKeyword != ""){
		$where .= " AND `name` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `tid` = $sType";
	}

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_list` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `tid` in ($idList)";
    }else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_user` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2".$where, "totalCount");
	//取消显示
	$totalNoshow = $dsql->dsqlOper($archives." AND `arcrank` = 3".$where, "totalCount");

	if($state != ""){
		$where .= " AND `arcrank` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($totalNoshow/$pagestep);
		}
	}

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `tid`, `name`, `number`, `intnum`, `pubdate`, `arcrank`, `admin` FROM `#@__".$action."_user` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		$now  = GetMkTime(time());
		foreach ($results as $key=>$value) {
			$list[$key]["id"]       = $value["id"];
			$list[$key]["admin"]    = $value["admin"];
			$list[$key]["tid"]      = $value["tid"];
			$list[$key]["name"]     = $value["name"];
			$number   				= $value["number"];
			$intnum   				= $value["intnum"];
			$list[$key]["arcrank"]  = $value["arcrank"];
			$list[$key]["pubdate"]  = $value["pubdate"];
			$list[$key]["pubdatef"] = date("Y-m-d H:i:s",$value["pubdate"]);

			if($number<10){
		        $number = "000".$number;
		    }elseif($number<100){
		        $number = "00".$number;
		    }elseif($number<1000){
		        $number = "0".$number;
		    }
		    $list[$key]["number"]   = $number;

			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
				case "3":
					$state = "取消显示";
					break;
			}

			$list[$key]["state"] = $state;

			// 查询对应会员信息
			$member = "";
			if($value['admin']){
				$sql = $dsql->SetQuery("SELECT `mtype`,`username` FROM `#@__member` WHERE `id` = ".$value['admin']);
				$ret = $dsql->dsqlOper($archives, "results");
				if($ret[0]['mtype']){
					$member = $ret[0]['username'];
				}
			}
			$list[$key]["member"] = $member;

			// 活动链接
			$param = array(
				"service"     => $action,
				"template"    => "detail",
				"id"          => $value['tid']
			);
			$list[$key]['tUrl'] = getUrlPath($param);
			// 选手链接
			$param = array(
				"service"     => $action,
				"template"    => "user",
				"id"          => $value['id']
			);
			$list[$key]['uUrl'] = getUrlPath($param);

			// 查询对应活动信息
			$title = "";
			if($value['tid']){
				$sql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__".$action."_list` WHERE `id` = ".$value['tid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}
			}
			$list[$key]['title'] = $title;

			// 统计票数
			$sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__".$action."_record` WHERE `uid` = ".$value['id']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$common = $ret[0]['total'];
			}else{
				$common = 0;
			}

			$list[$key]['common'] = $common+$intnum;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.'}, "infoList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.', "totalNoshow": '.$totalNoshow.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("del".$about)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){
		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_common` WHERE `uid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除缩略图
			delPicFile($results[0]['litpic'], "delThumb", $action);
			//删除图集
			$atlasPic = $results[0]['pics'];
			if(!empty($atlasPic)){
				delPicFile($atlasPic, "delAtlas", $action);
			}
			//删除正文图片
			delEditorPic($value['body'], $action);
			delEditorPic($value['mbody'], $action);

			//删除主表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_user` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除".$actiontxt."信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;

//删除所有待审核信息
}elseif($dopost == "delAllGray"){
	if(!testPurview("del".$about)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `arcrank` = 0");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {

			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_common` WHERE `aid` = ".$value['id']);
			$dsql->dsqlOper($archives, "update");

			//删除缩略图
			delPicFile($results[0]['litpic'], "delThumb", $action);
			//删除正文图片
			delEditorPic($value['body'], $action);
			delEditorPic($value['mbody'], $action);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_list` WHERE `id` = ".$value['id']);
			$dsql->dsqlOper($archives, "update");

		}

	}
	die;



//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("edit".$about)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_user` SET `arcrank` = $arcrank WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息状态", $id."=>".$arcrank);
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
		'ui/jquery-ui-selectable.js',
		'admin/'.$action.'/'.$action.'User.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('actiontxt', $actiontxt);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

function getUserNumber($tid){
    global $dsql, $action;
    $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__".$action."_user` WHERE `tid` = $tid");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $count = intval($ret[0]['total'])+1;
    }else{
        $count = 1;
    }
    if($count<10){
        $r = "000".$count;
    }elseif($count<100){
        $r = "00".$count;
    }elseif($count<1000){
        $r = "0".$count;
    }
    return $r;
}