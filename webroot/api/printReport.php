<?php
// 打印机上报接口地址
require_once(dirname(__FILE__).'/../include/common.inc.php');

$installWaimai = $installBusiness = false;

$file = HUONIAOROOT.'/include/config/waimai.inc.php';
if(file_exists($file)){
    $installWaimai = true;
    require_once($file);
}

$file = HUONIAOROOT.'/include/config/business.inc.php';
if(file_exists($file)){
    $installBusiness = true;
    require_once($file);
}

$file = HUONIAOROOT.'/include/config/shop.inc.php';
if(file_exists($file)){
    $installShop = true;
    require_once($file);
}

if(isset($_GET['type'])){
    $customPrintPlat = $_GET['type'];
}

include('printReport_'.$customPrintPlat.'.php');