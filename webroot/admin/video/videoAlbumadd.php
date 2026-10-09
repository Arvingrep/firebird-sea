<?php
/**
 * 添加圈子话题
 *
 * @version        $Id: circleAdd.php 2019-03-15 下午16:34:13 $
 * @package        HuoNiao.circle
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/video";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "videoAlbumadd.html";
$tab = "video_album";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
    $pagetitle = "修改专辑";
    checkPurview("videoAlbum");
}else{
    $pagetitle = "添加专辑";
    checkPurview("videoAlbum");
}

if($_POST['submit'] == "提交"){

    if($token == "") die('token传递失败！');
    //二次验证
    if(empty($title)){
        echo '{"state": 200, "info": "请输入专辑名称！"}';
        exit();
    }
    if(empty($userid)){
        echo '{"state": 200, "info": "请输入专辑名称！"}';
        exit();
    }




    if($staging==0){
        $downpayment = '';
    }

    $pubdate = GetMkTime(time());
}

if($dopost == "save" && $submit == "提交"){
	$state = (int)$state;
    //保存到表
    if($uid==""||$browse==""){
        $uid = "0";
        $browse = '0';
    }
    $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`uid`,`title`, `litpic`, `state`, `browse`, `pubdate`,`note`)
		VALUES
		('$userid','$title', '$litpic', '$state', '$browse', '$pubdate','$note')");
    $aid = $dsql->dsqlOper($archives, "lastid");

    if(is_numeric($aid)){
        echo '{"state": 100, "url": "'.$url.'"}';
    }else{
        echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
    }
    die;
}elseif($dopost == "edit"){
	$state = (int)$state;
    if($submit == "提交"){
        //保存到表
        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `uid` = '$userid',`title` = '$title', `litpic` = '$litpic', `state` = '$state', `note` = '$note', `browse` = '$browse' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results == "ok"){
//            // 检查缓存
//            checkCache("circle_list", $id);
//            clearCache("circle_detail", $id);
//            clearCache("circle_list_total", 'key');
//
//            adminLog("修改话题", $title);
//            $param = array(
//                "service"  => "circle",
//                "template" => "detail",
//                "id"       => $id
//            );
//            $url = getUrlPath($param);

            echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
        }else{
            echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
        }
        die;
    }

    if(!empty($id)){

        //主表信息
        $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        if(!empty($results)){

            foreach ($results[0] as $key => $value) {
                ${$key} = $value;
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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
        'publicUpload.js',
        'publicAddr.js',
        'admin/video/videoAlbumadd.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('dopost', $dopost);
    require_once(HUONIAOINC."/config/video.inc.php");
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
    $caratlasMax = $custom_car_atlasMax ? $custom_car_atlasMax : 9;
    $huoniaoTag->assign('caratlasMax', $caratlasMax);

    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('uid', $uid);
    $usersql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = '".$uid."'");
    $userres = $dsql->dsqlOper($usersql,'results');
    $huoniaoTag->assign('nickname', $userres[0]['nickname']);
    $huoniaoTag->assign('title', $title);
    $huoniaoTag->assign('browse', $browse);
    $huoniaoTag->assign('litpic', $litpic);
    $huoniaoTag->assign('note', $note);



    /* $typeArrCar = array();
    if(!empty($brand)){
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__car_brandtype` WHERE `parentid` = ". $brand);
        $rets = $dsql->dsqlOper($sql, "results");
        if($rets){
            foreach ($rets as $k => $v) {
                $typeArrCar[$k]['id'] = $v['id'];
                $typeArrCar[$k]['title'] = $v['typename'];
            }
        }
    }
    $huoniaoTag->assign('typeArrCar', $typeArrCar); */

    $modelArrCar = array();
    /* if(!empty($model)){
        $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__car_brand` WHERE `id` = ". $model);
        $rets = $dsql->dsqlOper($sql, "results");
        if($rets){
            foreach ($rets as $k => $v) {
                $modelArrCar[$k]['id'] = $v['id'];
                $modelArrCar[$k]['title'] = $v['title'];
            }
        }
*/


    //显示状态
    $huoniaoTag->assign('stateopt', array('0', '1'));
    $huoniaoTag->assign('statenames',array('否','是'));
    $huoniaoTag->assign('state', $state == "" ? 0 : $state);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/video";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
