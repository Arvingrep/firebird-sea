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

checkPurview("waimaiQuan");

$templates = "waimaiQuanAdd.html";


if($dopost == "submit"){

  $money = (float)$money;

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
  if($deadline_type == 0 && $is_deadline_type==0){
    $validity = (int)$validity;
    if(empty($validity)){
      echo '{"state":200, "info":"请填写有效天数"}';
      die;
    }
  }else{
    if(empty($deadline)){
      echo '{"state":200, "info":"请填写截止日期"}';
      die;
    }
  }
  $deadline_type = (int)$is_deadline_type;
  if($shoptype == 1){
    if(empty($shopids)){
      echo '{"state":200, "info":"请选择适用店铺"}';
      die;
    }else{
      $shopids = join(",", $shopids);
    }
  }else{
    $shopids = "";
  }
  if($is_relation_food == 1){
    if(empty($fid)){
      echo '{"state":200, "info":"请选择关联商品"}';
      die;
    }else{
      $fid = join(",", $fid);
    }
  }else{
    $fid = "";
  }


  $deadline = GetMkTime($deadline." 23:59:59");

  // 新增
  if(empty($id)){

    $pubdate = GetMkTime(time());
    $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_quan` (`name`, `des`, `money`, `basic_price`, `deadline_type`, `validity`, `deadline`, `shoptype`, `shopids`, `is_relation_food`, `fid`, `pubdate`, `bear`,`recommend`,`number`,`sent`,`limit`) VALUES ('$name', '$des', '$money', '$basic_price', '$deadline_type', '$validity', '$deadline', '$shoptype', '$shopids', '$is_relation_food', '$fid', '$pubdate', '$bear','$recommend','$number','$number','$limit')");
    // echo $sql;die;
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
        $updatestr = '';

        foreach ($_POST as $k => $v){
            if($k == 'deadline'){
                $v = strtotime($v);
            }
            if($k =='is_deadline_type'){
                $k = 'validity';
            }

            if ($k == 'shopids') {

                $v = join(',',$v);
            }

            if ($k == 'fid') {

                $v = join(',',$v);
            }
            $updatestr .= "`".$k."` = '".$v."',";
        }

      $updatestr = substr($updatestr,0,-1);
      $sql = $dsql->SetQuery("UPDATE `#@__waimai_quan` SET $updatestr WHERE `id` = $id");
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
  $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `id` = $id");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    foreach ($ret[0] as $key => $value) {
      if($key == "deadline"){
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
          $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__waimai_list` WHERE `id` in ($value)");
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
		'admin/waimai/waimaiQuanAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


  $huoniaoTag->assign("id", $id);
  $huoniaoTag->assign("name", $name);
  $huoniaoTag->assign("des", $des);
  $huoniaoTag->assign("money", $money);
  $huoniaoTag->assign("basic_price", $basic_price);
  $huoniaoTag->assign("validity", $validity);
  $huoniaoTag->assign("deadline", $deadline);
  $huoniaoTag->assign("shoptype", $shoptype);
  $huoniaoTag->assign("shopids", $shopids);
  $huoniaoTag->assign("fid", $fid);

  $huoniaoTag->assign("shopidsArr", empty($shopidsArr) ? array() : $shopidsArr);
  $huoniaoTag->assign("fidArr", empty($fidArr) ? array() : $fidArr);

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
