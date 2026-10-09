<?php
/**
 * 管理招聘职位
 *
 * @version        $Id: jobPost.php 2014-3-17 上午11:09:15 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobPost");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobTop.html";

$tab = "job_top_recode";

if($dopost == "getList") {

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;

    $where = getCityFilter('c.`cityid`') . " AND c.`id` IS NOT NULL AND m.`id` IS NOT NULL";

    if ($adminCity) {
        $where .= getWrongCityFilter('c.`cityid`', $adminCity);
    }

    //判断公司管理权限
    if(!testPurview("jobCompany")){
        //找出它当前绑定的cid列表，然后 in
        $currentAdminId = $userLogin->getUserID();
        $bindCids = $dsql->getArr($dsql::SetQuery("select `cid` from `#@__job_company_bind` where `release_type`=0 and `admin`=".$currentAdminId));
        if($bindCids){
            $where .= " and c.`id` in(".join(",",$bindCids).")";
        }else{
            $where .= " and 1=2";
        }
    }

    if ($sKeyword != "") {
        if($searchType == "ordernum"){
            $where .= " AND t.`ordernum` like '%$sKeyword%'";
        }
        elseif($searchType=="pid"){
            if(is_numeric($sKeyword)){
                $where .= " AND t.`pid`=$sKeyword";
            }else{
                $where .= " AND 1=2";
            }
        }
        elseif($searchType=="uname"){
            $where .= " AND (m.`nickname` like '%$sKeyword%' or m.`username` like '%$sKeyword%')";
        }
        elseif($searchType=="cname"){
            $where .= " AND c.`title` like '%" . $sKeyword . "%'";
        }

    }

    if ($sType != "") {
        if ($dsql->getTypeList($sType, "job_type")) {
            $lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
            $lower = $sType . "," . join(',', $lower);
        } else {
            $lower = $sType;
        }
        $where .= " AND `type` in ($lower)";
    }

    if ($start != "") {
        $where .= " AND t.`pubdate` >= " . GetMkTime($start);
    }

    if ($end != "") {
        $where .= " AND t.`pubdate` <= " . GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT count(t.`id`) FROM `#@__" . $tab . "` t left join `#@__job_order` o on t.`ordernum`=o.`ordernum` left join `#@__member` m on m.`id`=o.`uid` left join `#@__job_company` c on c.`userid`=m.`id` WHERE 1 = 1");
    //总条数
    $totalCount = $dsql->getOne($archives . $where);
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $now = time();
    $state0 = $dsql->getOne($archives . " AND t.`is_end` = 0" . $where);
    //已审核
    $state1 = $dsql->getOne($archives . " AND t.`is_end` = 1" . $where);

    if ($state != "") {

        $where .= " AND t.`is_end` = $state";

        if ($state == 0) {
            $totalPage = ceil($state0 / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($state1 / $pagestep);
        }
    }

    $where .= " order by t.`id` desc";

    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT t.*,c.`title`,m.`username`,m.`nickname`,o.`uid`,c.`id` 'cid',o.`aid`,o.`amount` FROM `#@__" . $tab . "` t left join `#@__job_order` o on t.`ordernum`=o.`ordernum` left join `#@__member` m on m.`id`=o.`uid` left join `#@__job_company` c on c.`userid`=m.`id` WHERE 1 = 1" . $where);
    $results = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["title"] = $value["title"];
            $list[$key]["nickname"] = $value["nickname"] ? $value["nickname"] : ( $value["username"] ? $value["username"] : "未知");
            $list[$key]["userid"] = $value['uid'];
            $list[$key]["cid"] = $value['cid'];
            $list[$key]["amount"] = (float)$value['amount'];
            $list[$key]["ordernum"] = $value['ordernum'];
            $urlParam = array(
                "service"=>"job",
                "template"=>"company",
                "id"=>$value["cid"]
            );
            $list[$key]["curl"] = getUrlPath($urlParam);
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["top_start"] = date('Y-m-d H:i:s', $value["top_start"]);
            $list[$key]["top_end"] = date('Y-m-d H:i:s', $value["top_end"]);

            $postTitle = "";
            if($value['aid']){
                $sql = $dsql::SetQuery("select `title` from `#@__job_post` where `id` in({$value['aid']})");
                $postTitle = $dsql->getOne($sql);
            }
            $list[$key]["postTitle"] = $postTitle;
            $urlParam = array(
                "service"=>"job",
                "template"=>"job",
                "id"=>$value["aid"]
            );
            $list[$key]["postUrl"] = getUrlPath($urlParam);

            $noTopZh = array();
            $noTop = array();
            if(!empty($value['no_top'])){
                $noTop = json_decode("[".$value['no_top']."]",true);
                if(in_array(1,$noTop)){
                    $noTopZh[] = "周一";
                }
                if(in_array(2,$noTop)){
                    $noTopZh[] = "周二";
                }
                if(in_array(3,$noTopZh)){
                    $noTopZh[] = "周三";
                }
                if(in_array(4,$noTop)){
                    $noTopZh[] = "周四";
                }
                if(in_array(5,$noTop)){
                    $noTopZh[] = "周五";
                }
                if(in_array(6,$noTop)){
                    $noTopZh[] = "周六";
                }
                if(in_array(7,$noTop)){
                    $noTopZh[] = "周日";
                }
            }
            $list[$key]["noTop"] = $noTop;
            $list[$key]["noTopZh"] = $noTopZh;
            $list[$key]["topState"] = $value['is_end'] ? "已结束" : "置顶中";
        }

        if (count($list) > 0) {
            if($do!="export"){
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "time": ' . time() . '}, "jobPost": ' . json_encode($list) . '}';
            }
        } else {
            if($do!="export"){
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . '}}';
            }
        }

    } else {
        if($do!="export"){
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 .'}}';
        }
    }
    if($do == "export"){
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '公司'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '添加时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '职位信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '不置顶日'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '开始时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '结束时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '置顶状态'));


        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","招聘置顶明细.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pubdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['postTitle']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', join("、",$data['noTopZh'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['top_start']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['top_end']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['topState']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 招聘置顶明细.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }
    die;
}
//职位状态
elseif($dopost == "offState"){
	if($id != ""){

        $each = explode(",", $id);
        $error = array();
        $async = array();
        $title = array();
        foreach($each as $val){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "results");

            array_push($title, $results[0]['title']);

            //更新表
            $archives = $dsql->SetQuery("update `#@__".$tab."` set `off`=$off WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }else{
                // 清除缓存
                checkCache("job_post_list", $val);
                clearCache("job_post_detail", $val);
                clearCache("job_post_total", "key");
                $async[] = $val;
            }
        }
        dataAsync("job",$async,"post");  // 修改职位上下架状态
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            $offMsg = $off==1? "上架" : "下架";
            adminLog($offMsg."招聘职位信息", join(", ", $title));
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }
        die;

    }
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobPostDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
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
				// 清除缓存
				checkCache("job_post_list", $val);
				clearCache("job_post_detail", $val);
				clearCache("job_post_total", "key");
                $async[] = $val;
			}
		}
        dataAsync("job",$async,"post");  // 删除职位
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘职位信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobPostEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$async = array();
	$error = array();
	$append = "";
	if($state==2){
	    $append .= ",refuse_msg='$refuse_msg'";
    }
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT p.`state`,p.`title`,c.`userid` FROM `#@__".$tab."` p left join `#@__job_company` c ON p.`company`=c.`id` WHERE p.`id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];
			$uid = $res[0]['userid'];
			$ptitle = $res[0]['title'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state."$append WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				clearCache("job_post_detail", $val);
				//取消审核
				if($state != 1 && $state_ == 1){
					checkCache("job_post_list", $val);
					clearCache("job_post_total", "key");
					if($state==2){
					    updateMemberNotice();
					    $dsql->update($dsql::SetQuery("insert into `#@__job_message`(`uid`,`notice`,`type`) values($uid,'职位审核拒绝：$ptitle','postRefuse')"));
                    }
				}
				//审核通过
				elseif($state == 1 && $state_ != 1){
					updateCache("job_post_list", 300);
					clearCache("job_post_total", "key");
                    $dsql->update($dsql::SetQuery("insert into `#@__job_message`(`uid`,`notice`,`type`) values($uid,'职位审核通过：$ptitle','postPass')"));
				}
				$async[] = $val;
			}
		}
        dataAsync("job",$async,"post");  // 修改职位状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新招聘职位状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
//延长截至时间
elseif($dopost == "updateTime"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $base_where = $where = getCityFilter('`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){
		$where .= " AND `title` like '%".$sKeyword."%'";

		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$comid = array();
			foreach($comResult as $key => $com){
				array_push($comid, $com['id']);
			}
			if(!empty($comid)){
				$where .= " OR `company` in (".join(",", $comid).")";
			}
		}

		//模糊匹配简历用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = ".$user['id']);
				$userResult = $dsql->dsqlOper($userSql, "results");
				if($userResult){
					array_push($userid, $userResult[0]['id']);
				}
			}
			if(!empty($userid)){
				$where .= " OR `bole` in (".join(",", $userid).")";
			}
		}
	}

	if($sType != ""){
		if($dsql->getTypeList($sType, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `type` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
    $now = time();
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2 AND (`valid` >$now OR `valid`=0)".$where, "totalCount");
	//已过期
	$state3 = $dsql->dsqlOper($archives." AND `valid` <= $now AND `valid`=0".$where, "totalCount");

	if($state != ""){

		if($state == 3){
            $where .= " AND `valid` <=$now AND `valid`!=0";
		}else{
            $where .= " AND `state` = $state AND (`valid` >= $now OR `valid`=0)";
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}
	}

	$add = $time * 86400;

	if($where == $base_where){
        echo '{"state": 200, "info": "请选择过滤筛选条件！"}';
        die;
    }
	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `valid` = `valid` + $add WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "update");
	$updateEsSql = $dsql->SetQuery("select id from `#@__$tab` WHERE 1 = 1 $where");
    $updateEs = $dsql->getArr($updateEsSql);
	if($updateEs){
	    dataAsync("job",$updateEs,"post");  // 批量更新职位时间
    }
	if($results == 'ok'){
		adminLog("延长职位截止时间".$time."天", $where);
		echo '{"state": 100, "info": "操作成功！"}';
	}else{
		echo '{"state": 200, "info": "'.$results.'"}';
	}
	die;


//更新发布时间
}elseif($dopost == "updateFabuTime"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $base_where = $where = getCityFilter('`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){
		$where .= " AND `title` like '%".$sKeyword."%'";

		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult){
			$comid = array();
			foreach($comResult as $key => $com){
				array_push($comid, $com['id']);
			}
			if(!empty($comid)){
				$where .= " OR `company` in (".join(",", $comid).")";
			}
		}

		//模糊匹配简历用户
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = ".$user['id']);
				$userResult = $dsql->dsqlOper($userSql, "results");
				if($userResult){
					array_push($userid, $userResult[0]['id']);
				}
			}
			if(!empty($userid)){
				$where .= " OR `bole` in (".join(",", $userid).")";
			}
		}
	}

	if($sType != ""){
		if($dsql->getTypeList($sType, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `type` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
    $now = time();
    $state0 = $dsql->dsqlOper($archives." AND `state` = 0 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2 AND (`valid`=0 OR `valid` > $now)".$where, "totalCount");
	//已过期
	$state3 = $dsql->dsqlOper($archives." AND `valid`!=0 AND `valid` <= $now".$where, "totalCount");

	if($state != ""){

		if($state == 3){
            $where .= " AND `valid` <=$now AND `valid`!=0";
		}else{
            $where .= " AND `state` = $state AND (`valid` >= $now OR `valid`=0)";
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}
	}

	$time = time();
    if($where == $base_where){
        echo '{"state": 200, "info": "请选择过滤筛选条件！"}';
        die;
    }
	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = $time WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "update");
	if($results == 'ok'){
	    $sql = $dsql->SetQuery("select `id` from `#@__".$tab."` WHERE 1 = 1".$where);
	    $ids = $dsql->getArr($sql);
        dataAsync("job",$ids,"post");  // 更新发布时间
		adminLog("刷新职位发布时间", $where);
		echo '{"state": 100, "info": "操作成功！"}';
	}else{
		echo '{"state": 200, "info": "'.$results.'"}';
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobTop.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
