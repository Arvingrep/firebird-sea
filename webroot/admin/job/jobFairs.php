<?php
/**
 * 管理招聘会
 *
 * @version        $Id: jobFairs.php 2015-3-17 上午10:41:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobFairs");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "job_fairs";
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
if($dopost != ""){
	$templates = "jobFairsAdd.html";

	//js
	$jsFile = array(
        'publicUpload.js',
        'publicAddr.js',
        'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobFairsAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "jobFairs.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobFairs.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate     = GetMkTime(time());       //发布时间

	//二次验证
	if(empty($fname) && empty($fid)){
		echo '{"state": 101, "info": "请输入会场名称！"}';
		exit();
	}

	if(empty($fid)){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `title` = '".$fname."'");
		$result = $dsql->dsqlOper($sql, "results");
		if(count($result) < 0){
			echo '{"state": 101, "info": "会场不存在，请重新输入"}';
			exit();
		}else{
			$fid = $result[0]['id'];
		}
	}

	if(empty($type)){
        echo '{"state": 101, "info": "请选择招聘会类型！"}';
        exit();
    }

	if(empty($oid)){
        echo '{"state": 101, "info": "请选择主办单位！"}';
        exit();
    }

	if(empty($title)){
		echo '{"state": 101, "info": "请输入招聘会名称！"}';
		exit();
	}

	if(empty($startdate)){
		echo '{"state": 101, "info": "请选择开始时间！"}';
		exit();
	}

	$startdate = GetMkTime($startdate);

	if(empty($obj)){
        echo '{"state": 101, "info": "请填写面向对象！"}';
        exit();
    }

	if(empty($enddate)){
		echo '{"state": 101, "info": "请选择结束时间！"}';
		exit();
	}

	$enddate = GetMkTime($enddate);

    if(empty($phone)){
        echo '{"state": 101, "info": "请填写联系电话！"}';
        exit();
    }

    if(empty($note)){
        echo '{"state": 101, "info": "请填写招聘会描述！"}';
        exit();
    }
}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($cityid){
        $where2 .= getWrongCityFilter('`cityid`', $cityid);
    }

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE 1=1".$where2);
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        $fid = array();
        foreach($result as $key => $fairs){
            array_push($fid, $fairs['id']);
        }
        $where .= " AND `fid` in (".join(",", $fid).")";
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
    }
    if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";

		//模糊匹配会场
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `title` like '%$sKeyword%'".$where2);
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			$fid = array();
			foreach($result as $key => $fairs){
				array_push($fid, $fairs['id']);
			}
			if(!empty($fid)){
				$where .= " OR `fid` in (".join(",", $fid).")";
			}
		}
	}

    if($type!=""){
        $where .= " AND `type` = $type";
    }

/*	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "jobaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "jobaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}

		//模糊匹配会场
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `addr` in ($lower)");
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			$fid = array();
			foreach($result as $key => $fairs){
				array_push($fid, $fairs['id']);
			}
			if(!empty($fid)){
				$where .= " AND `fid` in (".join(",", $fid).")";
			}
		}else{
			$where .= " AND 1 = 2";
		}

	}*/

	if(!empty($date)){
		$date = GetMkTime($date);
		$where .= " AND `began` = ".$date;
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `fid`, `title`, `type`, `obj`,`oid`, `startdate`,`enddate`, `click`, `pubdate`,`join_type` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["fid"] = $value["fid"];
			$list[$key]["join_type"] = (int)$value["join_type"];
			$list[$key]["type"] = $value["type"] == 1 ? "现场" : "网络";
			$list[$key]["obj"] = $value["obj"];
			$oname = "";
			$oid = $value['oid'];
			if($oid){
			    $sql = $dsql::SetQuery("select `title` from `#@__job_fairs_organizer` where id in ($oid) ORDER BY FIELD(`id`, $oid)");
			    $oname = $dsql->getArr($sql);
			    $oname = join("<br>",$oname);
            }
			$list[$key]["oname"] = $oname;
			$sql = $dsql->SetQuery("SELECT `title`, `addr` FROM `#@__job_fairs_center` WHERE `id` = ". $value['fid']);
			$fname = $dsql->dsqlOper($sql, "results");
			if($fname){
				$list[$key]["fname"] = $fname[0]["title"];
			}else{
				$list[$key]["fname"] = "无";
			}

/*			$list[$key]["addrid"] = $fname[0]["addr"];
			$addrSql = $dsql->SetQuery("SELECT `typename` FROM `#@__jobaddr` WHERE `id` = ". $fname[0]["addr"]);
			$addrname = $dsql->dsqlOper($addrSql, "results");
			if($addrname){
				$list[$key]["addr"] = $addrname[0]["typename"];
			}else{
				$list[$key]["addr"] = "无";
			}*/


			$list[$key]["title"] = $value["title"];
			$list[$key]["startdate"] = date("Y-m-d H:i:s", $value["startdate"]);
			$list[$key]["enddate"] = date("Y-m-d H:i:s", $value["enddate"]);
			//计算有多少个参会信息
            $sql = $dsql::SetQuery("select count(*) from `#@__job_fairs_join` j where `fid`=".$value['id']);
            $list[$key]['join_count'] = (int)$dsql->getOne($sql);
			$list[$key]["click"] = $value["click"];

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"param"    => "center=".$value['fid']
			);
			$list[$key]["furl"] = getUrlPath($param);

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "jobFairs": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//新增
}elseif($dopost == "Add"){
	if(!testPurview("jobFairsAdd")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$pagetitle = "新增招聘会";

	//表单提交
	if($submit == "提交"){

		//保存到主表
        $oid = is_array($oid) ? join(",",$oid) : $oid;
        $click = (int)$click;
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`join_img`,`join_type`,`oid`,`fid`,`type`,`title`, `phone`, `startdate`, `enddate`, `picture`, `click`, `note`, `obj` , `pubdate`) VALUES ('$join_img',$join_type,'$oid','$fid',$type,'$title', '$phone', '$startdate', '$enddate', '$picture','$click', '$note', '$obj','".GetMkTime(time())."')");
		$id = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($id)){

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"id"       => $id
			);
			$url = getUrlPath($param);
            //更新招聘会地址
            $handlers = new handlers("job","fixFairsAddr");
            $handlers->getHandle();
			// 清除缓存
			clearCache("job_fairs_list", "key");
			clearCache("job_fairs_total", "key");

			adminLog("新增招聘会", $title);

			//招聘会地址
            $sql = $dsql::SetQuery("select `address` from `#@__job_fairs_center` where `id`=$fid");
            $address = $dsql->getOne($sql);

			//通知企业
            $urlParam             = array(
                "service" => "job",
                "template" => "zhaopinhui",
                "id" => $id
            );
            $data = array(
                "title" => $title,
                "type" => $type==1?"现场招聘会":"网络招聘会",
                "address" => $address,
                "start" => date("Y-m-d H:i:s",$startdate),
                "end" => date("Y-m-d H:i:s",$enddate),
                "fields" => array(
                    'keyword1' => '招聘会类型',
                    'keyword2' => '招聘会类型',
                    'keyword3' => '招聘会地点',
                    'keyword4' => '招聘会开始时间',
                    'keyword5' => '招聘会结束时间'
                )
            );
            //短信、邮件同时开启
            $sql = $dsql::SetQuery("select `id`,`userid` from `#@__job_company` where `sms_fair`=1 and `email_fair`=1");
            $smsCids = $dsql->getArrList($sql);
            foreach ($smsCids as $smsCid){
                $sql = $dsql::SetQuery("select `phone` from `#@__member` where `id`={$smsCid['userid']}");
                $sms = $dsql->getOne($sql);
                updateMemberNotice($smsCid['userid'], "招聘-招聘会消息通知", $urlParam, $data,'',array(),0,0,array('pushSms'=>true,'pushEmail'=>true));
            }

            //仅短信
            $sql = $dsql::SetQuery("select `id`,`userid` from `#@__job_company` where `sms_fair`=1 and `email_fair`=0");
            $smsCids = $dsql->getArrList($sql);
            foreach ($smsCids as $smsCid){
                $sql = $dsql::SetQuery("select `phone` from `#@__member` where `id`={$smsCid['userid']}");
                $sms = $dsql->getOne($sql);
                updateMemberNotice($smsCid['userid'], "招聘-招聘会消息通知", $urlParam, $data,'',array(),0,0,array('pushSms'=>true,'pushEmail'=>false));
            }

            //仅邮件
            $sql = $dsql::SetQuery("select `id`,`userid` from `#@__job_company` where `sms_fair`=1 and `email_fair`=0");
            $smsCids = $dsql->getArrList($sql);
            foreach ($smsCids as $smsCid){
                $sql = $dsql::SetQuery("select `phone` from `#@__member` where `id`={$smsCid['userid']}");
                $sms = $dsql->getOne($sql);
                updateMemberNotice($smsCid['userid'], "招聘-招聘会消息通知", $urlParam, $data,'',array(),0,0,array('pushSms'=>false,'pushEmail'=>true));
            }

			echo '{"state": 100, "url": "'.$url.'", "info": '.json_encode("添加成功！").'}';
		}else{
			echo $id;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){
	if(!testPurview("jobFairsEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$pagetitle = "修改招聘会信息";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
        $type = (int)$type;
        $oid = is_array($oid) ? join(",",$oid) : $oid;
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `fid` = '$fid',  `obj`='$obj' , `head_img`='$head_img', `picture`='$picture', `type`=$type, `title` = '$title', `startdate` = '$startdate', `enddate` = '$enddate', `click` = '$click', `note` = '$note', `phone`='$phone',`oid`='$oid', `join_type`=$join_type, `join_img`='$join_img' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){

			$param = array(
				"service"  => "job",
				"template" => "zhaopinhui",
				"id"       => $id
			);
			$url = getUrlPath($param);

			// 清除缓存
			checkCache("job_fairs_list", $id);
			clearCache("job_fairs_total", "key");
			clearCache("job_fairs_detail", $id);

            //更新招聘会地址
            $handlers = new handlers("job","fixFairsAddr");
            $handlers->getHandle();

			adminLog("修改招聘会信息", $title);
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

				$fid   = $results[0]['fid'];
				$sql   = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs_center` WHERE `id` = ". $results[0]['fid']);
				$fname = $dsql->getTypeName($sql);
				$fname = $fname[0]["title"];

				$title = $results[0]['title'];
				$startdate  = date("Y-m-d H:i:s", $results[0]['startdate']);
				$enddate  = date("Y-m-d H:i:s", $results[0]['enddate']);
				$click = $results[0]['click'];
				$note  = $results[0]['note'];
				$type  = (int)$results[0]['type'];
				$obj  = $results[0]['obj'];
				$picture  = "[]";
				if(!empty($results[0]['picture'])){
                    $picsArr = array();
                    $pics = explode("###", $results[0]['picture']);
                    foreach ($pics as $key => $value) {
                        $val = explode("||", $value);
                        $picsArr[$key] = $val;
                    }
                    $picture =  json_encode($picsArr);
                }
				$oid  = $results[0]['oid'];
				$phone  = $results[0]['phone'];
                $join_type  = $results[0]['join_type'];
                $head_img  = $results[0]['head_img'];
                $join_img  = $results[0]['join_img'];

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
	if(!testPurview("jobFairsDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			array_push($title, $results[0]['title']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				checkCache("job_fairs_list", $val);
				clearCache("job_fairs_detail", $val);
			}
		}
		// 清除缓存
		clearCache("job_fairs_total", "key");

        //更新招聘会地址
        $handlers = new handlers("job","fixFairsAddr");
        $handlers->getHandle();

		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘会", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//根据关键词查询会场
}elseif($dopost == "checkFairs"){
	$result = "";
	$key = $_POST['key'];
	if(!empty($key)){
        if($userType == 0)
            $where = "";
        if($userType == 3)
            $where = getCityFilter('`cityid`');
		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_fairs_center` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			echo json_encode($result);
		}else{
			echo 200;
		}
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('fid', $fid);
		$huoniaoTag->assign('fname', $fname);
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('phone', $phone);
		$huoniaoTag->assign('startdate', $startdate);
		$huoniaoTag->assign('enddate', $enddate);
		$huoniaoTag->assign('click', $click);
		$huoniaoTag->assign('obj', $obj);
		$huoniaoTag->assign('note', $note);
		$huoniaoTag->assign('join_type', $join_type ?: 1);
		$huoniaoTag->assign('join_types', array(1,2));
		$huoniaoTag->assign('join_typenames', array('自由编辑','数据录入'));
		$huoniaoTag->assign('type', $type ?: 1);
		$huoniaoTag->assign('types', array(1,2));
		$huoniaoTag->assign('typenames', array("现场招聘","网络招聘"));
		$huoniaoTag->assign('picture', $picture);
		$huoniaoTag->assign('join_img', $join_img);
		$huoniaoTag->assign('head_img', $head_img);
        $huoniaoTag->assign('oid', $oid);
        //当前选中的 oid（主办单位列表） ，索引数组
		$typeid = array();
        if($oid){
            $typeid = explode(",",$oid);
        }
		$huoniaoTag->assign('typeid',$typeid);
        //所有的主办单位（id和name）
        $sql = $dsql::SetQuery("select `id`,`title` from `#@__job_fairs_organizer`");
        $typeArr = $dsql->getArrList($sql) ?: array();
		$huoniaoTag->assign('typeArr',$typeArr);
	}

    require_once(HUONIAOINC."/config/job.inc.php");
    global $cfg_basehost;
    global $customChannelDomain;
    global $customUpload;
    if($customUpload == 1){
        global $custom_thumbSize;
        global $custom_thumbType;
        $huoniaoTag->assign('thumbSize', $custom_thumbSize);
        $huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
    }
    
    //所有招聘会场
    $jobFairCenters = array();
    if($userType == 0)
        $where = "";
    if($userType == 3)
    $where = getCityFilter('`cityid`');
    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_fairs_center` WHERE 1 = 1 ".$where." ORDER BY `id` DESC");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        $jobFairCenters = $result;
    }
    $huoniaoTag->assign('jobFairCenters', $jobFairCenters);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
