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
checkPurview("loupanGw");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "house_gw";

if($action != ""){
	$templates = "gwAdd.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/gwAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}else{
	$templates = "gwList.html";
	
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

$pagetitle = "顾问管理";
$dopost = $dopost ? $dopost : "add";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate = GetMkTime(time());       //发布时间

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

	if(empty($name)){
		echo '{"state": 200, "info": "请填写顾问姓名"}';
		exit();
	}

	if(empty($phone)){
		echo '{"state": 200, "info": "请填写顾问手机号码"}';
		exit();
	}

    $dknum = (int)$dknum;
    $cjnum = (int)$cjnum;

}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `loupanid` = $loupanid";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["name"] = $value["name"];

            $areaCode = $value['areaCode'] ? (int)$value['areaCode'] : (int)$value['mareaCode'];
            $areaCode = $areaCode == 0 || $areaCode == 86 ? '' : $areaCode;

			$list[$key]["phone"] = $areaCode . $value["phone"];

			$list[$key]["photo"] = getFilePath($value["photo"]);
			$list[$key]["post"] = $value["post"];
			$list[$key]["dknum"] = $value["dknum"];
			$list[$key]["cjnum"] = $value["cjnum"];

			//会员
			$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `photo`, `phone` FROM `#@__member` WHERE `id` = ". $value["userid"]);
			$username = $dsql->getArr($userSql);
			$list[$key]["userid"] = $value["userid"];
			$list[$key]["mphoto"] = getFilePath($username["photo"]);
			$list[$key]["nickname"] = $username['nickname'] ? $username['nickname'] : $username['username'];
			$list[$key]["mphone"] = $username["phone"];

			$list[$key]["pubdate"] = $value['pubdate'] ? date('Y-m-d H:i:s', $value['pubdate']) : '';
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "gwList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "add"){

	$pagetitle = "新增楼盘顾问";

	//表单提交
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`loupanid`, `userid`, `name`, `photo`, `wxQr`, `areaCode`, `phone`, `wx`, `post`, `dknum`, `cjnum`, `pubdate`, `ext_title_1`, `ext_val_1`, `ext_title_2`, `ext_val_2`) VALUES ('$loupanid', '$userid', '$name', '$photo', '$wxQr', '$areaCode', '$phone', '$wx', '$post', '$dknum', '$cjnum', '$pubdate', '$ext_title_1', '$ext_val_1', '$ext_title_2', '$ext_val_2')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增楼盘顾问", $user);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){

	$pagetitle = "修改楼盘顾问";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `userid` = $userid, `name` = '$name', `photo` = '$photo', `wxQr` = '$wxQr', `areaCode` = '$areaCode', `phone` = '$phone', `wx` = '$wx', `post` = '$post', `dknum` = '$dknum', `cjnum` = '$cjnum', `ext_title_1` = '$ext_title_1', `ext_val_1` = '$ext_val_1', `ext_title_2` = '$ext_title_2', `ext_val_2` = '$ext_val_2' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改楼盘顾问", $name);
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

				$userid = $results[0]['userid'];

				//用户名
				$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `areaCode`, `phone`, `photo` FROM `#@__member` WHERE `id` = ". $userid);
				$ret = $dsql->getArr($userSql);
				$username = $ret['nickname'] ? $ret['nickname'] : $ret['username'];
				$userareaCode = $ret['areaCode'];
				$userphone = $ret['phone'];
				$userphoto = $ret['photo'];

				$name = $results[0]['name'] ? $results[0]['name'] : $username;
				$photo = $results[0]['photo'] ? $results[0]['photo'] : $userphoto;
				$areaCode = $results[0]['areaCode'] ? $results[0]['areaCode'] : $userareaCode;
				$phone = $results[0]['phone'] ? $results[0]['phone'] : $userphone;

				$post = $results[0]['post'];
				$wxQr = $results[0]['wxQr'];
				$wx = $results[0]['wx'];
				$dknum = $results[0]['dknum'];
				$cjnum = $results[0]['cjnum'];
				$ext_title_1 = $results[0]['ext_title_1'];
				$ext_val_1 = $results[0]['ext_val_1'];
				$ext_title_2 = $results[0]['ext_title_2'];
				$ext_val_2 = $results[0]['ext_val_2'];

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
			$archives = $dsql->SetQuery("SELECT * FROM  `#@__house_gw` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

            if($results){
                //删除顾问头像
                delPicFile($results[0]['photo'], "delThumb", "house");

                //删除顾问微信
                delPicFile($results[0]['wxQr'], "delAtlas", "house");

                //删除顾问
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_gw` WHERE `id` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    $error[] = $val;
                }
            }
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除楼盘顾问", $id);
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

	if($action != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('userid', $userid == "" ? 0 : $userid);
		$huoniaoTag->assign('username', $username);
		$huoniaoTag->assign('name', $name);
		$huoniaoTag->assign('post', $post);
		$huoniaoTag->assign('areaCode', $areaCode);
		$huoniaoTag->assign('phone', $phone);
		$huoniaoTag->assign('photo', $photo);
		$huoniaoTag->assign('wxQr', $wxQr);
		$huoniaoTag->assign('wx', $wx);
		$huoniaoTag->assign('dknum', $dknum);
		$huoniaoTag->assign('cjnum', $cjnum);
		$huoniaoTag->assign('ext_title_1', $ext_title_1);
		$huoniaoTag->assign('ext_val_1', $ext_val_1);
		$huoniaoTag->assign('ext_title_2', $ext_title_2);
		$huoniaoTag->assign('ext_val_2', $ext_val_2);
	}

	//楼盘信息
    if($loupanid){
        $loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `id` = ". $loupanid);
        $loupanResult = $dsql->getTypeName($loupanSql);
        if($loupanResult){
            $huoniaoTag->assign('loupanid', $loupanResult[0]['id']);
            $huoniaoTag->assign('loupaname', $loupanResult[0]['title']);
        }
    }

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
