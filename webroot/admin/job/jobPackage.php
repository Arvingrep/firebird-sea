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
checkPurview("jobCompany");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobPackage.html";

$tab = "job_package";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = " ";

    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%')";
	}

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "site_area")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "jobaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addrid` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = 0;
	//已审核
	$totalAudit = 0;
	//拒绝审核
	$totalRefuse = 0;
	//敏感信息
	$totalChange = 0;

	if($state != ""){

	    if($state==3){
		    $where .= " AND `state`=1 AND `changeState`=1";
        }else{
		    $where .= " AND `state` = $state";
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

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$packType = array(
	    1=>'组合包',
        2=>'职位包',
        3=>'简历包',
        4=>'置顶包',
        5=>'刷新包'
    );

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {

			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["type"] = $packType[$value["type"]];
			$list[$key]["mprice"] = $value["mprice"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["recommand"] = (int)$value["recommand"];
			$list[$key]["job"] = (int)$value["job"];
			$list[$key]["resume"] = (int)$value["resume"];
			$list[$key]["refresh"] = (int)$value["refresh"];
			$list[$key]["top"] = (int)$value["top"];
			$list[$key]["buy"] = (int)$value["buy"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}, "jobCompany": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.',"totalChange":'.$totalChange.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("jobCompanyDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			//删除职位信息 start
			$archives = $dsql->SetQuery("DELETE FROM `#@__job_post` WHERE `company` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			//删除职位信息 end

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['logo'], "delLogo", "job");

			//删除图集
			$pics = $results[0]['pics'];
			if(!empty($pics)){
				$pics = explode("###", $pics);
				foreach ($pics as $key => $value) {
					$pic = explode("||", $value);
					if(!empty($pic[0])){
						delPicFile($pic[0], "delAtlas", "job");
					}
				}
			}

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "job");
			}

			//删除域名配置
			$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'job' AND `part` = '$tab' AND `iid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("job_company_list", $val);
				clearCache("job_company_detail", $val);
				clearCache("job_company_total", "key");
                $async[] = $val;
			}
		}
        dataAsync("job",$async,"company");  // 求职招聘-企业-删除信息
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘企业", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("jobCompanyEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
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
			adminLog("更新招聘企业状态", $id."=>".$state);
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
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/job/jobPackage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
