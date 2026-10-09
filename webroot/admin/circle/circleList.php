<?php
/**
 * 管理圈子动态
 *
 * @version        $Id: circleList.php 2016-11-18 下午16:48:12 $
 * @package        HuoNiao.circle
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("circleList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/circle";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "circleList.html";

$tab = "circle_dynamic_all";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    // $where = getCityFilter('`cityid`');

    // if ($adminCity) {
    //     $where = " AND `cityid` = $adminCity";
    // }
	if($sKeyword != ""){
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `id` = $id";
			}
		}
		if(!$isId){
			$where .= " AND (`content` like '%$sKeyword%' OR `ip` like '%$sKeyword%')";
		}
	}
	if($sType != ""){
		if($dsql->getTypeList($sType, "circle_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "circle_type"));
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
		$where .= " AND `addtime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `addtime` <= ". GetMkTime($end . " 23:59:59");
	}

	if(!empty($id)){
		$where .= " AND `id` = ".$id;
	}
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

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
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `picadr`, `videoadr`,`thumbnail`, `topictitle`,`commodity`, `addrname`, `zan`, `addtime`,`state`,`ip`,`browse` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

            // $cityname = getSiteCityName($value['cityid']);
            // $list[$key]['cityname'] = $cityname;

			//地区
			// $typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__circle_type` WHERE `id` = ". $value["typeid"]);
			// $typename = $dsql->getTypeName($typeSql);
			// $list[$key]["typename"] = $typename[0]['typename'];

			$list[$key]["userid"] = $value["userid"];

			$username = "无";
			if($value['userid'] != 0){
				$user = $userLogin->getMemberInfo($value["userid"]);
				$username = is_array($user) ? $user['nickname'] : '无';
			}
			$list[$key]["username"] = $username;

			$list[$key]["addtime"] 		= date('Y-m-d H:i:s', $value["addtime"]);
			$list[$key]["picadr"]      	= explode(',', $value["picadr"]);
			$list[$key]["commodity"]    = $value["commodity"] ? json_decode($value["commodity"],true) :'';
			$list[$key]["videoadr"]   	= getFilePath($value["videoadr"]);
			$list[$key]["thumbnail"]   	= getFilePath($value["thumbnail"]);
			$list[$key]["topictitle"]   = $value["topictitle"];
			$list[$key]["addrname"]   	= $value["addrname"];
			$list[$key]["zan"]   		= $value["zan"];
			$list[$key]["state"]   		= $value["state"];
			$list[$key]["browse"] 		= $value["browse"];
			if ($value["videoadr"]!='') {
				$list[$key]["content"]   	= "#".$value['id']."【视频】".$value["content"];
			}elseif($value["picadr"]!=''){
				$list[$key]["content"]   	= "#".$value['id']."【图片】".$value["content"];
			}else{
				$list[$key]["content"]   	= "#".$value['id']."【文字】".$value["content"];
			}
			$list[$key]["ip"]   		= $value["ip"];
			//回复数量
			$sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__public_comment_all` WHERE `type` = 'circle-dynamic' AND `aid` = ".$value['id']);
			$ret = $dsql->dsqlOper($sql, "results");
			$replyCount = $ret[0]['t'];
			$list[$key]['reply'] = $replyCount;

			$param = array(
				"service"  => "circle",
				"template" => "blog_detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);

			// 打赏
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'circle' AND `aid` = ".$value["id"]." AND `state` = 1");
			//总条数
			$totalCount_ = $dsql->dsqlOper($archives, "totalCount");
			if($totalCount_){
				$archives = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'circle' AND `aid` = ".$value["id"]." AND `state` = 1");
				$ret = $dsql->dsqlOper($archives, "results");
				$totalAmount = $ret[0]['totalAmount'];
			}else{
				$totalAmount = 0;
			}
			$list[$key]['reward'] = array("count" => $totalCount_, "amount" => $totalAmount);

		}
		// echo "<pre>";
		// var_dump($list);die;
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "circleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//获取信息详情
}elseif($dopost == "getDetail"){

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `typeid`, `title`, `color`, `click`, `weight`, `bold`, `content`, `state`, `isreply`, `jinghua`, `top` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//编辑
}elseif($dopost == "updateDetail"){

	if(!testPurview("circleList")){
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
		checkCache("circle_list", $id);
		clearCache("circle_detail", $id);
		if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
			clearCache("circle_total", "key");
			if($state == 1){
				clearCache("circle_list", "key");
			}
		}

		adminLog("编辑圈子动态信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("circleList")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			array_push($title, $results[0]['content'] ? cn_substrR($results[0]['content'], 20) : "ID:" . $val);

			//删除缩略图
			delPicFile($results[0]['thumbnail'], "delAtlas", "circle");
			//删除内容图片
			delPicFile($results[0]['picadr'], "delAtlas", "circle");
			//删除视频
			delPicFile($results[0]['videoadr'],"delVideo","circle");
			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__public_comment_all` WHERE `aid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除圈子动态
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("circle_list", $val);
				clearCache("circle_detail", $val);
				clearCache("circle_total", "key");
				$async[] = $val;
			}
		}
		dataAsync("circle",$async);  // 圈子动态，删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除圈子动态信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("circleList")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state`,`userid` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];
            $uid= $res[0]['userid'];
            //会员消息通知
            if ($state != $state_) {
                //已审核
                if ($state == 1) {
                    //获取会员名
                    $username = "";
                    $point = "";
                    $point = "";
                    $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $username = $ret[0]['username'];
                        $point = $ret[0]['point'];

                    }
                    global $cfg_returnInteraction_circle;    //圈子积分
                    $countIntegral = countIntegral($uid);    //统计积分上限
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_circle > 0) {
                        global $userLogin;
                        $infoname = getModuleTitle(array('name' => 'circle'));
                        //圈子发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_circle' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($userpoint+$cfg_returnInteraction_circle);
                        //保存操作日志
                        $info = '发布' . $infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_circle', '$info', '$date','zengsong','1','$userpoint')");//发布圈子得积分
                        $dsql->dsqlOper($archives, "update");
                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "amount" => $cfg_returnInteraction_circle,
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




			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				// clearCache("circle_detail", $val);
				clearCache("circle_list", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("circle_list", $val);
					clearCache("circle_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("circle_list", 300);
					clearCache("circle_total", "key");
				}
				$async[] = $val;
			}
		}
		dataAsync("circle",$async);  // 圈子动态、修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新圈子动态状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}elseif($dopost == 'Add' || $dopost == 'Edit'){

	if($dopost == 'Add'){
		checkPurview("circleList");
	}else{
		checkPurview("circleList");
	}

	$pubdate = time();

	$templates = "circledynamicAdd.html";

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css',
        'publicUpload.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
        'ui/chosen.jquery.min.js',
		'admin/circle/circledynamicAdd.js',
		'publicUpload.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//表单提交
	if($submit == "提交"){
        //表单二次验证
        // if(empty($cityid)){
        //     echo '{"state": 200, "info": "请选择城市"}';
        //     exit();
        // }

  //       $adminCityIdsArr = explode(',', $adminCityIds);
  //       if(!in_array($cityid, $adminCityIdsArr)){
  //           echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
  //           exit();
  //       }

		// if(empty($typeid)){
		// 	echo '{"state": 200, "info": "请选择分类"}';
		// 	exit();
		// }

		// if(trim($title) == ''){
		// 	echo '{"state": 200, "info": "标题不能为空"}';
		// 	exit();
		// }


		//保存到主表
		if($dopost == 'Add'){

			$ip = GetIP();
			$ipAddr = getIpAddr($ip);

			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`userid`, `picadr`,`videoadr` , `state`, `content`) VALUES ('$userid','$picadr','$video',$state','$zan','$body')");
			$aid = $dsql->dsqlOper($archives, "lastid");
		}else{
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `userid` = '$userid', `picadr` = '$picadr', `videoadr` = '$video', `state` = '$state', `content` = '$body' WHERE `id` = $id");
			$aid = $dsql->dsqlOper($archives, "update");
			if($aid == 'ok'){
				$aid = $id;
			}
		}

		if(is_numeric($aid)){

			if($state == 1){
				updateCache("circle_list", 300);
				clearCache("circle_total", "key");
			}

			adminLog("新增圈子动态", $title);

			$param = array(
				"service"  => "circle",
				"template" => "detail",
				"id"       => $aid
			);
			$url = getUrlPath($param);

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
				$id 			= $results[0]['id'];
				$userid      	= $results[0]['userid'];
				$content      	= $results[0]['content'];
				$picadr         = $results[0]['picadr'];
				$videoadr       = $results[0]['videoadr'];

				$topicid     	= $results[0]['topicid'];
				$topictitle     = $results[0]['topictitle'];
				$lng       		= $results[0]['lng'];
				$lat      		= $results[0]['lat'];
				$addrname       = $results[0]['addrname'];
				$commodity      = $results[0]['commodity'];
				$state     		= $results[0]['state'];
				$zan     		= $results[0]['zan'];
				$hot         	= $results[0]['hot'];
				$addtime        = $results[0]['addtime'];
				$ip         	= $results[0]['ip'];

				if(stripos($videoadr,'<iframe') !== false){
					$videoadr = str_replace("<iframe", "", $videoadr);
					$videoadr = str_replace("iframe>", "", $videoadr);
					$videoadr = str_replace("</", "", $videoadr);
					$videoadr = str_replace(">", "", $videoadr);
					$iframe = explode(" ", $videoadr);
					foreach ($iframe as $k => $v) {
						if(stripos($v,'src') !== false){
							$videoadr = str_replace("'", "", str_replace('"', "", str_replace('src=', "", $v)));
							break;
						}
					}
				}

				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
				$username = $dsql->getTypeName($userSql);
				$huoniaoTag->assign('username', $username[0]['username']);

				global $data;
				$data = "";


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
        'publicUpload.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'admin/circle/circleList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}
//验证模板文件
if(file_exists($tpl."/".$templates)){
	require_once(HUONIAOINC."/config/circle.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('content', $content);
	$huoniaoTag->assign('picadr', $picadr ? json_encode(explode(",", $picadr)) : "[]");
	$huoniaoTag->assign('videoadr', $videoadr);
	$huoniaoTag->assign('topicid', $topicid);
	$huoniaoTag->assign('topictitle', $topictitle);
	$huoniaoTag->assign('lng', $lng);
	$huoniaoTag->assign('lat', $lat);
	$huoniaoTag->assign('addrname', $addrname);
	$huoniaoTag->assign('commodity', $commodity);
	$huoniaoTag->assign('zan', $zan);
	$huoniaoTag->assign('hot', $hot);
	$huoniaoTag->assign('addtime', $addtime);
	$huoniaoTag->assign('ip', $ip);

	$caratlasMax = $custom_car_atlasMax ? $custom_car_atlasMax : 9;
	$huoniaoTag->assign('caratlasMax', $caratlasMax);

	//阅读权限-单选
	$huoniaoTag->assign('arcrankList', array('0', '1', '2'));
	$huoniaoTag->assign('arcrankName',array('等待审核','审核通过','审核拒绝'));
	$huoniaoTag->assign('arcrank', $state == "" ? 1 : $state);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "circle_type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/circle";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
