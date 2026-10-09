<?php
/**
 * 店铺管理 店铺列表
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_shop";
$templates = "waimaiShop.html";

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;

if ($custom_otherpeisong == 2 ) {
    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
    require_once $pluginFile;
}

if(!empty($action) && !empty($id)){
  if(!checkWaimaiShopManager($id)){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}

//更新店铺状态
if($action == "updateStatus"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `status` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'update', '变更店铺状态('.$id.' => '.$val.')', '', $sql);

            echo '{"state": 100, "info": "更新成功！"}';
        exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
        exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();
    }
}


//更新微信下单状态
if($action == "updateValid"){
    if(!empty($id)){

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `ordervalid` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'update', '变更下单状态('.$id.' => '.$val.')', '', $sql);

            echo '{"state": 100, "info": "更新成功！"}';
        exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
        exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();
    }
}


//更新支持预定状态
if($action == "updateReservestatus"){
  if(!empty($id)){

      $val = (int)$val;

      $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `reservestatus` = $val WHERE `id` = $id");
      $ret = $dsql->dsqlOper($sql, "update");
      if($ret == "ok"){

          //记录用户行为日志
          memberLog($userid, 'waimai', 'detail', $id, 'update', '变更支持预定状态('.$id.' => '.$val.')', '', $sql);

          echo '{"state": 100, "info": "更新成功！"}';
      exit();
      }else{
          echo '{"state": 200, "info": "更新失败！"}';
      exit();
      }

  }else{
      echo '{"state": 200, "info": "信息ID传输失败！"}';
  exit();
  }
}


//删除店铺
if($action == "delete"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'delete', '删除店铺('.$id.')', '', $sql);

            //删除商品分类
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_list_type` WHERE `sid` = $id");
            $dsql->dsqlOper($sql, "update");

            //删除商品
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_list` WHERE `sid` = $id");
            $dsql->dsqlOper($sql, "update");

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


// 快速编辑
if($action == "fastedit"){
  if(empty($type) || $type == "id" || empty($id) || $val == "") echo '{"state": 200, "info": "参数错误！"}';

  if($type != "shopname" && $type != "sort") echo '{"state": 200, "info": "操作错误！"}';

  if($type == "shopname"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `shopname` = '$val' AND `id` != '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      die('{"state": 200, "info": "店铺名称已经存在！"}');
    }

    if ($custom_otherpeisong == 2 ) {

          $sql = $dsql->SetQuery("SELECT `ysshop_id`,`category`,`phone`,`cityid`,`coordY`,`coordX`,`address` FROM `#@__$dbname` WHERE `id` = $id");
          $ret = $dsql->dsqlOper($sql, "results");

          $ysshop_id = (int)$ret[0]['ysshop_id'];
          if ($ysshop_id == 0) {

              $phone    = $ret[0]['phone'];
              $category = $ret[0]['category'];
              $cityid   = $ret[0]['cityid'];
              $coordY   = $ret[0]['coordY'];
              $coordX   = $ret[0]['coordX'];
              $address  = $ret[0]['address'];

              if ($shopname == '') {

                  echo '{"state": 200, "info": "优闪速达添加店铺缺少必要参数"}';
              }
              /*优闪速达*/
              include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

              $siteConfigService = new siteConfig();

              $youShanSuDaClass  = new youshansuda();
              
              $paramarr = array(
                  'shop_id' => $ysshop_id
              );
              $results = $youShanSuDaClass->delShop($paramarr);
              if ($results['code'] != 200) {

                  echo '{"state": 200, "info": "'.$results['msg'].'"}';
                  exit();
              }

              $param   = array(
                  'tab' => 'site_area',
                  'id'  => (int)$cityid
              );
              $handels = new handlers('siteConfig', 'getPublicParentInfo');
              $return  = $handels->getHandle($param);

              $province = $city = '';
              if ($return['state'] == 100) {

                  $info     = $return['info'];
                  $province = $info['names'][0];
                  $city     = $info['names'][1];

              }

              $category = explode(',', $category);
              $data     = array(
                  'shop_phone'       => $phone,
                  'shop_name'        => $shopname,
                  'province'         => $province,
                  'city'             => $city,
                  'address'          => str_replace(PHP_EOL, '', $address),
                  'address_detailed' => str_replace(PHP_EOL, '', $address),
                  'shop_lng'         => $coordY,
                  'shop_lat'         => $coordX,
                  'first_type'       => $category[0],
                  'second_type'      => $category[1],
              );
              $results  = $youShanSuDaClass->addShop($data);

              if ($results['code'] == 200) {

                  $results     = $results['data'];
                  $other_param = serialize($results);
                  $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                  $dsql->dsqlOper($sql, "update");
              } else {
                  echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                  exit();
              }
          }
      }
  }

  $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `$type` = '$val' WHERE `id` = $id");
  // echo $sql;die;
  $ret = $dsql->dsqlOper($sql, "update");
  if($ret == "ok"){

    //记录用户行为日志
    memberLog($userid, 'waimai', 'detail', $id, 'update', '修改店铺信息('.$id.')', '', $sql);

    die('{"state": 100, "info": "修改成功！"}');
  }else{
    die('{"state": 200, "info": "修改失败！"}');
  }
}

