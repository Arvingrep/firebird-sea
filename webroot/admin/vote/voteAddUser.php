<?php
/**
 * 添加投票选手
 *
 * @version        $Id: voteAddUser.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$action = "vote";
$actioncap = "Vote";

$actiontxt = "投票活动选手";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action."AddUser.html";


$pagetitle  = "发布".$actiontxt;
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
    checkPurview("editUser");
}else{
    checkPurview("addUser");
}

if($submit == "提交"){
    $pubdate = GetMkTime(time());   //发布时间

    //对字符进行处理
    $title       = cn_substrR($title,60);
    $color       = cn_substrR($color,6);
    $keywords    = cn_substrR($keywords,50);
    $description = cn_substrR($description,150);
    $color       = cn_substrR($color,6);

    //获取当前管理员
    $adminid = $userLogin->getUserID();
		$name = $_POST['name'];
}

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝', 3 => '取消显示'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

//查询所有活动
$now = GetMkTime(time());

$where = "";

if($dopost == "edit"){

    $pagetitle = "修改信息";

    if($submit == "提交"){

        if($token == "") die('token传递失败！');
        //表单二次验证
        if(empty($tid)){
            echo '{"state": 200, "info": "请选择要参加的活动！"}';
            exit();
        }
        if(trim($name) == ''){
            echo '{"state": 200, "info": "请填写选手姓名"}';
            exit();
        }
        if(trim($litpic) == ''){
            echo '{"state": 200, "info": "请上传代表图片"}';
            exit();
        }

        // 查询活动情况
        $arc = $dsql->SetQuery("SELECT `began`,`end`,`baomingend`,`arcrank` FROM `#@__".$action."_list` WHERE `id` = $tid");
        $ret = $dsql->dsqlOper($arc, "results");
        if(empty($ret)){
            echo '{"state": 200, "info": "活动不存在"}';
            exit();
        }else{
            $now        = GetMkTime(time());
            $began      = $ret[0]['began'];
            $end        = $ret[0]['end'];
            $baomingend = $ret[0]['baomingend'];

            if($now < $began){
                echo '{"state": 200, "info": "抱歉，该活动尚未开始"}';
                exit();
            }elseif($now > $end){
                echo '{"state": 200, "info": "抱歉，该活动已结束"}';
                exit();
            }elseif($baomingend != 0 && $now > $baomingend){
                echo '{"state": 200, "info": "抱歉，该活动报名已截止"}';
                exit();
            }
        }


        // 查询该选手当前参选活动
        $sql = $dsql->SetQuery("SELECT `tid`, `number` FROM `#@__".$action."_user` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            // 如果修改了参选活动，重新生成编号，并且更新评论表、投票表
            if($ret[0]['tid'] != $tid){
                $number = getUserNumber($tid);

                $updatasql = $dsql->SetQuery("UPDATE `#@__".$action."_record` SET `tid` = $tid WHERE `uid` = $id");
                $updataarc = $dsql->dsqlOper($updatasql, "results");

                $updatasql = $dsql->SetQuery("UPDATE `#@__".$action."_common` SET `tid` = $tid WHERE `uid` = $id");
                $dsql->dsqlOper($updatasql, "results");

            }else{
                $number = $ret[0]['number'];
            }
        }else{
            echo '{"state": 200, "info": "抱歉，该选手不存在或已删除"}';
            exit();
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."_user` SET `tid` = '".$tid."', `name` = '".$name."', `number` = '".$number."', `litpic` = '".$litpic."', `age` = '".$age."', `litpic` = '".$litpic."', `uheight` = '".$uheight."', `uweight` = '".$uweight."', `from` = '".$from."', `hobby` = '".$hobby."', `tel` = '".$tel."', `intnum` = '".$intnum."', `pics` = '".$imglist."', `body` = '".$body."', `mbody` = '".$mbody."', `click` = '".$click."', `arcrank` = '$arcrank', `weight` = '".$weight."' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 200, "info": "保存失败！"}';
            exit();
        }


        adminLog("修改".$actiontxt."信息", $title);

        $param = array(
            "service"     => $action,
            "template"    => "user",
            "id"          => $id
        );
        $url = getUrlPath($param);

        echo '{"state": 100, "url": "'.$url.'"}';die;


    }else{
        if(!empty($id)){

            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_user` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");

            if(!empty($results)){

                $tid     = $results[0]['tid'];
                $name    = $results[0]['name'];
                $litpic  = $results[0]['litpic'];
                $age     = $results[0]['age'];
                $uheight = $results[0]['uheight'];
                $uweight = $results[0]['uweight'];
                $from    = $results[0]['from'];
                $hobby   = $results[0]['hobby'];
                $tel     = $results[0]['tel'];
                $intnum  = $results[0]['intnum'];
                $pics    = $results[0]['pics'];
                $body    = $results[0]['body'];
                $mbody   = $results[0]['mbody'];
                $click   = $results[0]['click'];
                $arcrank = $results[0]['arcrank'];
                $weight  = $results[0]['weight'];

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
    $where = " AND `began` < $now AND `end` > $now AND (`baomingend` = 0 || (`baomingend` <> 0 AND `baomingend` > $now))" . getCityFilter('`cityid`');

    //表单提交
    if($submit == "提交"){
        if($token == "") die('token传递失败！');
        //表单二次验证
        if(empty($tid)){
            echo '{"state": 200, "info": "请选择要参加的活动！"}';
            exit();
        }
        if(trim($name) == ''){
            echo '{"state": 200, "info": "请填写选手姓名"}';
            exit();
        }
        if(trim($litpic) == ''){
            echo '{"state": 200, "info": "请上传代表图片"}';
            exit();
        }

        // 查询活动情况
        $arc = $dsql->SetQuery("SELECT `began`,`end`,`baomingend`,`arcrank` FROM `#@__".$action."_list` WHERE `id` = $tid");
        $ret = $dsql->dsqlOper($arc, "results");
        if(empty($ret)){
            echo '{"state": 200, "info": "活动不存在"}';
            exit();
        }else{
            $now        = GetMkTime(time());
            $began      = $ret[0]['began'];
            $end        = $ret[0]['end'];
            $baomingend = $ret[0]['baomingend'];

            if($now < $began){
                echo '{"state": 200, "info": "抱歉，该活动尚未开始"}';
                exit();
            }elseif($now > $end){
                echo '{"state": 200, "info": "抱歉，该活动已结束"}';
                exit();
            }elseif($baomingend != 0 && $now > $baomingend){
                echo '{"state": 200, "info": "抱歉，该活动报名已截止"}';
                exit();
            }
        }

        $ip = GetIP();
        $ipaddr = getIpAddr($ip);

        $number = getUserNumber($tid);

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_user` (`tid`, `name`, `number`, `litpic`, `age`, `uheight`, `uweight`, `from`, `hobby`, `tel`, `intnum`, `pics`, `body`, `mbody`, `click`, `arcrank`, `pubdate`, `admin`, `weight`, `ip`, `ipaddr`) VALUES ('".$tid."', '".$name."', '".$number."', '".$litpic."', '".$age."', '".$uheight."', '".$uweight."', '".$from."', '".$hobby."', '".$tel."', '".$intnum."', '".$imglist."', '".$body."', '".$mbody."', ".$click.", ".$arcrank.", ".GetMkTime(time()).", ".$adminid.", ".$weight.", '".$ip."', '".$ipaddr."')");
        // echo $archives;die;
        $aid = $dsql->dsqlOper($archives, "lastid");


        if(is_numeric($aid)){

        }

        adminLog("增加".$actiontxt, $name);

        $param = array(
            "service"     => $action,
            "template"    => "user",
            "id"          => $aid
        );
        $url = getUrlPath($param);

        echo '{"state": 100, "url": "'.$url.'"}';die;

    }
}

$archives = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__".$action."_list` WHERE `arcrank` = 1".$where);
$results = $dsql->dsqlOper($archives, "results");
$select = array(0 => '请选择');
if($results){
    foreach ($results as $key => $value) {
        $select[$value['id']] = $value['title'];
    }
}
$huoniaoTag->assign($action.'List', $select);

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery.colorPicker.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'publicUpload.js',
        'admin/'.$action.'/'.$action.'AddUser.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    require_once(HUONIAOINC."/config/".$action.".inc.php");
    global $customUpload;
    if($customUpload == 1){
        global $custom_atlasSize;
        global $custom_atlasType;
        $huoniaoTag->assign('atlasSize', $custom_atlasSize);
        $huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
    }

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('tid', $tid);
    $huoniaoTag->assign('name', $name);
    $huoniaoTag->assign('litpic', $litpic);
    $huoniaoTag->assign('age', $age);
    $huoniaoTag->assign('uheight', $uheight);
    $huoniaoTag->assign('uweight', $uweight);
    $huoniaoTag->assign('from', $from);
    $huoniaoTag->assign('hobby', $hobby);
    $huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('pics', $pics);
    $huoniaoTag->assign('body', $body);
    $huoniaoTag->assign('mbody', $mbody);
    $huoniaoTag->assign('click', empty($click) ? 0 : $click);
    $huoniaoTag->assign('intnum', empty($intnum) ? 0 : $intnum);
    $huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
    $huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
    $huoniaoTag->assign('imglist', json_encode(!empty($pics) ? explode(",", $pics) : array()));

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}


function getUserNumber($tid){
    global $dsql, $action;
    $sql = $dsql->SetQuery("SELECT MAX(`number`) maxnum FROM `#@__".$action."_user` WHERE `tid` = $tid");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $number = intval($ret[0]['maxnum'])+1;
    }else{
        $number = 1;
    }
    return $number;
}
