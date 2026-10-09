<?php
/**
 * 管理投票信息
 *
 * @version        $Id: voteList.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$action = "vote";
$actioncap = "Vote";
$actiontxt = "投票";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview($action."List");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action."List.html";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

  $where = getCityFilter('`cityid`');

  if ($cityid) {
      $where .= getWrongCityFilter('`cityid`', $cityid);
  }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_list` WHERE 1 = 1");

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

	//投票中
	$totalIng = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//已结束
	$totalEnd = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		if($state >= 0 && $state <= 2){
			$where .= " AND `arcrank` = $state";

			if($state == 0){
				$totalPage = ceil($totalGray/$pagestep);
			}elseif($state == 1){
				$totalPage = ceil($totalAudit/$pagestep);
			}elseif($state == 2){
				$totalPage = ceil($totalRefuse/$pagestep);
			}
		}elseif($state == 3 || $state == 4){
			if($state == 3){
				$totalPage = ceil($totalIng/$pagestep);
			}elseif($state == 1){
				$totalPage = ceil($totalEnd/$pagestep);
			}
		}
	}

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `pubdate`, `end`, `arcrank`, `state` FROM `#@__".$action."_list` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		$now  = GetMkTime(time());
		foreach ($results as $key=>$value) {
			$list[$key]["id"]      = $value["id"];
			$list[$key]["title"]   = $value["title"];
			$list[$key]["cityid"]  = $value["cityid"];
			$list[$key]["arcrank"] = $value["arcrank"];
			$list[$key]["date"]    = date("Y-m-d H:i:s",$value["pubdate"]);
			$list[$key]["end"]     = $value["end"] ? date("Y-m-d H:i:s",$value["end"]) : "";

			$arcrank = "";
			switch($value["arcrank"]){
				case "0":
					$arcrank = "等待审核";
					break;
				case "1":
					$arcrank = "审核通过";
					break;
				case "2":
					$arcrank = "审核拒绝";
					break;
			}

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "未开始";
					break;
				case "1":
					$state = "投票中";
					break;
				case "2":
					$state = "已结束";
					break;
			}

			$list[$key]["arcrank"] = $arcrank;
			$list[$key]["state"] = $state;

			$param = array(
				"service"     => $action,
				"template"    => "detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);

			// 查询报名选手
			$sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__".$action."_user` WHERE `tid` = ".$value["id"]);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
            	$list[$key]['usercount'] = $ret[0]['total'];
            }else{
            	$list[$key]['usercount'] = 0;
            }

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalIng": '.$totalIng.', "totalEnd": '.$totalEnd.'}, "infoList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalIng": '.$totalIng.', "totalEnd": '.$totalEnd.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalIng": '.$totalIng.', "totalEnd": '.$totalEnd.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("del".$actioncap)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){
		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			//删除评论
			// $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_common` WHERE `aid` = ".$val);
			// $dsql->dsqlOper($archives, "update");

			// //删除缩略图
			// delPicFile($results[0]['litpic'], "delThumb", $action);
			// //删除正文图片
			// delEditorPic($value['body'], $action);
			// delEditorPic($value['mbody'], $action);

			// 删除问卷
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_record` WHERE `tid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除主表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("vote",$async);    // 投票活动、删除
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
	if(!testPurview("del".$actioncap)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `arcrank` = 0");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {

			//删除评论
			// $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_common` WHERE `aid` = ".$value['id']);
			// $dsql->dsqlOper($archives, "update");

			// //删除缩略图
			// delPicFile($results[0]['litpic'], "delThumb", $action);
			// //删除正文图片
			// delEditorPic($value['body'], $action);
			// delEditorPic($value['mbody'], $action);

			// 删除问卷
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_record` WHERE `tid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_list` WHERE `id` = ".$value['id']);
			$dsql->dsqlOper($archives, "update");

		}

	}
	die;



//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("edit".$actioncap)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
            //查询信息之前的状态
            $sql = $dsql->SetQuery("SELECT `state`, `admin` FROM `#@__".$action."_list` WHERE `id` = $val");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $arcrank_ = $ret[0]['arcrank'];
                $uid   =  $ret[0]['admin'];
                //获取会员名
                $username = "";
                $point   = "";
                $point = "";
                $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['username'];
                    $point = $ret[0]['point'];

                }
                //会员消息通知
                if($arcrank != $arcrank_) {
                    //已审核
                    if ($arcrank == 1) {
                        $countIntegral = countIntegral($uid);    //统计积分上限
                        global $cfg_returnInteraction_vote;    //投票积分
                        global $cfg_returnInteraction_commentDay;
                        if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_vote > 0) {
                            $infoname = getModuleTitle(array('name' => 'vote'));
                            //发布投票得积分
                            $date = GetMkTime(time());
                            global $langData;
                            global $userLogin;
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_vote' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($uid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$cfg_returnInteraction_vote);
                            //保存操作日志

                            $info = '发布'.$infoname;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_vote', '$info', '$date','zengsong','1','$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_vote,
                                "point" => $point,
                                "date" => date("Y-m-d H:i:s", $date),
                                "info" => $info,
                                "fields" => array(
                                    'keyword1' => '变动类型',
                                    'keyword2' => '变动积分',
                                    'keyword3' => '变动时间',
                                    'keyword4' => '积分余额'
                                )
                            );
                            updateMemberNotice($uid, "会员-积分变动通知", $param, $config);
                        }
                    }
                }
            }

			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_list` SET `arcrank` = ".$arcrank." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("vote",$async);    // 投票活动、更新状态

        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

//更新时间
}elseif($dopost == "updateTime"){
	if(!testPurview("edit".$actioncap)){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_list` SET `pubdate` = ".GetMkTime(time())." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息时间", $id);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/'.$action.'/'.$action.'List.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('actiontxt', $actiontxt);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
