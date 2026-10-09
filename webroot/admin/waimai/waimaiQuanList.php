<?php
/**
 * 配送员管理
 *
 * @version        $Id: waimaiCourier.php 2017-5-26 上午10:46:21 $
 * @package        HuoNiao.Courier
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiQuanList");

$dbname = "waimai_quanlist";
$templates = "waimaiQuanList.html";

// 表损坏，更新优惠券使用状态 20170830
function checkState($page){
  global $dsql;
  $page = (int)$page;
  $atpage = ($page-1)*50;
  $time = time();
  $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `state` = 0 AND `deadline` < $time ORDER BY `id` DESC LIMIT $atpage, 50");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    foreach ($ret as $key => $value) {
      $qid = $value['id'];
      $sql = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__waimai_order_all` WHERE `usequan` = $qid");
      $ret = $dsql->dsqlOper($sql, "results");
      if($ret){
        $oid = $ret[0]['id'];
        $usedate = $ret[0]['pubdate'];

        $upsql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 1, `oid` = $oid, `usedate` = '$usedate' WHERE `id` = $qid");
        $dsql->dsqlOper($upsql, "update");
      }
    }
    checkState(++$page);
  }
}

//checkState(1);

$action = $_REQUEST['action'];

//删除店铺
if($action == "delete"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "删除成功！"}';
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



$where = "";

if($nickname){
  $where .= " AND m.`nickname` like '%".$nickname."%'";
}

$pageSize = 50;

$sql = $dsql->SetQuery("SELECT w.`id`,w.`qid`,w.`userid` ,w.`name` ,w.`des` ,w.`money` ,w.`basic_price` ,w.`deadline` ,w.`shopids` ,w.`fid` ,w.`pubdate` ,w.`state` ,w.`usedate` ,w.`oid`,w.`from`,w.`bear`,w.`formtype`,w.`yourself`,m.`nickname`,m.`username` FROM `#@__$dbname` w LEFT JOIN `#@__member`m  ON w.`userid` = m.`id`  WHERE w.`state` != -1 $where ORDER BY `id` DESC");

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
  foreach ($value as $k => $v) {
    if($k == "deadline"){
      $v = empty($v) ? "" : date("Y-m-d", $v);
    }
    $list[$key][$k] = $v;
  }
  if(!empty($value['shopids'])){
    $shopids = $value['shopids'];

    $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = ".explode(",", $shopids)[0]);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $list[$key]['shop'] = strstr($shopids, ",") ? $ret[0]['shopname']." 等".count(explode(",", $shopids))."家店铺" : $ret[0]['shopname'];
    }else{
      $list[$key]['shop'] = $shopids;
    }
  }else{
    $list[$key]['shop'] = '全部店铺';
  }

  $qid = (int)$value['qid'];
  if($qid){
    $sql = $dsql->SetQuery("SELECT `is_relation_food` FROM `#@__waimai_quan` WHERE `id` = $qid");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $list[$key]['is_relation_food'] = (int)$ret[0]['is_relation_food'];
    }else{
      $list[$key]['is_relation_food'] = 0;
    }
  }
}
$huoniaoTag->assign("list", $list);
$huoniaoTag->assign("nickname", $nickname);

$pagelist = new pagelist(array(
  "list_rows"   => $pageSize,
  "total_pages" => $totalPage,
  "total_rows"  => $totalCount,
  "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());



//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
		'admin/jquery-ui.css',
		'admin/styles.css',
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
		'admin/waimai/waimaiQuanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
