<?php
/**
 * 店铺管理 打印机绑定
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
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("checkBusinessPrint");


$templates = "checkBusinessPrint.html";


// 获取店铺打印机
if($action == "printList"){
    $businessId= $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` ='".$id."'");
    $businessIdResult = $dsql->dsqlOper($businessId, "results");
    $printId = $businessIdResult[0]['id'] ? $businessIdResult[0]['id'] : 0;
    $archives = $dsql->SetQuery("SELECT `id`, `title`, `sid`, `mcode`, `msign`, `type`,`pubdate` FROM `#@__business_print` WHERE `sid` ='".$printId."'");
    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    $archives = $dsql->SetQuery("SELECT `id`, `title`, `sid`, `mcode`, `msign`, `type`,`pubdate` FROM `#@__business_print` WHERE `sid` ='".$printId."'");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array();
    foreach ($results as $key =>    $value) {
        $list[$key]['id'] = $value['id'];
        $list[$key]['title'] = $value['title'];
        $list[$key]['mcode'] = $value['mcode'];
        $printSql= $dsql->SetQuery("SELECT `id` FROM `#@__business_shop_print` WHERE `printid` ='".$value['id']."' AND `service` = 'maidan'");
        $sqlRes = $dsql->dsqlOper($printSql, "results");
        $list[$key]['state'] = 0;                 //是否绑定过  默认没有
        if (!empty($sqlRes)){
            $list[$key]['state'] = 1;
        }
    }
    if(count($list) > 0){
        echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalCount": '.$totalCount.' , "printList": '.json_encode($list).'}}';die;
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalCount": '.$totalCount.'}}';die;
    }
    die;
}

//店铺绑定打印机
if($action == "printBinding"){
    $archives = $dsql->SetQuery("SELECT *  FROM `#@__business_print` WHERE `id` in ($id) ");
    $sidres = $dsql->dsqlOper($archives,"results");
    //保存到主表
    foreach ($sidres  as  $k=>$v){
        $insert = $dsql->SetQuery("INSERT INTO `#@__business_shop_print` (`service`,`sid`,`printid`,`printname`) value ('maidan', '$sid','".$v['id']."','".$v['title']."')");
        $return = $dsql->dsqlOper($insert, "update");
    }
    if($return == "ok"){
        echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
    }else{
        echo $return;
    }
    die;

}

/**
 * 编辑店铺打印机
 */
if ($action == 'editBinding'){
    //格式化
    $data = str_replace("\\", '', $_POST['print_config']);
    $print_config = serialize(json_decode($data));
    $insert = $dsql->SetQuery("UPDATE `#@__business_shop_print` SET `printtemplate` = '".$print_config."' WHERE `id` = '$id' ");
    $return = $dsql->dsqlOper($insert, "update");

    if($return == "ok"){
        echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
    }else{
        echo $return;
    }
    die;

}
/**
 * 删除店铺绑定的打印机
 */
if($action == "delBinding"){

    $del = $dsql->SetQuery("DELETE  FROM `#@__business_shop_print`  WHERE `id` = ". $id);
    $return =  $dsql->dsqlOper($del, "update");
    //保存到主表

    if($return == "ok"){
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }else{
        echo $return;
    }
    die;

}

$where = " AND l.`state` != 3 AND l.`state` != 4";

//店铺名称
if(!empty($shopname)){
    $where .= " AND l.`title` like ('%$shopname%')";
}

if(!empty($printcode)){
    $archives = $dsql->SetQuery("SELECT pt.`sid`  FROM `#@__business_print` pt LEFT JOIN `#@__business_shop_print` t ON pt.`id` = t.`printid` WHERE `mcode` like '%$printcode%' OR `title` like '%$printcode%' AND  t.`service` = 'maidan'");
    $sidres = $dsql->dsqlOper($archives,"results");
    $sidArr =array();
    foreach ($sidres as $key => $value) {
        $sidArr[$key] = $value['sid'];
    }
    if (!empty($sidArr)) {
        $where .= " AND l.`id` in (" . join(",", $sidArr) . ") ";
    }
}


//城市管理员
$where .= getCityFilter('l.`cityid`');


if ($package != '') {
    $where .= " AND l.`type` = $package";
}

if ($cityid) {
    $where .= getWrongCityFilter('l.`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

$where .= " order by l.`pubdate` desc";

$pageSize = 30;


$sql = $dsql->SetQuery("SELECT l.`id`, l.`cityid`, l.`uid`, l.`title`, l.`logo`, l.`typeid`, l.`addrid`, l.`phone`, l.`email`, l.`pubdate`, l.`authattr`, l.`state`, l.`package`, l.`type` FROM `#@__business_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1 = 1".$where);
//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
if ($do != "export") {
    $sql = $sql." LIMIT $atpage, $pageSize";
}
$results = $dsql->dsqlOper($sql, "results");


$list = array();
foreach ($results as $key => $value) {
    $list[$key]['id']                   = $value['id'];
    $list[$key]['shopname']             = $value['title'];
    $cityname                           = getSiteCityName($value['cityid']);
    $list[$key]['cityname'] = $cityname;
    $archives = $dsql->SetQuery("SELECT sp.`id`, p.`title` FROM `#@__business_shop_print` sp LEFT JOIN `#@__business_print` p ON p.`id` = sp.`printid` WHERE sp.`sid` ='".$value['id']."' AND sp.`service` ='maidan' AND p.`id` > 0");
    $results = $dsql->dsqlOper($archives, "results");
    $list[$key]['printInfo']         = $results;
    if ($results){
        // foreach ($results as $k=>$v){
        //     $archives = $dsql->SetQuery("SELECT `id`, `title`, `sid`, `mcode`, `msign`, `type`,`pubdate` FROM `#@__business_print` WHERE `id` ='".$v['printid']."'");
        //     $results = $dsql->dsqlOper($archives, "results");
        //     if(!$results){
        //         $del = $dsql->SetQuery("DELETE  FROM `#@__business_shop_print`  WHERE `printid` = ". $v['printid']);
        //         $dsql->dsqlOper($del, "update");
        //     }
        // }
    }

}

$huoniaoTag->assign("shopname", $shopname);
$huoniaoTag->assign("printcode", $printcode);

$huoniaoTag->assign("list", $list);

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
        'admin/business/checkBusinessPrint.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
