<?php
/**
 * 用户管理
 *
 * @version        $Id: memberList.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member";
$configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
$Payconfig= $dsql->dsqlOper($configPay, "results");
$payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
$huoniaoTag->assign('payname', $payname);

//分销等级
$cfg_fenxiaoLevel = unserialize($cfg_fenxiaoLevel);

//城市管理员，只能管理管辖城市的会员
$adminAreaIDs = $adminCityIds;
// if($userType == 3){
//     $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
//     $ret = $dsql->dsqlOper($sql, "results");
//     if($ret){
//         $adminCityID = $ret[0]['mgroupid'];
//
//         global $data;
//         $data = '';
//         $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
//         $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
//         $adminAreaIDs = join(',', $adminAreaIDArr);
//     }
// }

//css
$cssFile = array(
  'ui/jquery.chosen.css',
  'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if($dopost == "Add"){

	checkPurview("memberAdd");

	$templates = "memberAdd.html";

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'ui/chosen.jquery.min.js',
		'admin/member/memberAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}elseif($dopost == "Edit"){

	checkPurview("memberEdit");

	$templates = "memberEdit.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'ui/chosen.jquery.min.js',
		'admin/member/memberEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}else{

	$templates = "memberList.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/chosen.jquery.min.js',
		'admin/member/memberList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}


if($submit == "提交"){
	if($token == "") die('token传递失败！');

	//二次验证新增会员
	if($dopost == "Add"){

		//验证用户名
		if(empty($username)){
			die('{"state": 200, "info": "请输入用户名"}');
		}
		preg_match("/^[A-Za-z0-9_\x{4e00}-\x{9fa5}]{1,15}$/iu", $username, $matchUsername);
		if(!$matchUsername){
			die('{"state": 200, "info": "用户名格式有误"}');
		}
		if(!checkMember($username)){
			die('{"state": 200, "info": "用户名已存在"}');
		}

		//验证密码
		if(empty($password)){
			die('{"state": 200, "info": "请输入密码"}');
		}
		
        $validatePassword = validatePassword($password);
        if($validatePassword != 'ok'){
            echo '{"state": 200, "info": "'.$validatePassword.'"}';
            exit();
        }

		//真实姓名
		if(empty($nickname)){
			die('{"state": 200, "info": "请输入真实姓名"}');
		}

		if($emailCheck && empty($email)){
			die('{"state": 200, "info": "请填写邮箱"}');
		}

		//邮箱
		if(!empty($email)){
			preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $email, $matchEmail);
			if(!$matchEmail){
				die('{"state": 200, "info": "邮箱格式有误"}');
			}

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `email` = '$email'");
			$return = $dsql->dsqlOper($archives, "results");
			if($return){
				die('{"state": 200, "info": "此邮箱已被注册"}');
			}
		}

		if($phoneCheck && empty($phone)){
			die('{"state": 200, "info": "请填写手机"}');
		}

		//手机
		if(!empty($phone)){

			// preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $phone, $matchPhone);
			// if(!$matchPhone){
			// 	die('{"state": 200, "info": "手机格式有误"}');
			// }

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = '$phone'");
			$return = $dsql->dsqlOper($archives, "results");
			if($return){
				die('{"state": 200, "info": "此手机号已被注册"}');
			}

		}

		if($mtype == 2){
			if(empty($company)){
				die('{"state": 200, "info": "请输入公司名称"}');
			}
		}

	//二次验证修改会员
	}elseif($dopost == "Edit"){
		//验证密码
		if(!empty($password)){
            $validatePassword = validatePassword($password);
            if($validatePassword != 'ok'){
                echo '{"state": 200, "info": "'.$validatePassword.'"}';
                exit();
            }
		}

		//打折卡号
		if(empty($discount)){
			//die('{"state": 200, "info": "请输入会员打折卡号"}');
		}

		//真实姓名
		if(empty($nickname)){
			die('{"state": 200, "info": "请输入真实姓名"}');
		}

		if($emailCheck && empty($email)){
			die('{"state": 200, "info": "请填写邮箱"}');
		}

		//邮箱
		if(!empty($email)){
			preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $email, $matchEmail);
			if(!$matchEmail){
				die('{"state": 200, "info": "邮箱格式有误"}');
			}

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `email` = '$email' AND `id` != ".$id);
			$return = $dsql->dsqlOper($archives, "results");
			if($return){
				die('{"state": 200, "info": "此邮箱已被注册"}');
			}
		}

		if($phoneCheck && empty($phone)){
			die('{"state": 200, "info": "请填写手机"}');
		}

		//手机
		if(!empty($phone)){

			// preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $phone, $matchPhone);
			// if(!$matchPhone){
			// 	die('{"state": 200, "info": "手机格式有误"}');
			// }

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE (`mtype` = 1 OR `mtype` = 2) AND `phone` = '$phone' AND `id` != ".$id);
			$return = $dsql->dsqlOper($archives, "results");
			if($return){
				die('{"state": 200, "info": "此手机号已被注册"}');
			}

		}

		//QQ
		if(empty($qq)){
			//die('{"state": 200, "info": "请输入QQ号码"}');
		}
		preg_match('/[1-9]*[1-9][0-9]*/', $qq, $matchQQ);
		if(!$matchQQ){
			//die('{"state": 200, "info": "QQ号码格式有误"}');
		}

        $freeze = (float)$freeze;

		//头像
		if(empty($photo)){
			//die('{"state": 200, "info": "请上传头像"}');
		}

		if($mtype == 2){
			if(empty($company)){
				die('{"state": 200, "info": "请输入公司名称"}');
			}
			if(empty($addr)){
				//die('{"state": 200, "info": "请选择公司所在区域"}');
			}
			if(empty($address)){
				//die('{"state": 200, "info": "请输入详细地址"}');
			}
		}

	}

    $addr = (int)$addr;

}

