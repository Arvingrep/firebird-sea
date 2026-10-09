<?php
/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "paotui_order";
$templates = "paotuiOrderSearch.html";

checkPurview("waimaiOrderSearch");

// 搜索结果 或导出
if($action == "search" || $action == "export"){

    $where = "";

    $where = getCityFilter('`cityid`');
    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    //订单编号
    if(!empty($ordernum)){
        $where .= " AND (`ordernum` like '%$ordernum%')";
    }

    //店铺名称
    if(!empty($shopname)){
        $where .= " AND `shopname` like '%$shopname%'";
    }

    //店铺ID
    if(!empty($shopid)){
        $where .= " AND `sid` = $shopid";
    }

    //姓名
    if(!empty($person)){
        $where .= " AND `person` LIKE '%$person%'";
    }

    //顾客ID
    if(!empty($personId)){
        $checkMore = true;
        if(is_numeric($personId)){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = $personId");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $where .= " AND `uid` = $personId";
                $checkMore = false;
            }
        }

        if($checkMore){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` LIKE '%$personId%' || `phone` LIKE '%$personId%' || `email` LIKE '%$personId%' || `nickname` LIKE '%$personId%'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $uids = arr_foreach($ret);
                $where .= " AND o.`uid` IN (".join(",", $uids).")";
            }else{
                $where .= " AND 1 = 2";
            }
        }
    }

    //电话
    if(!empty($tel)){
        $where .= " AND `tel` like '%$tel%'";
    }

    //收货地址
    if(!empty($address)){
        $where .= " AND `address` like '%$address%'";
    }

    //下单时间
    if(!empty($paydate)){
        $start = $paydate[0];
        $end = $paydate[1];

        $where1 = "";
        if(!empty($start)){
            $start = GetMkTime($start);
            $where1 = "`pubdate` >= $start";
        }
        if(!empty($end)){
            $end = GetMkTime($end);
            $where1 = $where1 == "" ? "`pubdate` <= $end" : ($where1." AND "."`pubdate` <= $end");
        }

        if($where1 != ""){
            $where .= " AND (".$where1.")";
        }
    }

    //配送员
    if(!empty($peisongid)){
        $where .= " AND `peisongid` = $peisongid";
    }

    //支付方式
    if(!empty($paytype)){
        if($paytype == 'online'){
            $where .= " AND (`paytype` = 'alipay' || `paytype` = 'wxpay')";
        }else{
            $where .= " AND `paytype` = '$paytype'";
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
            $where1 = "`amount` >= $min";
        }
        if(!empty($max)){
            $where1 = $where1 == "" ? "o.`amount` <= $max" : ($where1." AND "."`amount` <= $max");
        }

        if($where1 != ""){
            $where .= " AND (".$where1.")";
        }

    }

    //订单状态
    if($state != ""){
        $where .= " AND `state` = '$state'";
    }

    //完成时间
    if($comtime && $state != 1){
        $time = $comtime * 60;
        $where .= " AND (`state` = 1 && (`okdate` - `paydate` <= $time))";
    }



    $list = array();
    $pageSize = $action == "export" ? 99999999999 : 15;
    $sql = $dsql->SetQuery("SELECT `id`, `uid`, `ordernum`, `state`, `person`, `tel`, `address`, `paytype`, `note`, `pubdate`, `okdate`, `amount`, `peisongid`, `peisongidlog`, `failed`,`refrundstate`,`peerpay`,`cityid`  FROM `#@__paotui_order`  WHERE 1 = 1".$where." ORDER BY `id` DESC");

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
            $staticmoney = 0;
            $list[$key]['id']         = $value['id'];
            $list[$key]['uid']        = $value['uid'];
            if($value['id']){

                $staticmoney              = getwaimai_staticmoney('2',$value['id']);
            }
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
            $list[$key]['cityname']      = getSiteCityName($value['cityid']);
            $list[$key]['ordernum']      = $value['ordernum'];
            $list[$key]['ordernumstore'] = $value['ordernumstore'];
            $list[$key]['state']         = $value['state'];
            $list[$key]['food']          = unserialize($value['food']);
            $list[$key]['person']        = $value['person'];
            $list[$key]['tel']           = $value['tel'];
            $list[$key]['address']       = $value['address'];
            $list[$key]['ptyd']          = $staticmoney['ptyd'];
            $list[$key]['business']      = $staticmoney['business'];
            // $list[$key]['paytype']       = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : $value['paytype']);
            $_paytype = getPaymentName($value['paytype']);

            if($value['peerpay'] > 0){
                $userinfo = $userLogin->getMemberInfo($value['peerpay']);
                if(is_array($userinfo)){
                    $_paytype = '['.$userinfo['nickname'].']'.$_paytype.'代付';
                }else{
                    $_paytype = '['.$value['peerpay'].']'.$_paytype.'代付';
                }
            }

            $list[$key]['paytype']      = $_paytype;
            $list[$key]['preset']        = unserialize($value['preset']);
            $list[$key]['note']          = $value['note'];
            $list[$key]['pubdate']       = $value['pubdate'];
            $list[$key]['okdate']        = $value['okdate'];
            $list[$key]['amount']        = $value['amount'];
            $list[$key]['peisongid']     = $value['peisongid'];
            $list[$key]['peisongidlog']  = $value['peisongidlog'] ? substr($value['peisongidlog'], 0, -4) : "";
            $list[$key]['failed']        = $value['failed'];
            $list[$key]['refrundstate']  = $value['refrundstate'] == 1 ? '是': '否';
            if ($value['refrundstate'] == 1){
                $list[$key]['refrundamount'] = $value['amount'];
            }
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
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '服务内容'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '顾客ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '跑腿费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '总价'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '配送员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '完成时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '是否退款'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '退款金额'));



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
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type'] == 1 ? '帮我买' : '帮我送'));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['person'].$data['tel'].$data['shop'].$data['type'] == 1 ? '购买地址' : '取货地址'.$data['buyaddress'].$data['address'].$data['price'].$data['note']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['person']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['tel']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['freight']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', join(",", $foods)));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peisongname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date("Y-m-d H:i:s", $data['pubdate'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['okdate'] ? date("Y-m-d H:i:s", $data['okdate']) : ""));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundstate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['refrundamount']));



            //写入文件
            fputcsv($file, $arr);
        }

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
    $sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1 = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shop = $ret;
    }
    $huoniaoTag->assign('shop', $shop);

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` ORDER BY `id` DESC");
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

$huoniaoTag->assign('city', $adminCityArr);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'ui/jquery.chosen.css',
        'admin/chosen.min.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` WHERE 1 = 1 " . getCityFilter('`cityid`') . " ORDER BY `id` DESC");
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

    $personId = empty($personId) ? 0 : $personId;
    $huoniaoTag->assign("personId", $personId);

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui.min.js',
        'ui/jquery.form.js',
        'ui/chosen.jquery.min.js',
        'ui/jquery-ui-timepicker-addon.js',
        'admin/waimai/paotuiOrderSearch.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
