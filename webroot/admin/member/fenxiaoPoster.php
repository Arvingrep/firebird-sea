<?php
/**
 * 分销设置
 *
 * @version        $Id: fenxiaoConfig.php 2015-8-4 下午15:09:11 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("fenxiaoConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "fenxiaoPoster.html";
$dir       = "../../templates/member"; //当前目录
$tab = "fenxiao_posterpic";

if($dopost != ""){
    $templates = "fenxiaoPosterAdd.html";
    $jsFile = array(
        'ui/jquery.Jcrop.js',
        'admin/member/fenxiaoPosterAdd.js'
    );

    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}else{
    $templates = "fenxiaoPoster.html";
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui-selectable.js',
        'admin/member/fenxiaoPoster.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

}
if($submit == "提交"){
    if($token == "") die('token传递失败！');
    $litpic  = $litpic;
    $pubdate = GetMkTime(time()); //发布时间

    if(empty($litpic)){
        echo '{"state": 200, "info": "请上传海报"}';
        exit();
    }
}
if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    if($sKeyword != ""){
        $where .= " AND `title` like '%$sKeyword%'";
    }

    if($sType != ""){
        $where .= " AND `typeid` = '$sType'";
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);

    $where .= " order by `date` desc";

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `litpic` , `date`, `url` FROM `#@__".$tab."` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["litpic"] = $value["litpic"];
            $list[$key]["url"] = $value["url"];
            $list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);
        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "memberCoverBg": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
    }
    die;

//新增
}elseif($dopost == "Add"){
    checkPurview("fenxiaoPosterAdd");

    $pagetitle = "添加海报";

    //表单提交
    if($submit == "提交"){
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`litpic`, `xAxis`, `yAxis`, `codewidth`, `codeheight`, `imgwidth`, `imgheight`, `cropwidth`, `cropheight`, `date`, `url`) VALUES ('$litpic', '$xAxis', '$yAxis', '$codewidth', '$codeheight', '$imgwidth', '$imgheight', '$cropwidth', '$cropheight', '$pubdate', '$url')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if($aid){
            adminLog("添加分销海报", $title);
            echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';
        }else{
            echo $return;
        }
        die;
    }

//修改
}elseif($dopost == "edit"){
    checkPurview("fenxiaoPosterEdit");

    $pagetitle = "修改fenxiaoPoster";

    if($id == "") die('要修改的信息ID传递失败！');
    if($submit == "提交"){

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `litpic` = '$litpic', `xAxis` = '$xAxis', `yAxis` = '$yAxis', `codewidth` = '$codewidth', `codeheight` = '$codeheight', `imgwidth` = '$imgwidth', `imgheight` = '$imgheight', `cropwidth` = '$cropwidth', `cropheight` = '$cropheight', `url` = '$url' WHERE `id` = ".$id);
        $return = $dsql->dsqlOper($archives, "update");

        if($return == "ok"){
            adminLog("修改分销海报", $title);
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }else{
            echo $return;
        }
        die;

    }else{
        if(!empty($id)){

            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");

            if(!empty($results)){

                $id         = $results[0]['id'];
                $litpic     = $results[0]['litpic'];
                $xAxis      = $results[0]['xAxis'];
                $yAxis      = $results[0]['yAxis'];
                $codewidth  = $results[0]['codewidth'];
                $codeheight = $results[0]['codeheight'];
                $imgwidth   = $results[0]['imgwidth'];
                $imgheight  = $results[0]['imgheight'];
                $cropwidth  = $results[0]['cropwidth'];
                $cropheight = $results[0]['cropheight'];
                $url = $results[0]['url'];
            }else{
                ShowMsg('要修改的信息不存在或已删除！', "-1");
                die;
            }

        }else{
            ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
            die;
        }
    }

//删除
}elseif($dopost == "del"){
    if(!testPurview("fenxiaoPosterDel")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    if($id != ""){

        $each = explode(",", $id);
        $error = array();
        $title = array();
        foreach($each as $val){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "results");

            //删除缩略图
            array_push($title, $results[0]['title']);
            delPicFile($results[0]['litpic'], "delCard", "siteConfig");
            delPicFile($results[0]['big'], "delCard", "siteConfig");

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("删除分销海报", join(", ", $title));
            echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
        }
        die;

    }
    die;

//修改应用分类
}
//验证模板文件
if(file_exists($tpl."/".$templates)){

    if($dopost == "edit"){
        $huoniaoTag->assign('litpic', $litpic);
        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('litpic', $litpic);
        $huoniaoTag->assign('litpicpath', getFilePath($litpic));
        $huoniaoTag->assign('xAxis', $xAxis);
        $huoniaoTag->assign('yAxis', $yAxis);
        $huoniaoTag->assign('codewidth', $codewidth);
        $huoniaoTag->assign('codeheight', $codeheight);
        $huoniaoTag->assign('imgwidth', $imgwidth);
        $huoniaoTag->assign('imgheight', $imgheight);
        $huoniaoTag->assign('cropwidth', $cropwidth);
        $huoniaoTag->assign('cropheight', $cropheight);
        $huoniaoTag->assign('url', $url);

    }
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $tab."_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