//取消注销
if($action =="qxzhuxiao"){
    if(!testPurview("memberDel")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    if($uid!=''){
        $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `is_cancellation` =  0  WHERE `id`= ".$uid);
        $results = $dsql->dsqlOper($usersql,"update");

        if($results == "ok"){
            adminLog("取消会员注销", "ID:" . $uid);

            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }else{
            echo '{"state": 200, "info": '.json_encode("修改失败！").'}';
        }
    }
    die;
}

//审核昵称
if($action =="nickname_audit"){
    if(!testPurview("memberEdit")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    if($uid!=''){

        $nickname = $nickname_audit = '';
        $sql = $dsql->SetQuery("SELECT `nickname`, `nickname_audit` FROM `#@__member` WHERE `id` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $nickname = $ret[0]['nickname'];
            $nickname_audit = $ret[0]['nickname_audit'];
        }

        $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `nickname` = '$nickname_audit', `company` = '$nickname_audit', `nickname_audit` = '', `nickname_state` = ''  WHERE `id`= ".$uid);
        $results = $dsql->dsqlOper($usersql,"update");

        if($results == "ok"){
            adminLog("审核会员昵称", "ID:" . $uid . "，旧昵称：" . $nickname . "，新昵称：" . $nickname_audit);
            echo '{"state": 100, "info": '.json_encode("审核成功！").'}';
        }else{
            echo '{"state": 200, "info": '.json_encode("审核失败！").'}';
        }
    }
    die;
}

//审核头像
if($action =="photo_audit"){
    if(!testPurview("memberEdit")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };

    if($uid!=''){

        $photo = $photo_audit = '';
        $sql = $dsql->SetQuery("SELECT `photo`, `photo_audit` FROM `#@__member` WHERE `id` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $photo = $ret[0]['photo'];
            $photo_audit = $ret[0]['photo_audit'];
        }

        $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `photo` = '$photo_audit', `photo_audit` = '', `photo_state` = ''  WHERE `id`= ".$uid);
        $results = $dsql->dsqlOper($usersql,"update");

        if($results == "ok"){
            adminLog("审核会员头像", "ID:" . $uid . "，旧头像：" . getFilePath($photo) . "，新头像：" . getFilePath($photo_audit));
            echo '{"state": 100, "info": '.json_encode("审核成功！").'}';
        }else{
            echo '{"state": 200, "info": '.json_encode("审核失败！").'}';
        }
    }
    die;
}


//删除会员
if($dopost == "del"){
	if(!testPurview("memberDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$title = array();
	if($id != ""){
		foreach($each as $val){

			//城市管理员
			if($userType == 3){
				if($adminAreaIDs){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `cityid` in ($adminAreaIDs) AND `id` = ".$val);
					$res = $dsql->dsqlOper($archives, "results");
					array_push($title, $res[0]['username']);

					$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `cityid` in ($adminAreaIDs) AND `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "update");
					if($results != "ok"){
						$error[] = $val;
					}
				}
			}else{
				$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$val);
				$res = $dsql->dsqlOper($archives, "results");
				array_push($title, $res[0]['username']);

				$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					$error[] = $val;
				}
			}

			if($res){
				//删除头像、营业执照
				delPicFile($res[0]['photo'], "delPhoto", "siteConfig");
				delPicFile($res[0]['license'], "delCard", "siteConfig");

				$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."_money` WHERE `userid` = ".$val);
				$dsql->dsqlOper($archives, "update");

				$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."_point` WHERE `userid` = ".$val);
				$dsql->dsqlOper($archives, "update");

				//同步删除论坛会员
				// $userLogin->bbsSync($res[0]['username'], "delete");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除会员", "ID:" . $id . "，昵称:" . join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//解除推荐关联
}else if($dopost == "unlink"){
	if(!testPurview("memberEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$userid = (int)$userid;
	$sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `from_uid` = 0 WHERE `id` = ".$userid);
	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == 'ok'){
		die('{"state": 100, "info": '.json_encode("操作成功！").'}');
	}else{
		die($ret);
	}
	die;

//绑定推荐关联
}else if($dopost == "bindlink"){
    if(!testPurview("memberEdit")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $userid = (int)$userid;
    $recid = (int)$recid;

    if($userid == $recid){
        die('{"state": 200, "info": '.json_encode("对不起，不能绑定自己！").'}');
    }

    //查询推荐人的推荐人是否为当前要操作的会员
    $sql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__".$db."` WHERE `id` = ".$recid);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $from_uid = (int)$ret[0]['from_uid'];
        if($from_uid != $userid){
            $sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `from_uid` = '$recid' WHERE `id` = ".$userid);
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == 'ok'){
                die('{"state": 100, "info": '.json_encode("操作成功！").'}');
            }else{
                die($ret);
            }
        }else{
            die('{"state": 200, "info": '.json_encode("填写的推荐人ID的推荐人是当前会员，两个会员不可以循环绑定！").'}');
        }

    }else{
        die('{"state": 200, "info": '.json_encode("推荐人不存在").'}');
    }

//更新状态
}else if($action == "updateState"){
	if(!testPurview("memberEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){

			//验证权限
			if($userType == 3){
				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = $arcrank WHERE `cityid` in ($adminAreaIDs) AND `id` = ".$val);
			}else{
				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = $arcrank WHERE `id` = ".$val);
			}
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新会员状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

//获取会员列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
    $state = $_REQUEST['state'];

	//管理员
	$where  = " AND m.`mgroupid` = 0";
    $order  = '';
    $whereb = $leftjoin = '';
	if($state =='qiyeweikt'){
        $whereb =  " AND m.`mtype` = 2 AND b.`id`  is null";
        $leftjoin = ' LEFT JOIN  `#@__business_list` b ON b.`uid` = m.`id`';
    }


	//城市管理员
	if($userType == 3){
		if($adminAreaIDs){
			$where .= " AND m.`cityid` in ($adminAreaIDs)";
		}else{
			$where .= " AND 1 = 2";
		}
	}

	//城市
	if($cityid){
		// global $data;
		// $data = '';
		// $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
		// $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
		// $cityAreaIDs = join(',', $cityAreaIDArr);
		// if($cityAreaIDs){
		// 	$where .= " AND `cityid` in ($cityAreaIDs)";
		// }else{
		// 	$where .= " 3 = 4";
		// }
		$where .= getWrongCityFilter('m.`cityid`', $cityid);
	}
	//排序  余额排序
	if ($orderMoney){
	    if($orderMoney == 1){
            $order  .= " ORDER BY  m.`money` DESC";    //倒序
        }else{
            $order  .= "  ORDER BY m.`money` ";    //正序
        }
    }

    $rightjoin = ' (SELECT count(`id`) FROM `#@__member` WHERE `from_uid` = m.`id`) rec';


    //积分排序
    if ($orderPoint){
        if($orderPoint == 1){
            $order  .= " ORDER BY m.`point` DESC";    //倒序
        }else{
            $order  .= " ORDER BY  m.`point` ";    //正序
        }
    }

    //消费金排序
    if ($orderBonus){
        if($orderBonus == 1){
            $order  .= " ORDER BY m.`bonus` DESC";    //倒序
        }else{
            $order  .= " ORDER BY  m.`bonus` ";    //正序
        }
    }

    //推荐人排序
    if ($tjOrder){
        if ($tjOrder == 1){
            $order  .= " ORDER BY `rec` DESC";    //倒序
        }else{
            $order  .= " ORDER BY `rec` ";    //倒序
        }
    }

	//金额区间搜索
    if($startMoney != ""){
        $where .= " AND m.`money` >= ". (float)$startMoney;
    }

    if($endMoney != ""){
        $where .= " AND m.`money` <= ". (float)$endMoney;
    }

    //积分区间搜索
    if($startPoint != ""){
        $where .= " AND m.`point` >= ". (float)$startPoint;
    }

    if($endPoint != ""){
        $where .= " AND m.`point` <= ". (float)$endPoint;
    }

    //消费金区间搜索
    if($startBonus != ""){
        $where .= " AND m.`bonus` >= ". (float)$startBonus;
    }

    if($endBonus != ""){
        $where .= " AND m.`bonus` <= ". (float)$endBonus;
    }



    if($sKeyword != ""){
        $sKeyword = trim($sKeyword);
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND m.`id` = $id";
			}
		}
		if(!$isId){
			$where .= " AND (m.`username` like '%$sKeyword%' OR m.`discount` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`idcard` like '%$sKeyword%' OR m.`email` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`regip` like '%$sKeyword%' OR m.`company` like '%$sKeyword%')";
		}

	}

	if($mtype != ""){
		$where .= " AND m.`mtype` = ".$mtype;
	}

	if((!empty($level) || $level == 0) && $level != ""){
		$where .= " AND m.`level` = ".$level;
	}

	if($regfrom != ""){
		$where .= " AND m.`regfrom` = '$regfrom'";
	}

	if($start != ""){
		$where .= " AND m.`regtime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND m.`regtime` <= ". GetMkTime($end . " 23:59:59");
	}

	if($pend !== ""){
		if($pend == 1){
			$pending = " AND m.`certifyState` = 3";  //实名认证
		}elseif($pend == 2){
			$pending = " AND m.`licenseState` = 3";  //公司认证
        }elseif($pend == 3) {
            $pending = " AND m.`is_cancellation` = 1";  //申请注销账号
        }elseif($pend == 4) {
            $pending = " AND m.`nickname_audit` != ''";  //昵称审核
        }elseif($pend == 5) {
            $pending = " AND m.`photo_audit` != ''";  //头像审核
        }else{
			$pending = " AND (m.`certifyState` = 3 OR m.`licenseState` = 3 OR m.`is_cancellation` = 1 OR m.`nickname_audit` != '' OR m.`photo_audit` != '')";
		}
	}

	$time = time();
	$archives = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__".$db."` m WHERE 1 = 1");

	//总条数
    if($state =='qiyeweikt') {
        $archives    = $dsql->SetQuery("SELECT count(m.`id`) totalCount FROM  `#@__".$db."` m LEFT JOIN  `#@__business_list` b ON b.`uid` = m.`id` WHERE 1=1 AND m.`mtype` = 2 AND b.`id` is null");
        $totalCount    = $dsql->dsqlOper($archives.$pending.$where, "results");
	    $totalCount = $totalCount[0]['totalCount'];
        $totalPage = ceil($totalCount/$pagestep);
    }else{
        $exeFlag = false;
        if($state != "" && $state != 'online' && $state != 'qiyeweikt' && $state!=3 && $state!=4 && $state!=5){

            $where .= " AND m.`state` = $state";

            if($state == 0){
                $totalGray = $dsql->dsqlOper($archives." AND m.`state` = 0".$where.$pending, "results");
                $totalCount = $totalGray = $totalGray[0]['totalCount'];
                $totalPage = ceil($totalGray/$pagestep);
                $exeFlag = true;
            }elseif($state == 1){
                $normal = $dsql->dsqlOper($archives." AND m.`state` = 1".$where.$pending, "results");
                $totalCount = $normal = $normal[0]['totalCount'];
                $totalPage = ceil($normal/$pagestep);
                $exeFlag = true;
            }elseif($state == 2){
                $lock = $dsql->dsqlOper($archives." AND m.`state` = 2".$where.$pending, "results");
                $totalCount = $lock = $lock[0]['totalCount'];
                $totalPage = ceil($lock/$pagestep);
                $exeFlag = true;
            }
        }
        if(!empty($pending)){
            $where .= $pending;
            if($pend == 1){
                $pendPerson = $dsql->dsqlOper($archives." AND m.`certifyState` = 3".$where, "results");
                $totalCount = $pendPerson = $pendPerson[0]['totalCount'];
                $totalPage = ceil($pendPerson/$pagestep);
                $exeFlag = true;
            }elseif($pend == 2){
                $pendCompany = $dsql->dsqlOper($archives." AND m.`licenseState` = 3".$where, "results");
                $totalCount = $pendCompany = $pendCompany[0]['totalCount'];
                $totalPage = ceil($pendCompany/$pagestep);
                $exeFlag = true;
            }elseif($pend == 3){
                $cancellation = $dsql->dsqlOper($archives." AND m.`is_cancellation` = 1".$where, "results");
                $totalCount = $cancellation = $cancellation[0]['totalCount'];
                $totalPage = ceil($cancellation/$pagestep);
                $exeFlag = true;
            }elseif($pend == 4){
                $nicknameAudit = $dsql->dsqlOper($archives." AND m.`nickname_audit` != ''".$where, "results");
                $totalCount = $nicknameAudit = $nicknameAudit[0]['totalCount'];
                $totalPage = ceil($nicknameAudit/$pagestep);
                $exeFlag = true;
            }elseif($pend == 5){
                $photoAudit = $dsql->dsqlOper($archives.$where." AND m.`photo_audit` != ''", "results");
                $totalCount = $photoAudit = $photoAudit[0]['totalCount'];
                $totalPage = ceil($photoAudit/$pagestep);
                $exeFlag = true;
            }else{
                $totalPend = $dsql->dsqlOper($archives." AND (m.`certifyState` = 3 OR m.`licenseState` = 3 OR m.`is_cancellation` = 1 OR m.`nickname_audit` != '' OR m.`photo_audit` != '')".$where, "results");
                $totalCount = $totalPend = $totalPend[0]['totalCount'];
                $totalPage = ceil($totalPend/$pagestep);
                $exeFlag = true;
            }
        }

        //在线
        if($state == 'online'){
            $onlinetime = $time - 300;
            $online = $dsql->dsqlOper($archives." AND m.`state` = 1 AND `online` > $onlinetime".$where.$pending, "results");
            $totalCount = $online = $online[0]['totalCount'];
            $where .= " AND $time - m.`online` <= 300";
            $totalPage = ceil($online/$pagestep);
            $exeFlag = true;
        }

        /*微信公众号*/
        if($state == 3){
            $wechat_subscribe = $dsql->dsqlOper($archives." AND m.`wechat_subscribe` = 1".$where, "results");
            $totalCount = $wechat_subscribe = $wechat_subscribe[0]['totalCount'];
            $where .= " AND m.`wechat_subscribe` = 1";
            $totalPage = ceil($wechat_subscribe/$pagestep);
            $exeFlag = true;
        }
        if($state == 4){
            $nowechat_subscribe = $dsql->dsqlOper($archives." AND m.`wechat_subscribe` = 0".$where, "results");
            $totalCount = $nowechat_subscribe = $nowechat_subscribe[0]['totalCount'];
            $where .= " AND m.`wechat_subscribe` = 0";
            $totalPage = ceil($nowechat_subscribe/$pagestep);
            $exeFlag = true;
        }
        if($state == 5){
            $totalRobot = $dsql->dsqlOper($archives." AND m.`robot` = 1".$where, "results");
            $totalCount = $totalRobot = $totalRobot[0]['totalCount'];
            $where .= " AND m.`robot` = 1";
            $totalPage = ceil($totalRobot/$pagestep);
            $exeFlag = true;
        }

        if(!$exeFlag){
            $totalCount = $dsql->dsqlOper($archives.$where, "results");
            $totalCount = $totalCount[0]['totalCount'];
            $totalPage = ceil($totalCount/$pagestep);
        }
    }


    if (empty($orderMoney) &&  empty($orderPoint) &&  empty($orderBonus) && empty($tjOrder) ){
        $order .= " order by `id` desc";
    }

    if($do=="export"){ //循环导出【新】
        set_time_limit(0);      // 设置超时
        ini_set('memory_limit', '3072M');
        //开始导出
        $fileName = "会员数据.csv";
        header('Content-Encoding: UTF-8');
        header("Content-type:application/vnd.ms-excel;charset=UTF-8");
        header('Content-Disposition: attachment;filename="' . $fileName . '"');
        //打开php标准输出流
        $fp = fopen('php://output', 'a');
        //添加BOM头，以UTF8编码导出CSV文件，如果文件头未添加BOM头，打开会出现乱码。
        fwrite($fp, chr(0xEF).chr(0xBB).chr(0xBF));
        //添加导出标题
        fputcsv($fp, ['UID', '用户名','用户类型','用户等级','性别','用户昵称','真实姓名','身份证号','实名认证','邮箱','邮箱认证','手机','手机认证','qq','出生日期','公司名称','所在分站','所在区域','联系地址','余额',$cfg_pointName,'冻结金额','保障金','推荐人ID','推荐人','注册时间','注册来源','注册IP','注册IP地址','登录次数','最后登录时间','最后登录IP','最后登录IP地址']);
        $nums = 20000; //每次导出数量【如果这个值太小反而容易网络失败，一般来说2、3万没有问题】
        $step = ceil($totalCount/$nums); //循环次数

        for($i = 0; $i < $step; $i++) {
            $start = $i * $nums;
            $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`level`, m.`expired`, m.`discount`, m.`nickname`, m.`nickname_audit`, m.`realname`,m.`is_cancellation`,m.`certifyState`, m.`email`, m.`emailCheck`, m.`phone`, m.`phoneCheck`,m.`qq`,m.`birthday`, m.`company`, m.`licenseState`, m.`photo`, m.`photo_audit`, m.`sex`, m.`money`, m.`promotion`, m.`point`, m.`bonus`, m.`regtime`, m.`regip`, m.`regfrom`, m.`lastlogintime`, m.`lastloginip`, m.`state`, m.`idcard`, m.`cityid`, m.`addr`, m.`address`, m.`freeze`, m.`online`,".$rightjoin." ,m.`from_uid`,m.`wechat_subscribe`,m.`robot` FROM `#@__".$db."` m ".$leftjoin." WHERE 1 = 1".$whereb.$where.$order." LIMIT $start, $nums");
            $results = $dsql->dsqlOper($archives, "results");
            $newList = array();
            foreach ($results as $item) {
                $newList['id'] = $item['id'];
                $newList['username'] = $item['username'];
                $newList['mtype'] = $item['mtype'] == 1 ? "个人" : "企业";

                $level = "";
                $sql   = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $item['level']);
                $ret   = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $level = $ret[0]['name'];
                }
                $newList["level"]   = $level;
                $newList['sex'] = $item["sex"] ? "男" : "女";
                $newList['nickname'] = $item['nickname'];
                $newList['realname'] = $item['realname'];
                $newList['idcard'] = $item['idcard'];
                $newList['certifyState'] = $item['certifyState'] ? "是" : "否";
                $newList['email'] = $item['email'];
                $newList['emailCheck'] = $item['emailCheck'] ? "是" : "否";
                $newList['phone'] = $item['phone'];
                $newList['phoneCheck'] = $item['phoneCheck'] ? "是" : "否";
                $newList['qq'] = $item['qq'];
                $newList['birthday'] = $item['birthday'];
                $newList['company'] = $item['company'];
                $cityname = '未知';
                $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . $item["cityid"]);
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $cityname = $ret[0]['typename'];
                }
                $newList['cityname'] = $cityname;
                $addrname = $item['addr'];
                if ($addrname) {
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
                }
                $newList['addrname'] = $addrname;
                $newList['address'] = $item['address'];
                $newList['money'] = $item['money'];
                $newList['point'] = $item['point'];
                $newList['freeze'] = $item['freeze'];
                $newList['promotion'] = $item['promotion'];
                $newList['from_uid'] = $item['from_uid'];
                $from_name              = '';
                $sql                    = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__" . $db . "` WHERE `id` = " . $item["from_uid"]);
                $memberInfo             = $dsql->dsqlOper($sql, "results");
                if ($memberInfo) {
                    $from_name = $memberInfo[0]['nickname'] ? $memberInfo[0]['nickname'] : $memberInfo[0]['username'];
                }
                $newList["from_name"] = $from_name;
                $newList['regtime'] = $item['regtime'];
                $newList['regfrom'] = getTerminalName($item['regfrom']);
                $newList['regip'] = $item['regip'];
                $newList['regipaddr'] = $item['regipaddr'];
                $newList['logincount'] = $item['logincount'];
                $newList['lastlogintime'] = empty($item["lastlogintime"]) ? "还未登录" : date("Y-m-d H:i:s", $item["lastlogintime"]);
                $newList['lastloginip'] = $item['lastloginip'];
                $newList['lastloginipaddr'] = $item['lastloginipaddr'];

                fputcsv($fp, $newList);
            }
            //每1万条数据就刷新缓冲区
            ob_flush();
            flush();
        }
        die;
    }

	$atpage = $pagestep*($page-1);
//	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`level`, m.`expired`, m.`discount`, m.`nickname`, m.`nickname_audit`, m.`realname`,m.`is_cancellation`,m.`certifyState`, m.`email`, m.`emailCheck`, m.`phone`, m.`phoneCheck`, m.`company`, m.`licenseState`, m.`photo`, m.`photo_audit`, m.`sex`, m.`money`, m.`promotion`, m.`point`, m.`bonus`, m.`regtime`, m.`regip`, m.`lastlogintime`, m.`lastloginip`, m.`state`, m.`idcard`, m.`cityid`, m.`addr`, m.`address`, m.`freeze`, m.`online`,".$rightjoin." ,m.`from_uid`,m.`wechat_subscribe`,m.`robot` FROM `#@__".$db."` m ".$leftjoin." WHERE 1 = 1".$whereb.$where.$order." LIMIT $atpage, $pagestep");

	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	if($results && is_array($results)){
        foreach ($results as $key => $value) {
            $list[$key]["id"]       = $value["id"];
            $list[$key]["mtype"]    = $value["mtype"];
            $list[$key]["username"] = $value["username"];

            $level = "";
            $sql   = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $value['level']);
            $ret   = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $level = $ret[0]['name'];
            }
            $list[$key]["level"]   = $level;
            $list[$key]["expired"] = $value["expired"];

            $list[$key]["discount"]         = $value["discount"];
            $list[$key]["is_cancellation"]  = $value["is_cancellation"];
            $list[$key]["nickname"]         = $value["nickname"];
            $list[$key]["nickname_audit"]   = $value["nickname_audit"];
            $list[$key]["realname"]         = $value["realname"] ? $value["realname"] : "";
            $list[$key]["idcard"]           = $value["idcard"];
            $list[$key]["certifyState"]     = $value["certifyState"];
            $list[$key]["email"]            = $value["email"] ? $value["email"] : "";
            $list[$key]["emailCheck"]       = $value["emailCheck"];
            $list[$key]["phone"]            = $value["phone"] ? $value["phone"] : "";
            $list[$key]["phoneCheck"]       = $value["phoneCheck"];
            $list[$key]["company"]          = $value["company"] ? $value["company"] : "";
            $list[$key]["licenseState"]     = $value["licenseState"];
            $list[$key]["photo"]            = $value["photo"];
            $list[$key]["photo_audit"]      = $value["photo_audit"];
            $list[$key]["sex"]              = $value["sex"] ? "男" : "女";
            $list[$key]["money"]            = $value["money"];
            $list[$key]["promotion"]        = $value["promotion"];
            $list[$key]["point"]            = $value["point"];
            $list[$key]["bonus"]            = $value["bonus"];
            $list[$key]["regtime"]          = date("Y-m-d H:i:s", $value["regtime"]);
            $list[$key]["regip"]            = $value["regip"];
            $list[$key]["lastlogintime"]    = empty($value["lastlogintime"]) ? "还未登录" : date("Y-m-d H:i:s", $value["lastlogintime"]);
            $list[$key]["lastloginip"]      = $value["lastloginip"];
            $list[$key]["state"]            = $value["state"];
            $list[$key]["addr"]             = $value["addr"];
            $list[$key]["cityid"]           = $value["cityid"];
            $list[$key]["wechat_subscribe"] = $value["wechat_subscribe"];
            $list[$key]['robot']            = (int)$value['robot'];
            //推荐人数
            $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`phone`, m.`regtime`, i.`money` FROM `#@__member` m LEFT JOIN `#@__member_invite` i ON i.`uid` = m.`id` WHERE m.`from_uid` =".$value["id"]);
            $res      = $dsql->dsqlOper($archives, "totalCount");
            $list[$key]["from_countuid"] = $res ? $res : 0 ;

            //推荐人
            $from_name              = '';
            $list[$key]["from_uid"] = (int)$value["from_uid"];
            $sql                    = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__" . $db . "` WHERE `id` = " . $value['from_uid']);
            $memberInfo             = $dsql->dsqlOper($sql, "results");
            if ($memberInfo) {
                $from_name = $memberInfo[0]['nickname'] ? $memberInfo[0]['nickname'] : $memberInfo[0]['username'];
            } else {
                $list[$key]["from_uid"] = 0;
            }
            $list[$key]["from_name"] = $from_name;

            //查询是否为分销商
            $sql = $dsql->SetQuery("SELECT `id`, `level` FROM `#@__member_fenxiao_user` WHERE `uid` = " . $value['id']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $list[$key]["fenxiao"] = 1;
                if($cfg_fenxiaoType){
                    $list[$key]['fenxiao_level'] = $cfg_fenxiaoLevel[$ret[0]['level']]['name'];
                }else{
                    $list[$key]['fenxiao_level'] = $cfg_fenxiaoName;
                }
            }

            //分站名
            $cityname = '未知';
            $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . $value["cityid"]);
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cityname = $ret[0]['typename'];
            }
            $list[$key]["cityname"] = $cityname;

            $list[$key]["address"] = $value["address"];
            $list[$key]["online"]  = ($time - $value["online"]) <= 500 ? 1 : 0;

            $addrname = $value['addr'];
            if ($addrname) {
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addrname"] = $addrname;
        }
		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": 0, "totalMoney": 0, "totalPoint": 0, "totalBonus": 0, "normal": 0, "lock": 0, "online": 0, "totalPend": 0, "pendPerson": 0, "pendCompany": 0,"cancellation":0,"qiyeweikt":0,"wechat_subscribe":0,"nowechat_subscribe":0,"totalRobot":0,"nicknameAudit":0,"photoAudit":0}, "memberList": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": 0, "totalMoney": 0, "totalPoint": 0, "totalBonus": 0, "normal": 0, "lock": 0, "online": 0, "totalPend": 0, "pendPerson": 0, "pendCompany": 0,"cancellation":0,"qiyeweikt":0,"wechat_subscribe":0,"nowechat_subscribe":0,"totalRobot":0,"nicknameAudit":0,"photoAudit":0}, "info": '.json_encode("暂无相关信息").'}';
			}
		}
	}else{
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": 0, "totalMoney": 0, "totalPoint": 0, "totalBonus": 0, "normal": 0, "lock": 0, "online": 0, "totalPend": 0, "pendPerson": 0, "pendCompany": 0,"cancellation":0,"qiyeweikt":0,"wechat_subscribe":0,"nowechat_subscribe":0,"totalRobot":0,"nicknameAudit":0,"photoAudit":0}, "info": '.json_encode("暂无相关信息").'}';
		}
	}

	if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'UID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户等级'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '性别'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户昵称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '真实姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '身份证号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '实名认证'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '邮箱'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '邮箱认证'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '手机'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '手机认证'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', 'qq'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '出生日期'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '公司名称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '所在分站'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '所在区域'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '余额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', $cfg_pointName));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '冻结金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '保障金'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '推荐人ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '推荐人'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '注册时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '注册来源'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '注册IP'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '注册IP地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '登录次数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '最后登录时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '最后登录IP'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '最后登录IP地址'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder."会员数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
	      $arr = array();
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['mtype'] == 1 ? "个人" : "企业"));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['level']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['sex']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['realname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['idcard']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['certifyState'] ? "是" : "否"));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['emial']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['emailCheck'] ? "是" : "否"));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['phone']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['phoneCheck'] ? "是" : "否"));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['qq']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['birthday']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['company']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['addrname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['address']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['money']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['point']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['freeze']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['promotion']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['regtime']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['from_uid']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['from_name']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['from']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['regip']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['regipaddr']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['logincount']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['lastlogintime']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['lastloginip']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['lastloginipaddr']));

          //写入文件
          fputcsv($file, $arr);
	    }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 会员数据.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);

    }

	die;


}
//仅获取列表统计，处理几乎和getList一模一样【返回总条数、列表以外的 n 个统计数据】。
elseif($dopost=="listCount"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;
    $state = $_REQUEST['state'];

    //管理员
    $where  = " AND m.`mgroupid` = 0";
    $order  = '';
    $whereb = $leftjoin = '';
    if($state =='qiyeweikt'){
        $whereb =  " AND m.`mtype` = 2 AND b.`id`  is null";
        $leftjoin = ' LEFT JOIN  `#@__business_list` b ON b.`uid` = m.`id`';
    }

    //城市管理员
    if($userType == 3){
        if($adminAreaIDs){
            $where .= " AND m.`cityid` in ($adminAreaIDs)";
        }else{
            $where .= " AND 1 = 2";
        }
    }

    //城市
    if($cityid){
        // global $data;
        // $data = '';
        // $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
        // $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
        // $cityAreaIDs = join(',', $cityAreaIDArr);
        // if($cityAreaIDs){
        // 	$where .= " AND `cityid` in ($cityAreaIDs)";
        // }else{
        // 	$where .= " 3 = 4";
        // }
        $where .= getWrongCityFilter('m.`cityid`', $cityid);
    }
    //排序  余额排序
    if ($orderMoney){
        if($orderMoney == 1){
            $order  .= " ORDER BY  m.`money` DESC";    //倒序
        }else{
            $order  .= "  ORDER BY m.`money` ";    //正序
        }
    }

    $rightjoin = ' (SELECT count(`id`) FROM `#@__member` WHERE `from_uid` = m.`id`) rec';


    //积分排序
    if ($orderPoint){
        if($orderPoint == 1){
            $order  .= " ORDER BY m.`point` DESC";    //倒序
        }else{
            $order  .= " ORDER BY  m.`point` ";    //正序
        }
    }

    //消费金排序
    if ($orderBonus){
        if($orderBonus == 1){
            $order  .= " ORDER BY m.`bonus` DESC";    //倒序
        }else{
            $order  .= " ORDER BY  m.`bonus` ";    //正序
        }
    }

    //推荐人排序
    if ($tjOrder){
        if ($tjOrder == 1){
            $order  .= " ORDER BY `rec` DESC";    //倒序
        }else{
            $order  .= " ORDER BY `rec` ";    //倒序
        }
    }

    //金额区间搜索
    if($startMoney != ""){
        $where .= " AND m.`money` >= ". (float)$startMoney;
    }

    if($endMoney != ""){
        $where .= " AND m.`money` <= ". (float)$endMoney;
    }

    //积分区间搜索
    if($startPoint != ""){
        $where .= " AND m.`point` >= ". (float)$startPoint;
    }

    if($endPoint != ""){
        $where .= " AND m.`point` <= ". (float)$endPoint;
    }

    //消费金区间搜索
    if($startBonus != ""){
        $where .= " AND m.`bonus` >= ". (float)$startBonus;
    }

    if($endBonus != ""){
        $where .= " AND m.`bonus` <= ". (float)$endBonus;
    }



    if($sKeyword != ""){
        $sKeyword = trim($sKeyword);
        $isId = false;
        if(substr($sKeyword, 0, 1) == '#'){
            $id = substr($sKeyword, 1);
            if(is_numeric($id)){
                $isId = true;
                $where .= " AND m.`id` = $id";
            }
        }
        if(!$isId){
            $where .= " AND (m.`username` like '%$sKeyword%' OR m.`discount` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`idcard` like '%$sKeyword%' OR m.`email` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`regip` like '%$sKeyword%' OR m.`company` like '%$sKeyword%')";
        }

    }

    if($mtype != ""){
        $where .= " AND m.`mtype` = ".$mtype;
    }

    if((!empty($level) || $level == 0) && $level != ""){
        $where .= " AND m.`level` = ".$level;
    }

    if($regfrom != ""){
		$where .= " AND m.`regfrom` = '$regfrom'";
    }

    if($start != ""){
        $where .= " AND m.`regtime` >= ". GetMkTime($start);
    }

    if($end != ""){
        $where .= " AND m.`regtime` <= ". GetMkTime($end . " 23:59:59");
    }

    if($pend !== ""){
        if($pend == 1){
            $pending = " AND m.`certifyState` = 3";  //实名认证
        }elseif($pend == 2){
            $pending = " AND m.`licenseState` = 3";  //公司认证
        }elseif($pend == 3) {
            $pending = " AND m.`is_cancellation` = 1";  //申请注销账号
        }elseif($pend == 4) {
            $pending = " AND m.`nickname_audit` != ''";  //昵称审核
        }elseif($pend == 5) {
            $pending = " AND m.`photo_audit` != ''";  //头像审核
        }else{
            $pending = " AND (m.`certifyState` = 3 OR m.`licenseState` = 3 OR m.`is_cancellation` = 1 OR m.`nickname_audit` != '' OR m.`photo_audit` != '')";
        }
    }

    $time = time();
    $archives = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__".$db."` m WHERE 1 = 1");

    //未审核
    $totalGray = $dsql->dsqlOper($archives." AND m.`state` = 0".$where.$pending, "results");
    $totalGray = $totalGray[0]['totalCount'];
    //正常
    $normal = $dsql->dsqlOper($archives." AND m.`state` = 1".$where.$pending, "results");
    $normal = $normal[0]['totalCount'];
    //锁定
    $lock = $dsql->dsqlOper($archives." AND m.`state` = 2".$where.$pending, "results");
    $lock = $lock[0]['totalCount'];
    //在线
    $onlinetime = $time - 300;
    $online = $dsql->dsqlOper($archives." AND m.`state` = 1 AND `online` > $onlinetime".$pending.$where, "results");
    $online = $online[0]['totalCount'];

    $baseState = ""; //原始m状态
    if($state != "" && $state != 'online' && $state != 'qiyeweikt' && $state!=3 && $state!=4 && $state!=5){
        $baseState .= " AND m.`state` = $state";
    }
    //全部待办事项
    $totalPend = $dsql->dsqlOper($archives." AND (m.`certifyState` = 3 OR m.`licenseState` = 3 OR m.`is_cancellation` = 1 OR m.`nickname_audit` != '' OR m.`photo_audit` != '')".$where.$baseState, "results");
    $totalPend = $totalPend[0]['totalCount'];
    //个人实名待认证
    $pendPerson = $dsql->dsqlOper($archives." AND m.`certifyState` = 3".$where.$baseState, "results");
    $pendPerson = $pendPerson[0]['totalCount'];
    //公司认证
    $pendCompany = $dsql->dsqlOper($archives." AND m.`licenseState` = 3".$where.$baseState, "results");
    $pendCompany = $pendCompany[0]['totalCount'];
    //注销
    $cancellation = $dsql->dsqlOper($archives." AND m.`is_cancellation` = 1".$where.$baseState, "results");
    $cancellation = $cancellation[0]['totalCount'];
    //昵称审核
    $nicknameAudit = $dsql->dsqlOper($archives." AND m.`nickname_audit` != ''".$where.$baseState, "results");
    $nicknameAudit = $nicknameAudit[0]['totalCount'];
    //头像审核
    $photoAudit = $dsql->dsqlOper($archives.$where.$baseState." AND m.`photo_audit` != ''", "results");
    $photoAudit = $photoAudit[0]['totalCount'];

    /*已关注*/
    $wechat_subscribe = $dsql->dsqlOper($archives." AND m.`wechat_subscribe` = 1".$where, "results");
    $wechat_subscribe = $wechat_subscribe[0]['totalCount'];
    /*未关注*/
    $nowechat_subscribe = $dsql->dsqlOper($archives." AND m.`wechat_subscribe` = 0".$where, "results");
    $nowechat_subscribe = $nowechat_subscribe[0]['totalCount'];
    /*机器人*/
    $totalRobot = $dsql->dsqlOper($archives." AND m.`robot` = 1".$where, "results");
    $totalRobot = $totalRobot[0]['totalCount'];
    //账户统计
    $archives = $dsql->SetQuery("SELECT SUM(`money`) money,SUM(`point`) point,SUM(`bonus`) bonus FROM `#@__".$db."` m WHERE 1 = 1".$where);
    $totalResults = $dsql->dsqlOper($archives,"results");
    /*总余额*/
    $totalMoney = $totalResults[0]['money'] ? $totalResults[0]['money'] : 0 ;
    /*总积分*/
    $totalPoint = $totalResults[0]['point'] ? $totalResults[0]['point'] : 0;
    /*总消费金*/
    $totalBonus = $totalResults[0]['bonus'] ? $totalResults[0]['bonus'] : 0;
    //企业未开店铺
    $archiveall = $dsql->SetQuery("SELECT count(m.`id`) totalCount FROM  `#@__".$db."` m WHERE m.`mtype` = 2");
    $archiveall    = $dsql->dsqlOper($archiveall.$where, "results");
    $archiveall = (int)$archiveall[0]['totalCount']; //先查出企业总数

    $archives1    = $dsql->SetQuery("SELECT count(m.`id`) totalCount FROM `#@__business_list` b LEFT JOIN `#@__".$db."` m ON b.`uid` = m.`id` WHERE 1=1 AND m.`mtype` = 2");
    $qiyeweikt    = $dsql->dsqlOper($archives1.$where, "results");
    $qiyeweikt = (int)$qiyeweikt[0]['totalCount'];
    $qiyeweikt = $archiveall - $qiyeweikt; //business小表联查大表，得到已开通会员总数。然后相减得到未开通数

    $jsonRes['totalGray'] = $totalGray;
    $jsonRes['normal'] = $normal;
    $jsonRes['lock'] = $lock;
    $jsonRes['online'] = $online;
    $jsonRes['totalPend'] = $totalPend;
    $jsonRes['pendPerson'] = $pendPerson;
    $jsonRes['pendCompany'] = $pendCompany;
    $jsonRes['cancellation'] = $cancellation;
    $jsonRes['nicknameAudit'] = $nicknameAudit;
    $jsonRes['photoAudit'] = $photoAudit;
    $jsonRes['wechat_subscribe'] = $wechat_subscribe;
    $jsonRes['nowechat_subscribe'] = $nowechat_subscribe;
    $jsonRes['totalRobot'] = $totalRobot;
    $jsonRes['totalMoney'] = $totalMoney;
    $jsonRes['totalPoint'] = $totalPoint;
    $jsonRes['totalBonus'] = $totalBonus;
    $jsonRes['qiyeweikt'] = $qiyeweikt;

    echo json_encode($jsonRes);die;
}
//新增
elseif($dopost == "Add"){

	$pagetitle = "新增会员";

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

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改会员";

	//表单提交
	if($submit == "提交"){

		if(!testPurview("memberEdit")){
			die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
		};

		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($archives, "results");

		//城市管理员验证权限
		if($userType == 3){
			if($adminCityIds){
				if(!in_array($res[0]['cityid'], explode(',', $adminCityIds))){
					die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
				}
			}else{
				die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
			}
		}

		$username = $res[0]['username'];
		$emai     = $res[0]['email'];
		$certifyState_ = $res[0]['certifyState'];
		$licenseState_ = $res[0]['licenseState'];
		$expired_ = $res[0]['expired'];
		$_cityid = (int)$res[0]['cityid'];
        $realname = trim($realname);

		$birthday = $birthday ? GetMkTime($birthday) : 0;
		$expired = $expired ? GetMkTime($expired) : 0;
		$passArr = "";

		if(!empty($password)){
			$passwd = $userLogin->_getSaltedHash($password);
			$passArr .= ", `password` = '$passwd'";
		}

		if(!empty($paypwd)){
			$paypwd = $userLogin->_getSaltedHash($paypwd);
			$passArr .= ", `paypwd` = '$paypwd', `paypwdCheck` = 1";
		}

		//如果到期时间有变动，清除已提醒记录
		if($expired != $expired_){
			$expired_notify = ", `expired_notify_day` = 0, `expired_notify_week` = 0, `expired_notify_month` = 0";
		}

		if($addr && !$cityid){
			$cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr));
			$cityInfoArr = explode(',', $cityInfoArr);
			$_cityid      = (int)$cityInfoArr[0];
		}elseif($cityid){
            $_cityid = (int)$cityid;
        }

        $lock_cityid = (int)$lock_cityid;

        
        //如果实名认证审核通过，并且身份证号码不为空，并且生日为空时，从身份证号码中提取生日和性别
        if($certifyState == 1 && $idcard && empty($birthday)){
            $birthAndGender = getBirthAndGenderFromIdCard($idcard);  //根据身份证号码获取出生日期和性别
            if($birthAndGender){
                $birthday = GetMkTime($birthAndGender['birthday']);
                $sex = (int)$birthAndGender['gender'];
            }
        }

		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `mtype` = '$mtype'".$passArr.", `level` = '$level', `expired` = '$expired', `nickname` = '$nickname', `nickname_audit` = '$nickname_audit', `nickname_state` = '$nickname_state', `email` = '$email', `emailCheck` = '$emailCheck', `areaCode` = '$areaCode', `phone` = '$phone', `phoneCheck` = '$phoneCheck', `freeze` = '$freeze', `qq` = '$qq', `photo` = '$photo', `photo_audit` = '$photo_audit', `photo_state` = '$photo_state', `sex` = '$sex', `birthday` = '$birthday', `company` = '$company', `realname` = '$realname', `idcard` = '$idcard', `idcardFront` = '$idcardFront',`description` = '$description',`idcardBack` = '$idcardBack', `certifyState` = '$certifyState', `certifyInfo` = '$certifyInfo', `cityid` = '$_cityid', `addr` = '$addr', `address` = '$address', `license` = '$license', `licenseState` = '$licenseState', `licenseInfo` = '$licenseInfo', `state` = '$state', `stateinfo` = '$stateinfo'".$expired_notify.", `lock_cityid` = '$lock_cityid', `nation` = '$nation', `wechat_conn` = '$wechat_conn', `wechat_openid` = '$wechat_openid', `wechat_mini_openid` = '$wechat_mini_openid', `wechat_app_openid` = '$wechat_app_openid' WHERE `id` = ".$id);
		$update = $dsql->dsqlOper($archives, "update");

		if($update == "ok"){
			//同步论坛
			$data = array("username" => $username);
			if(!empty($password)){
				$data['newpw'] = $password;
			}
			if($email != $emai){
				$data['email'] = $email;
			}
			if(!empty($password) || $email != $emai){
				$userLogin->bbsSync($data, "edit");
			}

			//会员中心认证页面链接
			if($mtype == 2){
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "security",
					"doget"    => "shCertify"
				);
			}else{
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "security",
					"doget"    => "shCertify"
				);
			}

			//会员通知 - 实名认证
			if($certifyState_ != $certifyState){

                //自定义配置
        		$config = array(
        			"email" => $email,
        			"username" => $username,
        			"info" => $certifyState == 1 ? '' : $certifyInfo,
        			"fields" => array(
        				'keyword1' => '认证详情',
        				'keyword2' => '认证时间',
        				'keyword3' => '认证结果'
        			)
        		);

				//实名认证通过
				if($certifyState == 1){
					updateMemberNotice($id, "会员-实名认证审核通过", $param, $config);
				}

				//实名认证未通过
				if($certifyState == 2){
					updateMemberNotice($id, "会员-实名认证审核失败", $param, $config);
				}

			}

			//会员通知 - 营业执照认证
			if($licenseState_ != $licenseState){

                //自定义配置
        		$config = array(
        			"email" => $email,
        			"username" => $username,
        			"info" => $licenseState == 1 ? '' : $licenseInfo,
        			"fields" => array(
        				'keyword1' => '认证详情',
        				'keyword2' => '认证时间',
        				'keyword3' => '认证结果'
        			)
        		);

				//营业执照认证通过
				if($licenseState == 1){
					updateMemberNotice($id, "会员-营业执照审核通过", $param, $config);
				}

				//营业执照认证未通过
				if($licenseState == 2){
					updateMemberNotice($id, "会员-营业执照审核失败", $param, $config);
				}
			}

			adminLog("修改会员", $id." => ".$username);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $update;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				//城市管理员验证权限
				if($userType == 3){
					if($adminCityIds){
						if(!in_array($results[0]['cityid'], explode(',', $adminCityIds))){
							ShowMsg('您无权修改此会员信息！', "javascript:;");
							die;
						}
					}else{
						ShowMsg('您无权修改此会员信息！', "javascript:;");
						die;
					}
				}

				global $cfg_photoSize;
				global $cfg_photoType;
				$huoniaoTag->assign('photoSize', $cfg_photoSize);
				$huoniaoTag->assign('photoType', "*.".str_replace("|", ";*.", $cfg_photoType));

				$huoniaoTag->assign('addrListArr', $dsql->getTypeList(0, "site_area", false));

				//登录设备信息
				$sourceclient = unserialize($results[0]['sourceclient']);
				$huoniaoTag->assign('sourceclient', !empty($sourceclient) ? array_reverse($sourceclient) : array());

				//会员类型
				$huoniaoTag->assign('mtype', array('1', '2'));
				$huoniaoTag->assign('mtypeNames',array('个人','企业'));
				$huoniaoTag->assign('mtypeChecked', $results[0]['mtype']);

				$huoniaoTag->assign('id', $results[0]['id']);
				$huoniaoTag->assign('username', $results[0]['username']);

				/*简介*/
                $huoniaoTag->assign('description', $results[0]['description']);

				$huoniaoTag->assign('from_uid', (int)$results[0]['from_uid']);
				$sql = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__".$db."` WHERE `id` = ".$results[0]['from_uid']);
				$memberInfo = $dsql->dsqlOper($sql, "results");
				if($memberInfo){
					$huoniaoTag->assign('from_name', $memberInfo[0]['nickname'] ? $memberInfo[0]['nickname'] : $memberInfo[0]['username']);
				}else{
					$huoniaoTag->assign('from_name', '<font color="#ff0000">会员已删除</font>');
				}

				$huoniaoTag->assign('money', $results[0]['money']);
				$huoniaoTag->assign('freeze', $results[0]['freeze']);
				$huoniaoTag->assign('point', $results[0]['point']);
				$huoniaoTag->assign('promotion', $results[0]['promotion']);
                $huoniaoTag->assign('bonus', $results[0]['bonus']);

				$huoniaoTag->assign('level', $results[0]['level']);

				$levelName = "普通会员";
				$sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $results[0]['level']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$levelName = $ret[0]['name'];
				}
				$huoniaoTag->assign('levelName', $levelName);

				$huoniaoTag->assign('expired', $results[0]['expired']);
				$huoniaoTag->assign('discount', $results[0]['discount']);
				$huoniaoTag->assign('nickname', $results[0]['nickname']);
				$huoniaoTag->assign('nickname_audit', $results[0]['nickname_audit']);
				$huoniaoTag->assign('nickname_state', $results[0]['nickname_state']);
				$huoniaoTag->assign('email', $results[0]['email']);
				$huoniaoTag->assign('emailCheck', $results[0]['emailCheck']);
				$huoniaoTag->assign('areaCode', $results[0]['areaCode']);
				$huoniaoTag->assign('phone', $results[0]['phone']);
				$huoniaoTag->assign('phoneCheck', $results[0]['phoneCheck']);
				$huoniaoTag->assign('qq', $results[0]['qq']);
				$huoniaoTag->assign('photo', $results[0]['photo']);
				$huoniaoTag->assign('photo_audit', $results[0]['photo_audit']);
				$huoniaoTag->assign('photo_state', $results[0]['photo_state']);

				$huoniaoTag->assign('sex', array('1', '0'));
				$huoniaoTag->assign('sexNames',array('男','女'));
				$huoniaoTag->assign('sexChecked', $results[0]['sex']);

				$huoniaoTag->assign('birthday', !empty($results[0]['birthday']) ? date("Y-m-d", $results[0]['birthday']) : "");
				$huoniaoTag->assign('company', $results[0]['company']);
				$huoniaoTag->assign('addr', $results[0]['addr']);
				$huoniaoTag->assign('cityid', $results[0]['cityid']);
				$huoniaoTag->assign('wechat_subscribe', $results[0]['wechat_subscribe']);
                $huoniaoTag->assign('robot', $results[0]['robot']);

				//分站名
				$cityname = '未知';
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . $results[0]['cityid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$cityname = $ret[0]['typename'];
				}
				$huoniaoTag->assign('cityname', $cityname);

				//区域
				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $results[0]['addr']);
				if($addrArr){
					$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
					$huoniaoTag->assign('addrName', join(" > ", $addrArr));
				}else{
					$huoniaoTag->assign('addrName', "选择区域");
				}

				$huoniaoTag->assign('address', $results[0]['address']);


				$huoniaoTag->assign('realname', $results[0]['realname']);
				$huoniaoTag->assign('idcard', empty($results[0]['idcard']) ? "" : $results[0]['idcard']);
				$huoniaoTag->assign('idcardFront', $results[0]['idcardFront']);
				$huoniaoTag->assign('idcardBack', $results[0]['idcardBack']);
				$huoniaoTag->assign('certifyInfo', $results[0]['certifyInfo']);
				$huoniaoTag->assign('certifyState', array('0', '3', '1', '2'));
				$huoniaoTag->assign('certifyStateNames',array('未认证','等待认证','已认证','认证失败'));
				$huoniaoTag->assign('certifyStateChecked', $results[0]['certifyState']);


				$huoniaoTag->assign('license', $results[0]['license']);
				$huoniaoTag->assign('licenseState', array('0', '3', '1', '2'));
				$huoniaoTag->assign('licenseStateNames',array('未认证','等待认证','已认证','认证失败'));
				$huoniaoTag->assign('licenseStateChecked', $results[0]['licenseState']);

				$huoniaoTag->assign('licenseInfo', $results[0]['licenseInfo']);
				$huoniaoTag->assign('regtime', !empty($results[0]['regtime']) ? date("Y-m-d H:i:s", $results[0]['regtime']) : "");
				$huoniaoTag->assign('regip', $results[0]['regip']);

				$onlineState = "离线";
				$online = $results[0]['online'];
				if($online > 0){
					global $cfg_onlinetime;
					$now = GetMkTime(time());
					if($now - $online < $cfg_onlinetime * 3600){
						$onlineState = "在线";
					}
				}
				$huoniaoTag->assign('online', $onlineState);

				$huoniaoTag->assign('state', array('0', '1', '2'));
				$huoniaoTag->assign('stateNames',array('未审核','正常','审核拒绝'));
				$huoniaoTag->assign('stateChecked', $results[0]['state']);

				$huoniaoTag->assign('stateinfo', $results[0]['stateinfo']);
				$huoniaoTag->assign('from', !empty($results[0]['regfrom']) ? getTerminalName($results[0]['regfrom']) : '本站');
				$huoniaoTag->assign('logincount', $results[0]['logincount']);
				$huoniaoTag->assign('lastlogintime', !empty($results[0]['lastlogintime']) ? date("Y-m-d H:i:s", $results[0]['lastlogintime']) : "");
				$huoniaoTag->assign('lastloginip', $results[0]['lastloginip']);
				$huoniaoTag->assign('lock_cityid', $results[0]['lock_cityid']);
				$huoniaoTag->assign('wechat_conn', $results[0]['wechat_conn']);
				$huoniaoTag->assign('wechat_openid', $results[0]['wechat_openid']);
				$huoniaoTag->assign('wechat_mini_openid', $results[0]['wechat_mini_openid']);
				$huoniaoTag->assign('nation', $results[0]['nation']);

                $huoniaoTag->assign('wechat_app_openid', $results[0]['wechat_app_openid']);



			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}

	}

//获取帐户日志
}elseif($dopost == "amountList"){
    global  $userLogin;
    if($type == "money"){
        if(!testPurview("moneyMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }elseif($type == "point"){
        if(!testPurview("jfMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }elseif ($type == "bonus"){
        if(!testPurview("bonusMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }elseif ($type == "promotion"){
        if(!testPurview("promotionMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
    $whereb = '';
	//积分、余额操作
	if($type != "invite" && $type != "promotion"){
		if($type == "money"){
	        $where = " AND `showtype` = 0";
	    }else{
		    $where = " ";
	    }

        if(empty($userid) || empty($type)){
             echo '{"state": 101, "info": '.json_encode("格式错误！").'}';
              die;
        }

		//城市管理员
		if($userType == 3){
			if($adminAreaIDs){
				$where .= " AND m.`cityid` in ($adminAreaIDs)";
			}else{
				$where .= " AND 1 = 2";
			}
		}


        //筛选 收入 还是支出
        if ($pay){
                //收入
            if ($pay == 1){
                $whereb .= " AND `type` = 1";
            }else{
                $whereb .= " AND `type` = 0";
            }
        }
        if ($search){
                $where .= " AND `info` like  '%$search%'";
        }

		
		//会员
		$where .= " AND a.`userid` = ".$userid;

        //余额收入 / 支出 总额  / 积分      余额支出数量  /   收入数量
        $sum = $dsql->SetQuery("SELECT SUM(a.`amount`) amount, count(a.`id`) id FROM `#@__".$db."_".$type."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE `type` = 1");
        if ($pay){
            $resultscount = $dsql->dsqlOper($sum.$where, "results");
        }else{
            $resultscount = $dsql->dsqlOper($sum.$where.$whereb, "results");
        }
        $totalPrice = $resultscount[0]['amount'] ? $resultscount[0]['amount'] : 0 ;                       //收入总额
        $countPrice = $resultscount[0]['id'] ? $resultscount[0]['id'] : 0 ;                         //收入数量
        $paysql = $dsql->SetQuery("SELECT SUM(a.`amount`) amount, count(a.`id`) id  FROM `#@__".$db."_".$type."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE `type` = 0");
        if ($pay){
            $count = $dsql->dsqlOper($paysql.$where, "results");
        }else{
            $count = $dsql->dsqlOper($paysql.$where.$whereb, "results");

        }
        $totalPayPrice = $count[0]['amount'] ? $count[0]['amount'] : 0  ;                       //支出总额
        $countPayPrice = $count[0]['id'] ? $count[0]['id'] : 0;                                  //支出数量


        $archives = $dsql->SetQuery("SELECT a.`id`, a.`type`, a.`amount`, a.`info`, a.`date`,a.`balance` FROM `#@__".$db."_".$type."` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1");

		//总条数
		$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
		//总分页数
        if($pay == 1){
            $totalPage = ceil($countPrice/$pagestep);
        }elseif($pay == 2){
            $totalPage = ceil($countPayPrice/$pagestep);
        }else{
    		$totalPage = ceil($totalCount/$pagestep);
        }

		$where .= " order by a.`date` desc,a.`id` desc";

        $sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$userid);
        $_userinfo = $dsql->dsqlOper($sql, "results");
        $username  = $_userinfo[0]['nickname'];
		$atpage = $pagestep*($page-1);
		$where .= " LIMIT $atpage, $pagestep";
		$archives = $dsql->SetQuery($archives.$whereb.$where);
		$results = $dsql->dsqlOper($archives, "results");
		if(count($results) > 0){
            $list = array();
            foreach ($results as $key=>$value) {
				$list[$key]["id"]     = $value["id"];
				$list[$key]["type"]   = $value["type"];
				$list[$key]["amount"] = $value["amount"];
                $list[$key]["balance"] = $value["balance"];
                $list[$key]["info"]   = $value["info"];
				$list[$key]["date"]   = date("Y-m-d H:i:s", $value["date"]);
			}


            if(count($list) > 0){
                if($do != "export") {
                    echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . '}, "memberList": ' . json_encode($list) . '}';
                }
			}else{

                if($do != "export") {
                    echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . '}, "info": ' . json_encode("暂无相关信息") . '}';
                }
			}
		}else{
            if($do != "export") {
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPrice": ' . $totalPrice . ',"countPrice": ' . $countPrice . ',"totalPayPrice": ' . $totalPayPrice . ',"countPayPrice": ' . $countPayPrice . '}, "info": ' . json_encode("暂无相关信息") . '}';
            }
		}

        if($do == "export"){
            $tit = array();
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收支'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
            if ($type == 'bonus'){
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', ''.$payname.'余额'));
            }else{
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '账户余额'));
            }
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '原因'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

            $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
            if ($type == 'bonus'){
                $filePath = $folder.$username.'的'.$payname .'记录明细.csv';
            }else{
                $filePath = $folder.$username."的余额记录明细.csv";
            }

            MkdirAll($folder);
            $file = fopen($filePath, "w");

            //表头
            fputcsv($file, $tit);

            foreach($list as $data){
                $arr = array();
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']== 1 ? "收入" : "支出"));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['balance']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));

                //写入文件
                fputcsv($file, $arr);
            }
            if ($type == 'bonus'){
                $filename = $username.'的'.$payname .'记录明细';
            }else{
                $filename = $username.'的余额记录明细';
            }

            header("Content-type:application/octet-stream");
            header("Content-Disposition:attachment;filename = $filename.csv");
            header("Accept-ranges:bytes");
            header("Accept-length:".filesize($filePath));
            readfile($filePath);

        }

	//保证金列表
	}elseif($type == "promotion"){
		if ($search){
			$where .= " AND `ordernum` like  '%$search%'";
		}

		$archives = $dsql->SetQuery("SELECT p.`id`, p.`uid`, m.`nickname`, p.`amount`,p.`ordernum`,p.`date`,p.`title`,p.`note`,p.`type`,p.`state`,p.`reason` FROM `#@__member_promotion` p LEFT JOIN `#@__member` m ON p.`uid` = m.`id` WHERE p.`uid` = $userid");
		//总条数
		$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
		
		//总分页数
		$totalPage = ceil($totalCount/$pagestep);

        global $cfg_promotion_limitVal;
        global $cfg_promotion_limitType;

        $limitType = '';
        if($cfg_promotion_limitType == 1){
            $limitType = 'day';
        }elseif($cfg_promotion_limitType == 2){
            $limitType = 'month';
        }elseif($cfg_promotion_limitType == 3){
            $limitType = 'year';
        }

		$year=strtotime("-".$cfg_promotion_limitVal." ".$limitType);
		$sum = $dsql->SetQuery("SELECT SUM(p.`amount`) amount, count(p.`id`) id FROM `#@__".$db."_".$type."` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 1 and p.`uid` = $userid");

		$sum2 = $dsql->SetQuery("SELECT SUM(p.`amount`) amount, count(p.`id`) id FROM `#@__".$db."_".$type."` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 0 AND p.`state` = 1 and p.`uid` = $userid");
		$sum3 = $dsql->SetQuery("SELECT count(p.`id`) id FROM `#@__".$db."_".$type."` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 0 AND p.`uid` = $userid");

        if($cfg_promotion_limitVal){
            $userablePrice=$dsql->SetQuery("SELECT SUM(p.`amount`) amount, count(p.`id`) id FROM `#@__".$db."_".$type."` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 1 and p.`state` = 1 and p.`uid` = $userid and p.date<$year");
        }else{
            $userablePrice=$dsql->SetQuery("SELECT SUM(p.`amount`) amount, count(p.`id`) id FROM `#@__".$db."_".$type."` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 1 and p.`state` = 1 and p.`uid` = $userid");
        }
		
		$res = $dsql->dsqlOper($sum, "results");
		$res2 = $dsql->dsqlOper($sum2, "results");
		$res3 = $dsql->dsqlOper($sum3, "results");
		$userablePrice = $dsql->dsqlOper($userablePrice, "results");
		$totalPayPrice = $res[0]['amount'] ? $res[0]['amount'] : 0  ;                       //总付款
        $totalOutPayPrice = $res2[0]['amount'] ? $res2[0]['amount'] : 0  ;                               //总退款
		$totalOutCount=$res3[0]['id'] ? $res3[0]['id'] : 0  ;
		$totalPayCount=$res[0]['id'] ? $res[0]['id'] : 0  ;
		$userablePrice=(float)$userablePrice[0]['amount'];

		$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$userid);
        $_userinfo = $dsql->dsqlOper($sql, "results");
        $username  = $_userinfo[0]['nickname'];
		
		if ($pay){
				//收入
			if ($pay == 1){
				
				$where .= " AND p.`type` =1";
			}else{
				$where .= " AND p.`type` =0";
			}
		}

		$where .= " order by p.`id` desc";
		
		$atpage = $pagestep*($page-1);
		$where .= " LIMIT $atpage, $pagestep";
		$archives = $dsql->SetQuery($archives.$where);
		$results = $dsql->dsqlOper($archives, "results");

		if(count($results) > 0){
            $list = array();
            foreach ($results as $key=>$value) {
				$list[$key]["id"]     = $value["id"];
				$list[$key]["type"]   = $value["type"];
				$list[$key]["amount"] = $value["amount"];
                $list[$key]["nickname"] = $value["nickname"];
                $list[$key]["ordernum"]   = $value["ordernum"];
                $list[$key]["title"]   = $value["title"];
                $list[$key]["note"]   = $value["note"];
				$list[$key]["date"]   = date("Y-m-d H:i:s", $value["date"]);
                $list[$key]["state"]   = $value["state"];
                $list[$key]["reason"]   = $value["reason"];
			}


            if(count($list) > 0){
                if($do != "export") {
                    echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ',"totalPayPrice": ' . $totalPayPrice . ',"totalOutPayPrice": ' . $totalOutPayPrice . ',"totalOutCount": ' . $totalOutCount . ',"totalPayCount": ' . $totalPayCount . ',"userablePrice": ' . $userablePrice . '}, "memberList": ' . json_encode($list) . '}';
                }
			}else{

                if($do != "export") {
                    echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
                }
			}
		}else{
            if($do != "export") {
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
            }
		}

		if($do == "export"){
            $tit = array();
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '类型'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单编号'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '原因'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '说明'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '失败原因'));

            $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
			$filename = $username.'的保障金记录明细.csv';
			$filePath = $folder . $filename;
			

            MkdirAll($folder);
            $file = fopen($filePath, "w");
            //表头
            fputcsv($file, $tit);

            foreach($list as $data){
                $arr = array();
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']== 1 ? "缴纳" : "提取"));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', ($data['type'] == 1 ? '审核通过' : ($data['state'] == 0 ? '待审核' : ($data['state'] == 1 ? '审核通过' : '拒绝审核')))));
                array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['reason']));

                //写入文件
                fputcsv($file, $arr);
            }

            header("Content-type:application/octet-stream");
            header("Content-Disposition:attachment;filename = $filename");
            header("Accept-ranges:bytes");
            header("Accept-length:".filesize($filePath));
            readfile($filePath);

        }
		
		
    }else{
		$where = "";
		if($keywords){
			$where = " AND (m.`username` like '%$keywords%' OR m.`nickname` like '%$keywords%' OR m.`phone` like '%$keywords%')";
		}

		//会员
		$archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`phone`, m.`regtime`, i.`money` FROM `#@__member` m LEFT JOIN `#@__member_invite` i ON i.`uid` = m.`id` WHERE m.`from_uid` = $userid");
		//总条数
		$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pagestep);
		$totalMoney = $dsql->dsqlOper($dsql->SetQuery("SELECT sum(i.`money`) totalMoney FROM `#@__member` m LEFT JOIN `#@__member_invite` i ON i.`uid` = m.`id` WHERE m.`from_uid` = $userid").$where, "results");

		//如果是分销商就去查member_money表统金钱
        $ar = $dsql->SetQuery($archives.$where);
        $fenxiao = $dsql->dsqlOper($ar, "results");
        if(count($fenxiao) > 0) {
            $price = array();
            foreach ($fenxiao as $k => $v) {
                if (floatval($v["money"]) == 0) {
                    $info = "推荐注册送现金，来自用户：" . $v["nickname"] . "，用户ID：" . $v["id"] . "";
                    //记录表
                    $achamount = $dsql->SetQuery("SELECT m.`amount` FROM `#@__member_money` m WHERE m.`userid` = $userid AND m.`info` = '$info'");
                    $amount = $dsql->dsqlOper($achamount, "results");
                    if ($amount > 0){
                        $price["money"] += $amount[0]['amount'] ? $amount[0]['amount'] : 0 ;

                    }
                }
            }
        }

		$totalMoney = $totalMoney && is_array($totalMoney) ? $totalMoney[0]['totalMoney'] : 0;
        $totalMoney =$totalMoney + $price['money'];

        $totalMoney = floatval($totalMoney);


		$where .= " order by m.`id` desc";

		$atpage = $pagestep*($page-1);
		$where .= " LIMIT $atpage, $pagestep";
		$archives = $dsql->SetQuery($archives.$where);
		$results = $dsql->dsqlOper($archives, "results");

		if(count($results) > 0){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[$key]["id"] = $value["id"];
				$list[$key]["nickname"] = $value["nickname"];
				$list[$key]["phone"] = $value["phone"];
				$list[$key]["regtime"] = date("Y-m-d H:i:s", $value["regtime"]);
				$useid               = $value["id"];
				if (floatval($value["money"]) == 0 ) {
                    $info = "推荐注册送现金，来自用户：" . $value["nickname"] . "，用户ID：" . $value["id"] . "";
                    //记录表
                    $archives = $dsql->SetQuery("SELECT m.`amount`, m.`info` FROM `#@__member_money` m WHERE m.`userid` = $userid AND m.`info` = '$info'");
                    $amount = $dsql->dsqlOper($archives, "results");
                    if ($amount > 0){
                        $value["money"] = $amount[0]['amount'];
                    }
                }
                    $list[$key]["money"] = floatval($value["money"]);

            }

            if(count($list) > 0){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}, "memberList": '.json_encode($list).'}';
			}else{
				echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}, "info": '.json_encode("暂无相关信息").'}';
			}
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalMoney": '.$totalMoney.'}, "info": '.json_encode("暂无相关信息").'}';
		}

	}

	die;

