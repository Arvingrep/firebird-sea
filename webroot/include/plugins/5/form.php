<?php
require_once('../../common.inc.php');
require_once 'service/ImagesService.php';

if($userLogin->getUserID()==-1){
  die('<div class="notlogin" style="line-height: 35px;"><center><br /><br /><br /><br />管理员信息读取失败或登录超时<br />请重新登录网站后台，登录成功后，再使用此功能！</center></div>');
}

if(empty($url) && !$submit){
  die('<div class="notlogin" style="line-height: 35px;"><center><br /><br /><br /><br />要转载的网址读取失败，请刷新页面重试！</center></div>');
}

$tpl                      = dirname(__FILE__) . "/tpl";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "form.html";

$adminid = $userLogin->getUserID();

//管理员可操作的城市ID
$adminCityIds = $userLogin->getAdminCityIds();
$adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;


if($submit == '提交'){

  $pubdate = GetMkTime(time()); //发布时间

	//对字符进行处理
	$title       = cn_substrR(trim($title), 60);
	$source      = cn_substrR(trim($source), 30);
	$sourceurl   = cn_substrR(trim($sourceurl), 150);
	$keywords    = cn_substrR(trim($keywords), 50);
	$description = cn_substrR(trim($description), 150);

  //表单二次验证
  if(empty($typeid)){
    echo '{"state": 200, "info": "请选择分类"}';
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

  if(empty($title)){
    echo '{"state": 200, "info": "请填写标题"}';
    exit();
  }

  $cur = realpath('.');
  $par = realpath('..');

  //当前文件夹就是当前插件的ID
  $folder = str_replace($par, '', $cur);
  $folder = str_replace('/', '', $folder);
  $folder = str_replace('\\', '', $folder);

  $sub = new SubTable('articlelist', '#@__articlelist');
  $insert_table_name = $sub->getLastTable();

  //保存到主表
  // $archives = $dsql->SetQuery("INSERT INTO `".$insert_table_name."` (`cityid`, `title`, `weight`, `litpic`, `source`, `sourceurl`, `typeid`, `keywords`, `description`, `click`, `arcrank`, `pubdate`, `admin`, `reward_switch`) VALUES ('$cityid', '$title', '1', '$litpic', '$source', '$sourceurl', '$typeid', '$keywords', '$description', '1', '1', '$pubdate', '$adminid', '0')");

  $flag_sql_field = ', `flag_h`, `flag_r`, `flag_b`, `flag_t`, `flag_p`';
  $flag_sql_val = ", 0, 0, 0, 0, 0";
  $audit_fields = ", `audit_log`, `audit_edit`";
  $audit_values = ", '', ''";

  $archives = $dsql->SetQuery("INSERT INTO `".$insert_table_name."`
  (`cityid`, `title`, `subtitle`, `flag`, `redirecturl`, `weight`, `litpic`, `source`, `sourceurl`, `writer`, `typeid`,
   `keywords`, `description`, `mbody`, `notpost`, `click`, `color`, `arcrank`, `pubdate`, `admin`, `reward_switch`
   ". $flag_sql_field . $audit_fields."
    , `mold`, `videotype`, `videourl`, `media_state`, `media_arctype`, `typeset`, `zhuanti`, `media`
   )
   VALUES
   ('$cityid', '$title', '$subtitle', '$flags', '$redirecturl', '1', '$litpic', '$source', '$sourceurl', '$writer', '$typeid',
   '$keywords', '$description', '', '0', '1', '', '1', '$pubdate', '$adminid', '0'
   ". $flag_sql_val . $audit_values."
    , 0, 0, '', 1, 0, 0, 0, 0
   )");

  $aid = $dsql->dsqlOper($archives, "lastid");

  $imgService  = new ImagesService(stripslashes($body), $folder, $aid);
  $newsHtmlNew = $imgService->getNewsContent();

  $exp = explode("||||||||||", $newsHtmlNew);
  $newBody = $exp[0];
  $litpic = $exp[1];

  if(empty($newBody)){
    $newBody = $body;
  }

  //再次提取缩略图
  if(!$litpic){
	  $litpic = GetDDImgFromBody($newBody);
  }

  //保存内容表
  $art = $dsql->SetQuery("INSERT INTO `#@__article` (`aid`, `body`) VALUES ('$aid', '$newBody')");
  $dsql->dsqlOper($art, "update");

  if($litpic){
    $sql = $dsql->SetQuery("UPDATE `".$insert_table_name."` SET `litpic` = '$litpic', `flag` = 'p', `flag_p` = 1 WHERE `id` = $aid");
    $dsql->dsqlOper($sql, 'update');
  }

  adminLog("添加信息资讯信息", $title);

  $param = array(
    "service"     => "article",
    "template"    => "detail",
    "id"          => $aid
  );
  $url = getUrlPath($param);

  if(is_numeric($aid)){
    $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
    $res = $dsql->dsqlOper($sql, "results");
    $breakup_table_count = $res[0]['total'];
    if($breakup_table_count >= $sub->MAX_SUBTABLE_COUNT){
      $insert_table_name = $sub->createSubTable($aid); //创建分表并保存记录
    }
  }

  updateCache("article_list", 300);

  echo '{"state": 100, "url": "'.$url.'"}';die;
}


$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "articletype", true, 1, 100, " AND `mold`=0")));

$adminCityArr = $userLogin->getAdminCity();
$adminCityArr = empty($adminCityArr) ? array() : $adminCityArr;
$huoniaoTag->assign('cityList', json_encode($adminCityArr));

$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
$huoniaoTag->assign('remoteUrl', $url);
$huoniaoTag->display($templates);
