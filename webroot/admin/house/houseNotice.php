<?php
/**
 * 楼盘、房源订阅通知
 *
 * @version        $Id: houseNotice.php 2014-01-14 下午22:17:10 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseNoticeloupan");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseNotice.html";

$db = "house_notice";

//删除
if($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
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
		adminLog("删除房产订阅信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    $houseid = array();
    if($action == "loupan") {
        $loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE 1=1" . $where2);
        $loupanResult = $dsql->dsqlOper($loupanSql, "results");
        if ($loupanResult) {
            foreach ($loupanResult as $key => $loupan) {
                array_push($houseid, $loupan['id']);
            }
            $where .= " AND `aid` in (".join(",", $houseid).")";
        }else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
            die;
        }
    }else{
        $listingSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_listing` WHERE 1=1".$where2);
        $listingResult = $dsql->dsqlOper($listingSql, "results");
        if($listingResult){
            foreach($listingResult as $key => $listing){
                array_push($houseid, $listing['id']);
            }
            $where .= " AND `aid` in (".join(",", $houseid).")";
        }else{
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
            die;
        }
    }

	if($sKeyword != ""){
        $houseid = array();
        if($action == "loupan") {
            $loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `title` like '%$sKeyword%'" . $where2);
            $loupanResult = $dsql->dsqlOper($loupanSql, "results");
            if ($loupanResult) {
                foreach ($loupanResult as $key => $loupan) {
                    array_push($houseid, $loupan['id']);
                }
                $where .= " AND (`name` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `aid` in (".join(",", $houseid)."))";
            }else {
                $loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE 1=1" . $where2);
                $loupanResult = $dsql->dsqlOper($loupanSql, "results");
                if ($loupanResult) {
                    foreach ($loupanResult as $key => $loupan) {
                        array_push($houseid, $loupan['id']);
                    }
                    $where .= " AND (`name` like '%$sKeyword%' OR `phone` like '%$sKeyword%' AND `aid` in (".join(",", $houseid)."))";
                }
            }
        }else{
            $listingSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_listing` WHERE `title` like '%$sKeyword%'".$where2);
            $listingResult = $dsql->dsqlOper($listingSql, "results");
            if($listingResult){
                foreach($listingResult as $key => $listing){
                    array_push($houseid, $listing['id']);
                }
                $where .= " AND (`name` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `aid` in (".join(",", $houseid)."))";
            }else{
                $listingSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_listing` WHERE 1=1".$where2);
                $listingResult = $dsql->dsqlOper($listingSql, "results");
                if($listingResult){
                    foreach($listingResult as $key => $listing){
                        array_push($houseid, $listing['id']);
                    }
                    $where .= " AND (`name` like '%$sKeyword%' OR `phone` like '%$sKeyword%' AND `aid` in (".join(",", $houseid)."))";
                }
            }
        }
	}

	if($type != ""){
		$where .= " AND FIND_IN_SET('$type', `type`)";
	}

    $order = " order by `id` desc";
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE `action` = '".$action."'".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$limit = " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `aid`, `uid`, `type`, `name`, `phone`, `pubdate`, `state` FROM `#@__".$db."` WHERE `action` = '$action'".$where.$order.$limit);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["aid"] = $value["aid"];

			$list[$key]["uid"] = $value["uid"];
			if($value['uid'] == -1){
				$list[$key]["username"] = '游客';
			}else{
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['uid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$type = array();
			$typeArr = explode(",", $value['type']);
			foreach ($typeArr as $k => $v) {
				if($v == 1){
					$type[$k] = '变价通知';
				}elseif($v == 2){
					$type[$k] = '开盘通知';
				}elseif($v == 4){
					$type[$k] = '订阅消息';
				}
			}
			$list[$key]["type"] = join("、", $type);

			$list[$key]["name"] = $value["name"];
			$list[$key]["phone"] = $value["phone"];

			if($action == "loupan"){
				$loupanSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_loupan` WHERE `id` = ".$value['aid']);
				$loupanResult = $dsql->dsqlOper($loupanSql, "results");
				$list[$key]["loupan"] = $loupanResult[0]["title"];

				$param = array(
					"service"     => "house",
					"template"    => "loupan-detail",
					"id"          => $value['aid']
				);
				$list[$key]['url'] = getUrlPath($param);

			}else{
				$communitySql = $dsql->SetQuery("SELECT `title` FROM `#@__house_community` WHERE `id` = ".$value['aid']);
				$communityResult = $dsql->dsqlOper($communitySql, "results");
				$list[$key]["loupan"] = $communityResult[0]["title"];

				$param = array(
					"service"     => "house",
					"template"    => "community-detail",
					"id"          => $value['aid']
				);
				$list[$key]['url'] = getUrlPath($param);
			}

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["state"] = $value["state"];
		}

		//更新状态
		$sql = $dsql->SetQuery("UPDATE `#@__house_notice` SET `state` = 1 WHERE `action` = '$action'".$where);
		$dsql->dsqlOper($sql, "update");

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "houseNotice": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
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
		'admin/house/houseNotice.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
