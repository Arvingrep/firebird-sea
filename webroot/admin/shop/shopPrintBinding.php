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
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("shopPrintBinding");

$templates = "shopPrintBinding.html";


// 获取店铺打印机
if($action == "printList"){
    $sids = array();
    $businessId= $dsql->SetQuery("SELECT l.`id` FROM `#@__shop_store` s  LEFT JOIN `#@__business_list` l ON s.`userid` = l.`uid`  WHERE s.`id` ='".$id."' UNION ALL SELECT l.`id` FROM `#@__shop_branch_store` s  LEFT JOIN `#@__shop_store` e ON s.`branchid` = e.`id` LEFT JOIN `#@__business_list` l ON e.`userid` = l.`uid` WHERE s.`id` ='".$id."'");
    $businessIdResult = $dsql->dsqlOper($businessId, "results");
    if($businessIdResult){
        foreach($businessIdResult as $key => $val){
            array_push($sids, $val['id']);
        }
    }
    $sids = join(',', $sids);
    if (empty($sids)){
        $sids = 0;
    }
    $archives = $dsql->SetQuery("SELECT `id`, `title`, `sid`, `mcode`, `msign`, `type`,`pubdate` FROM `#@__business_print` WHERE `sid` in ($sids)");

    //总条数
    $totalCount = $dsql->dsqlOper($archives, "totalCount");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array();
    foreach ($results as $key =>    $value) {
        $list[$key]['id'] = $value['id'];
        $list[$key]['title'] = $value['title'];
        $list[$key]['mcode'] = $value['mcode'];
        $printSql= $dsql->SetQuery("SELECT `id` FROM `#@__business_shop_print` WHERE `sid` = '".$id."' AND `printid` ='".$value['id']."' AND `service` = 'shop'");
        $sqlRes = $dsql->dsqlOper($printSql, "results");
        $list[$key]['state'] = 0;                 //是否绑定过  默认没有
        if (!empty($sqlRes)){
            $list[$key]['state'] = 1;
        }
    }
    if(count($list) > 0){
        echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalCount": '.$totalCount.' , "printList": '.json_encode($list).'}}';die;
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalCount": '.$totalCount.'}}';
        die;
    }
    die;
}

//店铺绑定打印机

if($action == "printBinding"){
    $archives = $dsql->SetQuery("SELECT *  FROM `#@__business_print` WHERE `id` in($id) ");
    $sidres = $dsql->dsqlOper($archives,"results");
    //保存到主表
    foreach ($sidres  as  $k=>$v){
        $insert = $dsql->SetQuery("INSERT INTO `#@__business_shop_print` (`service`,`sid`,`printid`,`printname`) value ('shop','$sid','".$v['id']."','".$v['title']."')");
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
 * 编辑绑定打印机
 */
if ($action == 'editBinding'){
    $data = str_replace("\\", '', $print_config);
    $json = json_decode($data);
    $json = objtoarr($json);
    $printtemplate = serialize($json);
    //格式化
    $insert = $dsql->SetQuery("UPDATE `#@__business_shop_print` SET `printtemplate` = '".$printtemplate."' WHERE `id` = '$id' ");
    $return = $dsql->dsqlOper($insert, "update");
    if($return == "ok"){
        echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
    }else{
        echo $return;
    }
    die;


}

/**
 * 删除绑定的打印机
 */
if($action == "delBinding"){
    //格式化
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


/**
 * 获取列表
 */
$where = getCityFilter('s.`cityid`');
$where1 = getCityFilter('t.`cityid`');

if ($cityid) {
    $where .= getWrongCityFilter('s.`cityid`', $cityid);
    $where1 .= getWrongCityFilter('t.`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

//店铺名称
if(!empty($shopname)){
    $where .= " AND s.`title` like ('%$shopname%')";
}

if(!empty($printcode)){
    $archives = $dsql->SetQuery("SELECT pt.`sid`  FROM `#@__business_print` pt LEFT JOIN `#@__business_shop_print` t ON pt.`id` = t.`printid` WHERE pt.`mcode` like '%$printcode%' OR pt.`title` like '%$printcode%' AND  t.`service` = 'shop'");
    $sidres = $dsql->dsqlOper($archives,"results");
    $sidArr =array();
    foreach ($sidres as $key => $value) {
        $sidArr[$key] = $value['sid'];
    }
    if (!empty($sidArr)) {
        $where .= " AND l.`id` in (" . join(",", $sidArr) . ")  AND (select count(`id`) from `#@__business_shop_print` where s.`id` = `sid` AND `service` = 'shop') >0 ";

    }
}

$pageSize = 30;

$sql = $dsql->SetQuery("SELECT s.`cityid`, s.`id`, s.`title` shopname,''branchid,''branchtitle  FROM `#@__shop_store` s  LEFT JOIN  `#@__business_list` l ON s.`userid` = l.`uid`  WHERE 1 = 1 ".$where." UNION ALL SELECT t.`cityid`,e.`id`,e.`title` shopname ,t.`id` branchid ,t.`title`branchtitle FROM `#@__shop_branch_store` e LEFT JOIN `#@__shop_store` t ON e.`branchid` = t.`id` WHERE 1 = 1 ".$where1."
 ORDER BY `id` DESC");
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
    $list[$key]['branchid']             = $value['branchid'];
    $list[$key]['branchtitle']          = $value['branchtitle'];
    $list[$key]['shopname']             = $value['shopname'];
    $cityname                           = getSiteCityName($value['cityid']);
    $list[$key]['cityname'] = $cityname;
    $archives = $dsql->SetQuery("SELECT sp.`id`, p.`title` FROM `#@__business_shop_print` sp LEFT JOIN `#@__business_print` p ON p.`id` = sp.`printid` WHERE sp.`sid` ='".$value['id']."' AND sp.`service` ='shop' AND p.`id` > 0");
    $results = $dsql->dsqlOper($archives, "results");
    $list[$key]['printInfo']         = $results;
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
        'admin/shop/shopPrintBinding.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
