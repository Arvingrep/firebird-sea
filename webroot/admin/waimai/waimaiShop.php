<?php
/**
 * 店铺管理 店铺列表
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiShop");

$dbname = "waimai_shop";
$templates = "waimaiShop.html";

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;

if ($custom_otherpeisong == 2 ) {
    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
    require_once $pluginFile;
}

//更新店铺状态
if($action == "updateStatus"){

    if (!testPurview("waimaiShopEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `status` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"store");  // 更新外卖店铺状态
            echo '{"state": 100, "info": "更新成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

//更新支持预定状态
if($action == "updateReservestatus"){

    if (!testPurview("waimaiShopEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `reservestatus` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "更新成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//更新微信下单状态
if($action == "updateValid"){

    if (!testPurview("waimaiShopEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $id = $_POST['id'];

    if(!empty($id)){
        global $userLogin;
        $userid = $userLogin->getUserID();
        $cityid = $userLogin->getAdminCityIds($userid);

        $where = getCityFilter('s1.`cityid`');
        // if(empty($cityid)){
        //     echo '{"state": 200, "info": "暂无操作权限！"}';
        //     exit();
        // }else{
        //     $where .=" AND  s1.`cityid` IN (".$cityid.")";
        // }
        $val = (int)$val;

        if ($id == 'all') {
            // 关闭前记住当前状态
            if($val == 0){
                $sql = $dsql->SetQuery("UPDATE `#@__$dbname` s1 SET s1.`ordervalid` = $val, s1.`closeorder` = '$des' WHERE 1 = 1".$where);
                // 开启时恢复之前状态
            } elseif($val == 1) {
                $sql = $dsql->SetQuery("UPDATE `#@__$dbname` s1 SET s1.`ordervalid` = $val WHERE 1 = 1".$where);
            } else {
                if ($custom_otherpeisong == 2 ) {
                    $youShanSuDaClass = new youshansuda();
                    $sql = $dsql->SetQuery("SELECT `id`,`phone`,`shopname`,`address`,`coordY`,`coordX`,`category`,`cityid` FROM `#@__$dbname` WHERE `ysshop_id` = 0");

                    $res = $dsql->dsqlOper($sql, "results");

                    if ($res) {
                        foreach ($res as $k => $v) {
                            if ($v['phone'] == '' || $v['shopname'] == '' || $v['cityid'] == '' || $v['address'] == '' || $v['coordY'] == '' || $v['coordX'] == '' || $v['category'] == '0') {

                                continue;
                            }
                            /*优闪速达*/
                            include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                            $siteConfigService = new siteConfig();

                            $param   = array(
                                'tab' => 'site_area',
                                'id'  => (int)$v['cityid']
                            );
                            $handels = new handlers('siteConfig', 'getPublicParentInfo');
                            $return  = $handels->getHandle($param);

                            $province = $city = '';
                            if ($return['state'] == 100) {

                                $info     = $return['info'];
                                $province = $info['names'][0];
                                $city     = $info['names'][1];

                            }

                            $category = explode(',', $v['category']);
                            $data     = array(
                                'shop_phone'       => $v['phone'],
                                'shop_name'        => $v['shopname'],
                                'province'         => $province,
                                'city'             => $v['city'],
                                'address'          => str_replace(PHP_EOL, '', $v['address']),
                                'address_detailed' => str_replace(PHP_EOL, '', $v['address']),
                                'shop_lng'         => $v['coordY'],
                                'shop_lat'         => $v['coordX'],
                                'first_type'       => $category[0],
                                'second_type'      => $category[1],
                            );

                            $results  = $youShanSuDaClass->addShop($data);

                            if ($results['code'] == 200) {

                                $results     = $results['data'];
                                $other_param = serialize($results);
                                $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                                $dsql->dsqlOper($sql, "update");
                            } else {
                                echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                                exit();
                            }

                        }

                    }
                }
            }
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` s1 SET s1.`ordervalid` = $val, s1.`closeorder` = '$des' WHERE s1.`id` = $id".$where);
        }
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "更新成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


// 快速编辑
if($action == "fastedit"){

    if (!testPurview("waimaiShopEdit")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(empty($type) || $type == "id" || empty($id) || $val == "") echo '{"state": 200, "info": "参数错误！"}';

    if($type != "shopname" && $type != "sort" && $type != "salesman" && $type != "salesdate") echo '{"state": 200, "info": "操作错误！"}';

    if($type == "shopname"){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `shopname` = '$val' AND `id` != '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            die('{"state": 200, "info": "店铺名称已经存在！"}');
        }

        if ($custom_otherpeisong == 2 ) {

            $sql = $dsql->SetQuery("SELECT `ysshop_id`,`category`,`phone`,`cityid`,`coordY`,`coordX`,`address` FROM `#@__$dbname` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");

            $ysshop_id = (int)$ret[0]['ysshop_id'];
            if ($ysshop_id == 0) {

                $phone    = $ret[0]['phone'];
                $category = $ret[0]['category'];
                $cityid   = $ret[0]['cityid'];
                $coordY   = $ret[0]['coordY'];
                $coordX   = $ret[0]['coordX'];
                $address  = $ret[0]['address'];

                if ($shopname == '') {

                    echo '{"state": 200, "info": "优闪速达添加店铺缺少必要参数"}';
                }


                /*优闪速达*/
                include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                $siteConfigService = new siteConfig();

                $youShanSuDaClass  = new youshansuda();

                $paramarr = array(
                    'shop_id' => $ysshop_id
                );
                $results = $youShanSuDaClass->delShop($paramarr);
                if ($results['code'] != 200) {

                    echo '{"state": 200, "info": "'.$results['msg'].'"}';
                    exit();
                }

                $param   = array(
                    'tab' => 'site_area',
                    'id'  => (int)$cityid
                );
                $handels = new handlers('siteConfig', 'getPublicParentInfo');
                $return  = $handels->getHandle($param);

                $province = $city = '';
                if ($return['state'] == 100) {

                    $info     = $return['info'];
                    $province = $info['names'][0];
                    $city     = $info['names'][1];

                }

                $category = explode(',', $category);
                $data     = array(
                    'shop_phone'       => $phone,
                    'shop_name'        => $shopname,
                    'province'         => $province,
                    'city'             => $city,
                    'address'          => str_replace(PHP_EOL, '', $address),
                    'address_detailed' => str_replace(PHP_EOL, '', $address),
                    'shop_lng'         => $coordY,
                    'shop_lat'         => $coordX,
                    'first_type'       => $category[0],
                    'second_type'      => $category[1],
                );
                $results  = $youShanSuDaClass->addShop($data);

                if ($results['code'] == 200) {

                    $results     = $results['data'];
                    $other_param = serialize($results);
                    $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                    $dsql->dsqlOper($sql, "update");
                } else {
                    echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                    exit();
                }
            }
        }
    }elseif($type == "salesdate"){
        $val = GetMkTime($val);
    }

    $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `$type` = '$val' WHERE `id` = $id");
    // echo $sql;die;
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == "ok"){
        dataAsync("waimai",$id,"store");  // 快速编辑、修改外卖商店
        die('{"state": 100, "info": "修改成功！"}');
    }else{
        die('{"state": 200, "info": "修改失败！"}');
    }
}


