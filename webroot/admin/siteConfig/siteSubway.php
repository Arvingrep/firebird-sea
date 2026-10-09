<?php
/**
 * 管理城市地铁
 *
 * @version        $Id: siteSubway.php 2015-1-14 下午15:34:01 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
if($dopost != "getSubway") {
    checkPurview("siteSubway");
}
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$action = "site_subway";
$pid = (int)$pid;
$cid = (int)$cid;
$provinceid = 0;
$cityid = 0;
$countyid = 0;

if(empty($dopost)){
	$templates = "siteSubway.html";
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/siteConfig/siteSubway.js'
	);
}else{
	$templates = "siteSubwayAdd.html";
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteSubwayAdd.js'
	);
}

//新增or修改
if($submit == '提交'){

	if($token == "") die('token传递失败！');
	if(empty($cid)) die('{"state": 200, "info": "请选择所在城市"}');
	if(empty($menus)) die('{"state": 200, "info": "线路配置失败，请检查线路内容"}');

	$menuArr = explode("@@@", $menus);
	foreach ($menuArr as $key => $value) {

		$val = explode("$$", $value);

		$x1 = explode("^", $val[0]);
		$x2 = explode("||", $val[1]);
		$title = $x1[0];
		$id    = $x1[1];

		//新增
		if($dopost == "add"){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`cid`, `title`, `weight`) VALUES ('$cid', '$title', '$key')");
			$lid = $dsql->dsqlOper($archives, "lastid");

			if(is_numeric($lid)){
				$station = array();
				foreach ($x2 as $k => $v) {
					$tit = explode("^", $v);
					$tit = $tit[0];
					$station[] = "('$lid', '$tit', '$k')";
				}
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_station` (`sid`, `title`, `weight`) VALUES ".join(",", $station)."");
				$dsql->dsqlOper($archives, "update");
			}

		//修改
		}elseif($dopost == "edit"){

			$sql = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$update = array();
				if($ret[0]['title'] != $title){
					$update[] = "`title` = '$title'";
				}
				if($ret[0]['weight'] != $key){
					$update[] = "`weight` = '$key'";
				}
				if($ret[0]['cid'] != $cid){
					$update[] = "`cid` = $cid";
				}

				$sql = $dsql->SetQuery("UPDATE `#@__".$action."` SET ".join(",", $update)." WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");

				foreach ($x2 as $k => $v) {
					$tit = explode("^", $v);
					$title = $tit[0];
					$sid = $tit[1];

					$sql = $dsql->SetQuery("SELECT * FROM `#@__".$action."_station` WHERE `id` = ".$sid);
					$ret1 = $dsql->dsqlOper($sql, "results");

                    if($ret1 && is_array($ret1)){
						$stationUpdate = array();
						if($ret1[0]['title'] != $title){
							$stationUpdate[] = "`title` = '$title'";
						}
						if($ret1[0]['weight'] != $k){
							$stationUpdate[] = "`weight` = '$k'";
						}
						$sql = $dsql->SetQuery("UPDATE `#@__".$action."_station` SET ".join(",", $stationUpdate)." WHERE `id` = ".$sid);
						$dsql->dsqlOper($sql, "update");

					//新增
					}else{

						$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_station` (`sid`, `title`, `weight`) VALUES ('$id', '$title', '$k')");
						$dsql->dsqlOper($archives, "update");

					}


				}


			//新增
			}else{

				$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`cid`, `title`, `weight`) VALUES ('$cid', '$title', '$key')");
				$lid = $dsql->dsqlOper($archives, "lastid");

				if(is_numeric($lid)){
					$station = array();
					foreach ($x2 as $k => $v) {
						$tit = explode("^", $v);
						$tit = $tit[0];
						$station[] = "('$lid', '$tit', '$k')";
					}
					$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_station` (`sid`, `title`, `weight`) VALUES ".join(",", $station)."");
					$dsql->dsqlOper($archives, "update");
				}

			}


		}
	}

	if($dopost == "add"){
		echo '{"state": 100, "info": "添加成功！"}';
	}elseif($dopost == "edit"){
		echo '{"state": 100, "info": "修改成功！"}';
	}

	die;
}

//地铁线路列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($xid){
		$where = " AND `cid` = ".$xid;
	}elseif($cid){
		$idsArr = array($cid);
		$childArr = $dsql->getTypeList($cid, "site_area", 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}

		$where = " AND `cid` in (".join(",", $idsArr).")";
	}elseif($pid){
		$idsArr = array($pid);
		$childArr = $dsql->getTypeList($pid, "site_area", 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}

		$where = " AND `cid` in (".join(",", $idsArr).")";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");
	$where .= " GROUP BY `cid`";

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);


	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["cid"] = $value["cid"];

			global $data;
			$data = "";
			$areaName = getParentArr("site_area", $value['cid']);
			$areaName = array_reverse(parent_foreach($areaName, "typename"));
			$list[$key]['area'] = join(" ", $areaName);

			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__".$action."` WHERE `cid` = ".$value['cid']." ORDER BY `weight`");
			$ret = $dsql->dsqlOper($sql, "results");
			$title = array();
			if($ret){
				foreach ($ret as $k => $v) {
					$title[] = $v['title'];
				}
			}
			$list[$key]["title"] = join("、", $title);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//列表删除线路
}elseif($dopost == "del"){

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		$title = array();
		$sid   = array();
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `cid` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_station` WHERE `sid` = ".$value['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `cid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
		}

		adminLog("删除城市地铁", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//根据省份ID获取城市
}elseif($dopost == "getCity"){
	//if(!empty($id)){
		echo json_encode($dsql->getTypeList($id, "site_area", false));
	//}
	die;

//修改获取信息详细
}elseif($dopost == "edit"){

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `cid` = ".$id." ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if(!empty($results)){

			$subway = array();
			$cid = $id;

			global $data;
			$data = "";
			$areaName = getParentArr("site_area", $id);
			$areaId   = array_reverse(parent_foreach($areaName, "id"));

			$provinceid = (int)$areaId[0];
			$cityid     = (int)$areaId[1];
			$countyid   = (int)$areaId[2];

			foreach ($results as $key => $value) {
				$subway[$key]['id']    = $value['id'];
				$subway[$key]['title'] = $value['title'];

				$sql = $dsql->SetQuery("SELECT * FROM `#@__".$action."_station` WHERE `sid` = ".$value['id']." ORDER BY `weight`");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach ($ret as $k => $v) {
						$subway[$key]['station'][$k]['id'] = $v['id'];
						$subway[$key]['station'][$k]['title'] = $v['title'];
					}
				}
			}

			$huoniaoTag->assign('subway', $subway);

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

//删除线路
}elseif($dopost == "delSubway"){
	if(!empty($id)){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$id);
		$dsql->dsqlOper($archives, "update");

		//删除站点名
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_station` WHERE `sid` = ".$id);
		$dsql->dsqlOper($archives, "update");

		echo '{"state": 100, "info": "删除成功！"}';
	}
	die;

//删除站点名
}elseif($dopost == "delStation"){
	if(!empty($id)){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_station` WHERE `id` = ".$id);
		$dsql->dsqlOper($archives, "update");
		echo '{"state": 100, "info": "删除成功！"}';
	}
	die;


//获取已开通的地铁城市及站点
}elseif($dopost == "getSubway"){

	$subwayListArr = array();

	// 地址集合
	if(!empty($addrids)){
		$addrArr = explode(",", $addrids);
		rsort($addrArr);
		foreach ($addrArr as $key => $value) {
			$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway` WHERE `cid` = ".$value." ORDER BY `weight`");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$subwayListArr[$key]['id'] = $value['id'];
					$subwayListArr[$key]['title'] = $value['title'];

					$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway_station` WHERE `sid` = ".$value['id']." ORDER BY `weight`");
					$res = $dsql->dsqlOper($sql, "results");
					$subwayListArr[$key]['lower'] = $res;
				}
				break;
			}
		}

	//通过二级城市获取
	}elseif(!empty($addrid)){
		$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = $addrid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway` WHERE `cid` = ".$ret[0]['parentid']." ORDER BY `weight`");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$subwayListArr[$key]['id'] = $value['id'];
					$subwayListArr[$key]['title'] = $value['title'];

					$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway_station` WHERE `sid` = ".$value['id']." ORDER BY `weight`");
					$res = $dsql->dsqlOper($sql, "results");
					$subwayListArr[$key]['lower'] = $res;
				}
			}
		}

	//通过一级城市
	}elseif(!empty($cid)){
		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway` WHERE `cid` = ".$cid." ORDER BY `weight`");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {
				$subwayListArr[$key]['id'] = $value['id'];
				$subwayListArr[$key]['title'] = $value['title'];

				$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway_station` WHERE `sid` = ".$value['id']." ORDER BY `weight`");
				$res = $dsql->dsqlOper($sql, "results");
				$subwayListArr[$key]['lower'] = $res;
			}
		}
	}

	echo '{"state": 100, "info": '.json_encode($subwayListArr).'}';
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//省
	$province = $dsql->getTypeList(0, "site_area", false);
	$huoniaoTag->assign('province', $province);

	$pname = "--省份--";
	$huoniaoTag->assign('pid', $pid);
	if($pid){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ".$pid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$pname = $results[0]['typename'];
		}
	}
	$huoniaoTag->assign('pname', $pname);

	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('cid', (int)$cid);
	$huoniaoTag->assign('sid', (int)$sid);
	$huoniaoTag->assign('provinceid', $provinceid);
	$huoniaoTag->assign('cityid', $cityid);
	$huoniaoTag->assign('countyid', $countyid);

  //状态&文案
	$huoniaoTag->assign('subway_state', (int)$cfg_subway_state);
	$huoniaoTag->assign('subway_title', $cfg_subway_title ? $cfg_subway_title : '公交/地铁');

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
