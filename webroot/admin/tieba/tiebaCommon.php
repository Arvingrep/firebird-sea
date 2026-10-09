<?php
/**
 * 管理分类信息评论
 *
 * @version        $Id: tiebaCommon.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tiebaCommon");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tieba";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tiebaCommon.html";

//城市管理员，只能管理管辖城市的会员
$adminAreaIDs = '';
$ids = array();
if($userType == 3){
	//查询分类信息
	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_list` WHERE `state` = 1" . getCityFilter('`cityid`'));
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret && is_array($ret)){
		foreach ($ret as $key => $value) {
			array_push($ids, $value['id']);
		}
		if($ids){
			$ids = join(',', $ids);
		}
	}
}


global $handler;
$handler = true;

$action = "public";

if($dopost == "getDetail"){
	if($id == "") die;

	$where = "";
	if($userType == 3){
		if($ids){
			$where .= " AND `aid` in ($ids)";
		}else{
			$where .= " AND 1 = 2";
		}
	}

	$archives = $dsql->SetQuery("SELECT `aid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `rating`, `ischeck`, `sco1`, `pics`,`top` FROM `#@__".$action."_comment_all` WHERE `id` = ".$id.$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){

		$results[0]["rating"] = $results[0]["sco1"];
        $istop     = $results[0]['top'];


        $typeSql = $dsql->SetQuery("SELECT p.`title` FROM `#@__tieba_list` p WHERE p.`id` = ". $results[0]["aid"]);
		$typename = $dsql->getTypeName($typeSql);
		$results[0]["storeTitle"] = $typename[0]['title'];

		$param = array(
			"service"  => "tieba",
			"template" => "detail",
			"id"       => $results[0]['aid']
		);
		$results[0]["storeUrl"] = getUrlPath($param);

		if($results[0]["userid"] == 0 || $results[0]["userid"] == -1){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["userid"]);
			$member = $dsql->dsqlOper($archives, "results");
			$username = $member[0]["username"];
		}
		$results[0]["username"] = $username;

		//评论图集
		$imglist = array();
		$pics = $results[0]['pics'];
		if(!empty($pics)){
			$pics = explode(",", $pics);
			foreach ($pics as $key => $value) {
				$imglist[$key]['val'] = $value;
				$imglist[$key]['path'] = getFilePath($value);
			}
		}
		$results[0]['pics'] = $imglist;

		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("评论信息获取失败！").'}';
	}
	die;

//更新评论信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$content = $_POST["content"];
	$dtime   = GetMkTime($_POST["time"]);
	$ip      = $_POST["ip"];
	$rating  = $_POST["rating"];
	$reply   = $_POST["reply"];
	$rtime   = GetMkTime($_POST["rtime"]);
	$ischeck = $_POST["isCheck"];
	$ipAddr  = getIpAddr($ip);
    $top     =  $_POST["top"];

	$where = "";
	$where1 = "";
	if($userType == 3){
		if($ids){
			$where .= " AND c.`aid` in ($ids)";
			$where1 .= " AND `aid` in ($ids)";
		}else{
			$where .= " AND 1 = 2";
			$where1 .= " AND 1 = 2";
		}
	}

	//会员通知
	$sql = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`pubdate`, l.`uid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid`,c.`top` FROM `#@__".$action."_comment_all` c LEFT JOIN `#@__tieba_list` l ON l.`id` = c.`aid` WHERE c.`id` = " . $id . $where);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$aid     = $ret[0]['id'];
		$title   = $ret[0]['title'];
		$pubdate = $ret[0]['pubdate'];
		$uid     = $ret[0]['uid'];
		$userid  = $ret[0]['userid'];
		$ischeck_ = $ret[0]['ischeck'];
		$dtime   = $ret[0]['dtime'];
		$pid     = $ret[0]['pid'];
		$rid     = $ret[0]['rid'];

		//验证评论状态
		if($ischeck_ != $isCheck){

			$param = array(
				"service"  => "tieba",
				"template" => "detail",
				"id"       => $aid
			);

			//只有审核通过的信息才发通知
			if($isCheck == 1){

				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['username'];
				}

				//自定义配置
        		$config = array(
        			"username" => $username,
        			"title" => $title,
        			"date" => date("Y-m-d H:i:s", $dtime),
        			"fields" => array(
        				'keyword1' => '信息标题',
        				'keyword2' => '发布时间',
        				'keyword3' => '进展状态'
        			)
        		);

				updateMemberNotice($userid, "会员-评论审核通过", $param, $config);

				 /*评论id*/
                $pcid = $pid;
                $pltype = "评论了您";
                if($rid!=0){
                    $pcid = $rid;
                    $pltype = "回复了您";
                    $archives = $dsql->SetQuery("SELECT `userid` FROM `#@__public_comment_all` WHERE `id` = " . $pcid);
                    $results  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $uid        	= $results[0]['userid'];
//                        $userid       	= $uid;
                    }
                }
				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['username'];
				}

				//自定义配置
        		$config = array(
                    "username"    => $username,
                    "noticetitle" => $username.$pltype,
                    "title" => $title,
                    "date" => date("Y-m-d H:i:s", $pubdate),
                    "fields" => array(
                        'keyword1' => '信息标题',
                        'keyword2' => '评论时间',
                        'keyword3' => '进展状态'
                    )
                );

				updateMemberNotice($uid, "会员-新评论通知", $param, $config);

			}

		}
	}

	$archives = $dsql->SetQuery("UPDATE `#@__".$action."_comment_all` SET `content` = '$content', `dtime` = '$dtime', `ip` = '$ip', `ischeck` = '$isCheck', `sco1` = '$rating', `pics`='$pics',`top` = '$top' WHERE `id` = ".$id.$where1);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新分类信息评论", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//更新评论状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){

		$where = "";
		$where1 = "";
		if($userType == 3){
			if($ids){
				$where .= " AND c.`aid` in ($ids)";
				$where1 .= " AND `aid` in ($ids)";
			}else{
				$where .= " AND 1 = 2";
				$where1 .= " AND 1 = 2";
			}
		}

		//会员通知
		$sql = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`pubdate`, l.`uid`, c.`userid`, c.`ischeck`, c.`dtime`,c.`rid`,c.`pid` FROM `#@__".$action."_comment_all` c LEFT JOIN `#@__tieba_list` l ON l.`id` = c.`aid` WHERE c.`id` = " . $val.$where);
		$ret = $dsql->dsqlOper($sql, "results");
        $countcoment = $dsql->dsqlOper($sql, "totalCount");

        if($ret){
			$aid     = $ret[0]['id'];
			$title   = $ret[0]['title'];
			$pubdate = $ret[0]['pubdate'];
			$uid     = $ret[0]['uid'];
			$userid  = $ret[0]['userid'];
			$ischeck = $ret[0]['ischeck'];
			$dtime   = $ret[0]['dtime'];
			$pid     = $ret[0]['pid'];
        	$rid     = $ret[0]['rid'];

			//验证评论状态
			if($ischeck != $arcrank){

				$param = array(
					"service"  => "tieba",
					"template" => "detail",
					"id"       => $aid
				);

				//只有审核通过的信息才发通知
				if($arcrank == 1){
                    $increasetieba = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = `comment` + '$countcoment' WHERE `id` = '$aid' AND $arcrank = 1 ");
                     $dsql->dsqlOper($increasetieba, "update");
					//获取会员名
					$username = "";
                    $upoint = "";
					$sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $userid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$username = $ret[0]['username'];
                        $point = $ret[0]['point'];
                    }

					//自定义配置
	        		$config = array(
	        			"username" => $username,
	        			"title" => $title,
	        			"date" => date("Y-m-d H:i:s", $dtime),
	        			"fields" => array(
	        				'keyword1' => '信息标题',
	        				'keyword2' => '发布时间',
	        				'keyword3' => '进展状态'
	        			)
	        		);

					updateMemberNotice($userid, "会员-评论审核通过", $param, $config);

                    global $cfg_returnInteraction_comment;  //评论积分
                    global $cfg_returnInteraction_commentDay;  //评论一天内上限积分
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_comment > 0) {
                        global  $userLogin;
                            //评论得积分
                            $date = GetMkTime(time());
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_comment' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$cfg_returnInteraction_comment);
                            //保存操作日志
                            $info = '发表评论';
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_comment', '$info', '$date','zengsong','1','$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_comment,
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
                            updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                        }




	 				/*评论id*/
	                $pcid = $pid;
	                $pltype = "评论了您";
	                if($rid!=0){
	                    $pcid = $rid;
	                    $pltype = "回复了您";
	                    $archives = $dsql->SetQuery("SELECT `userid` FROM `#@__public_comment_all` WHERE `id` = " . $pcid);
	                    $results  = $dsql->dsqlOper($archives, "results");
	                    if($results){
	                        $uid          = $results[0]['userid'];
//	                        $userid       = $uid;
	                    }
	                }
					//获取会员名
					$username = "";
					$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$username = $ret[0]['username'];
					}

					//自定义配置
	        		$config = array(
	                    "username"    => $username,
	                    "noticetitle" => $username.$pltype,
	                    "title" => $title,
	                    "date" => date("Y-m-d H:i:s", $pubdate),
	                    "fields" => array(
	                        'keyword1' => '信息标题',
	                        'keyword2' => '评论时间',
	                        'keyword3' => '进展状态'
	                    )
	                );

					updateMemberNotice($uid, "会员-新评论通知", $param, $config);
          			    clearCache("tieba_detail", $aid);
 						clearCache("tieba_list", "key");
				}
				if ($arcrank == 0 || $arcrank == 2){
                    $increasetieba = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = `comment` - 1 WHERE `id` = '$aid' AND $arcrank=$arcrank ");
                    $dsql->dsqlOper($increasetieba, "update");
            		  clearCache("tieba_detail", $aid);

            		  clearCache("tieba_list", "key");
                }

			}
		}



		$archives = $dsql->SetQuery("UPDATE `#@__".$action."_comment_all` SET `ischeck` = $arcrank WHERE `id` = ".$val.$where1);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新分类信息评论状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除评论
}else if($dopost == "delComment"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){

		$where = "";
		if($userType == 3){
			if($ids){
				$where .= " AND `aid` in ($ids)";
			}else{
				$where .= " AND 1 = 2";
			}
		}

		$sql = $dsql->SetQuery("SELECT `id`,`aid` FROM `#@__".$action."_comment_all` WHERE `id` = " . $val . $where);
		$ret = $dsql->dsqlOper($sql, "results");
        $count = $dsql->dsqlOper($sql, "totalCount");

        if($ret){
		    $aid = $ret[0]['aid'];
            $increasetieba = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = `comment` -'$count' WHERE `id` = $aid");
            $dsql->dsqlOper($increasetieba, "update");

			$sql = $dsql->SetQuery("DELETE FROM `#@__public_up_all` WHERE `type` = '1' and `tid` = '$val'");
			$dsql->dsqlOper($sql, "update");

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_comment_all` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}else{
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除分类信息评论", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `type` = 'tieba-detail'";

	if ($adminCity){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_list` WHERE `arcrank` = 1" . getWrongCityFilter('`cityid`', $adminCity));
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {
				array_push($ids, $value['id']);
			}
			if($ids){
				$ids = join(',', $ids);
			}

			$where .= " AND `aid` in ($ids)";
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
		}
    }

	if($userType == 3){
		if($ids){
			$where .= " AND `aid` in ($ids)";
		}else{
			$where .= " AND 1 = 2";
		}
	}

	if($sKeyword != ""){
		//按评论内容搜索
		if($sType == 0){
			$where .= " AND `content` like '%$sKeyword%'";

		//按信息标题搜索
		}elseif($sType == "1"){
			$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__tieba_list` l WHERE l.`title` like '%$sKeyword%'");
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				$list = array();
				foreach ($results as $key=>$value) {
					$list[] = $value["id"];
				}
				$idList = join(",", $list);
				$where .= " AND `aid` in ($idList)";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}

		//按评论人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND (`userid` = 0 OR `userid` = -1)";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
				$results = $dsql->dsqlOper($archives, "results");

				if(count($results) > 0){
					$list = array();
					foreach ($results as $key=>$value) {
						$list[] = $value["id"];
					}
					$idList = join(",", $list);

					$where .= " AND `userid` in ($idList)";

				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
				}
			}

		//按IP搜索
		}elseif($sType == "3"){
			$where .= " AND `ip` like '%$sKeyword%'";
		}
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_comment_all`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." WHERE `ischeck` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." WHERE `ischeck` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." WHERE `ischeck` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `ischeck` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `aid`,`top`,`userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$action."_comment_all` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["aid"] = $value["aid"];

			$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = ". $value["aid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["storeTitle"] = $typename[0]['title'];

			$param = array(
				"service"  => "tieba",
				"template" => "detail",
				"id"       => $value['aid']
			);
			$list[$key]["storeUrl"] = getUrlPath($param);

			$list[$key]["userid"] = $value["userid"];
			
			$userinfo = $userLogin->getMemberInfo($value['userid']);
			$list[$key]["username"]  = $userinfo['nickname'];

			$list[$key]["content"] = cn_substrR(strip_tags($value["content"]), 32)."...";
			$list[$key]["time"] = date('Y-m-d H:i:s', $value["dtime"]);
			$list[$key]["rtime"] = date('Y-m-d H:i:s', $value["rtime"]);
			$list[$key]["reply"] = $value["reply"];
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipAddr"] = $value["ipaddr"];
            $list[$key]["top"] = $value["top"];

			$state = "";
			switch($value["ischeck"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
			}

			$list[$key]["isCheck"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "commonList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
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
		'ui/jquery-ui-selectable.js',
		'ui/chosen.jquery.min.js',
		'admin/tieba/tiebaCommon.js'
	);
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tieba";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
