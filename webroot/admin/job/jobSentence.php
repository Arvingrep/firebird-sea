<?php
/**
 * 管理招聘职位
 *
 * @version        $Id: jobSentence.php 2014-3-18 上午11:05:08 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobSentence" . $type);
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobSentence.html";

$urlTemplate = "";
//招聘
if($type==0){
    $tab = "job_pg";
    $urlTemplate = "general-detailzg";
}
//求职
else{
    $tab = "job_qz";
    $urlTemplate = "general-detailqz";
}

if($type == "") die('Request Error!');

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
	}

	if($sKeyword != ""){
		$where .= " AND (`title` like '%".$sKeyword."%' OR `nickname` like '%".$sKeyword."%' OR `phone` like '%".$sKeyword."%')";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1=1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `userid`, `nickname`, `phone`, `title`,  `state`, `refuse`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["url"] = getUrlPath(array(
			    'service'=>'job',
			    'template'=>$urlTemplate,
			    'id'=>$value["id"]
            ));

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname ?: "未知";

			$list[$key]["title"] = $value["title"];
			$sql = $dsql::SetQuery("select `nickname`,`username` from `#@__member` where `id`=".$value['userid']);
			$userInfo = $dsql->getArr($sql);
			$list[$key]["nickname"] = $userInfo['nickname'] ?: $userInfo['username'];
			$list[$key]["userid"] = $value['userid'];
			$list[$key]["people"] = $value["nickname"];
			$list[$key]["contact"] = $value["phone"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["refuse"] = $value["refuse"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "jobSentence": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobSentencephptype".$type."Del")){
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
				// 清除缓存
				clearCache("job_sentence_total", "key");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除普工信息", $tab."=>".join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobSentencephptype".$type."Edit")){
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

    $state = (int)$state;
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];

            if($state == 2){
                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state.", `refuse` = '$refuse' WHERE `id` = ".$val);
            }else{
			    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
            }
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				// 取消审核
				if($state != 1 && $state_ == 1){
					// checkCache("job_sentence_list", $val);
					clearCache("job_sentence_total", "key");
				}elseif($state == 1 && $state_ != 1){
					// updateCache("job_sentence_list", 300);
					clearCache("job_sentence_total", "key");
				}
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新普工信息", $tab."=>".$id."=>".$state);
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
		'admin/job/jobSentence.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('type', $type);
    $huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
