<?php
/**
 * 管理员管理
 *
 * @version        $Id: adminList.php 2013-12-31 下午16:18:10 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("adminList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "adminList.html";

$db = "member";

//删除管理员
if($dopost == "del"){

	//城市管理员，只能查看相同管理城市的管理员
	$mgroupid = 0;
	if($userType == 3){
		$sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$mgroupid = $ret[0]['mgroupid'];
		}
	}


	$each = explode(",", $id);

	if(in_array($userLogin->getUserID(), $each)){
		echo '{"state": 101, "info": "不可以删除自己！"}';
		die;
	}

	$error = array();
	$name = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `username`, `mgroupid` FROM `#@__".$db."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				$name[] = $res[0]['username'];
				if($userType == 3 && $res[0]['mgroupid'] != $mgroupid){
					$error[] = $val;
				}else{
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "update");
					if($results != "ok"){
						$error[] = $val;
					}
				}
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除管理员", join(",", $name));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//获取管理员列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	//管理员
	$where = " AND `mgroupid` != ''";

	//城市管理员，只能查看相同管理城市的管理员
	if($userType == 3){
		$sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$where .= " AND `mtype` = 3 AND `mgroupid` = " . $ret[0]['mgroupid'];
		}else{
			$where .= " AND 1 = 2";
		}
	}

	if($sKeyword != ""){
		$where .= " AND (`username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `discount` like '%$sKeyword%')";
	}

	if($city != ""){
		$where .= " AND `mtype` = 3 AND `mgroupid` = ".$city;
	}else{
		if($admin != ""){
			$where .= " AND `mgroupid` = ".$admin;
		}
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//正常
	$normal = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//锁定
	$lock = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `mtype`, `username`, `nickname`, `regtime`, `phone`, `mgroupid`, `state`, `expired`, `discount` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
        $now = GetMkTime(time());
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["username"] = $value["username"];
			$list[$key]["nickname"] = $value["nickname"];
			$list[$key]["regtime"] = date("Y-m-d H:i:s", $value["regtime"]);

            $expired = (int)$value["expired"];
			$list[$key]["expired"] = $expired ? date("Y-m-d H:i:s", $expired) : '永久';

            $isExpired = 0;
            if($expired && $now > $expired){
                $isExpired = 1;
            }
            $list[$key]['isExpired'] = $isExpired;

			$group = $dsql->SetQuery("SELECT `groupname` FROM `#@__admingroup` WHERE `id` = ".$value["mgroupid"]);
			$groupResult = $dsql->dsqlOper($group, "results");
			$list[$key]["groupname"]  = $groupResult[0]["groupname"] == null ? "未知" : $groupResult[0]["groupname"];

			$list[$key]["state"] = $value["state"];
			$list[$key]["mtype"] = $value["mtype"];
			$list[$key]["mgroupid"] = $value["mgroupid"];
			$list[$key]["phone"] = $value["phone"];
			$list[$key]["discount"] = $value["discount"];

			if($value['mtype'] == 3){
				$sql = $dsql->SetQuery("SELECT a.`typename`,c.`money` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` = " . $value['mgroupid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$list[$key]["groupname"] = $ret[0]['typename'] . '分站管理员';
					$list[$key]["ctmoney"] = $ret[0]['money'];
				}else{
					$list[$key]["groupname"] = '未知分站管理员';
				}
			}
			$list[$key]["ctmoney"] =  $list[$key]["ctmoney"] ? $list[$key]["ctmoney"] : '0';
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "normal": '.$normal.', "lock": '.$lock.'}, "adminList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "normal": '.$normal.', "lock": '.$lock.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "normal": '.$normal.', "lock": '.$lock.'}, "info": '.json_encode("暂无相关信息").'}';
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
		'ui/chosen.jquery.min.js',
		'admin/member/adminList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$archives = $dsql->SetQuery("SELECT `id`, `groupname` FROM `#@__admingroup`");
	$results = $dsql->dsqlOper($archives, "results");
	$huoniaoTag->assign('groupList', $results);

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
