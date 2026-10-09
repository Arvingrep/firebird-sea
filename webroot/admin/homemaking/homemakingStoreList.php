<?php
/**
 * 管理店铺
 *
 * @version        $Id: storeList.php 2019-04-1 上午11:28:16 $
 * @package        HuoNiao.car
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingStoreList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingStoreList.html";

$tab = "homemaking_store";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){

        $_where = array();
        array_push($_where, "`title` like '%$sKeyword%' OR `tel` like '%$sKeyword%' OR `address` like '%$sKeyword%'");

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
                array_push($_where, "`userid` in (".join(",", $userid).")");
			}
		}

		$where .= " AND (".join(" OR ", $_where).")";
	}

	if($sType){
		if($dsql->getTypeList($sType, "homemaking_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "homemaking_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

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

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `userid`, `tel`, `address`, `state`, `typeid`, `weight`, `pubdate`, `refuse` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$list[$key]["tel"] = $value["tel"];
			$list[$key]["address"] = $value["address"];
			$list[$key]["state"] = $value["state"];
            $list[$key]["refuse"]  = $value["refuse"];

			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemaking_type` WHERE `id` = ". $value["typeid"]);
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res[0]['typename'])){
				$list[$key]["typename"] = $res[0]["typename"];
			}else{
				$list[$key]["typename"] = '';
			}

			$param = array(
				"service"     => "homemaking",
				"template"    => "store-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "storeList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("homemakingStoreDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT `pics` FROM `#@__homemaking_store` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			delPicFile($results[0]['pics'], "delAtlas", "homemaking");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("homemaking",$async,"store");  // 家政、商家、删除
        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkHomemakingStoreCache($id);
			adminLog("删除家政店铺信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("homemakingStoreEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){

            //查询信息之前的状态
			$sql = $dsql->SetQuery("SELECT `state`, `userid`, `title` FROM `#@__".$tab."` WHERE `id` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$state_ = $ret[0]['state'];
				$userid    = $ret[0]['userid'];
				$title    = $ret[0]['title'];

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
						$status = "审核失败，请检查您填写的资料。";
					}

					$param = array(
						"service"  => "member",
						"template" => "config",
						"action"   => "homemaking"
					);

					//获取会员名
					$username = "";
					$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$username = $ret[0]['username'];
					}

					//自定义配置
					$config = array(
						"username" => $username,
						"title" => $title,
						"status" => $status,
						"date" => date("Y-m-d H:i:s", time()),
						"fields" => array(
							'keyword1' => '店铺名称',
							'keyword2' => '审核结果',
							'keyword3' => '处理时间'
						)
					);

					updateMemberNotice($userid, "会员-店铺审核通知", $param, $config);

				}

			}

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
                    
                //失败原因
                if($state == 2){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refuse` = '$refuse' WHERE `id` = ".$val);
                    $results = $dsql->dsqlOper($archives, "update");
                }
                
			    $async[] = $val;
            }
		}
        dataAsync("homemaking",$async,"store");  // 家政、商家、更新状态
        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkHomemakingStoreCache($id);
			adminLog("更新家政店铺状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkHomemakingStoreCache($id){
	checkCache("homemaking_store_list", $id);
	clearCache("homemaking_store_detail", $id);
	clearCache("homemaking_store_total", 'key');
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
		'admin/homemaking/homemakingStoreList.js'
	);
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "homemaking_type"), JSON_UNESCAPED_UNICODE));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
