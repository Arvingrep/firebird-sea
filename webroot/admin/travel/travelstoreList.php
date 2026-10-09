<?php
/**
 * 管理店铺
 *
 * @version        $Id: travelstoreList.php 2019-05-20 上午11:28:16 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("travelstoreList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "storeList.html";

$tab = "travel_store";

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

	if(!empty($mType)){
		$where .= " AND FIND_IN_SET('".$mType."', `bind_module`)";
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

	$where .= " order by `pubdate` desc, `weight` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `userid`, `tel`, `address`, `state`,  `weight`, `pubdate`, `bind_module`, `refuse` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = '未知';
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
			}

			$list[$key]["tel"] = $value["tel"];
			$list[$key]["address"] = $value["address"];
			$list[$key]["state"] = $value["state"];
            $list[$key]["refuse"]  = $value["refuse"];

			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			include_once HUONIAOROOT."/api/handlers/travel.class.php";
			$travel = new travel();
			$bind_moduleArr  = array();
			$bind_moduleArr_ = $value['bind_module'] ? explode(',', $value['bind_module']) : array();
			if($bind_moduleArr_){
				foreach($bind_moduleArr_ as $k => $row){
					$bind_modulename = $travel->gettypename("module_type", $row);
					array_push($bind_moduleArr, $bind_modulename);
				}
			}
			$list[$key]["typename"]  = !empty($bind_moduleArr) ? join(",", $bind_moduleArr) : $typename;

			$param = array(
				"service"     => "travel",
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
	if(!testPurview("travelstoreDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT `pics`, `video`, `note` FROM `#@__travel_store` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			delPicFile($results[0]['pics'], "delAtlas", "travel");
			delPicFile($results[0]['video'], "delVideo", "travel");
			//删除内容图片
			$body = $results[0]['note'];
			if(!empty($body)){
				delEditorPic($body, "travel");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("travel",$async,"store");  // 删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkTravelStoreCache($id);
			adminLog("删除旅游店铺信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("travelstoreEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){

            $sql = $dsql->SetQuery("SELECT `title`, `state`, `userid` FROM `#@__".$tab."` WHERE `id` = ".$val);
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) continue;
            $title = $res[0]['title'];
            $state_ = $res[0]['state'];
            $userid = $res[0]['userid'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
                    
                //失败原因
                if($state == 2){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refuse` = '$refuse' WHERE `id` = ".$val);
                    $results = $dsql->dsqlOper($archives, "update");
                }

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
                        "template" => "config",
                        "action"   => "shop"
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
		}
		dataAsync("travel",$async,"store");  // 改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkTravelStoreCache($id);
			adminLog("更新旅游店铺状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkTravelStoreCache($id){
	checkCache("travel_store_list", $id);
	clearCache("travel_store_total", 'key');
	clearCache("travel_store_detail", $id);
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
		'admin/travel/storeList.js'
	);

	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$moduleList = $travel->module_type();
	$huoniaoTag->assign('moduleListArr', json_encode($moduleList));

	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
