<?php
/**
 * 模板标记
 *
 * @version        $Id: mytag.php 2014-5-7 下午17:53:12 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "mytag.html";

$action = "house";

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

	//楼盘
	if($t == "loupan"){
		$do = "loupanList";
		if(!empty($addrid))  $data["addrid"]   = $addrid;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($typeid))  $data["typeid"]   = $typeid;
		if(!empty($orderby))  $data["orderby"] = $orderby;

	//楼盘房源
	}elseif($t == "listing"){
		$do = "listingList";
		if(!empty($addrid))  $data["addrid"]   = $addrid;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($room))  $data["room"]       = $room;
		if(!empty($orderby))  $data["orderby"] = $orderby;

	//小区
	}elseif($t == "community"){
		$do = "communityList";
		if(!empty($addrid))  $data["addrid"]   = $addrid;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($typeid))  $data["typeid"]   = $typeid;
		if(!empty($orderby))  $data["orderby"] = $orderby;

	//二手房
	}elseif($t == "sale"){
		$do = "saleList";
		if(!empty($addrid))  $data["addrid"]   = $addrid;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($room))  $data["room"]       = $room;
		if(!empty($area) && $area != ",")  $data["area"] = $area;
		if(!empty($buildage) && $buildage != ",")  $data["buildage"] = $buildage;
		if(!empty($protype))  $data["protype"] = $protype;
		if(!empty($floor) && $floor != ",")  $data["floor"] = $floor;
		if(!empty($type))  $data["type"]       = $type;
		if(!empty($orderby))  $data["orderby"] = $orderby;

	//出租房
	}elseif($t == "zu"){
		$do = "zuList";
		if(!empty($addrid))  $data["addrid"]       = $addrid;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($room))  $data["room"]           = $room;
		if(!empty($protype))  $data["protype"]     = $protype;
		if(!empty($zhuangxiu))  $data["zhuangxiu"] = $zhuangxiu;
		if(!empty($rentype))  $data["rentype"]     = $rentype;
		if(!empty($type))  $data["type"]           = $type;
		if(!empty($orderby))  $data["orderby"]     = $orderby;

	//写字楼
	}elseif($t == "xzl"){
		$do = "xzlList";
		if(!empty($addrid))  $data["addrid"]       = $addrid;
		$data["type"] = $type;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($area) && $area != ",")  $data["area"] = $area;
		if(!empty($orderby))  $data["orderby"]     = $orderby;

	//商铺
	}elseif($t == "sp"){
		$do = "spList";
		if(!empty($addrid))  $data["addrid"]       = $addrid;
		$data["type"] = $type;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($area) && $area != ",")  $data["area"] = $area;
		if(!empty($orderby))  $data["orderby"]     = $orderby;

	//厂房/仓库
	}elseif($t == "cf"){
		$do = "cfList";
		if(!empty($addrid))  $data["addrid"]       = $addrid;
		$data["type"] = $type;
		if(!empty($price) && $price != ",")  $data["price"] = $price;
		if(!empty($area) && $area != ",")  $data["area"] = $area;
		if(!empty($orderby))  $data["orderby"]     = $orderby;

	//资讯
	}elseif($t == "houseNews"){
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
		$name = $_POST['name'];

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;
		$data = serialize($data);

		$do = $type;
		//楼盘
		if($type == "loupan"){
			$do = "loupanList";

		//楼盘房源
		}elseif($type == "listing"){
			$do = "listingList";

		//小区
		}elseif($type == "community"){
			$do = "communityList";

		//二手房
		}elseif($type == "sale"){
			$do = "saleList";

		//出租房
		}elseif($type == "zu"){
			$do = "zuList";

		//写字楼
		}elseif($type == "xzl"){
			$do = "xzlList";

		//商铺
		}elseif($type == "sp"){
			$do = "spList";

		//厂房/仓库
		}elseif($type == "cf"){
			$do = "cfList";

		//资讯
		}elseif($type == "houseNews"){
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
	$huoniaoTag->assign('dopost', "save");
	$huoniaoTag->assign('item', '[]');
	$huoniaoTag->assign('saletype', 0);
	$huoniaoTag->assign('zutype', 0);
	$huoniaoTag->assign('zurentype', 0);
	$huoniaoTag->assign('xzltype', 0);
	$huoniaoTag->assign('sptype', 0);
	$huoniaoTag->assign('cftype', 0);
	$huoniaoTag->assign('houseNewstypeid', 0);
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
		$name = $_POST['name'];

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;

		$data = serialize($data);

		$do = $type;
		//楼盘
		if($type == "loupan"){
			$do = "loupanList";

		//楼盘房源
		}elseif($type == "listing"){
			$do = "listingList";

		//小区
		}elseif($type == "community"){
			$do = "communityList";

		//二手房
		}elseif($type == "sale"){
			$do = "saleList";

		//出租房
		}elseif($type == "zu"){
			$do = "zuList";

		//写字楼
		}elseif($type == "xzl"){
			$do = "xzlList";

		//商铺
		}elseif($type == "sp"){
			$do = "spList";

		//厂房/仓库
		}elseif($type == "cf"){
			$do = "cfList";

		//资讯
		}elseif($type == "houseNews"){
			$do = "houseNews";
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
		$type     = $results[0]['type'];
		$start    = $results[0]['start'];
		$end      = $results[0]['end'];
		$config   = unserialize($results[0]['config']);
		$expbody  = $results[0]['expbody'];
		$state    = $results[0]['state'];

		$huoniaoTag->assign("id", $id);
		$huoniaoTag->assign("name", $name);
		$huoniaoTag->assign("type", $type);
		$huoniaoTag->assign("start", !empty($start) ? date("Y-m-d", $start) : "");
		$huoniaoTag->assign("end", !empty($end) ? date("Y-m-d", $end) : "");
		$huoniaoTag->assign("expbody", $expbody);
		$huoniaoTag->assign("state", $state);

		$huoniaoTag->assign('addrid', 0);
		$huoniaoTag->assign('salenature', 0);
		$huoniaoTag->assign('zunature', 0);
		$huoniaoTag->assign('zurentype', 0);
		$huoniaoTag->assign('xzltype', 0);
		$huoniaoTag->assign('sptype', 0);
		$huoniaoTag->assign('cftype', 0);
		$huoniaoTag->assign('houseNewstypeid', 0);

		if(!empty($config)){
			foreach($config as $key => $val){
				if(strpos($val, ",") !== false){
					$v = explode(",", $val);
					$obj = $type.$key;
					$huoniaoTag->assign($obj."1", $v[0]);
					$huoniaoTag->assign($obj."2", $v[1]);
				}else{
					$obj = $key == "addrid" ? $key : $type.$key;
					$huoniaoTag->assign($obj, $val);
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
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, $action."addr")));
	$huoniaoTag->assign('newsListArr', json_encode($dsql->getTypeList(0, $action."_newstype")));

	//栏目
	$huoniaoTag->assign('typeList', array('loupan' => '楼盘', 'listing' => '楼盘房源', 'community' => '小区', 'sale' => '二手房', 'zu' => '出租房', 'xzl' => '写字楼', 'sp' => '商铺', 'cf' => '厂房/仓库', 'houseNews' => '资讯'));

	/* 楼盘 start */
		//物业类型
		$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$list = array(0 => '请选择');
		foreach($results as $value){
			$list[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('protypeList', $list);

		//排序
		$huoniaoTag->assign('loupanorderbyList', array(0 => '默认排序', 1 => '价格由低到高', 2 => '价格由高到低', 3 => '开盘时间降序', 4 => '开盘时间升序'));
	/* 楼盘 end */

	/* 楼盘户型 start */
		//户型
		$huoniaoTag->assign('roomList', array("" => '不限', 1 => '一室', 2 => '二室', 3 => '三室', 4 => '四室', 5 => '五室', 0 => '五室以上'));

		//排序
		$huoniaoTag->assign('listingorderbyList', array(0 => '默认排序', 1 => '价格由低到高', 2 => '价格由高到低', 3 => '发布时间降序', 4 => '发布时间升序'));
	/* 楼盘户型 end */

	/* 小区 start */
		//排序
		$huoniaoTag->assign('communityorderbyList', array(0 => '默认排序', 1 => '价格由低到高', 2 => '价格由高到低', 3 => '竣工时间降序', 4 => '竣工时间升序'));
	/* 小区 end */

	/* 二手房 start */
		//性质
		$huoniaoTag->assign('natureopt', array('0', '1', '2'));
		$huoniaoTag->assign('naturenames',array('全部','个人', '中介'));

		//排序
		$huoniaoTag->assign('saleorderbyList', array(0 => '默认排序', 1 => '发布时间降序', 2 => '面积降序', 3 => '面积升序', 4 => '价格升序', 4 => '价格降序'));

	/* 二手房 end */

	/* 租房 start */
		//装修情况
		$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$list = array(0 => '请选择');
		foreach($results as $value){
			$list[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('zhuangxiuList', $list);

		//出租方式
		$huoniaoTag->assign('zurentypeopt', array('0', '1', '2'));
		$huoniaoTag->assign('zurentypenames',array('全部','整租', '合租'));

		//排序
		$huoniaoTag->assign('zuorderbyList', array(0 => '默认排序', 1 => '发布时间降序', 2 => '价格升序', 3 => '价格降序'));

	/* 租房 end */

	/* 写字楼 start */
		//供求
		$huoniaoTag->assign('xzldemandopt', array('0', '1'));
		$huoniaoTag->assign('xzldemandnames',array('出租','出售'));

		//排序
		$huoniaoTag->assign('xzlorderbyList', array(0 => '默认排序', 1 => '发布时间降序', 2 => '面积降序', 3 => '面积升序', 4 => '价格升序', 5 => '价格降序'));

	/* 写字楼 end */

	/* 商铺 start */
		//供求
		$huoniaoTag->assign('spdemandopt', array('0', '1'));
		$huoniaoTag->assign('spdemandnames',array('商铺租售','商铺转让'));

	/* 商铺 end */

	/* 厂房/仓库 start */
		//供求
		$huoniaoTag->assign('cfdemandopt', array('0', '1', '2'));
		$huoniaoTag->assign('cfdemandnames',array('出租','转让', '出售'));

	/* 厂房/仓库 end */

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('暂停','正常'));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
