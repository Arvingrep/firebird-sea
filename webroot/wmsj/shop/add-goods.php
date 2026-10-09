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
$templates = "add-goods.html";


if(empty($sid)){
  header("location:/wmsj/?to=shop");
  die;
}else{
  $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $sid AND `id` in ($managerIds)");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    $huoniaoTag->assign('shopname', $ret[0]['shopname']);
  }else{
    header("location:/wmsj/?to=shop");
    die;
  }
}

if($sid && $id){
  $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id AND `sid` IN ($managerIds)");
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){

    foreach ($ret[0] as $key => $value) {

        //商品属性
        if($key == "nature"){
            $value = unserialize($value);
        }

        //限制时间段
        if($key == "limit_time"){
            $value = unserialize($value);
        }

        //限制开始、结束日期
        if($key == "start_time" || $key == "stop_time"){
            $value = $value ? date("Y-m-d", $value) : "";
        }

        //图片
        if($key == "pics"){
          $picsList = array();
          if(!empty($value)){
            $picsArr = explode(",", $value);
            foreach ($picsArr as $k => $v) {
              $item = array("path" => getFilePath($v), "pathSource" => $v);
              array_push($picsList, $item);
            }
          }
          $value = !empty($value) ? json_encode(explode(",", $value)) : "[]";
          $huoniaoTag->assign('picsList', $picsList);
        }

        $huoniaoTag->assign($key, $value);
    }

  }else{
    header("location:/wmsj/shop/manage-goods.php?sid=$sid");
    die;
  }
}


$typelist = array();
$sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list_type` WHERE `sid` = $sid AND `del` = 0 AND `sid` IN ($managerIds) ORDER BY `sort` DESC, `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $typelist = $ret;
}
$huoniaoTag->assign('typelist', $typelist);

$huoniaoTag->assign('sid', empty($sid) ? 0 : $sid);
$huoniaoTag->assign('id', empty($id) ? 0 : $id);
$huoniaoTag->assign('unfind', $unfind);


//验证模板文件
if(file_exists($tpl."/".$templates)){

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);

    //更新附件的浏览次数
    updateAttachmentClickSql();

}else{
    echo $templates."模板文件未找到！";
}
