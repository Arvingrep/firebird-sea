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
checkPurview("memberStatistics");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "memberStatistics.html";

if($dopost == "getList"){

	$where = "";

	//城市管理员，只能管理管辖城市的会员
	if($userType == 3){
    $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $adminCityID = $ret[0]['mgroupid'];

      global $data;
      $data = '';
      $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
      $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
      $adminAreaIDs = join(',', $adminAreaIDArr);
			if($adminAreaIDs){
				$where .= " AND m.`addr` in ($adminAreaIDs)";
			}else{
				$where .= " AND 1 = 2";
			}
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
		// 	$where .= " AND m.`addr` in ($cityAreaIDs)";
		// }else{
		// 	$where .= " 3 = 4";
		// }
        $where .= getWrongCityFilter('m.`cityid`', $cityid);
	}

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	if($start != ""){
		$where .= " AND l.`date` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND l.`date` <= ". GetMkTime($end . " 23:59:59");
	}

	$list = array();

	$archives = $dsql->SetQuery("SELECT m.`username`,m.`nickname`, m.`addr`, SUM(l.`amount`) amount, l.`userid` FROM `#@__member_money` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE l.`type` = 0 AND `userid` > 0".$where." GROUP BY l.`userid`");
	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$limit = " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT m.`username`,m.`nickname`, m.`cityid`, SUM(l.`amount`) amount, l.`userid` FROM `#@__member_money` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE l.`type` = 0 AND `showtype` = 0 AND `userid` > 0".$where." GROUP BY l.`userid` ORDER BY `amount` DESC".$limit);
	$results  = $dsql->dsqlOper($archives, "results");

	if($results){
		// print_r($results);die;
		foreach ($results as $key => $value) {
			$list[$key]['userid'] = $value['userid'];
			$list[$key]['username'] = $value['nickname'] ? $value['nickname'] : $value['username'];

			$cityname = '未知';
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . (int)$value["cityid"]);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$cityname = $ret[0]['typename'];
			}
			$list[$key]["addrname"] = $cityname;

			$list[$key]['amount'] = $value['amount'];

			$sql = $dsql->SetQuery("SELECT `id`, `date` FROM `#@__member_money` WHERE `userid` = ".$value['userid']." AND `type` = 0 ORDER BY `id` DESC");
			$ret = $dsql->dsqlOper($sql, "results");

			$list[$key]['lastid'] = $ret[0]['id'];
			$list[$key]['lastdate'] = $ret[0]['date'];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "memberList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
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
		'ui/bootstrap-datetimepicker.min.js',
		'admin/member/memberStatistics.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
