<?php
/**
 * 评论管理
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/";
$tpl = isMobile() ? $tpl."touch/message" : $tpl."message";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_common";
// $dbname = "public_comment";
$templates = "waimaiCommon.html";


//$where = " AND s.`id` in ($managerIds)";
//$shop = array();
//$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1 = 1".$where);
//$ret = $dsql->dsqlOper($sql, "results");
//if($ret){
//    $shop = $ret;
//}
//$huoniaoTag->assign('shop', $shop);

$list = array();
//$where = " AND c.`type` = 'waimai-order' AND c.`sid` in ($managerIds)";
$where = " AND c.`type` = 'waimai-order'";
if($sid ==''){
    $managerIdsarr = explode(',',$managerIds);

    $sid = $managerIdsarr[0];
}
if($datetime){
    $datetime = explode('/',$datetime);
    $nian     = $datetime[0];
    if(count($datetime) ==2){
        $yue      = $datetime[1];
        $ktime = mktime(0,0,0,$yue,1,$nian);
        $etime = mktime(23,59,59,($yue+1),0,$nian);

    }else{
        $ktime = mktime(0,0,0,1,1,$nian);
        $etime = mktime(23,59,59,13,0,$nian);

    }

    $where .=" AND c.`pubdate`>= $ktime AND c.`pubdate` <= $etime";
}
$where1 = '';
if($starpstype){
    if($starpstype == 1){
        $where1 .=" AND c.`star` >=1 AND c.`star` <3 ";
    }elseif ($starpstype == 2){
        /*3分*/
        $where1 .=" AND c.`star` =3";
    }elseif ($starpstype == 3){
        /*4-5分的*/
        $where1 .=" AND c.`star` >= 4 ";
    }elseif ($starpstype == 4){
        /*有内容*/
        $where1 .=" AND c.`content` != ''";
    }else{
        /*未回复*/
        $where1 .=" AND c.`reply`  = ''";
    }
}
$pageSize = 20;
$where .= " AND c.`sid` = $sid";
$huoniaoTag->assign('shopid', $sid);
if($sid && $action != 'getList' ){
    $sql = $dsql->SetQuery("SELECT  s.`shop_banner` FROM `#@__waimai_shop` s WHERE 1 = 1 AND s.`id` = $sid");
    $ret = $dsql->dsqlOper($sql, "results");
    $huoniaoTag->assign('shop_banner', getFilePath(explode(',', $ret[0]['shop_banner'])[0]));
}
$sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__$dbname` c WHERE 1 = 1".$where .$where1);
$sql1 = $dsql->SetQuery("SELECT c.`id` FROM `#@__$dbname` c WHERE 1 = 1".$where);
//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");

$totalCount0 = $dsql->dsqlOper($sql1, "totalCount");
$totalCount1 = $dsql->dsqlOper($sql1." AND `star` >=1 AND `star` <=2", "totalCount");
$totalCount2 = $dsql->dsqlOper($sql1." AND `star` =3 ", "totalCount");
$totalCount3 = $dsql->dsqlOper($sql1." AND `star` >= 4 AND star <=5","totalCount");
$totalCount4 = $dsql->dsqlOper($sql1." AND `content` != ''","totalCount");
$totalCount5 = $dsql->dsqlOper($sql1." AND `reply` = ''","totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);

$orderby = " ORDER BY c.`pubdate` DESC";
$sql = $dsql->SetQuery("SELECT c.*, o.`ordernumstore`, s.`shopname`, m.`username` FROM (`#@__$dbname` c LEFT JOIN `#@__waimai_order_all` o ON c.`oid` = o.`id`) LEFT JOIN `#@__waimai_shop` s ON c.`sid` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = c.`uid` WHERE 1 = 1".$where.$where1.$orderby);
$ret = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");
if($ret){
  foreach ($ret as $key => $value) {
    // $value['pubdatef'] = date("Y-m-d H:i:s", $value['pubdate']);
    $value['pubdatef'] = date("Y-m-d H:i:s", $value['pubdate']);
    $value['replydatef'] = $value['replydate'] ? date("Y-m-d H:i:s", $value['replydate']) : "";

    $pics = $value['pics'];
    $picsf = array();
    if($pics != ""){
        $pics = explode(",", $pics);
        foreach ($pics as $k => $v) {
          $picsf[$k] = getFilePath($v);
        }
    }

    $value['pics'] = $pics;
    $value['picsf'] = $picsf;

    $list[$key] = $value;
  }
}
$huoniaoTag->assign('list', $list);
if($sid){

    $arc = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__$dbname` WHERE `sid` = '".$sid."'");
    $ret1 = $dsql->dsqlOper($arc, "results");
    $countallsql = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__$dbname` WHERE `sid` = '$sid'");
    $countallres = $dsql->dsqlOper($countallsql, "results");

    $commentall    = $countallres ? $countallres[0]['countall'] : 0 ;
    if($ret1){
        $rating = $ret1[0]['r'];		//总评分
        $star = number_format($rating, 1);
    }else{
        $star = 0;
    }
}

$huoniaoTag->assign("store_star", $star);
$huoniaoTag->assign("store_commentall", $commentall);

$pagelist = new pagelist(array(
  "list_rows"   => $pageSize,
  "total_pages" => $totalPage,
  "total_rows"  => $totalCount,
  "now_page"    => $p
));
$pagelist->show();
$huoniaoTag->assign("pagelist", $pagelist->show());

// 移动端-获取评论列表
if($action == "getList"){

  if($totalCount == 0){

      echo '{"state": 200, "info": "暂无数据"}';

  }else{

      $pageinfo = array(
          "page" => $page,
          "pageSize" => $pageSize,
          "totalPage" => $totalPage,
          "totalCount" => $totalCount,
          "totalCount0" => $totalCount0,
          "totalCount1" => $totalCount1,
          "totalCount2" => $totalCount2,
          "totalCount3" => $totalCount3,
          "totalCount4" => $totalCount4,
          "totalCount5" => $totalCount5,
      );

      $info = array("list" => $list, "pageInfo" => $pageinfo);

      echo '{"state": 100, "info": '.json_encode($info).'}';
    }
    exit();
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
    $jsFile = array(
        'shop/waimaiCommon.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
