<?php
/**
 * 管理贴吧帖子
 *
 * @version        $Id: tiebaList.php 2016-11-18 下午16:48:12 $
 * @package        HuoNiao.Tieba
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tiebaList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/tieba";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tiebaList.html";

$dotitle = $dopost == "tieba" ? "贴吧" : "图片";

$tab = "tieba_list";
if($action == ""){
    $action = "tieba";
}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $del = 0;
    if ($aType != "") {
        $del = 1;
    }

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `ip` like '%$sKeyword%')";
	}
	if($sType != ""){
		if($dsql->getTypeList($sType, "tieba_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "tieba_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	if($property !== ""){
		if($property == 'jinghua'){
			$where .= " AND `jinghua` = 1";
		}elseif($property == "top"){
			$where .= " AND `top` = 1";
		}elseif($property == "bold"){
			$where .= " AND `bold` = 1";
		}elseif($property == "isreply"){
			$where .= " AND `isreply` = 0";
		}elseif($property == "tag1"){
			$where .= " AND `tag1` = 1";
		}elseif($property == "tag2"){
			$where .= " AND `tag2` = 1";
		}elseif($property == "tag3"){
			$where .= " AND `tag3` = 1";
		}
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `waitpay` = 0 AND `del` = $del");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0  AND `del`= $del ".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1 AND `del`= $del ".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2 AND `del`= $del ".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

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
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `typeid`, `uid`, `title`, `pubdate`, `ip`, `color`, `bold`, `click`, `state`, `isreply`, `jinghua`, `top`,`comment` FROM `#@__".$tab."` WHERE `waitpay` = 0 AND `del` = $del".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["typeid"] = $value["typeid"];

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

			//地区
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__tieba_type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["typename"] = $typename[0]['typename'];

			$list[$key]["uid"] = $value["uid"];

			$username = "无";
			if($value['uid'] != 0){
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['uid']);
				$username = $dsql->getTypeName($userSql);
				$username = $username[0]['username'];
			}
			$list[$key]["username"] = $username;

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"]      = $value["ip"];
			$list[$key]["color"]   = $value["color"];
			$list[$key]["bold"]    = $value["bold"];
			$list[$key]["click"]   = $value["click"];
			$list[$key]["state"]   = $value["state"];
			$list[$key]["isreply"] = $value["isreply"];
			$list[$key]["jinghua"] = $value["jinghua"];
			$list[$key]["top"]     = $value["top"];

			//回复数量
			$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__public_comment_all` WHERE `type` = 'tieba-detail' AND `aid` = ".$value['id']);
			$ret = $dsql->dsqlOper($sql, "results");
			$replyCount = $ret[0]['t'];
//			$list[$key]['reply'] = $replyCount;
            $list[$key]['reply'] = $value["comment"];;
			$param = array(
				"service"  => "tieba",
				"template" => "detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);

			// 打赏
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$value["id"]." AND `state` = 1");
			//总条数
			$totalCount_ = $dsql->dsqlOper($archives, "totalCount");
			if($totalCount_){
				$archives = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'tieba' AND `aid` = ".$value["id"]." AND `state` = 1");
				$ret = $dsql->dsqlOper($archives, "results");
				$totalAmount = $ret[0]['totalAmount'];
			}else{
				$totalAmount = 0;
			}
			$list[$key]['reward'] = array("count" => $totalCount_, "amount" => $totalAmount);

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "tiebaList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//获取信息详情
} elseif($action == "revert"){

    if (!testPurview("deltieba")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `del` = 0 WHERE `id` = " . $val);

            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("还原" . $dowtitle . "信息", $id);
            echo '{"state": 100, "info": ' . json_encode("所选信息还原成功！") . '}';
        }
    }
    die;
} elseif($dopost == "getDetail"){

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `typeid`, `title`, `color`, `click`, `weight`, `bold`, `content`, `state`, `isreply`, `jinghua`, `top` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//编辑
}elseif($dopost == "updateDetail"){

	if(!testPurview("tiebaEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die('要修改的信息ID传递失败！');

	//表单二次验证
	if($typeid == ''){
		echo '{"state": 101, "info": '.json_encode("请选择文章分类！").'}';
		exit();
	}

	$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
	$res = $dsql->dsqlOper($sql, "results");
	$state_ = $res[0]['state'];

	$weight  = (int)$weight;
	$click   = (int)$click;
	$isreply = (int)$isreply;
	$bold    = (int)$bold;
	$jinghua = (int)$jinghua;
	$top     = (int)$top;
	$state   = (int)$state;

	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typeid` = $typeid, `weight` = '$weight', `click` = '$click', `isreply` = '$isreply', `bold` = '$bold', `jinghua` = '$jinghua', `top` = '$top', `state` = '$state', `color` = '$color', `content` = '$content' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{

		// 清除缓存
		checkCache("tieba_list", $id);
		clearCache("tieba_detail", $id);
		if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
			clearCache("tieba_total", "key");
			if($state == 1){
				clearCache("tieba_list", "key");
			}
		}

		adminLog("编辑贴吧帖子信息", $id);
		dataAsync("tieba",$id);  // 贴吧编辑信息
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif ($action == "del"){
    if(!testPurview("tiebaDel")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    $each = explode(",", $id);
    $error = array();
    $async = array();
    if ($id != "") {

        $adminid = $userLogin->getUserID();
        $purview = $userLogin->getPurview();
        if(preg_match('/founder/i', $purview)){
            $auditSwitch = false;
        }else{
            $delArcrank = true;
            $auditConfig = getAuditConfig("article");
            $auditSwitch = $auditConfig['switch'];
            $levelID = getAdminOrganId($adminid);
            if($levelID){
                if($auditSwitch && $auditConfig['auth'] <= 1){
                    $delArcrank = false;
                }
            }else{
                $delArcrank = false;
            }
        }

        foreach ($each as $val) {

            // $sub = new SubTable('article', '#@__articlelist');
            // $break_table = $sub->getSubTableById($id);
            $archives = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `del` = 1 WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("tieba",$async);  // 贴吧删除帖子
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("转移" . $dowtitle . "信息至回收站", $id);
            echo '{"state": 100, "info": ' . json_encode("所选信息已转移至回收站！") . '}';
        }
    }
    die;

} elseif($action== "fullyDel"){
	if(!testPurview("tiebaDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "tieba");
			}

			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__tieba_reply` WHERE `tid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除贴吧帖子
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("tieba_list", $val);
				clearCache("tieba_detail", $val);
				clearCache("tieba_total", "key");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除贴吧帖子信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("tiebaEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state`,`uid` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];
            $uid = $res[0]['uid'];
            //获取会员名
            $username = "";
            $point = "";
            $useinfo = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $uid");
            $ret = $dsql->dsqlOper($useinfo, "results");
            if($ret){
                $username = $ret[0]['username'];
                $point = $ret[0]['point'];

            }
			if ($state != $state_){
			    if ($state == 1) {
                    $countIntegral = countIntegral($uid);    //统计积分上限
                    global $cfg_returnInteraction_tieba;    //贴吧积分
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_tieba > 0) {
                        global  $userLogin;
                        $infoname = getModuleTitle(array('name' => 'tieba'));
                        //贴吧发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_tieba' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($userpoint+$cfg_returnInteraction_tieba);
                        //保存操作日志
                        $info = '发布'.$infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_tieba', '$info', '$date','zengsong','1','$userpoint')");//发布贴吧得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "amount" => $cfg_returnInteraction_tieba,
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


			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				clearCache("tieba_detail", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("tieba_list", $val);
					clearCache("tieba_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("tieba_list", 300);
					clearCache("tieba_total", "key");
				}
				$async[] = $val;
			}
		}
		dataAsync("tieba",$async);  // 贴吧信息批量改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新贴吧帖子状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}elseif($dopost == 'Add' || $dopost == 'Edit'){

	if($dopost == 'Add'){
		checkPurview("tiebaAdd");
	}else{
		checkPurview("tiebaEdit");
	}

	$pubdate = time();

	$templates = "tiebaAdd.html";

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
        'ui/chosen.jquery.min.js',
		'admin/tieba/tiebaAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//表单提交
	if($submit == "提交"){

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(empty($typeid)){
			echo '{"state": 200, "info": "请选择分类"}';
			exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		$click = (int)$click;
		$weight = (int)$weight;
		$bold = (int)$bold;
		$state = (int)$state;
		$isreply = (int)$isreply;
		$jinghua = (int)$jinghua;
		$top = (int)$top;
		$tag1 = (int)$tag1;
		$tag2 = (int)$tag2;
		$tag3 = (int)$tag3;

		//保存到主表
		if($dopost == 'Add'){

			$ip = GetIP();
			$ipAddr = getIpAddr($ip);
            $imgtype = $videotype = $audiotype = 0;
			if($tiebatype){
				if(in_array('0',$tiebatype)){
	                $imgtype = 1;
	            }
				if (in_array('1',$tiebatype)){
	                $videotype = 1;
	            }
				if (in_array('2',$tiebatype)){
	                $audiotype = 1;
	            }
			}

//            $videotype = strpos(trim($content),'/video') > 0 ? 1 :0;
//            $audiotype = strpos(trim($content),'/audio') > 0 ? 1 :0;
/*            $pattern="/<img.*?src=[\'|\"](.*?)[\'|\"].*?[\/]?>/";*/
//            preg_match_all($pattern,htmlspecialchars_decode($content),$match);
//            $imgtype = empty($match) ? 0:1;
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `typeid`, `uid`, `title`, `content`, `pubdate`, `ip`, `ipaddr`, `color`, `click`, `weight`, `bold`, `state`, `isreply`, `jinghua`, `top`, `tag1`, `tag2`, `tag3`,`imgtype`,`videotype`,`audiotype`) VALUES ('$cityid', '$typeid', '$userid', '$title', '$body', '$pubdate', '$ip', '$ipAddr', '$color', '$click', '$weight', '$bold', '$state', '$isreply', '$jinghua', '$top', '$tag1', '$tag2', '$tag3','$imgtype','$videotype','$audiotype')");
			$aid = $dsql->dsqlOper($archives, "lastid");
		}else{
			$imgtype = $videotype = $audiotype = 0;
			if($tiebatype){
				if(in_array('0',$tiebatype)){
	                $imgtype = 1;
	            }
				if (in_array('1',$tiebatype)){
	                $videotype = 1;
	            }
				if (in_array('2',$tiebatype)){
	                $audiotype = 1;
	            }
			}
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `typeid` = '$typeid', `uid` = '$userid', `title` = '$title', `content` = '$body', `color` = '$color', `click` = '$click', `weight` = '$weight', `bold` = '$bold', `state` = '$state', `isreply` = '$isreply', `jinghua` = '$jinghua', `top` = '$top', `tag1` = '$tag1', `tag2` = '$tag2', `tag3` = '$tag3',`imgtype` = '$imgtype',`audiotype` = '$audiotype',`videotype` = '$videotype' WHERE `id` = $id");
			$aid = $dsql->dsqlOper($archives, "update");
			if($aid == 'ok'){
				$aid = $id;
			}
		}

		if(is_numeric($aid)){

			if($state == 1){
				updateCache("tieba_list", 300);
				clearCache("tieba_total", "key");
			}

			adminLog("新增贴子", $title);

			$param = array(
				"service"  => "tieba",
				"template" => "detail",
				"id"       => $aid
			);
			$url = getUrlPath($param);
            dataAsync("tieba",$aid);  // 新增、编辑帖子
			echo '{"state": 100, "url": "'.$url.'"}';
		}else{
			echo $aid;
		}
		die;

	}elseif($dopost == 'Edit'){
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$cityid      = $results[0]['cityid'];
				$typeid      = $results[0]['typeid'];
				$uid         = $results[0]['uid'];
				$title       = $results[0]['title'];
				$content     = $results[0]['content'];
				$color       = $results[0]['color'];
				$click       = $results[0]['click'];
				$weight      = $results[0]['weight'];
				$bold        = $results[0]['bold'];
				$state       = $results[0]['state'];
				$isreply     = $results[0]['isreply'];
				$jinghua     = $results[0]['jinghua'];
				$top         = $results[0]['top'];
				$tag1        = $results[0]['tag1'];
				$tag2        = $results[0]['tag2'];
				$tag3        = $results[0]['tag3'];
				$imgtype     = $results[0]['imgtype'];
				$videotype   = $results[0]['videotype'];
				$audiotype   = $results[0]['audiotype'];

				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $uid);
				$username = $dsql->getTypeName($userSql);
				$huoniaoTag->assign('username', $username[0]['username']);

				global $data;
				$data = "";
				$typename = getParentArr("tieba_type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));


			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}


}else{
	//css
	$cssFile = array(
	    'ui/jquery.chosen.css',
	    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/tieba/tiebaList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}
//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('uid', $uid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('content', $content);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('click', (int)$click);
	$huoniaoTag->assign('weight', $weight == "" ? 1 : $weight);
	$huoniaoTag->assign('bold', (int)$bold);
	$huoniaoTag->assign('isreply', $isreply);
	$huoniaoTag->assign('jinghua', $jinghua);
	$huoniaoTag->assign('top', $top);
	$huoniaoTag->assign('tag1', $tag1);
	$huoniaoTag->assign('tag2', $tag2);
	$huoniaoTag->assign('tag3', $tag3);
    $huoniaoTag->assign('action', $action);


    //阅读权限-单选
	$huoniaoTag->assign('arcrankList', array('0', '1', '2'));
	$huoniaoTag->assign('arcrankName',array('等待审核','审核通过','审核拒绝'));
	$huoniaoTag->assign('arcrank', $state == "" ? 1 : $state);
    $imgtype      = $imgtype    == 1 ? 0 : 3;
    $videotype    = $videotype  == 1 ? 1 : 3;
    $audiotype    = $audiotype  == 1 ? 2 : 3;
    $tiebatypestr = $imgtype.','.$videotype.','.$audiotype;
    /*视频类型*/
    $huoniaoTag->assign('tiebatypeopt', array('0', '1', '2'));
    $huoniaoTag->assign('tiebatypenames',array('图片','视频','音频'));
    $huoniaoTag->assign('tiebatype', $tiebatypestr === '' ? "" : explode(",", $tiebatypestr));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "tieba_type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tieba";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
