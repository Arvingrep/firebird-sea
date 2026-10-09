<?php
/**
 * 签到记录
 *
 * @version        $Id: qiandaoRecord.php 2017-12-7 下午17:29:20 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("qiandaoRecord");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member_qiandao";
$templates = "qiandaoRecord.html";

//css
$cssFile = array(
	'ui/jquery.chosen.css',
	'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'ui/chosen.jquery.min.js',
	'admin/member/qiandaoRecord.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

//获取会员列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//城市管理员，只能管理管辖城市的会员
	if($userType == 3){
		if($adminCityIds){
			$where .= getCityFilter('m.`cityid`');
		}else{
			$where .= " AND 1 = 2";
		}
	}

	//城市
	if($cityid){
		$where .= getWrongCityFilter('m.`cityid`', $cityid);
	}

	if($sKeyword != ""){
		$where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`email` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR q.`ip` like '%$sKeyword%' OR q.`ipaddr` like '%$sKeyword%')";
	}

	if($start != ""){
		$where .= " AND q.`date` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND q.`date` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT q.`id` FROM `#@__".$db."` q LEFT JOIN `#@__member` m ON m.`id` = q.`uid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil((int)$totalCount/$pagestep);

	$where .= " order by q.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT m.`id` uid, m.`username`, m.`nickname`, m.`photo`, m.`addr`, m.`cityid`, q.`id`, q.`reward`, q.`date`, q.`note`, q.`ip`, q.`ipaddr` FROM `#@__".$db."` q LEFT JOIN `#@__member` m ON m.`id` = q.`uid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if($results && is_array($results)){
		foreach ($results as $key=>$value) {
			$list[$key]["id"]       = $value["id"];
			$list[$key]["uid"]      = $value["uid"];
			$list[$key]["username"] = $value["username"];
			$list[$key]["nickname"] = $value["nickname"];
			$list[$key]["photo"]    = $value["photo"];
			$list[$key]["reward"]   = $value["reward"];
			$list[$key]["date"]     = $value["date"];
			$list[$key]["note"]     = $value["note"];
			$list[$key]["ip"]       = $value["ip"];
			$list[$key]["ipaddr"]   = $value["ipaddr"];

			$addrname = '未知';
            $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . $value["cityid"]);
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $addrname = $ret[0]['typename'];
            }
			$list[$key]["addrname"] = $addrname;
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

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
