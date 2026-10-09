<?php
/**
 * 管理活动
 *
 * @version        $Id: huodongList.php 2016-12-24 下午13:57:10 $
 * @package        HuoNiao.Huodong
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("huodongProductList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "huodongProductList.html";

$tab = "shop_huodongsign";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

   $where = getCityFilter('s.`cityid`');
//
//    if ($adminCity) {
//        $where = " AND `cityid` = $adminCity";
//    }
//
//    $where .= " AND `waitpay` = 0";

    $sKeyword = trim($sKeyword);
    if($sKeyword != ""){
        
        $searchtype = (int)$searchtype;

        if($searchtype == 1){
            $where .= " AND (p.`title` like '%$sKeyword%')";

        }else{

            $_where = array();
            $proSql    = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `title` like '%$sKeyword%'");
            $proResult = $dsql->dsqlOper($proSql, "results");
            if ($proResult) {
                $orderid = array();
                foreach ($proResult as $key => $pro) {
                    if($pro['id']){
                        array_push($orderid, $pro['id']);
                    }
                }
                if (!empty($orderid)) {
                    array_push($_where, "p.`store` in (" . join(",", $orderid) . ")");
                }
            }

            if($_where){
                $where .= " AND (" . join(" OR ", $_where) . ")";
            }else{
                $where .= " AND 1 = 2";
            }

        }
		
	}

	if($start != ""){
		$where .= " AND h.`ktime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND h.`etime` <= ". GetMkTime($end);
	}

//	if($sType != ""){
//		if($dsql->getTypeList($sType, "huodong_type")){
//			$lower = arr_foreach($dsql->getTypeList($sType, "huodong_type"));
//			$lower = $sType.",".join(',',$lower);
//		}else{
//			$lower = $sType;
//		}
//		$where .= " AND `typeid` in ($lower)";
//	}
//	if($sAddr != ""){
//		if($dsql->getTypeList($sAddr, "site_area")){
//			$lower = arr_foreach($dsql->getTypeList($sAddr, "site_area"));
//			$lower = $sAddr.",".join(',',$lower);
//		}else{
//			$lower = $sAddr;
//		}
//		$where .= " AND `addrid` in ($lower)";
//	}

	if($property !== ""){

        $where .= " AND h.`huodongtype` = '".$property."'";

	}

	$archives = $dsql->SetQuery("SELECT h.`id` FROM `#@__".$tab."` h LEFT JOIN `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` ON h.`proid` = p.`id`  WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND h.`state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND h.`state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND h.`state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND h.`state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT h.`id`, h.`proid`, h.`huodongprice`, h.`huodonginventory`, h.`huodongtype`, h.`ktime`, h.`etime`, h.`sid`, h.`state`, h.`pubdate`,p.`title` FROM `#@__".$tab."` h LEFT JOIN `#@__shop_product` p ON h.`proid` = p.`id` LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE 1 = 1".$where);

	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
            $list[$key]["id"]               = $value["id"];
            $list[$key]["huodongprice"]     = $value["huodongprice"];
            $list[$key]["huodonginventory"] = $value["huodonginventory"];

            //商品
//            $list[$key]["proid"] = $value["proid"];
//            $typeSql             = $dsql->SetQuery("SELECT `title` FROM `#@__shop_product` WHERE `id` = " . $value["proid"]);
//            $typename            = $dsql->getTypeName($typeSql);
            $list[$key]["title"] = $value['title'];


            $list[$key]["began"] = date("Y-m-d H:i", $value["ktime"]);
            $list[$key]["end"]   = date("Y-m-d H:i", $value["etime"]);

            $list[$key]["huodongtype"] = $value["huodongtype"];

            $huodongname = '';

            if($value["huodongtype"] == '1'){

                $huodongname = '准点抢购';

            }elseif ($value["huodongtype"] == '2'){

                $huodongname = '特价秒杀';
            }elseif ($value["huodongtype"] == '3'){

                $huodongname = '砍价狂欢';
            }elseif ($value["huodongtype"] == '4'){

                $huodongname = '拼团';
            }

            $list[$key]["huodongname"] = $huodongname;
            $list[$key]["pubdate"]     = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["state"]       = $value["state"];

            /*商家*/
            $list[$key]["sid"]       = $value["sid"];
            $storenameSql            = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `id` = " . $value["sid"]);
            $storenamename           = $dsql->getTypeName($storenameSql);
            $list[$key]["storename"] = $storenamename[0]['title'];

            $param = array(
                "service"  => "shop",
                "template" => "store-detail",
                "id"       => $value['sid']
            );
            $list[$key]["storeUrl"] = getUrlPath($param);

            $param = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => $value['proid']
            );
            $list[$key]["url"] = getUrlPath($param);


		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "huodongList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("huodongDel")){
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

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "huodongProductList");
			}

			//删除活动
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除活动信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("huodongProductEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$time = time();
	if($id != ""){
		foreach($each as $val){
            //查询之前的信息
            // $sql = $dsql->SetQuery("SELECT l.`etime` FROM `#@__shop_huodongsign` l WHERE l.`id` = $val");
            // $ret = $dsql->dsqlOper($sql, "results");
            // if($ret){
            //     if($ret[0]['etime']<$time){
            //         continue;
            //     }
            // }
            //更新状态
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
                //库存数量，使用redis优化
                if($HN_memory && $HN_memory->enable){
                    $memoryKey = "shop_product_huodong_$val";
                    $products_sql = $dsql->SetQuery("select `huodongtype`,`huodonginventory`,`huodongsales`,`pinspecification` from `#@__shop_huodongsign` where `id`=$val");
                    $products = $dsql->dsqlOper($products_sql,"results");
                    $products = $products[0];
                    //解析数据（如果是多规则，则每个规格单独设立库存）
                    if($products['pinspecification']){
                        $kucun = $products['pinspecification'];
                        $kucun = json_decode($kucun, true);
                        foreach ($kucun as $v){
                            // $eachPro = explode("#",$v);
                            // $eachPro1 = explode(",",$eachPro[0]);
                            $guige = $v['id'];  // 规格名
                            $guigeKc = $v['stock'];  // 规格库存
                            $guigeKey = $memoryKey."_".$guige;
                            $HN_memory->rm($guigeKey);  // 删除、再新增
                            // 审核通过
                            if($state==1){
                                for ($i=1;$i<=$guigeKc;$i++){  // 必须从1开始
                                    $HN_memory->rpush($guigeKey,$i);
                                }
                            }
                        }
                    }
                    // 单规格，一个商品对应一个库存
                    else{
                        $HN_memory->rm($memoryKey);  // 删除、再新增
                        $kucun = $products['huodonginventory'];
                        if($state==1){
                            for ($i=1;$i<=$kucun;$i++){ // 必须从1开始
                                $HN_memory->rpush($memoryKey,$i);
                            }
                        }
                    }
                }
            }
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新活动状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}else if ($action == "addProperty") {
	if(!testPurview("huodongProductEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();

	if($id != ""){
		foreach($each as $val){
			 $archives = $dsql->SetQuery("SELECT `flag` FROM `#@__".$tab."` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            $flag = $results[0]["flag"] == "" ? $flag : $results[0]["flag"] . "," . $flag;

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag' WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");

            if ($results != "ok") {
                $error[] = $val;
            }
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新活动状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;
}else if ($action == "delProperty") {
	if(!testPurview("huodongProductEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();

	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT `flag` FROM `#@__".$tab."` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            $flags = $results[0]["flag"];

            if (trim($flag) != '') {
                $flags = explode(',', $flags);
                $okflags = array();
                foreach ($flags as $f) {
                    if (!strstr($flag, $f)) $okflags[] = $f;
                }

                $flag = trim(join(',', $okflags));

                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag'WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "update");

                if ($results != "ok") {
                    $error[] = $val;
                }
            }
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新活动状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;
}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-selectable.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/shop/huodongProductList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "huodong_type")));
	$huoniaoTag->assign('addrListArr', json_encode(array()));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
