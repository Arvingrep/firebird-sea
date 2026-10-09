<?php
/**
 * 添加管理员
 *
 * @version        $Id: adminListAdd.php 2014-1-1 上午0:10:16 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("adminListAdd");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "adminListAdd.html";

$tab = "member";
$dopost = $dopost == "" ? "add" : $dopost;        //操作类型 save添加 edit修改

if($submit == "提交"){
	if($token == "") die('token传递失败！');
}

$mtype = (int)$mtype;
$state = (int)$state;

//新增
if($dopost == "add"){

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(trim($username) == ''){
			echo '{"state": 200, "info": "请输入用户名！"}';
			exit();
		}
		if(trim($password) == ''){
			echo '{"state": 200, "info": "请输入密码！"}';
			exit();
		}
        $validatePassword = validatePassword($password);
        if($validatePassword != 'ok'){
            echo '{"state": 200, "info": "'.$validatePassword.'"}';
            exit();
        }
		if(trim($nickname) == ''){
			echo '{"state": 200, "info": "请输入真实姓名！"}';
			exit();
		}
		if(!$mtype){
			if(trim($mgroupid) == ''){
				echo '{"state": 200, "info": "请选择所属管理组！"}';
				exit();
			}
		}else{
			if(trim($mcityid) == ''){
				echo '{"state": 200, "info": "请选择管辖城市！"}';
				exit();
			}

			$adminCityIdsArr = explode(',', $adminCityIds);
			if(!in_array($mcityid, $adminCityIdsArr)){
				echo '{"state": 200, "info": "选择的城市不在授权范围"}';
				exit();
			}
		}

		if($userType == 3 && !$mtype){
			echo '{"state": 200, "info": "城市管理员不可以添加系统管理员！"}';
			exit();
		}

		$purviews = isset($purviews) ? join(',', $purviews) : '';

		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `username` = '$username'");
		$return = $dsql->dsqlOper($archives, "results");
		if($return){
			echo '{"state": 200, "info": "此用户名已被占用，请重新填写！"}';
			exit();
		}
        if($phone){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE (`mtype` = 0 OR `mtype` = 3) AND `phone` = '$phone'");
            $return = $dsql->dsqlOper($archives, "results");
            if($return){
                echo '{"state": 200, "info": "此手机号码已被占用，请重新填写！"}';
                exit();
            }
        }

		$password = $userLogin->_getSaltedHash($password);
        $expired = $expired ? GetMkTime($expired) : 0;

		//保存标签字段，方便城市招聘做统计
		$discount = trim($discount);

		//保存到主表
		$mgroupid = $mtype ? $mcityid : $mgroupid;
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`mtype`, `username`, `password`, `realname`,`nickname`, `phone`, `mgroupid`, `state`, `regtime`, `regip`, `purviews`, `alicard`, `expired`, `discount`) VALUES ('$mtype', '$username', '$password', '$nickname', '$nickname','$phone',$mgroupid, $state, ".GetMkTime(time()).", '".GetIP()."', '$purviews','$alicard','$expired','$discount')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增管理员", $username);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//重新授权，先清除已经获取到的openid
}elseif($dopost == "reauthorize"){

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `wechat_openid` = '' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			echo '{"state": 100, "info": "ok"}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(trim($username) == ''){
			echo '{"state": 200, "info": "请输入用户名！"}';
			exit();
		}
		if(trim($nickname) == ''){
			echo '{"state": 200, "info": "请输入真实姓名！"}';
			exit();
		}
		if(!$mtype){
			if(trim($mgroupid) == ''){
				echo '{"state": 200, "info": "请选择所属管理组！"}';
				exit();
			}
		}else{
			if(trim($mcityid) == ''){
				echo '{"state": 200, "info": "请选择管辖城市！"}';
				exit();
			}

			$adminCityIdsArr = explode(',', $adminCityIds);
			if(!in_array($mcityid, $adminCityIdsArr)){
				echo '{"state": 200, "info": "选择的城市不在授权范围"}';
				exit();
			}
		}

		if($userType == 3 && !$mtype){
			echo '{"state": 200, "info": "城市管理员不可以添加系统管理员！"}';
			exit();
		}

		$purviews = isset($purviews) ? join(',', $purviews) : '';

		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `username` = '$username' AND `id` != $id");
		$return = $dsql->dsqlOper($archives, "results");
		if($return){
			echo '{"state": 200, "info": "此用户名已被占用，请重新填写！"}';
			exit();
		}
        if($phone){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE (`mtype` = 0 OR `mtype` = 3) AND `phone` = '$phone' AND `id` != $id");
            $return = $dsql->dsqlOper($archives, "results");
            if($return){
                echo '{"state": 200, "info": "此手机号码已被占用，请重新填写！"}';
                exit();
            }
        }
        if($openid){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE (`mtype` = 0 OR `mtype` = 3) AND `wechat_openid` = '$openid' AND `id` != $id");
            $return = $dsql->dsqlOper($archives, "results");
            if($return){
                echo '{"state": 200, "info": "该微信授权已被其他管理员占用，请重新授权！"}';
                exit();
            }
        }

        $expired = $expired ? GetMkTime($expired) : 0;

		//保存标签字段，方便城市招聘做统计
		$discount = trim($discount);

		//保存到主表
		$mgroupid = $mtype ? $mcityid : $mgroupid;
		if($password == ""){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `mtype` = '$mtype', `username` = '$username', `notice` = '$notice',`nickname` = '$nickname',`phone`='$phone',`realname` = '$nickname', `mgroupid` = $mgroupid, `state` = $state, `purviews` = '$purviews' ,`alicard` = '$alicard', `wechat_openid` = '$openid', `expired` = '$expired', `discount` = '$discount' WHERE `id` = ".$id);
		}else{
            $validatePassword = validatePassword($password);
            if($validatePassword != 'ok'){
                echo '{"state": 200, "info": "'.$validatePassword.'"}';
                exit();
            }
			$password = $userLogin->_getSaltedHash($password);
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `mtype` = '$mtype', `username` = '$username', `notice` = '$notice', `password` = '$password',`nickname` = '$nickname',`phone`='$phone', `mgroupid` = $mgroupid, `state` = $state, `purviews` = '$purviews',`alicard` = '$alicard', `wechat_openid` = '$openid', `expired` = '$expired', `discount` = '$discount' WHERE `id` = ".$id);
		}
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改管理员", $username);
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

				//城市分站管理员权限验证
				if($userType == 3 && $userLogin->getUserID() != $id){
					ShowMsg('权限验证失败！', "javascript:;");
					die;
				}

				$username     = $results[0]['username'];
				$alicard      = $results[0]['alicard'];
				$nickname     = $results[0]['realname'];
				$mtype        = $results[0]['mtype'];
				$mgroupid     = $results[0]['mgroupid'];
				$state        = $results[0]['state'];
				$purviews     = $results[0]['purviews'];
				$openid       = $results[0]['wechat_openid'];
				$notice       = $results[0]['notice'];
				$phone        = $results[0]['phone'];
				$dotype       = 'edit';
                $expired      = $results[0]['expired'];
				$discount      = $results[0]['discount'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

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
		'ui/chosen.jquery.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/member/adminListAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//会员类型
	if($userType != 3){
		$huoniaoTag->assign('mtypeArr', array('0', '3'));
		$huoniaoTag->assign('mtypeNames',array('系统管理员','城市管理员'));
	}else{
		$huoniaoTag->assign('mtypeArr', array('3'));
		$huoniaoTag->assign('mtypeNames',array('城市管理员'));
	}
	$huoniaoTag->assign('mtype', $mtype ? $mtype : ($userType == 3 ? 3 : 0));

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('alicard', $alicard);
	$huoniaoTag->assign('openid', $openid);
	$huoniaoTag->assign('nickname', $nickname);
	$huoniaoTag->assign('phone', $phone);

	$archives = $dsql->SetQuery("SELECT `id`, `groupname` FROM `#@__admingroup`");
	$results = $dsql->dsqlOper($archives, "results");

	$huoniaoTag->assign('groupList', $results);
	$huoniaoTag->assign('mgroupid', empty($mgroupid) ? ($userType == 3 ? $adminCityIds : "0") : $mgroupid);

	//状态-单选
	$huoniaoTag->assign('stateList', array('0', '1'));
	$huoniaoTag->assign('stateName',array('正常','锁定'));
	$huoniaoTag->assign('noticeList', array('1', '0'));
	$huoniaoTag->assign('noticename',array('是','否'));
	$huoniaoTag->assign('state', $state == "" ? 0 : $state);
	$huoniaoTag->assign('notice', $notice == "" ? 0 : $notice);
	$huoniaoTag->assign('expired', $expired ? date('Y-m-d H:i:s', $expired) : '');

	//权限标签
	$huoniaoTag->assign('discount', $discount);

	//分站城市
	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	$huoniaoTag->assign('purviews', $purviews ? explode(',', $purviews) : array());

	//城市管理员权限集合
	$huoniaoTag->assign('cityPurviews', $userLogin->getAdminPermissions());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
