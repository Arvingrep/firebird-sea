<?php
/**
 * 管理拍卖订单
 *
 * @version        $Id: paimaiOrderList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.paimai
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("paimaiOrderList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/paimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paimaiOrderList.html";

$action = "paimai_order";


if ($dopost == "getList") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page = $page == "" ? 1 : $page;
    $where = "";
    $where2 = getCityFilter('store.`cityid`');
    if ($adminCity) {
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }
    // 找出所有的商铺
    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id  FROM `#@__paimai_store` store WHERE 1=1" . $where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if (!empty($sidArr)) {
        $where3 = " AND `sid` in (" . join(",", $sidArr) . ")";
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }
    // 取得商品ID
    $proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__paimailist` WHERE 1=1" . $where3);
    $proResult = $dsql->dsqlOper($proSql, "results");
    if ($proResult) {
        $proid = array();
        foreach ($proResult as $key => $pro) {
            array_push($proid, $pro['id']);
        }
        if (!empty($proid)) {
            $where .= " AND `proid` in (" . join(",", $proid) . ")";
        }
    }
    // 查询关键字
    $sKeyword = trim($sKeyword);
    if ($sKeyword != "") {
        // 匹配商品标题
        $where .= " AND (1=2";
        $huoniaoTag->assign('sKeyword', $sKeyword);
        $proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__paimailist` WHERE `title` like '%$sKeyword%'" . $where3);
        $proResult = $dsql->dsqlOper($proSql, "results");
        if ($proResult) {
            $proid = array();
            foreach ($proResult as $key => $pro) {
                array_push($proid, $pro['id']);
            }
            if (!empty($proid)) {
                $where .= " OR `proid` in (" . join(",", $proid) . ")";
            }
        }
        // 商品ID
        if(is_numeric($sKeyword)){
            $where .= " OR proid=$sKeyword";
        }
        // 匹配用户名
        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE (`username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%')");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $userid = array();
            foreach ($userResult as $key => $user) {
                array_push($userid, $user['id']);
            }
            if (!empty($userid)) {
                $where .= " OR `userid` in (" . join(",", $userid) . "))";
            }
        } else {
            $where .= " ) ";
        }
    }
    if ($start != "") {
        $where .= " AND `orderdate` >= " . GetMkTime($start . " 00:00:00");
    }

    if ($end != "") {
        $where .= " AND `orderdate` <= " . GetMkTime($end . " 23:59:59");
    }
    if($type !=""){
        $where .= " AND `type`='$type'";
    }
    $where .= " and paistate!=3 and orderstate!=0 and orderstate!=2";
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $action . "` WHERE 1 = 1" . $where);

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //未付款
    $state0 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 0", "totalCount");
    //已交保
    $state1 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 1 and type='regist' and `success_num`=0", "totalCount");
    //待补款
    $state7 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 1 and type='regist' and `success_num`>0", "totalCount");
    //已付款
    $state6 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 1 and type='pai'", "totalCount");
    //已过期
    $state2 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 2", "totalCount");
    //已发货
    $state3 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 3", "totalCount");
    //交易成功
    $state4 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 4", "totalCount");
    //已退款
    $state5 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 5", "totalCount");

    if ($state != "") {

        if ($state != 6 && $state!=1 && $state!=7) {
            $where .= " AND `orderstate` = " . $state;
        }

        elseif($state==1){
            $where .= " AND `orderstate`=1 AND `type`='regist' and `success_num`=0";
        }
        //已付款
        elseif($state==6){
            $where .= " AND `orderstate`=1 AND `type`='pai'";
        }
        //待补款
        elseif($state==7){
            $where .= " AND `orderstate`=1 AND `type`='regist' and `success_num`>0";
        }

        if ($state == 0) {
            $totalPage = ceil($state0 / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($state1 / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($state2 / $pagestep);
        } elseif ($state == 3) {
            $totalPage = ceil($state3 / $pagestep);
        } elseif ($state == 4) {
            $totalPage = ceil($state4 / $pagestep);
        } elseif ($state == 5) {
            $totalPage = ceil($state5 / $pagestep);
        } elseif($state == 6){
            $totalPage = ceil($state6 / $pagestep);
        } elseif($state == 7){
            $totalPage = ceil($state7 / $pagestep);
        }
    }

    $where .= " order by `orderdate` desc";
    $totalPrice = 0;

    //计算总价
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__".$action."` WHERE 1 = 1".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $totalPrice = (float)$ret[0]['amount'];
    }
    $totalPrice = sprintf("%.2f", $totalPrice);


    $atpage = $pagestep * ($page - 1);
    $where .= " LIMIT $atpage, $pagestep";

    $archives = $dsql->SetQuery("SELECT `id`, `ordernum`,`type`,`amount`, `userid`, `proid`,`success_num`, `procount`, `orderstate`, `orderdate`,`paistate`, `paytype`, `paydate` FROM `#@__" . $action . "` WHERE 1 = 1 " . $where);
//	 echo $archives;die;
    $results = $dsql->dsqlOper($archives, "results");

    $list = array();
    $time = time();
    if (count($results) > 0) {
        foreach ($results as $key => $value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["ordernum"] = $value["ordernum"];
            $list[$key]["userid"] = $value["userid"];
            $list[$key]["paydate"] = $value["paydate"];

            //用户名
            $nickname = $name = $phone = '';
            $userSql = $dsql->SetQuery("SELECT `nickname`, `realname`, `phone` FROM `#@__member` WHERE `id` = " . $value["userid"]);
            $username = $dsql->dsqlOper($userSql, "results");
            if (count($username) > 0) {
                $nickname = $username[0]['nickname'];
                $name = $username[0]['realname'];
                $phone = $username[0]['phone'];
            }
            $list[$key]["nickname"] = $nickname;
            $list[$key]["name"] = $name;
            $list[$key]["phone"] = $phone;
            $list[$key]["type"] = $value['type']=="regist"?"保证金":"拍卖交易";
            $list[$key]["paistate"] = (int)$value['paistate'];
            $list[$key]["success_num"] = (int)$value['success_num'];
            $list[$key]["procount"] = $value['procount'];

            $list[$key]["proid"] = $value["proid"];
            // 获取用户最高出价
            $sqlMax = $dsql->SetQuery("select max(price_avg) max_price from `#@__paimai_order_record` where pid = {$value["proid"]} and uid={$value["userid"]}");
            $list[$key]["price_max"] = (int)$dsql->getOne($sqlMax);

            //拍卖商品
            $proSql = $dsql->SetQuery("SELECT `id`, `title`, `enddate`,`pay_limit` FROM `#@__paimailist` WHERE `id` = " . $value["proid"]);
            $proname = $dsql->dsqlOper($proSql, "results");
            if (count($proname) > 0) {
                $list[$key]["proname"] = $proname[0]['title'];
            } else {
                $list[$key]["proname"] = "未知";
            }

            $param = array(
                "service" => "paimai",
                "template" => "detail",
                "id" => $proname[0]['id']
            );
            if($value['type']=="regist" && $value['success_num']>0 && $value["orderstate"]==1 && ($proname[0]['pay_limit']*3600+$proname[0]['enddate']<$time)){
                $list[$key]['weiyue'] = 1;
            }
            $list[$key]['prourl'] = getUrlPath($param);


            //计算订单价格
            $price = $value['amount'];

            $list[$key]["orderprice"] = sprintf("%.2f", $price);

            $list[$key]["orderstate"] = $value["orderstate"];
            $list[$key]["orderdate"] = date('Y-m-d H:i:s', $value["orderdate"]);

            //主表信息
            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $value["paytype"] . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!empty($ret)) {
                $_paytype = $ret[0]['pay_name'];
            } else {
                $_paytype = getPaymentName($value["paytype"]);
            }

            $list[$key]["paytype"] = $_paytype;
        }
        if (count($list) > 0) {

            $msg = $pageInfo = array();
            $pageInfo['totalPage'] = $totalPage;
            $pageInfo['totalCount'] = $totalCount;
            $pageInfo['state0'] = $state0;
            $pageInfo['state1'] = $state1;
            $pageInfo['state2'] = $state2;
            $pageInfo['state3'] = $state3;
            $pageInfo['state4'] = $state4;
            $pageInfo['state5'] = $state5;
            $pageInfo['state6'] = $state6;
            $pageInfo['state7'] = $state7;
            $msg['state'] = 100;
            $msg['info'] = "获取成功";
            $msg['pageInfo'] = $pageInfo;
            $msg['paimaiOrderList'] = $list;
            $msg['totalPrice'] = $totalPrice;
            echo json_encode($msg);

        } else {
            $msg = $pageInfo = array();
            $pageInfo['totalPage'] = $totalPage;
            $pageInfo['totalCount'] = $totalCount;
            $pageInfo['state0'] = $state0;
            $pageInfo['state1'] = $state1;
            $pageInfo['state2'] = $state2;
            $pageInfo['state3'] = $state3;
            $pageInfo['state4'] = $state4;
            $pageInfo['state5'] = $state5;
            $pageInfo['state6'] = $state6;
            $pageInfo['state7'] = $state7;
            $msg['state'] = 101;
            $msg['info'] = "暂无相关信息";
            $msg['pageInfo'] = $pageInfo;
            $msg['totalPrice'] = $totalPrice;
            echo json_encode($msg);
        }

    } else {
        $msg = $pageInfo = array();
        $pageInfo['totalPage'] = $totalPage;
        $pageInfo['totalCount'] = $totalCount;
        $pageInfo['state0'] = $state0;
        $pageInfo['state1'] = $state1;
        $pageInfo['state2'] = $state2;
        $pageInfo['state3'] = $state3;
        $pageInfo['state4'] = $state4;
        $pageInfo['state5'] = $state5;
        $pageInfo['state6'] = $state6;
        $pageInfo['state7'] = $state7;
        $msg['state'] = 101;
        $msg['info'] = "暂无相关信息";
        $msg['pageInfo'] = $pageInfo;
        $msg['totalPrice'] = $totalPrice;
        echo json_encode($msg);
    }
    die;

//删除
} elseif ($dopost == "del") {
    if (!testPurview("delpaimaiOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        // 删除订单
        $sql = $dsql->SetQuery("DELETE FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $dsql->dsqlOper($sql, "update");
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除拍卖订单", $id);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/paimai/paimaiOrderList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $sql = $dsql->SetQuery("SELECT SUM(`commission`) as allcommission  FROM `#@__member_money` WHERE cityid =  $adminCity AND ordertype = paimai" . $wheretime);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/paimai";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
