<?php
/**
 * 管理客服订单
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("kefuOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "kefuOrder.html";

$action = "travel_order";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    $where2 = getCityFilter('store.`cityid`');
    if ($adminCity){
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }
    if ($sKeyword){
        $where .=" AND `people` like '%$sKeyword%'";
    }
    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id  FROM `#@__travel_store` store WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if(!empty($sidArr)){
        $where3 = " AND `company` in (".join(",",$sidArr).")";
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
    }
    $where .= ' AND  `kefu` = 1';
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__travel_order` WHERE 1 = 1".$where);
    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";

    $archives = $dsql->SetQuery("SELECT `id`, `ret-note`, `ret-type`, `people`, `orderprice`,`procount`,`kefu`,`ordernum`,`contact` FROM `#@__travel_order`  WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");
    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["retnote"] = $value["ret-note"];
            $list[$key]["rettype"] = $value["ret-type"];
            $list[$key]["people"] = $value["people"];
            $list[$key]["price"] = $value["price"];
            $list[$key]["ordernum"] = $value["ordernum"];
            $list[$key]["mobile"] = $value["contact"];
            $totalAmount = 0;
            $orderprice = $value["orderprice"];
            $procount   = $value["procount"];
            $totalAmount += $orderprice * $procount;
            $list[$key]["totalmoney"] = $totalAmount;
        }


        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "kefuOrder": ' . json_encode($list) . '}';
            die;
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}}';
        }

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ' }}';
    }
    die;

//删除
}elseif($dopost == "del") {
    if (!testPurview("kefuOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__travel_order` WHERE `id` = ".$val);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
                //未付款 已取消 交易完成 退款成功
                if($results['orderstate'] == 0 || $results['orderstate'] == 7 || $results['orderstate'] == 3 || $results['orderstate'] == 9){
                    $archives = $dsql->SetQuery("DELETE FROM `#@__travel_order` WHERE `id` = ".$val);
                    $dsql->dsqlOper($archives, "update");
                    adminLog("删除客服订单", $val);
                    echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
                    die;
                }else{
                    echo '{"state": 100, "info": ' . json_encode("订单为不可删除状态！") . '}';
                    die;
                }

        }else{
            echo '{"state": 100, "info": ' . json_encode("订单不存在，或已经删除！！") . '}';
            die;

        }

    }
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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/travel/kefuOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
