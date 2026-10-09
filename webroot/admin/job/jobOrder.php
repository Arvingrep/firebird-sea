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
checkPurview("jobOrder");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobOrder.html";

$typeallarr = array('money'=>'余额支付');
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $typeallarr[$val['pay_code']] = $val['pay_name'];
    }
}
//订单类型
$orderType = array(
    1=>'企业套餐',
    2=>'增值包',
    3=>'简历下载',
    4=>'职位置顶',
    5=>'职位刷新',
    6=>'职位上架'
);


$tab = "job_order";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = " ";

    if ($cityid){  // 匹配商家cityid
//        $where = " AND `cityid` = $cityid";
    }

	if($sKeyword != ""){
	    $sKeyword = trim($sKeyword);
		$where .= " AND (o.`ordernum` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%')";
	}

	//订单类型
    if($type!=""){
        $where .= " AND o.`type`=$type";
    }

    //支付方式
    if($paytype!=""){
        $where .= " AND o.`paytype`='$paytype'";
    }

	$archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__".$tab."` o LEFT JOIN `#@__member` m ON o.`uid`=m.`id` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审支付
	$totalGray = $dsql->dsqlOper($archives.$where." and o.`orderstate`=0", "totalCount");
	//已支付
	$totalAudit = $dsql->dsqlOper($archives.$where." and o.`orderstate`=1", "totalCount");
	//拒绝审核
	$totalRefuse = 0;
	//敏感信息
	$totalChange = 0;

	if($state != ""){

        $where .= " AND o.`orderstate` = $state";

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
	$archives = $dsql->SetQuery("SELECT o.* FROM `#@__".$tab."` o LEFT JOIN `#@__member` m ON o.`uid`=m.`id` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$orderState = array(
	    0=>'待支付',
        1=>'已支付'
    );

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {

		    //统计在招职位数
            $sql = $dsql::SetQuery("select count(*) from `#@__job_post` where `company`={$value['id']}");
            $list[$key]['jobs'] = (int)$dsql->getOne($sql);

            //查询套餐
            if($value['combo_id']){
                $sql = $dsql::SetQuery("select `title` from `#@__job_combo` where `id`={$value['combo_id']}");
                $list[$key]['combo_name'] = $dsql->getOne($sql);
                $list[$key]['combo_enddate'] = date("Y-m-d H:i:s",$value['combo_enddate']);
            }else{
                $list[$key]['combo_name'] = "-";
                $list[$key]['combo_enddate'] = "-";
            }

			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["ordernum"] = $value["ordernum"];
			$list[$key]["amount"] = $value["amount"];
			$list[$key]["orderdate"] = date("Y-m-d H:i:s",$value["orderdate"]);
			$list[$key]["paytype"] = $typeallarr[$value["paytype"]] ?? '';
			$list[$key]["orderstate"] = (int)$value["orderstate"];
			$list[$key]["type"] = (int)$value["type"];
			$list[$key]["type_name"] = $orderType[$value["type"]];
			$list[$key]["orderstate_name"] = $orderState[$value["orderstate"]];

			$list[$key]["userid"] = $value["uid"];
			if($value["uid"] == 0){
				$list[$key]["username"] = "未知";
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `nickname`, `username` FROM `#@__member` WHERE `id` = ". $value['uid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["nickname"] ?: $username[0]["username"];
			}

			$sql = $dsql::SetQuery("select `param_data` from `#@__pay_log` where `ordernum`='".$value['ordernum']."'");
			$param_data = $dsql->getOne($sql);
			if(!empty($param_data)){
			    $param_data = unserialize($param_data);
			    $list[$key]['info'] = $param_data['subject'];
            }else{
			    $list[$key]['info'] = "";
            }

			$list[$key]["people"] = $value["people"];
			$list[$key]["contact"] = $value["contact"];

		}

		if(count($list) > 0){
            if($do != "export") {
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
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单内容'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","招聘订单.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type_name']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['orderdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderstate_name']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 招聘订单.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);

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

$huoniaoTag->assign("typeallarr", $typeallarr);
$huoniaoTag->assign("orderTypeArr", $orderType);

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
		'admin/job/jobOrder.js'
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
