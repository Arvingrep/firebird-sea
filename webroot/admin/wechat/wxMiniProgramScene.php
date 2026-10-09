<?php
/**
 * 微信小程序码
 *
 * @version        $Id: wxMiniProgramScene.php 2015-8-5 下午23:58:11 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wxMiniProgramScene");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "wxMiniProgramScene.html";

if($action != "" || $dopost != ""){

    //列表
    if($dopost == "getList") {

        $pagestep = $pagestep == "" ? 10 : $pagestep;
        $page     = $page == "" ? 1 : $page;

        $where = "";

        if($keyword != ""){
            $where .= " AND `url` like '%$keyword%'";
        }

        if($orderby){
            $where .= " ORDER BY `count` DESC, `id` DESC";
        }else{
            $where .= " ORDER BY `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__site_wxmini_scene` WHERE 1 = 1".$where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pagestep);

        $atpage = $pagestep*($page-1);
        $where .= " LIMIT $atpage, $pagestep";
        $archives = $dsql->SetQuery("SELECT `id`, `url`, `date`, `fid`, `count` FROM `#@__site_wxmini_scene` WHERE 1 = 1".$where);
        $results = $dsql->dsqlOper($archives, "results");

        if(count($results) > 0){
            $list = array();
            foreach ($results as $key=>$value) {
                $list[$key]["id"] = $value["id"];
                $list[$key]["url"] = $value["url"];
                $list[$key]["date"] = $value["date"];
                $list[$key]["fid"] = $value["fid"];
                $list[$key]["count"] = $value["count"];
            }

            if(count($list) > 0){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
            }else{
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
            }

        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
        }
        die;

    //创建小程序码
    }elseif($dopost == "add"){
        $ret = json_decode(createWxMiniProgramScene($url));

        if($ret['state'] == 100){
            adminLog("创建小程序码", $url);
        }
        die(json_encode($ret));

    //删除
    }elseif($dopost == "del"){
        if($id !== ""){

            $each = explode(",", $id);
            $error = array();
            $title = array();
            foreach($each as $val) {

                $archives = $dsql->SetQuery("SELECT * FROM `#@__site_wxmini_scene` WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "results");

                $url = $results[0]['url'];
                $fid = $results[0]['fid'];
                array_push($title, $url);

                //删除表
                $archives = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_scene` WHERE `id` = " . $val);
                $results = $dsql->dsqlOper($archives, "update");
                if ($results != "ok") {
                    $error[] = $val;
                }

                delPicFile($fid, "delWxminProgram", "siteConfig");

            }

            if(!empty($error)){
                echo '{"state": 200, "info": '.json_encode($error).'}';
            }else{
                adminLog("删除小程序码", $tab."=>".join(", ", $title));
                echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
            }
            die;

        }else{
            die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
        }
    }

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/wechat/wxMiniProgramScene.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/wechat";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
