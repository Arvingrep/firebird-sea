<?php


/**
 * 管理文章
 *
 * @version        $Id: articleList.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");


require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tieba";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "recoveryList.html";

if($action == ""){
    $action = "tieba";
}

checkPurview("recoveryList");

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/bootstrap-datetimepicker.min.js',
        'ui/bootstrap.min.js',
        'ui/jquery.colorPicker.js',
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/tieba/tiebaList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('recycle', $recycle);
    $huoniaoTag->assign('notice', $notice);

    // 是否需要审核
    $need_audit = checkAdminArcrank("tieba", true) ? 1 : 0;
    $huoniaoTag->assign('need_audit', $need_audit);

    $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type", true, 1, 100, " AND `mold`=0")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

//    include_once HUONIAOROOT."/api/handlers/article.class.php";
//    $article = new article();
//    $typeList = $article->get_article_mold(); // 新闻类型
//    $huoniaoTag->assign('moldListArr', json_encode($typeList));

//    if($zhuanti){
//        $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__article_zhuanti` WHERE `id` = $zhuanti");
//        $res = $dsql->dsqlOper($sql, "results");
//        if($res){
//            $zhuantiName = $res[0]['typename'];
//        }else{
//            $zhuanti = 0;
//        }
//    }
//    $huoniaoTag->assign('zhuanti', $zhuanti);
//    $huoniaoTag->assign('zhuantiName', $zhuantiName);
//    $huoniaoTag->assign('ztTypeListArr', json_encode($dsql->getTypeList(0, $action."_zhuanti", true, 1, 100)));


    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tieba";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
