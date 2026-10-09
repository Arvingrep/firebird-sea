<?php
/**
 * 管理招聘会-网络招聘会
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

$tab = "job_fairs_join";
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
if($dopost != ""){
	$templates = "jobFairsJoinAdd.html";
    $pagetitle = "新增参会信息";
	//js
	$jsFile = array(
        'publicUpload.js',
        'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobFairsJoinAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "jobFairsJoin.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobFairsJoin.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
    if($token == "") die('token传递失败！');
    $pubdate     = GetMkTime(time());       //发布时间

    //二次验证
    if(empty($fname) && empty($fid)){
        echo '{"state": 101, "info": "请输入招聘会名称！"}';
        exit();
    }

    if(empty($fid)){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs` WHERE `title` = '$fname' and `type`=2 and `enddate`<unix_timestamp(current_timestamp) limit 1");
        $result = $dsql->getArr($sql);
        if(count($result) <= 0){
            echo '{"state": 101, "info": "招聘会不存在，请重新输入"}';
            exit();
        }else{
            $fid = $result['id'];
        }
    }

    //尝试获取cid
    if(empty($cid)){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` = '".$company."'");
        $result = $dsql->getArr($sql);
        if(count($result) <= 0){
            echo '{"state": 101, "info": "企业不存在，请重新输入"}';
            exit();
        }else{
            $cid = $result['id'];
        }
    }
}



if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

//    $where2 = getCityFilter('`cityid`');

/*    if ($cityid){
        $where2 = " AND `cityid` = $cityid";
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
    }*/
    if($sKeyword != ""){
        $sKeyword = trim($sKeyword);

		$where .= " AND (f.`title` like '%$sKeyword%' OR c.`title` like '%$sKeyword%' OR c.`people` like '%$sKeyword%' OR c.`contact` like '%$sKeyword%'";

		//模糊匹配会场
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_fairs_center` WHERE `title` like '%$sKeyword%'".$where2);
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			$_fid = array();
			foreach($result as $key => $fairs){
				array_push($_fid, $fairs['id']);
			}
			if(!empty($_fid)){
				$where .= " OR f.`fid` in (".join(",", $_fid).")";
			}
		}

        if(is_numeric($sKeyword)){
            $where .= " OR f.`id`=$sKeyword";
        }

        $where .= ")";

	}

    //指定招聘会
    if($fid != ""){
        $where .= " AND f.`id`=$fid";
    }
    //未指定的，查询所有网络招聘会
    else{
        $where .= " AND f.`type` = 2";
    }


    $baseSql = $dsql::SetQuery("SELECT j.`id`, j.`fid`, j.`cid`, j.`company`, j.`phone`,j.`state`,j.`pubdate`,f.`type` FROM `#@__".$tab."` j LEFT JOIN `#@__job_fairs` f ON j.`fid`=f.`id` LEFT JOIN `#@__job_company` c ON c.`id` = j.`cid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($baseSql . $where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$results = $dsql->dsqlOper($baseSql . $where, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["fid"] = $value["fid"];
			$list[$key]["type"] = (int)$value['type'];
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs` WHERE `id` = ". $value['fid']);
			$fname = $dsql->dsqlOper($sql, "results");
			if($fname){
				$list[$key]["title"] = $fname[0]["title"];

				//说明类型
                if($value['type']==2){
                    $list[$key]["title"] .= "（网络招聘会）";
                }
                else{
                    $list[$key]["title"] .= "（现场招聘会）";
                }
			}else{
				$list[$key]["title"] = "未知";
			}

/*			$list[$key]["addrid"] = $fname[0]["addr"];
			$addrSql = $dsql->SetQuery("SELECT `typename` FROM `#@__jobaddr` WHERE `id` = ". $fname[0]["addr"]);
			$addrname = $dsql->dsqlOper($addrSql, "results");
			if($addrname){
				$list[$key]["addr"] = $addrname[0]["typename"];
			}else{
				$list[$key]["addr"] = "无";
			}*/


			$list[$key]["startdate"] = date("Y-m-d H:i:s", $value["startdate"]);
			$list[$key]["enddate"] = date("Y-m-d H:i:s", $value["enddate"]);
			$list[$key]["began"] = $value["began"];
			$list[$key]["company"]    = $value["company"];
			$list[$key]["phone"] = $value["phone"];
			$state = $value['state'];
			if($state==0){
			    $state = "<span class='gray'>待审核</span><a href='javascript:;' class='link shenhe' style='margin-left: 10px;'>通过</a>";
            }
			elseif($state==1){
			    $state = "<span class='audit'>已审核</span>";
            }
			elseif($state==2){
			    $state = "<span class='refuse'>审核拒绝</span>";
            }
			$list[$key]["state"] = $state;
			$list[$key]["nickname"] = "未知";
			$cid = $value['cid'];
			//如果存在cid，说明是真实的公司，找出联系人姓名、联系电话（使用最新的电话）
			if($cid){
			    $name = $dsql::SetQuery("select `title`, `people`,`contact` from `#@__job_company` where `id`=$cid");
			    $com = $dsql->getArr($name);
                $list[$key]['nickname'] = $com['people'];
                $list[$key]['phone'] = $com['contact'];
                $list[$key]['company'] = $com['title'];
            }

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
				"id"       => $value['fid']
			);
			$list[$key]["url"] = getUrlPath($param);

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $value['cid']
			);
			$list[$key]["curl"] = getUrlPath($param);
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


}
elseif($dopost == "Add"){
    if(!testPurview("jobFairs")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $pagetitle = "新增参会信息";
    if($fid){
        $sql = $dsql::SetQuery("select `title` from `#@__job_fairs` where `id`=$fid");
        $fname = $dsql->getOne($sql) ?: "";
    }

    //表单提交
    if($submit == "提交"){

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`fid`,`cid`,`company`,`phone`,`state`,`pubdate`) VALUES ('$fid','$cid','$company','$phone','$state','".GetMkTime(time())."')");
        $id = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($id)){

            //重新生成addr和types
            $handlers = new handlers("job","fairsFixAddrTypes");
            $handlers->getHandle(array("fid"=>$id));

            adminLog("新增参会信息", $company);
            echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
        }else{
            echo $id;
        }
        die;
    }
}
//编辑
elseif($dopost == "edit"){
	if(!testPurview("jobFairs")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$pagetitle = "修改参会信息";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//保存到主表
        $cid = (int)$cid;
        $fid = (int)$fid;
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `fid` = $fid,  `cid`=$cid, `company`='$company', `phone`='$phone', `state` = '$state' WHERE `id` = ".$id);
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

			//重新生成addr和types
            $handlers = new handlers("job","fairsFixAddrTypes");
            $handlers->getHandle(array("fid"=>$fid));

			adminLog("修改参会信息", $company);
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
				$sql   = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs` WHERE `id` = ". $results[0]['fid']);
				$fname = $dsql->getTypeName($sql);
				$fname = $fname[0]["title"];

				$title = $results[0]['title'];
				$startdate  = date("Y-m-d H:i:s", $results[0]['startdate']);
				$enddate  = date("Y-m-d H:i:s", $results[0]['enddate']);
				$click = $results[0]['click'];
				$note  = $results[0]['note'];
				$type  = (int)$results[0]['type'];
				$obj  = $results[0]['obj'];
				$picture  = $results[0]['picture'];
				$seat_picture  = $results[0]['seat_picture'];
				$oid  = $results[0]['oid'];
				$phone  = $results[0]['phone'];
                $join_type  = $results[0]['join_type'];
                $join_img  = $results[0]['join_img'];
                $cid  = $results[0]['cid'];

                $company = '';
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = " . $results[0]['cid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $company = $ret[0]["title"];
                }

                $state  = $results[0]['state'];

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
	if(!testPurview("jobFairs")){
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

		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘会", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

}
//根据关键词查询招聘会（未结束的网络招聘会）
elseif($dopost == "checkFairs"){
	$result = "";
	$key = $_POST['key'];
	if(!empty($key)){
	    $key = addslashes($key);
        if($userType == 0)
            $where = "";
        if($userType == 3)
            $where = getCityFilter('`cityid`');
		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_fairs` WHERE `type`=2 and `enddate`>unix_timestamp(current_timestamp) and `title` like '%$key%'".$where." LIMIT 0, 10");
		$result = $dsql->dsqlOper($sql, "results");
		if($result){
			echo json_encode($result);
		}else{
			echo 200;
		}
	}
	die;
}
//更新状态
elseif($dopost == "updateState"){

    //超管一键审核通过所有待审信息
    if($manage){

        $id = array();
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `state` = 0" . getCityFilter('`cityid`'));
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = array_column($ret, 'id');
        }
        $id = join(',', $id);

    }

    $each = explode(",", $id);
    if($id){
        foreach($each as $val){
            $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = 1 WHERE `id` = $val");
            $ret = $dsql->dsqlOper($sql, "update");
        }
        echo '{"state": 100, "info": "更新成功！"}';
    }else{
        echo '{"state": 200, "info": "请选择要审核的信息"}';
    }
    die;
}
//根据关键字模糊查询company
elseif($dopost == "checkCompany"){
    $result = "";
    $key = $_POST['key'];
    if(!empty($key)){
        $key = addslashes($key);
        if($userType == 0)
            $where = "";
        if($userType == 3)
            $where = getCityFilter('`cityid`');
        $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
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
    $huoniaoTag->assign('sKeyword', $sKeyword);
    $huoniaoTag->assign('fid', $fid ?: "");
    $huoniaoTag->assign('fname', $fname);

    if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('cid', $cid);
		$huoniaoTag->assign('company', $company);
		$huoniaoTag->assign('phone', $phone);
		$huoniaoTag->assign('state',$state);
		$huoniaoTag->assign('states', array(0,1,2));
		$huoniaoTag->assign('state_names', array('待审核','审核通过','审核拒绝'));
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

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
