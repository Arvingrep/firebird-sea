<?php
/**
 * 商家域名管理
 *
 * @version        $Id: siteBusinessDomain.php 2017-7-20 上午11:02:22 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("hotKeywords");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteBusinessDomain.html";

$db = "domain";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	if($sKeyword != ""){
		$where .= " AND `domain` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `module` = '$sType'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE `part` != 'config' AND `part` != 'city' AND `module` != 'member'");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
		    $totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
		    $totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
		    $totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= $orderby ? " order by `expires` asc" : " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `domain`, `module`, `part`, `iid`, `expires`, `state` FROM `#@__".$db."` WHERE `part` != 'config' AND `part` != 'city' AND `module` != 'member'".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$list[$key]["domain"] = $value["domain"];

			$sql = $dsql->SetQuery("SELECT `title`, `subject` FROM `#@__site_module` WHERE `name` = '".$value['module']."'");
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list[$key]["module"]   = $results[0]["subject"] ? $results[0]["subject"] : $results[0]["title"];
			}else{
				$list[$key]["module"]   = $value['module'];
			}

			$getDomain = getDomain($value['module'], $value['part'], $value['iid']);
			$domain = $getDomain['domain'];
			$list[$key]["domain"] = $domain;

			$title = "";

			//自动建站
			if($value['module'] == "website"){
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__website` WHERE `id` = " . $value['iid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}
			}
			$list[$key]["title"] = $title;

			$list[$key]["expires"] = date("Y-m-d H:i:s", $value["expires"]);

			$expiresState = 0;
			if($value['expires'] < time()){
				$expiresState = 1;
			}
			$list[$key]["expiresState"] = $expiresState;

			$list[$key]["state"] = $value["state"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "keywordsList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{

			//更新规则文件
			// updateHtaccess();

			adminLog("删除商家绑定域名", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

			//消息通知
			$sql = $dsql->SetQuery("SELECT `module`, `part`, `iid`, `refund` FROM `#@__$db` WHERE `id` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$module = $ret[0]['module'];
				$part   = $ret[0]['part'];
				$iid    = $ret[0]['iid'];
				$refund = $ret[0]['refund'];

				$getDomain = getDomain($value['module'], $value['part'], $value['iid']);
				$domain = $getDomain['domain'];

				$notify = $state == 1 ? "会员-域名绑定成功" : "会员-域名绑定失败";

				//自助建站
				if($module == "website"){
					$sql = $dsql->SetQuery("SELECT `title`, `userid` FROM `#@__website` WHERE `id` = $iid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$title = $ret[0]['title'];
						$userid = $ret[0]['userid'];

						$param = array(
							"service"  => "member",
							"template" => "config",
							"action"   => "website"
						);

					}
				}

				//自定义配置
	            $config = array(
	                "title" => $title,
	                "domain" => $domain,
	                "refund" => $refund,
	                "fields" => array(
	                    'keyword1' => '店铺名称',
	                    'keyword2' => '绑定域名',
	                    'keyword3' => '审核状态'
	                )
	            );

				updateMemberNotice($userid, $notify, $param, $config);
			}

		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{

			//更新规则文件
			updateHtaccess();

			adminLog("更新商家域名状态", $id."=>".$state);
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
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/siteBusinessDomain.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
