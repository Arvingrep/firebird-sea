<?php
/**
 * 管理后台首页
 *
 * @version        $Id: index.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "" );
require_once(dirname(__FILE__)."/inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/templates";
$tpl = isMobile() ? $tpl."/touch" : $tpl;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "index.html";

//域名检测 s
$httpHost  = $_SERVER['HTTP_HOST'];    //当前访问域名
$reqUri    = $_SERVER['REQUEST_URI'];  //当前访问目录

//判断是否为主域名，如果不是则跳转到主域名的后台目录
if($cfg_basehost != $httpHost && $cfg_basehost != str_replace("www.", "", $httpHost)){
	header("location:".$cfg_secureAccess.$cfg_basehost.$reqUri);
	die;
}


//更新店铺状态
if($action == "updateStatus"){

    if(!empty($id)){
        $where = " AND `id` in ($managerIds)";

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET `status` = $val WHERE `id` = $id".$where);
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            echo '{"state": 100, "info": "更新成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

// 获取店铺列表
if($action == "shopList"){
    $where = " AND `id` in ($managerIds)";

    $pageSize = empty($pageSize) ? 10 : $pageSize;
    $page     = empty($page) ? 1 : $page;

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1 = 1".$where);
    $totalCount = $dsql->dsqlOper($sql, "totalCount");
    if($totalCount == 0){

        echo '{"state": 200, "info": "暂无数据"}';

    }else{
        $totalPage = ceil($totalCount/$pageSize);
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        $sql = $dsql->SetQuery("SELECT `id`, `shopname`, `phone`, `address`, `shop_banner`, `status` FROM `#@__waimai_shop` WHERE 1 = 1".$where);
        // echo $sql;die;
        $ret = $dsql->dsqlOper($sql, "results");
        $list = array();
        foreach ($ret as $key => $value) {
            $list[$key]['id']       = $value['id'];
            $list[$key]['shopname'] = $value['shopname'];
            $list[$key]['phone']    = $value['phone'];
            $list[$key]['address']  = $value['address'];
            $list[$key]['pic']      = $value['shop_banner'] ? getFilePath(explode(",", $value['shop_banner'])[0]) : "";  //图片
            $list[$key]['status']   = $value['status'];
        }

        $info = array("list" => $list, "pageInfo" => $pageinfo);

        echo '{"state": 100, "info": '.json_encode($info).'}';
    }
    exit();
}

// 检查最新未处理订单
if($action == "checkLastOrder"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order` WHERE `sid` in ($managerIds) AND `state` = 2");
    $count = $dsql->dsqlOper($sql, "totalCount");
    echo '{"state": 100, "count": '.$count.'}';
    exit();
}

// echo $tpl."/".$templates;
//验证模板文件
if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
