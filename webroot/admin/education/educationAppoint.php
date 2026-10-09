<?php
/**
 * 管理家教预约信息
 *
 * @version        $Id: educationAppoint.php 2019-07-18 下午20:22:45 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("educationAppoint");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationAppoint.html";

$action = "education_yuyue";

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
		checkeducationYuyueCache($id);
		adminLog("删除教育家教预约信息", $id);
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

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE 1=1".$where1);
	$results = $dsql->dsqlOper($archives, "results");
	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[] = $value["id"];
		}
		$idList = join(",", $list);
		array_push($search, "`tutorid` in ($idList)");
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
			$where .= " AND (`username` like '%$sKeyword%' OR `tel` like '%$sKeyword%')";

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

					$where .= " AND `userid` in ($idList)";

				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
				}
			}
		}
	}


	if(!empty($type)){
		//$where .= " AND `type` = '".$type."'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `username`, `tel`, `tutorid`, `pubdate`, `state` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["tutorid"] = $value["tutorid"];
			$list[$key]["tel"] = $value["tel"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0 || $value["userid"] == -1){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__education_tutor` WHERE `id` = ". $value['tutorid']);
			$res = $dsql->getTypeName($sql);
			$list[$key]["title"] = $res[0]["username"];

			$param = array(
				"service"     => "education",
				"template"    => "tutor-detail",
				"id"       => $value['tutorid']
			);
			$list[$key]["url"] = getUrlPath($param);
			
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "wordList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;
}elseif($dopost == "updateState"){
	if(!testPurview("educationAppoint")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkeducationYuyueCache($id);
			adminLog("更新教育家教预约状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkeducationYuyueCache($id){
	checkCache("education_yuyue_list", $id);
	clearCache("education_yuyue_total", 'key');
	clearCache("education_yuyue_detail", $id);
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
		'admin/education/educationAppoint.js'
	);
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
