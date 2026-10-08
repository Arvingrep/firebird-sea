<?php
/**
 * 修改探店信息
 *
 * @version        $Id: discoveryAdd.php 2017-3-24 上午10:04:10 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "discoveryAdd.html";

if($dopost == "edit"){
	checkPurview("editdiscovery");
}else{
	checkPurview("adddiscovery");
}

global $handler;
$handler = true;

$action     = "business";
$pagetitle  = "修改探店信息";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

$adminid = $userLogin->getUserID();


//模糊匹配商家
if($dopost == "checkStore"){

	$key = $_POST['key'];
	if(!empty($key)){

		$business = new business(array("title" => $key, "pageSize" => 10));
		$res = $business->blist();
		if(isset($res['list'])){
			$list = $res['list'];
		}else{
			$list = array();
		}
		echo json_encode($list);
	}
	die;

// 所有商家
} elseif ($dopost == "getAllStore"){
	$page = (int)$page;
	$pageSize = (int)$pageSize;
	$page = $page ? $page : 1;
	$pageSize = $pageSize ? $pageSize : 10;
	$atpage = ($page - 1) * $pageSize;
	$now = time();
	$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__business_list` WHERE `state` = 1 AND `title` != '' AND (`expired` = 0 || `expired` > ".$now.") LIMIT $atpage, $pageSize");
	$res = $dsql->dsqlOper($sql, "results");
	echo json_encode($res);
	die;

//选择来源、作者
} elseif ($dopost == "chooseData") {
    if ($type != "") {
        $m_file = HUONIAODATA . "/admin/" . $type . ".txt";
        $list = array();
        if (filesize($m_file) > 0) {
            $fp = fopen($m_file, 'r');
            $str = fread($fp, filesize($m_file));
            fclose($fp);
            $strs = explode(',', $str);
            foreach ($strs as $str) {
                $str = trim($str);
                if ($str != "") {
                    array_push($list, $str);
                }
            }
        }
        echo json_encode($list);
    }

    die;

//保存来源、作者
} elseif ($dopost == "saveChooseData") {
    if ($type != "") {
        $m_file = HUONIAODATA . "/admin/" . $type . ".txt";
        adminLog("更新" . $type . "信息", $type . ".txt");

        $fp = fopen($m_file, "w") or die("写入文件 $m_file 失败，请检查权限！");
        fwrite($fp, $val);
        fclose($fp);
    }
    die;
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');

	$id = (int)$id;
	$uid = $adminid;
	$state = (int)$state;
	$weight = (int)$weight;

	if($title == ''){
		echo '{"state": 200, "info": "请输入信息标题"}';
		exit();
	}

	if(trim($litpic) == ''){
		echo '{"state": 200, "info": "请上传缩略图"}';
		exit();
	}

	if(trim($body) == ''){
		echo '{"state": 200, "info": "请填写信息详情"}';
		exit();
	}
	
	$time = $pubdate ? GetMktime($pubdate) : time();

}

if($dopost == "add" && $submit == "提交"){

	//保存到主表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_discoverylist` 
		(`cityid`, `uid`, `title`, `litpic`, `typeid`, `sid`, `body`, `state`, `weight`, `click`, `pubdate`, `writer`, `zan_user`, `zan_ip`) 
		VALUES 
		('$cityid', '$uid', '$title', '$litpic', '$typeid', '$sid', '$body', '$state', '$weight', '$click', '$time', '$writer', '', '')");
	$results = $dsql->dsqlOper($archives, "lastid");

	if(!is_numeric($results)){
		echo '{"state": 200, "info": "主表保存失败！"}';
		exit();
	}

	if($state == 1){
		$sql = $dsql->SetQuery("UPDATE `#@__member` SET `mtype` = 2 WHERE `id` = $uid AND `mtype` = 1");
		$dsql->dsqlOper($sql, "update");
	}

	adminLog("新增探店信息", $title);

	$param = array(
		"service"     => "business",
		"template"    => "discovery_detail",
		"id"          => $results
	);
	$url = getUrlPath($param);

	echo '{"state": 100, "url": "'.$url.'"}';die;
}

if($dopost == "edit"){

	if($submit == "提交"){

		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT `state`, `uid` FROM `#@__".$action."_discoverylist` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			//城市管理员验证权限
			if($userType == 3){
				if($adminCityIds){
					if(!in_array($res[0]['cityid'], explode(',', $adminCityIds))){
						die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能1！").'}');
					}
				}else{
					die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能2！").'}');
				}
			}

		}else{
			die('{"state": 200, "info": '.json_encode("信息不存在，或已经删除！").'}');
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."_discoverylist` SET `cityid` = '$cityid', `typeid` = '$typeid', `title` = '$title', `litpic` = '$litpic', `sid` = '$sid', `body` = '$body', `state`='$state', `weight` = '$weight', `writer` = '$writer', `pubdate` = '$time' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		if($isJoin && $state == 1){
			$sql = $dsql->SetQuery("UPDATE `#@__member` SET `mtype` = 2 WHERE `id` = $uid AND `mtype` = 1");
			$dsql->dsqlOper($sql, "update");
		}

		adminLog("修改探店信息", $title);


		$param = array(
			"service"     => "business",
			"template"    => "discovery_detail",
			"id"          => $id
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_discoverylist` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				//城市管理员验证权限
				if($userType == 3){
					if($adminCityIds){
						if(!in_array($results[0]['cityid'], explode(',', $adminCityIds))){
							ShowMsg('您无权修改此信息！', "javascript:;");
							die;
						}
					}else{
						ShowMsg('您无权修改此信息！', "javascript:;");
						die;
					}
				}


				$uid        = $results[0]['uid'];

				$username = "";
				$sql = $dsql->SetQuery("SELECT `company`, `nickname`, `username` FROM `#@__member` WHERE `id` = $uid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
				}

				$typename = "";
				if($results[0]['typeid']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_discoverytype` WHERE `id` = ".$results[0]['typeid']);
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						$typename = $res[0]['typename'];
					}
				}


				$title    = $results[0]['title'];
				$uid      = $results[0]['uid'];
				$litpic   = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : "";
				$typeid   = $results[0]['typeid'];
				$cityid   = $results[0]['cityid'];
				$pubdate  = $results[0]['pubdate'];
				$state    = $results[0]['state'];
				$body     = $results[0]['body'];
				$writer   = $results[0]['writer'] ? $results[0]['writer'] : $username;
				$click    = $results[0]['click'];
				$weight   = $results[0]['weight'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/business/discoveryAdd.js'
	);

	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//css
	$cssFile = array(
	    'ui/jquery.chosen.css',
	    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}


	$huoniaoTag->assign('mapCity', $cfg_mapCity);
	$huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('uid', $uid);
	$huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('typeid', (int)$typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('click', (int)$click);
	$huoniaoTag->assign('weight', (int)$weight);
	$huoniaoTag->assign('writer', $writer);
	$huoniaoTag->assign('pubdate', $pubdate ? date("Y-m-d H:i:s", $pubdate) : date("Y-m-d H:i:s"));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_discoverytype")));


	//阅读权限-下拉菜单
	$huoniaoTag->assign('stateList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
	$huoniaoTag->assign('state', $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
