<?php
/**
 * 添加打印机
 *
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessPrinterAdd.html";


checkPurview("businessPrinterList");

$action = 'business';
$dir = HUONIAOROOT."/templates/".$action;

$pagetitle  = "新增打印机";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost != ""){
    $pubdate   = GetMkTime(time());				//添加时间

    //对字符进行处理
    $title     = cn_substrR($title,60);
}

if($dopost == "edit"){
    if($id == "") die("要修改的信息ID传递失败！");
    $pagetitle = "修改店铺打印机";
    if($submit == "提交"){
        if($token == "") die('token传递失败！');

        if(trim($print) == ''){
            echo '{"state": 200, "info": "请选择打印机平台"}';
            exit();
        }

        if(trim($shopid) == ''){
            echo '{"state": 200, "info": "请选择所属店铺"}';
            exit();
        }

        if(trim($title) == ''){
            echo '{"state": 200, "info": "标题不能为空"}';
            exit();
        }

        if(trim($mcode) == ''){
            echo '{"state": 200, "info": "请输入终端号"}';
            exit();
        }

        if(trim($msign) == ''){
            echo '{"state": 200, "info": "请输入打印机密钥"}';
            exit();
        }

        $printmodule = (int)$printmodule;

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__business_print` SET `title` = '".$title."', `sid` = '".$shopid."', `mcode` = '".$mcode."', `msign` = '".$msign."',`pubdate` = '".$pubdate."',`clientId` = '".$clientId."',`client_secret` = '".$client_secret."',`printmodule` = '".$printmodule."', `type` = '$print'  WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 200, "info": "修改失败！"}';
            exit();
        }else{
            adminLog("修改广告", $action."=>".$title);
            echo '{"state": 100, "info": "修改成功！"}';
            exit();
        }
    }else{
        if(!empty($id)){

            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__business_print` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");

            if(!empty($results)){
                $title     = $results[0]['title'];
                $sid       = $results[0]['sid'];
                $pubdate   = date("Y-m-d H:i:s", $results[0]['pubdate']);
                $type      = $results[0]['type'];
                $mcode     = $results[0]['mcode'];
                $msign     = $results[0]['msign'];
                $waimaiprintTemplate    = $results[0]['waimaitemplate'];
                $printmodule     = $results[0]['printmodule'];

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

    //表单提交
    if($submit == "提交"){
        if($token == "") die('token传递失败！');

        if(trim($print) == ''){
            echo '{"state": 200, "info": "请选择打印机平台"}';
            exit();
        }

        if(trim($shopid) == ''){
            echo '{"state": 200, "info": "请选择所属店铺"}';
            exit();
        }

        if(trim($title) == ''){
            echo '{"state": 200, "info": "标题不能为空"}';
            exit();
        }

        if(trim($mcode) == ''){
            echo '{"state": 200, "info": "请输入终端号"}';
            exit();
        }

        if(trim($msign) == ''){
            echo '{"state": 200, "info": "请输入打印机密钥"}';
            exit();
        }

        $printmodule = (int)$printmodule;

        $starttime = $starttime == "" ? 0 : $starttime;
        $endtime = $endtime == "" ? 0 : $endtime;

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__business_print` (`title`, `sid`, `mcode`, `msign`, `type`, `pubdate`,`clientId`,`client_secret`) VALUES ('".$title."', '".$shopid."', '".$mcode."', '".$msign."', '".$print."', '".$pubdate."','".$clientId."', '".$client_secret."')");
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 200, "info": "添加失败！"}';
            exit();
        }else{
            adminLog("添加打印机", $action."=>".$title);
            echo '{"state": 100, "info": "添加成功！"}';
            exit();
        }

    }
}
//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/chosen.min.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/chosen.jquery.min.js',
        'admin/business/businessPrinterAdd.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('type', (int)$type);
    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('title', $title);
    $huoniaoTag->assign('sid', $sid);
    $huoniaoTag->assign('type', $type);
    $huoniaoTag->assign('mcode', $mcode);
    $huoniaoTag->assign('msign', $msign);
    $huoniaoTag->assign('waimaiprintTemplate', json_encode(unserialize($waimaiprintTemplate)));
    // 店铺列表
    $shop = $print = array();
    $where = " AND l.`state` != 3 AND l.`state` != 4";
    //城市管理员
    $where .= getCityFilter('l.`cityid`');

    $sql = $dsql->SetQuery("SELECT l.`id`, l.`title` shopname  FROM `#@__business_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE l.`state` = 1".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shop = $ret;
    }

    $archives = $dsql->SetQuery("SELECT `print_name`,`id`,`print_code` FROM `#@__business_print_config` ");
    $results  = $dsql->dsqlOper($archives, "results");
    if($ret){
        $print = $results;
    }
    $huoniaoTag->assign('print', $print);
    $huoniaoTag->assign('shop', $shop);

    //显示状态
    $huoniaoTag->assign('stateopt', array('0', '1'));
    $huoniaoTag->assign('statenames',array('隐藏','显示'));
    $huoniaoTag->assign('state', $state == "" ? 1 : $state);

    $huoniaoTag->assign('printModuleList', array(0 => '普通打印', 1 => '图片打印'));
    $huoniaoTag->assign('printModule', $printmodule);  //默认普通打印


    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
