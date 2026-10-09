<?php
/**
 * 管理网站举报信息
 *
 * @version        $Id: siteComplain.php 2017-08-22 上午10:49:25 $
 * @package        HuoNiao.SiteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteComplain");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteComplain.html";

$action = "member_complain";


//更新举报信息
if($dopost == "updateDetail"){
	if($id == "") die;

	$opuid = $userLogin->getUserID();
	$optime = time();

	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = '1', `note` = '$note', `opuid` = '$opuid', `optime` = '$optime' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新网站举报信息", $id . " => " . $note);
		echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	}
	die;

//删除举报
}else if($dopost == "delComplain"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除网站举报信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取举报列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	$search = array();

	if($sType){
		$where .= " AND `module` = '$sType'";
	}

	if($sKeyword != ""){

		array_push($search, "`type` like '%$sKeyword%'");
		array_push($search, "`info` like '%$sKeyword%'");
		array_push($search, "`phone` like '%$sKeyword%'");
		array_push($search, "`qq` like '%$sKeyword%'");
		array_push($search, "`ip` like '%$sKeyword%'");
		array_push($search, "`ipaddr` like '%$sKeyword%'");
		array_push($search, "`note` like '%$sKeyword%'");

		//新闻资讯
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__articlelist_all` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'article' AND `aid` in ($idList))");
		}

		//图说新闻
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__imagelist` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'image' AND `aid` in ($idList))");
		}

		//分类信息
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'info' AND `aid` in ($idList))");
		}

		//顺风车
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__sfcar_list` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'sfcar' AND `aid` in ($idList))");
		}

		//二手房
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'house' AND `action` = 'sale' AND `aid` in ($idList))");
		}

		//租房
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'house' AND `action` = 'zu' AND `aid` in ($idList))");
		}

		//写字楼
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_xzl` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'house' AND `action` = 'xzl' AND `aid` in ($idList))");
		}

		//商铺
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_sp` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'house' AND `action` = 'sp' AND `aid` in ($idList))");
		}

		//厂房
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_cf` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'house' AND `action` = 'cf' AND `aid` in ($idList))");
		}

		//招聘职位
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_post` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'job' AND `aid` in ($idList))");
		}

		//招聘简历
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'resume' AND `aid` in ($idList))");
		}

		//招聘会
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'zhaopinhui' AND `aid` in ($idList))");
		}

		//招聘公司
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'company' AND `aid` in ($idList))");
		}

		//招聘普工招工
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_pg` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'pgzg' AND `aid` in ($idList))");
		}

		//招聘普工求职
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_qz` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'job' AND `action` = 'pgqz' AND `aid` in ($idList))");
		}

		//黄页
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__huangyelist` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'huangye' AND `aid` in ($idList))");
		}

		//视频
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__videolist` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'video' AND `aid` in ($idList))");
		}

		//直播
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'live' AND `aid` in ($idList))");
		}

		//贴吧
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__tieba_list` WHERE `title` like '%$sKeyword%'");
		$results  = $dsql->getTypeName($archives);
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'tieba' AND `aid` in ($idList))");
		}
		//贴吧评论
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `content` like '%$sKeyword%' AND `type` = 'tieba-detail'");
		$results  = $dsql->getTypeName($archives);
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'tieba' AND `commonid` in ($idList))");
		}

		//汽车
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_list` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'car' AND `aid` in ($idList))");
		}

		//家政
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_list` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'homemaking' AND `aid` in ($idList))");
		}

		//商家
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'business' AND `aid` in ($idList))");
		}

		//城市招聘职位
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_post` WHERE `title` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'zhaopin' AND (`action` = 'quanzhi' OR `action` = 'jianzhi') AND `aid` in ($idList))");
		}

		//城市招聘简历
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__zhaopin_resume` WHERE `name` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$list = array();
			foreach ($results as $key=>$value) {
				$list[] = $value["id"];
			}
			$idList = join(",", $list);
			array_push($search, "(`module` = 'zhaopin' AND `action` = 'resume' AND `aid` in ($idList))");
		}

		$where = " AND (" . join(" OR ", $search) . ")";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil((int)$totalCount/(int)$pagestep);
	//待处理
	$totalGray = $dsql->dsqlOper($archives.$where." AND `state` = 0", "totalCount");
	//已处理
	$totalAudit = $dsql->dsqlOper($archives.$where." AND `state` = 1", "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}
	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$list[$key]["type"] = $value["type"];
			$list[$key]["desc"] = $value["info"];
			$list[$key]["phone"] = $value["phone"];
			$list[$key]["qq"] = $value["qq"];
			$list[$key]["note"] = $value["note"];
			$list[$key]["commonid"] = $value["commonid"];

			$opuid = $value['opuid'];
			$opname = "未知";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $opuid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret && is_array($ret)){
				$opname = $ret[0]['username'];
			}
			$list[$key]["opuid"] = $opuid;
			$list[$key]['opname'] = $opname;

			$list[$key]["optime"] = date('Y-m-d H:i:s', $value["optime"]);
			$list[$key]["aid"] = $value["aid"];

			$title = "未知";
			$url = "";

			//新闻资讯
			if($value['module'] == "article"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__articlelist_all` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "article", "template" => "detail", "id" => $value['aid']));
			}

			//图说新闻
			if($value['module'] == "image"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__imagelist` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "image", "template" => "detail", "id" => $value['aid']));
			}

			//分类信息
			if($value['module'] == "info"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__infolist` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "info", "template" => "detail", "id" => $value['aid']));
			}
			//顺风车
			if($value['module'] == "sfcar"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__sfcar_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "sfcar", "template" => "detail", "id" => $value['aid']));
			}

			//房产
			if($value['module'] == "house"){

				//中介公司
				if($value['action'] == 'store-detail'){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_zjcom` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);

				}elseif($value['action'] == 'broker'){
					$typeSql = $dsql->SetQuery("SELECT m.`realname`, m.`nickname` FROM `#@__house_zjuser` z LEFT JOIN `#@__member` m ON m.`id` = z.`userid` WHERE z.`id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					if($typename){
						$typename[0]['title'] = $typename[0]['realname'] ? $typename[0]['realname'] : $typename[0]['nickname'];
					}

				}else{
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_".$value['action']."` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
				}
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "house", "template" => $value['action'] . "-detail", "id" => $value['aid']));
			}

			//团购
			if($value['module'] == "tuan"){
				if($value['action'] == "store"){
					$typeSql = $dsql->SetQuery("SELECT m.`company` FROM `#@__member` m LEFT JOIN `#@__tuan_store` s ON s.`uid` = m.`id` WHERE s.`id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = $typename[0]['company'];
					$url = getUrlPath(array("service" => "tuan", "template" => "store", "id" => $value['aid']));
				}else{
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__tuanlist` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = $typename[0]['title'];
					$url = getUrlPath(array("service" => "tuan", "template" => "detail", "id" => $value['aid']));
				}
			}

			//招聘职位
			if($value['module'] == "job"){
				if($value['action'] == "job" || $value['action'] == "post"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_post` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '职位：' . $typename[0]['title'];
					$url = getUrlPath(array("service" => "job", "template" => "job", "id" => $value['aid']));
				}elseif($value['action'] == "resume"){
					$typeSql = $dsql->SetQuery("SELECT `name` FROM `#@__job_resume` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '简历：' . $typename[0]['name'];
					$url = getUrlPath(array("service" => "job", "template" => "resume", "id" => $value['aid']));
				}elseif($value['action'] == "zhaopinhui"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '招聘会：' . $typename[0]['title'];
					$url = getUrlPath(array("service" => "job", "template" => "zhaopinhui", "id" => $value['aid']));
				}elseif($value['action'] == "company"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '公司：' . $typename[0]['title'];
					$url = getUrlPath(array("service" => "job", "template" => "company", "id" => $value['aid']));
				}elseif($value['action'] == "pgzg"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_pg` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '普工职位：' . $typename[0]['title'];
					$url = getUrlPath(array("service" => "job", "template" => "general-detailzg", "id" => $value['aid']));
				}elseif($value['action'] == "pgqz"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_qz` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '普工简历：' . $typename[0]['title'];
					$url = getUrlPath(array("service" => "job", "template" => "general-detailqz", "id" => $value['aid']));
				}
			}

			//城市招聘
			if($value['module'] == "zhaopin"){
				if($value['action'] == "quanzhi" || $value['action'] == "jianzhi"){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__zhaopin_post` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = ($value['action'] == "quanzhi" ? '全职岗位：' : '兼职岗位：') . $typename[0]['title'];
					$url = getUrlPath(array("service" => "zhaopin", "template" => 'postDetail', "param" => "id=" . $value['aid']));
				}elseif($value['action'] == "resume"){
					$typeSql = $dsql->SetQuery("SELECT `name` FROM `#@__zhaopin_resume` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					$title = '简历：' . $typename[0]['name'];
					$url = getUrlPath(array("service" => "zhaopin", "template" => "resume", "param" => "id=" . $value['aid']));
				}
			}

			//交友
			if($value['module'] == "dating"){
				$typeSql = $dsql->SetQuery("SELECT m.`nickname` FROM `#@__dating_member` d LEFT JOIN `#@__member` m ON m.`id` = d.`userid` WHERE d.`id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['nickname'];
				$url = getUrlPath(array("service" => "dating", "template" => "u", "id" => $value['aid']));
			}

			//活动
			if($value['module'] == "huodong"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__huodong_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "huodong", "template" => "detail", "id" => $value['aid']));
			}

			//贴吧
			if($value['module'] == "tieba"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "tieba", "template" => "detail", "id" => $value['aid']));
				if(!empty($value['commonid'])){
					$contentSql = $dsql->SetQuery("SELECT `content` FROM `#@__public_comment_all` WHERE `aid`='".$value['aid']."' and `id` = ". $value['commonid']);
					$contentA = $dsql->getTypeName($contentSql);
					$commoncontent  = $contentA[0]['content'];
				}
			}

			//黄页
			if($value['module'] == "huangye"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__huangyelist` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "huangye", "template" => "detail", "id" => $value['aid']));
			}

			//视频
			if($value['module'] == "video"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__videolist` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "video", "template" => "detail", "id" => $value['aid']));
			}

			//直播
			if($value['module'] == "live"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "live", "template" => "detail", "id" => $value['aid']));
			}

			//汽车
			if($value['module'] == "car"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__car_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "car", "template" => "detail", "id" => $value['aid']));
			}

			//家政
			if($value['module'] == "homemaking"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "homemaking", "template" => "detail", "id" => $value['aid']));
			}

			//商家
			if($value['module'] == "business"){
				$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__business_list` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "business", "template" => "detail", "id" => $value['aid']));
			}

			//圈子动态
			if($value['module'] == "circle"){
				$title = "圈子动态，ID：" . $value['aid'];
				$url = getUrlPath(array("service" => "circle", "template" => "blog_detail", "id" => $value['aid']));
			}

			//IM
			if($value['module'] == "member" && $value['action'] == 'im'){
				$title = "聊天内容举报";
				$url = '/user/' . $value['aid'];
			}

			//装修
			if($value['module'] == "renovation"){

				//公司
				if($value['action'] == 'company-detail'){
					$typeSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);
					if($typename){
						$typename[0]['title'] = $typename[0]['company'];
					}

				}elseif($value['action'] == 'case-detail'){
					$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_diary` WHERE `id` = ". $value['aid']);
					$typename = $dsql->getTypeName($typeSql);

				}
				$title = $typename[0]['title'];
				$url = getUrlPath(array("service" => "renovation", "template" => $value['action'], "id" => $value['aid']));
			}

			//会员
			if($value['module'] == "user"){
				$typeSql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ". $value['aid']);
				$typename = $dsql->getTypeName($typeSql);
				$title = "会员用户：" . $typename[0]['nickname'];
				$url = '/user/' . $value['aid'];
			}

			$list[$key]["title"] = $title;
			$list[$key]["commoncontent"] = $commoncontent;
			$list[$key]["url"] = $url;

			$list[$key]["userid"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["username"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "等待处理";
					break;
				case "1":
					$state = "已经处理";
					break;
			}

			$list[$key]["state"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}, "complainList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
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
		'admin/siteConfig/siteComplain.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
