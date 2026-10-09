
<?php
/**
 * 管理装修招标
 *
 * @version        $Id: renovationZhaobiao.php 2014-3-4 上午09:53:15 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationZhaobiao");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationZhaobiao.html";
$tab = "renovation_zhaobiao";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `people` like '%$sKeyword%' OR `contact` like '%$sKeyword%')";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//招标中
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//招标成功
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");
	//招标结束
	$state3 = $dsql->dsqlOper($archives." AND `state` = 3".$where, "totalCount");
	//停止招标
	$state4 = $dsql->dsqlOper($archives." AND `state` = 4".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($state == 4){
			$totalPage = ceil($state4/$pagestep);
		}
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`,`company`,`people`, `contact`, `addrid`, `end`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];

			$list[$key]["addrid"] = $value["addrid"];

			//地区
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ". $value["addrid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["addr"] = $typename[0]['typename'];

			$list[$key]["people"] 		= $value["people"];
			$list[$key]["contact"] 		= $value["contact"];
			$list[$key]["state"] 		= $value["state"];
			$list[$key]["weight"] 		= $value["weight"];
			$list[$key]["pubdate"] 		= date('Y-m-d H:i:s', $value["pubdate"]);

			$companyarr = explode(",", $value["company"]);

			$company = array();

			foreach ($companyarr as $k => $v) {
				if($v!=''){

					$companysql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ".$v);
					$companyres = $dsql->dsqlOper($companysql,"results");
				}
				$company[$k]['company'] = $companyres ? $companyres[0]['company'] :'';

				$param = array(
				"service"     => "renovation",
				"template"    => "company-detail",
				"id"          => $v
				);
				$company[$k]['url'] 		= getUrlPath($param);
			}

			$list[$key]["company"] = $company;

			// $param = array(
			// 	"service"     => "renovation",
			// 	"template"    => "zb-detail",
			// 	"id"          => $value['id']
			// );
			// $list[$key]['url'] = getUrlPath($param);

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}, "renovationZhaobiao": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("renovationZhaobiaoDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//删除下属投标信息 start
			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_toubiao` WHERE `aid` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			foreach($results as $k => $v){
				//删除附件
				delPicFile($v['file'], "delFile", "renovation");

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_toubiao` WHERE `id` = ".$v['id']);
				$dsql->dsqlOper($archives, "update");
			}
			//删除下属投标信息 end

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['floorplans'], "delCard", "renovation");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除装修招标", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("renovationZhaobiaoEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT `end` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){

				// if($results[0]['end'] < GetMkTime(time())){
				// 	$error[] = $val;  //已结束的不能更改状态
				// }else{
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "update");
					if($results != "ok"){
						$error[] = $val;
					}
				// }
			}else{
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新装修招标状态", $id."=>".$state);
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
		'admin/renovation/renovationZhaobiao.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode(array()));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
