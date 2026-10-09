<?php
/**
 * 管理房产预约信息
 *
 * @version        $Id: houseAppoint.php 2019-01-14 下午20:22:45 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseAppoint");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseAppoint.html";

$action = "house_yuyue";

//删除预约
if($dopost == "delAppoint"){
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
		adminLog("删除房产预约信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取预约列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where1 = getCityFilter('`cityid`');

    if ($cityid) {
        $where1 .= getWrongCityFilter('`cityid`', $cityid);
	}

	$search = array();

	//二手房
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}

	//租房
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}

	//写字楼
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_xzl` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}

	//商铺
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_sp` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}

	//车位
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_cw` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}

	//厂房
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_cf` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`aid` in ($idList)");
	}
	if(!empty($search)){
		$where = " AND (" . join(" OR ", $search) . ")";
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
	}

	if($state!=''){
		$where .= " and `state` = '$state'";
	}
	

	if($sKeyword != ""){
		//按内容搜索
		if($sType == "1"){
			$where .= " AND (`title` like '%$sKeyword%' OR `username` like '%$sKeyword%' OR `mobile` like '%$sKeyword%'  OR `note` like '%$sKeyword%')";

		//按预约人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND (`userid` = 0 OR `userid` = -1)";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
				$results = $dsql->dsqlOper($archives, "results");

				if(count($results) > 0){
					$list = array();
					foreach ($results as $key=>$value) {
						$list[] = $value["id"];
					}
					$idList = join(",", $list);

					$where .= " AND `uid` in ($idList)";

				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
				}
			}
		}
	}


	if(!empty($type)){
		$where .= " AND `type` = '".$type."'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `type`, `aid`, `title`, `uid`, `date`, `note`, `username`, `mobile`, `sex`, `state`, `pubdate`, `del1`, `del2` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["note"] = $value["note"];
			$list[$key]["username"] = $value["username"];
			$list[$key]["mobile"] = $value["mobile"];
			$list[$key]["sex"] = $value["sex"] == 1 ? '男' : '女';
			//$list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);

			if(!empty($value['date'])){
				$date = $value['date'];
				$date = explode(":", $date);
				switch($date[0]){
					case 1:
						$day = "工作日";
						break;
					case 2:
						$day = "工作日/双休日均可";
						break;
					default :
						$day = "双休日";
				}
				switch($date[1]){
					case 1:
						$time = "下午";
						break;
					case 2:
						$time = "晚上";
						break;
					case 3:
						$time = "随时";
						break;
					default :
						$time = "上午";
				}
				$list[$key]['date'] = $day." ".$time;
			}else{
				$list[$key]['date'] = '';
			}

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);


			$state = "";
			switch($value["state"]){
				case "1":
					$state = "已看房";
					break;
				case "0":
					$state = "<font color='#ff0000'>未看房</font>";
					break;
			}
			$list[$key]["state"] = $state;

			$del1 = "";
			switch($value["del1"]){
				case "1":
					$del1 = "已删除";
					break;
				case "0":
					$del1 = "<font color='#ff0000'>未删除</font>";
					break;
			}
			$list[$key]["del1"] = $del1;

			$del2 = "";
			switch($value["del2"]){
				case "1":
					$del2 = "已删除";
					break;
				case "0":
					$del2 = "<font color='#ff0000'>未删除</font>";
					break;
			}
			$list[$key]["del2"] = $del2;

			$typename = '';
			$template = '';
			switch($value["type"]){
				case 'sale':
					$typename = '二手房';
					$template = 'sale-detail';
					break;
				case 'zu':
					$typename = '租房';
					$template = 'zu-detail';
					break;
				case 'xzl':
					$typename = '写字楼';
					$template = 'xzl-detail';
					break;
				case 'sp':
					$typename = '商铺';
					$template = 'sp-detail';
					break;
				case 'cw':
					$typename = '车位';
					$template = 'cw-detail';
					break;
				case 'cf':
					$typename = '厂房/厂库';
					$template = 'cf-detail';
					break;
			}
			$list[$key]["typename"] = $typename;

			$param = array(
				"service"     => "house",
				"template"    => $template,
				"id"       => $value['aid']
			);
			$list[$key]["url"] = getUrlPath($param);

			$list[$key]["uid"] = $value["uid"];
			//$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["uid"]);
			//$username = $dsql->dsqlOper($member, "results");
			//$list[$key]["username"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];
			
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "bookingList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
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
		'admin/house/houseAppoint.js'
	);
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
