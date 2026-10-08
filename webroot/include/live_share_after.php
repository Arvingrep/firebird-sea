<?php
/**
 * 直播分享扫码
 */
require_once('common.inc.php');
$dsql = new dsql($dbo);
global $userLogin;
global $cfg_basehost;
global $cfg_secureAccess;

$share_user = $_GET['share_user'];
$share_live = $_GET['share_live'];


$login_user = $userLogin->getMemberID();

if($login_user == -1){
    $url = $cfg_secureAccess.$cfg_basehost . "/include/live_share_after.php?share_user=$share_user&share_live=$share_live";
    PutCookie("live_share_url", $url, 3600);
    $login_url =  $cfg_secureAccess.$cfg_basehost . "/login.html";
    echo "<script> window.onload = function (){alert(\"您必须先登录才能观看直播~\");window.location.href = '$login_url'; } </script>";
    exit;
}

if($login_user != $share_user){

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_share_success_user` WHERE `share_user` = $share_user AND `live_id` = $share_live AND `success_share_user` = $login_user ");
    $count = $dsql->dsqlOper($sql, "totalCount");
    if(!$count){
        $date = time();
        $sql = $dsql->SetQuery("INSERT INTO `#@__live_share_success_user` (`live_id`, `share_user`, `success_share_user`, `date`) VALUES ($share_live, $share_user, $login_user, $date)");
        $dsql->dsqlOper($sql, "update");
    }
}


$param = array(
    "service" => "live",
    "template" => "detail",
    "id" => $share_live
);
$redirect_url = getUrlPath($param);
header("Location: $redirect_url");exit;


