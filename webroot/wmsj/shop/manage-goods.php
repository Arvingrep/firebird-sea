<?php
/**
 * 管理商品
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
$tpl = dirname(__FILE__)."/../templates/touch/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$dbname = "waimai_list";
$templates = "manage-goods.html";

if(!empty($action) && !empty($sid)){
  if(!checkWaimaiShopManager($sid)){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}

$unfind = 0;
if(empty($sid)){
  $unfind = 1;
}else{
  $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid AND `id` in ($managerIds)");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    $huoniaoTag->assign('shopname', $ret[0]['shopname']);
  }else{
    $unfind = 1;
  }
}


//获取信息内容
if(!$unfind && $id){
  $where = " AND `sid` in ($managerIds)";
  $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id".$where);
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){

      foreach ($ret[0] as $key => $value) {
        if($key == "week"){
          if($value != ""){
            $wk = explode(",", $value);
            $wklist = array();
            foreach ($wk as $k => $v) {
              $d = "";
              switch ($v) {
                case 1:
                  $d = '星期一';
                  break;
                case 2:
                  $d = '星期二';
                  break;
                case 3:
                  $d = '星期三';
                  break;
                case 4:
                  $d = '星期四';
                  break;
                case 5:
                  $d = '星期五';
                  break;
                case 6:
                  $d = '星期六';
                  break;
                case 7:
                  $d = '星期日';
                  break;
              }
              array_push($wklist, $d);
            }
            $huoniaoTag->assign('weeklist', join(",", $wklist));
          }else{
            $huoniaoTag->assign('weeklist', '请选择');
          }
        }
        $huoniaoTag->assign($key, $value);
      }

  }else{
    $unfind = 1;
  }
}


$huoniaoTag->assign('unfind', $unfind);
$huoniaoTag->assign('sid', empty($sid) ? 0 : $sid);
$huoniaoTag->assign('id', empty($id) ? 0 : $id);


$typelist = array();
$sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list_type` WHERE `del` = 0 AND `sid` = $sid AND `sid` IN ($managerIds) ORDER BY `sort` DESC, `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $typelist = $ret;
}
$huoniaoTag->assign('typelist', $typelist);


if($action == "getList"){
  $where = " AND t.`del` = 0 AND s.`del` = 0 AND s.`sid` = $sid AND s.`sid` IN ($managerIds)";

  //商品名称
  if(!empty($title)){
    $where .= " AND s.`title` like ('%$title%')";
  }

  //编号
  if(!empty($sort)){
    $where .= " AND s.`sort` = '$sort'";
  }

  //单位
  if(!empty($unit)){
    $where .= " AND s.`unit` like ('%$unit%')";
  }

  //价格
  if(!empty($price)){
    $where .= " AND s.`price` = $price";
  }

  //分类id
  if(!empty($typeid)){
    $where .= " AND s.`typeid` = $typeid";
  }

  //分类
  if(!empty($typename)){
    $where .= " AND t.`title` like ('%$typename%')";
  }

  //标签
  if(!empty($label)){
    $where .= " AND s.`label` like ('%$label%')";
  }

  //库存
  if(!empty($stock)){
    $where .= " AND s.`stock` = $stock";
  }

  //状态
    if(!empty($foodtype)){
        if ($foodtype == 1){
            /*在售*/
            $where .= " AND ( (s.`status` = 1 AND s.`stockvalid` = 0) OR (s.`stockvalid` = 1 AND  s.`stock` != 0) ) ";
        }elseif ($foodtype == 2){
            /*售罄*/
            $where .= " AND s.`stockvalid` = 1 AND  s.`stock` = 0";
        }else{
            /*下架*/
//            $where .= " AND ( (s.`status` = 0 AND s.`stockvalid` = 0) OR (s.`stockvalid` = 1 AND  s.`stock` = 0) )";
            $where .= " AND s.`status` = 0 ";
        }
    }

  $pageSize = 10000;  //新版本加载全部数据，由前端做处理，超过200个商品时，只显示当前分类的商品，否则显示全部，不需要分页

    $sql  = $dsql->SetQuery("SELECT s.`id`, s.`sort`, s.`title`, s.`price`,s.`formerprice`,s.`typeid`, s.`unit`, s.`label`, s.`status`, s.`stockvalid`, s.`stock`, s.`is_day_limitfood`, s.`is_nature`,s.`pics`,s.`sale`,t.`title` typename FROM `#@__$dbname` s LEFT JOIN `#@__waimai_list_type` t ON t.`id` = s.`typeid` WHERE 1 = 1".$where." ORDER BY t.`sort` DESC, s.`typeid` ASC , s.`sort` DESC, `id` DESC");

  $sql1 = $dsql->SetQuery("SELECT s.`id`, s.`sort`, s.`title`, s.`price`, s.`typeid`, s.`unit`, s.`label`, s.`status`, s.`stockvalid`, s.`stock`, s.`is_day_limitfood`, s.`is_nature`,s.`pics`,s.`sale`,t.`title` typename FROM `#@__$dbname` s LEFT JOIN `#@__waimai_list_type` t ON t.`id` = s.`typeid` WHERE 1 = 1");
