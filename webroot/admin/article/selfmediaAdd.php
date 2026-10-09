<?php
/**
 * 添加信息
 *
 * @version        $Id: articleAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/article";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "selfmediaAdd.html";

$action = "article";

$showreal = (int)$showreal;

$dotitle = "自媒体";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
  checkPurview("editselfmedia");
}else{
  checkPurview("addselfmedia");
}

$pagetitle     = "发布信息";

//获取当前管理员
$adminid = $userLogin->getUserID();

if($submit == "提交"){

  //对字符进行处理
  $ac_name       = cn_substrR($ac_name,50);
  $ac_profile    = cn_substrR($ac_profile,30);

}

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);


//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($submit == "提交"){
  if($token == "") die('token传递失败！');

  if($userid == 0 && !empty($username)){
    $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$username."' || `nickname` = '".$username."' || `company` = '".$username."'");
    $userResult = $dsql->dsqlOper($userSql, "results");
    if(!$userResult){
      echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
      exit();
    }
    $userid = $userResult[0]['id'];
  }

  if(is_numeric($userid) && $userid != 0){
    $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
    $userResult = $dsql->dsqlOper($userSql, "results");
    if(!$userResult){
      echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
      exit();
    }

    $where = $id ? " AND `id` != $id" : "";
    $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia` WHERE `userid` = $userid".$where);
    $userResult = $dsql->dsqlOper($userSql, "results");
    if($userResult){
      echo '{"state": 200, "info": "此会员已授权管理其它自媒体，一个会员不可以管理多个自媒体！"}';
      exit();
    }
  }
  $userid = (int)$userid;

  if(empty($type)){
    echo '{"state": 200, "info": "请选择自媒体分类"}';
    exit();
  }

  if(trim($ac_name) == ''){
    echo '{"state": 200, "info": "自媒体名称不能为空"}';
    exit();
  }

  if(trim($ac_profile) == ''){
    echo '{"state": 200, "info": "自媒体介绍不能为空"}';
    exit();
  }

  if(trim($ac_photo) == ''){
    echo '{"state": 200, "info": "请上传自媒体头像"}';
    exit();
  }

  //表单二次验证
  if(empty($ac_addrid)){
      echo '{"state": 200, "info": "请选择区域"}';
      exit();
  }
  if(empty($cityid)){
      echo '{"state": 200, "info": "请选择城市"}';
      exit();
  }

  $adminCityIdsArr = explode(',', $adminCityIds);
  if(!in_array($cityid, $adminCityIdsArr)){
      echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
      exit();
  }

  $state                  = (int)$state;
  $editstate              = (int)$editstate;
  $mb_level               = (int)$mb_level;
  $mb_type                = (int)$mb_type;
  $org_major_license_type = (int)$org_major_license_type;
  $click                  = (int)$click;
  $weight                 = (int)$weight;
  $ac_profile = cn_substrR($ac_profile, 200);


}



if($dopost == "edit"){

  $pagetitle = "修改信息";

  if($submit == "提交"){

    if($id == "") die('要修改的信息ID传递失败！');

    $sql = $dsql->SetQuery("SELECT `id`, `state`, `userid`, `editstate` FROM `#@__article_selfmedia` WHERE `id` = $id");
    $res = $dsql->dsqlOper($sql, "results");
    if($res){
      $detail = $res[0];
      if($res[0]['state'] == 1 && $res[0]['editstate'] == 0){
        echo '{"state": 200, "info": "请先处理资料更新申请！"}';
        exit();
      }
    }else{
      echo '{"state": 200, "info": "信息不存在！"}';
      exit();
    }

    //保存到主表
    $archives = $dsql->SetQuery("UPDATE `#@__article_selfmedia` SET
      `userid` = '$userid',
      `cityid` = '$cityid',
      `type` = '$type',
      `ac_name` = '$ac_name',
      `ac_profile` = '$ac_profile',
      `ac_field` = '$ac_field',
      `ac_photo` = '$ac_photo',
      `ac_addrid` = '$ac_addrid',
      `mb_name` = '$mb_name',
      `mb_code` = '$mb_code',
      `mb_level` = '$mb_level',
      `mb_type` = '$mb_type',
      `mb_license` = '$mb_license',
      `op_name` = '$op_name',
      `op_idcard` = '$op_idcard',
      `op_idcardfront` = '$op_idcardfront',
      `areaCode` = '$areaCode',
      `op_phone` = '$op_phone',
      `op_email` = '$op_email',
      `op_authorize` = '$op_authorize',
      `org_major_license_type` = '$org_major_license_type',
      `org_major_license` = '$org_major_license',
      `outer` = '$outer',
      `prove` = '$prove',
      `state` = '$state',
      `click` = '$click',
      `weight` = '$weight',
      `ac_banner` = '$imglist'

      WHERE `id` = ".$id);
    $results = $dsql->dsqlOper($archives, "update");

    if($results != "ok"){
      echo $archives;die;
      echo '{"state": 200, "info": "主表保存失败！"}';
      exit();
    }

    adminLog("修改".$dotitle."信息", $title);

    $param = array(
      "service"     => $action,
      "template"    => "mddetail",
      "id"          => $id
    );
    $url = getUrlPath($param);

    if($detail['state'] != $state){
      $state_ = $state == 1 ? 1 : 0;
      $sql = $dsql->SetQuery("UPDATE `#@__articlelist_all` SET `media_state` = $state_ WHERE `admin` = ".$detail['userid']);
      $dsql->dsqlOper($sql, "update");
    }

    if($detail['state'] == 1 && $state != 1){
      checkMediaCache($id, 'join', $detail['userid'], $state);
    }

    if($manager){
      $ids = explode(",", $manager);
      $data = array();
      $now = time();
      foreach ($ids as $k => $c) {
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia_manager` WHERE `aid` = $id AND `userid` = $c");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res){
          $sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia_manager` WHERE `userid` = $c AND `aid` <> $id");
          $check = $dsql->dsqlOper($sql, "results");
          if($check){
          }else{
            $sql = $dsql->SetQuery("INSERT INTO `#@__article_selfmedia_manager` (`aid`, `userid`, `pubdate`) VALUES ($id, $c, $now)");
            $dsql->dsqlOper($sql, "results");
          }
        }
      }
    }
    if($delmanager){
      $sql = $dsql->SetQuery("DELETE FROM `#@__article_selfmedia_manager` WHERE `userid` IN ($delmanager)");
      $dsql->dsqlOper($sql, "update");
    }

    echo '{"state": 100, "url": "'.$url.'"}';die;
    exit();

  }else{
    if(!empty($id)){

      $archives = $dsql->SetQuery("SELECT * FROM `#@__article_selfmedia` WHERE `id` = ".$id);
      $results = $dsql->dsqlOper($archives, "results");
      if(!empty($results)){

        if(!$showreal && $results[0]['state'] == 1 && $results[0]['editstate'] == 0 && $results[0]['editlog']){
            $editdata = unserialize($results[0]['editlog']);
            $editdata = $editdata['data'];
            $results[0] = array_merge($results[0], $editdata);
        }

        foreach ($results[0] as $key => $value) {
          if($key == "editlog"){
            $value = $value ? unserialize($value) : array();
          }
          ${$key} = $value;
          $huoniaoTag->assign($key, $value);
        }

        $sql = $dsql->SetQuery("SELECT m.*, u.`username` FROM `#@__article_selfmedia_manager` m LEFT JOIN `#@__member` u ON m.`userid` = u.`id` WHERE m.`aid` = $id");
        $managerList = $dsql->dsqlOper($sql, "results");

      }else{
        ShowMsg('要修改的信息不存在或已删除！', "-1");
        die;
      }

    }else{
      ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
      die;
    }
  }

}elseif($dopost == "" || $dopost == "save"){
  $dopost = "save";

  if($submit == "提交"){

    $pubdate = time();
    $editlog = serialize(array());
    $editstate = 1;
    $archives = $dsql->SetQuery("INSERT INTO `#@__article_selfmedia` (
      `cityid`, `userid`, `type`, `ac_name`, `ac_profile`, `ac_field`, `ac_addrid`, `ac_photo`, `mb_name`, `mb_code`, `mb_level`, `mb_type`, `mb_license`, `op_name`, `op_idcard`, `op_idcardfront`, `areaCode`, `op_phone`, `op_email`, `op_authorize`, `org_major_license_type`, `org_major_license`, `outer`, `prove`, `state`, `editstate`, `pubdate`, `editlog`, `click`, `weight`, `ac_banner`)
      VALUES
      ('$cityid', '$userid', '$type', '$ac_name', '$ac_profile', '$ac_field', '$ac_addrid', '$ac_photo', '$mb_name', '$mb_code', '$mb_level', '$mb_type', '$mb_license', '$op_name', '$op_idcard', '$op_idcardfront', '$areaCode', '$op_phone', '$op_email', '$op_authorize', '$org_major_license_type', '$org_major_license', '$outer', '$prove', '$state', '$editstate', '$pubdate', '$editlog', '$click', '$weight', '$imglist') ");
    $aid = $dsql->dsqlOper($archives, "lastid");
    if(is_numeric($aid)){

      if($manager){
        $ids = explode(",", $manager);
        $data = array();
        $now = time();
        foreach ($ids as $k => $c) {
          $data[] = "($aid, $c, $now)";
        }
        $sql = $dsql->SetQuery("INSERT INTO `#@__article_selfmedia_manager` (`aid`, `userid`, `pubdate`) VALUES ".join(",", $data));
        $dsql->dsqlOper($sql, "results");
      }

      adminLog("新增自媒体", $ac_name);

      $param = array(
        "service"     => $action,
        "template"    => "zimeiti_detail",
        "id"          => $aid
      );
      $url = getUrlPath($param);

      autoShowUserModule($userid, 'article'); //用户中心显示模块卡片

      echo '{"state": 100, "url": "'.$url.'"}';
      exit();
    }else{
      echo '{"state": 200, "info": "主表保存失败！"}';
      exit();
    }

  }

//模糊匹配会员
}elseif($dopost == "checkUser"){

  $key = $_POST['key'];
  if(!empty($key)){
      if($userType == 0)
            $where = "";
      if($userType == 3)
            $where = getCityFilter('`addr`');

    $where .= " AND (`mtype` = 1 || `mtype` = 2)";
    $userSql = $dsql->SetQuery("SELECT `id`, `username`, `company`, `nickname` FROM `#@__member` WHERE (`username` like '%$key%' OR `company` like '%$key%' OR `nickname` like '%$key%')".$where." LIMIT 0, 10");
    $userResult = $dsql->dsqlOper($userSql, "results");
    if($userResult){
      echo json_encode($userResult);
    }
  }
  die;
// 验证自媒体子管理员
}elseif($dopost == "checkUserById"){
  $userid = (int)$_GET['userid'];
  $aid = (int)$_GET['aid'];
  if($userid){
    $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `username` FROM `#@__member` WHERE `id` = $userid");
    $res = $dsql->dsqlOper($sql, "results");
    if($res && ($res[0]['mtype'] == 1 || $res[0]['mtype'] == 2)){
      if($aid){
        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__article_selfmedia` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          if($ret[0]['id'] == $aid){
            echo '{"state": 200, "info": "该用户已是此自媒体号管理员"}';
          }elseif($ret[0]['state'] == 0){
            echo '{"state": 200, "info": "该用户已有自媒体账号，当前待审核"}';
          }elseif($ret[0]['state'] == 2){
            echo '{"state": 200, "info": "该用户已有自媒体账号，当前审核拒绝"}';
          }else{
            echo '{"state": 200, "info": "该用户已有自媒体账号"}';
          }
          die;
        }

        $sql = $dsql->SetQuery("SELECT `id`, `aid` FROM `#@__article_selfmedia_manager` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          if($ret[0]['aid'] == $aid){
            echo '{"state": 200, "info": "管理员已存在"}';
          }else{
            echo '{"state": 200, "info": "该用户已是其他自媒体账号管理员"}';
          }
          die;
        }
      }
      echo '{"state": 100, "info": "用户名：'.$res[0]['username'].'"}';
    }else{
      echo '{"state": 200, "info": "用户不存在或类型不符"}';
    }
    die;
  }
  die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
  //css
  $cssFile = array(
      'ui/jquery.chosen.css',
      'admin/chosen.min.css'
  );
  $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
  //js
  $jsFile = array(
    'ui/bootstrap.min.js',
    'ui/chosen.jquery.min.js',
    'ui/jquery.dragsort-0.5.1.min.js',
    'ui/bootstrap-datetimepicker.min.js',
    'publicUpload.js',
    'publicAddr.js',
    'admin/article/selfmediaAdd.js'
  );
  $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

  require_once(HUONIAOINC."/config/".$action.".inc.php");

  global $customUpload;
  if($customUpload == 1){
    global $custom_thumbSize;
    global $custom_thumbType;
    global $custom_atlasSize;
    global $custom_atlasType;
    $huoniaoTag->assign('thumbSize', $custom_thumbSize);
    $huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
    $huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
  }

  include_once HUONIAOROOT."/api/handlers/article.class.php";
  $article = new article();
  $typeList = $article->selfmedia_type(); // 入驻类型

  $fieldList = $article->selfmedia_field(); // 领域
  $type2List = $article->selfmedia_type2(); // 新闻媒体类型
  $type4List = $article->selfmedia_type4(); // 政府机构类型
  $type42List = $article->selfmedia_type42(); // 政府机构类型
  $type22List = $article->selfmedia_type2_license();  // 新闻媒体专业资质类别

  $typename = $type ? $typeList[array_search($type, array_column($typeList, "id"))]['typename'] : "";
  $fieldname = $ac_field ? $fieldList[array_search($ac_field, array_column($fieldList, "id"))]['typename'] : "";
  $type2name = $mb_type ? $type2List[array_search($mb_type, array_column($type2List, "id"))]['typename'] : "";
  $type22name = $org_major_license_type ? $type22List[array_search($org_major_license_type, array_column($type22List, "id"))]['typename'] : "";
  $type4name = $mb_type ? $type4List[array_search($mb_type, array_column($type4List, "id"))]['typename'] : "";
  $type42name = $mb_type ? $type42List[array_search($mb_level, array_column($type42List, "id"))]['typename'] : "";

  $huoniaoTag->assign('action', $action);
  $huoniaoTag->assign('pagetitle', $pagetitle);
  $huoniaoTag->assign('dopost', $dopost);
  $huoniaoTag->assign('id', $id);
  $huoniaoTag->assign('cityid', (int)$cityid);
  $huoniaoTag->assign('type', empty($type) ? "1" : $type);
  $huoniaoTag->assign('typename', empty($typename) ? $typeList[0]['typename'] : $typename);
  $huoniaoTag->assign('fieldname', empty($fieldname) ? "请选择" : $fieldname);
  $huoniaoTag->assign('type2name', empty($type2name) ? $type2List[0]['typename'] : $type2name);
  $huoniaoTag->assign('type4name', empty($type4name) ? "请选择" : $type4name);
  $huoniaoTag->assign('type42name', empty($type42name) ? "请选择" : $type42name);
  $huoniaoTag->assign('type22name', empty($type22name) ? "请选择" : $type22name);
  $huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);
  $huoniaoTag->assign('imglist', json_encode(array()));
  $huoniaoTag->assign('typeListArr', json_encode($typeList));
  $huoniaoTag->assign('type2ListArr', json_encode($type2List));
  $huoniaoTag->assign('type4ListArr', json_encode($type4List));
  $huoniaoTag->assign('type42ListArr', json_encode($type42List));
  $huoniaoTag->assign('type22ListArr', json_encode($type22List));
  $huoniaoTag->assign('fieldListArr', json_encode($fieldList));

  $huoniaoTag->assign('cityList', json_encode($adminCityArr));

  $username = "";
  if($userid){
    $sql = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $userid");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $username = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
    }
  }
  $huoniaoTag->assign('username', $username);

  if(!empty($prove)){
    $imglist = array();
    $prove = explode(',', $prove);
    foreach($prove as $key => $value){
      $info = explode("|", $value);
      $imglist[$key]["path"] = $info[0];
      $imglist[$key]["info"] = $info[1];
    }
    $imglist = json_encode($imglist);
  }else{
    $imglist = "''";
  }
  $huoniaoTag->assign('proveList', $imglist);

  if(!empty($op_authorize)){
    $imglist = array();
    $op_authorize = explode(',', $op_authorize);
    foreach($op_authorize as $key => $value){
      $info = explode("|", $value);
      $imglist[$key]["path"] = $info[0];
      $imglist[$key]["info"] = $info[1];
    }
    $imglist = json_encode($imglist);
  }else{
    $imglist = "''";
  }
  $huoniaoTag->assign('op_authorizeList', $imglist);

  $huoniaoTag->assign('state', array('0', '1', '2'));
  $huoniaoTag->assign('stateNames',array('未审核','正常','审核拒绝'));
  $huoniaoTag->assign('stateChecked', (int)$state);

  $huoniaoTag->assign('editstate', array('1', '2'));
  $huoniaoTag->assign('editstateNames',array('通过','拒绝'));
  $huoniaoTag->assign('editstateChecked', $editstate);

  // 申请资料更新
  $dict = $article->selfmedia_dict();  // 可修改字段名
  if($editlog && $editlog['data']){
    $data = array();
    foreach ($editlog['data'] as $key => $value) {
      $data[] = isset($dict[$key]) ? $dict[$key] : $key;
    }
    $editlog['data'] = $data;
    $huoniaoTag->assign('editlog', $editlog);
  }

  $huoniaoTag->assign('showreal', $showreal);

  if(!empty($ac_banner) && $ac_banner != 'ac_banner'){
    $imglist = array();
    $ac_banner = explode(',', $ac_banner);
    foreach($ac_banner as $key => $value){
      $info = explode("|", $value);
      $imglist[$key]["path"] = $info[0];
      $imglist[$key]["info"] = $info[1];
    }
    $imglist = json_encode($imglist);
  }else{
    $imglist = "''";
  }
  $huoniaoTag->assign('ac_banner', empty($imglist) ? "''" : $imglist);
  $huoniaoTag->assign('managerList', empty($managerList) ? array() : $managerList);



  $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
  $huoniaoTag->display($templates);
}else{
  echo $templates."模板文件未找到！";
}

// 检查缓存
function checkArticleCache($id){
    checkCache("article_list", $id);
    clearCache("article_detail", $id);
}
function checkMediaCache($id, $type = "", $userid = 0, $state = 0){
    checkCache("media_list", $id);
    checkCache("media_detail", $id);
    // 删除或者取消审核时
    if($type == "del" || ($type == "join" && $state != 1) ){
        global $dsql;
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__articlelist_all` WHERE `admin` = $userid");
        $ids = $dsql->dsqlOper($sql, "results");
        if($ids){
            checkArticleCache(array_column($ids, "id"));
        }
    }
}
