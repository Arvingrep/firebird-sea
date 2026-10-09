<?php
/**
 * 管理房产经纪人
 *
 * @version        $Id: zjUserList.php 2014-1-19 上午11:28:16 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("zjUserList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "zjUserList.html";

$tab = "house_zjuser";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){

        $comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_zjcom` WHERE `title` like '%$sKeyword%'");
        $comResult = $dsql->dsqlOper($comSql, "results");
        if($comResult) {
            $comid = array();
            foreach ($comResult as $key => $com) {
                array_push($comid, $com['id']);
            }
            if (!empty($comid)) {
                $where .= " AND (`zjcom` in (" . join(",", $comid) . ") OR ";
            }
        }else{
            $where .= " AND (";
        }

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where .= " `userid` in (".join(",", $userid)."))";
			}
		}else{
            $where .= " 1=1 )";
        }

		if(empty($comid) && empty($userid)){
			$where .= " AND 1 = 2";
		}
	}
	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "houseaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "houseaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addr` in ($lower)";
	}

	if($sFlag != ""){
		$where .= " AND `flag` = $sFlag";
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
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `zjcom`, `store`, `addr`, `state`, `flag`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["userid"] = $value["userid"];
			$userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value['userid']);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["username"] = $username[0]["username"] . '（' . $username[0]["nickname"] . '）';

			$list[$key]["zjcom"] = $value["zjcom"];
			$zjcom = "";
			if($value["zjcom"]){
				$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_zjcom` WHERE `id` = ". $value['zjcom']);
				$comname = $dsql->getTypeName($comSql);
				$zjcom = $comname ? $comname[0]['title'] : "";
			}else{
				$zjcom = "独立经纪人";
			}
			$list[$key]["comname"] = $zjcom;

			$list[$key]["store"] = $value["store"];

			$list[$key]["addrid"] = $value["addr"];
            //地区
            $addrname = $value['addr'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addr"] = $addrname;

			$list[$key]["state"] = $value["state"];
			$list[$key]["flag"] = $value["flag"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "house",
				"template" => "broker-detail",
				"id"       => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);

			$param = array(
				"service"  => "house",
				"template" => "store-detail",
				"id"       => $value['zjcom']
			);
			$list[$key]['zjurl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "zjUserList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("zjUserDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_zjuser` WHERE `id` = $val");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				$userid = $res[0]['userid'];

				//更新当前会员下已经发布的房源信息性质
				$sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");
				$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");
				$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");
				$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");
				$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");
				$sql = $dsql->SetQuery("UPDATE `#@__house_cw` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $val AND `usertype` = 1");
				$dsql->dsqlOper($sql, "update");

				$sql = $dsql->SetQuery("DELETE FROM `#@__house_zjuser` WHERE `id` = $val");
				$dsql->dsqlOper($sql, "update");
			}

			// 清除缓存
			checkCache("house_zjuser_list", $val);
			clearCache("house_zjuser_detail", $val);
			clearCache("house_zjuser_total", "key");
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除房产经纪人信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("zjUserEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				clearCache("house_zjuser_detail", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("house_zjuser_list", $val);
					clearCache("house_zjuser_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("house_zjuser_list", 300);
					clearCache("house_zjuser_total", "key");
				}
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新房产经纪人状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
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
		'admin/house/zjUserList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
