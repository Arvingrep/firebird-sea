<?php
/**
 * 专题所属分类
 *
 * @version        $Id: zhuanti.php 2013-12-1 下午14:02:18 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/article";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "article_zhuantipar";

checkPurview("zhuanti");

$templates = "zhuantiPar.html";

$pid = (int)$pid;

$pagetitle     = "专题分类管理";

if($submit == "提交"){
  if($token == "") die('token传递失败！');
  $pubdate       = GetMkTime(time());       //发布时间

  //对字符进行处理
  $typename    = cn_substrR($typename, 12);
  $weight      = (int)$weight;
  if(empty($typename)){
    echo '{"state": 200, "info": "请填写分类名称"}';
    exit();
  }
}

//修改分类
if($dopost == "updateType"){
  if($id != ""){
    $archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "results");

    if(!empty($results)){

      if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
      if($type == "single"){

        if($results[0]['typename'] != $typename){

          //保存到主表
          $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$typename' WHERE `id` = ".$id);
          $results = $dsql->dsqlOper($archives, "update");

        }else{
          //分类没有变化
          echo '{"state": 101, "info": '.json_encode('无变化！').'}';
          die;
        }

      }else{

        //对字符进行处理
        $typename    = cn_substrR($typename, 12);

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `parentid` = '$parentid', `typename` = '$typename' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
      }

      if($results != "ok"){
        echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
        exit();
      }else{
        adminLog("修改专题分类", $typename);

        echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
        exit();
      }

    }else{
      echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
      die;
    }
  }
  die;

//删除分类
}else if($dopost == "del"){
  if($id != ""){

    $idsArr = array();

    $archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "update");
    if($results != "ok"){
      echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
      die;
    }


    adminLog("删除新闻专题分类", join(",", $idsArr));
    echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
    die;


  }
  die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

  //js
  $jsFile = array(
    'ui/bootstrap.min.js',
    'ui/jquery-ui-selectable.js',
    'ui/jquery.dragsort-0.5.1.min.js',
    'ui/jquery-ui-sortable.js',
    'admin/article/zhuantiPar.js'
  );
  $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

  $huoniaoTag->assign('dopost', $dopost);
  $huoniaoTag->assign('action', $action);

  $huoniaoTag->assign('id', $id);
  $huoniaoTag->assign('typename', $typename);
  $huoniaoTag->assign('weight', $weight);

  $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "article_zhuantipar", true, 1, 10000)));
  
  $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
  $huoniaoTag->display($templates);
}else{
  echo $templates."模板文件未找到！";
}
