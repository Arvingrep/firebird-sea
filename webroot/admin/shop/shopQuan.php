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
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "shop_quan";
$templates = "shopQuan.html";

$action = $_REQUEST['action'];

//删除店铺
if($action == "delete"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            /*删除已经领取券的用户*/

            $delsql = $dsql->SetQuery("DELETE FROM `#@__shop_quanlist` WHERE `qid` = $id");
            $dsql->dsqlOper($delsql, "update");

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
}elseif ($action == "checkshop"){//查询商品
    if(!empty($keywords)){
        //这里需不需查询当前城市ID商铺的再去查询商品
        $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_product` WHERE `title` like '%$keywords%'" .$where. "LIMIT 0, 10");
        $result = $dsql->dsqlOper($sql, "results");
        if ($result) {
            echo json_encode($result);
        }
    }
    die;
}

if($dopost == 'hot'){
    if(empty($id)) die('{"state": 200, "info": "Error"}');

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $id = $ret[0]['id'];
        $state = empty($state) ? 0 : $state;

        $archives = $dsql->SetQuery("UPDATE `#@__$dbname` SET `recommend` = '$state' WHERE `id` = ".$id);
        $dsql->dsqlOper($archives, "update");

        //更新缓存

        echo '{"state": 100, "info": "修改成功！"}';
        die;
    }else{
        die('{"state": 200, "info": "Error"}');
    }
}



$where = "";

$pageSize = 20;

$sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` ORDER BY `id` DESC");
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
      if($k == "ktime" || $k == "etime"){
      $v = empty($v) ? "" : date("Y-m-d H:i:s", $v);
    }
    $list[$key][$k] = $v;
  }
  if ($value['shoptype'] == 1) {
      $fid = $value['fid'];
      $sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_product` WHERE FIND_IN_SET(`id`,'$fid')");
      $ret = $dsql->dsqlOper($sql, "results");
      if ($ret) {
//          var_dump(array_column($ret,'title'));
          $footitle = '';
          if (count($ret)>1){
              foreach ($ret as $kk=>$vv){
                  $ka = $kk+1;
                  $footitle .= "$ka".'.'."".$vv['title']."".'/'."";
              }
          }else{
              $footitle = join(',', array_column($ret,'title'));
          }
          $list[$key]['foodtitle'] = $footitle;
      } else {
          $list[$key]['foodtitle'] = '无';
      }
      $list[$key]['shoptypename'] = '指定商品';
  }else{
      $bear = $value['bear'];

      if ($bear == 1){
          $list[$key]['shoptypename'] = '商城通用';
          $list[$key]['foodtitle'] = '无';
      }else{
          $shopids = $value['shopids'];
          $sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `id` = '$shopids'");
          $ret = $dsql->dsqlOper($sql, "results");
          if ($ret) {
              $list[$key]['foodtitle'] = $ret[0]['title'];
          } else {
              $list[$key]['foodtitle'] = '无';
          }
          $list[$key]['shoptypename'] = '指定店铺';
      }

  }
}
$huoniaoTag->assign("list", $list);

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
		'admin/shop/shopQuan.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
