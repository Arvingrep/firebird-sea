<?php
/**
 * 添加施工案例
 *
 * @version        $Id: renovationDiaryAdd.php 2014-3-7 下午14:19:19 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationConstructionAdd.html";

$tab = "renovation_construction";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改工地案例";
	checkPurview("renovationConstructionEdit");
}else{
	$pagetitle = "添加工地案例";
	checkPurview("renovationConstructionAdd");
}

if(empty($designer)) $designer = 0;
if(empty($communityid)) $communityid = 0;
if(empty($case)) $case = 0;
if(empty($style)) $style = 0;
if(empty($units)) $units = 0;
if(empty($comstyle)) $comstyle = 0;
if(empty($began)) $began = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = 0;

// if(!empty($communityid)){
// 	$community = "";
// }

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入案例名称！"}';
		exit();
	}

	if($communityid ==""){
		echo '{"state": 200, "info": "请选择小区！"}';
		exit();
	}

	if($litpic == ""){
        echo '{"state": 200, "info": "请上传缩略图！"}';
        exit();
    }

    if($sid == ""){
    	echo '{"state": 200, "info": "请选择公司！"}';
        exit();
    }


    //公司uid查询

    $companyuid  = $dsql->SetQuery("SELECT `userid` FROM `#@__renovation_store` WHERE `id` = ".$sid);

    $userid 	 = $dsql->dsqlOper($companyuid,"results");

    if(!is_array($userid)){
    	echo '{"state": 200, "info": "数据错误"}';
        exit();
    } 

    $userid = $userid[0]['userid'];

}

// echo "<pre>";
// var_dump($_POST);die;
if($dopost == "save" && $submit == "提交"){
	//保存到表
    $stagelist      = $_POST['stagelist'];
    $stagelists     = json_decode($_POST['stagelist']);
    $stageidarr 	= array_column($stagelists, "stage");
    $stageid 		= implode(",", $stageidarr);
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`userid`,`title`, `sid`,`style`,`litpic` , `btype`,`area`,`stage`, `budget`, `communityid`, `community`,`addrid`, `address`, `state`,`stageid`, `pubdate`) VALUES ('$userid','$title','$sid','$style','$litpic','$btype','$area', '$stagelist','$budget', '$communityid','$community', '$addrid', '$address', '$state','$stageid', '".GetMkTime(time())."')");

	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		adminLog("添加工地", $title);

		$param = array(
			"service"     => "renovation",
			"template"    => "case-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
        $stagelistjs    = $_POST['stagelist'];

        $stagelist      = json_decode($stagelistjs,true);

        $stateidarr 	= array_column($stagelist, "stage");
        $stageid 		= implode(",", $stateidarr);
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title',`userid` = '$userid',`sid` = '$sid',`style` = '$style',`litpic`='$litpic',`area` = '$area',`stage`='$stagelistjs',`stageid`='$stageid',`btype` = '$btype', `communityid` = '$communityid', `community` ='$community',`addrid`='$addrid',`address`='$address', `state` = '$state' WHERE `id` = ".$id);

		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改工地", $title);

			$param = array(
				"service"     => "renovation",
				"template"    => "case-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title          = $results[0]['title'];
			$type           = $results[0]['type'];
			$area           = $results[0]['area'];
			$btype          = $results[0]['btype'];
			$communityid    = $results[0]['communityid'];
			$state          = $results[0]['state'];
			$sid            = $results[0]['sid'];
			$style          = $results[0]['style'];
			$btype          = $results[0]['btype'];

			$budget         = $results[0]['budget'];
            $litpic         = $results[0]['litpic'];
			$community      = $results[0]['community'];
			$addrid         = $results[0]['addrid'];
			$address        = $results[0]['address'];
			$pubdate        = $results[0]['pubdate'];
			$stage     	    = $results[0]['stage'];



		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'admin/renovationconstruction.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));


	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/renovation/renovationConstructionAdd.js',
		'admin/renovation/renovationUpload.js',
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/renovation.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('mapCity', $cfg_mapCity);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);

	//显示状态
	$huoniaoTag->assign('typeopt', array('0', '1'));
	$huoniaoTag->assign('typenames',array('家装','公装'));
	$huoniaoTag->assign('type', $type == "" ? 0 : $type);

	//address
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('addrid', $addrid);

	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('area', $area);
	$huoniaoTag->assign('unitspic', $unitspic);

	//商业装修
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$comstylelist = array();
	$comstyleval  = array();
	foreach($results as $value){
		array_push($comstylelist, $value['typename']);
		array_push($comstyleval, $value['id']);
	}
	$huoniaoTag->assign('comstylelist', $comstylelist);
	$huoniaoTag->assign('comstyleval', $comstyleval);
	$huoniaoTag->assign('comstyle', $comstyle);

    //装修阶段
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 9 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");

    $huoniaoTag->assign('statgelist', $results);


	//装修风格
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 4 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$stylelist = array();
	$styleval  = array();
	foreach($results as $value){
		array_push($stylelist, $value['typename']);
		array_push($styleval, $value['id']);
	}
	$huoniaoTag->assign('stylelist', $stylelist);
	$huoniaoTag->assign('styleval', $styleval);
	$huoniaoTag->assign('style', $style);

	//户型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 8 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$unitslist = array();
	$unitsval  = array();
	foreach($results as $value){
		array_push($unitslist, $value['typename']);
		array_push($unitsval, $value['id']);
	}
	$huoniaoTag->assign('unitslist', $unitslist);
	$huoniaoTag->assign('unitsval', $unitsval);
	$huoniaoTag->assign('units', $units);

	//类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 7 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$btypeopt = $btypenames = array();
	foreach($results as $value){
		array_push($btypeopt, $value['id']);
		array_push($btypenames, $value['typename']);
	}
	$huoniaoTag->assign('btypeopt', $btypeopt);
	$huoniaoTag->assign('btypenames', $btypenames);
	$huoniaoTag->assign('btype', $btype == "" ? $btypeopt[0] : $btype);

	$huoniaoTag->assign('price', $price);

	//设计师
	$huoniaoTag->assign('designer', $designer);
	$userSql = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_team` WHERE `id` = ". $designer);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('designername', $username[0]['name']);

	//设计方案
	$huoniaoTag->assign('case', $case);
	if(!empty($case)){
		$caseSql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_case` WHERE `id` = ". $case);
		$casename = $dsql->getTypeName($caseSql);
		if($casename){
			$huoniaoTag->assign('caseName', '<span data-id="'.$case.'">'.$casename[0]['title'].'<a href="javascript:;">×</a></span>');
		}
	}

	//装修阶段
    $stagearr   = json_decode($stage,true);
    $stagearr   = json_decode($stage,true) == '' ?array() : json_decode($stage,true);
    foreach ($stagearr as $k => &$v) {
        $listpic 		= 	explode("||", $v['imgList']);

        $listpicarr	 	= array();

        foreach ($listpic as $a => $b) {
            if($b !=''){
                $listpicarr[$a]['path'] = getFilePath($b);
                $listpicarr[$a]['img']  = $b;
            }
        }
        $v['listpicarr'] =  $listpicarr;
    }

    $huoniaoTag->assign('stageListarr', $stagearr);


	if(empty($type)){
        //可操作的城市，多个以,分隔
        $userLogin = new userLogin($dbo);
        $adminCityIds = $userLogin->getAdminCityIds();
        $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

        $cityArr = array();
        $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE 1 = 1 " . getCityFilter('c.`cid`') . " ORDER BY c.`id`");
        $result = $dsql->dsqlOper($sql, "results");
        if($result){
            // if(!empty($child)){

                //隐藏分站重复区域
                global $cfg_sameAddr_state;
                $siteCityArr = array();
                if(!$cfg_sameAddr_state){
                    $siteConfigService = new siteConfig();
                    $siteCity = $siteConfigService->siteCity();

                    foreach ($siteCity as $key => $val){
                        array_push($siteCityArr, $val['cityid']);
                    }
                }

                foreach ($result as $key => $value) {

                    $alist = array();
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret) {
                        foreach ($ret as $k_ => $v_){
                            //隐藏分站重复区域
                            if ($siteCityArr) {
                                if(!in_array($v_['id'], $siteCityArr)) {
                                    array_push($alist, $v_);
                                }
                            }else{
                                array_push($alist, $v_);
                            }
                        }

                    }

                    array_push($cityArr, array(
                        "id" => $value['cid'],
                        "typename" => $value['typename'],
                        "pinyin" => $value['pinyin'],
                        "hot" => $value['hot'],
                        "lower" => $alist
                    ));

                }
            // }else{
            //     foreach ($result as $key => $value) {
            //         array_push($cityArr, array(
            //             "id" => $value['cid'],
            //             "typename" => $value['typename'],
            //             "pinyin" => $value['pinyin'],
            //             "hot" => $value['hot'],
            //             "lower" => array()
            //         ));
            //     }
            // }
        }
            $addrListArr =  $cityArr;

    }else{
        $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
        if($results){
           $addrListArr =  $results;
        }
    }
	$huoniaoTag->assign('addrListArr', json_encode($addrListArr));
	// $huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList($admin, "site_area")));
	//小区
	$huoniaoTag->assign('communityid', $communityid);
	if(!empty($communityid)){
		$communityidSql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_community` WHERE `id` = ". $communityid);
		$communityidname = $dsql->getTypeName($communityidSql);
		if($casename){
			$community = $communityidname[0]['title'];
		}
	}

	$huoniaoTag->assign('communityName', !empty($community) ? '<span>'.$community.'<a href="javascript:;">×</a></span>' : "");
	$huoniaoTag->assign('began', $began ? date("Y-m-d", $began) : "");
	$huoniaoTag->assign('end', $end);

	$stagejson = json_decode($stage,true);
	// $imglist = array_combine(array_column($stagejson, 'id'),array_column($stagejson, 'imglist'));
	if($stagejson){

	$imglist = array_column($stagejson, 'imglist');
	}
	$huoniaoTag->assign('imglist', json_encode(!empty($imglist) ? explode(",", $imglist[0]) : array()));

	//参观
	$huoniaoTag->assign('visitopt', array('0', '1'));
	$huoniaoTag->assign('visitnames',array('不接受','接受'));
	$huoniaoTag->assign('visit', $visit == "" ? 0 : $visit);

	$huoniaoTag->assign('click', $click == "" ? "1" : $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录


	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 6 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$budgetList = array_combine(array_column($results, "id"), array_column($results, "typename"));
	// foreach($results as $value){
	// 	array_push($budgetid, $value['id']);
	// 	array_push($budgetList, $value['typename']);
	// }

	$huoniaoTag->assign('budgetList',$budgetList);
	$huoniaoTag->assign('budget', $budget == "" ? 0: $budget);

	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 9 ORDER BY `weight` ASC");
	$results  = $dsql->dsqlOper($archives, "results");
	
	$huoniaoTag->assign('stageList',$results);
	$huoniaoTag->assign('stagearr',$stagejson);

	//公司
	$storesql  = $dsql->SetQuery("SELECT `id`,`company` FROM `#@__renovation_store` WHERE `state` = 1");

	$storeres  = $dsql->dsqlOper($storesql,"results");
	$huoniaoTag->assign('shopList',$storeres);

    $huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
