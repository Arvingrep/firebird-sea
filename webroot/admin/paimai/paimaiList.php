<?php
/**
 * 管理拍卖信息
 *
 * @version        $Id: paimaiList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.paimai
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("paimaiList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/paimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paimaiList.html";

global $handler;
$handler = true;

$action = "paimai";



if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;  // 每页大小
	$page     = $page == "" ? 1 : $page;   // 页数

	$where = "";

	// 1. 关键字（只匹配标题）
    $sKeyword = trim($sKeyword);
	if($sKeyword != ""){
	    $where .= " and (1=2";
        // 匹配商品ID
	    if(is_numeric($sKeyword)){
            $where .= " or l.`id`=".$sKeyword;
        }
	    // 匹配商品标题
		$where .= " or `title` like '%$sKeyword%'";
        // 匹配完毕
        $where .= ")";
	}
	// 2. 指定分类ID
	if($sType != ""){
        if($dsql->getTypeList($sType, $action."type")){
            global $arr_data;
            $arr_data = array();
            $lower = arr_foreach($dsql->getTypeList($sType, $action."type"));
            $lower = $sType.",".join(',',$lower);
        }else{
            $lower = $sType;
        }
        $where .= " and `ptype` in($lower)";
	}
	// 3. 指定城市
    $where2 = getCityFilter('store.`cityid`');
    if ($cityid) {
        $where2 .= getWrongCityFilter('store.`cityid`', $cityid);
    }

    // 4. 指定状态条件
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` l WHERE 1 = 1");  // 取得基本sql

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2".$where, "totalCount");
	//状态结束（需要定时任务、或手动结束，才得到此状态）
    $totalOffShelf= $dsql->dsqlOper($archives." AND `arcrank` = 3".$where, "totalCount");
    //交易成功
    $totalSuccess= $dsql->dsqlOper($archives." AND `arcrank` = 4".$where, "totalCount");
    //交易失败
    $totalFail= $dsql->dsqlOper($archives." AND `arcrank` = 5".$where, "totalCount");
    // 指定商品状态
	if($state != ""){
		$where .= " AND `arcrank` = $state";
	}

    if($state != ""){
        if($state == 0){
            $totalPage = ceil($totalGray/$pagestep);
        }elseif($state == 1){
            $totalPage = ceil($totalAudit/$pagestep);
        }elseif($state == 2){
            $totalPage = ceil($totalRefuse/$pagestep);
        }elseif($state == 3){
            $totalPage = ceil($totalOffShelf/$pagestep);
        }elseif($state == 4){
            $totalPage = ceil($totalOffShelf/$pagestep);
        }elseif($state == 5){
            $totalPage = ceil($totalOffShelf/$pagestep);
        }
    }

    $where .= " order by `pubdate` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT l.`id`, l.`sid`,l.`ptype`, l.`title`, l.`startdate`,l.`add_money`, l.`enddate`, l.`maxnum`, l.`litpic`, l.`amount`, l.`arcrank`, l.`pubdate`, l.`start_money`,l.`min_money`,l.`sale_num`,l.`buy_num`,t.`typename` FROM `#@__".$action."list` l LEFT JOIN `#@__paimaitype` t ON l.`ptype`=t.`id` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        $i = 0;
        foreach ($results as $key=>$value) {
            $property = "";
            if(GetMkTime(time()) > $value["enddate"]){
                $property = "结束";  // 时间上的结束
            }

            $list[$i]["property"] = $property;

            $list[$i]["id"] = $value["id"];
            $list[$i]["title"] = $value["title"];
            $list[$i]["startdate"] = date('Y-m-d H:i:s', $value["startdate"]);
            $list[$i]["enddate"] = date('Y-m-d H:i:s', $value["enddate"]);

            $list[$i]["maxnum"] = $value["maxnum"] == 0 ? "不限" : $value["maxnum"];
            $list[$i]["litpic"] = getFilePath($value["litpic"]);
            $list[$i]['amount'] = $value['amount']; // 保证金
            $list[$i]['start_money'] = $value['start_money']; // 起拍价
            $list[$i]['add_money'] = $value['add_money']; // 加价
            $list[$i]['min_money'] = $value['min_money']; // 保留价
            $list[$i]['sale_num'] = (int)$value['sale_num']; // 售出
            $list[$i]['buy_num'] = (int)$value['buy_num']; // 用户已购买数量

            $state_ = "";
            switch($value["arcrank"]){
                case "0":
                    $state_ = "等待审核";
                    break;
                case "1":
                    $state_ = "审核通过";
                    break;
                case "2":
                    $state_ = "审核拒绝";
                    break;
                case "3":
                    $state_ = "拍卖结束";
                    break;
                case "4":
                    $state_ = "交易成功";
                    break;
                case "5":
                    $state_ = "交易失败";
                    break;
            }
            $list[$i]["state"] = $state_;

            $list[$i]["typeid"] = $value['ptype'];
            $list[$i]["type"] = $value['typename'];

            //区域、分类
            $userSql = $dsql->SetQuery("SELECT `stype`,`addrid` FROM `#@__paimai_store` WHERE `id` = ".$value['sid']);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if($userResult){
                $list[$i]["addrid"] = $userResult[0]["addrid"];

                //区域
                if($userResult[0]["addrid"] == 0){
                    $list[$i]["addrname"] = "未知";
                }else{
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $userResult[0]["addrid"], 'type' => 'typename', 'split' => ' '));
                    $list[$i]["addrname"] = $addrname;
                }
            }

            //获取出价次数
            $sql2 = $dsql->SetQuery("select count(*) paiNum from `#@__paimai_order_record` where `pid`={$value['id']}");
            $ret2 = $dsql->dsqlOper($sql2,"results");
            $list[$i]['pai_count'] = (int)$ret2[0]['paiNum'];
            // 获取最高价
            $sql2 = $dsql->SetQuery("select max(`price_avg`) maxNum from `#@__paimai_order_record` where `pid`={$value['id']}");
            $ret2 = $dsql->dsqlOper($sql2,"results");
            $list[$i]['pai_max'] = (int)$ret2[0]['maxNum'];


            $list[$i]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $param = array(
                "service"     => "paimai",
                "template"    => "detail",
                "id"          => $value['id']
            );
            $list[$i]["url"] = getUrlPath($param);

            $i++;

        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalOffShelf":'.$totalOffShelf.', "totalSuccess":'.$totalSuccess.', "totalFail":'.$totalFail.'}, "paimaiList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalOffShelf":'.$totalOffShelf.', "totalSuccess":'.$totalSuccess.', "totalFail":'.$totalFail.'}}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalOffShelf":'.$totalOffShelf.', "totalSuccess":'.$totalSuccess.', "totalFail":'.$totalFail.'}}';
    }
    die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("editpaimai")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){


		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT l.`title`, l.`arcrank`, l.`pubdate`, s.`uid` FROM `#@__".$action."list` l LEFT JOIN `#@__".$action."_store` s ON s.`id` = l.`sid` WHERE l.`id` = $val");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$title    = $ret[0]['title'];
			$arcrank_ = $ret[0]['arcrank'];
			$pubdate  = $ret[0]['pubdate'];
			$userid   = $ret[0]['uid'];
			if($arcrank_ >= 3){  // 禁止更改
			    continue;
            }

			//会员消息通知
			if($arcrank != $arcrank_){

				$status = "";

				//等待审核
				if($arcrank == 0){
					$status = "进入等待审核状态。";

				//已审核
				}elseif($arcrank == 1){
					$status = "已经通过审核。";

				//审核失败
				}elseif($arcrank == 2){
					$status = "审核失败。";
				}
				//拍卖结束
				elseif($arcrank == 3){
				    $status = "拍卖结束";  // 终止拍卖逻辑
                }
                elseif($arcrank == 4){
                    $status = "交易成功";
                }
                elseif($arcrank == 5){
                    $status = "交易失败";
                }

				$param = array(
					"service"  => "member",
					"template" => "manage",
					"action"   => "paimai",
					"param"    => "state=".$arcrank
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
					"date" => date("Y-m-d H:i:s", $pubdate),
					"fields" => array(
						'keyword1' => '信息标题',
						'keyword2' => '发布时间',
						'keyword3' => '进展状态'
					)
				);

				updateMemberNotice($userid, "会员-发布信息审核通知", $param, $config);

			}

		}


		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `arcrank` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新拍卖商品信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif($dopost == "del") {
    if (!testPurview("delpaimai")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    $each = explode(",", $id);
    $error = array();
    $title = array();
    foreach ($each as $val) {

        $orderid = array();
        //删除相应的订单
        $orderSql = $dsql->SetQuery("SELECT `id` FROM `#@__" . $action . "_order` WHERE `proid` = " . $val);
        $orderResult = $dsql->dsqlOper($orderSql, "results");

        if ($orderResult) {
            foreach ($orderResult as $key => $order) {
                array_push($orderid, $order['id']);
            }

            // 删除订单表
            $orderSql1 = $dsql->SetQuery("DELETE FROM `#@__" . $action . "_order` WHERE `proid` = " . $val);
            $dsql->dsqlOper($orderSql1, "update");

            // 删除出价表
            $orderSql2 = $dsql->SetQuery("DELETE FROM `#@__" . $action . "_order_record` WHERE `pid` = " . $val);
            $dsql->dsqlOper($orderSql2, "update");

        }


        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "list` WHERE `id` = " . $val);
        $results = $dsql->dsqlOper($archives, "results");

        array_push($title, $results[0]['title']);
        //删除缩略图
        delPicFile($results[0]['litpic'], "delThumb", $action);
        //删除图集
        delPicFile($results[0]['pics'], "delAtlas", $action);

        $body = $results[0]['body'];
        if (!empty($body)) {
            delEditorPic($body, $action);
        }

        //删除表
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "list` WHERE `id` = " . $val);
        $results = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除拍卖信息", join(", ", $title));
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

}
//结束拍卖
elseif($dopost == "offshelf") {
    if (!testPurview("editpaimai")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    $sql = $dsql->SetQuery("select `id`,`maxnum`,`min_money` from `#@__paimailist` where id in($id) and `arcrank`=1");
    $ret = $dsql->getArrList($sql);

    $each = explode(",", $id);
    $error = array();
    $title = array();
    foreach ($each as $val) {

        // 终止处理
        // 引入 paimai.class.php
        $paimai_class = HUONIAOROOT."/api/handlers/paimai.class.php";
        if(file_exists($paimai_class)){
            require_once($paimai_class);
        }
        // 创建 paimai.class 类
        $paimai = new paimai();  // 实例化paimai类
        $paimai->stopPaiMai($ret);

    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("拍卖结束信息", join(", ", $title));
        echo '{"state": 100, "info": ' . json_encode("拍卖结束成功！") . '}';
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
		'admin/paimai/paimaiList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));

	//区域
	$addrListArr = array();



	$huoniaoTag->assign('addrListArr', json_encode($addrListArr));

	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	// $huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, $action."addr", false)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/paimai";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
