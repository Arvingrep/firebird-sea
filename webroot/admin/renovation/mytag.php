<?php
/**
 * 模板标记
 *
 * @version        $Id: mytag.php 2014-5-12 上午09:21:11 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "mytag.html";

$action = "renovation";

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/'.$action.'/mytag.js'
);

checkPurview("mytag".$action);

//预览
if($submit == "预览"){

	$data = array();
	$handler = true;
	$do = "";

	//装修招标
	if($t == "zhaobiao"){
		$do = "zhaobiao";
		if(!empty($addrid))  $data["addrid"]   = $addrid;
		if(!empty($type))  $data["type"]       = $type;
		if(!empty($price))  $data["price"]     = $price;
		if(!empty($nature))  $data["nature"]   = $nature;
		if(!empty($orderby))  $data["orderby"] = $orderby;

	//装修公司
	}elseif($t == "store"){
		$do = "store";
		if(!empty($addrid))  $data["addrid"]     = $addrid;
		if(!empty($jiastyle))  $data["jiastyle"] = $jiastyle;
		if(!empty($comstyle))  $data["comstyle"] = $comstyle;
		if(!empty($style))  $data["style"]       = $style;
		if(!empty($property))  $data["property"] = $property;

	//装修团队
	}elseif($t == "team"){
		$do = "team";
		if(!empty($company))  $data["company"] = $company;
		if(!empty($special))  $data["special"] = $special;
		if(!empty($style))  $data["style"]     = $style;
		if(!empty($works) && $works != ",")  $data["works"]     = $works;

	//设计作品
	}elseif($t == "case"){
		$do = "rcase";
		if(!empty($company))  $data["company"]     = $company;
		if($type != "")  $data["type"]             = $type;
		if($type == 0){
			if(!empty($jiastyle))  $data["jiastyle"]   = $jiastyle;
			if(!empty($area))  $data["style"]          = $style;
		}else{
			if(!empty($comstyle))  $data["comstyle"]   = $comstyle;
		}
		if(!empty($apartment))  $data["apartment"] = $apartment;
		if(!empty($units))  $data["units"]         = $units;
		if(!empty($area) && $area != ",")  $data["area"]           = $area;

	//装修日记
	}elseif($t == "diary"){
		$do = "diary";
		if(!empty($company))  $data["company"] = $company;
		if(!empty($btype))  $data["btype"]     = $btype;
		if(!empty($units))  $data["units"]     = $units;
		if(!empty($stage))  $data["stage"]     = $stage;

	//装修大学
	}elseif($t == "news"){
		$do = "news";
		if(!empty($typeid))  $data["typeid"] = $typeid;
	}

	$handels = new handlers($action, $do);
	$return = $handels->getHandle($data);
	echo json_encode($return);
	die;
}

if($dopost == "getList"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " WHERE `module` = '".$action."'";

	if($sKeyword != ""){
		$where .= " AND `name` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `type` = '".$sType."'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__mytag`".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//暂停
	$totalPause = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
	//正常
	$totalNormal = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `name`, `module`, `type`, `start`, `end`, `state`, `pubdate` FROM `#@__mytag`".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]      = $value["id"];
			$list[$key]["name"]    = $value["name"];
			$list[$key]["module"]  = $value["module"];
			$list[$key]["type"]    = $value["type"];
			$list[$key]["start"]   = !empty($value["start"]) ? date('Y-m-d', $value["start"]) : "";
			$list[$key]["end"]     = !empty($value["end"]) ? date('Y-m-d', $value["end"]) : "";
			$list[$key]["state"]   = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}, "mytag": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
	}
	die;

//新增标记
}elseif($dopost == "save"){
	checkPurview("add".$action."Mytag");

	if($submit == "提交"){
		if($token == "") die('{"state": 200, "info": "token传递失败！"}');

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;
		$data = serialize($data);
		$name = $_POST['name'];

		$do = $type;
		//装修招标
		if($type == "zhaobiao"){
			$do = "zhaobiao";

		//装修公司
		}elseif($type == "store"){
			$do = "store";

		//装修团队
		}elseif($type == "team"){
			$do = "team";

		//设计作品
		}elseif($type == "case"){
			$do = "rcase";

		//装修日记
		}elseif($type == "diary"){
			$do = "diary";

		//装修大学
		}elseif($type == "news"){
			$do = "news";
		}

		$archives = $dsql->SetQuery("INSERT INTO `#@__mytag` (`name`, `type`, `module`, `start`, `end`, `config`, `expbody`, `state`, `pubdate`) VALUES ('$name', '$do', '$action', '$start', '$end', '$data', '$expbody', '$state', '".GetMkTime(time())."')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("生成模板标签", $action . " => " . $name);
			echo '{"state": 100, "info": "生成成功！"}';
		}else{
			echo '{"state": 200, "info": "保存失败！"}';
		}

		die;
	}


	$templates = "mytagAdd.html";
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'admin/'.$action.'/mytagAdd.js'
	);

	$huoniaoTag->assign('addrid', 0);
	$huoniaoTag->assign('newstypeid', 0);
	$huoniaoTag->assign('dopost', "save");
	$huoniaoTag->assign('state', 1);



//修改标记
}elseif($dopost == "edit"){
	checkPurview("edit".$action."Mytag");
	$templates = "mytagAdd.html";
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'admin/'.$action.'/mytagAdd.js'
	);

	$huoniaoTag->assign("dopost", "edit");

	if($submit == "提交"){
		if(empty($token)) die('{"state": 200, "info": "token传递失败！"}');
		if(empty($id)) die('{"state": 200, "info": "要修改的信息ID传递失败！"}');

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;

		$data = serialize($data);
		$name = $_POST['name'];

		$do = $type;
		//装修招标
		if($type == "zhaobiao"){
			$do = "zhaobiao";

		//装修公司
		}elseif($type == "store"){
			$do = "renovationStore";

		//装修团队
		}elseif($type == "team"){
			$do = "renovationTeam";

		//设计作品
		}elseif($type == "case"){
			$do = "renovationCase";

		//装修日记
		}elseif($type == "diary"){
			$do = "renovationDiary";

		//装修大学
		}elseif($type == "news"){
			$do = "renovationNews";
		}

		$archives = $dsql->SetQuery("UPDATE `#@__mytag` SET `name` = '$name', `type` = '$do', `start` = '$start', `end` = '$end', `config` = '$data', `expbody` = '$expbody', `state` = '$state' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改模板标签", $action . " => " . $name);
			echo '{"state": 100, "info": "修改成功！"}';
		}else{
			echo '{"state": 200, "info": "修改失败！"}';
		}

		die;
	}

	if(empty($id)) die('要修改的信息ID传递失败！');
	$archives = $dsql->SetQuery("SELECT * FROM `#@__mytag` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){
		$name     = $results[0]['name'];
		$type_    = $results[0]['type'];
		$start    = $results[0]['start'];
		$end      = $results[0]['end'];
		$config   = unserialize($results[0]['config']);
		$expbody  = $results[0]['expbody'];
		$state    = $results[0]['state'];

		$huoniaoTag->assign("id", $id);
		$huoniaoTag->assign("name", $name);
		$huoniaoTag->assign("type", $type_);
		$huoniaoTag->assign("start", !empty($start) ? date("Y-m-d", $start) : "");
		$huoniaoTag->assign("end", !empty($end) ? date("Y-m-d", $end) : "");
		$huoniaoTag->assign("expbody", $expbody);
		$huoniaoTag->assign("state", $state);
		$huoniaoTag->assign('addrid', 0);
		$huoniaoTag->assign('newstypeid', 0);
		$store = "";

		if(!empty($config)){
			foreach($config as $key => $val){
				if($key == "works" || $key == "area"){
					$v = explode(",", $val);
					$obj = $type_.$key;
					$huoniaoTag->assign($obj."1", $v[0]);
					$huoniaoTag->assign($obj."2", $v[1]);
				}elseif($key == "property"){
					$huoniaoTag->assign($type_.$key, explode(",", $val));
				}else{
					$obj = $type_.$key;
					if($key == "addrid" || $key == "newstypeid"){
						$obj = $key;
					}
					$huoniaoTag->assign($obj, $val);
					$$obj = $val;
				}
			}
		}

	}else{
		die('信息不存在或已删除！');
	}


//删除标记
}elseif($dopost == "del"){
	checkPurview("del".$action."Mytag");

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__mytag` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除模板标签", $action ." => ". $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}

	die;

//更新状态
}elseif($dopost == "updateState"){
	checkPurview("edit".$action."Mytag");

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__mytag` SET `state` = $state WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新模板标签状态", $action ." => ". $state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}

	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){


	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('module', $action);
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "renovationaddr")));
	$huoniaoTag->assign('newsListArr', json_encode($dsql->getTypeList(0, $action."_newstype")));

	//栏目
	$huoniaoTag->assign('typeList', array('zhaobiao' => '装修招标', 'store' => '装修公司', 'team' => '装修团队', 'case' => '设计作品', 'diary' => '装修日记', 'news' => '装修大学'));

	//公司Array
	$storeOption = array(0 => "不限");
	$archives = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__".$action."_store` ORDER BY `weight`");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$storeOption[$val['id']] = $val["company"];
		}
	}
	$huoniaoTag->assign('storeOption', $storeOption);

	/* 装修招标 start */
		//类型
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 7 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$btypeopt = $btypenames = array();
		foreach($results as $value){
			array_push($btypeopt, $value['id']);
			array_push($btypenames, $value['typename']);
		}
		$huoniaoTag->assign('typeopt', $btypeopt);
		$huoniaoTag->assign('typenames', $btypenames);
		$huoniaoTag->assign('zhaobiaotype', $zhaobiaotype == "" ? $btypeopt[0] : $zhaobiaotype);

		//预算
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 6 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$priceArr = array(0 => "不限");
		foreach($results as $value){
			$priceArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('priceList', $priceArr);
		$huoniaoTag->assign('zhaobiaoprice', $zhaobiaoprice);

		//性质
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 1 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$natureArr = array(0 => "不限");
		foreach($results as $value){
			$natureArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('zhaobiaonatureList', $natureArr);
		$huoniaoTag->assign('zhaobiaonature', $zhaobiaonature);

		//排序
		$huoniaoTag->assign('zhaobiaoorderbyList', array(0 => '默认排序', 1 => '预算升序', 2 => '预算降序', 3 => '时间降序', 4 => '人气降序'));
		$huoniaoTag->assign('zhaobiaoorderby', $zhaobiaoorderby);


	/* 装修招标 end */

	/* 装修公司 start */
		//家装
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 2 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$styleArr = array(0 => "不限");
		foreach($results as $value){
			$styleArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('jiastyleList', $styleArr);
		$huoniaoTag->assign('storejiastyle', $storejiastyle);

		//公装
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 3 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$styleArr = array(0 => "不限");
		foreach($results as $value){
			$styleArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('comstyleList', $styleArr);
		$huoniaoTag->assign('storecomstyle', $storecomstyle);

		//风格
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 4 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$styleArr = array(0 => "不限");
		foreach($results as $value){
			$styleArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('styleList', $styleArr);
		$huoniaoTag->assign('storestyle', $storestyle);

		//推荐
		$huoniaoTag->assign('storepropertyopt',array('1'));
		$huoniaoTag->assign('storepropertyList',array('推荐'));

	/* 装修公司 end */

	/* 装修团队 start */
		//专长
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 5 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$styleArr = array(0 => "不限");
		foreach($results as $value){
			$styleArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('teamspecialList', $styleArr);
		$huoniaoTag->assign('teamspecial', $teamspecial);

	/* 装修团队 start */

	/* 装修案例 start */
		//类别
		$huoniaoTag->assign('casetypeopt', array('0', '1'));
		$huoniaoTag->assign('casetypenames',array('家装','公装'));
		$huoniaoTag->assign('casetype', $casetype == "" ? 0 : $casetype);

		//户型
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 8 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$unitsArr = array(0 => "不限");
		foreach($results as $value){
			$unitsArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('unitsList', $unitsArr);
		$huoniaoTag->assign('caseunits', $caseunits);

	/* 装修案例 end */

	/* 装修案例 start */
		//类别
		$huoniaoTag->assign('diarytypeopt', array('0', '1'));
		$huoniaoTag->assign('diarytypenames',array('全包','半包'));
		$huoniaoTag->assign('diarytype', $diarytype == "" ? 0 : $diarytype);

		//装修阶段
		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 9 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$stageArr = array(0 => "不限");
		foreach($results as $value){
			$stageArr[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('stageList', $stageArr);
		$huoniaoTag->assign('diarystage', $diarystage);

	/* 装修案例 end */

	/* 装修日记 start */
		$huoniaoTag->assign('diarytype', $diarytype == "" ? $btypeopt[0] : $diarytype);

	/* 装修日记 end */

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('暂停','正常'));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
