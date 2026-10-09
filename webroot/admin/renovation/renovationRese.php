<?php
/**
 * 装修预约
 *
 * @version        $Id: renovationRese.php 2014-3-6 下午23:47:22 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationRese");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationRese.html";

$action = "renovation_rese";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		if($results[0]["type"] == 0 && $results[0]["company"]){

			$companyid = explode(",", $results[0]["company"]);

			$yuyuename = "";

			foreach ($companyid as $k => $v) {
				$archives = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ".$v);
				$dsqlInfo = $dsql->dsqlOper($archives, "results");

				$yuyuename.= $dsqlInfo[0]["company"].",";
			}



			$results[0]["yuyuename"] = $yuyuename;

			$results[0]["typename"]  = "公司";

		}elseif($results[0]["userid"] && $results[0]["type"] == 1){

			$archives = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_foreman` WHERE `id` = ".$results[0]["userid"]);
			$dsqlInfo = $dsql->dsqlOper($archives, "results");

			$results[0]["yuyuename"] = $dsqlInfo[0]["name"];

			$results[0]["typename"]  = "工长";

		}elseif($results[0]["userid"] && $results[0]["type"] == 2){

			$archives = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_team` WHERE `id` = ".$results[0]["bid"]);
			$dsqlInfo = $dsql->dsqlOper($archives, "results");

			$results[0]["yuyuename"] = $dsqlInfo[0]["name"];

			$results[0]["typename"]  = "设计师";
		}else{
			$results[0]["yuyuename"] = "";
			$results[0]["typename"]  = "无预约对象";
		}

		if($results[0]["resetype"] == 0){
			$results[0]["resetype"] = '预约';
		}else{
			$results[0]["resetype"] = '报价';
		}

        if($results[0]['units']){
            $unitssql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['units']);
            $unitsres = $dsql->dsqlOper($unitssql,"results");
        }
		$results[0]["units"]   = $unitsres && $unitsres[0]["typename"] ? $unitsres[0]["typename"] : '';

        $addrname = $results[0]['addrid'];
        if($addrname){
            $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
        }
        $results[0]["address"] = $addrname;

		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;

//更新预约信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = '$state' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新装修预约状态为".$state, $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//更新预约状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新装修预约状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除预约
}else if($dopost == "delRese"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除装修预约", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取预约列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    // $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where2);
    // $storeResult = $dsql->dsqlOper($storeSql, "results");
    // if($storeResult){
    //     $storeid = array();
    //     foreach($storeResult as $key => $store){
    //         array_push($storeid, $store['id']);
    //     }
    //     $where .= " AND `company` in (".join(",", $storeid).")";

    // }

	if($sKeyword != ""){

		$storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$sKeyword%'".$where2);
		$storeResult = $dsql->dsqlOper($storeSql, "results");
		if($storeResult){
			$storeid = array();
			foreach($storeResult as $key => $store){
				array_push($storeid, $store['id']);
			}
			if(!empty($storeid)){
				$_where = " AND (`people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `ip` like '%$sKeyword%' OR `company` in (".join(",", $storeid)."))";
			}else{
				$_where = " AND (`people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `ip` like '%$sKeyword%')";
			}
		}else{
			$_where = " AND (`people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `ip` like '%$sKeyword%')";
		}

		$where .= $_where;
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待联系
	$totalGray = $dsql->dsqlOper($archives." WHERE `state` = 0".$where, "totalCount");
	//已联系
	$totalAudit = $dsql->dsqlOper($archives." WHERE `state` = 1".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
		    $totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
		    $totalPage = ceil($totalAudit/$pagestep);
		}
	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`,`userid`, `bid`,`type`, `company`,`resetype`,`people`, `contact`,`units`, `ip`, `ipaddr`, `state`, `pubdate` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] 	= $value["id"];
			$list[$key]["type"] = $value["type"];
            $companyarr = array();
			if($value['type'] == 0){

				if($value["company"]){

                    $companyid = explode(",", $value["company"]);
                        foreach ($companyid as $a => $b) {
                            $companyarr[$a]['companyid'] 	= $b;
                            $companyarr[$a]['typename'] 		= "公司";

                            $typeSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $b);
                            $typename = $dsql->getTypeName($typeSql);
                            $companyarr[$a]['company'] 		= $typename[0]['company'];

                            $param = array(
                                "service"     => "renovation",
                                "template"    => "company-detail",
                                "id"          => $value['company']
                            );

                            $companyarr[$a]['curl'] = getUrlPath($param);
                        }

					// $list[$key]["companyid"] = $value["company"];
					// $list[$key]["type"] 	 = "公司";
					// $typeSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $value["company"]);
					// $typename = $dsql->getTypeName($typeSql);
					// $list[$a]["company"] = $typename[0]['company'];

					 $param = array(
					 	"service"     => "renovation",
					 	"template"    => "company-detail",
					 	"id"          => $value['company']
					 );

					// $list[$key]['curl'] = getUrlPath($param);
				}

			}elseif($value['type'] == 1){
				$list[$key]["companyid"] = $value["bid"];
				$list[$key]["typename"] 	 = "工长";
				$typeSql = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_foreman` WHERE `id` = ". $value["bid"]);
				$typename = $dsql->getTypeName($typeSql);
				$list[$key]["company"] = $typename[0]['name'];

				$param = array(
				"service"     => "renovation",
				"template"    => "foreman-detail",
				"id"          => $value['bid']
			);

			}elseif($value['type'] == 2){

				$list[$key]["companyid"] = $value["bid"];
				$list[$key]["typename"] 	 = "设计师";
				$typeSql = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_team` WHERE `id` = ". $value["bid"]);
				$typename = $dsql->getTypeName($typeSql);
				$list[$key]["company"] = $typename[0]['name'];

				$param = array(
				"service"     => "renovation",
				"template"    => "designer-detail",
				"id"          => $value['bid']
				);

			}else{
				$list[$key]["typename"] 	 = "无预约";
				$list[$key]["company"] 	 = "";
				$param = array(
				);
			}

			if($value['resetype'] ==0){
				$list[$key]["resetypename"] 	= "预约";
			}else{
				$list[$key]["resetypename"] 	= "报价";
			}

			$list[$key]["people"]  = $value["people"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["ip"]      = $value["ip"];
			$list[$key]["ipaddr"]  = $value["ipaddr"];
			$list[$key]["state"]   = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["companyarr"] = $companyarr;
			$unitssql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$value['units']);
			$unitsres = $dsql->dsqlOper($unitssql,"results");
			$list[$key]["units"]   = is_array($unitsres) ? $unitsres[0]["typename"] : '';
            if($param ==''){
                $param = array();
            }
			$list[$key]['curl'] = getUrlPath($param);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}, "guestList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
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
		'admin/renovation/renovationRese.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