//过滤参数
$shopname = convertStrToPageShow($shopname);
$typename = convertStrToPageShow($typename);
$phone = convertStrToPageShow($phone);
$address = convertStrToPageShow($address);


$where = " AND s.`id` in ($managerIds)";

//店铺名称
if(!empty($shopname)){
  $where .= " AND s.`shopname` like ('%$shopname%')";
}

//店铺分类
if(!empty($typeid)){
  $reg = "(^$typeid$|^$typeid,|,$typeid,|,$typeid)";
  $where .= " AND s.`typeid` REGEXP '".$reg."' ";
}

//店铺分类
if(!empty($typename)){
  if(is_numeric($typename) && empty($typeid)){
    $reg = "(^$typename$|^$typename,|,$typename,|,$typename)";
    $where .= " AND s.`typeid` REGEXP '".$reg."' ";
  }else{
    $where .= " AND t.`title` like '%$typename%'";
  }
}

//联系电话
if(!empty($phone)){
  $where .= " AND s.`phone` like ('%$phone%')";
}

//联系地址
if(!empty($address)){
  $where .= " AND s.`address` like ('%$address%')";
}

$pageSize = 15;

$reg = "(^s.`typeid`$|^s.`typeid`,|,s.`typeid`,|,s.`typeid`)";
$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname`, s.`sort`, s.`typeid`, s.`phone`, s.`address`, s.`status`, s.`ordervalid`, s.`reservestatus` FROM `#@__$dbname` s LEFT JOIN `#@__waimai_shop_type` t ON t.`id` in (s.`typeid`) WHERE 1 = 1 AND s.`del` = 0".$where." ORDER BY s.`sort` DESC, `id` DESC");

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
  $list[$key]['id']         = $value['id'];
  $list[$key]['shopname']   = $value['shopname'];
  $list[$key]['sort']       = $value['sort'];
  $list[$key]['typeid']     = $value['typeid'];
  $list[$key]['phone']      = $value['phone'];
  $list[$key]['address']    = $value['address'];
  $list[$key]['status']     = $value['status'];
  $list[$key]['ordervalid'] = $value['ordervalid'];

  // 分类名
  $typeArr = array();
  $typeids = explode(",", $value['typeid']);
  foreach ($typeids as $k => $val) {
    if($val){
      $typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_shop_type` WHERE `id` = ". $val);
      $type = $dsql->getTypeName($typeSql);
      array_push($typeArr, $type[0]['title']);
    }
  }
  $list[$key]['typename'] = join(" > ", $typeArr);

  $param = array(
      "service"  => "waimai",
      "template" => "shop",
      "id"       => $value['id']
  );
  $list[$key]['url'] = getUrlPath($param);

  $list[$key]['reservestatus'] = $value['reservestatus']; //是否支持预定
}

$huoniaoTag->assign("shopname", $shopname, 0, 1);
$huoniaoTag->assign("typename", $typename, 0, 1);
$huoniaoTag->assign("phone", $phone, 0, 1);
$huoniaoTag->assign("address", $address, 0, 1);
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

  $jsFile = array(
    'shop/waimaiShop.js'
  );
  $huoniaoTag->assign('jsFile', $jsFile);

  $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