//删除店铺-移入回收站
if($action == "delete"){

    if (!testPurview("waimaiShopDel")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(!empty($id)){

        $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state": 100, "info": "店铺不存在！"}';
            exit();
        }
        $shopname = $ret[0]['shopname'];

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `del` = 1 WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == "ok"){
            /*// 商品分类
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list_type` SET `del` = 1 WHERE `sid` = $id");
            $ret = $dsql->dsqlOper($sql, "update");

            //删除商品
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `del` = 1 WHERE `sid` = $id");
            $ret = $dsql->dsqlOper($sql, "update");*/

            echo '{"state": 100, "info": "删除成功！"}';

            dataAsync("waimai",$id,"store");  // 外卖店铺移入回收站
            adminLog("删除店铺-移入回收站", $id."-".$shopname);
            exit();

        }else{
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

        /*$sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //删除商品分类
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_list_type` WHERE `sid` = $id");
            $dsql->dsqlOper($sql, "update");

            //删除商品
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_list` WHERE `sid` = $id");
            $dsql->dsqlOper($sql, "update");

            echo '{"state": 100, "info": "删除成功！"}';
        exit();
        }else{
            echo '{"state": 200, "info": "删除失败！"}';
        exit();
        }*/

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

//彻底删除店铺
if($action == "destory"){

    if (!testPurview("waimaiShopDel")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(!empty($id)){

        $sql = $dsql->SetQuery("SELECT `shopname`,`ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state": 100, "info": "店铺不存在！"}';
            exit();
        }
        $shopname  = $ret[0]['shopname'];
        $ysshop_id = $ret[0]['ysshop_id'];

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");

        if ($custom_otherpeisong == 2 ) {
            $ysshop_id = $ret[0]['ysshop_id'];

            if ($ysshop_id != 0) {

                $youshansudaClass = new youshansuda();

                $data    = array(
                    'shop_id' => (int)$ysshop_id

                );
                $results = $youshansudaClass->delShop($data);

                if ($results['status'] != 200) {
                    echo '{"state": 200, "info": "删除失败！"}';
                    exit();
                }
            }
        }

        if($ret == "ok"){

            echo '{"state": 100, "info": "删除成功！"}';
            adminLog("删除店铺-彻底删除", $id."-".$shopname);
            exit();

        }else{
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

//从回收站恢复店铺
if($action == "recycleback"){

    if (!testPurview("waimaiShopDel")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    if(!empty($id)){

        $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state": 100, "info": "店铺不存在！"}';
            exit();
        }
        $shopname = $ret[0]['shopname'];

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `del` = 0 WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == "ok"){

            echo '{"state": 100, "info": "恢复成功！"}';

            adminLog("删从回收站恢复店铺", $id."-".$shopname);
            exit();

        }else{
            echo '{"state": 200, "info": "恢复失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

if ($action == "ynchronize") {
    if(empty($id)) {
        echo '{"state": 200, "info": "参数错误！"}';die;
    }
    $storesql = $dsql->SetQuery("SELECT `phone`,`shopname`,`cityid`,`address`,`coordX`,`coordY`,`category` FROM `#@__waimai_shop` WHERE `id` = '$id'");

    $storeres = $dsql->dsqlOper($storesql,"results");

    include_once HUONIAOROOT."/api/handlers/siteConfig.class.php";

    $siteConfigService = new siteConfig();

    $param =  array(
        'tab'   => 'site_area',
        'id'    => (int)$storeres[0]['cityid']
    );
    $handels  = new handlers('siteConfig', 'getPublicParentInfo');
    $return   = $handels->getHandle($param);

    $province = $city = '';
    if ($return['state'] == 100) {

        $info     = $return['info'];
        $province = $info['names'][0];
        $city     = $info['names'][1];

    }
    $storeres = $storeres[0];
    if ($storeres['phone'] == '' || $storeres['shopname'] == '' || $storeres['cityid'] == '' || $storeres['address'] == '' || $storeres['coordX'] == '' || $storeres['coordY'] == '' || $storeres['category'] == '0' ) {

        die('{"state": 200, "info": ' . json_encode("优闪速达添加店铺缺少必要参数！") . '}');

    }
    $category = explode(',', $storeres['category']);
    $youshansudaClass = new youshansuda();

    $data = array(
        'shop_phone'       => $storeres['phone'],
        'shop_name'        => $storeres['shopname'],
        'province'         => $province,
        'city'             => $city,
        'address'          => str_replace(PHP_EOL, '', $storeres['address']),
        'address_detailed' => str_replace(PHP_EOL, '', $storeres['address']),
        'shop_lng'         => $storeres['coordY'],
        'shop_lat'         => $storeres['coordX'],
        'first_type'       => $category[0],
        'second_type'      => $category[1],
    );
    $results     = $youshansudaClass->addShop($data);

    if ($results['code'] == 200) {

        $results     = $results['data'];
        $other_param = serialize($results);
        $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
        $dsql->dsqlOper($sql, "update");

        echo '{"state": 100, "info": "同步成功！"}';die;
    } else {
        echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
        exit();
    }
}

$del = empty($del) ? 0 : 1;
$huoniaoTag->assign('isdel', $del);
$where = " AND s.`del` = $del";

$where .= getCityFilter('`cityid`');
if ($cityid){
    $where .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

//店铺名称
if(!empty($shopname)){
    $where .= " AND s.`shopname` like ('%$shopname%')";
}

//店铺分类
if(!empty($typeid)){
    $reg = "(^$typeid$|^$typeid,|,$typeid,|,$typeid)";
    $where .= " AND s.`typeid` REGEXP '".$reg."' ";
}

//店铺分类
if(!empty($typename)){
    if(is_numeric($typename) && empty($typeid)){
        $reg = "(^$typename$|^$typename,|,$typename,|,$typename)";
        $where .= " AND s.`typeid` REGEXP '".$reg."' ";
    }else{
        $where .= " AND t.`title` like '%$typename%'";
    }
}

//分站城市
//$where .= getCityFilter('s.`cityid`');
if ($cityid) {
    $where .= getWrongCityFilter('s.`cityid`', $cityid);
}

//联系电话
if(!empty($phone)){
    $where .= " AND s.`phone` like ('%$phone%')";
}

//联系地址
if(!empty($address)){
    $where .= " AND s.`address` like ('%$address%')";
}

//管理员
if(!empty($user)){
    $ids = array();
    $sql = $dsql->SetQuery("SELECT s.`shopid` FROM `#@__waimai_shop_manager` s LEFT JOIN `#@__member` m ON m.`id` = s.`userid` WHERE m.`nickname` like '%$user%' OR m.`company` like '%$user%' OR m.`phone` like '%$user%'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($ids, $value['shopid']);
        }
    }
    if($ids){
        $ids = join(',', $ids);
        $where .= " AND s.`id` in ($ids)";
    }else{
        $where .= " AND 1 = 2";
    }
}

//业务员
if(!empty($salesman)){
    $where .= " AND s.`salesman` like ('%$salesman%')";
}

//审核中的价格
if($reviewPrice){
    $where .= " AND EXISTS (SELECT 1 FROM `#@__waimai_list` WHERE `review_price` > 0 AND `sid` = s.`id`)";
}

$pageSize = 30;

$reg = "(^s.`typeid`$|^s.`typeid`,|,s.`typeid`,|,s.`typeid`)";
$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname`, s.`sort`, s.`typeid`, s.`phone`, s.`address`, s.`status`, s.`ordervalid`, s.`print_state`, s.`bind_print`, s.`print_config`, s.`salesman`, s.`salesdate`, s.`cityid`,s.`ysshop_id`, (SELECT COUNT(`id`) FROM `#@__waimai_list` WHERE `review_price` > 0 AND `sid` = s.`id`) reviewPrice,s.`reservestatus` FROM `#@__$dbname` s LEFT JOIN `#@__waimai_shop_type` t ON t.`id` in (s.`typeid`) WHERE 1 = 1".$where." ORDER BY s.`sort` DESC, `id` DESC");

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
    $list[$key]['id']         = $value['id'];
    $list[$key]['shopname']   = $value['shopname'];
    $list[$key]['sort']       = $value['sort'];
    $list[$key]['typeid']     = $value['typeid'];
    $list[$key]['phone']      = $value['phone'];
    $list[$key]['address']    = $value['address'];
    $cityname = getSiteCityName($value['cityid']);
    $list[$key]['cityname'] = $cityname;
    $list[$key]['status']     = $value['status'];
    $list[$key]['ordervalid'] = $value['ordervalid'];
    $list[$key]['print_state'] = $value['print_state'];
    $list[$key]['bind_print'] = $value['bind_print'];
    $list[$key]['salesman']   = $value['salesman'];
    $list[$key]['ysshop_id']  = $value['ysshop_id'];
    $list[$key]['salesdate']  = empty($value['salesdate']) ? '' : date("Y-m-d", $value['salesdate']);
    $list[$key]['print_config'] = unserialize($value['print_config']);

    // 查询管理会员
    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` WHERE `shopid` = " . $value['id'] . " ORDER BY `id` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    $manager = array();
    if($ret){
        foreach ($ret as $val ) {
            $name = '';
            $uinfo = $userLogin->getMemberInfo($val['userid']);
            if(is_array($uinfo)){
                $name = $uinfo['nickname'];
            }
            if($name){
                array_push($manager, array('id' => $val['userid'], 'name' => $name));
            }
        }
    }
    $list[$key]['manager']   = $manager;

    // 分类名
    $typeArr = array();
    $typeids = explode(",", $value['typeid']);
    foreach ($typeids as $k => $val) {
        if($val){
            $typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_shop_type` WHERE `id` = ". $val);
            $type = $dsql->getTypeName($typeSql);
            array_push($typeArr, $type[0]['title']);
        }
    }
    $list[$key]['typename'] = join(" > ", $typeArr);

    $param = array(
        "service"  => "waimai",
        "template" => "shop",
        "id"       => $value['id']
    );
    $list[$key]['url'] = getUrlPath($param);
    $list[$key]['reviewPrice']  = (int)$value['reviewPrice'];

    $list[$key]['reservestatus'] = $value['reservestatus']; //是否支持预定
}

$huoniaoTag->assign("shopname", $shopname);
$huoniaoTag->assign("typename", $typename);
$huoniaoTag->assign("phone", $phone);
$huoniaoTag->assign("address", $address);
$huoniaoTag->assign("user", $user);
$huoniaoTag->assign("salesman", $salesman);
$huoniaoTag->assign("list", $list);
$huoniaoTag->assign("otherpeisong", $custom_otherpeisong);

$pagelist = new pagelist(array(
    "list_rows"   => $pageSize,
    "total_pages" => $totalPage,
    "total_rows"  => $totalCount,
    "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());

$huoniaoTag->assign('city', $adminCityArr);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/jquery-ui.css',
        'admin/styles.css',
        'ui/jquery.chosen.css',
        'admin/chosen.min.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/chosen.jquery.min.js',
        'admin/waimai/waimaiShop.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('reviewPrice', (int)$reviewPrice);

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
