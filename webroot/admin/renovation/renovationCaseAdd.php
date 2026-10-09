<?php
/**
 * 添加装修效果图
 *
 * @version        $Id: renovationCaseAdd.php 2014-3-5 下午14:29:12 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationCaseAdd.html";

$tab = "renovation_case";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
    $pagetitle = "修改装修效果图";
    checkPurview("renovationCaseEdit");
}else{
    $pagetitle = "添加装修效果图";
    checkPurview("renovationCaseAdd");
}

if(empty($designer)) $designer = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = 0;
if(!empty($kongjian)) $kongjian = join(",", $kongjian);
if(!empty($jubu)) $jubu = join(",", $jubu);
if(empty($comstyle)) $comstyle = 0;
if(empty($style)) $style = 0;
if(empty($units)) $units = 0;

if($_POST['submit'] == "提交"){

    if($token == "") die('token传递失败！');
    //二次验证
    if(empty($title)){
        echo '{"state": 200, "info": "请输入效果图名！"}';
        exit();
    }

    if(empty($imglist)){
        echo '{"state": 200, "info": "请上传效果图图片！"}';
        exit();
    }
    // if (empty($companyid)) {
    //     echo '{"state": 200, "info": "请输入公司！"}';
    //     exit();
    // }

    // if($designer == 0 && trim($designername) == ''){
    // 	echo '{"state": 200, "info": "请选择设计师"}';
    // 	exit();
    // }
    // if($designer == 0){
    // 	$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `name` = '".$designername."'");
    // 	$userResult = $dsql->dsqlOper($userSql, "results");
    // 	if(!$userResult){
    // 		echo '{"state": 200, "info": "设计师不存在，请在联想列表中选择"}';
    // 		exit();
    // 	}
    // 	$designer = $userResult[0]['id'];
    // }else{
    // 	$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `id` = ".$designer);
    // 	$userResult = $dsql->dsqlOper($userSql, "results");
    // 	if(!$userResult){
    // 		echo '{"state": 200, "info": "设计师不存在，请在联想列表中选择"}';
    // 		exit();
    // 	}
    // }

    if(empty($apartment)){
        echo '{"state": 200, "info": "请选择装修预算！"}';
        exit();
    }

    if(empty($units) && $type == 0){
        echo '{"state": 200, "info": "请选择户型！"}';
        exit();
    }

}

if($dopost == "save" && $submit == "提交"){
    //保存到表
    $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `type`, `kongjian`, `jubu`, `comstyle`, `style`, `litpic`,`company`,`apartment`, `units`, `area`, `weight`, `click`, `state`, `note`, `pics`, `pubdate`) VALUES ('$title', '$type', '$kongjian', '$jubu', '$comstyle', '$style', '$litpic','$companyid', '$apartment', '$units', '$area', '$weight', '$click', '$state', '$note', '$imglist', '".GetMkTime(time())."')");
    $aid = $dsql->dsqlOper($archives, "lastid");

    if($aid){
        adminLog("添加装修效果图", $title);

        $param = array(
            "service"     => "renovation",
            "template"    => "albums-detail",
            "id"          => $aid
        );
        $url = getUrlPath($param);
        dataAsync("renovation",$aid,"albums");  // 装修门户、效果图、新增
        echo '{"state": 100, "url": "'.$url.'"}';
    }else{
        echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
    }
    die;
}elseif($dopost == "edit"){

    if($submit == "提交"){
        //保存到表
        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `type` = '$type', `kongjian` = '$kongjian', `jubu` = '$jubu', `comstyle` = '$comstyle', `style` = '$style', `litpic` = '$litpic',`company` = '$companyid', `apartment` = '$apartment', `units` = '$units', `area` = '$area', `weight` = '$weight', `click` = '$click', `state` = '$state', `note` = '$note', `pics` = '$imglist' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results == "ok"){
            adminLog("修改装修效果图", $title);

            $param = array(
                "service"     => "renovation",
                "template"    => "albums-detail",
                "id"          => $id
            );
            $url = getUrlPath($param);
            dataAsync("renovation",$id,"albums");  // 装修门户、效果图、修改
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

            $company   = $results[0]['company'];
            $title     = $results[0]['title'];
            $type      = $results[0]['type'];
            $kongjian  = $results[0]['kongjian'];
            $jubu      = $results[0]['jubu'];
            $comstyle  = $results[0]['comstyle'];
            $style     = $results[0]['style'];
            $litpic    = $results[0]['litpic'];
            $designer  = $results[0]['designer'];
            $apartment = $results[0]['apartment'];
            $units     = $results[0]['units'];
            $area      = $results[0]['area'];
            $weight    = $results[0]['weight'];
            $click     = $results[0]['click'];
            $state     = $results[0]['state'];
            $note      = $results[0]['note'];
            $pics      = $results[0]['pics'];

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

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
        'admin/renovation/renovationCaseAdd.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    require_once(HUONIAOINC."/config/renovation.inc.php");
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
    $huoniaoTag->assign('id', $id);

    $huoniaoTag->assign('title', $title);

    if($company){
        $huoniaoTag->assign('companyid', $company);
        $userSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $company);
        $username = $dsql->getTypeName($userSql);
        $huoniaoTag->assign('company', $username[0]['company']);
    }

    //显示状态
    $huoniaoTag->assign('typeopt', array('0', '1'));
    $huoniaoTag->assign('typenames',array('家装','公装'));
    $huoniaoTag->assign('type', $type == "" ? 0 : $type);

    //装修空间
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 533 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $kongjianlist = array();
    $kongjianval  = array();
    foreach($results as $value){
        array_push($kongjianlist, $value['typename']);
        array_push($kongjianval, $value['id']);
    }
    $huoniaoTag->assign('kongjianlist', $kongjianlist);
    $huoniaoTag->assign('kongjianval', $kongjianval);
    $huoniaoTag->assign('kongjian', explode(",", $kongjian));

    //局部位置
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 545 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $jubulist = array();
    $jubuval  = array();
    foreach($results as $value){
        array_push($jubulist, $value['typename']);
        array_push($jubuval, $value['id']);
    }
    $huoniaoTag->assign('jubulist', $jubulist);
    $huoniaoTag->assign('jubuval', $jubuval);
    $huoniaoTag->assign('jubu', explode(",", $jubu));

    //商业装修
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 3 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $comstylelist = array();
    $comstyleval  = array();
    foreach($results as $value){
        array_push($comstylelist, $value['typename']);
        array_push($comstyleval, $value['id']);
    }
    $huoniaoTag->assign('comstylelist', $comstylelist);
    $huoniaoTag->assign('comstyleval', $comstyleval);
    $huoniaoTag->assign('comstyle', $comstyle);

    //装修风格
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 4 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $stylelist = array();
    $styleval  = array();
    foreach($results as $value){
        array_push($stylelist, $value['typename']);
        array_push($styleval, $value['id']);
    }
    $huoniaoTag->assign('stylelist', $stylelist);
    $huoniaoTag->assign('styleval', $styleval);
    $huoniaoTag->assign('style', $style);

    //户型
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $unitslist = array();
    $unitsval  = array();
    foreach($results as $value){
        array_push($unitslist, $value['typename']);
        array_push($unitsval, $value['id']);
    }
    $huoniaoTag->assign('unitslist', $unitslist);
    $huoniaoTag->assign('unitsval', $unitsval);
    $huoniaoTag->assign('units', $units);

    $huoniaoTag->assign('litpic', $litpic);

//	$huoniaoTag->assign('designer', $designer);
//	$userSql = $dsql->SetQuery("SELECT `name` FROM `#@__renovation_team` WHERE `id` = ". $designer);
//	$username = $dsql->getTypeName($userSql);
//	$huoniaoTag->assign('designername', $username[0]['name']);

    //预算
    $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 6 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array(0 => '请选择');
    foreach($results as $value){
        $list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('apartmentList', $list);
    $huoniaoTag->assign('apartment', $apartment == "" ? 0 : $apartment);

    $huoniaoTag->assign('area', $area);

    $huoniaoTag->assign('click', $click == "" ? "1" : $click);
    $huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

    //显示状态
    $huoniaoTag->assign('stateopt', array('0', '1', '2'));
    $huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
    $huoniaoTag->assign('state', $state == "" ? 1 : $state);

    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('imglist', json_encode(!empty($pics) ? explode(",", $pics) : array()));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
