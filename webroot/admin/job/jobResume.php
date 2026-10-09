<?php
/**
 * 管理招聘简历
 *
 * @version        $Id: jobResume.php 2014-3-17 下午17:49:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobResume");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobResume.html";

$tab = "job_resume";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('r.`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('r.`cityid`', $adminCity);
    }


    if($sKeyword != ""){
        //简历名称
        if($searchType=="rname"){
		    $where .= " AND (r.`name` like '%".$sKeyword."%' OR r.`alias` like '%".$sKeyword."%')";
        }
        //用户id
        elseif($searchType=="uid"){
            if(is_numeric($sKeyword)){
		        $where .= " AND (r.`userid`=$sKeyword)";
            }else{
                $where .= " AND 1=2";
            }
        }
        //用户名
        elseif($searchType=="uname"){
		    $where .= " AND (m.`username` like '%".$sKeyword."%' or m.`nickname` like '%$sKeyword%')";
        }
	}

	if($sType != ""){
		if($dsql->getTypeList($sType, "job_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "job_type"));
            $lower[] = $sType;
            $lowerCount = count($lower);
            $where .= " AND (";
            for ($ii=0; $ii<$lowerCount; $ii++){
                $where .= " FIND_IN_SET({$lower[$ii]},r.`job`)";
                if($ii!=$lowerCount-1){
                    $where .= " OR";
                }
            }
            $where .= ")";
		}else{
			$lower = $sType;
		    $where .= " AND FIND_IN_SET($lower,r.`job`)";
		}

	}

	if($start != ""){
		$where .= " AND r.`pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND r.`pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT count(r.`id`) FROM `#@__".$tab."` r left join `#@__member` m on r.`userid`=m.`id` WHERE r.`need_complete` = 1");

	//总条数
	$totalCount = (int)$dsql->getOne($archives.$where);
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = (int)$dsql->getOne($archives." AND r.`state` = 0".$where);
	//已审核
	$state1 = (int)$dsql->getOne($archives." AND r.`state` = 1".$where);
	//拒绝审核
	$state2 = (int)$dsql->getOne($archives." AND r.`state` = 2".$where);
	//已删除
	$state3 = (int)$dsql->getOne($archives." AND r.`del` = 1".$where);

	if($state != ""){
        if($state == 3){
            $where .= " AND r.`del` = 1";
            $totalPage = ceil($state3/$pagestep);
        }else{
            $where .= " AND r.`state` = $state";
            if($state == 0){
                $totalPage = ceil($state0/$pagestep);
            }elseif($state == 1){
                $totalPage = ceil($state1/$pagestep);
            }elseif($state == 2){
                $totalPage = ceil($state2/$pagestep);
            }
        }
	}

	$where .= " order by r.`weight` desc, r.`pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT r.`id`, r.`cityid`, r.`job`,r.`min_salary`, r.`max_salary`, r.`workState`, r.`work_jy`, r.`sex`, r.`userid`, r.`birth`, r.`alias`, r.`name`, r.`photo`, r.`type`, r.`phone`, r.`email`, r.`state`, r.`del`, r.`pubdate`,r.`private`, r.`refuse`, r.`default` FROM `#@__".$tab."` r left join `#@__member` m on r.`userid`=m.`id` WHERE r.`need_complete` = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["alias"] = $value["alias"];

			$list[$key]["name"] = $value["name"] ?: "未知";

			$photo = $value["photo"];
			$list[$key]["photo"] = getFilePath($photo);

            $list[$key]["userid"] = $value["userid"];
            $list[$key]["private"] = $value["private"];
            $list[$key]["del"] = $value["del"];

            $userSql = $dsql->SetQuery("SELECT `id`, `nickname` FROM `#@__member` WHERE `id` = ". $value['userid']);
            $username = $dsql->getTypeName($userSql);
            $list[$key]["nickname"] = $username[0]["nickname"] ?: "未知";

			if(empty($photo)){
				$uinfo = $userLogin->getMemberInfo($value['userid']);
				if(is_array($uinfo)){
					$photo = $uinfo['photo'];
					$list[$key]["photo"] = $photo;
				}
			}

            $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id`={$value['cityid']}");
            $list[$key]['cityName'] = $dsql->getOne($sql) ?? "未知";

			$type = $value["type"];  //多个type用第一个
			$type = explode(",",$type);
			$type = (int)$type[0];

			$list[$key]["typeid"] = $type;
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__job_type` WHERE `id` = ". $type);
			$typename = $dsql->getArr($typeSql) ?: array();
			$list[$key]["type"] = $typename["typename"] ?? '未知';

			$list[$key]["phone"] = $value["phone"];
			$list[$key]["email"] = $value["email"];
			$list[$key]["sex"] = $value["sex"]==1 ? "女" : "男";
			$birth = $value['birth'] ?: "";
			if(is_numeric($birth)){
			    $birth = (int)$birth;
			    if($birth>=0){
			        $list[$key]["age"] = getBirthAge($birth);
                }
            }
			//经验（工作经验）
            $list[$key]["work_jy"] = $value['work_jy']."年";

            //薪资要求（最低 - 最高）
            $list[$key]["min_salary"] = $value["min_salary"];
            $list[$key]["max_salary"] = $value["max_salary"];

            //期望行业
            $jobs = $value["job"];
            $jobList = array();
            if($jobs){
                $jobs = explode(",",$jobs);
                foreach ($jobs as $jobItem){
                    $sql = $dsql::SetQuery("select `typename` from `#@__job_type` where `id`=$jobItem");
                    $jobList[] = array(
                        'name'=>$dsql->getOne($sql),
                        'id'=>$jobItem
                    );
                }
            }
            $list[$key]['job'] = $jobList;

            //求职状态
            $sql = $dsql::SetQuery("select `typename` from `#@__jobitem` where `id`={$value['workState']}");
            $list[$key]["workState"] = $dsql->getOne($sql) ?: "";

            $list[$key]["age"] = $list[$key]["age"] ?: 0;
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["refuse"] = $value["refuse"];
            $list[$key]["default"] = (int)$value["default"];

			$param = array(
				"service"  => "job",
				"template" => "resume",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}, "jobResume": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobResumeDel")){
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
			delPicFile($results[0]['photo'], "delPhoto", "job");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("job_resume_list", $val);
				clearCache("job_resume_detail", $val);
				clearCache("job_resume_total", "key");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘简历信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobResumeEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

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
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state`, `userid` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];
            $userid = $res[0]['userid'];

            if($state == 2){
                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state.", `refuse` = '$refuse' WHERE `id` = ".$val);
            }else{
                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state.", `refuse` = '' WHERE `id` = ".$val);
            }

			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{

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
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "job-resume"
                    );

                    //自定义配置
                    $config = array(
                        "first" => "简历审核通知",
                        "content" => "您的简历有新的状态提醒",
                        "date" => date("Y-m-d H:i:s", GetMkTime(time())),
                        "status" => $status,
                        "color" => "",
                        "remark" => "点击查看详情",
                        "fields" => array(
                            'keyword1' => '通知内容',
                            'keyword2' => '更新时间',
                            'keyword3' => '当前状态'
                        )
                    );

                    updateMemberNotice($userid, "招聘-简历审核通知", $param, $config);

                }

				// 清除缓存
				clearCache("job_resume_detail", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("job_resume_list", $val);
					clearCache("job_resume_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("job_resume_list", 300);
					clearCache("job_resume_total", "key");
				}
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新招聘简历状态", $id."=>".$state.'=>'.$refuse);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
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
		'admin/job/jobResume.js'
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