//   echo $sql;die;

  //总条数
  $totalCount  = $dsql->dsqlOper($sql, "totalCount");
  $totalCount0 = $dsql->dsqlOper($sql1." AND t.`del` = 0 AND s.`del` = 0 AND s.`sid` = $sid AND s.`sid` IN ($managerIds) AND ((s.`status` = 1 AND s.`stockvalid` = 0) OR (s.`stockvalid` = 1 AND  s.`stock` != 0)) ", "totalCount");
  $totalCount1 = $dsql->dsqlOper($sql1." AND t.`del` = 0 AND s.`del` = 0 AND s.`sid` = $sid AND s.`sid` IN ($managerIds) AND s.`stockvalid` = 1 AND  s.`stock` = 0", "totalCount");
  $totalCount2 = $dsql->dsqlOper($sql1." AND t.`del` = 0 AND s.`del` = 0 AND s.`sid` = $sid AND s.`sid` IN ($managerIds) AND s.`status` = 0 ", "totalCount");

  if($totalCount == 0){
    echo '{"state": 200, "info": "暂无数据"}';
    die;
  }
  //总分页数
  $totalPage = ceil($totalCount/$pageSize);

  $pageinfo = array(
    "page" => $page,
    "pageSize" => $pageSize,
    "totalPage" => $totalPage,
    "totalCount"  => $totalCount,
    "totalCount0" => $totalCount0,
    "totalCount1" => $totalCount1,
    "totalCount2" => $totalCount2,
  );

  $page = (int)$page == 0 ? 1 : (int)$page;
  $atpage = $pageSize * ($page - 1);
  $results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

  $start = strtotime(date('Y-m-1',time()));
  $end   = time();
  $list = array();
  foreach ($results as $key => $value) {
    $list[$key]['id']               = $value['id'];
    // $sql    = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__waimai_order_all` WHERE FIND_IN_SET(".$value['id'].",`fids`) AND `okdate` > '$start' AND `okdate` <= $end AND `sid` = '$sid'");
    // $res    = $dsql->dsqlOper($sql,"results");
    // $list[$key]['countall']         = $res[0]['countall'];
    $list[$key]['countall']         = $value['sale'];
    $list[$key]['sort']             = $value['sort'];
    $list[$key]['title']            = $value['title'];
    $list[$key]['price']            = $value['price'];
    $list[$key]['formerprice']      = $value['formerprice'];
    $list[$key]['typeid']           = $value['typeid'];
    $list[$key]['typename']         = $value['typename'];
    $list[$key]['unit']             = $value['unit'];
    $list[$key]['pics']             = $value['pics'];
    $list[$key]['pics_path']        = getFilePath(explode(',',$value['pics'])[0]);
    $list[$key]['label']            = $value['label'];
    $list[$key]['status']           = $value['status'];
    $list[$key]['stockvalid']       = $value['stockvalid'];
    $list[$key]['stock']            = $value['stock'];
    $list[$key]['is_day_limitfood'] = $value['is_day_limitfood'];
    $list[$key]['is_nature']        = $value['is_nature'];
  }

  //更新附件的浏览次数
  updateAttachmentClickSql();

  $info = array("list" => $list, "pageInfo" => $pageinfo);
  echo '{"state": 100, "info": '.json_encode($info).'}';
  exit();

}

if($action == "updatesort"){
    $upsortstr = stripslashes($upsort);
    $upsort    = json_decode($upsortstr,true);
    if(!empty($upsort)){
        $error  = array();
        foreach ($upsort as $a => $b){
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET
                    `sort` = '".$b['sort']."'
                  WHERE `id` = '".$b['id']."'
                ");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret != "ok"){
                array_push($error,$b['id']);
            }
        }
    }
    if(count($error) > 0){
        echo '{"state": 200, "info": '.json_encode($error).'}';
        exit();
    }else{
        echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
        exit();
    }
}elseif($action == "updatkucun"){
        if ($stock_num >0){
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET  `stock` = '$stock_num',`stockvalid` = 1,`status` = 1 WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == "ok"){
                echo '{"state": 100, "info": '.json_encode("保存成功！").'}';
                exit();
            }else{
                echo '{"state": 200, "info": '.json_encode("更新失败！").'}';
                exit();
            }
        }
}
//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);

}else{
    echo $templates."模板文件未找到！";
}
