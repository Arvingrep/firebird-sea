<?php
/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/order";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_order";
$templates = "waimaiOrderSearch.html";


// 搜索结果 或导出
if($action == "search" || $action == "export"){

    $where = " AND o.`sid` in ($managerIds)";

    //订单编号
    if(!empty($ordernum)){
      $where .= " AND (o.`ordernum` like '%$ordernum%' OR o.`ordernumstore` like '%$ordernum%')";
    }

    //店铺名称
    if(!empty($shopname)){
      $where .= " AND s.`shopname` like '%$shopname%'";
    }

    //店铺ID
    if(!empty($shopid)){
      $where .= " AND o.`sid` = $shopid";
    }

    //姓名
    if(!empty($person)){
      $where .= " AND o.`person` LIKE '%$person%'";
    }

    //顾客ID
    if(!empty($personId)){
      $where .= " AND o.`uid` = $personId";
    }

    //电话
    if(!empty($tel)){
      $where .= " AND o.`tel` like '%$tel%'";
    }

    //下单时间
    if(!empty($paydate)){
      $start = $paydate[0];
      $end = $paydate[1];

      $where1 = "";
      if(!empty($start)){
        $start = GetMkTime($start);
        $where1 = "o.`pubdate` >= $start";
      }
      if(!empty($end)){
        $end = GetMkTime($end);
        $where1 = $where1 == "" ? "o.`pubdate` <= $end" : ($where1." AND "."o.`pubdate` <= $end");
      }

      if($where1 != ""){
        $where .= " AND (".$where1.")";
      }
    }

    //配送员
    if(!empty($peisongid)){
      $where .= " AND o.`peisongid` = $peisongid";
    }

    //支付方式
    if(!empty($paytype)){
        if($paytype == 'online'){
            $where .= " AND (o.`paytype` = 'alipay' || `paytype` = 'wxpay')";
        }else{
            $where .= " AND o.`paytype` = '$paytype'";
        }
    }

    //订单金额
    if(!empty($amount)){
        $min = $amount[0];
        $max = $amount[1];

        $min = $min ? (int)$min : 0;
        $max = $max ? (int)$max : 0;

        $where1 = "";

        if(!empty($min)){
          $where1 = "o.`amount` >= $min";
        }
        if(!empty($max)){
          $where1 = $where1 == "" ? "o.`amount` <= $max" : ($where1." AND "."o.`amount` <= $max");
        }

        if($where1 != ""){
          $where .= " AND (".$where1.")";
        }

    }

    //订单状态
    if($state != ""){
        $where .= " AND o.`state` = '$state'";
    }

    //完成时间
    if($comtime && $state != 1){
        $time = $comtime * 60;
        $where .= " AND (o.`state` = 1 && (o.`okdate` - o.`paydate` <= $time))";
    }

    $list = array();
    $pageSize = $action == "export" ? 99999999999 : 15;

    $sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`sid`, o.`ordernum`, o.`ordernumstore`, o.`state`, o.`food`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`preset`, o.`note`, o.`pubdate`, o.`okdate`, o.`amount`, o.`peisongid`, o.`peisongidlog`, o.`failed`,o.`fencheng_foodprice`,o.`fencheng_delivery`,o.`fencheng_dabao`,o.`fencheng_addservice`,o.`fencheng_discount`,o.`fencheng_promotion`,o.`fencheng_firstdiscount`,o.`fencheng_offline`,o.`fencheng_quan`, s.`shopname` FROM `#@__$dbname` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1".$where." ORDER BY o.`id` DESC");
    // echo $sql;die;

    //总条数
    $totalCount = $dsql->dsqlOper($sql, "totalCount");

    if($totalCount == 0){

      $huoniaoTag->assign("list", $list);

    }else{

      //总分页数
      $totalPage = ceil($totalCount/$pageSize);

      $p = (int)$p == 0 ? 1 : (int)$p;
      $atpage = $pageSize * ($p - 1);
      $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

      foreach ($results as $key => $value) {
        $list[$key]['id']         = $value['id'];
        $list[$key]['uid']        = $value['uid'];

        //用户名
        $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["uid"]);
        $username = $dsql->dsqlOper($userSql, "results");
        if(count($username) > 0){
            $list[$key]["username"] = $username[0]['username'];
        }else{
            $list[$key]["username"] = "未知";
        }

        $list[$key]['sid']           = $value['sid'];
        $list[$key]['shopname']      = $value['shopname'];
        $list[$key]['ordernum']      = $value['ordernum'];
        $list[$key]['ordernumstore'] = $value['ordernumstore'];
        $list[$key]['state']         = $value['state'];
        $list[$key]['food']          = unserialize($value['food']);
        $list[$key]['person']        = $value['person'];
        $list[$key]['tel']           = $value['tel'];
        $list[$key]['address']       = $value['address'];
        // $list[$key]['paytype']       = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : $value['paytype']);
        $list[$key]['paytype']      = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : ($value['paytype'] == "money" ? "余额支付" : ($value['paytype'] == "delivery" ? "货到付款" : $value['paytype']) ) );
        $list[$key]['preset']        = unserialize($value['preset']);
        $list[$key]['note']          = $value['note'];
        $list[$key]['pubdate']       = $value['pubdate'];
        $list[$key]['okdate']        = $value['okdate'];
        $list[$key]['amount']        = $value['amount'];
        $list[$key]['peisongid']     = $value['peisongid'];
        $list[$key]['peisongidlog']  = $value['peisongidlog'] ? substr($value['peisongidlog'], 0, -4) : "";
        $list[$key]['failed']        = $value['failed'];


        $list[$key]['fencheng_foodprice']           = (int)$value['fencheng_foodprice'];
        $list[$key]['fencheng_delivery']            = (int)$value['fencheng_delivery'];
        $list[$key]['fencheng_dabao']               = (int)$value['fencheng_dabao'];
        $list[$key]['fencheng_addservice']          = (int)$value['fencheng_addservice'];
        $list[$key]['fencheng_discount']            = (int)$value['fencheng_discount'];
        $list[$key]['fencheng_promotion']           = (int)$value['fencheng_promotion'];
        $list[$key]['fencheng_firstdiscount']       = (int)$value['fencheng_firstdiscount'];
        $list[$key]['fencheng_offline']             = (int)$value['fencheng_offline'];
        $list[$key]['fencheng_quan']                = (int)$value['fencheng_quan'];


        $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = ".$value['peisongid']);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $list[$key]['peisongname'] = $ret[0]['name'];
            $list[$key]['peisongtel'] = $ret[0]['phone'];
        }
      }

      $huoniaoTag->assign("state", $state);
      $huoniaoTag->assign("list", $list);

      $pagelist = new pagelist(array(
        "list_rows"   => $pageSize,
        "total_pages" => $totalPage,
        "total_rows"  => $totalCount,
        "now_page"    => $p
      ));
      $huoniaoTag->assign("pagelist", $pagelist->show());

    }
    // 导出表格
    if($action == "export"){

        if(empty($list)){
            echo '{"state": 200, "info": "暂无数据！"}';
            die;
        }
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单编号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '店铺'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '顾客ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '详情'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '备注'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '总价'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '完成时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商品原价分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送费分'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '打包分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '增值服务费分成'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '折扣分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '满减分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '首单减免分摊'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '是否扣除货到付款项'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '优惠卷分'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '真实订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '是否退款'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '退款金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家收入'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台收入'));


        $filename = date("YmdHis").time().".csv";
        $folder = HUONIAOROOT . "/uploads/waimai/export/";
        $filePath = $folder.$filename;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        fputcsv($file, $tit);

        foreach($list as $data){
            // 详情
            $data['business'] = number_format($data['business'],2);
            $data['ptyd'] = number_format($data['ptyd'],2);
            $foods = array();
            if(is_array($data['food'])){
                foreach($data['food'] as $food){
                    if (empty($food['ntitle'])){
                        array_push($foods, $food['title']."【".$food['count']."】");
                    }else{
                        array_push($foods, $food['title']."-".$food['ntitle']."【".$food['count']."】");

                    }
                }
            }

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernumstore']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['shopname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['person']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['tel']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['address']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', join(",", $foods)));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peisongname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date("Y-m-d H:i:s", $data['pubdate'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['okdate'] ? date("Y-m-d H:i:s", $data['okdate']) : ""));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_foodprice'])."%,平台:".$data['fencheng_foodprice']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_delivery'])."%,平台:".$data['fencheng_delivery']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_dabao'])."%,平台:".$data['fencheng_dabao']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_addservice'])."%,平台:".$data['fencheng_addservice']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_discount'])."%,平台:".$data['fencheng_discount']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_promotion'])."%,平台:".$data['fencheng_promotion']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_firstdiscount'])."%,平台:".$data['fencheng_firstdiscount']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_offline'])."%,平台:".$data['fencheng_offline']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "商家:".(100-$data['fencheng_quan'])."%,平台:".$data['fencheng_quan']."%"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundstate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundamount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['business']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ptyd']));



            //写入文件
            fputcsv($file, $arr);
        }

        echo '{"state": 100, "info": "'.$cfg_secureAccess.$cfg_basehost.'/uploads/waimai/export/'.$filename.'"}';
        die;

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename =".$filename."");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
        die;
    }


// 搜索表单
}else{

    // 店铺列表
    $shop = array();
    $where = " AND s.`id` in ($managerIds)";
    $sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1 = 1".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shop = $ret;
    }
    $huoniaoTag->assign('shop', $shop);

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier`  ORDER BY `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($courier, array(
                "id" => $value['id'],
                "name" => $value['name']
            ));
        }
    }
    $huoniaoTag->assign("courier", $courier);

    // 完成时间 分钟
    for($i = 1; $i <=60; $i++){
        $comtime[] = $i;
    }
    $huoniaoTag->assign("comtime", $comtime);

}

$huoniaoTag->assign("action", $action);


//配送员
$courier = array();
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier`  ORDER BY `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        array_push($courier, array(
            "id" => $value['id'],
            "name" => $value['name']
        ));
    }
}
$huoniaoTag->assign("courier", $courier);

//验证模板文件
if(file_exists($tpl."/".$templates)){
    $jsFile = array(
        'shop/waimaiOrderSearch.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
