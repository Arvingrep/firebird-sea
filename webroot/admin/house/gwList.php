<?php
/**
 * 顾问管理
 *
 * @version        $Id: gwList.php 2014-1-11 下午20:14:10 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "house_gw";

if($action != ""){
	$templates = "gwAdd.html";
	if($submit == "提交"){
        checkPurview("gwListAdd");
    }

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/gwAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}else{
	$templates = "gwList.html";
	checkPurview("gwList");
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
		'admin/house/gwList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

$pagetitle = "置业顾问管理";
$dopost = $dopost ? $dopost : "add";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate     = GetMkTime(time());       //发布时间

	//表单二次验证
	if($typeid == 0 && trim($type) == ''){
		echo '{"state": 200, "info": "请选择所属开发商"}';
		exit();
	}else{
		if($typeid == 0){
			$typeSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_kfs` WHERE `typename` = '".$type."'");
			$typeResult = $dsql->dsqlOper($typeSql, "results");
			if(!$typeResult){
				echo '{"state": 200, "info": "开发商不存在，请重新选择"}';
				exit();
			}
			$typeid = $typeResult[0]['id'];
		}else{
			$typeSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_kfs` WHERE `id` = ".$typeid);
			$typeResult = $dsql->dsqlOper($typeSql, "results");
			if(!$typeResult){
				echo '{"state": 200, "info": "开发商不存在，请在联想列表中选择"}';
				exit();
			}
		}
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员"}';
		exit();
	}else{
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请重新选择"}';
				exit();
			}
			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
		}
	}

	//检测是否已经注册
	if($dopost == "add"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它开发商，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它开发商，不可以重复添加！"}';
			exit();
		}

	}

	if(empty($stores)){
		echo '{"state": 200, "info": "请填写所在门店"}';
		exit();
	}

	if(empty($addr)){
		echo '{"state": 200, "info": "请选择工作区域"}';
		exit();
	}

}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){
		$where .= " AND (`stores` like '%$sKeyword%'";

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
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

        $kfsSql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__house_kfs` WHERE `typename` like '%$sKeyword%'");
        $kfsResult = $dsql->dsqlOper($kfsSql, "results");
        if($kfsResult){
            $kfsid = array();
            foreach($kfsResult as $key => $kfs){
                array_push($kfsid, $kfs['id']);
            }
            if(!empty($kfsid)){
                $where .= " OR `type` in (".join(",", $kfsid)."))";
            }
        }else{
            $where .= ")";
        }
	}
	if($sType != ""){
		$where .= " AND `type` = $sType";
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

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			//开发商
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__house_kfs` WHERE `id` = ". $value["type"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["typename"] = $typename[0]['typename'];

			//会员
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["userid"]);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["userid"] = $value["userid"];
			$list[$key]["username"] = $username[0]['username'];

			$list[$key]["stores"] = $value["stores"];

			//区域
            $addrname = $value['addr'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
			$list[$key]["addr"] = $addrname;

			$list[$key]["weight"] = $value["weight"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value['pubdate']);

			$list[$key]["name"] = $value["name"];
			$list[$key]["post"] = $value["post"];
			$list[$key]["tel"] = $value["tel"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "gwList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "add"){

	$pagetitle     = "新增顾问";

	//表单提交
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `type`, `userid`, `stores`, `addr`, `card`, `weight`, `state`, `pubdate`, `post`) VALUES ('$cityid', '$typeid', $userid, '$stores', '$addr', '$litpic', $weight, $state, $pubdate, '$post')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增置业顾问", $user);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){

	$pagetitle = "修改置业顾问信息";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = $cityid, `type` = $typeid, `userid` = $userid, `stores` = '$stores', `addr` = $addr, `card` = '$litpic', `weight` = $weight, `state` = $state, `post` = '$post' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){

			if($tj){
				foreach ($tj as $k => $v) {
					$loupan = $v['id'];
					$see = abs($v['see']);
					$suc = abs($v['suc']);
					$sql = $dsql->SetQuery("SELECT `id`, `see`, `suc` FROM `#@__house_gw_tj` WHERE `loupan` = $loupan AND `gw` = $id");
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						if($res[0]['see'] != $see || $res[0]['suc'] != $suc){
							$sql = $dsql->SetQuery("UPDATE `#@__house_gw_tj` SET `see` = $see, `suc` = $suc WHERE `id` = ".$res[0]['id']);
							$dsql->dsqlOper($sql, "update");
						}
					}else{
						$sql = $dsql->SetQuery("INSERT INTO `#@__house_gw_tj`(`gw`, `loupan`, `see`, `suc`) VALUES ($id, '$loupan', $see, $suc)");
						$dsql->dsqlOper($sql, "lastid");
					}
				}
			}

			adminLog("修改置业顾问", $user);
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

				$typeid      = $results[0]['type'];
				//开发商
				$typeSql  = $dsql->SetQuery("SELECT `typename` FROM `#@__house_kfs` WHERE `id` = ". $results[0]['type']);
				$typename = $dsql->getTypeName($typeSql);
				$typename = $typename[0]['typename'];

				$userid    = $results[0]['userid'];
				//用户名
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $results[0]['userid']);
				$username = $dsql->getTypeName($userSql);
				$username = $username[0]['username'];

				$stores  = $results[0]['stores'];
				$addr    = $results[0]['addr'];
				$card    = $results[0]['card'];
				$weight  = $results[0]['weight'];
				$state   = $results[0]['state'];
				$pubdate = $results[0]['pubdate'];
				$cityid  = $results[0]['cityid'];
				$name    = $results[0]['name'];
				$post    = $results[0]['post'];
				$tel     = $results[0]['tel'];

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
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM  `#@__house_loupan` WHERE `userid` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			foreach($results as $value){
				//删除楼盘缩略图
				delPicFile($value['litpic'], "delThumb", "house");

				//删除房源
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_listing` WHERE `loupan` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "results");
				foreach($results as $listing){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_listing` WHERE `id` = ".$listing['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除缩略图
					array_push($title, $results[0]['title']);
					delPicFile($results[0]['litpic'], "delThumb", "house");

					//删除内容图片
					$body = $results[0]['note'];
					if(!empty($body)){
						delEditorPic($body, "house");
					}

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $value){
							$atlasPic .= $value['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除降价通知
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 1 AND `aid` = ".$listing['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除房源表
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_listing` WHERE `id` = ".$listing['id']);
					$results = $dsql->dsqlOper($archives, "update");
				}

				//删除户型
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach($each as $apartment){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除缩略图
						array_push($title, $results[0]['title']);
						delPicFile($results[0]['litpic'], "delThumb", "house");

						//图集
						$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除图片文件
						if(!empty($results)){
							$atlasPic = "";
							foreach($results as $key => $value){
								$atlasPic .= $value['picPath'].",";
							}
							delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
						}

						$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
						$results = $dsql->dsqlOper($archives, "update");

						//删除户型表
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}
				}

				//删除相册
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_album` WHERE `action` = 'loupan' AND `loupan` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach($each as $album){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = ".$album['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除缩略图
						array_push($title, $results[0]['title']);
						delPicFile($results[0]['litpic'], "delThumb", "house");

						//图集
						$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除图片文件
						if(!empty($results)){
							$atlasPic = "";
							foreach($results as $key => $value){
								$atlasPic .= $value['picPath'].",";
							}
							delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
						}

						$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
						$results = $dsql->dsqlOper($archives, "update");

						//删除相册表
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_album` WHERE `id` = ".$album['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}
				}

				//删除评论
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__housecommon` WHERE `action` = 'loupan' AND `aid` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach($each as $common){
						$archives = $dsql->SetQuery("DELETE FROM `#@__housecommon` WHERE `id` = ".$common['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}
				}

				//删除资讯
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupannews` WHERE `loupan` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					foreach($each as $news){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupannews` WHERE `id` = ".$news['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除内容图片
						$body = $results[0]['body'];
						if(!empty($body)){
							delEditorPic($body, "house");
						}

						//删除资讯
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupannews` WHERE `id` = ".$news['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}
				}

				//删除降价通知
				$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 0 AND `aid` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "update");

				//删除团购报名
				$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupantuan` WHERE `aid` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "update");

				//删除楼盘
				$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupan` WHERE `id` = ".$value['id']);
				$results = $dsql->dsqlOper($archives, "update");
			}

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			delPicFile($results[0]['card'], "delCard", "house");

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除置业顾问", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("loupanEdit")){
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
			adminLog("更新顾问状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){



	require_once(HUONIAOINC."/config/house.inc.php");
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

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('kfsListArr', json_encode(getKfsList("house_kfs",$adminCityIds)));
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
    $huoniaoTag->assign('cityid', $cityid);

	if($action != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('typeid', $typeid == "" ? 0 : $typeid);
		$huoniaoTag->assign('typename', $typename);
		$huoniaoTag->assign('userid', $userid == "" ? 0 : $userid);
		$huoniaoTag->assign('username', $username);
		$huoniaoTag->assign('stores', $stores);
		$huoniaoTag->assign('addr', $addr == "" ? 0 : $addr);
		$huoniaoTag->assign('card', $card);
		$huoniaoTag->assign('weight', $weight == "" ? 50 : $weight);

		$huoniaoTag->assign('stateList', array('0', '1', '2'));
		$huoniaoTag->assign('stateName',array('待审核', '已审核', '拒绝审核'));
		$huoniaoTag->assign('state', $state == "" ? 1 : $state);
		$huoniaoTag->assign('name', $name);
		$huoniaoTag->assign('post', $post);
		$huoniaoTag->assign('tel', $tel);
	}

	$tjList = array();
	if($action == "edit"){
		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE FIND_IN_SET($id, `userid`)");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			foreach ($res as $key => $value) {
				$tjList[$key]['id'] = $value['id'];
				$tjList[$key]['title'] = $value['title'];

				$sql = $dsql->SetQuery("SELECT `see`, `suc` FROM `#@__house_gw_tj` WHERE `loupan` = ".$value['id']." AND `gw` = $id");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$see = $ret[0]['see'];
					$suc = $ret[0]['suc'];
				}else{
					$see = $suc = 0;
				}
				$tjList[$key]['see'] = $see;
				$tjList[$key]['suc'] = $suc;
			}
		}
	}
	$huoniaoTag->assign('tjList', $tjList);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
function getKfsList($tab,$adminCityIds){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__".$tab."` ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
