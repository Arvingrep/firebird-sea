<?php
/**
 * 新增或修改店铺商品分类
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
$dbname = "waimai_list_type";
$templates = "add-goodsType.html";

if(!empty($action) && !empty($id)){
  if(!checkWaimaiShopManager($id, "list_type")){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}

if(empty($sid)){
  header("location:/wmsj/index.php?to=shop");
  die;
}else{
  $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid AND `id` in ($managerIds)");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    $huoniaoTag->assign('shopname', $ret[0]['shopname']);
  }else{
    header("location:/wmsj/index.php?to=shop");
    die;
  }
}


//获取信息内容
if($id){
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
    header("location:/wmsj/shop/goods-type.php?sid=$sid");
    die;
  }
}


$huoniaoTag->assign('unfind', $unfind);
$huoniaoTag->assign('sid', empty($sid) ? 0 : $sid);
$huoniaoTag->assign('id', empty($id) ? 0 : $id);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);

}else{
    echo $templates."模板文件未找到！";
}
