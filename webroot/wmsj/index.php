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

if($_GET['to'] != 'shop' && empty($action)){
    header("location:order/waimaiOrder.php");exit;
}

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

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1 = 1 AND `del` = 0".$where);
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
        $sql = $dsql->SetQuery("SELECT `id`, `shopname`, `phone`, `address`, `shop_banner`, `status` FROM `#@__waimai_shop` WHERE 1 = 1 AND `del` = 0".$where);
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

      $sql            = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__waimai_common` WHERE `sid` = " . $value['id']);
      $res            = $dsql->dsqlOper($sql, "results");
      $rating         = $res[0]['r'];        //总评分
      $list[$key]['rating']   = $rating;
        }
        $info = array("list" => $list, "pageInfo" => $pageinfo);

        echo '{"state": 100, "info": '.json_encode($info).'}';
    }
    exit();
}

// 检查最新未处理订单
if($action == "checkLastOrder"){

    if(!$managerIds){
        echo '{"state": 200, "count": 0}';
        die;
    }

    //出餐即将超时的订单
    

    //新订单
    //$sql = $dsql->SetQuery("SELECT `id`,`amount` FROM `#@__waimai_order_all` WHERE `sid` in ($managerIds) AND `state` = 2 AND `pushed` = 0 ORDER BY `id` ASC");
    //$sql = $dsql->SetQuery("SELECT `id`,`amount` FROM `#@__waimai_order_all` WHERE `sid` in ($managerIds) AND `state` = 2 ORDER BY `id` ASC");

    //统计新的外卖订单时，区分普通订单和预定订单，预定订单未到接单时间，即（预定时间-配送时间）时，不参与统计
    $date = GetMkTime(time());
    $sql = $dsql->SetQuery("SELECT o.`id`,o.`amount` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`sid` in ($managerIds) AND o.`state` = 2 AND o.`pushed` = 0 AND (o.`reservesongdate` = 0 OR (o.`reservesongdate` > 0 AND ('$date' > (o.`reservesongdate` - s.`delivery_time`*60)))) ORDER BY o.`id` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
      $aid    = $ret[0]['id'];
      $amount = $ret[0]['amount']."单";
      $title  = '您有一笔新的外卖订单';
      $count_ = count($ret);
      $url = $cfg_secureAccess.$cfg_basehost.'/wmsj/order/waimaiOrderDetail.php?id='.$aid;

      $music = $cfg_basedomain . '/static/audio/app/newwaimaiorder.mp3';

      $printData = array();

      echo '{"state": 100, "count": '.$count_.', "aid": '.$aid.', "url": "'.$url.'","amount":"'.$amount.'","title":"'.$title.'","music":"'.$music.'"}';
    }else{
      echo '{"state": 200, "count": 0}';
    }
    // $count = $dsql->dsqlOper($sql, "totalCount");
    exit();
}


// 更新已查看订单状态
// if($action == "updateLastOrder"){
//     $sql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `pushed` = 1 WHERE `sid` in ($managerIds) AND `state` = 2 AND `id` = $id");
//     $ret = $dsql->dsqlOper($sql, "update");
//     if($ret == "ok"){
//       echo '{"state": 100}';
//     }else{
//       echo '{"state": 200}';
//     }
//     exit();
// }

if($action == "setting"){
    $userinfo = $userLogin ->getMemberInfo();
    $huoniaoTag->assign("username",$userinfo['username']);
    $huoniaoTag->assign("phone",$userinfo['phone']);
    $huoniaoTag->assign("cfg_cookiePre",$cfg_cookiePre);
    $huoniaoTag->assign("HTTP_REFERER",   $_SERVER['HTTP_REFERER']);   //上一页的地址
    $huoniaoTag->assign('cfg_cancellation_state', $cfg_cancellation_state);
    $templates = "setting.html";
}

// echo $tpl."/".$templates;
//验证模板文件
if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