//增加帐户操作记录
}elseif($dopost == "operaAmount"){

    if($action == 'money'){
        if(!testPurview("editMoneyMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }elseif($action == 'point'){
        if(!testPurview("editjfMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }elseif($action == 'promotion'){
        if(!testPurview("editPromotionMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }else{
        if(!testPurview("editbonusMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }

	if(empty($action) || empty($userid) || $type === "" || empty($amount) || empty($info)){
		die('{"state": 200, "info": '.json_encode("请输入完整！").'}');
	}
	$date = GetMkTime(time());

	//验证权限
	if($userType == 3){
		if($adminAreaIDs){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `cityid` in ($adminAreaIDs) AND `id` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
			}
		}else{
			die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
		}
	}


	//更新帐户
	$oper = "+";
	$montype = 1;
	if($type == 0){
		$oper = "-";
		$montype = 2;
	}

	//保存到主表
	$str = $strv = '';
	if($action == "money"){
		$str = ', `ordertype`,`ctype`,`balance`';
		$strv = ",'member','chongzhi','0'";
	}elseif($action == "point"){
        $str = ', `ctype`,`balance`';
		$strv = ", 'zengsong','0'";
    }elseif($action == 'bonus'){
        $str = ',`ordertype`,`balance`';
        $strv = ",'member','0'";
    }else{
        $str = ',`balance`';
        $strv = ",'0'";
    }

    $title ="";
	if ($action == "money"){
        $title = "余额";
    }elseif($action == "point"){
        $title = $cfg_pointName;
    }elseif($action == "promotion"){
        $title = "保障金";
    }else{
        $title = $payname;
    }

    //减操作先验证余额
    if($oper == '-'){
        $sql = $dsql->SetQuery("SELECT `money`, `point`, `bonus`, `promotion` FROM `#@__".$db."` WHERE `id` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_money = $ret[0]['money'];
            $_point = $ret[0]['point'];
            $_bonus = $ret[0]['bonus'];
            $_promotion = $ret[0]['promotion'];

            if($action == "money"){
                $_amount = $_money;
            }elseif($action == "point"){
                $_amount = $_point;
                // $title .= '余额';
            }elseif($action == "promotion"){
                $_amount = $_promotion;
                // $title .= '保障金';
            }else{
                $_amount = $_bonus;
                // $title .= '余额';
            }

            if($_amount < $amount){
                die('{"state": 200, "info": '.json_encode("账户{$title}不足，操作失败！").'}');
            }
        }
    }

    if($action == 'promotion'){
        $ordernum = create_ordernum();
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$db."_".$action."` (`uid`, `type`, `amount`, `ordernum`, `title`, `note`, `date`) VALUES ('$userid', '$type', '$amount', '$ordernum', '管理员操作', '$info', '$date')");
    }else{
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$db."_".$action."` (`userid`, `type`, `amount`, `info`, `date`, `montype` ".$str.") VALUES ('$userid', '$type', '$amount', '$info', '$date', '$montype'".$strv.")");
    }
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($action == "money"){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `money` = `money` ".$oper." ".$amount." WHERE `id` = ".$userid);
	}elseif($action == "point"){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `point` = `point` ".$oper." ".$amount." WHERE `id` = ".$userid);
	}elseif($action == "promotion"){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `promotion` = `promotion` ".$oper." ".$amount." WHERE `id` = ".$userid);
	}else{
        $archives = $dsql->SetQuery("UPDATE `#@__".$db."`  SET `bonus` = `bonus` ".$oper." ".$amount." WHERE `id` = ".$userid);
    }
	$dsql->dsqlOper($archives, "update");

	if($aid){

        //查询帐户信息
		$archives = $dsql->SetQuery("SELECT `nickname`, `mtype`, `money`, `freeze`, `point`, `bonus`, `promotion` FROM `#@__".$db."` WHERE `id` = ".$userid);
		$results = $dsql->dsqlOper($archives, "results");

		//用户名
		$nickname = $results[0]['nickname'];
		$mtype    = $results[0]['mtype'];
		$money    = $results[0]['money'];
		$freeze   = $results[0]['freeze'];
		$point    = $results[0]['point'];
        $bonus    = $results[0]['bonus'];
        $promotion = $results[0]['promotion'];
        if($action == "money") {
            $archive = $dsql->SetQuery("UPDATE `#@__".$db."_".$action."`  SET `balance` = $money  WHERE `id` = " . $aid);
        }elseif($action == "point"){
            $archive = $dsql->SetQuery("UPDATE `#@__member_point` SET `balance` = $point WHERE `id` = ".$aid);
        }else{
            $archive = $dsql->SetQuery("UPDATE `#@__member_bonus` SET `balance` = $bonus WHERE `id` = ".$aid);
        }
        $dsql->dsqlOper($archive, "update");

        //会员中心交易记录页面链接
		if($action == "money"){
			if($mtype == 2){
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "record"
				);
			}else{
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "record"
				);
			}

		//会员中心积分记录页面链接
		}elseif($action == "point"){
			if($mtype == 2){
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "point"
				);
			}else{
				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "point"
				);
			}

        //会员中心保障金记录页面链接
        }elseif($action == "promotion"){
            $param = array(
                "service"  => "member",
                "template" => "promotion"
            );
		}

		//余额
		if($action == "money"){

            //自定义配置
            $config = array(
                "username" => $nickname,
                "amount" => $oper.$amount,
                "money" => $money,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动金额',
                    'keyword3' => '变动时间',
                    'keyword4' => '帐户余额'
                )
            );

			updateMemberNotice($userid, "会员-帐户资金变动提醒", $param, $config);

		//积分
		}elseif($action == "point"){

            //自定义配置
            $config = array(
                "username" => $nickname,
                "amount" => $oper.$amount,
                "point" => $point,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动' . $cfg_pointName,
                    'keyword3' => '变动时间',
                    'keyword4' => $cfg_pointName . '余额'
                )
            );

			updateMemberNotice($userid, "会员-积分变动通知", $param, $config);

        //消费金
        }elseif($action == "promotion"){

            //自定义配置
            $config = array(
                "username" => $nickname,
                "amount" => $oper.$amount,
                "promotion" => $promotion,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动金额',
                    'keyword3' => '变动时间',
                    'keyword4' => '保障金余额'
                )
            );

            updateMemberNotice($userid, "会员-保障金变动通知", $param, $config);
		}

		adminLog("新增会员帐户".$title."操作记录", $userid."=>".$type."=>".$amount."=>".$info);
		echo '{"state": 100, "info": '.json_encode("操作成功！").', "money": '.$results[0]['money'].', "freeze": '.$results[0]['freeze'].', "point": '.$results[0]['point'].', "promotion": '.$results[0]['promotion'].'}';
	}else{
		die('{"state": 200, "info": '.json_encode("操作失败！").'}');
	}
	die;

