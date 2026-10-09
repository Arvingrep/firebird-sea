<?php
/**
 * 新增专题
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

$db = "article_zhuanti";

if($dopost == "edit"){
  checkPurview("editzhuanti");
}else{
  checkPurview("addzhuanti");
}

$templates = "zhuantiAdd.html";

$pid = (int)$pid;
$ptitle     = $pid ? "新闻专题分类" : "新闻专题";

$pagetitle     = $ptitle."管理";

if($submit == "提交"){
  if($token == "") die('token传递失败！');
  $pubdate       = GetMkTime(time());       //发布时间

  //对字符进行处理
  $typename    = cn_substrR($typename,60);
  $description = cn_substrR($description,200);
  $weight      = (int)$weight;
  $state       = (int)$state;
  $flag_r       = (int)$flag_r;
  $flag_h       = (int)$flag_h;
  $typeid       = (int)$typeid;
  if($pid == 0 && empty($litpic)){
    // echo '{"state": 200, "info": "请上传缩略图"}';
    // exit();
  }
}

if($dopost == "Add"){

  $pagetitle     = "新增".$ptitle;

  //表单提交
  if($submit == "提交"){

    //表单二次验证
    if(trim($typename) == ''){
      echo '{"state": 200, "info": "名称不能为空"}';
      exit();
    }

    //保存到主表
    $archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`typename`, `litpic`, `description`, `weight`, `state`, `pubdate`, `parentid`, `flag_r`, `flag_h`, `banner_large`, `banner_small`, `typeid`) VALUES ('$typename', '$litpic', '$description', $weight, $state, $pubdate, $pid, $flag_r, $flag_h, '$banner_large', '$banner_small', $typeid)");
    $return = $dsql->dsqlOper($archives, "update");

    if($return == "ok"){
      adminLog("新增".$ptitle, $typename);
      echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
    }else{
      echo $return;
    }
    die;
  }

//修改专题分类
}elseif($dopost == "Edit"){

  $pagetitle = "修改".$ptitle;

  if($id == "") die('要修改的信息ID传递失败！');
  if($submit == "提交"){

    //表单二次验证
    if(trim($typename) == '')
    {
      echo '{"state": 200, "info": "名称不能为空"}';
      die;
    }

    //保存到主表
    $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$typename', `description` = '$description', `litpic` = '$litpic', `weight` = '$weight', `state` = '$state', `flag_r` = $flag_r, `flag_h` = $flag_h, `banner_large` = '$banner_large', `banner_small` = '$banner_small', `typeid` = $typeid WHERE `id` = ".$id);
    $return = $dsql->dsqlOper($archives, "update");

    if($return == "ok"){
      adminLog("修改".$ptitle, $typename);
      echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
    }else{
      echo $return;
    }
    die;

  }else{
    if(!empty($id)){

      //主表信息
      $archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
      $results = $dsql->dsqlOper($archives, "results");

      if(!empty($results)){

        foreach ($results[0] as $key => $value) {
          ${$key} = $value;
        }
        if($results[0]['typeid']){
          $sql = $dsql->SetQuery("SELECT * FROM `#@__article_zhuantipar` WHERE `id` = ".$results[0]['typeid']);
          $res = $dsql->dsqlOper($sql, "results");
          $parname = $res ? $res[0]['typename'] : '';
        }


      }else{
        ShowMsg('要修改的信息不存在或已删除！', "-1");
        die;
      }

    }else{
      ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
      die;
    }
  }

}elseif($dopost == "del"){
  if($id != ""){

    $each = explode(",", $id);
    $error = array();
    $title = array();
    foreach($each as $val){

      $archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$val);
      $results = $dsql->dsqlOper($archives, "results");

      array_push($title, $results[0]['typename']);

      //删除表
      $archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
      $results = $dsql->dsqlOper($archives, "update");
      if($results != "ok"){
        $error[] = $val;
      }
    }
    if(!empty($error)){
      echo '{"state": 200, "info": '.json_encode($error).'}';
    }else{
      adminLog("删除".$ptitle, join(", ", $title));
      echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }
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
    'publicUpload.js',
    'admin/article/zhuantiAdd.js'
  );
  $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

  $huoniaoTag->assign('pagetitle', $pagetitle);
  $huoniaoTag->assign('ptitle', $ptitle);
  $huoniaoTag->assign('dopost', $dopost);
  $huoniaoTag->assign('action', $action);
  $huoniaoTag->assign('parentid', $parentid);
  $huoniaoTag->assign('pid', $pid);

  $huoniaoTag->assign('id', $id);
  $huoniaoTag->assign('typename', $typename);
  $huoniaoTag->assign('description', $description);
  $huoniaoTag->assign('litpic', $litpic);
  $huoniaoTag->assign('weight', $weight);
  $huoniaoTag->assign('banner_large', $banner_large);
  $huoniaoTag->assign('banner_small', $banner_small);
  $huoniaoTag->assign('typeid', $typeid);

  $huoniaoTag->assign('parname', empty($parname) ? "选择分类" : $parname);
  
  $huoniaoTag->assign('state', array('0', '1', '2'));
  $huoniaoTag->assign('stateNames',array('未审核','正常','审核拒绝'));
  $huoniaoTag->assign('stateChecked', $state == "" ? 1 : (int)$state);

  //推荐
  $huoniaoTag->assign('flag_rList', array(0 => '无', 1 => '1级推荐', 2 => '2级推荐', 3 => '3级推荐'));
  $huoniaoTag->assign('flag_r', $flag_r ? $flag_r : 0);
  //头条
  $huoniaoTag->assign('flag_hList', array(0 => '无', 1 => '1级头条', 2 => '2级头条', 3 => '3级头条'));
  $huoniaoTag->assign('flag_h', $flag_h ? $flag_h : 0);

  $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "article_zhuantipar", true, 1, 10000)));

  $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
  $huoniaoTag->display($templates);
}else{
  echo $templates."模板文件未找到！";
}
