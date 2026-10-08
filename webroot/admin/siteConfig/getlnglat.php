<?php
/**
 * 自动获取网站区域经纬度
 *
 * @version        $Id: getlnglat.php 2018-03-02 下午4:08 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
set_time_limit(0);
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);

$page = empty($page) ? 1 : $page;
$pageSize = empty($pageSize) ? 100 : $pageSize;

$atpage = $pageSize*($page-1);
$archives_count =  $dsql->SetQuery("SELECT count(`id`) FROM `#@__site_area`");
//总条数
$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
$totalCount = (int)$totalResults[0][0];
//总分页数
$totalPage = ceil($totalCount/$pageSize);
if($page>$totalPage) echo '数据导入完成';
$where = " LIMIT $atpage, $pageSize";

$archives = $dsql->SetQuery("SELECT `id`,`typename`,`longitude`,`latitude`,`parentid` FROM `#@__site_area`".$where);
$result = $dsql->dsqlOper($archives, "results");
$ids= array();$editdata=array();
//dump($result);
foreach($result as $key=>$val){
    if($val['parentid']==0){
        $address=$val['typename'];
        $city=$val['typename'];
    }else{
        global $data;
        $data = "";
        //遍历所选地址名称，输出格式：地址名  地址名
        $addrParentName = getParentArr("site_area", $val['id']);
        $addrParentName = array_reverse(parent_foreach($addrParentName, "typename"));
        $address=join(" ", $addrParentName);
        $city=$addrParentName[0];
    }
    //if($val['longitude']==''||$val['latitude']==''){
        $lnglat=getlnglat($address,$city);
        if($lnglat!=""){
            $editdata[] = array(
                'id'  => $val['id'],
                'lng' => $lnglat['lng'],
                'lat' => $lnglat['lat'],
                'address'=> $address,
                'city'=>$city
            );
            $ids[] = $val['id'];
        }
    //}
}
if($ids){
    updatelgnlat($editdata,$ids);
}else{
    $page=$page+1;
    if($page>$totalPage) die;
    $url = "http://yy.huoniaomenhu.com/admin/siteConfig/getlnglat.php?step=0&page=".$page;
    ShowMsg("正在执行第{$page}页...", $url, 0, 3000);
    die;
}

//数据库导入数据
function updatelgnlat($editarray,$ids){
    global $dsql, $page, $totalPage;
    $ids = implode(',', array_values($ids));
    $sql = "UPDATE `#@__site_area` SET longitude = CASE id ";
    foreach ($editarray as $key => $val) {
        $sql .= sprintf("WHEN %d THEN %f ", $val['id'], $val['lng']);
    }
    $sql .= "END WHERE id IN ($ids)";
    $archives = $dsql->SetQuery($sql);
    $result  = $dsql->dsqlOper($archives, "results");
    $sql = "UPDATE `#@__site_area` SET latitude = CASE id ";
    foreach ($editarray as $key => $val) {
        $sql .= sprintf("WHEN %d THEN %f ", $val['id'], $val['lat']);
    }
    $sql .= "END WHERE id IN ($ids)";
    $archives = $dsql->SetQuery($sql);
    $result  = $dsql->dsqlOper($archives, "update");
    if($result != "ok"){
        echo '出错';
    }else{
        $page=$page+1;
        if($page>$totalPage) die;
        $url = "http://yy.huoniaomenhu.com/admin/siteConfig/getlnglat.php?step=1&page=".$page;
        ShowMsg("正在执行第{$page}页...", $url, 0, 3000);
        die;
    }
}

//获取经纬度
function getlnglat($address,$city){
    $ch = curl_init();
    $timeout = 0.5;
    $url='http://api.map.baidu.com/geocoder?address='.$address.'&output=json&key=E4805d16520de693a3fe707cdc962045&city='.$city;
    curl_setopt ($ch, CURLOPT_URL, str_replace(' ','%20',$url));
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    $file_contents = curl_exec($ch);
    curl_close($ch);
    $file_contents=json_decode($file_contents,true);
    $result=$file_contents['result'];
    if($result != ""){
        $lnglat = $result['location'];
    }else{
        $lnglat = "";
    }
    return $lnglat;
}