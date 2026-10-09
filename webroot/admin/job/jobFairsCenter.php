<?php
/**
 * 管理招聘会场
 *
 * @version        $Id: jobFairsCenter.php 2015-3-16 上午10:09:21 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobFairsCenter");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "job_fairs_center";
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
if($dopost != ""){
	$templates = "jobFairsCenterAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/job/jobFairsCenterAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "jobFairsCenter.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobFairsCenter.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate     = GetMkTime(time());       //发布时间

	//二次验证
	if(empty($title)){
		echo '{"state": 101, "info": "请输入会场名称！"}';
		exit();
	}

	if(empty($addr)){
		echo '{"state": 101, "info": "请选择所在区域！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 101, "info": "请输入详细地址！"}';
		exit();
	}

}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `people` like '%$sKeyword%')";
	}

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "site_area")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "site_area"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addr` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `people`, `mobile`, `tel`, `addr`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["people"] = $value["people"];
			$list[$key]["mobile"] = $value["mobile"];
			$list[$key]["tel"]    = $value["tel"];

			//地区
			$list[$key]["addrid"] = $value["addr"];
            $addrname = $value['addr'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addr"] = $addrname;

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"param"    => "center=".$value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "jobFairsCenter": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//新增
}elseif($dopost == "Add"){
	if(!testPurview("jobFairsCenterAdd")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$pagetitle = "新增招聘会场";

	//表单提交
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `people`, `mobile`, `tel`, `fax`, `addr`, `address`, `lnglat`, `email`, `qq`, `note`, `traffic`, `pics`, `pubdate`, `seat_picture`) VALUES ('$cityid', '$title', '$people', '$mobile', '$tel', '$fax', '$addr', '$address', '$lnglat', '$email', '$qq', '$note', '$traffic', '$pics', '".GetMkTime(time())."','$seat_picture')");
		$id = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($id)){

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"param"    => "center=".$id
			);
			$url = getUrlPath($param);

			// 清除缓存
			clearCache("job_fairs_center_total", "key");

			adminLog("新增招聘会场", $title);
			echo '{"state": 100, "url": "'.$url.'", "info": '.json_encode("添加成功！").'}';
		}else{
			echo $id;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){
	if(!testPurview("jobFairsCenterEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$pagetitle = "修改招聘会场信息";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `people` = '$people', `mobile` = '$mobile', `tel` = '$tel', `fax` = '$fax', `addr` = '$addr', `address` = '$address', `lnglat` = '$lnglat', `email` = '$email', `qq` = '$qq', `note` = '$note', `traffic` = '$traffic', `pics` = '$pics',`seat_picture`='$seat_picture' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"param"    => "center=".$id
			);
			$url = getUrlPath($param);

			// 清除缓存
			clearCache("job_fairs_center_detail", $id);

			adminLog("修改招聘会场信息", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").', "url": "'.$url.'"}';
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

				$title   = $results[0]['title'];
				$people  = $results[0]['people'];
				$mobile  = $results[0]['mobile'];
				$tel     = $results[0]['tel'];
				$fax     = $results[0]['fax'];
				$addr    = $results[0]['addr'];
				$address = $results[0]['address'];
				$lnglat  = $results[0]['lnglat'];
				$email   = $results[0]['email'];
				$qq      = $results[0]['qq'];
				$note    = $results[0]['note'];
                $seat_picture  = $results[0]['seat_picture'];
				$traffic = $results[0]['traffic'];
				$pics    = $results[0]['pics'];
                $cityid       = $results[0]['cityid'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobFairsCenterDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);

			//删除图集
			$pics = $results[0]['pics'];
			if(!empty($pics)){
				$pics = explode("###", $pics);
				foreach ($pics as $key => $value) {
					$pic = explode("||", $value);
					if(!empty($pic[0])){
						delPicFile($pic[0], "delAtlas", "job");
					}
				}
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				checkCache("job_fairs_center_detail", $val);
			}

			//删除招聘会
			$archives = $dsql->SetQuery("DELETE FROM `#@__job_fairs` WHERE `fid` = ".$val);
			$dsql->dsqlOper($archives, "update");
		}
		clearCache("job_fairs_center_total", "key");

		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘会场", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/job.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('mapCity', $cfg_mapCity);

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('people', $people);
		$huoniaoTag->assign('mobile', $mobile);
		$huoniaoTag->assign('tel', $tel);
		$huoniaoTag->assign('fax', $fax);
		$huoniaoTag->assign('addr', (int)$addr);
		$huoniaoTag->assign('address', $address);
        $huoniaoTag->assign('cityid', $cityid);
        $huoniaoTag->assign('seat_picture', $seat_picture);
		$huoniaoTag->assign('lnglat', $lnglat);
		$huoniaoTag->assign('email', $email);
		$huoniaoTag->assign('qq', $qq);
		$huoniaoTag->assign('note', $note);
		$huoniaoTag->assign('traffic', $traffic);

		$huoniaoTag->assign('picsList', '[]');
		if(!empty($pics)){
			$picsArr = array();
			$pics = explode("###", $pics);
			foreach ($pics as $key => $value) {
				$val = explode("||", $value);
				$picsArr[$key] = $val;
			}
			$huoniaoTag->assign('picsList', json_encode($picsArr));
		}
	}

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
