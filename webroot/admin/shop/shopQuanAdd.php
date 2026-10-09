<?php
/**
 * 商品优惠券发放
 *
 * @version        $Id: shopQuanAdd.php 2018-09-07 上午10:46:21 $
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

$templates = "shopQuanAdd.html";


if($dopost == "submit"){

  $money = (float)$money;
  $is_relation_food = (int)$is_relation_food;
  $bear = (int)$bear;
  $name = $_POST['name'];

  if(empty($name)){
    echo '{"state":200, "info":"请填写优惠券名称"}';
    die;
  }
  if(empty($money)){
    echo '{"state":200, "info":"请填写优惠券面值"}';
    die;
  }
  if(empty($basic_price)){
    echo '{"state":200, "info":"请填写消费满多少元可用"}';
    die;
  }
  if(empty($btime)){
      echo '{"state":200, "info":"请选择开始时间"}';
      die;
  }
  if(empty($etime)){
      echo '{"state":200, "info":"请选择结束时间"}';
      die;
  }
  if(empty($product)){
      echo '{"state":200, "info":"请选择所属商品"}';
      die;
  }



  $btime = GetMkTime($btime." 00:00:00");
  $etime = GetMkTime($etime." 23:59:59");

  // 新增
  if(empty($id)){

    $pubdate = GetMkTime(time());
    $sql = $dsql->SetQuery("INSERT INTO `#@__shop_quan` (`name`, `promotio`, `basic_price`, `ktime`,`etime`, `des`,`limitcount`,`number`,`is_relation_food`,`bear`,`sent`) VALUES ('$name', '$money', '$basic_price','$btime','$etime', '$des','$limit','$number','$is_relation_food','1','$number')");
//     echo $sql;die;
    $aid = $dsql->dsqlOper($sql, "lastid");
    if(is_numeric($aid)){
      echo '{"state":100, "info":"添加成功"}';
      die;
    }else{
      echo '{"state":200, "info":"添加失败"}';
      die;
    }

  // 修改
  }else{
      $sql = $dsql->SetQuery("SELECT `id`,`number`,`received` FROM `#@__shop_quan` WHERE `id` = $id");
      $res = $dsql->dsqlOper($sql, "results");
      $sent = (int)$res[0]['number'] - (int)$res[0]['received'];

      $sent = $sent <= 0 ? $number - (int)$res[0]['received'] : $sent;

      $sent = $sent > $number ? $number : $sent;  //如果剩余量大于发放量，剩余量重置为发放量

    $sql = $dsql->SetQuery("UPDATE `#@__shop_quan` SET `name` = '$name', `des` = '$des', `promotio` = '$money', `basic_price` = '$basic_price', `ktime` = '$btime',`etime` = '$etime',`limitcount` = '$limit',`number` = '$number',`sent` = '$sent' WHERE `id` = $id");
      $ret = $dsql->dsqlOper($sql, "update");
    if($ret == "ok"){
      echo '{"state":100, "info":"修改成功"}';
      die;
    }else{
    echo '{"state":200, "info":"修改失败"}';
    die;
    }
  }


}

if($id){
  $sql = $dsql->SetQuery("SELECT * FROM `#@__shop_quan` WHERE `id` = $id");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    foreach ($ret[0] as $key => $value) {
        if($key == "btime" || $key == "etime"){
        $value = empty($value) ? "" : date("Y-m-d", $value);
      }

      $$key = $value;

      $huoniaoTag->assign($key, $value);

      if($key == "shopids"){
        $shopidsArr = empty($value) ? array() : explode(",", $value);
      }
        if($key == "fid"){
            $fidArr = array();
            if(!empty($value)){
                $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_store` WHERE `id` in ($value)");
                echo $sql;
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $fidArr = $ret;
                }
            }
        }
    }
  }
}

if($action == "getShopList"){

  $page = (int)$page == 0 ? 1 : (int)$page;
  $pageSize = (int)$pageSize == 0 ? 10 : (int)$pageSize;

  $sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname`, t.`title` FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_shop_type` t ON t.`id` in (s.`typeid`) WHERE 1 = 1".$where." ORDER BY s.`sort` DESC, `id` DESC");

  //总条数
  $totalCount = $dsql->dsqlOper($sql, "totalCount");

  if($totalCount == 0){
    echo '{"state":200, "info":"暂无数据"}';
    die;
  }

  //总分页数
  $totalPage = ceil($totalCount/$pageSize);

  $pageinfo = array(
    "page" => $page,
    "pageSize" => $pageSize,
    "totalCount" => $totalCount,
    "totalPage" => $totalPage
  );

  $atpage = $pageSize * ($page - 1);
  $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

  $list = array();
  foreach ($results as $key => $value) {
    foreach ($value as $k => $v) {
      $list[$key][$k] = $v;
    }
  }

  $info = array("list" => $list, "pageInfo" => $pageinfo);
  echo '{"state": 100, "info": '.json_encode($info).'}';
  die;



}elseif($action == "getFoodList"){
  if(empty($sid)){
    echo '{"state":200, "info":"参数错误"}';
    die;
  }

  $where = "";
  if(!empty($keywords)){
    $where = " AND s.`title` LIKE '%".$keywords."%'";
  }

  $page = (int)$page == 0 ? 1 : (int)$page;
  $pageSize = (int)$pageSize == 0 ? 10 : (int)$pageSize;

  $sql = $dsql->SetQuery("SELECT s.`id` FROM `#@__waimai_list` s WHERE `sid` = $sid".$where);

  //总条数
  $totalCount = $dsql->dsqlOper($sql, "totalCount");

  if($totalCount == 0){
    echo '{"state":200, "info":"暂无数据"}';
    die;
  }

  //总分页数
  $totalPage = ceil($totalCount/$pageSize);

  $pageinfo = array(
    "page" => $page,
    "pageSize" => $pageSize,
    "totalCount" => $totalCount,
    "totalPage" => $totalPage
  );

  $sql = $dsql->SetQuery("SELECT s.`id`, s.`title`, s.`price`, s.`typeid`, s.`unit`, s.`label`, t.`title` typename FROM `#@__waimai_list` s LEFT JOIN `#@__waimai_list_type` t ON t.`id` = s.`typeid` WHERE s.`sid` = $sid $where ORDER BY s.`sort` DESC, `id` DESC");

  $atpage = $pageSize * ($page - 1);
  $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

  $list = array();
  foreach ($results as $key => $value) {
    foreach ($value as $k => $v) {
      $list[$key][$k] = $v;
    }
  }

  $info = array("list" => $list, "pageInfo" => $pageinfo);
  echo '{"state": 100, "info": '.json_encode($info).'}';
  die;

}

//查询所有店铺
$shopArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shopArr = $ret;
}
$huoniaoTag->assign("shopArr", $shopArr);

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
  $cssFile = array(
    'admin/bootstrap1.css',
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
        'ui/jquery-ui.min.js',
        'ui/jquery-ui-i18n.min.js',
        'ui/jquery-ui-timepicker-addon.js',
	   'admin/shop/shopQuanAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


  $huoniaoTag->assign("id", $id);
  $huoniaoTag->assign("name", $name);
  $huoniaoTag->assign("des", $des);
  $huoniaoTag->assign("money", $promotio);
  $huoniaoTag->assign("basic_price", $basic_price);
  $huoniaoTag->assign("btime", $ktime ? date('Y-m-d',$ktime) : '');


  $huoniaoTag->assign("etime", $etime);
//  $huoniaoTag->assign("product", $product);
  $huoniaoTag->assign("limit", $limitcount);
  $huoniaoTag->assign("number", $number);
  $huoniaoTag->assign("bear", $bear);

  $sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_product` WHERE `id` = '$product'");
  $ret = $dsql->dsqlOper($sql, "results");
  $huoniaoTag->assign("productname", $ret[0]['title']);

  $huoniaoTag->assign("shopidsArr", empty($shopidsArr) ? array() : $shopidsArr);
  $huoniaoTag->assign("fidArr", empty($fidArr) ? array() : $fidArr);

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
