<?php
/**
 * 管理招聘企业
 *
 * @version        $Id: jobCompany.php 2014-3-17 上午00:21:17 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobCompanyMy");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobCompanyMy.html";

$admin = $userLogin->getUserID();

//获取套餐列表
$sql = $dsql::SetQuery("select `id`,`title` from `#@__job_combo` order by `recommend` desc,`id` desc");
$comboList = $dsql->getArrList($sql);
$comboList = array_column($comboList,"title","id");

$huoniaoTag->assign("comboList",$comboList);

//标签列表
$sql = $dsql::SetQuery("select `id`,`typename`, `color` from `#@__job_companytag` order by `weight` desc,`id` desc");
$comboList = $dsql->getArrList($sql);
// $comboList = array_column($comboList,"typename","id");

$huoniaoTag->assign("tagList",$comboList);

$tab = "job_company";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('c.`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('c.`cityid`', $cityid);
    }

    if($tag!=""){
        $sql = $dsql::SetQuery("select ");
        $where .= " AND FIND_IN_SET($tag,c.`tag`)";
    }

	if($sKeyword != ""){
	    if($searchType=="uname"){
		    $where .= " AND (m.`nickname` like '%$sKeyword%' or m.`username` like '%$sKeyword%' or c.`people` like '%$sKeyword%' or c.`contact` like '%$sKeyword%')";
        }
	    elseif($searchType=="cname"){
		    $where .= " AND (c.`title` like '%$sKeyword%' or c.`full_name` like '%$sKeyword%')";
        }
	}

	if($combo!=""){
        if($combo == -1){
            $where .= " AND c.`combo_id`=0";

        }elseif($combo < -1){
            
            $datediff = 0;
            if($combo == -2){
                $datediff = 1;
            }elseif($combo == -3){
                $datediff = 3;
            }elseif($combo == -4){
                $datediff = 7;
            }elseif($combo == -5){
                $datediff = 31;
            }
            $enddate = GetMkTime(strtotime("+{$datediff} day"));

            $where .= " AND c.`combo_id` != 0 AND c.`combo_enddate` != -1 AND c.`combo_enddate` <= $enddate";

        }else{
            $where .= " AND c.`combo_id`=$combo";
        }
    }

    if($admin != ""){
        $where .= " AND c.`admin` = ". $admin;
    }

	if($certState!=""){
        $where .= " AND c.`certification`=$certState";
    }

    if($stime != ""){
        $where .= " AND c.`pubdate` >= ". GetMkTime($stime." 00:00:00");
    }

    if($etime != ""){
        $where .= " AND c.`pubdate` <= ". GetMkTime($etime." 23:59:59");
    }

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "jobaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "jobaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND c.`addrid` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT count(c.`id`) FROM `#@__".$tab."` c inner join `#@__job_company_bind` b on b.`admin`=c.`admin` and b.`cid`=c.`id` and b.`release_type`=0 left join `#@__member` m on c.`userid`=m.`id` WHERE 1 = 1");
	//总条数
	$totalCount = (int)$dsql->getOne($archives.$where);
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = (int)$dsql->getOne($archives." AND c.`state` = 0".$where);
	//已审核
	$totalAudit = (int)$dsql->getOne($archives." AND c.`state` = 1".$where);
	//拒绝审核
	$totalRefuse = (int)$dsql->getOne($archives." AND c.`state` = 2".$where);
	//敏感信息
	$totalChange = (int)$dsql->getOne($archives." AND c.`changeState` = 1".$where);

	if($state != ""){

	    if($state==3){
		    $where .= " AND c.`state`=1 AND c.`changeState`=1";
        }else{
		    $where .= " AND c.`state` = $state";
        }

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}elseif($state == 3){
            $totalPage = ceil($totalChange/$pagestep);
        }
	}

	$where .= " order by c.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT c.`userid`,c.`combo_id`,c.`combo_enddate`,c.`cityid`,c.`id`, c.`title`, c.`logo`, c.`userid`, c.`people`, c.`contact`, c.`addrid`, c.`state`, c.`pubdate`,c.`changeState`,c.`certification`,c.`tag`,c.`refuse`,b.`id` 'bid' FROM `#@__".$tab."` c inner join `#@__job_company_bind` b on b.`admin`=c.`admin` and b.`cid`=c.`id` and b.`release_type`=0 left join `#@__member` m on m.`id`=c.`userid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {

		    $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$value['cityid']}");
		    $list[$key]['cityName'] = $dsql->getOne($sql) ?: "未知";

		    //统计在招职位数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`={$value['id']} and `del` = 0");
            $list[$key]['jobs'] = (int)$dsql->getOne($sql);

		    //统计在招职位数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`={$value['id']} and `state` = 1 and `del` = 0 and `off` = 0");
            $list[$key]['jobs_online'] = (int)$dsql->getOne($sql);

            //查询套餐
            if($value['combo_id']){
                $sql = $dsql::SetQuery("select `title` from `#@__job_combo` where `id`={$value['combo_id']}");
                $list[$key]['combo_name'] = $dsql->getOne($sql);
                $list[$key]['combo_enddate'] = date("Y-m-d H:i:s",$value['combo_enddate']);

                $combo_datediff = 0;
                if($value['combo_enddate'] != -1){
                    $combo_datediff = ceil(diffBetweenTwoDays(date("Y-m-d H:i:s", $value['combo_enddate']), date("Y-m-d H:i:s", GetMkTime(time())), false));
                }
                $datediff = '';
                if($combo_datediff > 0 && $combo_datediff < 31){
                    $datediff = '<font color="#ff0000">剩余'.$combo_datediff.'天</font>';
                }
                $list[$key]['combo_datediff'] = $datediff;
            }else{
                $list[$key]['combo_name'] = "-";
                $list[$key]['combo_enddate'] = "-";
            }

			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["logo"] = $value["logo"];
			$list[$key]["bid"] = $value["bid"];
			$companyAdmin = $value["admin"];
			if($companyAdmin){
			    $list[$key]["adminId"] = $companyAdmin;
			    $adminName = $dsql::SetQuery("select `nickname`,`username` from `#@__member` where `id`=".$companyAdmin);
                $adminName = $dsql->getArr($adminName);
			    $list[$key]["admin"] = $adminName['nickname'] ? $adminName['nickname'] : ( $adminName['username'] ? $adminName['username'] : '' );
            }else{
			    $list[$key]["adminId"] = 0;
			    $list[$key]["admin"] = '';
            }

			$list[$key]["certification"] = (int)$value["certification"];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$list[$key]["people"] = $value["people"];
			$list[$key]["contact"] = $value["contact"];
            $list[$key]["bindCount"] = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_company_bind` where `cid`={$value['id']}"));
            $list[$key]["bindLogsCount"] = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_companylogs` where `cid`={$value['id']}"));

			//地区
			$list[$key]["addrid"] = $value["addrid"];
            $addrname = $value['addrid'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addr"] = $addrname;
            $list[$key]["changeState"] = (int)$value["changeState"];;


            $list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["refuse"] = $value["refuse"];

			$tag = explode(",",$value['tag']);
            $tag = array_filter($tag);
			$list[$key]['tag'] = $tag;
            $adminTag = $value["tag"];
			if(!empty($tag)){
                $adminTag = $dsql->getArrList($dsql::SetQuery("select `typename`, `color` from `#@__job_companytag` where `id` in({$adminTag})"));
            }else{
                $adminTag = array();
            }
			$list[$key]['adminTag'] = $adminTag;

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
            if($do != "export"){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}, "jobCompany": '.json_encode($list).'}';
            }
		}else{
            if($do != "export"){
			    echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}}';
            }
		}

	}else{
        if($do != "export"){
		    echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}}';
        }
	}
    if($do == "export"){
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '公司名称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系人'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '职位数量'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '进行中的职位'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '套餐'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '有效期'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '入驻时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '审核状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '认证状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '主页链接'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","招聘企业.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityName']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['people']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['contact']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['jobs']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['jobs_online']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['combo_name']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['combo_enddate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['pubdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['state']==0? "待审核":($data['state']==1 ? "审核通过" : "审核拒绝")));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['certification'] ? "认证通过" : "待认证"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['url']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 招聘企业.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
    }
	die;

//删除
}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		$adminId = $userLogin->getUserID();
		$time = time();
		foreach($each as $val){

            $sql = $dsql::SetQuery("update `#@__job_company_bind` set `release_type`=1,`release_time`=$time where `admin` = $admin and `id`=$val");
            $results = $dsql->update($sql);
			if($results == "ok"){
			    $cid = $dsql->getOne($dsql::SetQuery("select `cid` from `#@__job_company_bind` where `id`=$val"));
                $sql = $dsql::SetQuery("update `#@__job_company` set `admin`=0 where `admin` = $admin and `id`=$cid");
                $results = $dsql->update($sql);
			}else{
				// 清除缓存
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("释放招聘企业", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("释放成功！").'}';
		}
		die;

	}
	die;

}
//添加标签
elseif($dopost == "addTag"){
    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            $archives = $dsql->SetQuery("SELECT `tag` FROM `#@__job_company` WHERE `id` = " . $val);
            $results = $dsql->getOne($archives);

            $results = explode(",",$results);
            $results[] = $attr;
            $results = array_filter($results);
            $results = array_unique($results);
            $results = join(",",$results);

            $archives = $dsql->SetQuery("UPDATE `#@__job_company` SET `tag` = '$results'  WHERE `admin` = $admin and `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");

            if ($results != "ok") {
                $error[] = $val;
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("添加" . $dowtitle . "信息属性", $attr);
            echo '{"state": 100, "info": ' . json_encode("属性添加成功！") . '}';
        }
    }
    die;
}
//添加标签
elseif($dopost == "delTag"){
    $each = explode(",", $id);
    $error = array();
    if ($id != "") {
        foreach ($each as $val) {
            $archives = $dsql->SetQuery("SELECT `tag` FROM `#@__job_company` WHERE `id` = " . $val);
            $results = $dsql->getOne($archives);

            if($results){
                $results = explode(",",$results);
                $okflags = array();
                foreach ($results as $f) {
                    if (!strstr($attr, $f)) $okflags[] = $f;
                }
                $results = join(",",$okflags);

                $archives = $dsql->SetQuery("UPDATE `#@__job_company` SET `tag` = '$results'  WHERE `admin` = $admin and `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "update");

                if ($results != "ok") {
                    $error[] = $val;
                }
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("添加" . $dowtitle . "信息属性", $attr);
            echo '{"state": 100, "info": ' . json_encode("属性添加成功！") . '}';
        }
    }
    die;


//更新状态
}elseif($dopost == "updateState"){
    $each = explode(",", $id);
    $error = array();
    $async = array();
    $time = time();
    $adminId = (int)$adminId;
    if($id != ""){
        foreach($each as $val){
            //审核
            if(in_array($state,["0","1","2"])){
                $sql = $dsql->SetQuery("SELECT `title`, `state`, `userid` FROM `#@__".$tab."` WHERE `admin` = $admin and `id` = ".$val);
                $res = $dsql->dsqlOper($sql, "results");
                if(!$res) continue;
                $title = $res[0]['title'];
                $state_ = $res[0]['state'];
                $userid = $res[0]['userid'];

                if($state == 2){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state.", `refuse` = '$refuse' WHERE `id` = ".$val);
                }else{
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state.", `refuse` = '' WHERE `id` = ".$val);
                }
                $results = $dsql->dsqlOper($archives, "update");

                //会员消息通知
                if($state != $state_){

                    $status = "";

                    //等待审核
                    if($state == 0){
                        $status = "进入等待审核状态。";

                    //已审核
                    }elseif($state == 1){
                        $status = "已经通过审核。";

                    //审核失败
                    }elseif($state == 2){
                        $status = "审核失败，" . $refuse;
                    }

                    $param = array(
                        "service"  => "custom",
                        "param"   => $cfg_basedomain . '/supplier/job/'
                    );

                    //获取会员名
                    $username = "";
                    $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    }

                    //自定义配置
                    $config = array(
                        "username" => $username,
                        "title" => $title,
                        "status" => $status,
                        "date" => date("Y-m-d H:i:s", GetMkTime(time())),
                        "fields" => array(
                            'keyword1' => '店铺名称',
                            'keyword2' => '审核结果',
                            'keyword3' => '处理时间'
                        )
                    );

                    updateMemberNotice($userid, "会员-店铺审核通知", $param, $config);

                }
            }
            if($results != "ok"){
                $error[] = $val;
            }else{
                // 清除缓存
                clearCache("job_company_detail", $val);
                // 取消审核
                if($state != 1 && $state_ == 1){
                    checkCache("job_company_list", $val);
                    clearCache("job_company_total", "key");
                }elseif($state == 1 && $state_ != 1){
                    updateCache("job_company_list", 300);
                    clearCache("job_company_total", "key");
                }
                $async[] = $val;
            }
        }
        dataAsync("job",$async,"company");  // 求职招聘-企业-更新状态
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            if(in_array($state,["0","1","2"])){
                adminLog("更新招聘企业状态", $id."=>".$state.'=>'.$refuse);
            }
            echo '{"state": 100, "info": '.json_encode("操作成功").'}';
        }
    }
    die;
}
//填写跟进内容
elseif($dopost == "addCompanyLog"){

    $time = strtotime($time);

    $admin = $userLogin->getUserID();

    $sql = $dsql::SetQuery("insert into `#@__job_companylogs`(`admin`,`cid`,`bid`,`type`,`time`,`content`) values($admin,$cid,$bid,$type,$time,'".addslashes($content)."')");
    $res = $dsql->update($sql);
    if($res=="ok"){
        echo json_encode(array("state"=>100,"info"=>"添加成功"));
    }else{
        echo json_encode(array("state"=>200,"info"=>"操作失败"));
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
        'ui/jquery-smartMenu.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobCompanyMy.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
    $huoniaoTag->assign('adminList', json_encode($adminListArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
