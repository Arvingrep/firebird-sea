<?php
/**
 * 求租/求购管理
 *
 * @version        $Id: houseDemand.php 2014-1-8 上午10:43:10 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseDemand");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "管理求租/求购";

$tab = 'housedemand';

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if($dopost != ""){
	$templates = "houseDemandAdd.html";

	//js
	$jsFile = array(
		'ui/chosen.jquery.min.js',
		'publicAddr.js',
		'admin/house/houseDemandAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "houseDemand.html";

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/house/houseDemand.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());     //发布时间
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

  $where =  getCityFilter('`cityid`');
  if ($cityid){
      $where .= getWrongCityFilter('`cityid`', $cityid);
  }

	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `person` like '%$sKeyword%' OR `contact` like '%$sKeyword%')";
	}

	if($sAction != ""){
		$where .= " AND `action` = $sAction";
	}

	if($sType != ""){
		$where .= " AND `type` = $sType";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	// if($sAddr != ""){
	// 	if($dsql->getTypeList($sAddr, "houseaddr")){
	// 		$lower = arr_foreach($dsql->getTypeList($sAddr, "houseaddr"));
	// 		$lower = $sAddr.",".join(',',$lower);
	// 	}else{
	// 		$lower = $sAddr;
	// 	}
	// 	$where .= " AND `addr` in ($lower)";
	// }

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

		if ($state == 0) {
            $totalPage = ceil($totalGray / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($totalAudit / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($totalRefuse / $pagestep);
        }
	}

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `action`, `type`, `addr`, `person`, `areaCode`, `contact`, `weight`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["action"] = $value["action"];
			$list[$key]["type"] = $value["type"];

      //地区
      $addrname = $value['addr'];
      if($addrname){
          $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
      }
      $list[$key]["addr"] = $addrname;

			$list[$key]["person"] = $value["person"];
			$list[$key]["areaCode"] = $value["areaCode"] == '86' ? '' : $value["areaCode"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["weight"] = $value["weight"];

			$list[$key]["state"] = $value["state"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "houseDemandList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){
	checkPurview("houseDemandAdd");
	$pagetitle     = "新增求租/求购";

	//表单提交
	if($submit == "提交"){

		if(empty($cityid)) $cityid = 0;

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}
		if(trim($note) == ''){
			echo '{"state": 200, "info": "需求不能为空"}';
			exit();
		}
		if(empty($addrid)){
			echo '{"state": 200, "info": "请选择区域"}';
			exit();
		}
		if(trim($person) == ''){
			echo '{"state": 200, "info": "联系人不能为空"}';
			exit();
		}
		if(trim($contact) == ''){
			echo '{"state": 200, "info": "电话不能为空"}';
			exit();
		}
		if(trim($password) == ''){
			echo '{"state": 200, "info": "管理密码不能为空"}';
			exit();
		}

    if(empty($cityid)){
      $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
      $cityInfoArr = explode(',', $cityInfoArr);
      $cityid = $cityInfoArr[0];
    }

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `note`, `action`, `type`, `addr`, `person`, `areaCode`, `contact`, `weight`, `password`, `state`, `pubdate`) VALUES ('$cityid', '$title', '$note', '$action', '$type', '$addrid', '$person', '$areaCode', '$contact', '$weight', '$password', '$state', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增求租/求购", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){
	checkPurview("houseDemandEdit");
	$pagetitle = "修改求租/求购";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		if(empty($cityid)) $cityid = 0;

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}
		if(trim($note) == ''){
			echo '{"state": 200, "info": "需求不能为空"}';
			exit();
		}
		if(empty($addrid)){
			echo '{"state": 200, "info": "请选择区域"}';
			exit();
		}
		if(trim($person) == ''){
			echo '{"state": 200, "info": "联系人不能为空"}';
			exit();
		}
		if(trim($contact) == ''){
			echo '{"state": 200, "info": "电话不能为空"}';
			exit();
		}
		if(trim($password) == ''){
			echo '{"state": 200, "info": "管理密码不能为空"}';
			exit();
		}

    if(empty($cityid)){
      $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
      $cityInfoArr = explode(',', $cityInfoArr);
      $cityid = $cityInfoArr[0];
    }

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `note` = '$note', `action` = '$action', `type` = '$type', `addr` = '$addrid', `person` = '$person', `areaCode` = '$areaCode', `contact` = '$contact', `weight` = '$weight', `state` = '$state', `password` = '$password' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改求租/求购", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
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

				$cityid    = $results[0]['cityid'];
				$title     = $results[0]['title'];
				$note      = $results[0]['note'];
				$action      = $results[0]['action'];
				$type      = $results[0]['type'];
				$addr      = $results[0]['addr'];
				$person    = $results[0]['person'];
				$areaCode  = $results[0]['areaCode'];
				$contact   = $results[0]['contact'];
				$weight    = $results[0]['weight'];
				$state     = $results[0]['state'];
				$password  = $results[0]['password'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	checkPurview("houseDemandDel");
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除求租/求购", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("houseDemandEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新求租/求购信息状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->assign('notice', $notice);

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('cityid', $cityid);
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('note', $note);
		$huoniaoTag->assign('password', $password);

		$huoniaoTag->assign('actionList', array('1', '2', '3', '4', '5', '6', '7'));
		$huoniaoTag->assign('actionName',array('新房', '二手房', '出租房', '写字楼', '商铺', '厂房/仓库', '车位'));
		$huoniaoTag->assign('action', $action == "" ? 1 : $action);

		$huoniaoTag->assign('typeList', array('0', '1'));
		$huoniaoTag->assign('typeName',array('求租','求购'));
		$huoniaoTag->assign('type', $type == "" ? 0 : $type);

		$huoniaoTag->assign('addr', $addr == "" ? 0 : $addr);
		$huoniaoTag->assign('person', $person);
		$huoniaoTag->assign('areaCode', $areaCode);
		$huoniaoTag->assign('contact', $contact);
		$huoniaoTag->assign('weight', $weight == "" ? 1 : $weight);

		//阅读权限-单选
		$huoniaoTag->assign('stateList', array('0', '1', '2'));
		$huoniaoTag->assign('stateName',array('待审核','已审核','拒绝审核'));
		$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