//指操作余额
}elseif($dopost == "updateAccount"){

    $fanwei = (int)$fanwei;  //操作范围  0系统所有会员  1符合筛选条件的会员  2已选择的会员
    $account = $account ? $account : 'money';  //money余额  point积分  bonus消费金
    $type = (int)$oper;  //0减少  1增加
    $amount = $account == 'point' ? (int)$amount : (float)$amount;
    $note = trim($note);  //操作说明
    $notify = (int)$notify;  //是否提醒  1提醒  0不提醒

    $where = '';

    if($account == 'money'){
        if(!testPurview("editMoneyMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }elseif($account == 'point'){
        if(!testPurview("editjfMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }else{
        if(!testPurview("editbonusMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }

    if($amount <= 0) die('{"state": 200, "info": '.json_encode("请输入要操作的金额").'}');
    if(empty($note)) die('{"state": 200, "info": '.json_encode("请输入操作说明").'}');

    //分站管理员
	if($userType == 3){
		if($adminAreaIDs){
            $where .= " AND m.`cityid` in ($adminAreaIDs)";
		}else{
			$where .= " AND 1 = 2";
		}
	}

    //管理员
	$where  .= " AND m.`mgroupid` = 0";

    //符合筛选条件的会员
    if($fanwei == 1){

        //城市
        if($cityid){
            $where .= getWrongCityFilter('m.`cityid`', $cityid);
        }

        //金额区间搜索
        if($startMoney != ""){
            $where .= " AND m.`money` >= ". (int)$startMoney;
        }

        if($endMoney != ""){
            $where .= " AND m.`money` <= ". (int)$endMoney;
        }

        //积分区间搜索
        if($startPoint != ""){
            $where .= " AND m.`point` >= ". (int)$startPoint;
        }

        if($endPoint != ""){
            $where .= " AND m.`point` <= ". (int)$endPoint;
        }

        //消费金区间搜索
        if($startBonus != ""){
            $where .= " AND m.`bonus` >= ". (int)$startBonus;
        }
    
        if($endBonus != ""){
            $where .= " AND m.`bonus` <= ". (int)$endBonus;
        }

        if($sKeyword != ""){
            $isId = false;
            if(substr($sKeyword, 0, 1) == '#'){
                $id = substr($sKeyword, 1);
                if(is_numeric($id)){
                    $isId = true;
                    $where .= " AND m.`id` = $id";
                }
            }
            if(!$isId){
                $where .= " AND (m.`username` like '%$sKeyword%' OR m.`discount` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`idcard` like '%$sKeyword%' OR m.`email` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`regip` like '%$sKeyword%' OR m.`company` like '%$sKeyword%')";
            }

        }

        if($mtype != ""){
            $where .= " AND m.`mtype` = ".$mtype;
        }

        if((!empty($level) || $level == 0) && $level != ""){
            $where .= " AND m.`level` = ".$level;
        }

        if($regfrom != ""){
            $where .= " AND m.`regfrom` = '$regfrom'";
        }

        if($start != ""){
            $where .= " AND m.`regtime` >= ". GetMkTime($start);
        }

        if($end != ""){
            $where .= " AND m.`regtime` <= ". GetMkTime($end . " 23:59:59");
        }

        if($pend !== ""){
            if($pend == 1){
                $pending = " AND m.`certifyState` = 3";
            }elseif($pend == 2){
                $pending = " AND m.`licenseState` = 3";
            }elseif($pend == 3) {
                $pending = " AND m.`is_cancellation` = 1";
            }else{
                $pending = " AND (m.`certifyState` = 3 OR m.`licenseState` = 3)";
            }
        }

        $time = time();

        if($state != "" && $state != 'online' && $state != 'qiyeweikt' && $state!=3 && $state!=4){
            $where .= " AND m.`state` = $state";
        }

        if(!empty($pending)){
            $where .= $pending;
        }

        //在线
        if($state == 'online'){
        $where .= " AND $time - m.`online` <= 300";
        }

        /*微信公众号*/
        if($state == 3){
            $where .= " AND m.`wechat_subscribe` =1";
        }elseif($state == 4){
            $where .= " AND m.`wechat_subscribe` =0";
        }

    //已选择的会员
    }elseif($fanwei == 2){

        if(empty($ids)) die('{"state": 200, "info": '.json_encode("请选择要操作的会员").'}');

        $where .= " AND m.`id` IN ($ids)";

    }


    //更新帐户
	$oper = "+";
	$montype = 1;
	if($type == 0){
		$oper = "-";
		$montype = 2;
	}

    $title ="";
	if ($account == "money"){
        $title = "余额";
    }elseif($account == "point"){
        $title = $cfg_pointName;
    }else{
        $title = $payname;
    }

    //保存到主表
	$str = $strv = '';
	if($account == "money"){
		$str = ', `ordertype`,`ctype`';
		$strv = ",'member','chongzhi'";
	}elseif($account == "point"){
        $str = ', `ctype`';
		$strv = ", 'zengsong'";
    }elseif($account == 'bonus'){
        $str = ',`ordertype`';
        $strv = ",'member'";
    }

	$date = GetMkTime(time());  //当前时间
    
    $userids = array();
    $archives = $dsql->SetQuery("SELECT m.`id` FROM `#@__".$db."` m WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){

        foreach($results as $key => $value){
            $userid = $value['id'];

            array_push($userids, $userid);

            //更新账户余额
            if($account == "money"){
                $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `money` = `money` ".$oper." ".$amount." WHERE `id` = ".$userid);
            }elseif($account == "point"){
                $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `point` = `point` ".$oper." ".$amount." WHERE `id` = ".$userid);
            }else{
                $archives = $dsql->SetQuery("UPDATE `#@__".$db."`  SET `bonus` = `bonus` ".$oper." ".$amount." WHERE `id` = ".$userid);
            }
            $dsql->dsqlOper($archives, "update");


            //查询帐户最新信息
            $archives = $dsql->SetQuery("SELECT `nickname`, `mtype`, `money`, `point`, `bonus` FROM `#@__".$db."` WHERE `id` = ".$userid);
            $results = $dsql->dsqlOper($archives, "results");

            //用户名
            $_nickname = $results[0]['nickname'];
            $_mtype    = $results[0]['mtype'];
            $_money    = $results[0]['money'];
            $_point    = $results[0]['point'];
            $_bonus    = $results[0]['bonus'];
            
            if($account == "money") {
                $balance = $_money;
            }elseif($account == "point"){
                $balance = $_point;
            }else{
                $balance = $_bonus;
            }

            //账户日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__".$db."_".$account."` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `balance` ".$str.") VALUES ('$userid', '$type', '$amount', '$note', '$date', '$montype', '$balance'".$strv.")");
            $dsql->dsqlOper($archives, "update");


            //需要通知
            if($notify){
                //会员中心交易记录页面链接
                if($account == "money"){
                    if($mtype == 2){
                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "record"
                        );
                    }else{
                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "record"
                        );
                    }

                //会员中心积分记录页面链接
                }else{
                    if($mtype == 2){
                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "point"
                        );
                    }else{
                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "point"
                        );
                    }
                }

                //余额
                if($account == "money"){

                    //自定义配置
                    $config = array(
                        "username" => $_nickname,
                        "amount" => $oper.$amount,
                        "money" => $_money,
                        "date" => date("Y-m-d H:i:s", $date),
                        "info" => $note,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动金额',
                            'keyword3' => '变动时间',
                            'keyword4' => '帐户余额'
                        )
                    );

                    updateMemberNotice($userid, "会员-帐户资金变动提醒", $param, $config);

                //积分
                }elseif($account == "point"){

                    //自定义配置
                    $config = array(
                        "username" => $_nickname,
                        "amount" => $oper.$amount,
                        "point" => $_point,
                        "date" => date("Y-m-d H:i:s", $date),
                        "info" => $note,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动' . $cfg_pointName,
                            'keyword3' => '变动时间',
                            'keyword4' => $cfg_pointName . '余额'
                        )
                    );

                    updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                }
            }


        }

    }

    adminLog("批量操作会员账户".$title, "会员数量：".count($userids)."个，动作：".$oper.$amount."，原因：".$note."，提醒：".($notify ? '开' : '关')."，会员ID：" . join(',', $userids));
    echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
    die;


//删除操作记录
}elseif($dopost == "delAmount"){

    if($action == 'money'){
        if(!testPurview("delMoneyMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }elseif($action == 'point'){
        if(!testPurview("deljfMember")){
    		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    	};
    }else{
        if(!testPurview("delbonusMember")){
            die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
        };
    }

	$title = $type == "money" ? "余额" : $cfg_pointName;

	//验证权限
	if($userType == 3){
		if($adminAreaIDs){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `cityid` in ($adminAreaIDs) AND `id` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
			}
		}else{
			die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
		}
	}

	if($action != ""){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."_".$type."` WHERE `userid` = ".$userid);
		$results = $dsql->dsqlOper($archives, "update");
		if(!$results){
			echo '{"state": 200, "info": "删除失败"}';
		}else{
			adminLog("清空".$title."操作记录", $userid);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}else{
		$each = explode(",", $id);
		$error = array();
		if($id != ""){
			foreach($each as $val){
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."_".$type."` WHERE `id` = ".$val);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					$error[] = $val;
				}
			}
			if(!empty($error)){
				echo '{"state": 200, "info": '.json_encode($error).'}';
			}else{
				adminLog("删除".$title."操作记录", $id);
				echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
			}
		}
	}
	die;

//账号拒审
}else if($action == "disableAccount"){
	if(!testPurview("memberEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
    $reason = $reason ? $reason : "违反城市招聘板块业务规则！";
	if($id != ""){
		foreach($each as $val){

			//验证权限
			if($userType == 3){
				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = 2, `stateinfo` = '$reason' WHERE `cityid` in ($adminAreaIDs) AND `id` = ".$val);
			}else{
				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = 2, `stateinfo` = '$reason' WHERE `id` = ".$val);
			}
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("禁用账号", $id."=>".$reason);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__member_level` ORDER BY `id` ASC");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		$levelList = $results;
	}
	$huoniaoTag->assign('levelList', $levelList);
//    $huoniaoTag->assign('is_cancellation', $is_cancellation ? $is_cancellation : 0);

    $regFromList = array(
        'pc' => 'PC电脑端',
        'h5' => 'H5浏览器'
    );

    //app
    if(verifyTerminalState('android')){
        $regFromList['android'] = '安卓APP';
    }
    if(verifyTerminalState('ios')){
        $regFromList['ios'] = '苹果APP';
    }
    if(verifyTerminalState('harmony')){
        $regFromList['harmony'] = '鸿蒙APP';
    }
    
    $regFromList['weixin'] = '微信公众号';

    //微信小程序
    if(verifyTerminalState('wxmini')){
        $regFromList['wxmini'] = '微信小程序';
    }

    //抖音小程序
    if(verifyTerminalState('dymini')){
        $regFromList['dymini'] = '抖音小程序';
    }

    //QQ小程序
    if(verifyTerminalState('qqmini')){
        $regFromList['qqmini'] = 'QQ小程序';
    }

    //百度小程序
    if(verifyTerminalState('bdmini')){
        $regFromList['bdmini'] = '百度小程序';
    }
    
    $regFromList['bbs'] = '论坛同步';

	$huoniaoTag->assign('regFromList', $regFromList);


	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('off', $off);
	$huoniaoTag->assign('nicknameAudit', (int)$nicknameAudit);
	$huoniaoTag->assign('photoAudit', (int)$photoAudit);
	$huoniaoTag->assign('personalAuth', (int)$personalAuth);
	$huoniaoTag->assign('companyAuth', (int)$companyAuth);
	$huoniaoTag->assign('cfg_fenxiaoName', $cfg_fenxiaoName);
	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
